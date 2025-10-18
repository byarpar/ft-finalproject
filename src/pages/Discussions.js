import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { discussionsAPI, tagsAPI, usersAPI } from '../services/api';
import { notificationsAPI } from '../services/notificationsAPI';
import socketClient from '../services/socketClient';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BookmarkIcon,
  ClockIcon,
  UserIcon,
  SparklesIcon,
  PhotoIcon,
  BookOpenIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ArrowRightCircleIcon,
  UserPlusIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon,
  LockClosedIcon,
  MapPinIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import DiscussionSkeleton from '../components/UI/DiscussionSkeleton';
import VoteButtons from '../components/Discussion/VoteButtons';

const Discussions = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [discussions, setDiscussions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filterBy, setFilterBy] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Header navigation states
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userProfileDropdownOpen, setUserProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

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
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    if (user && socketClient.isConnected()) {
      socketClient.onNewNotification((notificationData) => {
        setUnreadCount(prev => prev + 1);
        toast.success(`${notificationData.actorName} ${notificationData.message}`, {
          duration: 4000,
          position: 'top-right',
          icon: '🔔'
        });
      });

      return () => {
        socketClient.off('notification:new');
      };
    }
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);

      const response = await discussionsAPI.getDiscussions({
        page,
        limit: 20,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sortBy,
        filter: filterBy !== 'all' ? filterBy : undefined
      });

      const rawDiscussions = response.discussions || response.data?.discussions || [];

      // Normalize discussions data to ensure images is always an array
      const normalizedDiscussions = rawDiscussions.map(discussion => {
        let images = [];

        // Handle different image formats
        if (discussion.images) {
          if (typeof discussion.images === 'string') {
            try {
              images = JSON.parse(discussion.images);
            } catch (e) {
              console.warn('Failed to parse images for discussion:', discussion.id);
              images = [];
            }
          } else if (Array.isArray(discussion.images)) {
            images = discussion.images;
          }
        }

        // Ensure images is an array of strings
        images = Array.isArray(images) ? images.filter(img => typeof img === 'string' || (img && (img.data || img.url))) : [];

        // Debug log
        if (images.length > 0) {
          console.log('Discussion', discussion.id, 'has', images.length, 'images:', images);
        }

        return {
          ...discussion,
          images
        };
      });

      setDiscussions(normalizedDiscussions);
      setTotalPages(response.totalPages || response.data?.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching discussions:', err);
      setError('Failed to load discussions. Please try again.');
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchQuery, sortBy, filterBy]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await discussionsAPI.getCategories();
      setCategories(response.data?.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchPopularTags = useCallback(async () => {
    try {
      const response = await tagsAPI.getPopularTags(10);
      setPopularTags(response.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  }, []);

  const fetchRecentActivity = useCallback(() => {
    const activities = discussions.slice(0, 5).map(discussion => ({
      id: discussion.id,
      type: 'reply',
      username: discussion.author_name || 'Anonymous',
      threadTitle: discussion.title,
      timestamp: discussion.updated_at || discussion.created_at
    }));
    setRecentActivity(activities);
  }, [discussions]);

  const fetchActiveMembers = useCallback(async () => {
    try {
      const response = await usersAPI.getAllUsers({ limit: 4, sortBy: 'created_at', order: 'DESC' });
      if (response.data && response.data.users) {
        const users = response.data.users.map(user => ({
          id: user.id,
          username: user.username,
          avatar: user.profile_photo_url,
          lastActive: 'Active',
          role: user.role || 'Member'
        }));
        setActiveMembers(users);
      }
    } catch (error) {
      console.error('Error fetching active members:', error);
      setActiveMembers([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchPopularTags();
    fetchActiveMembers();
  }, [fetchCategories, fetchPopularTags, fetchActiveMembers]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  useEffect(() => {
    if (discussions.length > 0) {
      fetchRecentActivity();
    }
  }, [discussions, fetchRecentActivity]);

  const handleSaveDiscussion = async (discussionId, isSaved) => {
    if (!user) {
      toast.error('Please login to save discussions');
      return;
    }

    try {
      if (isSaved) {
        await discussionsAPI.unsaveDiscussion(discussionId);
        toast.success('Discussion removed from saved');
      } else {
        await discussionsAPI.saveDiscussion(discussionId);
        toast.success('Discussion saved!');
      }

      setDiscussions(prev =>
        prev.map(d =>
          d.id === discussionId ? { ...d, is_saved: !isSaved } : d
        )
      );
    } catch (err) {
      console.error('Error saving discussion:', err);
      toast.error('Failed to save discussion');
    }
  };

  const handleTagClick = (tagName) => {
    setSearchQuery(`#${tagName}`);
    setPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString();
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header Section - Oxford Dictionary Style */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/hero/Discussions.png")',
          }}
        />
        {/* Enhanced overlay for better text readability on mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/90 via-teal-800/75 to-teal-700/60 sm:bg-gradient-to-r sm:from-teal-800/85 sm:via-teal-700/60 sm:to-teal-600/40" />

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
            {user && !isMobile && (
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
              {!user ? (
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
                        {user.profile_photo_url ? (
                          <img
                            src={user.profile_photo_url}
                            alt={user.full_name || user.username || 'User'}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <UserIcon className={`w-5 h-5 text-white ${user.profile_photo_url ? 'hidden' : ''}`} />
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
                              to={`/users/${user.id}`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              onClick={() => setUserProfileDropdownOpen(false)}
                            >
                              <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                              My Profile
                            </Link>
                            <Link
                              to="/discussions?filter=my"
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
                            {(user.role === 'admin' || user.role === 'moderator') && (
                              <Link
                                to="/admin"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => setUserProfileDropdownOpen(false)}
                              >
                                <ShieldCheckIcon className="w-4 h-4 mr-3 text-gray-400" />
                                Admin Panel
                              </Link>
                            )}
                          </div>

                          <div className="border-t border-gray-100 dark:border-gray-700 py-1">
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
                    className="md:hidden p-2 hover:opacity-80 transition-opacity"
                    aria-label="Toggle menu"
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

          {/* Mobile Menu - Show when logged in */}
          {user && mobileMenuOpen && (
            <div className="md:hidden bg-white/10 backdrop-blur-lg border-t border-white/20">
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                <Link
                  to="/"
                  className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/discussions"
                  className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Discussions
                </Link>
                <Link
                  to="/about"
                  className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[280px] sm:min-h-[320px]">
            <div className="space-y-6 relative z-10 text-center sm:text-left">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
                  Community Discussions
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-lg mx-auto sm:mx-0 drop-shadow-md">
                  Join conversations about Lisu language and culture
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={user ? "/discussions/new" : "/login"}
                  onClick={() => {
                    if (!user) {
                      toast.error('Please login to start a discussion');
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-base rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
                >
                  <PlusIcon className="w-5 h-5" />
                  Start Discussion
                </Link>
              </div>
            </div>

            <div className="relative lg:block hidden" />
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-16" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
            <path d="M0,32 Q360,64 720,32 T1440,32 L1440,80 L0,80 Z" className="fill-gray-50 dark:fill-gray-900" />
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 xl:gap-8">
          <div className="lg:col-span-3">
            {/* Filtering & Sorting Section - Mobile Optimized */}
            <div id="categories" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700">
              {/* Category Tabs - Horizontally Scrollable on Mobile */}
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setPage(1);
                    }}
                    className={`flex-shrink-0 snap-start px-4 sm:px-5 py-2 sm:py-2.5 font-semibold text-xs sm:text-sm whitespace-nowrap rounded-full transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-0 flex items-center ${selectedCategory === 'all'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                      }`}
                  >
                    All Threads
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setPage(1);
                      }}
                      className={`flex-shrink-0 snap-start px-4 sm:px-5 py-2 sm:py-2.5 font-semibold text-xs sm:text-sm whitespace-nowrap rounded-full transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-0 flex items-center ${selectedCategory === category.id
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                        }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search and Filters - Mobile First Design */}
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="space-y-3">
                  {/* Search Bar - Full Width on Mobile */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search discussions..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-11 pr-4 py-3 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 touch-manipulation"
                    />
                  </div>

                  {/* Filter and Sort - Side by Side on Mobile for Better UX */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {/* Filter Dropdown - Enhanced Touch Target */}
                    <div className="relative">
                      <select
                        value={filterBy}
                        onChange={(e) => {
                          setFilterBy(e.target.value);
                          setPage(1);
                        }}
                        className="w-full appearance-none px-3 py-3 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white bg-white dark:bg-gray-700 touch-manipulation pr-8"
                      >
                        <option value="all">📋 All Threads</option>
                        <option value="unanswered">❓ Unanswered</option>
                        <option value="my">👤 My Posts</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Sort Dropdown - Enhanced Touch Target */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          setPage(1);
                        }}
                        className="w-full appearance-none px-3 py-3 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white bg-white dark:bg-gray-700 touch-manipulation pr-8"
                        title="Sort discussions by activity, engagement, or creation date"
                      >
                        <option value="latest">🕐 Latest</option>
                        <option value="popular">🔥 Popular</option>
                        <option value="newest">✨ Newest</option>
                        <option value="oldest">📅 Oldest</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Count */}
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                  <span>{discussions.length} discussion{discussions.length !== 1 ? 's' : ''} found</span>
                  {(searchQuery || filterBy !== 'all' || selectedCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterBy('all');
                        setSelectedCategory('all');
                        setPage(1);
                      }}
                      className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <DiscussionSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                  <button
                    onClick={fetchDiscussions}
                    className="mt-4 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                  >
                    Retry
                  </button>
                </div>
              ) : discussions.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm p-12 sm:p-16 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {searchQuery ? 'No discussions found' : 'Start the Conversation!'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-base">
                      {searchQuery
                        ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                        : 'Be the first to share your thoughts, ask questions, or start a discussion with the community.'}
                    </p>
                    {user && !searchQuery && (
                      <Link
                        to="/discussions/new"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                      >
                        <PlusIcon className="w-5 h-5" />
                        Start New Discussion
                      </Link>
                    )}
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterBy('all');
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {discussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-teal-400 dark:hover:border-teal-500 active:scale-[0.99] sm:hover:-translate-y-1 transition-all duration-300 overflow-hidden touch-manipulation"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex gap-3 sm:gap-5">
                          {/* Image Thumbnails - Responsive sizing */}
                          {discussion.images && Array.isArray(discussion.images) && discussion.images.length > 0 && (
                            <Link
                              to={`/discussions/${discussion.id}`}
                              className="flex-shrink-0"
                            >
                              <div className="relative">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-md hover:shadow-xl transition-shadow duration-300 group">
                                  <img
                                    src={typeof discussion.images[0] === 'string' ? discussion.images[0] : discussion.images[0]?.data || discussion.images[0]?.url}
                                    alt={discussion.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                                {discussion.images.length > 1 && (
                                  <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg border-2 border-white dark:border-gray-800">
                                    +{discussion.images.length - 1}
                                  </div>
                                )}
                              </div>
                            </Link>
                          )}

                          {/* Thread Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title with Status Badges */}
                            <div className="mb-2 sm:mb-3">
                              <Link
                                to={`/discussions/${discussion.id}`}
                                className="block group"
                              >
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug mb-1.5 sm:mb-1">
                                  {discussion.is_pinned && (
                                    <MapPinIcon className="inline w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mr-1 sm:mr-2 -mt-1" />
                                  )}
                                  {discussion.title}
                                </h3>
                              </Link>

                              {/* Status Badges Row - Scrollable on Mobile */}
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 overflow-x-auto scrollbar-hide pb-1">
                                {discussion.is_pinned && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium whitespace-nowrap">
                                    <MapPinIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    Pinned
                                  </span>
                                )}
                                {discussion.is_locked && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium whitespace-nowrap">
                                    <LockClosedIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    Locked
                                  </span>
                                )}
                                {/* Trending Badge - if replies > 5 */}
                                {discussion.answers_count > 5 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs font-medium whitespace-nowrap">
                                    🔥 Trending
                                  </span>
                                )}
                                {/* Unanswered Badge */}
                                {discussion.answers_count === 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium whitespace-nowrap">
                                    💬 Unanswered
                                  </span>
                                )}
                                {/* Images Badge */}
                                {discussion.images && Array.isArray(discussion.images) && discussion.images.length > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium whitespace-nowrap">
                                    <PhotoIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    {discussion.images.length}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Content Preview/Snippet - Mobile Optimized */}
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
                              {discussion.content?.replace(/<[^>]*>/g, '').substring(0, 150) || 'No description available.'}
                              {discussion.content?.length > 150 && '...'}
                            </p>

                            {/* Metadata Row with Avatar - Stacked on Mobile */}
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                              {/* Author Avatar */}
                              <Link
                                to={`/users/${discussion.author_id}`}
                                className="flex-shrink-0"
                              >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-shadow">
                                  {(discussion.author_name || 'A').charAt(0).toUpperCase()}
                                </div>
                              </Link>

                              {/* Author Info - Compact on Mobile */}
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs min-w-0">
                                <Link
                                  to={`/users/${discussion.author_id}`}
                                  className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors truncate max-w-[120px] sm:max-w-none"
                                >
                                  <span className="truncate">{discussion.author_name || 'Anonymous'}</span>
                                  {discussion.author_role === 'admin' && (
                                    <CheckBadgeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" title="Verified Admin" />
                                  )}
                                </Link>
                                <span className="text-gray-400 hidden sm:inline">•</span>
                                <span className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs">
                                  {formatDate(discussion.updated_at || discussion.created_at)}
                                </span>
                              </div>
                            </div>

                            {/* Tags - Horizontally Scrollable on Mobile */}
                            {discussion.tags && discussion.tags.length > 0 && (
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 overflow-x-auto scrollbar-hide pb-1">
                                {discussion.tags.slice(0, 3).map((tag, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleTagClick(tag)}
                                    className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-md text-[10px] sm:text-xs font-medium hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors border border-teal-200 dark:border-teal-800 whitespace-nowrap touch-manipulation"
                                  >
                                    #{tag}
                                  </button>
                                ))}
                                {discussion.tags.length > 3 && (
                                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                                    +{discussion.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Engagement Metrics - Enhanced Touch Targets */}
                            <div className="flex items-center gap-3 sm:gap-5 text-sm">
                              {/* Vote Buttons */}
                              <div className="scale-90 sm:scale-100 origin-left">
                                <VoteButtons
                                  itemId={discussion.id}
                                  itemType="discussion"
                                  initialVoteCount={discussion.vote_count || 0}
                                  initialUpvotes={discussion.upvotes || 0}
                                  initialDownvotes={discussion.downvotes || 0}
                                  initialUserVote={discussion.user_vote || null}
                                  onVoteChange={(voteData) => {
                                    setDiscussions(prev => prev.map(d =>
                                      d.id === discussion.id
                                        ? { ...d, vote_count: voteData.vote_count, upvotes: voteData.upvotes, downvotes: voteData.downvotes }
                                        : d
                                    ));
                                  }}
                                />
                              </div>

                              {/* Replies Count - Enhanced Touch Target */}
                              <Link
                                to={`/discussions/${discussion.id}`}
                                className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors min-h-[44px] sm:min-h-0 -my-2 sm:my-0 px-2 sm:px-0 -mx-2 sm:mx-0 rounded-lg active:bg-gray-100 dark:active:bg-gray-700 sm:active:bg-transparent touch-manipulation"
                              >
                                <ChatBubbleLeftRightIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                                <span className="font-semibold text-sm">{discussion.answers_count || 0}</span>
                                {discussion.answers_count > 0 && (
                                  <span className="text-xs hidden sm:inline">
                                    {discussion.answers_count === 1 ? 'Reply' : 'Replies'}
                                  </span>
                                )}
                              </Link>
                            </div>
                          </div>

                          {/* Bookmark Action - Always visible on mobile, hover on desktop */}
                          <div className="flex-shrink-0 self-start">
                            <button
                              onClick={() => handleSaveDiscussion(discussion.id, discussion.is_saved)}
                              className={`p-2 sm:p-2.5 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center touch-manipulation ${discussion.is_saved
                                ? 'opacity-100 bg-teal-50 dark:bg-teal-900/20'
                                : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              title={discussion.is_saved ? 'Unsave thread' : 'Save thread'}
                            >
                              {discussion.is_saved ? (
                                <BookmarkSolidIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 hover:scale-110 transition-transform" />
                              ) : (
                                <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination - Mobile Optimized with Larger Touch Targets */}
            {!loading && discussions.length > 0 && totalPages > 1 && (
              <div className="mt-6 sm:mt-8">
                {/* Mobile: Large "Load More" style buttons */}
                <div className="flex flex-col sm:hidden gap-3">
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Page {page} of {totalPages}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm flex items-center justify-center gap-2 touch-manipulation active:scale-95 transition-transform"
                    >
                      <span>←</span>
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-3.5 bg-teal-600 hover:bg-teal-700 text-white border border-teal-600 dark:border-teal-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm flex items-center justify-center gap-2 touch-manipulation active:scale-95 transition-transform shadow-sm"
                    >
                      Next
                      <span>→</span>
                    </button>
                  </div>

                  {/* Page Number Pills for Quick Navigation */}
                  {totalPages <= 7 && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all touch-manipulation ${page === i + 1
                            ? 'bg-teal-600 text-white shadow-md'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop: Traditional pagination */}
                <div className="hidden sm:flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {totalPages <= 7 ? (
                    [...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${page === i + 1
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))
                  ) : (
                    <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                      Page {page} of {totalPages}
                    </span>
                  )}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Stacked Below on Mobile */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Community Highlights Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-700 dark:to-cyan-700 rounded-lg shadow-sm p-4 sm:p-5 border border-teal-500 dark:border-teal-600">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                Community Highlights
              </h2>
              <p className="text-teal-50 text-xs sm:text-sm mt-1">
                Stay connected with the latest happenings
              </p>
            </div>

            {/* Trending Topics - Mobile Optimized */}
            {popularTags && popularTags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Trending Topics</h3>
                </div>
                <div className="space-y-2">
                  {popularTags.slice(0, 5).map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => handleTagClick(tag.name || tag)}
                      className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-lg hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 transition-all duration-200 group border border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md touch-manipulation active:scale-98 min-h-[44px] sm:min-h-0 flex items-center"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <span className="text-teal-600 dark:text-teal-400 font-bold text-sm sm:text-base">#</span>
                          <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate">
                            {tag.name || tag}
                          </span>
                        </div>
                        {tag.count && (
                          <span className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ml-2">
                            {tag.count}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Latest Activity - Mobile Optimized */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center relative">
                  <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Latest Activity</h3>
              </div>
              <div className="space-y-2 sm:space-y-3 max-h-72 sm:max-h-80 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 4).map((activity) => (
                    <Link
                      key={activity.id}
                      to={`/discussions/${activity.id}`}
                      className="block p-2.5 sm:p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-750 rounded-lg hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md group touch-manipulation active:scale-98 min-h-[60px] sm:min-h-0"
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0 shadow-sm">
                          {(activity.username || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">
                            <span className="font-semibold text-teal-600 dark:text-teal-400 truncate inline-block max-w-[100px] sm:max-w-none align-bottom">{activity.username}</span>
                            <span className="text-gray-500"> replied to</span>
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-snug">
                            {activity.threadTitle}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                        <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <ChatBubbleLeftRightIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Members - Mobile Optimized with Horizontal Scroll */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Active Members</h3>
              </div>

              {/* Mobile: Horizontal scrollable carousel */}
              <div className="lg:hidden">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 mb-4 snap-x snap-mandatory -mx-1 px-1">
                  {activeMembers.slice(0, 8).map((member, index) => (
                    <Link
                      key={member.id}
                      to={`/users/${member.id}`}
                      className="flex flex-col items-center group cursor-pointer flex-shrink-0 snap-center touch-manipulation"
                    >
                      <div className="relative mb-2 transform group-active:scale-95 sm:group-hover:scale-110 transition-transform duration-200">
                        <div
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${index % 4 === 0 ? 'from-pink-400 to-rose-500' :
                            index % 4 === 1 ? 'from-purple-400 to-indigo-500' :
                              index % 4 === 2 ? 'from-blue-400 to-cyan-500' :
                                'from-teal-400 to-green-500'
                            } flex items-center justify-center text-white font-bold text-lg sm:text-xl border-3 border-gray-200 dark:border-gray-600 group-hover:border-teal-400 dark:group-hover:border-teal-500 transition-all shadow-md group-hover:shadow-lg`}
                        >
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full">
                          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center line-clamp-1 w-16 sm:w-20 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {member.username}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Desktop: Grid layout */}
              <div className="hidden lg:grid grid-cols-4 gap-3 mb-4">
                {activeMembers.slice(0, 4).map((member, index) => (
                  <Link
                    key={member.id}
                    to={`/users/${member.id}`}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="relative mb-2 transform group-hover:scale-110 transition-transform duration-200">
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${index === 0 ? 'from-pink-400 to-rose-500' :
                          index === 1 ? 'from-purple-400 to-indigo-500' :
                            index === 2 ? 'from-blue-400 to-cyan-500' :
                              'from-teal-400 to-green-500'
                          } flex items-center justify-center text-white font-bold text-xl border-3 border-gray-200 dark:border-gray-600 group-hover:border-teal-400 dark:group-hover:border-teal-500 transition-all shadow-md group-hover:shadow-lg`}
                      >
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full">
                        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center line-clamp-1 w-full group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {member.username}
                    </p>
                  </Link>
                ))}
              </div>

              <Link
                to="/discussions/members"
                className="block w-full text-center px-4 py-3 sm:py-3.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-lg hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 hover:text-teal-700 dark:hover:text-teal-300 transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md group touch-manipulation active:scale-98 min-h-[44px] sm:min-h-0"
              >
                <span className="inline-flex items-center gap-2">
                  See All Members
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </div>

            {/* Community Chat Card - Mobile Optimized */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg shadow-sm p-4 sm:p-5 border border-teal-200 dark:border-teal-800">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Community Chat</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed">
                Join real-time conversations with fellow Lisu language learners and practice together.
              </p>
              <Link
                to="/chat"
                className="block w-full text-center px-4 py-3 sm:py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 active:from-teal-700 active:to-cyan-700 text-white font-semibold text-sm sm:text-base rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:shadow-sm transform sm:hover:-translate-y-0.5 active:scale-98 group touch-manipulation min-h-[44px] sm:min-h-0"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Open Chat Page
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discussions;