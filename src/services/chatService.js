/**
 * Chat API Service
 * 
 * Handles API calls for chat functionality
 */

import api from './api';

const chatService = {
  // Conversation endpoints
  getConversations: async (params = {}) => {
    const response = await api.get('/chat/conversations', { params });
    return response.data;
  },

  getConversation: async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  createConversation: async (data) => {
    const response = await api.post('/chat/conversations', data);
    return response.data;
  },

  updateConversation: async (conversationId, data) => {
    const response = await api.put(`/chat/conversations/${conversationId}`, data);
    return response.data;
  },

  addParticipant: async (conversationId, userId, role = 'member') => {
    const response = await api.post(`/chat/conversations/${conversationId}/participants`, {
      userId,
      role
    });
    return response.data;
  },

  removeParticipant: async (conversationId, userId) => {
    const response = await api.delete(`/chat/conversations/${conversationId}/participants/${userId}`);
    return response.data;
  },

  updateParticipantSettings: async (conversationId, settings) => {
    const response = await api.put(`/chat/conversations/${conversationId}/settings`, settings);
    return response.data;
  },

  // Message endpoints
  getMessages: async (conversationId, params = {}) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, { params });
    return response.data;
  },

  sendMessage: async (conversationId, data) => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, data);
    return response.data;
  },

  updateMessage: async (messageId, content) => {
    const response = await api.put(`/chat/messages/${messageId}`, { content });
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/chat/messages/${messageId}`);
    return response.data;
  },

  // Reactions
  addReaction: async (messageId, emoji) => {
    const response = await api.post(`/chat/messages/${messageId}/reactions`, { emoji });
    return response.data;
  },

  removeReaction: async (messageId, emoji) => {
    const response = await api.delete(`/chat/messages/${messageId}/reactions/${emoji}`);
    return response.data;
  },

  // Read receipts
  markAsRead: async (conversationId) => {
    const response = await api.post(`/chat/conversations/${conversationId}/read`);
    return response.data;
  },

  // Search
  searchConversations: async (query, limit = 20) => {
    const response = await api.get('/chat/search', {
      params: { q: query, limit }
    });
    return response.data;
  },

  searchMessages: async (conversationId, query, limit = 20) => {
    const response = await api.get(`/chat/conversations/${conversationId}/search`, {
      params: { q: query, limit }
    });
    return response.data;
  },

  // Media
  getMedia: async (conversationId, params = {}) => {
    const response = await api.get(`/chat/conversations/${conversationId}/media`, { params });
    return response.data;
  },

  // Start a direct conversation with a user
  startDirectChat: async (userId) => {
    return await chatService.createConversation({
      type: 'direct',
      participantIds: [userId]
    });
  },

  // Create a group conversation
  createGroupChat: async (name, description, participantIds) => {
    return await chatService.createConversation({
      type: 'group',
      name,
      description,
      participantIds
    });
  }
};

export default chatService;
