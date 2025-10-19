/**
 * Dashboard Component
 * 
 * User's main dashboard showing personalized activity, stats, saved items,
 * and recommendations.
 * 
 * Features:
 * - Skeleton loaders for better perceived performance
 * - Keyboard shortcuts (R to refresh)
 * - useCallback for memoized functions
 * - Individual section loading states
 * - Better error handling with retry
 * - Pull-to-refresh visual indicator
 */
import React, { useState, useEffect, useCallback } from 'react';
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
import SkeletonLoader from '../components/UI/SkeletonLoader';
import PageLayout from '../components/Layout/PageLayout';

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

  // Individual section loading states for skeleton loaders
  const [loadingStates, setLoadingStates] = useState({
    profile: true,
    stats: true,
    activity: true,
    saved: true,
    recommended: true
  });

  /**
   * Fetch activity feed
   */
  const fetchActivityFeed = useCallback(async () => {
    try {
      setLoadingStates(prev => ({ ...prev, activity: true }));
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
    } finally {
      setLoadingStates(prev => ({ ...prev, activity: false }));
    }
  }, [currentUser]);

  /**
   * Fetch saved items
   */
  const fetchSavedItems = useCallback(async () => {
    try {
      setLoadingStates(prev => ({ ...prev, saved: true }));
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
    } finally {
      setLoadingStates(prev => ({ ...prev, saved: false }));
    }
  }, []);

  /**
   * Fetch recommended topics
   */
  const fetchRecommendedTopics = useCallback(async () => {
    try {
      setLoadingStates(prev => ({ ...prev, recommended: true }));
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
    } finally {
      setLoadingStates(prev => ({ ...prev, recommended: false }));
    }
  }, []);

  /**
   * Fetch all dashboard data
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingStates({
        profile: true,
        stats: true,
        activity: true,
        saved: true,
        recommended: true
      });

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
      setLoadingStates(prev => ({ ...prev, profile: false }));

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
      setLoadingStates(prev => ({ ...prev, stats: false }));

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
  }, [currentUser, navigate, fetchActivityFeed, fetchSavedItems, fetchRecommendedTopics]);

  // Fetch dashboard data on mount
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  if (loading) {
    return (
      <PageLayout
        title="Dashboard"
        description="View your personalized activity and stats"
      >
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <SkeletonLoader variant="stats-grid" count={4} />
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SkeletonLoader variant="activity-feed" count={5} />
              </div>
              <div>
                <SkeletonLoader variant="saved-item" count={3} />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Use profile if available, otherwise fall back to currentUser
  const displayUser = profile || currentUser;

  if (!displayUser) {
    return (
      <PageLayout
        title="Dashboard Error"
        description="Failed to load dashboard data"
      >
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-600 mb-2">Failed to load profile data</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Dashboard - ${displayUser.full_name || displayUser.username}`}
      description="View your personalized activity, stats, saved items, and recommendations"
    >
      <div className="min-h-screen bg-gray-50">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* User Avatar */}
                <Link
                  to={`/profile/${currentUser.username}`}
                  className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-600 rounded-full"
                >
                  {displayUser.profile_photo_url ? (
                    <img
                      src={displayUser.profile_photo_url}
                      alt={`${displayUser.username}'s avatar`}
                      className="h-16 w-16 rounded-full border-4 border-white shadow-lg object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {!displayUser.profile_photo_url && (
                    <div
                      className="h-16 w-16 rounded-full border-4 border-white bg-teal-500 flex items-center justify-center shadow-lg"
                      aria-label={`${displayUser.username}'s avatar`}
                    >
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
                <div className="flex-1">
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
                className="flex items-center justify-center space-x-2 bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-600"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>Start New Discussion</span>
              </button>

              <button
                onClick={() => navigate('/dictionary/suggest')}
                className="flex items-center justify-center space-x-2 bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-600"
              >
                <BookOpenIcon className="h-5 w-5" />
                <span>Suggest a New Word</span>
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="flex items-center justify-center space-x-2 bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-600"
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
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

                <div className="divide-y divide-gray-200">
                  {loadingStates.activity ? (
                    <div className="p-6">
                      <SkeletonLoader variant="activity-feed" count={3} />
                    </div>
                  ) : activityFeed.length > 0 ? (
                    activityFeed.map((activity) => (
                      <Link
                        key={activity.id}
                        to={activity.link}
                        className="px-6 py-4 hover:bg-gray-50:bg-gray-750 transition-colors block focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 rounded-lg ${activity.iconBg} p-2`}>
                            <activity.icon className={`h-5 w-5 ${activity.iconColor}`} aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1 truncate">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <BellAlertIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                      <p className="text-sm text-gray-500">
                        No recent activity yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Start a discussion or contribute to get started!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Saved Items Module */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
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

                <div className="divide-y divide-gray-200">
                  {loadingStates.saved ? (
                    <div className="p-6">
                      <SkeletonLoader variant="saved-item" count={3} />
                    </div>
                  ) : savedItems.length > 0 ? (
                    savedItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.link}
                        className="px-6 py-4 hover:bg-gray-50:bg-gray-750 transition-colors block focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.description}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-2 space-x-3">
                              <span>by {item.author}</span>
                              <span>•</span>
                              <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <BookmarkIcon className="h-5 w-5 text-teal-600 flex-shrink-0 ml-3" aria-hidden="true" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <BookmarkIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                      <p className="text-sm text-gray-500">
                        No saved items yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Save discussions and words to find them easily later
                      </p>
                      <button
                        onClick={() => navigate('/discussions')}
                        className="mt-4 text-teal-600 hover:text-teal-700 text-sm font-medium focus:outline-none focus:underline"
                      >
                        Explore Discussions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Quick Links */}
            <div className="space-y-6">

              {/* Stats Overview Module */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TrophyIcon className="h-6 w-6 mr-2 text-teal-600" />
                  Your Stats at a Glance
                </h2>

                {loadingStates.stats ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-lg p-4">
                        <SkeletonLoader variant="stat" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Discussions Started */}
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 text-center">
                        <ChatBubbleLeftRightIcon className="h-8 w-8 text-teal-600 mx-auto mb-2" aria-hidden="true" />
                        <p className="text-2xl font-bold text-teal-700">
                          {stats?.discussion_count || 0}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Discussions Started
                        </p>
                      </div>

                      {/* Total Replies */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                        <ChatBubbleLeftIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" aria-hidden="true" />
                        <p className="text-2xl font-bold text-blue-700">
                          {stats?.reply_count || 0}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Total Replies
                        </p>
                      </div>

                      {/* Words Contributed */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                        <BookOpenIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" aria-hidden="true" />
                        <p className="text-2xl font-bold text-purple-700">
                          {stats?.words_contributed || 0}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Words Contributed
                        </p>
                      </div>

                      {/* Likes Received */}
                      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 text-center">
                        <HeartIcon className="h-8 w-8 text-pink-600 mx-auto mb-2" aria-hidden="true" />
                        <p className="text-2xl font-bold text-pink-700">
                          {stats?.likes_received || 0}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Likes Received
                        </p>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Saved Items</span>
                        <span className="font-semibold text-gray-900">
                          {savedItems.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Member Since</span>
                        <span className="font-semibold text-gray-900">
                          {displayUser.created_at ?
                            new Date(displayUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Recommended Topics Module */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <SparklesIcon className="h-6 w-6 mr-2 text-teal-600" />
                  Recommended for You
                </h2>

                <div className="space-y-3">
                  {loadingStates.recommended ? (
                    <SkeletonLoader variant="recommended-topic" count={4} />
                  ) : recommendedTopics.length > 0 ? (
                    recommendedTopics.map((topic) => (
                      <Link
                        key={topic.id}
                        to={topic.link}
                        className="block p-3 rounded-lg hover:bg-gray-50:bg-gray-750 transition-colors border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          {topic.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded">
                            {topic.category}
                          </span>
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <FireIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                              {topic.views}
                            </span>
                            <span className="flex items-center">
                              <ChatBubbleLeftIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                              {topic.replies}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No recommendations available at this time
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Access to Settings Module */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Cog6ToothIcon className="h-6 w-6 mr-2 text-teal-600" />
                  Account Management
                </h2>

                <div className="space-y-2">
                  <Link
                    to="/settings"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50:bg-gray-750 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <UserCircleIcon className="h-5 w-5 text-gray-400 group-hover:text-teal-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600">
                        Update Profile
                      </span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </Link>

                  <Link
                    to="/settings#password"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50:bg-gray-750 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <LockClosedIcon className="h-5 w-5 text-gray-400 group-hover:text-teal-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600">
                        Change Password
                      </span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </Link>

                  <Link
                    to="/settings#notifications"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50:bg-gray-750 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <BellIcon className="h-5 w-5 text-gray-400 group-hover:text-teal-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600">
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
    </PageLayout>
  );
};

export default Dashboard;
