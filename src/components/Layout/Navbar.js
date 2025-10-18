import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { notificationsAPI } from '../../services/notificationsAPI';
import socketClient from '../../services/socketClient';
import toast from 'react-hot-toast';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  SunIcon,
  MoonIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
    };

    // Initial check
    checkMobile();

    // Listen for window resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Fetch initial notifications when dropdown is opened
    }
  }, [user]);

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    if (user && socketClient.isConnected()) {
      console.log('Setting up notification listener in Navbar');

      socketClient.onNewNotification((notificationData) => {
        console.log('🔔 New notification received in Navbar:', notificationData);

        // Increment unread count
        setUnreadCount(prev => prev + 1);

        // Show toast notification
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
        // Clean up listener on unmount
        socketClient.off('notification:new');
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, notificationDropdownOpen]);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch notifications (top 5 for dropdown)
  const fetchNotifications = async () => {
    if (loadingNotifications) return;

    setLoadingNotifications(true);
    try {
      const response = await notificationsAPI.getNotifications({ limit: 5 });
      setNotifications(response.data || []);
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

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      // Refresh notifications and unread count
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      setNotificationDropdownOpen(false);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read
      if (!notification.is_read) {
        await notificationsAPI.markAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotificationDropdownOpen(false);
      navigate(notification.target_link);
    } catch (error) {
      console.error('Error handling notification click:', error);
      // Still navigate even if marking as read fails
      setNotificationDropdownOpen(false);
      navigate(notification.target_link);
    }
  };

  const handleNotificationIconClick = () => {
    // On mobile, navigate directly to notifications page
    if (isMobile) {
      navigate('/notifications');
    } else {
      // On desktop, toggle the dropdown popover
      setNotificationDropdownOpen(!notificationDropdownOpen);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavClick = (e, link) => {
    // If it's the Discussions link and user is not logged in, prevent default and redirect to login
    if (link.href === '/discussions' && !user) {
      e.preventDefault();
      navigate('/login', { state: { from: { pathname: '/discussions' }, message: 'Please log in to access discussions' } });
    }
  };

  const navigationLinks = [
    { name: 'Dictionary', href: '/dictionary' },
    { name: 'Discussions', href: '/discussions', requiresAuth: true },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo and Site Branding - Left Side */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              {/* Logo */}
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8m-8 2h8m-8 2h5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              {/* Site Name */}
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                  LISU
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">DICTIONARY</p>
              </div>
            </Link>
          </div>

          {/* Spacer - Left */}
          <div className="flex-1"></div>

          {/* Primary Navigation Links - Centered */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive(link.href)
                  ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-500'
                  : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Spacer - Right */}
          <div className="flex-1"></div>

          {/* User Account & Authentication - Right Side */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Notification Icon & Popover */}
                <div className="relative">
                  <button
                    onClick={handleNotificationIconClick}
                    className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
                    aria-label="Notifications"
                    title={isMobile ? "View notifications" : "Notifications"}
                  >
                    <BellIcon className="w-6 h-6" />
                    {/* Notification Badge - Shows count of unread notifications */}
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full ring-2 ring-white dark:ring-gray-800 px-1">
                        {unreadCount}
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
                      <div className="absolute right-0 sm:right-0 mt-2 w-[95vw] sm:w-[420px] max-w-[95vw] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden origin-top-right transform transition-all duration-200 ease-out">
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                          <div className="flex items-center gap-2 min-w-0">
                            <BellIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300 flex-shrink-0" />
                            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">Notifications</h3>
                            {unreadCount > 0 && (
                              <span className="flex-shrink-0 px-1.5 sm:px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-xs sm:text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium whitespace-nowrap flex-shrink-0 ml-2"
                            >
                              Mark All Read
                            </button>
                          )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                          {loadingNotifications ? (
                            <div className="py-8 sm:py-12 text-center px-4">
                              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-teal-600"></div>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">Loading notifications...</p>
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="py-8 sm:py-12 text-center px-4">
                              <BellIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300 dark:text-gray-600" />
                              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((notification) => {
                              const actorName = notification.actor_full_name || notification.actor_username || notification.actor_name || 'Someone';
                              const actorInitial = actorName[0]?.toUpperCase() || 'U';
                              const actorAvatar = notification.actor_profile_photo || notification.actor_avatar;

                              return (
                                <button
                                  key={notification.id}
                                  onClick={() => handleNotificationClick(notification)}
                                  className={`w-full text-left px-3 sm:px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${!notification.is_read ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''
                                    }`}
                                >
                                  <div className="flex gap-2 sm:gap-3">
                                    {/* User Avatar or Icon */}
                                    <div className="flex-shrink-0">
                                      {actorAvatar ? (
                                        <img
                                          src={actorAvatar}
                                          alt={actorName}
                                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                                          <span className="text-white font-semibold text-xs sm:text-sm">
                                            {actorInitial}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Notification Content */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        {actorName}
                                      </p>
                                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words leading-relaxed">
                                        {notification.message}
                                      </p>
                                      {notification.target_title && (
                                        <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-medium mt-1 break-words">
                                          "{notification.target_title}"
                                        </p>
                                      )}
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                                        {new Date(notification.created_at).toLocaleString()}
                                      </p>
                                    </div>

                                    {/* Unread Indicator */}
                                    {!notification.is_read && (
                                      <div className="flex-shrink-0 pt-1">
                                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
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
                          <div className="px-3 sm:px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                            <Link
                              to="/notifications"
                              onClick={() => setNotificationDropdownOpen(false)}
                              className="block w-full text-center px-3 sm:px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors"
                            >
                              View All Notifications
                            </Link>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* User Profile */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-500 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                      {user.profile_photo_url ? (
                        <img
                          src={user.profile_photo_url}
                          alt={user.full_name || 'User'}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          onLoad={(e) => {
                            console.log('Navbar image loaded successfully:', user.username || user.email);
                            e.target.style.display = 'block';
                          }}
                          onError={(e) => {
                            console.log('Navbar image failed to load:', user.username || user.email, user.profile_photo_url);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <UserIcon className={`w-5 h-5 text-white ${user.profile_photo_url ? 'hidden' : ''}`} />
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <div className="py-1">
                          <Link
                            to={`/users/${user.id}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                            My Profile
                          </Link>
                          <Link
                            to="/discussions?filter=my"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-3 text-gray-400" />
                            My Discussions
                          </Link>
                          <Link
                            to="/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <ChartPieIcon className="w-4 h-4 mr-3 text-gray-400" />
                            Dashboard
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-400" />
                            Settings
                          </Link>
                          {(user.role === 'admin' || user.role === 'moderator') && (
                            <Link
                              to="/admin"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <ShieldCheckIcon className="w-4 h-4 mr-3 text-gray-400" />
                              Admin Panel
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                          <button
                            onClick={() => {
                              toggleDarkMode();
                              setProfileDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {darkMode ? (
                              <>
                                <SunIcon className="w-4 h-4 mr-3 text-gray-400" />
                                Light Mode
                              </>
                            ) : (
                              <>
                                <MoonIcon className="w-4 h-4 mr-3 text-gray-400" />
                                Dark Mode
                              </>
                            )}
                          </button>
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
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors duration-200 shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {/* Navigation Links */}
          <div className="px-4 pt-4 pb-4 space-y-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={(e) => {
                  handleNavClick(e, link);
                  setIsOpen(false);
                }}
                className={`block px-4 py-3 text-base font-medium rounded-md transition-all duration-200 ${isActive(link.href)
                  ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Section for Mobile */}
          {user ? (
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-500 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                  {user.profile_photo_url ? (
                    <img
                      src={user.profile_photo_url}
                      alt={user.full_name || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <UserIcon className={`w-5 h-5 text-white ${user.profile_photo_url ? 'hidden' : ''}`} />
                </div>
              </div>

              <div className="space-y-1">
                {/* Notifications Link - Mobile Only */}
                <Link
                  to="/notifications"
                  className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <BellIcon className="w-5 h-5 mr-3 text-gray-400" />
                    Notifications
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to={`/users/${user.id}`}
                  className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
                  My Profile
                </Link>
                <Link
                  to="/discussions?filter=my"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3 text-gray-400" />
                  My Discussions
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <ChartPieIcon className="w-5 h-5 mr-3 text-gray-400" />
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400" />
                  Settings
                </Link>
                {(user.role === 'admin' || user.role === 'moderator') && (
                  <Link
                    to="/admin"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShieldCheckIcon className="w-5 h-5 mr-3 text-gray-400" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                  Logout
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md mt-2 border-t border-gray-200 dark:border-gray-700 pt-4"
                >
                  {darkMode ? (
                    <>
                      <SunIcon className="w-5 h-5 mr-3 text-gray-400" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <MoonIcon className="w-5 h-5 mr-3 text-gray-400" />
                      Dark Mode
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-3 text-sm font-medium text-center text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 text-sm font-medium text-center text-white bg-teal-600 hover:bg-teal-700 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 mt-4"
                >
                  {darkMode ? (
                    <>
                      <SunIcon className="w-5 h-5 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <MoonIcon className="w-5 h-5 mr-2" />
                      Dark Mode
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
