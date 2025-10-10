import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  UserCircleIcon,
  PencilIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { usersAPI, authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    native_language: '',
  });

  const isOwnProfile = currentUser && currentUser.id === userId;

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile
      const profileResponse = await usersAPI.getUserProfile(userId);
      setProfile(profileResponse.data.user);

      // Fetch user stats
      const statsResponse = await usersAPI.getUserStats(userId);
      setStats(statsResponse.data.stats);

      // Initialize edit form with current data
      if (profileResponse.data.user) {
        setEditForm({
          full_name: profileResponse.data.user.full_name || '',
          bio: profileResponse.data.user.bio || '',
          location: profileResponse.data.user.location || '',
          native_language: profileResponse.data.user.native_language || '',
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile. Please try again.');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset form to current values when entering edit mode
      setEditForm({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        native_language: profile.native_language || '',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      // Update profile via API
      const response = await authAPI.updateProfile(editForm);

      if (response.data.success) {
        setProfile(prev => ({
          ...prev,
          ...editForm
        }));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">{error || 'User not found'}</div>
          <button
            onClick={() => navigate('/discussions/members')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to Members
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          {/* Cover gradient */}
          <div className="h-32 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500"></div>

          <div className="px-6 pb-6">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                {/* Avatar */}
                <div className="relative">
                  {profile.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt={profile.username}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
                      {getInitials(profile.full_name || profile.username)}
                    </div>
                  )}

                  {/* Role Badge */}
                  {profile.role && profile.role !== 'user' && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 border-2 border-white dark:border-gray-800 shadow-sm">
                        {profile.role}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name & Username */}
                <div className="text-center sm:text-left mb-4 sm:mb-0">
                  {!isEditing ? (
                    <>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {profile.full_name || profile.username}
                      </h1>
                      <p className="text-gray-500 dark:text-gray-400">
                        @{profile.username}
                      </p>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="full_name"
                        value={editForm.full_name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="w-full px-3 py-2 text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <p className="text-gray-500 dark:text-gray-400">
                        @{profile.username}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button (only for own profile) */}
              {isOwnProfile && (
                <div className="flex gap-2 mt-4 sm:mt-0">
                  {!isEditing ? (
                    <button
                      onClick={handleEditToggle}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                      >
                        <CheckIcon className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleEditToggle}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="mb-4">
              {!isEditing ? (
                profile.bio ? (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {profile.bio}
                  </p>
                ) : isOwnProfile ? (
                  <p className="text-gray-400 dark:text-gray-500 italic">
                    Add a bio to tell others about yourself
                  </p>
                ) : null
              ) : (
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  placeholder="Write something about yourself..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              )}
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              {/* Location */}
              {(!isEditing && profile.location) || isEditing ? (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  {!isEditing ? (
                    <span>{profile.location}</span>
                  ) : (
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleInputChange}
                      placeholder="Location"
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  )}
                </div>
              ) : null}

              {/* Native Language */}
              {(!isEditing && profile.native_language) || isEditing ? (
                <div className="flex items-center gap-2">
                  <GlobeAltIcon className="h-4 w-4" />
                  {!isEditing ? (
                    <span>Speaks {profile.native_language}</span>
                  ) : (
                    <input
                      type="text"
                      name="native_language"
                      value={editForm.native_language}
                      onChange={handleInputChange}
                      placeholder="Native Language"
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  )}
                </div>
              ) : null}

              {/* Joined Date */}
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Discussions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.discussion_count || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Discussions
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                  <ChatBubbleLeftIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.chat_count || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Messages
                  </div>
                </div>
              </div>
            </div>

            {/* Total Contributions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <UserCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_contributions || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Posts
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Section (Placeholder for future features) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Activity feed coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
