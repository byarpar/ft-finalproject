import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import useMobileDetect from '../hooks/useMobileDetect';
import useClickOutside from '../hooks/useClickOutside';
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

  // helper for link styling
  const linkClass = (path) => `px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive(path)
    ? 'bg-teal-50 text-teal-700'
    : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
    }`;

  return (
    <div className="hidden md:flex items-center gap-2">
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
            className="p-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
            title="Notifications"
          >
            <BellIcon className="w-5 h-5" />
          </Link>
          <Link
            to="/discussions/new"
            className="p-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
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
 * Universal page layout wrapper with consistent structure
 */
export const PageLayout = ({
  children,
  title,
  description,
  className = '',
  fullWidth = false,
  background = 'bg-white'
}) => {
  return (
    <>
      <div
        className={`min-h-screen ${background} transition-colors duration-300`}
        role="main"
      >
        <div className={fullWidth ? '' : 'container mx-auto px-4 sm:px-6 lg:px-8'}>
          <div className={className}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
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

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-sm border-t border-white/20 shadow-lg">
      <div className="px-4 pt-2 pb-2 space-y-1">
        <Link
          to="/discussions"
          onClick={() => setIsOpen(false)}
          className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/discussions')
            ? 'bg-teal-50 text-teal-700'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          <QuestionMarkCircleIcon className="w-5 h-5 mr-3 text-gray-500" />
          Bee Forum
        </Link>
        <Link
          to="/users"
          onClick={() => setIsOpen(false)}
          className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/users')
            ? 'bg-teal-50 text-teal-700'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          <UserGroupIcon className="w-5 h-5 mr-3 text-gray-500" />
          Members
        </Link>
        {user && (
          <>
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/notifications')
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <BellIcon className="w-5 h-5 mr-3 text-gray-500" />
              Notifications
            </Link>
            <Link
              to="/discussions/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-md"
            >
              <QuestionMarkCircleIcon className="w-5 h-5 mr-3 text-teal-500" />
              + New Discussion
            </Link>
          </>
        )}
      </div>
      {user ? (
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="space-y-1">
            <Link to={`/users/${user.id}`} onClick={() => setIsOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              <UserIcon className="w-5 h-5 mr-3 text-gray-400" />My Profile
            </Link>
            <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400" />Settings
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                <ChartPieIcon className="w-5 h-5 mr-3 text-gray-400" />Admin Dashboard
              </Link>
            )}
            <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-md">
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-red-500" />Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 border-t border-gray-200 space-y-2">
          <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-2.5 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors">
            Log In
          </Link>
          <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors">
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
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-white hover:text-teal-100 transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium bg-white text-teal-600 rounded-md hover:bg-teal-50 transition-colors">
              Sign Up
            </Link>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            {isOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </>
      ) : (
        <>
          <div className="hidden md:flex items-center gap-2">
            <Link to="/discussions" className="p-2 text-white hover:bg-white/10 rounded-md transition-colors">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
            </Link>
          </div>
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserProfileDropdownOpen(!userProfileDropdownOpen)}
              className="flex items-center gap-2 p-2 text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                {user.username?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{user.username}</span>
            </button>

            {userProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link to={`/users/${user.id}`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <UserIcon className="w-4 h-4 mr-3" />
                  My Profile
                </Link>
                <Link to="/messages" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-3" />
                  Messages
                </Link>
                <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Cog6ToothIcon className="w-4 h-4 mr-3" />
                  Settings
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <ChartPieIcon className="w-4 h-4 mr-3" />
                    Admin Dashboard
                  </Link>
                )}
                <hr className="my-1" />
                <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors"
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
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <img src="/logo.png" alt="Modern Discussion Forum Logo" className="w-8 h-8 object-contain drop-shadow-lg" />
          </div>
          <span className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
            Modern Discussion Forum
          </span>
        </Link>

        <div className="flex items-center gap-4 flex-1 justify-center px-4">
          <form onSubmit={handleSearch} className="hidden sm:block w-full max-w-xs">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-4">
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