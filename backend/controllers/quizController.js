const QuizMongo = require('../models/mongo/QuizMongo');
const UserMongo = require('../models/mongo/UserMongo');

exports.getAllQuestions = async (req, res) => {
  try {
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
    
    // Safety check because sometimes string videoId fails object validation
    if (!videoId || videoId === 'questions') {
      return res.status(400).json({ message: 'Invalid videoId' });
    }

    // Find quizzes for the specific video
    const quizzes = await QuizMongo.find({ videoId });
    
    // We omit 'correct_answer' on get to prevent cheating
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
    const { videoId, answers } = req.body; // answers: { quizId: "selected_option" }
    const userId = req.user?.id;

    if (!videoId || !answers) {
      return res.status(400).json({ message: 'Missing videoId or answers' });
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

    // Update user benefits/streak if passed
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

    // Handle AdminDashboard generic payloads
    const resolvedQuestion = question || questionText;
    let resolvedVideoId = videoId;
    
    // If frontend sent a videoUrl instead of an ObjectID, look it up in the database.
    if (!resolvedVideoId && videoUrl) {
      // It might be a full URL, or an uploads path. Try to parse out the filename or match the DB directly.
      let searchUrl = videoUrl;
      try {
         const parsed = new URL(videoUrl);
         searchUrl = parsed.pathname;
      } catch (e) {} // Not a valid URL, treat as string
      
      const VideoMongo = require('../models/mongo/VideoMongo');
      // Look for the exact url, or one ending with the filename
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

    // Process options. Frontend might send [{answerText, isCorrect}] or ['str', 'str']
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
    await QuizMongo.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Question deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete' });
  }
};
