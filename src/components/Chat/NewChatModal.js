import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const NewChatModal = ({ onClose, onCreate }) => {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await usersAPI.getAllUsers({ limit: 100 });
        const allUsers = response.data?.users || [];
        // Filter out current user
        const otherUsers = allUsers.filter(u => u.id !== currentUser?.id);
        setUsers(otherUsers);
        setFilteredUsers(otherUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user =>
        user.username?.toLowerCase().includes(query) ||
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleUserSelect = (user) => {
    // Allow multiple users for group chat
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (groupName && selectedUsers.length > 0) {
      onCreate('group', {
        name: groupName,
        description: groupDescription,
        participantIds: selectedUsers.map(u => u.id)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[85vh] md:max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-teal-50 to-white dark:from-gray-800 dark:to-gray-800">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
              New Group Chat
            </h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Create a group to start chatting
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-5 chat-scrollbar">
          {/* Group Details */}
          <div className="space-y-3 md:space-y-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Lisu Language Learners"
                required
                className="w-full px-3.5 py-2.5 text-[14px] md:text-[15px] border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Description <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="What's this group about?"
                rows="2"
                className="w-full px-3.5 py-2.5 text-[14px] md:text-[15px] border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none transition-all"
              />
            </div>
          </div>

          {/* Search Users */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Add Participants <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-[14px] md:text-[15px] border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
              />
            </div>
          </div>

          {/* Selected Users Pills */}
          {selectedUsers.length > 0 && (
            <div className="mb-4 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                  {selectedUsers.length} participant{selectedUsers.length > 1 ? 's' : ''} selected
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedUsers([])}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200 font-medium"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <span
                    key={user.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 text-xs md:text-sm font-medium shadow-sm"
                  >
                    {user.username}
                    <button
                      type="button"
                      onClick={() => handleUserRemove(user.id)}
                      className="ml-0.5 hover:bg-teal-100 dark:hover:bg-teal-800 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${user.username}`}
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* User List - Only show when searching */}
          {searchQuery.trim() && (
            <div className="mb-4">
              <div className="space-y-1.5 h-60 overflow-y-auto chat-scrollbar rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-teal-200 border-t-teal-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium">Loading members...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      No users found
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  filteredUsers.map(user => {
                    const isSelected = selectedUsers.find(u => u.id === user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleUserSelect(user)}
                        disabled={isSelected}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${isSelected
                          ? 'bg-teal-100 dark:bg-teal-900/40 ring-2 ring-teal-500 dark:ring-teal-600 cursor-default'
                          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
                          }`}
                      >
                        {/* Avatar */}
                        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm">
                          {user.profile_photo_url ? (
                            <img
                              src={user.profile_photo_url}
                              alt={user.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm">{user.username?.[0]?.toUpperCase() || '?'}</span>
                          )}
                          {isSelected && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-teal-500 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-[14px] md:text-[15px] font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {user.username}
                          </p>
                          {user.full_name && (
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.full_name}
                            </p>
                          )}
                        </div>

                        {/* Selected Badge */}
                        {isSelected && (
                          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex-shrink-0">
                            Added
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all shadow-sm hover:shadow"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0 || !groupName}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-colors shadow-md hover:shadow-lg disabled:shadow-none"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
