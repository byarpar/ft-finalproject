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
  ArrowUpIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';
import { usersAPI, discussionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import HeroNavbar from '../components/Layout/HeroNavbar';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import { getTimeAgo } from '../utils/dateUtils';
import PageLayout from '../components/Layout/PageLayout';

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
  const [discussions, setDiscussions] = useState([]);
  const [savedDiscussions, setSavedDiscussions] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // Determine if viewing own profile
  const isOwnProfile = currentUser && (
    userId === currentUser.id ||
    username === currentUser.username ||
    username === 'me'
  );

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let targetUserId = userId;

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

      const profileResponse = await usersAPI.getUserProfile(targetUserId);
      if (profileResponse && profileResponse.data && profileResponse.data.user) {
        setProfile(profileResponse.data.user);
      }

      const statsResponse = await usersAPI.getUserStats(targetUserId);
      if (statsResponse && statsResponse.data) {
        setStats(statsResponse.data.stats || statsResponse.data);
      }

      const discussionsResponse = await discussionsAPI.getDiscussions({
        author_id: targetUserId,
        limit: 20
      });
      if (discussionsResponse?.data?.discussions) {
        setDiscussions(discussionsResponse.data.discussions);
      } else if (discussionsResponse?.discussions) {
        setDiscussions(discussionsResponse.discussions);
      }

    } catch (err) {
      console.error('Error fetching user profile:', err);

      if (err.response?.status === 404 || err.message?.includes('not found')) {
        setError('User not found');
        toast.error('This user does not exist or has been deleted');
      } else {
        setError('Failed to load user profile. Please try again.');
        toast.error('Failed to load profile');
      }
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
  }, [userId, username, currentUser, navigate, fetchUserProfile]);

  const fetchSavedDiscussions = useCallback(async () => {
    if (!isOwnProfile) return;

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

  useEffect(() => {
    if (activeTab === 'saved' && isOwnProfile && savedDiscussions.length === 0) {
      fetchSavedDiscussions();
    }
  }, [activeTab, isOwnProfile, savedDiscussions.length, fetchSavedDiscussions]);

  const formatJoinDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getUserBadges = () => {
    if (!stats) return [];

    const badges = [];
    const discussionCount = stats?.discussion_count || stats?.total_discussions || 0;
    const replyCount = stats?.reply_count || stats?.total_messages || 0;
    const contributionCount = stats?.total_contributions || 0;

    if (discussionCount >= 50) {
      badges.push({ icon: TrophyIcon, label: 'Discussion Master', color: 'text-yellow-600', bg: 'bg-yellow-50' });
    } else if (discussionCount >= 10) {
      badges.push({ icon: ChatBubbleLeftRightIcon, label: 'Active Contributor', color: 'text-teal-600', bg: 'bg-teal-50' });
    }

    if (replyCount >= 50) {
      badges.push({ icon: ChatBubbleLeftIcon, label: 'Helpful Member', color: 'text-blue-600', bg: 'bg-blue-50' });
    }

    if (contributionCount >= 10) {
      badges.push({ icon: BookOpenIcon, label: 'Dictionary Contributor', color: 'text-purple-600', bg: 'bg-purple-50' });
    }

    return badges;
  }; if (loading) {
    return (
      <PageLayout
        title="Loading Profile - Lisu Dictionary"
        description="Loading user profile"
      >
        <div className="min-h-screen bg-gray-50">
          <HeroNavbar />

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

          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex gap-6">
                <SkeletonLoader variant="text" count={1} className="h-12 w-32" />
                <SkeletonLoader variant="text" count={1} className="h-12 w-32" />
                <SkeletonLoader variant="text" count={1} className="h-12 w-32" />
              </div>
            </div>
          </div>

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
      <PageLayout
        title="User Not Found - Lisu Dictionary"
        description="This user could not be found"
      >
        <div className="min-h-screen bg-gray-50">
          <HeroNavbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                <FlagIcon className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {error === 'User not found' ? 'User Not Found' : 'Error Loading Profile'}
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {error === 'User not found'
                  ? 'This user does not exist or has been deleted.'
                  : error || 'Unable to load this profile. Please try again later.'}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => navigate('/discussions')}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                >
                  Browse Discussions
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={profile ? `${profile.full_name || profile.username} - Lisu Dictionary` : 'User Profile - Lisu Dictionary'}
      description={profile ? `View ${profile.full_name || profile.username}'s profile and activity on Lisu Dictionary` : 'User profile page'}
    >
      <div className="min-h-screen bg-gray-50">
        <HeroNavbar />

        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
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

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {profile.full_name || profile.username}
                  </h1>
                  {profile.role === 'admin' && (
                    <StarIcon className="w-6 h-6 md:w-7 md:h-7 text-red-500 flex-shrink-0" title="Verified Admin" />
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'activity' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <ClockIcon className="w-6 h-6 text-teal-600" />
                      Recent Activity
                    </h2>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {discussions.length === 0 ? (
                      <div className="p-12 text-center">
                        <ClockIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">
                          {isOwnProfile ? 'No recent activity yet. Start by joining a discussion!' : 'No recent activity'}
                        </p>
                      </div>
                    ) : (
                      discussions.slice(0, 10).map((discussion) => (
                        <div key={discussion.id} className="p-6 hover:bg-gray-50:bg-gray-700/50 transition-colors">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-teal-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 mb-1">
                                <span className="font-medium">Posted in</span>{' '}
                                <Link
                                  to={`/discussions/${discussion.id}`}
                                  className="text-teal-600 hover:underline font-semibold"
                                >
                                  {discussion.title}
                                </Link>
                              </p>
                              {discussion.content && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {discussion.content.substring(0, 100).replace(/<[^>]*>/g, '')}...
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <ClockIcon className="w-4 h-4" />
                                {getTimeAgo(discussion.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5 text-teal-600" />
                    Statistics
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Discussions</span>
                      <span className="text-lg font-bold text-teal-600">
                        {stats?.discussion_count || stats?.total_discussions || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Replies</span>
                      <span className="text-lg font-bold text-blue-600">
                        {stats?.reply_count || stats?.total_messages || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Contributions</span>
                      <span className="text-lg font-bold text-purple-600">
                        {stats?.total_contributions || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Reputation</span>
                      <span className="text-lg font-bold text-yellow-600">
                        {stats?.reputation || ((stats?.discussion_count || 0) * 5 + (stats?.reply_count || 0) * 2) || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {getUserBadges().length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrophyIcon className="w-5 h-5 text-yellow-600" />
                      Achievements
                    </h3>
                    <div className="space-y-2">
                      {getUserBadges().map((badge, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-3 ${badge.bg} rounded-lg`}
                        >
                          <badge.icon className={`w-5 h-5 ${badge.color}`} />
                          <span className={`text-sm font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
