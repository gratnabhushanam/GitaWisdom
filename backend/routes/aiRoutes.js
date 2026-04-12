const express = require('express');
const router = express.Router();
const { chatWithAI, generateTTS } = require('../controllers/aiController');

router.post('/chat', chatWithAI);
router.post('/tts', generateTTS);

module.exports = router;
