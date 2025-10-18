import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
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
  BellIcon,
  UserCircleIcon,
  InformationCircleIcon,
  ArrowRightCircleIcon,
  UserPlusIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';
import { usersAPI, discussionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { notificationsAPI } from '../services/notificationsAPI';
import socketClient from '../services/socketClient';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const UserProfileEnhanced = () => {
  const { userId, username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, logout } = useAuth();

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

  // Header navigation state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userProfileDropdownOpen, setUserProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Helper function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

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

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
    }
  }, [currentUser]);

  // Socket.IO notification listener
  useEffect(() => {
    if (currentUser) {
      socketClient.onNewNotification((notification) => {
        fetchUnreadCount();
        toast.success(notification.message || 'You have a new notification');
      });
    }

    return () => {
      if (currentUser) {
        socketClient.socket?.off('newNotification');
      }
    };
  }, [currentUser]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setUserProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Oxford-Style Header Navigation */}
      <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 dark:from-teal-700 dark:via-teal-800 dark:to-teal-900">
        {/* Top Navigation Bar */}
        <div className="relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            {/* Logo/Brand */}
            <Link to="/" className="group flex items-center gap-3">
              <div className="relative w-14 h-14 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/25 transition-all border border-white/20">
                <BookOpenIcon className="w-10 h-10 text-white/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-[10px] tracking-tight drop-shadow-lg">LED</span>
                </div>
              </div>
              <div className="text-white font-light text-2xl tracking-[0.3em] uppercase">
                LISU DICT
              </div>
            </Link>

            {/* Center Navigation Links - Desktop only, show when logged in */}
            {currentUser && !isMobile && (
              <div className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/')
                    ? 'bg-white/10 text-white border-b-2 border-white'
                    : 'text-white hover:text-teal-100 hover:bg-white/5'
                    }`}
                >
                  Home
                </Link>
                <Link
                  to="/discussions"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/discussions')
                    ? 'bg-white/10 text-white border-b-2 border-white'
                    : 'text-white hover:text-teal-100 hover:bg-white/5'
                    }`}
                >
                  Discussions
                </Link>
                <Link
                  to="/about"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/about')
                    ? 'bg-white/10 text-white border-b-2 border-white'
                    : 'text-white hover:text-teal-100 hover:bg-white/5'
                    }`}
                >
                  About Us
                </Link>
              </div>
            )}

            {/* Top Right Icons */}
            <div className="flex items-center gap-3">
              {!currentUser ? (
                <>
                  {/* Desktop: Show profile dropdown */}
                  <div className="hidden md:block relative" ref={dropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="p-3 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
                      aria-label="Profile menu"
                    >
                      <UserCircleIcon className="w-6 h-6 text-white" />
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
                        <Link
                          to="/login"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <ArrowRightCircleIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          Log In
                        </Link>
                        <Link
                          to="/register"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <UserPlusIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Mobile: Show login/register buttons */}
                  <div className="md:hidden flex items-center gap-2">
                    <Link
                      to="/login"
                      className="px-3 py-1.5 text-white text-sm font-medium hover:opacity-80 transition-opacity"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="px-3 py-1.5 bg-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/30 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* Notification Icon with Badge */}
                  <Link
                    to="/notifications"
                    className="relative hover:opacity-80 transition-opacity"
                    aria-label="Notifications"
                    title="Notifications"
                  >
                    <BellIcon className="w-6 h-6 text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Desktop: Profile Button with Dropdown */}
                  <div className="hidden md:block relative" ref={userDropdownRef}>
                    <button
                      onClick={() => setUserProfileDropdownOpen(!userProfileDropdownOpen)}
                      className="flex items-center gap-2 px-2 py-1.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg transition-all duration-200 border border-white/10"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-500 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                        {currentUser.profile_photo_url ? (
                          <img
                            src={currentUser.profile_photo_url}
                            alt={currentUser.full_name || currentUser.username || 'User'}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <UserIcon className={`w-5 h-5 text-white ${currentUser.profile_photo_url ? 'hidden' : ''}`} />
                      </div>
                    </button>

                    {/* User Profile Dropdown Menu */}
                    {userProfileDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserProfileDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                          <div className="py-1">
                            <Link
                              to={`/users/${currentUser.id}`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              onClick={() => setUserProfileDropdownOpen(false)}
                            >
                              <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                              My Profile
                            </Link>
                            <Link
                              to="/discussions"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              onClick={() => setUserProfileDropdownOpen(false)}
                            >
                              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-3 text-gray-400" />
                              My Discussions
                            </Link>
                            <Link
                              to="/dashboard"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              onClick={() => setUserProfileDropdownOpen(false)}
                            >
                              <ChartPieIcon className="w-4 h-4 mr-3 text-gray-400" />
                              Dashboard
                            </Link>
                            <Link
                              to="/settings"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              onClick={() => setUserProfileDropdownOpen(false)}
                            >
                              <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-400" />
                              Settings
                            </Link>
                            {currentUser.role === 'admin' && (
                              <Link
                                to="/admin"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => setUserProfileDropdownOpen(false)}
                              >
                                <ShieldCheckIcon className="w-4 h-4 mr-3 text-gray-400" />
                                Admin Panel
                              </Link>
                            )}
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                              Logout
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mobile: Hamburger Menu */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                    aria-label="Toggle mobile menu"
                  >
                    {mobileMenuOpen ? (
                      <XMarkIcon className="w-6 h-6 text-white" />
                    ) : (
                      <Bars3Icon className="w-6 h-6 text-white" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && currentUser && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HomeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium">Home</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ChartPieIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link
                  to="/discussions"
                  className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium">Discussions</span>
                </Link>
                <Link
                  to="/about"
                  className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <InformationCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium">About Us</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Cog6ToothIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium">Settings</span>
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>


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
                      {stats?.reply_count || stats?.total_messages || 0}
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
                            <ArrowUpIcon className="w-4 h-4" />
                            {discussion.vote_count || 0} votes
                          </span>
                          <span className="flex items-center gap-1">
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            {discussion.answers_count || 0} replies
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
