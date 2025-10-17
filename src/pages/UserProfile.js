import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  PencilIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  MapPinIcon,
  FlagIcon,
  BookmarkIcon,
  EyeIcon,
  HeartIcon,
  ClockIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';
import { usersAPI, discussionsAPI } from '../services/api';
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
  const [activeTab, setActiveTab] = useState('activity');

  // Tab-specific data
  const [activityFeed, setActivityFeed] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [savedDiscussions, setSavedDiscussions] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);

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

  // Fetch saved discussions when tab is active
  const fetchSavedDiscussions = useCallback(async () => {
    if (!isOwnProfile) return; // Only fetch saved items for own profile

    try {
      setSavedLoading(true);
      const response = await discussionsAPI.getSavedDiscussions({ limit: 50 });
      if (response && response.data && response.data.discussions) {
        setSavedDiscussions(response.data.discussions);
      }
    } catch (error) {
      console.error('Error fetching saved discussions:', error);
      toast.error('Failed to load saved discussions');
    } finally {
      setSavedLoading(false);
    }
  }, [isOwnProfile]);

  // Fetch saved discussions when saved tab is clicked
  useEffect(() => {
    if (activeTab === 'saved' && isOwnProfile && savedDiscussions.length === 0) {
      fetchSavedDiscussions();
    }
  }, [activeTab, isOwnProfile, savedDiscussions.length, fetchSavedDiscussions]);

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
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* User Avatar */}
            <div className="relative">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={profile.username}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    console.log('Image failed to load:', profile.profile_photo_url);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center"
                style={{ display: profile.profile_photo_url ? 'none' : 'flex' }}
              >
                <span className="text-4xl md:text-5xl font-bold text-white">
                  {(profile.username || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {profile.full_name || profile.username}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">@{profile.username}</p>

              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 max-w-2xl mb-3">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
                {profile.native_language && (
                  <span className="flex items-center gap-1">
                    {profile.native_language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  Joined {formatJoinDate(profile.created_at)}
                </span>
              </div>
            </div>

            {/* Profile Actions */}
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 font-medium"
                >
                  <PencilIcon className="w-5 h-5" />
                  Edit Profile
                </Link>
              ) : (
                <button
                  onClick={() => toast('Report functionality coming soon')}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
                  title="Report User"
                >
                  <FlagIcon className="w-5 h-5" />
                  Report
                </button>
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
              { id: 'activity', label: 'Activity', icon: ClockIcon },
              { id: 'discussions', label: 'Discussions', icon: ChatBubbleLeftRightIcon },
              { id: 'contributions', label: 'Contributions', icon: BookOpenIcon },
              ...(isOwnProfile ? [{ id: 'saved', label: 'Saved', icon: BookmarkIcon }] : [])
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
            {/* Left Column: Activity Feed */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ClockIcon className="w-6 h-6 text-teal-600" />
                    Recent Activity
                  </h2>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activityFeed.length === 0 ? (
                    <div className="p-12 text-center">
                      <ClockIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                      <p className="text-gray-600 dark:text-gray-400">
                        {isOwnProfile ? 'No recent activity yet. Start by joining a discussion!' : 'No recent activity'}
                      </p>
                    </div>
                  ) : (
                    activityFeed.map((activity, index) => (
                      <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                              <ChatBubbleLeftRightIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
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

            {/* Right Column: Statistics */}
            <div className="space-y-6">
              {/* Statistics Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Statistics
                </h3>

                <div className="space-y-3">
                  {/* Member Since */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {formatJoinDate(profile.created_at)}
                    </span>
                  </div>

                  {/* Total Discussions */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Discussions</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats?.discussion_count || stats?.total_discussions || 0}
                    </span>
                  </div>

                  {/* Total Replies */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ChatBubbleLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Replies</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats?.chat_count || stats?.total_messages || 0}
                    </span>
                  </div>

                  {/* Words Contributed */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpenIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contributions</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats?.total_contributions || 0}
                    </span>
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
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-teal-600" />
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
                <BookOpenIcon className="w-6 h-6 text-teal-600" />
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
                <BookmarkSolidIcon className="w-6 h-6 text-teal-600" />
                {isOwnProfile ? 'My Saved Items' : `${profile.username}'s Saved Items`}
              </h2>
            </div>

            {!isOwnProfile ? (
              <div className="p-12 text-center">
                <BookmarkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Saved items are private
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Only the user can see their saved items
                </p>
              </div>
            ) : savedLoading ? (
              <div className="p-12 text-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading saved items...</p>
              </div>
            ) : savedDiscussions.length === 0 ? (
              <div className="p-12 text-center">
                <BookmarkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  No saved items yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Save discussions to see them here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {savedDiscussions.map((discussion) => (
                  <Link
                    key={discussion.id}
                    to={`/discussions/${discussion.id}`}
                    className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <BookmarkSolidIcon className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-teal-600 dark:hover:text-teal-400">
                          {discussion.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            {discussion.answer_count || 0} answers
                          </span>
                          <span className="flex items-center gap-1">
                            <HeartIcon className="w-4 h-4" />
                            {discussion.likes_count || 0} likes
                          </span>
                          <span className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            {discussion.views || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            Saved {formatDate(discussion.saved_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileEnhanced;
