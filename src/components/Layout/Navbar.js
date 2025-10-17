import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
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
  MoonIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
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
