const QuizMongo = require('../models/mongo/QuizMongo');
const UserMongo = require('../models/mongo/UserMongo');
const { isMockMode } = require('./authController');
const mockContentStore = require('../utils/mockContentStore');

exports.getAllQuestions = async (req, res) => {
  try {
    if (isMockMode()) {
       // Using listQuizSets or similar might not be perfect for legacy, 
       // but we'll return an empty array or some mock data if needed.
       return res.status(200).json([]);
    }
    const quizzes = await QuizMongo.find();
    return res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching all quizzes:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getQuizByVideoId = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!videoId || videoId === 'questions') {
      return res.status(400).json({ message: 'Invalid videoId' });
    }

    if (isMockMode()) {
       return res.status(200).json([]);
    }

    const quizzes = await QuizMongo.find({ videoId });
    
    const safeQuizzes = quizzes.map(q => {
      const qObj = q.toObject();
      delete qObj.correct_answer;
      return qObj;
    });

    return res.status(200).json(safeQuizzes);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { videoId, answers } = req.body;
    const userId = req.user?.id;

    if (!videoId || !answers) {
      return res.status(400).json({ message: 'Missing videoId or answers' });
    }

    if (isMockMode()) {
       return res.status(200).json({ message: 'Quiz submitted (Mock)', score: 0, total: 0, results: [] });
    }

    const quizzes = await QuizMongo.find({ videoId });
    if (!quizzes.length) {
      return res.status(404).json({ message: 'No quiz found for this video' });
    }

    let score = 0;
    const results = [];

    quizzes.forEach(quiz => {
      const selectedOption = answers[quiz._id];
      const isCorrect = selectedOption === quiz.correct_answer;
      if (isCorrect) score += 1;

      results.push({
        quizId: quiz._id,
        question: quiz.question,
        isCorrect,
        correct_answer: quiz.correct_answer,
        explanation: quiz.explanation
      });
    });

    if (score > 0 && userId) {
      const user = await UserMongo.findById(userId);
      if (user) {
        if (!user.benefits) {
          user.benefits = { points: 0, badges: [] };
        }
        user.benefits.points += score * 10;
        await user.save();
      }
    }

    return res.status(200).json({
      message: 'Quiz submitted successfully',
      score,
      total: quizzes.length,
      results
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.addQuizQuestion = async (req, res) => {
  try {
    const { videoId, videoUrl, question, questionText, options, correct_answer, category, difficulty } = req.body;
    const resolvedQuestion = question || questionText;

    if (isMockMode()) {
       const newQuiz = mockContentStore.addQuizQuestion({
         videoId: videoId || 0,
         question: resolvedQuestion,
         options: Array.isArray(options) ? (typeof options[0] === 'object' ? options.map(o => o.answerText) : options) : [],
         correct_answer: correct_answer,
         difficulty: difficulty || 'medium'
       });
       return res.status(201).json(newQuiz);
    }

    let resolvedVideoId = videoId;
    
    if (!resolvedVideoId && videoUrl) {
      let searchUrl = videoUrl;
      try {
         const parsed = new URL(videoUrl);
         searchUrl = parsed.pathname;
      } catch (e) {}
      
      const VideoMongo = require('../models/mongo/VideoMongo');
      const video = await VideoMongo.findOne({
        $or: [
          { videoUrl: searchUrl },
          { videoUrl: { $regex: escapeRegex(searchUrl) + '$' } }
        ]
      });
      
      if (video) {
        resolvedVideoId = video._id;
      } else {
        return res.status(404).json({ message: 'Could not find a video matching that URL' });
      }
    }

    let resolvedOptions = options;
    let resolvedCorrectAnswer = correct_answer;

    if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object') {
       resolvedOptions = options.map(o => o.answerText);
       const correctObj = options.find(o => o.isCorrect);
       resolvedCorrectAnswer = correctObj ? correctObj.answerText : resolvedOptions[0];
    }

    if (!resolvedVideoId || !resolvedQuestion || !resolvedOptions || !resolvedCorrectAnswer) {
      return res.status(400).json({ message: 'Missing required quiz fields' });
    }

    const newQuiz = await QuizMongo.create({
      videoId: resolvedVideoId,
      question: resolvedQuestion,
      options: resolvedOptions,
      correct_answer: resolvedCorrectAnswer,
      difficulty: difficulty || 'medium'
    });

    return res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Quiz Create Error:', error);
    return res.status(500).json({ message: 'Failed to add quiz question' });
  }
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

exports.deleteQuizQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    if (isMockMode()) {
       // Mock delete
       return res.status(200).json({ message: 'Question deleted (Mock)' });
    }
    await QuizMongo.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Question deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete' });
  }
};
