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

  // Users Management
  getAllUsers: (params = {}) => adminAPI.get('/admin/users', { params }).then(res => res.data),
  updateUserRole: (userId, role) => adminAPI.put(`/admin/users/${userId}/role`, { role }).then(res => res.data),
  updateUserStatus: (userId, isActive) => adminAPI.put(`/admin/users/${userId}/status`, { is_active: isActive }).then(res => res.data),
  deleteUser: (id) => adminAPI.delete(`/admin/users/${id}`).then(res => res.data),

  // Words Management
  getWords: (params = {}) => adminAPI.get('/admin/words', { params }).then(res => res.data),
  createWord: (data) => adminAPI.post('/admin/words', data).then(res => res.data),
  updateWord: (id, data) => adminAPI.put(`/admin/words/${id}`, data).then(res => res.data),
  bulkWords: (action, wordIds) => adminAPI.post('/admin/words/bulk', { action, wordIds }).then(res => res.data),

  // Discussions Management
  getAllDiscussions: (params = {}) => adminAPI.get('/discussions', { params }).then(res => res.data),
  deleteDiscussion: (id) => adminAPI.delete(`/discussions/${id}`).then(res => res.data),
  pinDiscussion: (id) => adminAPI.put(`/discussions/${id}/pin`).then(res => res.data),
  unpinDiscussion: (id) => adminAPI.delete(`/discussions/${id}/pin`).then(res => res.data),
  lockDiscussion: (id) => adminAPI.put(`/discussions/${id}/lock`).then(res => res.data),
  unlockDiscussion: (id) => adminAPI.delete(`/discussions/${id}/lock`).then(res => res.data),

  // Reports & Moderation
  getReports: (params = {}) => adminAPI.get('/admin/reports', { params }).then(res => res.data),
  resolveReport: (id, data) => adminAPI.post(`/admin/reports/${id}/resolve`, data).then(res => res.data),
  dismissReport: (id) => adminAPI.post(`/admin/reports/${id}/dismiss`, {}).then(res => res.data),

  // Moderation History
  getModerationHistory: (params = {}) => adminAPI.get('/admin/moderation-history', { params }).then(res => res.data),

  // Words Import/Export
  importWords: (formData) => adminAPI.post('/admin/words/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000 // 2 minutes for import operations
  }).then(res => res.data),
  exportWords: (params = {}) => adminAPI.post('/admin/words/export', params, {
    responseType: 'blob'
  }),
  downloadImportTemplate: () => adminAPI.get('/admin/words/template', {
    responseType: 'blob'
  }),
};

export default admin;
