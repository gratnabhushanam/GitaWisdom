const QuizSetMongo = require('../models/mongo/QuizSetMongo');
const QuizMongo = require('../models/mongo/QuizMongo');
const QuizAttemptMongo = require('../models/mongo/QuizAttemptMongo');
const UserMongo = require('../models/mongo/UserMongo');
const { isMockMode } = require('./authController');
const mockContentStore = require('../utils/mockContentStore');

// Admin Endpoints
exports.createQuizSet = async (req, res) => {
  try {
    const { title, description, category, difficulty, timeLimit, thumbnail, tags, isPublished, questions } = req.body;
    
    if (!title) return res.status(400).json({ message: 'Title is required' });

    if (isMockMode()) {
      const quizSet = mockContentStore.addQuizSet({
        title, description, category, difficulty, timeLimit, thumbnail, tags, isPublished, creatorId: req.user.id
      });
      
      if (questions && questions.length > 0) {
        questions.forEach((q, idx) => {
          mockContentStore.addQuizQuestion({
            ...q,
            quizSetId: quizSet.id,
            order: idx
          });
        });
      }
      return res.status(201).json({ message: 'Quiz created successfully (Mock)', quizSet });
    }

    const quizSet = await QuizSetMongo.create({
      title,
      description,
      category,
      difficulty,
      timeLimit,
      thumbnail,
      tags,
      isPublished,
      creatorId: req.user.id
    });

    if (questions && questions.length > 0) {
      const formattedQuestions = questions.map((q, idx) => ({
        quizSetId: quizSet._id,
        questionType: q.questionType || 'mcq',
        order: idx,
        image: q.image,
        question: q.question || q.questionText,
        options: q.options.map(o => typeof o === 'string' ? o : o.answerText),
        correct_answer: q.correct_answer,
        difficulty: q.difficulty || difficulty,
        explanation: q.explanation
      }));
      await QuizMongo.insertMany(formattedQuestions);
    }

    return res.status(201).json({ message: 'Quiz created successfully', quizSet });
  } catch (error) {
    console.error('Error creating quiz set:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateQuizSet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, difficulty, timeLimit, thumbnail, tags, isPublished, questions } = req.body;
    
    if (isMockMode()) {
       // Mock update: for simplicity, delete and re-add or just return success
       mockContentStore.deleteQuizSet(id);
       const quizSet = mockContentStore.addQuizSet({
         id: Number(id),
         title, description, category, difficulty, timeLimit, thumbnail, tags, isPublished, creatorId: req.user.id
       });
       if (questions) {
         mockContentStore.clearQuizzesBySet(id);
         questions.forEach((q, idx) => {
           mockContentStore.addQuizQuestion({ ...q, quizSetId: id, order: idx });
         });
       }
       return res.status(200).json({ message: 'Quiz updated successfully (Mock)', quizSet });
    }

    const quizSet = await QuizSetMongo.findByIdAndUpdate(id, {
      title, description, category, difficulty, timeLimit, thumbnail, tags, isPublished
    }, { new: true });

    if (!quizSet) return res.status(404).json({ message: 'Quiz not found' });

    // Handle questions (delete old, insert new for simplicity, or implement smart diff)
    if (questions) {
      await QuizMongo.deleteMany({ quizSetId: id });
      const formattedQuestions = questions.map((q, idx) => ({
        quizSetId: quizSet._id,
        questionType: q.questionType || 'mcq',
        order: idx,
        image: q.image,
        question: q.question || q.questionText,
        options: q.options.map(o => typeof o === 'string' ? o : o.answerText),
        correct_answer: q.correct_answer,
        difficulty: q.difficulty || difficulty,
        explanation: q.explanation
      }));
      await QuizMongo.insertMany(formattedQuestions);
    }

    return res.status(200).json({ message: 'Quiz updated successfully', quizSet });
  } catch (error) {
    console.error('Error updating quiz set:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteQuizSet = async (req, res) => {
  try {
    const { id } = req.params;
    if (isMockMode()) {
      mockContentStore.deleteQuizSet(id);
      return res.status(200).json({ message: 'Quiz deleted successfully (Mock)' });
    }

    await QuizSetMongo.findByIdAndDelete(id);
    await QuizMongo.deleteMany({ quizSetId: id });
    await QuizAttemptMongo.deleteMany({ quizSetId: id });
    return res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz set:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getAdminQuizSets = async (req, res) => {
  try {
    if (isMockMode()) {
      const quizzes = mockContentStore.listQuizSets();
      return res.status(200).json(quizzes);
    }

    const quizzes = await QuizSetMongo.find().sort({ createdAt: -1 });
    console.log(`Found ${quizzes.length} quiz sets`);
    
    // Get question counts for each
    const quizData = await Promise.all(quizzes.map(async (q) => {
      try {
        const count = await QuizMongo.countDocuments({ quizSetId: q._id });
        const obj = q.toObject();
        obj.questionCount = count;
        return obj;
      } catch (innerErr) {
        console.error(`Error processing quiz set ${q._id}:`, innerErr);
        const obj = q.toObject();
        obj.questionCount = 0;
        return obj;
      }
    }));
    return res.status(200).json(quizData);
  } catch (error) {
    console.error('Error fetching admin quiz sets:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// User Endpoints
exports.getPublishedQuizSets = async (req, res) => {
  try {
    const { category, difficulty } = req.query;

    if (isMockMode()) {
       let quizzes = mockContentStore.listQuizSets().filter(q => q.isPublished);
       if (category) quizzes = quizzes.filter(q => q.category === category);
       if (difficulty) quizzes = quizzes.filter(q => q.difficulty === difficulty);
       return res.status(200).json(quizzes);
    }

    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const quizzes = await QuizSetMongo.find(filter).sort({ createdAt: -1 });
    
    // Add question counts
    const quizData = await Promise.all(quizzes.map(async (q) => {
      const count = await QuizMongo.countDocuments({ quizSetId: q._id });
      const obj = q.toObject();
      obj.questionCount = count;
      return obj;
    }));
    
    return res.status(200).json(quizData);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getQuizSetWithQuestions = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMockMode()) {
      const quizSet = mockContentStore.listQuizSets().find(q => Number(q.id) === Number(id));
      if (!quizSet) return res.status(404).json({ message: 'Quiz not found' });
      const questions = mockContentStore.listQuizzesBySet(id);
      return res.status(200).json({ quiz: quizSet, questions });
    }

    const quizSet = await QuizSetMongo.findById(id);
    if (!quizSet) return res.status(404).json({ message: 'Quiz not found' });
    if (!quizSet.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Quiz is not published' });
    }

    const questions = await QuizMongo.find({ quizSetId: id }).sort({ order: 1 });
    
    // Remove correct_answer for non-admins to prevent cheating
    const safeQuestions = questions.map(q => {
      const obj = q.toObject();
      if (!req.user || req.user.role !== 'admin') {
        delete obj.correct_answer;
        delete obj.explanation;
      }
      return obj;
    });

    return res.status(200).json({ quiz: quizSet, questions: safeQuestions });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.submitQuizSetAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user.id || req.user._id;

    if (!answers) return res.status(400).json({ message: 'Answers are required' });

    if (isMockMode()) {
       // Minimal mock submission
       return res.status(200).json({ message: 'Quiz submitted (Mock)', score: 10, total: 10, pointsEarned: 100 });
    }

    const questions = await QuizMongo.find({ quizSetId: id });
    if (!questions.length) return res.status(404).json({ message: 'No questions found for this quiz' });

    let score = 0;
    const results = [];

    questions.forEach(q => {
      const selectedOption = answers[q._id] || answers[q.id];
      const isCorrect = selectedOption === q.correct_answer;
      if (isCorrect) score += 1;

      results.push({
        questionId: q._id,
        question: q.question,
        selectedOption,
        isCorrect,
        correct_answer: q.correct_answer,
        explanation: q.explanation
      });
    });

    const attempt = await QuizAttemptMongo.create({
      userId,
      quizSetId: id,
      score,
      totalQuestions: questions.length,
      answers,
      timeSpent: timeSpent || 0
    });

    // Update user points
    if (score > 0) {
      const user = await UserMongo.findById(userId);
      if (user) {
        if (!user.benefits) user.benefits = { points: 0, badges: [] };
        user.benefits.points += score * 10;
        user.streak = (user.streak || 0) + 1;
        await user.save();
      }
    }

    return res.status(200).json({
      message: 'Quiz submitted successfully',
      score,
      total: questions.length,
      results,
      pointsEarned: score * 10
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
