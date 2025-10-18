import axios from 'axios';

// Create axios instance for admin API
const adminAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor to add auth token
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin Dashboard API
export const admin = {
  // Dashboard Stats
  getDashboardStats: () => adminAPI.get('/admin/dashboard').then(res => res.data),
  getAnalytics: (params = {}) => adminAPI.get('/admin/analytics', { params }).then(res => res.data),

  // Users Management
  getAllUsers: (params = {}) => adminAPI.get('/admin/users', { params }).then(res => res.data),
  getUserById: (id) => adminAPI.get(`/admin/users/${id}`).then(res => res.data),
  updateUser: (id, data) => adminAPI.put(`/admin/users/${id}`, data).then(res => res.data),
  deleteUser: (id) => adminAPI.delete(`/admin/users/${id}`).then(res => res.data),
  suspendUser: (id, data) => adminAPI.post(`/admin/users/${id}/suspend`, data).then(res => res.data),
  unsuspendUser: (id) => adminAPI.post(`/admin/users/${id}/unsuspend`).then(res => res.data),

  // Words Management
  getAllWords: (params = {}) => adminAPI.get('/admin/words', { params }).then(res => res.data),
  updateWord: (id, data) => adminAPI.put(`/admin/words/${id}`, data).then(res => res.data),
  deleteWord: (id) => adminAPI.delete(`/admin/words/${id}`).then(res => res.data),
  approveWord: (id) => adminAPI.post(`/admin/words/${id}/approve`).then(res => res.data),

  // Discussions Management
  getAllDiscussions: (params = {}) => adminAPI.get('/discussions', { params }).then(res => res.data),
  getDiscussion: (id) => adminAPI.get(`/discussions/${id}`).then(res => res.data),
  updateDiscussion: (id, data) => adminAPI.put(`/discussions/${id}`, data).then(res => res.data),
  deleteDiscussion: (id) => adminAPI.delete(`/discussions/${id}`).then(res => res.data),
  pinDiscussion: (id) => adminAPI.post(`/discussions/${id}/pin`).then(res => res.data),
  unpinDiscussion: (id) => adminAPI.post(`/discussions/${id}/unpin`).then(res => res.data),
  lockDiscussion: (id) => adminAPI.post(`/discussions/${id}/lock`).then(res => res.data),
  unlockDiscussion: (id) => adminAPI.post(`/discussions/${id}/unlock`).then(res => res.data),

  // Answers Management
  getAllAnswers: (params = {}) => adminAPI.get('/answers', { params }).then(res => res.data),
  getAnswer: (id) => adminAPI.get(`/answers/${id}`).then(res => res.data),
  updateAnswer: (id, data) => adminAPI.put(`/answers/${id}`, data).then(res => res.data),
  deleteAnswer: (id) => adminAPI.delete(`/answers/${id}`).then(res => res.data),

  // Reports & Moderation
  getReports: (params = {}) => adminAPI.get('/admin/reports', { params }).then(res => res.data),
  getReport: (id) => adminAPI.get(`/admin/reports/${id}`).then(res => res.data),
  resolveReport: (id, data) => adminAPI.post(`/admin/reports/${id}/resolve`, data).then(res => res.data),
  dismissReport: (id, note) => adminAPI.post(`/admin/reports/${id}/dismiss`, { note }).then(res => res.data),

  // Moderation History
  getModerationHistory: (params = {}) => adminAPI.get('/admin/moderation-history', { params }).then(res => res.data),

  // Bulk Actions
  bulkDiscussionActions: (action, discussionIds) => adminAPI.post('/admin/discussions/bulk', { action, discussionIds }).then(res => res.data),

  // Audit Logs
  getAuditLogs: (params = {}) => adminAPI.get('/admin/audit-logs', { params }).then(res => res.data),

  // Import/Export
  importData: (formData) => adminAPI.post('/admin/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  exportData: (params = {}) => adminAPI.get('/admin/export', {
    params,
    responseType: 'blob'
  }).then(res => res.data),
};

export default admin;
