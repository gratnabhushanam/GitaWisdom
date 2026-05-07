const express = require('express');
const router = express.Router();
const { getAllQuestions, getQuizByVideoId, submitQuiz, addQuizQuestion, deleteQuizQuestion } = require('../controllers/quizController');
const { createQuizSet, updateQuizSet, deleteQuizSet, getAdminQuizSets, getPublishedQuizSets, getQuizSetWithQuestions, submitQuizSetAttempt } = require('../controllers/quizSetController');
const { protect, admin } = require('../middleware/authMiddleware');

// New Quiz Set Routes (Admin)
router.get('/admin/sets', protect, admin, getAdminQuizSets);
router.post('/admin/sets', protect, admin, createQuizSet);
router.put('/admin/sets/:id', protect, admin, updateQuizSet);
router.delete('/admin/sets/:id', protect, admin, deleteQuizSet);

// New Quiz Set Routes (User)
router.get('/sets', getPublishedQuizSets);
router.get('/sets/:id', getQuizSetWithQuestions);
router.post('/sets/:id/submit', protect, submitQuizSetAttempt);

// Legacy Video Quizzes
router.get('/all', protect, admin, getAllQuestions);
router.post('/add', protect, admin, addQuizQuestion);
router.delete('/questions/:id', protect, admin, deleteQuizQuestion);
router.post('/submit', protect, submitQuiz);

// MUST BE LAST to prevent shadowing
router.get('/:videoId', getQuizByVideoId);

module.exports = router;
