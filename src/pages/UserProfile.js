import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  PencilIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  CogIcon,
  UserPlusIcon,
  FlagIcon,
  BookmarkIcon,
  TrophyIcon,
  FireIcon,
  EyeIcon,
  HeartIcon,
  TagIcon,
  UserGroupIcon,
  SparklesIcon,
  ClockIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon,
  TrophyIcon as TrophySolidIcon
} from '@heroicons/react/24/solid';
import { usersAPI, authAPI, discussionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const UserProfileEnhanced = () => {
  const { userId, username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // State
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');

  // Tab-specific data
  const [activityFeed, setActivityFeed] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  // Removed unused savedItems state
  // const [savedItems, setSavedItems] = useState([]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    native_language: '',
  });

  // Determine if viewing own profile
  const isOwnProfile = currentUser && (
    (userId && currentUser.id === userId) ||
    (username && currentUser.username === username) ||
    username === 'me'
  );

  // Fetch profile data
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let targetUserId = userId;

      // If username provided, fetch user by username first
      if (username && !userId) {
        if (username === 'me' && currentUser) {
          targetUserId = currentUser.id;
        } else {
          const usersResponse = await usersAPI.getAllUsers({
            search: username,
            limit: 10
          });

          if (usersResponse.users && usersResponse.users.length > 0) {
            const foundUser = usersResponse.users.find(u =>
              u.username.toLowerCase() === username.toLowerCase()
            );
            if (foundUser) {
              targetUserId = foundUser.id;
            } else {
              setError('User not found');
              setLoading(false);
              return;
            }
          } else {
            setError('User not found');
            setLoading(false);
            return;
          }
        }
      }

      // Fetch user profile
      const profileResponse = await usersAPI.getUserProfile(targetUserId);
      if (profileResponse && profileResponse.data && profileResponse.data.user) {
        setProfile(profileResponse.data.user);

        // Initialize edit form
        setEditForm({
          full_name: profileResponse.data.user.full_name || '',
          bio: profileResponse.data.user.bio || '',
          location: profileResponse.data.user.location || '',
          native_language: profileResponse.data.user.native_language || '',
        });
      }

      // Fetch user stats
      const statsResponse = await usersAPI.getUserStats(targetUserId);
      if (statsResponse && statsResponse.data) {
        setStats(statsResponse.data.stats || statsResponse.data);
      }

      // Fetch user's discussions
      const discussionsResponse = await discussionsAPI.getDiscussions({
        author_id: targetUserId,
        limit: 20
      });
      if (discussionsResponse && discussionsResponse.discussions) {
        setDiscussions(discussionsResponse.discussions);
      }

    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile. Please try again.');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId, username, currentUser]);

  useEffect(() => {
    if (currentUser || userId || username) {
      fetchUserProfile();
    } else {
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, username, currentUser]);

  // Generate activity feed from discussions
  useEffect(() => {
    if (discussions.length > 0) {
      const feed = discussions.slice(0, 10).map(discussion => ({
        type: 'discussion',
        action: 'Posted in',
        title: discussion.title,
        id: discussion.id,
        timestamp: discussion.created_at,
        snippet: discussion.content?.substring(0, 100).replace(/<[^>]*>/g, '') + '...'
      }));

      // Sort by timestamp
      feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setActivityFeed(feed);
    }
  }, [discussions]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && profile) {
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

      const response = await authAPI.updateProfile(editForm);

      if (response && response.data) {
        setProfile(prev => ({
          ...prev,
          ...editForm
        }));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FlagIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {error || 'Profile not found'}
            </h3>
            <button
              onClick={() => navigate('/discussions')}
              className="mt-4 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
            >
              Back to Discussions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Hero Section / Profile Header with Banner */}
      <div className="relative bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 dark:from-teal-800 dark:via-teal-700 dark:to-emerald-700">
        {/* Lisu Cultural Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* User Avatar */}
            <div className="relative">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={profile.username}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                  <span className="text-5xl md:text-6xl font-bold text-white">
                    {(profile.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/settings')}
                  className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Edit Profile Picture"
                >
                  <PencilIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              {!isEditing ? (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {profile.full_name || profile.username}
                  </h1>
                  <p className="text-xl text-teal-100 mb-3">@{profile.username}</p>

                  {profile.bio && (
                    <p className="text-white/90 max-w-2xl mb-4">
                      {profile.bio}
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-3 max-w-2xl">
                  <input
                    type="text"
                    name="full_name"
                    value={editForm.full_name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="w-full px-4 py-2 text-xl font-bold border-2 border-white/30 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleInputChange}
                    placeholder="Bio"
                    rows="2"
                    className="w-full px-4 py-2 border-2 border-white/30 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:ring-2 focus:ring-white focus:border-transparent resize-none"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/80 mt-3">
                {!isEditing ? (
                  <>
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        {profile.location}
                      </span>
                    )}
                    {profile.native_language && (
                      <span className="flex items-center gap-1">
                        <SparklesIcon className="w-4 h-4" />
                        {profile.native_language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      Joined {formatJoinDate(profile.created_at)}
                    </span>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleInputChange}
                      placeholder="Location"
                      className="px-3 py-1 border-2 border-white/30 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/60 text-sm focus:ring-2 focus:ring-white"
                    />
                    <input
                      type="text"
                      name="native_language"
                      value={editForm.native_language}
                      onChange={handleInputChange}
                      placeholder="Native Language"
                      className="px-3 py-1 border-2 border-white/30 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/60 text-sm focus:ring-2 focus:ring-white"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Profile Actions */}
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  {!isEditing ? (
                    <>
                      <button
                        onClick={handleEditToggle}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-md font-medium"
                      >
                        <PencilIcon className="w-5 h-5" />
                        Edit Profile
                      </button>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                      >
                        <CogIcon className="w-5 h-5" />
                        Settings
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md font-medium disabled:opacity-50"
                      >
                        <CheckIcon className="w-5 h-5" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleEditToggle}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                      >
                        <XMarkIcon className="w-5 h-5" />
                        Cancel
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-md font-medium">
                    <UserPlusIcon className="w-5 h-5" />
                    Follow
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors">
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    Message
                  </button>
                  <button
                    onClick={() => toast('Report functionality coming soon')}
                    className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                    title="Report User"
                  >
                    <FlagIcon className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {[
              { id: 'activity', label: 'Activity', icon: FireIcon },
              { id: 'discussions', label: 'Discussions', icon: ChatBubbleLeftRightIcon },
              { id: 'contributions', label: 'Contributions', icon: BookOpenIcon },
              { id: 'saved', label: 'Saved', icon: BookmarkIcon },
              { id: 'achievements', label: 'Achievements', icon: TrophyIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area - Dynamic Based on Active Tab */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Activity Tab - Two-Column Layout */}
        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Activity Feed (65%) */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FireIcon className="w-7 h-7 text-orange-500" />
                    Recent Activity
                  </h2>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activityFeed.length === 0 ? (
                    <div className="p-12 text-center">
                      <FireIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                      <p className="text-gray-600 dark:text-gray-400">
                        {isOwnProfile ? 'No recent activity yet. Start by joining a discussion!' : 'No recent activity'}
                      </p>
                    </div>
                  ) : (
                    activityFeed.map((activity, index) => (
                      <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                              <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 dark:text-white mb-1">
                              <span className="font-medium">{activity.action}</span>{' '}
                              <Link
                                to={`/discussions/${activity.id}`}
                                className="text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                              >
                                {activity.title}
                              </Link>
                            </p>
                            {activity.snippet && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {activity.snippet}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                              <ClockIcon className="w-4 h-4" />
                              {formatDate(activity.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Statistics & Highlights (35%) */}
            <div className="space-y-6">
              {/* At a Glance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  At a Glance
                </h3>

                <div className="space-y-4">
                  {/* Member Since */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {formatJoinDate(profile.created_at)}
                    </span>
                  </div>

                  {/* Total Discussions */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Discussions</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {stats?.discussion_count || stats?.total_discussions || 0}
                    </span>
                  </div>

                  {/* Total Replies */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ChatBubbleLeftIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Replies</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {stats?.chat_count || stats?.total_messages || 0}
                    </span>
                  </div>

                  {/* Words Contributed */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpenIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contributions</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {stats?.total_contributions || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Interests */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TagIcon className="w-5 h-5 text-teal-600" />
                  Top Interests
                </h3>

                <div className="space-y-3">
                  {['Language Learning', 'Grammar', 'Translation', 'Culture'].map((topic, index) => (
                    <div key={topic} className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${100 - index * 20}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[120px] text-right">
                        {topic}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5 text-teal-600" />
                  Community
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.followers || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.following || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discussions Tab */}
        {activeTab === 'discussions' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-7 h-7 text-teal-600" />
                {isOwnProfile ? 'My Discussions' : `${profile.username}'s Discussions`}
              </h2>
            </div>

            <div className="p-6">
              {discussions.length === 0 ? (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {isOwnProfile ? 'You haven\'t started any discussions yet' : 'No discussions yet'}
                  </p>
                  {isOwnProfile && (
                    <Link
                      to="/discussions"
                      className="inline-block px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
                    >
                      Start a Discussion
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {discussions.map(discussion => (
                    <Link
                      key={discussion.id}
                      to={`/discussions/${discussion.id}`}
                      className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 flex-1">
                          {discussion.title}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                          {formatDate(discussion.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {discussion.content?.replace(/<[^>]*>/g, '')}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          {discussion.answers_count || 0} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          {discussion.views_count || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <HeartIcon className="w-4 h-4" />
                          {discussion.likes_count || 0} likes
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contributions Tab */}
        {activeTab === 'contributions' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpenIcon className="w-7 h-7 text-teal-600" />
                {isOwnProfile ? 'My Contributions' : `${profile.username}'s Contributions`}
              </h2>
            </div>

            <div className="p-12 text-center">
              <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Dictionary contributions feature coming soon
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                This will show words and definitions {isOwnProfile ? "you've" : "they've"} contributed
              </p>
            </div>
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookmarkSolidIcon className="w-7 h-7 text-teal-600" />
                {isOwnProfile ? 'My Saved Items' : `${profile.username}'s Saved Items`}
              </h2>
            </div>

            <div className="p-12 text-center">
              <BookmarkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {isOwnProfile ? 'No saved items yet' : 'Saved items are private'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {isOwnProfile
                  ? 'Save discussions and dictionary entries to see them here'
                  : 'Only the user can see their saved items'
                }
              </p>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrophySolidIcon className="w-7 h-7 text-yellow-500" />
                {isOwnProfile ? 'My Achievements' : `${profile.username}'s Achievements`}
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Sample badges - would be dynamic in production */}
                {[
                  { name: 'First Post', icon: '📝', earned: discussions.length > 0, date: discussions[0]?.created_at },
                  { name: 'Top Contributor', icon: '⭐', earned: discussions.length >= 10, date: discussions[9]?.created_at },
                  { name: 'Grammar Expert', icon: '📚', earned: false },
                  { name: '100 Discussions', icon: '💯', earned: discussions.length >= 100 },
                  { name: 'Helpful Member', icon: '🤝', earned: discussions.length >= 5, date: discussions[4]?.created_at },
                  { name: 'Early Adopter', icon: '🚀', earned: true, date: profile.created_at }
                ].map((badge, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-lg border-2 text-center transition-all ${badge.earned
                      ? 'border-yellow-400 dark:border-yellow-600 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 opacity-50'
                      }`}
                  >
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                      {badge.name}
                    </h4>
                    {badge.earned && badge.date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                        <CheckCircleIcon className="w-3 h-3 text-green-500" />
                        {formatDate(badge.date)}
                      </p>
                    )}
                    {!badge.earned && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Not earned yet
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileEnhanced;
