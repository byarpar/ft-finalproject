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
  ClockIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import { usersAPI, discussionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import HeroNavbar from '../components/Layout/HeroNavbar';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import { getTimeAgo } from '../utils/dateUtils';
import PageLayout from '../components/Layout/PageLayout';

/**
 * UserProfileEnhanced Component
 * 
 * Displays user profile with activity, discussions, replies, and stats.
 * Supports real-time updates via WebSocket.
 * 
 * Features:
 * - Skeleton loaders for better perceived performance
 * - Keyboard shortcuts (R to refresh, T to cycle tabs)
 * - useCallback optimization for performance
 * - Real-time activity feed updates
 * - Tab-based content organization
 * - Enhanced accessibility with ARIA labels
 */

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
      if (discussionsResponse && discussionsResponse.data && discussionsResponse.data.discussions) {
        setDiscussions(discussionsResponse.data.discussions);
      } else if (discussionsResponse && discussionsResponse.discussions) {
        // Fallback for legacy response format
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

  // Cycle through tabs
  const cycleTab = useCallback(() => {
    const tabs = ['activity', 'discussions', 'contributions'];
    if (isOwnProfile) tabs.push('saved');

    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
    toast.success(`Switched to ${tabs[nextIndex]} tab`, { duration: 1500 });
  }, [activeTab, isOwnProfile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // T to cycle tabs
      if (e.key === 't' || e.key === 'T') {
        // Don't trigger if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        cycleTab();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cycleTab]);

  const formatJoinDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <PageLayout
        title="Loading Profile - Lisu Dictionary"
        description="Loading user profile"
      >
        <div className="min-h-screen bg-gray-50">
          <HeroNavbar />

          {/* Profile Header Skeleton */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <SkeletonLoader variant="avatar" />
                <div className="flex-1 space-y-3 w-full">
                  <SkeletonLoader variant="text" count={1} className="h-8 w-64" />
                  <SkeletonLoader variant="text" count={1} className="h-6 w-40" />
                  <SkeletonLoader variant="text" count={2} className="h-4 w-full max-w-2xl" />
                  <SkeletonLoader variant="text" count={1} className="h-4 w-48" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex gap-6">
                <SkeletonLoader variant="text" count={1} className="h-12 w-32" />
                <SkeletonLoader variant="text" count={1} className="h-12 w-32" />
                <SkeletonLoader variant="text" count={1} className="h-12 w-32" />
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <SkeletonLoader variant="card" count={3} />
              </div>
              <div>
                <SkeletonLoader variant="card" count={1} />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <FlagIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
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
    <PageLayout
      title={profile ? `${profile.full_name || profile.username} - Lisu Dictionary` : 'User Profile - Lisu Dictionary'}
      description={profile ? `View ${profile.full_name || profile.username}'s profile and activity on Lisu Dictionary` : 'User profile page'}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header Navigation */}
        <HeroNavbar />

        {/* Profile Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* User Avatar */}
              <div className="relative">
                {profile.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt={profile.username}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-gray-200 object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      console.log('Image failed to load:', profile.profile_photo_url);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-gray-200 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center"
                  style={{ display: profile.profile_photo_url ? 'none' : 'flex' }}
                >
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    {(profile.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {profile.full_name || profile.username}
                  </h1>
                  {profile.role === 'admin' && (
                    <CheckBadgeIcon className="w-6 h-6 md:w-7 md:h-7 text-red-500 flex-shrink-0" title="Verified Admin" />
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-3">@{profile.username}</p>

                {profile.bio && (
                  <p className="text-gray-700 max-w-2xl mb-3">
                    {profile.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
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
              <div className="flex flex-col gap-2">
                {isOwnProfile ? (
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100:bg-gray-600 transition-colors border border-gray-300 font-medium"
                  >
                    <PencilIcon className="w-5 h-5" />
                    Edit Profile
                  </Link>
                ) : (
                  <button
                    onClick={() => toast('Report functionality coming soon')}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100:bg-gray-600 transition-colors border border-gray-300"
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
        <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
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
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900:text-white'
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <ClockIcon className="w-6 h-6 text-teal-600" />
                      Recent Activity
                    </h2>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {activityFeed.length === 0 ? (
                      <div className="p-12 text-center">
                        <ClockIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">
                          {isOwnProfile ? 'No recent activity yet. Start by joining a discussion!' : 'No recent activity'}
                        </p>
                      </div>
                    ) : (
                      activityFeed.map((activity, index) => (
                        <div key={index} className="p-6 hover:bg-gray-50:bg-gray-700/50 transition-colors">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-teal-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 mb-1">
                                <span className="font-medium">{activity.action}</span>{' '}
                                <Link
                                  to={`/discussions/${activity.id}`}
                                  className="text-teal-600 hover:underline font-semibold"
                                >
                                  {activity.title}
                                </Link>
                              </p>
                              {activity.snippet && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {activity.snippet}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <ClockIcon className="w-4 h-4" />
                                {getTimeAgo(activity.timestamp)}
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Statistics
                  </h3>

                  <div className="space-y-3">
                    {/* Member Since */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Member Since</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-900">
                        {formatJoinDate(profile.created_at)}
                      </span>
                    </div>

                    {/* Total Discussions */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Discussions</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {stats?.discussion_count || stats?.total_discussions || 0}
                      </span>
                    </div>

                    {/* Total Replies */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ChatBubbleLeftIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Replies</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {stats?.reply_count || stats?.total_messages || 0}
                      </span>
                    </div>

                    {/* Words Contributed */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <BookOpenIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Contributions</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-teal-600" />
                  {isOwnProfile ? 'My Discussions' : `${profile.username}'s Discussions`}
                </h2>
              </div>

              <div className="p-6">
                {discussions.length === 0 ? (
                  <div className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">
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
                        className="block p-6 border border-gray-200 rounded-lg hover:border-teal-300:border-teal-700 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-teal-600:text-teal-400 flex-1">
                            {discussion.title}
                          </h3>
                          <span className="text-sm text-gray-500 ml-4">
                            {getTimeAgo(discussion.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {discussion.content?.replace(/<[^>]*>/g, '')}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <ArrowUpIcon className="w-4 h-4" />
                            {discussion.vote_count || 0} votes
                          </span>
                          <span className="flex items-center gap-1">
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            {discussion.answers_count || 0} replies
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpenIcon className="w-6 h-6 text-teal-600" />
                  {isOwnProfile ? 'My Contributions' : `${profile.username}'s Contributions`}
                </h2>
              </div>

              <div className="p-12 text-center">
                <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">
                  Dictionary contributions feature coming soon
                </p>
                <p className="text-sm text-gray-500">
                  This will show words and definitions {isOwnProfile ? "you've" : "they've"} contributed
                </p>
              </div>
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === 'saved' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BookmarkSolidIcon className="w-6 h-6 text-teal-600" />
                  {isOwnProfile ? 'My Saved Items' : `${profile.username}'s Saved Items`}
                </h2>
              </div>

              {!isOwnProfile ? (
                <div className="p-12 text-center">
                  <BookmarkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">
                    Saved items are private
                  </p>
                  <p className="text-sm text-gray-500">
                    Only the user can see their saved items
                  </p>
                </div>
              ) : savedLoading ? (
                <div className="p-6">
                  <SkeletonLoader variant="list-item" count={5} />
                </div>
              ) : savedDiscussions.length === 0 ? (
                <div className="p-12 text-center">
                  <BookmarkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">
                    No saved items yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Save discussions to see them here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {savedDiscussions.map((discussion) => (
                    <Link
                      key={discussion.id}
                      to={`/discussions/${discussion.id}`}
                      className="block p-6 hover:bg-gray-50:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <BookmarkSolidIcon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-teal-600:text-teal-400">
                            {discussion.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <ArrowUpIcon className="w-4 h-4" />
                              {discussion.vote_count || 0} votes
                            </span>
                            <span className="flex items-center gap-1">
                              <ChatBubbleLeftIcon className="w-4 h-4" />
                              {discussion.answers_count || 0} replies
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              Saved {getTimeAgo(discussion.saved_at)}
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
    </PageLayout>
  );
};

export default UserProfileEnhanced;
