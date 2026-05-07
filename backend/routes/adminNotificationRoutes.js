// backend/routes/adminNotificationRoutes.js
const express = require('express');
const router = express.Router();
const { broadcastNotification } = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Broadcast a notification (Admin only)
router.post('/broadcast', protect, admin, broadcastNotification);

module.exports = router;
