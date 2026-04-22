import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ClockIcon, ChatBubbleLeftRightIcon, BookOpenIcon, BookmarkIcon,
  PencilIcon, PlusIcon, HandThumbUpIcon, HandThumbDownIcon, StarIcon, UserPlusIcon,
  ChatBubbleLeftIcon, QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { PageLayout } from '../components/LayoutComponents';
import { usersAPI, discussionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getTimeAgo } from '../utils/dateUtils';

const TABS = {
  ACTIVITY: 'activity',
  DISCUSSIONS: 'discussions',
  CONTRIBUTIONS: 'contributions',
  SAVED: 'saved'
};



const UserProfile = () => {
  const { userId, username } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const profileIdentifier = userId || username;
  const isOwnProfile = user?.id?.toString() === userId || user?.username === username;

  // State
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [discussions, setDiscussions] = useState([]);
  const [savedDiscussions, setSavedDiscussions] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.ACTIVITY);
  const [loading, setLoading] = useState({ profile: true, content: false });
  const [followLoading, setFollowLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Computed stats
  const stats = {
    discussions: userStats?.statistics?.discussionsStarted ?? discussions.length,
    answers: userStats?.statistics?.answersPosted ?? discussions.reduce((sum, d) => sum + (d.answers_count || 0), 0),
    upvotedPosts: userStats?.statistics?.upvotedDiscussions ?? 0,
    downvotedPosts: userStats?.statistics?.downvotedDiscussions ?? 0,
    upvotedAnswers: userStats?.statistics?.upvotedAnswers ?? 0,
    downvotedAnswers: userStats?.statistics?.downvotedAnswers ?? 0
  };

  // Data fetching
  const fetchProfile = useCallback(async () => {
    setLoading(prev => ({ ...prev, profile: true }));
    setImageLoaded(false);
    try {
      const response = await usersAPI.getUserProfile(profileIdentifier);
      const profileData = response.data?.user || response.user || response;
      setProfile(profileData);

      if (!profileData?.id) return;

      const promises = [
        usersAPI.getUserFollowers(profileData.id),
        usersAPI.getUserFollowing(profileData.id),
        discussionsAPI.getDiscussions({ author_id: profileData.id, limit: 20 }),
        usersAPI.getUserStats(profileData.id)
      ];

      if (user && !isOwnProfile) {
        promises.push(usersAPI.getFollowInfo(profileData.id));
      }

      const results = await Promise.allSettled(promises);

      if (results[0].status === 'fulfilled') {
        const followers = results[0].value.data?.followers || results[0].value.followers || [];
        setFollowersCount(followers.length);
      }

      if (results[1].status === 'fulfilled') {
        const following = results[1].value.data?.following || results[1].value.following || [];
        setFollowingCount(following.length);
      }

      if (results[2].status === 'fulfilled') {
        const discussionsData = results[2].value.discussions || results[2].value.data?.discussions || [];
        setDiscussions(discussionsData);
      }

      if (results[3].status === 'fulfilled') {
        const statsData = results[3].value.data || results[3].value;
        setUserStats(statsData);
      } else if (results[3].status === 'rejected') {
        console.error('Failed to fetch user stats:', results[3].reason);
        // Set empty stats object to avoid undefined errors
        setUserStats({
          statistics: {
            upvotedDiscussions: 0,
            downvotedDiscussions: 0,
            upvotedAnswers: 0,
            downvotedAnswers: 0,
            reputation: 0
          }
        });
      }

      if (results[4]?.status === 'fulfilled') {
        const followData = results[4].value.data || results[4].value;
        setIsFollowing(followData.isFollowing || followData.is_following || false);
      }
    } catch (error) {
      if (error.response?.status === 404) setProfile(false);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, [profileIdentifier, user, isOwnProfile]);

  const fetchContent = useCallback(async (tab) => {
    if (!isOwnProfile && tab === TABS.SAVED) return;

    setLoading(prev => ({ ...prev, content: true }));
    try {
      if (tab === TABS.SAVED) {
        const res = await discussionsAPI.getSavedDiscussions({ limit: 20 });
        setSavedDiscussions(res.discussions || res.data?.discussions || []);
      }
    } catch {
      if (tab === TABS.SAVED) setSavedDiscussions([]);
    } finally {
      setLoading(prev => ({ ...prev, content: false }));
    }
  }, [isOwnProfile]);

  // Handlers
  const handleFollow = async () => {
    if (followLoading || !profile?.id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await usersAPI.unfollowUser(profile.id);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await usersAPI.followUser(profile.id);
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setFollowLoading(false);
    }
  };





  // Effects
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && isOwnProfile && Object.values(TABS).includes(tab)) {
      setActiveTab(tab);
    }
    fetchProfile();
  }, [searchParams, isOwnProfile, fetchProfile]);

  useEffect(() => {
    if (activeTab === TABS.SAVED) {
      fetchContent(activeTab);
    }
  }, [activeTab, fetchContent]);

  // Reset image loading state when profile changes
  useEffect(() => {
    setImageLoaded(false);
  }, [profile?.profile_photo_url, profile?.id]);

  // Components
  const PageWrapper = ({ children }) => (
    <PageLayout
      title={profile?.username || 'User Profile'}
      fullWidth={true}
      background=""
    >
      <div className="min-h-screen bg-gray-50">
        <section className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
              <Link to="/discussions" className="hover:text-teal-600 transition-colors">Form Questions</Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">Members</span>
            </nav>
            <h1 className="app-title text-3xl sm:text-4xl text-gray-900">
              {profile?.username || 'User Profile'}
            </h1>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </PageLayout>
  );

  const LoadingSpinner = () => (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
      <h2 className="text-lg font-medium text-gray-900">Loading profile...</h2>
    </div>
  );

  const NotFoundMessage = () => (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">User not found</h2>
      <p className="text-gray-600 mb-4">
        The user profile for "{profileIdentifier}" could not be found.
      </p>
      <div className="space-x-4">
        <Link to="/users" className="inline-block px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          Browse Users
        </Link>
        <Link to="/" className="inline-block px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300">
          Go Home
        </Link>
      </div>
    </div>
  );

  const ProfileHeader = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Profile Image */}
          <div className="avatar-unified border-2 border-gray-200 bg-gray-100 relative">
            {/* Fallback avatar - always show */}
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || profile?.username || 'User')}&size=96&background=0891b2&color=ffffff`}
              alt={profile?.full_name || profile?.username}
              className="w-full h-full object-cover"
              key={`fallback-${profile?.id || 'default'}`}
            />
            {/* Actual profile photo overlay */}
            {profile?.profile_photo_url && profile.profile_photo_url.trim() !== '' && (
              <img
                src={profile.profile_photo_url}
                alt={profile?.full_name || profile?.username}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                key={`profile-${profile?.id}-${profile.profile_photo_url}`}
                referrerPolicy="no-referrer"
                onLoad={(e) => {
                  setImageLoaded(true);
                  e.target.style.opacity = '1';
                }}
                onError={(e) => {
                  setImageLoaded(false);
                  e.target.style.display = 'none';
                }}
                style={{
                  opacity: imageLoaded ? 1 : 0,
                  display: imageLoaded === false ? 'none' : 'block'
                }}
              />
            )}
            {/* Loading indicator */}
            {profile?.profile_photo_url && !imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.full_name || profile?.username}
              </h1>
              {profile?.role && profile.role !== 'user' && (
                <CheckBadgeIcon className="w-5 h-5 text-red-600" />
              )}
            </div>
            <p className="text-gray-600 mb-3">@{profile?.username}</p>
            {profile?.bio && <p className="text-gray-700 mb-4 text-justify">{profile.bio}</p>}

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-6 mb-4">
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">{followersCount}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">{followingCount}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                Joined {getTimeAgo(profile?.created_at)}
              </span>
              {profile?.location && (
                <span className="flex items-center gap-1">
                  📍 {profile.location}
                </span>
              )}
              {profile?.native_language && (
                <span className="flex items-center gap-1">
                  🌐 {profile.native_language}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isOwnProfile && profile?.id && (
              <>
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${isFollowing
                    ? 'text-gray-700 bg-gray-100 hover:bg-gray-100 border border-gray-300'
                    : 'text-white bg-teal-600 hover:bg-teal-700'
                    } ${followLoading ? 'opacity-50' : ''}`}
                >
                  {followLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserPlusIcon className="w-4 h-4" />
                  )}
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button
                  onClick={() => navigate(`/discussions/new?mention=${profile.username}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg"
                >
                  <QuestionMarkCircleIcon className="w-4 h-4" />
                  Ask Question
                </button>
                <button
                  onClick={() => navigate(`/messages?userId=${profile.id}&user=${profile.username}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  Message
                </button>
              </>
            )}
            {isOwnProfile && (
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-t border-gray-200">
        <div className="flex overflow-x-auto">
          {[
            { id: TABS.ACTIVITY, label: 'Activity', icon: ClockIcon },
            { id: TABS.DISCUSSIONS, label: 'Questions', icon: ChatBubbleLeftRightIcon },
            { id: TABS.CONTRIBUTIONS, label: 'Contributions', icon: BookOpenIcon },
            ...(isOwnProfile ? [
              { id: TABS.SAVED, label: 'Saved', icon: BookmarkIcon }
            ] : [])
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${activeTab === tab.id
                ? 'text-teal-600 border-teal-500'
                : 'text-gray-500 hover:text-gray-700 border-transparent'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const TabContent = () => {
    if (activeTab === TABS.ACTIVITY) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-bold text-gray-900">
                  {isOwnProfile ? 'Recent Activity' : `${profile?.username}'s Activity`}
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {discussions.length === 0 ? (
                  <div className="p-8 text-center">
                    <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No questions yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {isOwnProfile ? 'Ask a question to begin your activity!' : 'This user hasn\'t asked any questions yet'}
                    </p>
                    {isOwnProfile && (
                      <Link
                        to="/discussions"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Ask a Question
                      </Link>
                    )}
                  </div>
                ) : (
                  discussions.slice(0, 10).map((discussion) => (
                    <div key={discussion.id} className="p-4 hover:bg-gray-50">
                      <Link to={`/discussions/${discussion.id}`} className="block">
                        <h3 className="font-medium text-gray-900 hover:text-teal-600 mb-1">
                          {discussion.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2 text-justify">
                          {discussion.content?.replace(/<[^>]*>/g, '').substring(0, 120)}...
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <ClockIcon className="w-3 h-3" />
                          {getTimeAgo(discussion.created_at)}
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-teal-600" />
                  Statistics
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { icon: ChatBubbleLeftRightIcon, label: 'Questions', value: stats.discussions, color: 'teal' },
                  { icon: ChatBubbleLeftIcon, label: 'Answers', value: stats.answers, color: 'blue' },
                  { icon: StarIcon, label: 'Reputation', value: userStats?.statistics?.reputation || profile?.reputation || 0, color: 'orange' },
                  ...(isOwnProfile ? [{ icon: BookmarkIcon, label: 'Saved', value: userStats?.statistics?.savedDiscussionsCount || savedDiscussions.length || 0, color: 'indigo' }] : [])
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${color}-600`} />
                      <span className="text-gray-600">{label}</span>
                    </div>
                    <span className={`font-semibold text-${color}-600`}>{value}</span>
                  </div>
                ))}
                <hr className="border-gray-200" />
                <div className="text-sm text-gray-500">
                  <div className="text-xs font-medium text-gray-700 mb-2">Voting Activity</div>
                  {loading.profile ? (
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="h-3 bg-gray-100 rounded w-20 animate-pulse"></div>
                          <div className="h-3 bg-gray-100 rounded w-6 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <HandThumbUpIcon className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-gray-600">Upvoted Questions</span>
                        </div>
                        <span className="text-xs font-medium text-green-600">{stats.upvotedPosts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <HandThumbDownIcon className="w-3 h-3 text-red-600" />
                          <span className="text-xs text-gray-600">Downvoted Questions</span>
                        </div>
                        <span className="text-xs font-medium text-red-600">{stats.downvotedPosts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <HandThumbUpIcon className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-gray-600">Upvoted Answers</span>
                        </div>
                        <span className="text-xs font-medium text-green-600">{stats.upvotedAnswers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <HandThumbDownIcon className="w-3 h-3 text-red-600" />
                          <span className="text-xs text-gray-600">Downvoted Answers</span>
                        </div>
                        <span className="text-xs font-medium text-red-600">{stats.downvotedAnswers}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === TABS.DISCUSSIONS) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900">
              {isOwnProfile ? 'My Questions' : `${profile.username}'s Questions`}
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {discussions.length === 0 ? (
              <div className="p-8 text-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No questions yet</p>
                <p className="text-sm text-gray-500">
                  {isOwnProfile ? 'Start engaging with the community!' : "This user hasn't asked any questions"}
                </p>
              </div>
            ) : (
              discussions.map(discussion => (
                <div key={discussion.id} className="p-4 hover:bg-gray-50">
                  <Link to={`/discussions/${discussion.id}`} className="block">
                    <h3 className="font-medium text-gray-900 hover:text-teal-600 mb-1">
                      {discussion.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2 text-justify">
                      {discussion.content?.replace(/<[^>]*>/g, '').substring(0, 400)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{discussion.vote_count || 0} votes</span>
                      <span>{discussion.answers_count || 0} answers</span>
                      <span>{getTimeAgo(discussion.created_at)}</span>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    if (activeTab === TABS.CONTRIBUTIONS) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900">
              {isOwnProfile ? 'My Contributions' : `${profile.username}'s Contributions`}
            </h2>
          </div>
          <div className="p-8 text-center">
            <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Coming Soon</p>
            <p className="text-sm text-gray-500">
              Dictionary contributions feature is under development.
            </p>
          </div>
        </div>
      );
    }



    if (activeTab === TABS.SAVED && isOwnProfile) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900">Saved Items</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {loading.content ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              </div>
            ) : savedDiscussions.length === 0 ? (
              <div className="p-8 text-center">
                <BookmarkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No saved items yet</p>
                <p className="text-sm text-gray-500 mb-4">Save questions to see them here</p>
                <Link
                  to="/discussions"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Browse Questions
                </Link>
              </div>
            ) : (
              savedDiscussions.map((discussion) => (
                <div key={discussion.id} className="p-4 hover:bg-gray-50">
                  <Link to={`/discussions/${discussion.id}`} className="block">
                    <div className="flex items-start gap-3">
                      <BookmarkIcon className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 hover:text-teal-600 mb-1">
                          {discussion.title}
                        </h3>
                        {discussion.content && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2 text-justify">
                            {discussion.content?.replace(/<[^>]*>/g, '').substring(0, 120)}...
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{discussion.vote_count || 0} votes</span>
                          <span>{discussion.answers_count || 0} answers</span>
                          <span>Saved {getTimeAgo(discussion.saved_at || discussion.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  // Render states
  if (profile === false) return <PageWrapper><NotFoundMessage /></PageWrapper>;
  if (loading.profile) return <PageWrapper><LoadingSpinner /></PageWrapper>;

  return (
    <PageWrapper>
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <span className="text-gray-900">{profile?.username || profileIdentifier}</span>
      </nav>

      <ProfileHeader />
      <TabContent />
    </PageWrapper>
  );
};

export default UserProfile;