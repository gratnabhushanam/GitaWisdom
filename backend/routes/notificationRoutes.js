// backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { getUserNotifications, markNotificationRead, markAllNotificationsRead, subscribeToPush } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Get all notifications for the logged-in user
router.get('/', protect, getUserNotifications);

// Mark a notification as read
router.post('/:id/read', protect, markNotificationRead);

// Mark all notifications as read
router.post('/read-all', protect, markAllNotificationsRead);

// Subscribe to web push
router.post('/subscribe', protect, subscribeToPush);

module.exports = router;
