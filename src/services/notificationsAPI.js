import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Notifications API
 */
export const notificationsAPI = {
  /**
   * Get notifications for authenticated user
   * @param {Object} params - Query parameters
   * @param {string} params.filter - Filter by category (all|unread|mentions|replies|contributions|likes|follows|system)
   * @param {number} params.limit - Number of notifications to fetch (default: 20)
   * @param {number} params.offset - Pagination offset (default: 0)
   * @param {boolean} params.unreadOnly - Fetch only unread notifications
   */
  getNotifications: (params = {}) => {
    return api.get('/users/notifications', { params }).then(res => res.data);
  },

  /**
   * Get count of unread notifications
   */
  getUnreadCount: () => {
    return api.get('/users/notifications/unread-count').then(res => res.data);
  },

  /**
   * Get notification counts by category
   * Returns counts for all, unread, mentions, replies, contributions, votes, follows, system
   */
  getCategoryCounts: () => {
    return api.get('/users/notifications/counts').then(res => res.data);
  },

  /**
   * Mark a specific notification as read
   * @param {string} notificationId - ID of the notification
   */
  markAsRead: (notificationId) => {
    return api.put(`/users/notifications/${notificationId}/read`).then(res => res.data);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => {
    return api.put('/users/notifications/mark-all-read').then(res => res.data);
  },

  /**
   * Delete a notification
   * @param {string} notificationId - ID of the notification
   */
  deleteNotification: (notificationId) => {
    return api.delete(`/users/notifications/${notificationId}`).then(res => res.data);
  }
};

export default api;
