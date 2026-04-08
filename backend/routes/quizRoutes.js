const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getQuizQuestions, addQuizQuestion, deleteQuizQuestion } = require('../controllers/quizController');

router.get('/questions', getQuizQuestions);
router.post('/questions', protect, admin, addQuizQuestion);
router.delete('/questions/:id', protect, admin, deleteQuizQuestion);

module.exports = router;
