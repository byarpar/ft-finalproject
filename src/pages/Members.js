import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usersAPI } from '../services/api';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ArrowRightCircleIcon,
  UserPlusIcon,
  UserIcon,
  ChartPieIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { notificationsAPI } from '../services/notificationsAPI';
import socketClient from '../services/socketClient';

const Members = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

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

  // Fetch members
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAllUsers({
        page,
        limit: 12,
        search: searchQuery || undefined,
        sortBy,
        order: sortOrder
      });

      if (response.success) {
        setMembers(response.data?.users || []);
        setPagination(response.data?.pagination || null);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load members. Please try again.');
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, sortBy, sortOrder]);

  // Fetch members when filters change
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  // Handle search input change with debounce effect
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(newSortBy);
      setSortOrder('DESC');
    }
    setPage(1);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <>
      <Helmet>
        <title>Community Members - Lisu Dictionary</title>
        <meta
          name="description"
          content="Connect with the Lisu Dictionary community. Meet fellow learners, native speakers, and language enthusiasts passionate about preserving the Lisu language."
        />
        <meta name="keywords" content="Lisu community, language learners, Lisu speakers, language community" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header Section - Oxford Dictionary Style */}
        <section className="relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2532&auto=format&fit=crop')",
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
                    Community Members
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-lg mx-auto sm:mx-0 drop-shadow-md">
                    Connect with fellow Lisu language learners and speakers
                  </p>
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Search & Filter Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 lg:mb-8 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base min-h-[44px] sm:min-h-0 touch-manipulation"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setPage(1);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:scale-95 transition-transform touch-manipulation"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </form>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 sm:gap-3">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:min-w-[200px] cursor-pointer min-h-[44px] sm:min-h-0 text-sm sm:text-base touch-manipulation"
                >
                  <option value="created_at">✨ Newest Members</option>
                  <option value="username">🔤 Username (A-Z)</option>
                  <option value="full_name">👤 Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="text-red-500 dark:text-red-400 mb-4 text-sm sm:text-base">{error}</div>
              <button
                onClick={fetchMembers}
                className="min-h-[44px] px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 active:bg-teal-800 transition-colors touch-manipulation active:scale-98 text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Members Grid */}
          {!loading && !error && members.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md active:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 group"
                  >
                    <div className="p-4 sm:p-5 lg:p-6">
                      {/* Avatar & Basic Info */}
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative">
                          {member.profile_photo_url && member.profile_photo_url.trim() !== '' ? (
                            <>
                              <img
                                src={member.profile_photo_url}
                                alt={member.username}
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                onLoad={(e) => {
                                  console.log('Image loaded successfully:', member.username);
                                  e.target.style.display = 'block';
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = 'none';
                                  }
                                }}
                                onError={(e) => {
                                  console.error('Image failed to load for', member.username, member.profile_photo_url);
                                  e.target.style.display = 'none';
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }
                                }}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-teal-500"
                                style={{ display: 'none' }}
                              />
                              <div
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold border-2 border-teal-500"
                              >
                                {getInitials(member.full_name || member.username)}
                              </div>
                            </>
                          ) : (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold border-2 border-teal-500">
                              {getInitials(member.full_name || member.username)}
                            </div>
                          )}
                        </div>

                        {/* Name & Username */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {member.full_name || member.username}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                            @{member.username}
                          </p>
                          {member.role && member.role !== 'user' && (
                            <div className="flex items-center gap-1 mt-1">
                              <ShieldCheckIcon className="h-3 w-3 flex-shrink-0 text-teal-600 dark:text-teal-400" />
                              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 capitalize">
                                {member.role}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4 py-2.5 sm:py-3 border-t border-b border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                          <div className="flex justify-center mb-1">
                            <DocumentTextIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                            {member.total_contributions || 0}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                            Posts
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex justify-center mb-1">
                            <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                            {member.discussion_count || 0}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                            Discussions
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex justify-center mb-1">
                            <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                            {member.chat_count || 0}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                            Messages
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-2 mb-3 sm:mb-4">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Joined {formatDate(member.created_at)}</span>
                        </div>
                      </div>

                      {/* View Profile Button */}
                      <Link
                        to={`/users/${member.id}`}
                        className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 active:from-teal-800 active:to-cyan-800 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md active:shadow-lg group min-h-[44px] flex items-center justify-center text-sm sm:text-base active:scale-98 touch-manipulation"
                      >
                        <span className="flex items-center justify-center gap-2">
                          View Profile
                          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  {/* Previous Button */}
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.has_prev}
                    className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors font-medium text-sm sm:text-base active:scale-98 touch-manipulation"
                  >
                    ← Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {[...Array(Math.min(5, pagination.total_pages))].map((_, idx) => {
                      let pageNum;
                      if (pagination.total_pages <= 5) {
                        pageNum = idx + 1;
                      } else if (page <= 3) {
                        pageNum = idx + 1;
                      } else if (page >= pagination.total_pages - 2) {
                        pageNum = pagination.total_pages - 4 + idx;
                      } else {
                        pageNum = page - 2 + idx;
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => setPage(pageNum)}
                          className={`min-w-[44px] min-h-[44px] sm:w-10 sm:h-10 px-3 sm:px-0 rounded-lg transition-all font-medium text-sm sm:text-base touch-manipulation active:scale-95 flex-shrink-0 ${page === pageNum
                            ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.has_next}
                    className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors font-medium text-sm sm:text-base active:scale-98 touch-manipulation"
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Showing X of Y */}
              {pagination && (
                <div className="flex justify-center mt-3 sm:mt-4">
                  <div className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 py-2 px-3 sm:px-4 rounded-lg">
                    Showing <span className="font-semibold text-teal-600 dark:text-teal-400">{pagination.from}</span> to{' '}
                    <span className="font-semibold text-teal-600 dark:text-teal-400">{pagination.to}</span> of{' '}
                    <span className="font-semibold text-teal-600 dark:text-teal-400">{pagination.total_count}</span> members
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && members.length === 0 && (
            <div className="text-center py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 px-4">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 sm:p-5 lg:p-6 rounded-full">
                  <UserGroupIcon className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                No members found
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto px-4">
                {searchQuery
                  ? `No members match your search "${searchQuery}". Try adjusting your search terms.`
                  : 'There are no members in the community yet. Be the first to join!'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="min-h-[44px] px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 active:from-teal-800 active:to-cyan-800 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md active:shadow-lg text-sm sm:text-base active:scale-98 touch-manipulation"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Members;
