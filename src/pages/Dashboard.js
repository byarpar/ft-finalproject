import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  BookmarkIcon,
  BellIcon,
  TrophyIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ExclamationCircleIcon,
  ClockIcon,
  FireIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  BellAlertIcon,
  SparklesIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, discussionsAPI, usersAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [recommendedTopics, setRecommendedTopics] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch profile data
      console.log('Fetching profile data...');
      const profileResponse = await authAPI.getProfile();
      console.log('Profile response:', profileResponse);

      // Handle different response structures
      let userData;
      if (profileResponse.data && profileResponse.data.user) {
        // Response format: { success: true, data: { user: {...} } }
        userData = profileResponse.data.user;
      } else if (profileResponse.user) {
        // Response format: { success: true, user: {...} }
        userData = profileResponse.user;
      } else {
        console.error('Unexpected profile response structure:', profileResponse);
        throw new Error('Invalid profile response structure');
      }

      setProfile(userData);

      // Fetch user stats
      try {
        console.log('Fetching user stats...');
        const statsResponse = await usersAPI.getUserStats(currentUser.id);
        console.log('Stats response:', statsResponse);

        // Handle different response structures
        let statsData;
        if (statsResponse.data && statsResponse.data.stats) {
          statsData = statsResponse.data.stats;
        } else if (statsResponse.stats) {
          statsData = statsResponse.stats;
        } else if (statsResponse.data) {
          statsData = statsResponse.data;
        } else {
          statsData = statsResponse;
        }

        setStats(statsData || {
          discussion_count: 0,
          reply_count: 0,
          words_contributed: 0,
          likes_received: 0
        });
      } catch (statsError) {
        console.warn('Error fetching stats:', statsError);
        // Continue without stats
        setStats({
          discussion_count: 0,
          reply_count: 0,
          words_contributed: 0,
          likes_received: 0
        });
      }

      // Fetch recent activity
      await fetchActivityFeed();

      // Fetch saved discussions
      await fetchSavedItems();

      // Fetch recommended topics
      await fetchRecommendedTopics();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to load dashboard data: ${error.response?.data?.message || error.message}`);

      // If it's an auth error, redirect to login
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityFeed = async () => {
    try {
      // Fetch user's recent discussions
      const discussionsResponse = await discussionsAPI.getDiscussions({
        author_id: currentUser.id,
        limit: 5,
        sort_by: 'updated_at'
      });

      if (discussionsResponse && discussionsResponse.discussions) {
        // Transform to activity feed format
        const activities = discussionsResponse.discussions.map(discussion => ({
          id: discussion.id,
          type: 'discussion',
          title: `You started "${discussion.title}"`,
          description: discussion.content?.substring(0, 100) + '...' || 'No description',
          timestamp: discussion.created_at,
          link: `/discussions/${discussion.id}`,
          icon: ChatBubbleLeftIcon,
          iconColor: 'text-teal-600',
          iconBg: 'bg-teal-100'
        }));

        setActivityFeed(activities);
      } else {
        setActivityFeed([]);
      }
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      setActivityFeed([]);
    }
  };

  const fetchSavedItems = async () => {
    try {
      // Fetch saved discussions using the correct endpoint
      const response = await discussionsAPI.getDiscussions({
        saved: true,
        limit: 5
      });

      if (response && response.discussions) {
        const items = response.discussions.map(discussion => ({
          id: discussion.id,
          type: 'discussion',
          title: discussion.title,
          description: discussion.content?.substring(0, 80) + '...' || 'No description',
          link: `/discussions/${discussion.id}`,
          author: discussion.author?.username || 'Unknown',
          timestamp: discussion.created_at
        }));

        setSavedItems(items);
      } else {
        setSavedItems([]);
      }
    } catch (error) {
      console.error('Error fetching saved items:', error);
      setSavedItems([]);
    }
  };

  const fetchRecommendedTopics = async () => {
    try {
      const response = await discussionsAPI.getDiscussions({
        limit: 4,
        sort_by: 'views'
      });

      if (response && response.discussions) {
        const topics = response.discussions.map(discussion => ({
          id: discussion.id,
          title: discussion.title,
          category: typeof discussion.category === 'object' && discussion.category?.name
            ? discussion.category.name
            : (discussion.category || 'General'),
          views: discussion.view_count || 0,
          replies: discussion.answer_count || 0,
          link: `/discussions/${discussion.id}`
        }));

        setRecommendedTopics(topics);
      } else {
        setRecommendedTopics([]);
      }
    } catch (error) {
      console.error('Error fetching recommended topics:', error);
      setRecommendedTopics([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Use profile if available, otherwise fall back to currentUser
  const displayUser = profile || currentUser;

  if (!displayUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">Failed to load profile data</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <Link to={`/profile/${currentUser.username}`} className="flex-shrink-0">
                {displayUser.profile_photo_url ? (
                  <img
                    src={displayUser.profile_photo_url}
                    alt={displayUser.username}
                    className="h-16 w-16 rounded-full border-4 border-white shadow-lg object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!displayUser.profile_photo_url && (
                  <div className="h-16 w-16 rounded-full border-4 border-white bg-teal-500 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {displayUser.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {displayUser.profile_photo_url && (
                  <div className="h-16 w-16 rounded-full border-4 border-white bg-teal-500 flex items-center justify-center shadow-lg" style={{ display: 'none' }}>
                    <span className="text-2xl font-bold text-white">
                      {displayUser.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </Link>

              {/* Welcome Message */}
              <div>
                <h1 className="text-3xl font-bold">
                  Welcome back, {displayUser.full_name || displayUser.username}!
                </h1>
                <p className="text-teal-100 mt-1">
                  Here's a quick overview of your activity and contributions.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/discussions/new')}
              className="flex items-center justify-center space-x-2 bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors shadow-md"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <span>Start New Discussion</span>
            </button>

            <button
              onClick={() => navigate('/dictionary/suggest')}
              className="flex items-center justify-center space-x-2 bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors shadow-md"
            >
              <BookOpenIcon className="h-5 w-5" />
              <span>Suggest a New Word</span>
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="flex items-center justify-center space-x-2 bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors shadow-md"
            >
              <PencilSquareIcon className="h-5 w-5" />
              <span>Edit My Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Activity Feed */}
          <div className="lg:col-span-2 space-y-6">

            {/* Activity Feed Module */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <BellIcon className="h-6 w-6 mr-2 text-teal-600" />
                    Recent Activity
                  </h2>
                  <Link
                    to={`/profile/${currentUser.username}?tab=activity`}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {activityFeed.length > 0 ? (
                  activityFeed.map((activity) => (
                    <Link
                      key={activity.id}
                      to={activity.link}
                      className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors block"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 rounded-full p-2 ${activity.iconBg}`}>
                          <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <BellAlertIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                    <button
                      onClick={() => navigate('/discussions')}
                      className="mt-4 text-teal-600 hover:text-teal-700 text-sm font-medium"
                    >
                      Explore Discussions
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Items Module */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <BookmarkIcon className="h-6 w-6 mr-2 text-teal-600" />
                    My Saved Words & Threads
                  </h2>
                  <Link
                    to={`/profile/${currentUser.username}?tab=saved`}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {savedItems.length > 0 ? (
                  savedItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.link}
                      className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors block"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.description}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-2 space-x-3">
                            <span>by {item.author}</span>
                            <span>•</span>
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <BookmarkIcon className="h-5 w-5 text-teal-600 flex-shrink-0 ml-3" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <BookmarkIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No saved items yet</p>
                    <button
                      onClick={() => navigate('/discussions')}
                      className="mt-4 text-teal-600 hover:text-teal-700 text-sm font-medium"
                    >
                      Start Saving
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Quick Links */}
          <div className="space-y-6">

            {/* Stats Overview Module */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrophyIcon className="h-6 w-6 mr-2 text-teal-600" />
                Your Stats at a Glance
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Discussions Started */}
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg p-4 text-center">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                    {stats?.discussion_count || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Discussions Started
                  </p>
                </div>

                {/* Total Replies */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 text-center">
                  <ChatBubbleLeftIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {stats?.reply_count || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Total Replies
                  </p>
                </div>

                {/* Words Contributed */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 text-center">
                  <BookOpenIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {stats?.words_contributed || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Words Contributed
                  </p>
                </div>

                {/* Likes Received */}
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-4 text-center">
                  <HeartIcon className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-pink-700 dark:text-pink-400">
                    {stats?.likes_received || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Likes Received
                  </p>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Saved Items</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {savedItems.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {displayUser.created_at ?
                      new Date(displayUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Recommended Topics Module */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <SparklesIcon className="h-6 w-6 mr-2 text-teal-600" />
                Recommended for You
              </h2>

              <div className="space-y-3">
                {recommendedTopics.length > 0 ? (
                  recommendedTopics.map((topic) => (
                    <Link
                      key={topic.id}
                      to={topic.link}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {topic.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded">
                          {topic.category}
                        </span>
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <FireIcon className="h-3 w-3 mr-1" />
                            {topic.views}
                          </span>
                          <span className="flex items-center">
                            <ChatBubbleLeftIcon className="h-3 w-3 mr-1" />
                            {topic.replies}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No recommendations available
                  </p>
                )}
              </div>
            </div>

            {/* Quick Access to Settings Module */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Cog6ToothIcon className="h-6 w-6 mr-2 text-teal-600" />
                Account Management
              </h2>

              <div className="space-y-2">
                <Link
                  to="/settings"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="h-5 w-5 text-gray-400 group-hover:text-teal-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-teal-600">
                      Update Profile
                    </span>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>

                <Link
                  to="/settings#password"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 group-hover:text-teal-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-teal-600">
                      Change Password
                    </span>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>

                <Link
                  to="/settings#notifications"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <BellIcon className="h-5 w-5 text-gray-400 group-hover:text-teal-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-teal-600">
                      Manage Notifications
                    </span>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
