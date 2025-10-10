import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dictionary?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navigationLinks = [
    { name: 'Dictionary', href: '/dictionary' },
    { name: 'Discussions', href: '/discussions' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
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
                <h1 className="text-lg font-bold text-gray-800 tracking-tight">
                  LISU
                </h1>
                <p className="text-xs text-gray-500 -mt-1">DICTIONARY</p>
              </div>
            </Link>
          </div>

          {/* Primary Navigation Links - Center Left */}
          <div className="hidden md:flex items-center space-x-1 ml-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive(link.href)
                  ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                  : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Universal Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Discussions"
                  className="w-full pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-3 text-white bg-teal-600 hover:bg-teal-700 rounded-r-md transition-colors duration-200"
                  aria-label="Search"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* User Account & Authentication - Right Side */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-500 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
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
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      {user.full_name && (
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      )}

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                          My Profile
                        </Link>
                        <Link
                          to="/discussions?filter=my"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <ChatBubbleLeftRightIcon className="w-4 h-4 mr-3 text-gray-400" />
                          My Discussions
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <ChartPieIcon className="w-4 h-4 mr-3 text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          to="/profile/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-400" />
                          Settings
                        </Link>
                        {(user.role === 'admin' || user.role === 'moderator') && (
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <ShieldCheckIcon className="w-4 h-4 mr-3 text-gray-400" />
                            Admin Panel
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-teal-600 hover:bg-gray-100 rounded-md transition-all duration-200"
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
        <div className="md:hidden bg-white border-t border-gray-200">
          {/* Mobile Search Bar */}
          <div className="px-4 pt-4 pb-2">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a Lisu or English word..."
                  className="w-full pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-3 text-white bg-teal-600 hover:bg-teal-700 rounded-r-md"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`block px-4 py-3 text-base font-medium rounded-md transition-all duration-200 ${isActive(link.href)
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Section for Mobile */}
          {user ? (
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
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
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
                  My Profile
                </Link>
                <Link
                  to="/discussions?filter=my"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3 text-gray-400" />
                  My Discussions
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <ChartPieIcon className="w-5 h-5 mr-3 text-gray-400" />
                  Dashboard
                </Link>
                <Link
                  to="/profile/settings"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400" />
                  Settings
                </Link>
                {(user.role === 'admin' || user.role === 'moderator') && (
                  <Link
                    to="/admin"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
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
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-3 text-sm font-medium text-center text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
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
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
