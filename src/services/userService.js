/**
 * User Service
 * Handles user-related API calls
 */

import api from './api';

class UserService {
  /**
   * Get user UUID by username
   * @param {string} username - Username to look up
   * @returns {Promise<string|null>} User UUID or null if not found
   */
  async getUserUUIDByUsername(username) {
    try {
      const response = await api.get(`/users/lookup/${username}`);
      return response.data?.data?.user?.id || null;
    } catch (error) {
      console.warn(`Failed to get UUID for username ${username}:`, error);
      return null;
    }
  }

  /**
   * Get multiple user UUIDs by usernames
   * @param {string[]} usernames - Array of usernames to look up
   * @returns {Promise<Object>} Map of username -> UUID
   */
  async getUserUUIDsByUsernames(usernames) {
    try {
      const response = await api.post('/users/lookup', { usernames });
      return response.data?.data?.userMap || {};
    } catch (error) {
      console.warn('Failed to get UUIDs for usernames:', error);
      return {};
    }
  }

  /**
   * Search users for mentions
   * @param {string} searchTerm - Search term
   * @param {number} limit - Limit of results
   * @returns {Promise<Array>} Array of users
   */
  async searchUsersForMentions(searchTerm, limit = 10) {
    try {
      const response = await api.get('/users/search', {
        params: { q: searchTerm, limit }
      });
      return response.data?.data?.users || [];
    } catch (error) {
      console.warn('Failed to search users for mentions:', error);
      return [];
    }
  }
}

const userService = new UserService();
export default userService;