import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../services/notificationsAPI';

/**
 * Custom hook to manage notifications state and unread count
 * @param {object} user - The current user object
 * @param {object} socket - Socket.io instance for real-time updates
 * @returns {object} Object containing unreadCount and fetchUnreadCount function
 */
const useNotifications = (user, socket) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!socket || !user) return;

    // Get the actual socket instance from socketClient
    const socketInstance = socket.socket || socket;

    // Check if socket is connected and has the on method
    if (!socketInstance || typeof socketInstance.on !== 'function') {
      return;
    }

    const handleNewNotification = () => {
      fetchUnreadCount();
    };

    const handleNotificationRead = () => {
      fetchUnreadCount();
    };

    socketInstance.on('new-notification', handleNewNotification);
    socketInstance.on('notification-read', handleNotificationRead);

    return () => {
      if (socketInstance && typeof socketInstance.off === 'function') {
        socketInstance.off('new-notification', handleNewNotification);
        socketInstance.off('notification-read', handleNotificationRead);
      }
    };
  }, [socket, user, fetchUnreadCount]);

  return { unreadCount, fetchUnreadCount };
};

export default useNotifications;
