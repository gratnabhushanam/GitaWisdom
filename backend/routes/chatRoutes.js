const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { chatMentor } = require('../controllers/chatController');

// Rate limiting middleware: max 15 requests per 10 minutes per IP
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 15,
  message: { reply: 'Too many messages sent. Please reflect and meditate for a few minutes before seeking more guidance.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', chatLimiter, chatMentor);

module.exports = router;
