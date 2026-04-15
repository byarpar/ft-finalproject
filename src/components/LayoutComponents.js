import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import useMobileDetect from '../hooks/useMobileDetect';
import useClickOutside from '../hooks/useClickOutside';
import { notificationsAPI } from '../services/api';
import {
  EnvelopeIcon,
  HeartIcon,
  QuestionMarkCircleIcon,
  UserIcon,
  UserGroupIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartPieIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * Consolidated Layout Components
 * Combined smaller layout utility components into a single file
 */

/**
 * NavigationLinks Component
 * Main navigation links for the header
 */
export const NavigationLinks = ({ isActive }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await notificationsAPI.getNotifications({ page: 1, limit: 1 });
      const payload = res?.data || res || {};
      const unread = Number(payload.unreadCount || 0);
      setUnreadCount(Number.isFinite(unread) ? unread : 0);
    } catch {
      // Keep navbar quiet on transient failures.
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();

    if (!user) return undefined;
    const timer = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(timer);
  }, [fetchUnreadCount, user]);

  // helper for link styling
  const linkClass = (path) => `px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${isActive(path)
    ? 'bg-emerald-100 text-emerald-900 shadow-sm'
    : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
    }`;

  return (
    <div className="hidden lg:flex items-center gap-2">
      <Link
        to="/discussions"
        className={linkClass('/discussions')}
      >
        Forum
      </Link>

      {/* link to members page */}
      <Link
        to="/users"
        className={linkClass('/users')}
      >
        Members
      </Link>

      {/* New Discussion button - only for logged-in users */}
      {user && (
        <>
          <Link
            to="/notifications"
            className="relative p-2 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
            title="Notifications"
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <Link
            to="/discussions/new"
            className="p-2 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
            title="Ask Question"
          >
            <QuestionMarkCircleIcon className="w-5 h-5" />
          </Link>
        </>
      )}
    </div>
  );
};

/**
 * PageLayout Component
 * Universal page layout wrapper with consistent structure.
 * When showHeader=true, renders a teal gradient banner with title, icon and optional actions.
 */
