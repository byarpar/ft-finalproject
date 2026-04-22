import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import useMobileDetect from '../hooks/useMobileDetect';
import useClickOutside from '../hooks/useClickOutside';
import { notificationsAPI, messagesAPI, discussionsAPI, usersAPI } from '../services/api';
import {
  EnvelopeIcon,
  HeartIcon,
  UserIcon,
  UserGroupIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartPieIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  ChevronRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

/**
 * Consolidated Layout Components
 * Combined smaller layout utility components into a single file
 */

/**
 * NavIconButton — icon button with tooltip used in the desktop nav bar.
 */
const NavIconButton = ({ to, icon: Icon, label, isActive, badge }) => (
  <Link
    to={to}
    className={`relative group p-2.5 rounded-xl transition-all duration-200 ${isActive
      ? 'bg-white/20 text-white'
      : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
    aria-label={label}
    aria-current={isActive ? 'page' : undefined}
  >
    <Icon className="w-5 h-5" />
    {badge > 0 && (
      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none ring-2 ring-teal-700">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
    {/* Active underline indicator */}
    {isActive && (
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
    )}
    {/* Tooltip */}
    <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 text-xs font-medium bg-teal-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
      {label}
      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-teal-900 rotate-45 rounded-[1px]" />
    </span>
  </Link>
);

/**
 * NavigationLinks Component
 * Icon-based desktop navigation for the header
 */
export const NavigationLinks = ({ isActive }) => {
  const { user } = useAuth();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchCounts = useCallback(async () => {
    if (!user) {
      setUnreadNotifs(0);
      setUnreadMessages(0);
      return;
    }

    try {
      const [notifRes, msgRes] = await Promise.allSettled([
        notificationsAPI.getNotifications({ page: 1, limit: 1 }),
        messagesAPI.getConversations()
      ]);

      if (notifRes.status === 'fulfilled') {
        const payload = notifRes.value?.data || notifRes.value || {};
        const count = Number(payload.unreadCount || 0);
        setUnreadNotifs(Number.isFinite(count) ? count : 0);
      }

      if (msgRes.status === 'fulfilled') {
        const convos = msgRes.value?.data || msgRes.value || [];
        const unread = Array.isArray(convos)
          ? convos.filter(c => c.unread_count > 0).length
          : 0;
        setUnreadMessages(unread);
      }
    } catch {
      setUnreadNotifs(0);
      setUnreadMessages(0);
    }
  }, [user]);

  useEffect(() => {
    fetchCounts();
    if (!user) return undefined;
    const timer = setInterval(fetchCounts, 30000);
    return () => clearInterval(timer);
  }, [fetchCounts, user]);

  return (
    <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
      <NavIconButton
        to="/discussions"
        icon={ChatBubbleLeftRightIcon}
        label="Forum"
        isActive={isActive('/discussions')}
      />
      <NavIconButton
        to="/users"
        icon={UserGroupIcon}
        label="Members"
        isActive={isActive('/users')}
      />

      {user && (
        <>
          <NavIconButton
            to="/messages"
            icon={EnvelopeIcon}
            label="Messages"
            isActive={isActive('/messages')}
            badge={unreadMessages}
          />
          <NavIconButton
            to="/notifications"
            icon={BellIcon}
            label="Notifications"
            isActive={isActive('/notifications')}
            badge={unreadNotifs}
          />
        </>
      )}
    </nav>
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
        <div className="bg-teal-600">
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
 * Full-screen mobile navigation panel with user card, categorized links, and actions.
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

  const navLink = (to, icon, label, extra) => (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive(to)
        ? 'bg-teal-50 text-teal-900 font-semibold'
        : 'text-slate-700 hover:bg-slate-50'
        }`}
    >
      <div className="flex items-center gap-3">
        {React.createElement(icon, { className: `w-5 h-5 ${isActive(to) ? 'text-teal-600' : 'text-slate-400'}` })}
        <span>{label}</span>
        {extra}
      </div>
      <ChevronRightIcon className="w-4 h-4 text-slate-300" />
    </Link>
  );

  return (
    <div
      className="absolute top-full left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto"
      role="dialog"
      aria-label="Mobile navigation"
    >
      {/* User info card */}
      {user && (
        <div className="px-5 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-md overflow-hidden">
              {user.profile_photo_url ? (
                <img src={user.profile_photo_url} alt={user.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-white text-sm font-bold">{user.username?.[0]?.toUpperCase() || '?'}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name || user.username}</p>
              <p className="text-xs text-slate-500 truncate">@{user.username}</p>
            </div>
            {user.role === 'admin' && (
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Admin</span>
            )}
          </div>
        </div>
      )}

      {/* Explore section */}
      <div className="px-4 pt-3 pb-1">
        <p className="px-2 pb-2 text-[11px] font-semibold tracking-widest text-slate-400 uppercase">Explore</p>
        <div className="space-y-0.5">
          {navLink('/discussions', ChatBubbleLeftRightIcon, 'Forum')}
          {navLink('/users', UserGroupIcon, 'Members')}
        </div>
      </div>

      {/* Logged-in actions */}
      {user && (
        <>
          <div className="px-4 pt-3 pb-1">
            <p className="px-2 pb-2 text-[11px] font-semibold tracking-widest text-slate-400 uppercase">Activity</p>
            <div className="space-y-0.5">
              {navLink('/messages', EnvelopeIcon, 'Messages')}
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive('/notifications')
                  ? 'bg-teal-50 text-teal-900 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <BellIcon className={`w-5 h-5 ${isActive('/notifications') ? 'text-teal-600' : 'text-slate-400'}`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>Notifications</span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-300" />
              </Link>
              <Link
                to="/discussions/new"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-xl"
              >
                <SparklesIcon className="w-5 h-5 text-teal-500" />
                <span>New Discussion</span>
              </Link>
            </div>
          </div>

          {/* Account section */}
          <div className="px-4 pt-3 pb-2 border-t border-slate-100">
            <p className="px-2 pb-2 text-[11px] font-semibold tracking-widest text-slate-400 uppercase">Account</p>
            <div className="space-y-0.5">
              {navLink(`/users/${user.id}`, UserIcon, 'My Profile')}
              {navLink('/settings', Cog6ToothIcon, 'Settings')}
              {user.role === 'admin' && navLink('/admin', ChartPieIcon, 'Admin Dashboard')}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Logged-out auth buttons */}
      {!user && (
        <div className="px-5 py-4 border-t border-slate-100 space-y-2">
          <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors">
            Log In
          </Link>
          <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors">
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
    <footer className="bg-teal-800 text-teal-50 border-t border-teal-700">
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
              Join our community and connect with fellow developers and learners.
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
 * Profile avatar dropdown and auth buttons for the header right side
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
    <div className="flex items-center gap-2">
      {!user ? (
        <>
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-white text-teal-700 rounded-lg hover:bg-teal-50 transition-colors shadow-sm">
              Sign Up
            </Link>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </>
      ) : (
        <>
          {/* Ask Question CTA — desktop only */}
          <Link
            to="/discussions/new"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-white text-teal-700 rounded-lg hover:bg-teal-50 transition-colors shadow-sm"
          >
            <SparklesIcon className="w-4 h-4" />
            <span className="hidden lg:inline">Ask</span>
          </Link>

          {/* Profile dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserProfileDropdownOpen(!userProfileDropdownOpen)}
              onKeyDown={(e) => e.key === 'Escape' && setUserProfileDropdownOpen(false)}
              className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Open user menu"
              aria-expanded={userProfileDropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center ring-2 ring-white/40 overflow-hidden shadow-md">
                {user.profile_photo_url ? (
                  <img src={user.profile_photo_url} alt={user.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-white text-xs font-bold">{user.username?.[0]?.toUpperCase() || '?'}</span>
                )}
              </div>
              <span className="hidden lg:inline text-sm font-medium text-white/90">{user.username}</span>
            </button>

            {userProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-1 z-50 overflow-hidden">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name || user.username}</p>
                  <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                </div>

                <div className="py-1">
                  <Link
                    to={`/users/${user.id}`}
                    onClick={() => setUserProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/messages"
                    onClick={() => setUserProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-slate-400" />
                    Messages
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setUserProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                  >
                    <Cog6ToothIcon className="w-4 h-4 text-slate-400" />
                    Settings
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <ChartPieIcon className="w-4 h-4 text-slate-400" />
                      Admin Dashboard
                    </Link>
                  )}
                </div>

                <hr className="border-slate-100" />
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 text-rose-400" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
 * Sticky, scroll-aware navigation bar with icon nav, center search, and utility cluster.
 * Keyboard shortcuts: ⌘K (search), Escape (close dropdowns).
 */
export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [userProfileDropdownOpen, setUserProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState({ discussions: [], members: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const userDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const searchTimerRef = useRef(null);
  const isMobile = useMobileDetect();

  // Close everything on route change
  useEffect(() => {
    setIsOpen(false);
    setUserProfileDropdownOpen(false);
    setMobileSearchOpen(false);
    setShowSearchDropdown(false);
    setSearchQuery('');
    setSearchResults({ discussions: [], members: [] });
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!isMobile) return undefined;
    document.body.style.overflow = isOpen || mobileSearchOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen, mobileSearchOpen]);

  // Scroll awareness — add shadow and blur when scrolled
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcuts: ⌘K for search, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isMobile) {
          setMobileSearchOpen(true);
          setTimeout(() => mobileSearchRef.current?.focus(), 100);
        } else {
          searchInputRef.current?.focus();
        }
      }
      if (e.key === 'Escape') {
        setUserProfileDropdownOpen(false);
        setMobileSearchOpen(false);
        setShowSearchDropdown(false);
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  // Close search dropdown on outside click
  useClickOutside(searchDropdownRef, () => setShowSearchDropdown(false));

  // Debounced multi-source search
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults({ discussions: [], members: [] });
      setShowSearchDropdown(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchDropdown(true);

    try {
      const [discRes, usersRes] = await Promise.allSettled([
        discussionsAPI.getDiscussions({ search: query.trim(), limit: 5 }),
        usersAPI.getAllUsers({ search: query.trim(), limit: 5 })
      ]);

      const discussions = discRes.status === 'fulfilled'
        ? (discRes.value?.data?.discussions || discRes.value?.discussions || []).slice(0, 5)
        : [];

      const members = usersRes.status === 'fulfilled'
        ? (usersRes.value?.data?.users || usersRes.value?.users || usersRes.value?.data || []).slice(0, 5)
        : [];

      setSearchResults({ discussions, members });
    } catch {
      setSearchResults({ discussions: [], members: [] });
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!value || value.trim().length < 2) {
      setSearchResults({ discussions: [], members: [] });
      setShowSearchDropdown(false);
      return;
    }
    searchTimerRef.current = setTimeout(() => performSearch(value), 250);
  }, [performSearch]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  // Active link detection
  const isActive = (path) => {
    const { pathname } = location;
    if (path === '/users') {
      return pathname === '/users' || pathname.startsWith('/users/') || pathname === '/discussions/members';
    }
    if (path === '/discussions') {
      return pathname === '/discussions' || (pathname.startsWith('/discussions/') && pathname !== '/discussions/new');
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
      navigate(`/discussions?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileSearchOpen(false);
      setShowSearchDropdown(false);
      setSearchResults({ discussions: [], members: [] });
    }
  };

  const hasResults = searchResults.discussions.length > 0 || searchResults.members.length > 0;
  const totalResults = searchResults.discussions.length + searchResults.members.length;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-teal-700/95 backdrop-blur-md shadow-lg shadow-teal-900/10'
          : 'bg-teal-700'
          }`}
        role="navigation"
        aria-label="Primary"
      >
        {/* Backdrop overlay for mobile menu */}
        {isOpen && (
          <div
            className="md:hidden fixed inset-0 top-14 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-3">

            {/* ─── Left: Logo ─── */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                <img src="/logo.png" alt="" className="w-6 h-6 object-contain" aria-hidden="true" />
              </div>
              <div className="hidden sm:flex items-baseline gap-0.5">
                <span className="text-lg font-light text-white/80 tracking-tight">AM</span>
                <span className="text-lg font-bold text-white tracking-tight">DF</span>
              </div>
            </Link>

            {/* ─── Center: Icon Nav + Search ─── */}
            <div className="hidden md:flex items-center gap-4 flex-1 justify-center">
              <NavigationLinks isActive={isActive} />

              {/* Desktop search bar with results dropdown */}
              <div className="relative w-full max-w-xs lg:max-w-sm" ref={searchDropdownRef}>
                <form onSubmit={handleSearch} className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search all..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => { if (searchQuery.trim().length >= 2) setShowSearchDropdown(true); }}
                    className="w-full pl-9 pr-14 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 focus:border-transparent transition-all"
                  />
                  {/* ⌘K shortcut badge */}
                  <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-white/40 bg-white/10 border border-white/15 rounded-md">
                    ⌘K
                  </kbd>
                </form>

                {/* Search results dropdown */}
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[420px] overflow-y-auto">
                    {searchLoading ? (
                      <div className="px-4 py-6 text-center">
                        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Searching...</p>
                      </div>
                    ) : !hasResults && searchQuery.trim().length >= 2 ? (
                      <div className="px-4 py-6 text-center">
                        <MagnifyingGlassIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No results for &ldquo;{searchQuery}&rdquo;</p>
                        <button
                          onClick={handleSearch}
                          className="mt-3 text-xs text-teal-600 hover:text-teal-700 font-medium"
                        >
                          Search in discussions →
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Discussions results */}
                        {searchResults.discussions.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                                Discussions
                              </p>
                            </div>
                            {searchResults.discussions.map((d) => (
                              <Link
                                key={d.id}
                                to={`/discussions/${d.id}`}
                                className="flex items-start gap-3 px-4 py-3 hover:bg-teal-50 transition-colors border-b border-slate-50 last:border-0"
                                onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); }}
                              >
                                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                                  {d.user_data?.display_picture ? (
                                    <img src={d.user_data.display_picture} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-teal-600" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-slate-900 truncate">{d.title}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    by {d.user_data?.username || 'Anonymous'}
                                    {d.category && <span className="ml-1.5 text-teal-600">· {typeof d.category === 'object' ? d.category.name : d.category}</span>}
                                  </p>
                                </div>
                                {d.answers_count > 0 && (
                                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                                    {d.answers_count} {d.answers_count === 1 ? 'reply' : 'replies'}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Members results */}
                        {searchResults.members.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <UserGroupIcon className="w-3.5 h-3.5" />
                                Members
                              </p>
                            </div>
                            {searchResults.members.map((m) => (
                              <Link
                                key={m.id}
                                to={`/users/${m.id}`}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 transition-colors border-b border-slate-50 last:border-0"
                                onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); }}
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {m.profile_photo_url ? (
                                    <img src={m.profile_photo_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <span className="text-white text-xs font-bold">{(m.username || '?')[0].toUpperCase()}</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-900">{m.full_name || m.username}</p>
                                  <p className="text-xs text-slate-500">@{m.username}</p>
                                </div>
                                {m.role === 'admin' && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full ml-auto">Admin</span>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* View all link */}
                        {totalResults > 0 && (
                          <button
                            onClick={handleSearch}
                            className="w-full px-4 py-2.5 text-xs font-medium text-teal-600 hover:bg-teal-50 border-t border-slate-100 transition-colors text-center"
                          >
                            View all results for &ldquo;{searchQuery}&rdquo; →
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Right: Mobile search + utilities ─── */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Mobile search icon */}
              <button
                onClick={() => {
                  setMobileSearchOpen(true);
                  setTimeout(() => mobileSearchRef.current?.focus(), 100);
                }}
                className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

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
        </div>

        {/* Mobile menu panel */}
        <MobileMenu
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          isActive={isActive}
          handleLogout={handleLogout}
        />
      </nav>

      {/* ─── Mobile Search Overlay ─── */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-white md:hidden flex flex-col">
          <div className="flex items-center gap-3 px-3 h-14 border-b border-slate-200 bg-slate-50 flex-shrink-0">
            <button
              onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); setSearchResults({ discussions: [], members: [] }); }}
              className="p-2 -ml-1 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
              aria-label="Close search"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <form onSubmit={handleSearch} className="flex-1">
              <input
                ref={mobileSearchRef}
                type="text"
                placeholder="Search discussions, members..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full py-2 text-base text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                autoFocus
              />
            </form>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults({ discussions: [], members: [] }); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {searchLoading ? (
              <div className="px-5 py-10 text-center">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400">Searching...</p>
              </div>
            ) : hasResults ? (
              <>
                {/* Discussion results */}
                {searchResults.discussions.length > 0 && (
                  <div>
                    <div className="px-5 pt-4 pb-2">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                        Discussions ({searchResults.discussions.length})
                      </p>
                    </div>
                    {searchResults.discussions.map((d) => (
                      <Link
                        key={d.id}
                        to={`/discussions/${d.id}`}
                        className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                        onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); }}
                      >
                        <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                          {d.user_data?.display_picture ? (
                            <img src={d.user_data.display_picture} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ChatBubbleLeftRightIcon className="w-4 h-4 text-teal-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 line-clamp-2">{d.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            by {d.user_data?.username || 'Anonymous'}
                            {d.category && <span className="ml-1.5 text-teal-600">· {typeof d.category === 'object' ? d.category.name : d.category}</span>}
                            {d.answers_count > 0 && <span className="ml-1.5">· {d.answers_count} {d.answers_count === 1 ? 'reply' : 'replies'}</span>}
                          </p>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Member results */}
                {searchResults.members.length > 0 && (
                  <div>
                    <div className="px-5 pt-4 pb-2">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <UserGroupIcon className="w-3.5 h-3.5" />
                        Members ({searchResults.members.length})
                      </p>
                    </div>
                    {searchResults.members.map((m) => (
                      <Link
                        key={m.id}
                        to={`/users/${m.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                        onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); }}
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {m.profile_photo_url ? (
                            <img src={m.profile_photo_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-white text-xs font-bold">{(m.username || '?')[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">{m.full_name || m.username}</p>
                          <p className="text-xs text-slate-500">@{m.username}</p>
                        </div>
                        {m.role === 'admin' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Admin</span>
                        )}
                        <ChevronRightIcon className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}

                {/* View all */}
                <button
                  onClick={handleSearch}
                  className="w-full px-5 py-3 text-sm font-medium text-teal-600 hover:bg-teal-50 border-t border-slate-100 transition-colors text-center mt-2"
                >
                  View all results for &ldquo;{searchQuery}&rdquo; →
                </button>
              </>
            ) : searchQuery.trim().length >= 2 ? (
              <div className="px-5 py-10 text-center">
                <MagnifyingGlassIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No results for &ldquo;{searchQuery}&rdquo;</p>
                <button
                  onClick={handleSearch}
                  className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Search in discussions →
                </button>
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                Type at least 2 characters to search discussions, members, and more...
              </div>
            )}
          </div>
        </div>
      )}
    </>
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