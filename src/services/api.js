import axios from 'axios';

const resolveCompanionBackendUrl = (hostname) => {
  if (!hostname || typeof hostname !== 'string') return null;

  // For public tunnel/custom domains, map frontend subdomain to backend.
  if (hostname.endsWith('.lisudictionar.com') && hostname.includes('frontend')) {
    return `https://${hostname.replace('frontend', 'backend')}/api`;
  }

  return null;
};

const resolveApiBaseUrl = () => {
  const envBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  try {
    const parsed = new URL(envBaseUrl);

    // When app is opened on LAN, localhost should resolve to the current host machine.
    if (parsed.hostname === 'localhost' && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      const companionBackend = resolveCompanionBackendUrl(window.location.hostname);
      if (companionBackend) {
        return companionBackend;
      }

      parsed.hostname = window.location.hostname;
    }

    return parsed.toString().replace(/\/$/, '');
  } catch (error) {
    return envBaseUrl;
  }
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't override Content-Type if it's already set (e.g., for FormData)
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
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
    // Only redirect on 401 if it's a token issue (not login failure)
    if (error.response?.status === 401) {
      const isLoginEndpoint = error.config?.url?.includes('/auth/login');
      const isRegisterEndpoint = error.config?.url?.includes('/auth/register');

      // Don't redirect if it's a login or register attempt failure
      if (!isLoginEndpoint && !isRegisterEndpoint) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (email, password, recaptchaToken = null) => api.post('/auth/login', { email, password, recaptchaToken }).then(res => res.data),
  register: (userData) => api.post('/auth/register', userData).then(res => res.data),
  verifyToken: (token) => api.get('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data),
  getProfile: () => api.get('/auth/me').then(res => res.data),
  updateProfile: (data) => api.put('/users/me/profile', data).then(res => res.data),
  changePassword: (data) => api.post('/auth/change-password', data).then(res => res.data),
  updatePreferences: (data) => api.put('/users/me/profile', data).then(res => res.data),
  deleteAccount: (confirmation) => api.delete('/users/me/account', { data: { confirmation } }).then(res => res.data),
  getGoogleLinkStatus: () => api.get('/auth/google/status').then(res => res.data),
  unlinkGoogle: () => api.delete('/auth/google/unlink').then(res => res.data),
};

// Words API
export const wordsAPI = {
  getWords: (params = {}) => api.get('/words', { params }).then(res => res.data),
};

// Discussions API
export const discussionsAPI = {
  getDiscussions: (params = {}) => api.get('/discussions', { params }).then(res => res.data),
  getDiscussionById: (id) => api.get(`/discussions/${id}`).then(res => res.data),
  createDiscussion: (data) => {
    // Handle FormData for file uploads
    const config = {};
    if (data instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
    }
    return api.post('/discussions', data, config).then(res => res.data);
  },
  updateDiscussion: (id, data) => {
    // Handle FormData for file uploads
    const config = {};
    if (data instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
    }
    return api.put(`/discussions/${id}`, data, config).then(res => res.data);
  },
  deleteDiscussion: (id) => api.delete(`/discussions/${id}`).then(res => res.data),
  getCategories: () => api.get('/discussions/categories').then(res => res.data),

  // Save/Bookmark functionality
  saveDiscussion: (id) => api.post(`/discussions/${id}/save`).then(res => res.data),
  unsaveDiscussion: (id) => api.delete(`/discussions/${id}/save`).then(res => res.data),
  getSavedDiscussions: (params = {}) => api.get('/discussions/user/saved', { params }).then(res => res.data),

  // Solved status
  unmarkAsSolved: (id) => api.delete(`/discussions/${id}/solve`).then(res => res.data),

  // Pin/Lock (admin only)
  pinDiscussion: (id) => api.put(`/discussions/${id}/pin`).then(res => res.data),
  unpinDiscussion: (id) => api.delete(`/discussions/${id}/pin`).then(res => res.data),
  unlockDiscussion: (id) => api.delete(`/discussions/${id}/lock`).then(res => res.data),

  // Report functionality
  reportDiscussion: (id, data) => api.post(`/discussions/${id}/report`, data).then(res => res.data),

  // Voting functionality
  voteDiscussion: (id, voteType) => api.post(`/discussions/${id}/vote`, { vote_type: voteType }).then(res => res.data),
  voteAnswer: (id, voteType) => api.post(`/answers/${id}/vote`, { vote_type: voteType }).then(res => res.data),

  // Related discussions
  getRelatedDiscussions: (id, params = {}) => api.get(`/discussions/${id}/related`, { params }).then(res => res.data),
};

// Answers API
export const answersAPI = {
  getAnswersForDiscussion: (discussionId, params = {}) =>
    api.get(`/answers/discussion/${discussionId}`, { params }).then(res => res.data),

  createAnswer: (answerData) => {
    // Send base64 images as JSON instead of FormData
    const payload = {
      discussion_id: answerData.discussion_id || answerData.discussionId,
      content: answerData.content,
      images: answerData.images || [],
      parent_answer_id: answerData.parent_answer_id || answerData.parentAnswerId || null
    };

    return api.post('/answers', payload, {
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.data);
  },

  updateAnswer: (id, data) => {
    // Send base64 images as JSON instead of FormData
    const payload = {
      content: data.content,
      images: data.images || []
    };

    return api.put(`/answers/${id}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.data);
  },

  deleteAnswer: (answerId) => api.delete(`/answers/${answerId}`).then(res => res.data),

  // Vote functionality
  removeVote: (answerId) => api.delete(`/answers/${answerId}/vote`).then(res => res.data),
};

// Users API (Public)
export const usersAPI = {
  getAllUsers: (params = {}) => api.get('/users', { params }).then(res => res.data),
  getUserProfile: (userId) => api.get(`/users/${userId}`).then(res => res.data),
  getUserStats: (userId) => api.get(`/users/${userId}/statistics`).then(res => res.data),
  getMentionSuggestions: (query, limit = 10) => api.get(`/users/mention-suggestions`, {
    params: { q: query, limit }
  }).then(res => res.data),

  // Follow functionality
  followUser: (userId) => api.post(`/users/${userId}/follow`).then(res => res.data),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`).then(res => res.data),
  getFollowInfo: (userId) => api.get(`/users/${userId}/follow-info`).then(res => res.data),
  getUserFollowers: (userId, params = {}) => api.get(`/users/${userId}/followers`, { params }).then(res => res.data),
  getUserFollowing: (userId, params = {}) => api.get(`/users/${userId}/following`, { params }).then(res => res.data),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params = {}) => api.get('/notifications', { params }).then(res => res.data),
  markAsRead: (id) => api.put(`/notifications/${id}/read`).then(res => res.data),
  markAllAsRead: () => api.put('/notifications/read-all').then(res => res.data),
  deleteNotification: (id) => api.delete(`/notifications/${id}`).then(res => res.data),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations').then(res => res.data),
  getOrCreateConversation: (userId) => api.get(`/messages/conversations/${userId}`).then(res => res.data),
  getMessages: (conversationId, params = {}) => api.get(`/messages/${conversationId}`, { params }).then(res => res.data),
  sendMessage: (conversationId, content) => api.post(`/messages/${conversationId}`, { content }).then(res => res.data),
  deleteMessage: (messageId) => api.delete(`/messages/message/${messageId}`).then(res => res.data),
};

export default api;
