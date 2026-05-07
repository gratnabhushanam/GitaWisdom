import { useState, useEffect } from 'react';
import { getNotifications, markAllNotificationsRead } from '../api/notificationApi';

export const useNotifications = (user) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const data = await getNotifications();
          setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Failed to fetch notifications:', err);
        }
      };
      
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead && !n.read).length;

  const handleMarkAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true, read: true })));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  return {
    notifications,
    showNotifications,
    setShowNotifications,
    unreadCount,
    handleMarkAsRead,
  };
};