export const PageLayout = ({
  children,
  title,
  description,
  headerIcon = null,
  headerActions = null,
  showHeader = false,
  className = '',
  fullWidth = false,
  background = 'bg-white'
}) => {
  return (
    <div
      className={`min-h-screen ${background} transition-colors duration-300`}
      role="main"
    >
      {/* Teal gradient page header banner */}
      {showHeader && title && (
        <div className="bg-gradient-to-r from-teal-700 to-teal-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {headerIcon && (
                  <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    {headerIcon}
                  </div>
                )}
                <div>
                  <h1 className="app-title text-2xl sm:text-3xl text-white">{title}</h1>
                  {description && (
                    <p className="app-subtitle mt-1 text-teal-100 text-sm sm:text-base max-w-2xl">{description}</p>
                  )}
                </div>
              </div>
              {headerActions && (
                <div className="flex items-center gap-3 flex-shrink-0 mt-1">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className={fullWidth ? className : `container mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
        {children}
      </div>
    </div>
  );
};

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  headerIcon: PropTypes.node,
  headerActions: PropTypes.node,
  showHeader: PropTypes.bool,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  background: PropTypes.string
};

/**
 * MobileMenu Component
 * Mobile navigation menu with user actions
 */
export const MobileMenu = ({
  isOpen,
  setIsOpen,
  isActive,
  handleLogout
}) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await notificationsAPI.getNotifications({ page: 1, limit: 1 });
      const payload = res?.data || res || {};
      const unread = Number(payload.unreadCount || 0);
      setUnreadCount(Number.isFinite(unread) ? unread : 0);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  if (!isOpen) return null;

  return (
    <div
      className={`absolute top-full left-0 right-0 z-40 md:hidden bg-slate-50/95 backdrop-blur-md border-t border-emerald-100 shadow-xl max-h-[calc(100vh-6.5rem)] overflow-y-auto transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
      role="dialog"
      aria-label="Mobile navigation"
    >
      <div className="px-4 pt-3 pb-3 space-y-1">
        <p className="px-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Explore</p>
        <Link
          to="/discussions"
          onClick={() => setIsOpen(false)}
          className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${isActive('/discussions')
            ? 'bg-emerald-100 text-emerald-900'
            : 'text-slate-700 hover:bg-emerald-50'
            }`}
        >
          <QuestionMarkCircleIcon className="w-5 h-5 mr-3 text-slate-500" />
          Bee Forum
        </Link>
        <Link
          to="/users"
          onClick={() => setIsOpen(false)}
          className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/users')
            ? 'bg-emerald-100 text-emerald-900'
            : 'text-slate-700 hover:bg-emerald-50'
            }`}
        >
          <UserGroupIcon className="w-5 h-5 mr-3 text-slate-500" />
          Members
        </Link>
        {user && (
          <>
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/notifications')
                ? 'bg-emerald-100 text-emerald-900'
                : 'text-slate-700 hover:bg-emerald-50'
                }`}
            >
              <div className="relative mr-3">
                <BellIcon className="w-5 h-5 text-slate-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              Notifications
            </Link>
            <Link
              to="/discussions/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-md"
            >
              <QuestionMarkCircleIcon className="w-5 h-5 mr-3 text-emerald-600" />
              + New Discussion
            </Link>
          </>
        )}
      </div>
      {user ? (
        <div className="px-4 py-4 border-t border-emerald-100">
          <p className="px-2 pb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Account</p>
          <div className="space-y-1">
            <Link to={`/users/${user.id}`} onClick={() => setIsOpen(false)} className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 rounded-xl">
              <UserIcon className="w-5 h-5 mr-3 text-slate-400" />My Profile
            </Link>
            <Link to="/messages" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 rounded-xl">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3 text-slate-400" />Messages
            </Link>
            <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 rounded-xl">
              <Cog6ToothIcon className="w-5 h-5 mr-3 text-slate-400" />Settings
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 rounded-xl">
                <ChartPieIcon className="w-5 h-5 mr-3 text-slate-400" />Admin Dashboard
              </Link>
            )}
            <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl">
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-red-500" />Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 border-t border-emerald-100 space-y-2">
          <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 text-sm font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors">
            Log In
          </Link>
          <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors">
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

/**
 * Footer Component 
 * Site footer with links and newsletter
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribeStatus('Thank you for subscribing!');
      setEmail('');
      setTimeout(() => setSubscribeStatus(''), 3000);
    }
  };

  return (
    <footer className="bg-gradient-to-r from-teal-800 to-teal-900 text-teal-50 border-t border-teal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.png" alt="Modern Discussion Forum Logo" className="w-10 h-10 object-contain" />
              </div>
              <span className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                Modern Discussion Forum
              </span>
            </Link>
            <p className="text-sm text-teal-100 leading-relaxed">
              A community-driven platform for developers to share knowledge, discuss technologies, and collaborate on projects.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Community</h3>
            <div className="space-y-2">
              <Link to="/discussions" className="block text-sm text-teal-200 hover:text-teal-300 transition-colors">
                Discussions
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-teal-700 border border-teal-600 rounded-md text-white placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-500 transition-colors flex items-center justify-center space-x-2"
              >
                <EnvelopeIcon className="w-4 h-4" />
                <span>Subscribe</span>
              </button>
            </form>
            {subscribeStatus && (
              <p className="text-sm text-teal-300">{subscribeStatus}</p>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Connect</h3>
            <p className="text-sm text-teal-100">
              Join our community and help preserve the Lisu language for future generations.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-teal-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-teal-200">
              © {currentYear} Modern Discussion Forum. Made with{' '}
              <HeartIcon className="w-4 h-4 inline text-red-500" /> for the developer community.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

/**
 * UserActions Component
 * User authentication and profile actions
 */
export const UserActions = ({
  user,
  isOpen,
  setIsOpen,
  userProfileDropdownOpen,
  setUserProfileDropdownOpen,
  handleLogout,
  userDropdownRef,
  isMobile
}) => {
  return (
    <div className="flex items-center gap-3">
      {!user ? (
        <>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-white hover:text-emerald-100 transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium bg-white text-emerald-700 rounded-md hover:bg-emerald-50 transition-colors">
              Sign Up
            </Link>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-white hover:bg-white/15 rounded-lg transition-colors"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </>
      ) : (
        <>
          <div className="hidden md:flex items-center gap-2">
            <Link to="/discussions" className="p-2 text-white hover:bg-white/15 rounded-md transition-colors">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
            </Link>
          </div>
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserProfileDropdownOpen(!userProfileDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-2 text-white hover:bg-white/15 rounded-lg transition-colors"
              aria-label="Open user menu"
            >
              <div className="avatar-unified bg-gradient-to-r from-emerald-400 to-teal-600 text-white text-sm font-bold ring-2 ring-white/50">
                {user.username?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{user.username}</span>
            </button>

            {userProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                <Link to={`/users/${user.id}`} className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50">
                  <UserIcon className="w-4 h-4 mr-3" />
                  My Profile
                </Link>
                <Link to="/messages" className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-3" />
                  Messages
                </Link>
                <Link to="/settings" className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50">
                  <Cog6ToothIcon className="w-4 h-4 mr-3" />
                  Settings
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50">
                    <ChartPieIcon className="w-4 h-4 mr-3" />
                    Admin Dashboard
                  </Link>
                )}
                <hr className="my-1 border-slate-100" />
                <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-white hover:bg-white/15 rounded-lg transition-colors"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </>
      )}
    </div>
  );
};

/**
 * Navbar Component
 * Main navigation bar with user actions
 */
export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [userProfileDropdownOpen, setUserProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userDropdownRef = useRef(null);
  const isMobile = useMobileDetect();

  useEffect(() => {
    setIsOpen(false);
    setUserProfileDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) return undefined;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  // marks link active when pathname matches or is a sub-route
  const isActive = (path) => {
    const { pathname } = location;
    if (path === '/users') {
      // both '/users' and legacy '/discussions/members' should highlight
      return pathname === '/users' || pathname.startsWith('/users/') || pathname === '/discussions/members';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  useClickOutside(userDropdownRef, () => setUserProfileDropdownOpen(false));

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discussions?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-700 border-b border-white/15 shadow-lg relative backdrop-blur-sm">
      {isOpen && <div className="md:hidden fixed inset-0 top-[88px] bg-slate-900/20" onClick={() => setIsOpen(false)} aria-hidden="true" />}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 group min-w-0">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="Modern Discussion Forum Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-lg" />
          </div>
          <span className="hidden sm:inline text-lg lg:text-xl font-bold text-white group-hover:text-emerald-100 transition-colors truncate">
            Modern Discussion Forum
          </span>
          <span className="sm:hidden text-base font-bold text-white group-hover:text-emerald-100 transition-colors truncate">
            Forum
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4 flex-1 justify-center px-4">
          <form onSubmit={handleSearch} className="w-full max-w-xs">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-700/70 pointer-events-none" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white/95 border border-white/60 rounded-xl text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <NavigationLinks isActive={isActive} />
          <UserActions
            user={user}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            userProfileDropdownOpen={userProfileDropdownOpen}
            setUserProfileDropdownOpen={setUserProfileDropdownOpen}
            handleLogout={handleLogout}
            userDropdownRef={userDropdownRef}
            isMobile={isMobile}
          />
        </div>
      </div>

      <div className="md:hidden px-3 pb-2">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-700/70 pointer-events-none" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white/95 border border-white/60 rounded-xl text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
            />
          </div>
        </form>
      </div>

      <MobileMenu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isActive={isActive}
        handleLogout={handleLogout}
      />
    </div>
  );
};

// Default exports for backward compatibility
const LayoutComponents = {
  NavigationLinks,
  PageLayout,
  MobileMenu,
  Footer,
  UserActions,
  Navbar
};

export default LayoutComponents;