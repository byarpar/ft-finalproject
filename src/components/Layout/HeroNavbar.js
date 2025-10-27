import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BellIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  InformationCircleIcon,
  BookOpenIcon,
  PlusCircleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsAPI } from '../../services/notificationsAPI';
import socketClient from '../../services/socketClient';
import toast from 'react-hot-toast';
import useMobileDetect from '../../hooks/useMobileDetect';
import useClickOutside from '../../hooks/useClickOutside';
import useNotifications from '../../hooks/useNotifications';

const HeroNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [userProfileDropdownOpen, setUserProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [profileImageLoaded, setProfileImageLoaded] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  const userDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Use shared utilities
  const isMobile = useMobileDetect();
  const { unreadCount } = useNotifications(user, socketClient);

  // Check if route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Close dropdowns when clicking outside
  useClickOutside(userDropdownRef, () => setUserProfileDropdownOpen(false));
  useClickOutside(notificationDropdownRef, () => setNotificationDropdownOpen(false));

  // Reset profile image state when user changes (e.g., after login)
  useEffect(() => {
    setProfileImageLoaded(false);
    setProfileImageError(false);
  }, [user?.profile_photo_url]);

  // Fetch notifications (top 3 for dropdown)
  const fetchNotifications = async () => {
    if (loadingNotifications) return;

    setLoadingNotifications(true);
    try {
      const response = await notificationsAPI.getNotifications({ limit: 3 });
      setNotifications(response.data?.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (notificationDropdownOpen && user) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationDropdownOpen, user]);

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    if (user && socketClient.isConnected()) {
      socketClient.onNewNotification((notificationData) => {
        toast.success(`${notificationData.actorName} ${notificationData.message}`, {
          duration: 4000,
          position: 'top-right',
          icon: '🔔'
        });

        // Refresh notifications if dropdown is open
        if (notificationDropdownOpen) {
          fetchNotifications();
        }
      });

      return () => {
        socketClient.off('notification:new');
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, notificationDropdownOpen]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  // Handle mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setNotificationDropdownOpen(false);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await notificationsAPI.markAsRead(notification.id);
      }
      setNotificationDropdownOpen(false);
      navigate(notification.target_link);
    } catch (error) {
      console.error('Error handling notification click:', error);
      setNotificationDropdownOpen(false);
      navigate(notification.target_link);
    }
  };

  // Handle notification icon click
  const handleNotificationIconClick = () => {
    if (isMobile) {
      navigate('/notifications');
    } else {
      setNotificationDropdownOpen(!notificationDropdownOpen);
    }
  };

  return (
    <div className="relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <img
              src="/navbar.png"
              alt="Lisu Dictionary Logo"
              className="w-12 h-12 object-contain drop-shadow-lg"
            />
          </div>
          <div className="text-white">
            <h1 className="text-xl font-bold tracking-wide uppercase group-hover:text-teal-100 transition-colors">LISU</h1>
            <p className="text-xs font-light tracking-widest uppercase -mt-1 opacity-90">DICTIONARY</p>
          </div>
        </Link>

        {/* Center Navigation Links - Desktop only, show when logged in */}
        {user && !isMobile && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/')
                ? 'bg-white/10 text-white'
                : 'text-white hover:text-teal-100 hover:bg-white/5'
                }`}
            >
              Home
            </Link>
            <Link
              to="/discussions"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/discussions')
                ? 'bg-white/10 text-white'
                : 'text-white hover:text-teal-100 hover:bg-white/5'
                }`}
            >
              Discussions
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/about')
                ? 'bg-white/10 text-white'
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
              {/* Desktop: Login/Sign Up buttons */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 backdrop-blur-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 text-sm font-medium text-teal-700 bg-white hover:bg-gray-50 rounded-full transition-all duration-200 shadow-lg"
                >
                  Sign Up
                </Link>
              </div>

              {/* Mobile Menu Button - Show only when not logged in */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden relative p-2.5 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20 shadow-lg group"
                aria-label="Toggle menu"
              >
                <div className="relative w-6 h-6 flex items-center justify-center">
                  {/* Animated Hamburger/Close Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Bars3Icon
                      className={`w-6 h-6 transition-all duration-300 ${isOpen
                        ? 'opacity-0 rotate-180 scale-0'
                        : 'opacity-100 rotate-0 scale-100'
                        }`}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <XMarkIcon
                      className={`w-6 h-6 transition-all duration-300 ${isOpen
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 -rotate-180 scale-0'
                        }`}
                    />
                  </div>
                </div>
              </button>
            </>
          ) : (
            <>
              {/* Notification Icon with Badge & Dropdown */}
              <div className="relative" ref={notificationDropdownRef}>
                <button
                  onClick={handleNotificationIconClick}
                  className="relative hover:opacity-80 transition-opacity p-1"
                  aria-label="Notifications"
                  title={isMobile ? "View notifications" : "Notifications"}
                >
                  <BellIcon className="w-6 h-6 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-teal-600">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown - Only shown on desktop */}
                {!isMobile && notificationDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-[320px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden origin-top-right transform transition-all duration-200 ease-out">
                      {/* Header */}
                      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <BellIcon className="w-4 h-4 text-gray-700 flex-shrink-0" />
                          <h3 className="font-semibold text-sm text-gray-900 truncate">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-teal-600 hover:text-teal-700:text-teal-300 font-medium whitespace-nowrap flex-shrink-0 ml-2"
                          >
                            Mark All
                          </button>
                        )}
                      </div>

                      {/* Notification List */}
                      <div className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        {loadingNotifications ? (
                          <div className="py-6 text-center px-3">
                            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
                            <p className="text-xs text-gray-500 mt-2">Loading...</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="py-6 text-center px-3">
                            <BellIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs text-gray-500">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notification) => {
                            const actorName = notification.actor_full_name || notification.actor_username || notification.actor_name || 'Someone';
                            const actorInitial = actorName[0]?.toUpperCase() || 'U';
                            const actorAvatar = notification.actor_profile_photo || notification.actor_avatar || notification.actor_profile_photo_url;

                            return (
                              <button
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${!notification.is_read ? 'bg-teal-50/50' : ''
                                  }`}
                              >
                                <div className="flex gap-2">
                                  {/* User Avatar or Icon */}
                                  <div className="flex-shrink-0">
                                    {actorAvatar ? (
                                      <div className="relative w-8 h-8">
                                        <img
                                          src={actorAvatar}
                                          alt={actorName}
                                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                          crossOrigin="anonymous"
                                          referrerPolicy="no-referrer"
                                          onError={(e) => {
                                            // Hide broken image and show fallback
                                            e.target.style.display = 'none';
                                            const fallback = e.target.nextElementSibling;
                                            if (fallback) fallback.style.display = 'flex';
                                          }}
                                        />
                                        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full items-center justify-center hidden">
                                          <span className="text-white font-semibold text-xs">
                                            {actorInitial}
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-xs">
                                          {actorInitial}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Notification Content */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-900 mb-0.5">
                                      {actorName}
                                    </p>
                                    <p className="text-xs text-gray-700 break-words leading-snug">
                                      {notification.message}
                                    </p>
                                    {notification.target_title && (
                                      <p className="text-xs text-gray-900 font-medium mt-0.5 break-words line-clamp-1">
                                        "{notification.target_title}"
                                      </p>
                                    )}
                                    <p className="text-[10px] text-gray-500 mt-1">
                                      {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                  </div>

                                  {/* Unread Indicator */}
                                  {!notification.is_read && (
                                    <div className="flex-shrink-0 pt-1">
                                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
                          <Link
                            to="/notifications"
                            onClick={() => setNotificationDropdownOpen(false)}
                            className="block w-full text-center px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-md transition-colors"
                          >
                            View All
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Desktop: Profile Button with Dropdown */}
              <div className="hidden md:block relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserProfileDropdownOpen(!userProfileDropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 text-white font-medium rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-500 rounded-full flex items-center justify-center shadow-sm overflow-hidden relative">
                    {user.profile_photo_url && !profileImageError ? (
                      <img
                        src={user.profile_photo_url}
                        alt={user.full_name || user.username || 'User'}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${profileImageLoaded ? 'opacity-100' : 'opacity-0'
                          }`}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onLoad={() => setProfileImageLoaded(true)}
                        onError={() => {
                          setProfileImageError(true);
                          setProfileImageLoaded(false);
                        }}
                      />
                    ) : null}
                    <UserIcon
                      className={`w-5 h-5 text-white transition-opacity duration-300 ${user.profile_photo_url && profileImageLoaded && !profileImageError ? 'opacity-0 absolute' : 'opacity-100'
                        }`}
                    />
                  </div>
                </button>

                {/* User Profile Dropdown Menu */}
                {userProfileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="py-1">
                        <Link
                          to={`/users/${user.id}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50:bg-gray-700"
                          onClick={() => setUserProfileDropdownOpen(false)}
                        >
                          <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                          My Profile
                        </Link>
                        <Link
                          to="/chat"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50:bg-gray-700"
                          onClick={() => setUserProfileDropdownOpen(false)}
                        >
                          <ChatBubbleLeftRightIcon className="w-4 h-4 mr-3 text-gray-400" />
                          Messages
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50:bg-gray-700"
                            onClick={() => setUserProfileDropdownOpen(false)}
                          >
                            <ShieldCheckIcon className="w-4 h-4 mr-3 text-teal-600" />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50:bg-gray-700"
                          onClick={() => setUserProfileDropdownOpen(false)}
                        >
                          <ChartPieIcon className="w-4 h-4 mr-3 text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50:bg-gray-700"
                          onClick={() => setUserProfileDropdownOpen(false)}
                        >
                          <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-400" />
                          Settings
                        </Link>
                      </div>

                      <div className="border-t border-gray-200 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50:bg-gray-700"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Mobile Menu Button - Animated Professional Design (for logged in users) */}
          {user && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden relative p-2.5 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 ml-2 backdrop-blur-sm border border-white/20 shadow-lg group"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                {/* Animated Hamburger/Close Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bars3Icon
                    className={`w-6 h-6 transition-all duration-300 ${isOpen
                      ? 'opacity-0 rotate-180 scale-0'
                      : 'opacity-100 rotate-0 scale-100'
                      }`}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <XMarkIcon
                    className={`w-6 h-6 transition-all duration-300 ${isOpen
                      ? 'opacity-100 rotate-0 scale-100'
                      : 'opacity-0 -rotate-180 scale-0'
                      }`}
                  />
                </div>
              </div>

              {/* Notification badge on menu button if user has unread notifications */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-teal-600 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-white/20">
          {/* Only show navigation links when logged in */}
          {user && (
            <>
              {/* Navigation Links - Always show these main links when logged in */}
              <div className="px-4 pt-4 pb-2 space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/')
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <HomeIcon className="w-5 h-5 mr-3 text-gray-500" />
                  Home
                </Link>
                <Link
                  to="/discussions"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/discussions')
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <ChatBubbleBottomCenterTextIcon className="w-5 h-5 mr-3 text-gray-500" />
                  Discussions
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/about')
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <InformationCircleIcon className="w-5 h-5 mr-3 text-gray-500" />
                  About Us
                </Link>
              </div>

              {/* Additional links */}
              <div className="px-4 pb-4 space-y-1">
                <Link
                  to="/dictionary"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/dictionary')
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <BookOpenIcon className="w-5 h-5 mr-3 text-gray-500" />
                  Dictionary
                </Link>
                <Link
                  to="/contribute"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/contribute')
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <PlusCircleIcon className="w-5 h-5 mr-3 text-gray-500" />
                  Contribute
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/contact')
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <EnvelopeIcon className="w-5 h-5 mr-3 text-gray-500" />
                  Contact
                </Link>
              </div>
            </>
          )}

          {/* User Section for Mobile */}
          {user ? (
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="space-y-1">
                <Link
                  to={`/users/${user.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
                  My Profile
                </Link>
                <Link
                  to="/chat"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3 text-gray-400" />
                  Messages
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <BellIcon className="w-5 h-5 mr-3 text-gray-400" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <ChartPieIcon className="w-5 h-5 mr-3 text-gray-400" />
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400" />
                  Settings
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <ShieldCheckIcon className="w-5 h-5 mr-3 text-teal-600" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4">
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full px-6 py-3 text-base font-medium text-gray-700 bg-white border-2 border-teal-600 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-all duration-200 shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeroNavbar;
