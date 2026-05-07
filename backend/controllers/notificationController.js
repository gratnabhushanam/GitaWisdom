// backend/controllers/notificationController.js
const Notification = require('../models/Notification');

// Get all notifications for the logged-in user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(100);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark a notification as read
const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    await Notification.updateOne({ _id: id, userId }, { $set: { read: true } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Subscribe user to Web Push
const subscribeToPush = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { subscription } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Invalid subscription object.' });
    }

    const User = require('../models/User');
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Ensure pushSubscriptions is an array
    let subs = user.pushSubscriptions;
    if (!subs || !Array.isArray(subs)) {
      subs = [];
    }

    // Add if not already exists (checking endpoint to prevent duplicates)
    const exists = subs.find(s => s.endpoint === subscription.endpoint);
    if (!exists) {
      subs.push(subscription);
      await user.update({ pushSubscriptions: subs });
    }

    res.json({ success: true, message: 'Push subscription saved.' });
  } catch (error) {
    console.error('Subscribe to push error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Broadcast a notification to users
const broadcastNotification = async (req, res) => {
  try {
    const { title, body, type, target } = req.body;
    const { sendPush, sendInApp } = require('../utils/notificationService');
    const { useMongoStore } = require('../utils/mongoStore');

    // Default to 'all' if no target is specified
    const targetSegment = target || 'all';

    let users = [];
    if (useMongoStore()) {
      const UserMongo = require('../models/mongo/UserMongo');
      users = await UserMongo.find({}, { _id: 1, email: 1, settings: 1, pushSubscriptions: 1 });
      // Map MongoDB documents to the expected format
      users = users.map(u => {
        const obj = u.toObject();
        return {
          id: String(obj._id),
          email: obj.email,
          settings: obj.settings,
          pushSubscriptions: obj.pushSubscriptions
        };
      });
    } else {
      const User = require('../models/User'); // Import User locally to avoid circular dependencies
      if (targetSegment === 'all') {
        users = await User.findAll({ attributes: ['id', 'email', 'settings', 'pushSubscriptions'] });
      } else {
        users = await User.findAll({ attributes: ['id', 'email', 'settings', 'pushSubscriptions'] });
      }
    }

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found to broadcast to.' });
    }

    let successCount = 0;

    // Process in batches or asynchronously
    // For now, process sequentially/concurrently in a limited way
    for (const user of users) {
      try {
        // Send In-App Notification (Database)
        await sendInApp({
          userId: user.id,
          type: type || 'system',
          title,
          body,
        });

        // Send Native Web Push Notification if user has it enabled and we have a subscription
        if (user.settings && user.settings.notifications) {
          if (user.pushSubscriptions && Array.isArray(user.pushSubscriptions)) {
            for (const subscription of user.pushSubscriptions) {
               await sendPush({
                 subscription,
                 title,
                 body,
                 data: { url: '/' } // Redirect URL upon clicking the push notification
               }).catch(err => console.error(`Push failed for user ${user.id}:`, err));
            }
          }
        }
        successCount++;
      } catch (err) {
        console.error(`Failed to send notification to user ${user.id}`, err);
      }
    }

    res.json({ success: true, message: `Broadcast sent successfully to ${successCount} users.` });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  broadcastNotification,
  subscribeToPush,
};
