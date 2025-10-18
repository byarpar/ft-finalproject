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
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }).then(res => res.data),
  register: (userData) => api.post('/auth/register', userData).then(res => res.data),
  verifyToken: (token) => api.get('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data),
  getProfile: () => api.get('/auth/profile').then(res => res.data),
  updateProfile: (data) => api.put('/auth/profile', data).then(res => res.data),
  updatePassword: (currentPassword, newPassword) =>
    api.put('/auth/password', { currentPassword, newPassword }).then(res => res.data),
  changePassword: (data) => api.put('/auth/change-password', data).then(res => res.data),
  updatePreferences: (data) => api.put('/auth/preferences', data),
  updateDarkModePreference: (dark_mode_preference) =>
    api.put('/auth/dark-mode', { dark_mode_preference }).then(res => res.data),
  deleteAccount: (confirmation) => api.delete('/auth/account', { data: { confirmation } }).then(res => res.data),
};

// Words API
export const wordsAPI = {
  getWords: (params = {}) => api.get('/words', { params }).then(res => res.data),
  getWord: (id) => api.get(`/words/${id}`).then(res => res.data),
  createWord: (data) => api.post('/words', data).then(res => res.data),
  updateWord: (id, data) => api.put(`/words/${id}`, data).then(res => res.data),
  deleteWord: (id) => api.delete(`/words/${id}`).then(res => res.data),
  getSimilarWords: (id) => api.get(`/words/${id}/similar`).then(res => res.data),
  getFavorites: (params = {}) => api.get('/words/favorites/list', { params }).then(res => res.data),
  addToFavorites: (wordId) => api.post(`/words/${wordId}/favorite`).then(res => res.data),
  removeFromFavorites: (wordId) => api.delete(`/words/${wordId}/favorite`).then(res => res.data),
  getTrending: (params = {}) => api.get('/words/trending/list', { params }).then(res => res.data),
};

// Etymology API
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

  // Voting functionality
  voteDiscussion: (id, voteType) => api.post(`/discussions/${id}/vote`, { vote_type: voteType }).then(res => res.data),
  voteAnswer: (id, voteType) => api.post(`/answers/${id}/vote`, { vote_type: voteType }).then(res => res.data),

  // Solved status
  markAsSolved: (id, answerId) => api.put(`/discussions/${id}/solve`, { answerId }).then(res => res.data),
  unmarkAsSolved: (id) => api.delete(`/discussions/${id}/solve`).then(res => res.data),

  // Pin/Lock (admin only)
  pinDiscussion: (id) => api.put(`/discussions/${id}/pin`).then(res => res.data),
  unpinDiscussion: (id) => api.delete(`/discussions/${id}/pin`).then(res => res.data),
  lockDiscussion: (id) => api.put(`/discussions/${id}/lock`).then(res => res.data),
  unlockDiscussion: (id) => api.delete(`/discussions/${id}/lock`).then(res => res.data),

  // Report functionality
  reportDiscussion: (id, data) => api.post(`/discussions/${id}/report`, data).then(res => res.data),
};

// Tags API
export const tagsAPI = {
  getAllTags: () => api.get('/tags').then(res => res.data),
  getPopularTags: (limit = 10) => api.get('/tags/popular', { params: { limit } }).then(res => res.data),
};

// Chat API
export const chatAPI = {
  getRooms: () => api.get('/chat/rooms').then(res => res.data),
  getRoomMessages: (roomSlug, params = {}) => api.get(`/chat/rooms/${roomSlug}/messages`, { params }).then(res => res.data),
  sendMessage: (roomSlug, message) => api.post(`/chat/rooms/${roomSlug}/messages`, { message }).then(res => res.data),
  editMessage: (messageId, message) => api.put(`/chat/messages/${messageId}`, { message }).then(res => res.data),
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`).then(res => res.data),
  getRoomMembers: (roomSlug) => api.get(`/chat/rooms/${roomSlug}/members`).then(res => res.data),
  updateOnlineStatus: (roomSlug, isOnline) => api.put(`/chat/rooms/${roomSlug}/status`, { isOnline }).then(res => res.data),
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

  createReply: (parentAnswerId, replyData) => {
    // Create a reply to a specific answer
    const payload = {
      discussion_id: replyData.discussion_id,
      content: replyData.content,
      images: replyData.images || [],
      parentAnswerId: parentAnswerId
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
};

// Admin APIs
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard').then(res => res.data),
  getAllUsers: (params = {}) => api.get('/admin/users', { params }).then(res => res.data),
  getUsers: (params = {}) => api.get('/admin/users', { params }).then(res => res.data),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }).then(res => res.data),
  updateUserStatus: (userId, isActive) => api.put(`/admin/users/${userId}/status`, { is_active: isActive }).then(res => res.data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`).then(res => res.data),
  getWords: (params = {}) => api.get('/admin/words', { params }).then(res => res.data),
  createWord: (data) => api.post('/admin/words', data).then(res => res.data),
  updateWord: (id, data) => api.put(`/admin/words/${id}`, data).then(res => res.data),
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }).then(res => res.data),
  adminSearch: (query, type = 'all', filters = {}) => api.post('/admin/search', { query, type, filters }).then(res => res.data),
  exportData: (type) => api.get(`/admin/export/${type}`).then(res => res.data),
  getSystemHealth: () => api.get('/admin/health').then(res => res.data),
  bulkWords: (action, wordIds) => api.post('/admin/words/bulk', { action, wordIds }).then(res => res.data),

  // Etymology admin endpoints
  getEtymology: (params = {}) => api.get('/etymology', { params }).then(res => res.data),
  getEtymologyStats: () => api.get('/etymology/stats/overview').then(res => res.data),
  createEtymology: (data) => api.post('/etymology', data).then(res => res.data),
  updateEtymology: (id, data) => api.put(`/etymology/${id}`, data).then(res => res.data),
  deleteEtymology: (id) => api.delete(`/etymology/${id}`).then(res => res.data),

  // Import/Export endpoints
  importWords: (formData) => api.post('/admin/words/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  validateImport: (formData) => api.post('/admin/words/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  exportWords: (params = {}) => api.post('/admin/words/export', params, {
    responseType: 'blob'
  }),
  downloadImportTemplate: () => api.get('/admin/words/template', {
    responseType: 'blob'
  }),
  getImportExportHistory: () => api.get('/admin/import-export/history').then(res => res.data),
};

// Users API (Public)
export const usersAPI = {
  getAllUsers: (params = {}) => api.get('/users', { params }).then(res => res.data),
  getUserProfile: (userId) => api.get(`/users/${userId}`).then(res => res.data),
  getUserStats: (userId) => api.get(`/users/${userId}/stats`).then(res => res.data),
};

// Search API
export const searchAPI = {
  search: (params) => api.get('/search', { params }).then(res => res.data),
  suggest: (params) => api.get('/search/suggestions', { params }).then(res => res.data),
  advancedSearch: (data) => api.post('/search/advanced', data).then(res => res.data),
  getAnalytics: (params = {}) => api.get('/search/analytics', { params }).then(res => res.data),
};

export default api;
