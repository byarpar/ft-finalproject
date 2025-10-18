import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpenIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  PencilSquareIcon,
  UserCircleIcon,
  ArrowRightCircleIcon,
  UserPlusIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import SearchBar from '../components/Search/SearchBar';
import SEO, { SEOConfigs } from '../components/SEO/SEO';
import { wordsAPI, discussionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { notificationsAPI } from '../services/notificationsAPI';
import socketClient from '../services/socketClient';
import toast from 'react-hot-toast';

const Home = () => {
  const [featuredWords, setFeaturedWords] = useState([]);
  const [recentDiscussions, setRecentDiscussions] = useState([]);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userProfileDropdownOpen, setUserProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  // Fetch featured words on component mount
  useEffect(() => {
    const fetchFeaturedWords = async () => {
      try {
        setIsLoadingWords(true);
        // Get top words by frequency score for featured section (limit to 4 for better display)
        const response = await wordsAPI.getWords({ limit: 4, sort: 'frequency_score', order: 'DESC' });
        const words = response.data?.words || response.words || [];
        console.log('Fetched featured words:', words);
        setFeaturedWords(words);
      } catch (error) {
        console.error('Error fetching featured words:', error);
        // Set default words if API fails
        setFeaturedWords([]);
      } finally {
        setIsLoadingWords(false);
      }
    };

    fetchFeaturedWords();
  }, []);

  // Fetch recent discussions
  useEffect(() => {
    const fetchRecentDiscussions = async () => {
      try {
        setIsLoadingDiscussions(true);
        const response = await discussionsAPI.getDiscussions({
          limit: 2,
          sort: 'recent',
          page: 1
        });
        const discussions = response.discussions || response.data?.discussions || [];
        console.log('Fetched recent discussions:', discussions);
        setRecentDiscussions(discussions);
      } catch (error) {
        console.error('Error fetching recent discussions:', error);
        setRecentDiscussions([]);
      } finally {
        setIsLoadingDiscussions(false);
      }
    };

    fetchRecentDiscussions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 dark:bg-gray-900 transition-colors duration-200">
      {/* SEO Meta Tags */}
      <SEO {...SEOConfigs.home} />

      {/* Hero Section - Modern Minimalist Design */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/hero/lisu-people.jpg)',
          }}
        />
        {/* Enhanced overlay for better text readability */}
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
              {/* Help Icon - Always visible */}
              <Link
                to="/help"
                className="p-3 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
                aria-label="Help Center"
                title="Help Center"
              >
                <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
              </Link>

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
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center">
            {/* Main Heading */}
            <div className="mb-12">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
                Lisu Dictionary
              </h1>
              <p className="text-xl md:text-2xl text-white/80 font-light max-w-3xl mx-auto">
                Discover, learn, and preserve the Lisu language
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-16" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
            <path d="M0,32 Q360,64 720,32 T1440,32 L1440,80 L0,80 Z" className="fill-gray-50 dark:fill-gray-900" />
          </svg>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 -mt-8 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar
            placeholder="Search Lisu or English words..."
            className="text-lg"
            autoFocus={false}
            size="large"
            showEnhancedFeatures={true}
            showSuggestions={true}
          />
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Left Column: Featured Words */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpenIcon className="w-6 h-6 text-teal-600" />
                  Featured Words
                </h3>
                <Link to="/dictionary" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  View all
                </Link>
              </div>

              {isLoadingWords ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 animate-pulse border border-gray-200 dark:border-gray-700">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-32"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : featuredWords.length > 0 ? (
                <div className="space-y-3">
                  {featuredWords.map((word, index) => (
                    <Link
                      key={word.id || index}
                      to={`/dictionary?q=${word.english_word || word.lisu_word}`}
                      className="block bg-white dark:bg-gray-800 rounded-xl p-5 hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Lisu Word */}
                          <div className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {word.lisu_word || 'ꓡꓴ'}
                          </div>

                          {/* English Translation */}
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                            {word.english_word || 'word'}
                            {word.pronunciation_lisu && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                                • {word.pronunciation_lisu}
                              </span>
                            )}
                          </div>

                          {/* Definition */}
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {word.english_definition || word.lisu_definition || 'Explore the meaning and context for this Lisu word.'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <BookOpenIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No featured words available</p>
                </div>
              )}
            </div>

            {/* Right Column: Community Hub */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-teal-600" />
                  Community
                </h3>
                <Link to="/discussions" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  View all
                </Link>
              </div>

              {/* Recent Discussions Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4 hover:shadow-lg transition-shadow">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Recent Discussions
                </h4>

                {isLoadingDiscussions ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                      </div>
                    ))}
                  </div>
                ) : recentDiscussions.length > 0 ? (
                  <div className="space-y-6">
                    {recentDiscussions.slice(0, 2).map((discussion, index) => (
                      <React.Fragment key={discussion.id}>
                        <Link
                          to={`/discussions/${discussion.id}`}
                          className="block hover:opacity-80 transition-opacity"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
                                {discussion.username?.charAt(0).toUpperCase() || 'A'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {discussion.username || 'Anonymous'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {typeof discussion.category === 'object' ? discussion.category?.name : discussion.category || 'General'}
                              </div>
                            </div>
                          </div>

                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 hover:text-teal-600 dark:hover:text-teal-400">
                            {discussion.title}
                          </h4>

                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {discussion.content?.replace(/<[^>]*>/g, '') || 'Join the discussion to learn more...'}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                              {discussion.answers_count || 0} replies
                            </span>
                            <span className="flex items-center">
                              <HeartIcon className="h-4 w-4 mr-1" />
                              {discussion.likes_count || 0} likes
                            </span>
                          </div>
                        </Link>
                        {index < recentDiscussions.slice(0, 2).length - 1 && (
                          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent discussions.</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Link
                to="/discussions/new"
                className="flex items-center justify-center w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <PencilSquareIcon className="h-5 w-5 mr-2" />
                Start a Discussion
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Learn Lisu / Cultural Immersion Section */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Why Learn Lisu?
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                The Lisu language is spoken by over 1 million people across China, Myanmar,
                Thailand, and India. Our dictionary helps preserve this rich linguistic
                tradition while making it accessible to new learners worldwide.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-teal-500 dark:bg-teal-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Cultural Preservation</h3>
                    <p className="text-gray-600 dark:text-gray-400">Help preserve and promote the Lisu language for future generations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-teal-500 dark:bg-teal-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Connect with Communities</h3>
                    <p className="text-gray-600 dark:text-gray-400">Bridge communication gaps and connect with Lisu-speaking communities</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-teal-500 dark:bg-teal-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Rich History & Etymology</h3>
                    <p className="text-gray-600 dark:text-gray-400">Explore the fascinating linguistic development and cultural context</p>
                  </div>
                </div>
              </div>
              <Link
                to="/about"
                className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium rounded-md transition-colors duration-200"
              >
                Learn More About Us
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Link>
            </div>

            {/* Image/Visual Content */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="rounded-lg overflow-hidden shadow-xl" style={{ paddingBottom: '75%', position: 'relative' }}>
                  <img
                    src="/images/hero/lisu-people.jpg"
                    alt="Learning and community"
                    className="absolute inset-0 object-cover w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/800x600/0d9488/ffffff?text=Learning+Community";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contribute / Get Involved Section */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpenIcon className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Submit Words</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add new Lisu words and definitions to expand our dictionary
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIcon className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Share Knowledge</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help others by answering questions and sharing insights
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PencilSquareIcon className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Suggest Edits</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Improve existing entries with corrections and additional context
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
