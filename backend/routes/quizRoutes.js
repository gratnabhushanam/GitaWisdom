const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getQuizByVideoId, submitQuiz, addQuizQuestion, deleteQuizQuestion, getAllQuestions } = require('../controllers/quizController');

// Admin
router.get('/questions', protect, admin, getAllQuestions);
router.post('/questions', protect, admin, addQuizQuestion);
router.delete('/questions/:id', protect, admin, deleteQuizQuestion);

// For specific video (used by clients)
router.post('/submit', protect, submitQuiz);
router.get('/:videoId', getQuizByVideoId);

module.exports = router;
