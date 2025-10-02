import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  ChartPieIcon,
  InformationCircleIcon,
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

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
  };

  const navigationLinks = [
    { name: 'Home', href: '/', icon: null },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
    { name: 'Discussions', href: '/discussions', icon: ChatBubbleLeftRightIcon },
    { name: 'About', href: '/about', icon: InformationCircleIcon },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20 w-full">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white w-5 h-5 lg:w-6 lg:h-6"
                  >
                    <path 
                      d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8m-8 2h8m-8 2h5" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="block">
                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  <span className="md:hidden">ELD</span>
                  <span className="hidden md:inline">English-Lisu Dictionary</span>
                </h1>
                <p className="text-xs lg:text-sm xl:text-base text-blue-600 dark:text-blue-300 hidden lg:block font-medium">
                  Language Learning Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Center - Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-2 lg:space-x-4 xl:space-x-6 max-w-2xl mx-8">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg lg:rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 whitespace-nowrap"
                >
                  {Icon && <Icon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />}
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side - User Profile and Controls */}
          <div className="flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 lg:p-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg lg:rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5 lg:w-6 lg:h-6" />
              ) : (
                <MoonIcon className="w-5 h-5 lg:w-6 lg:h-6" />
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center p-2 lg:p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg lg:rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                >
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                    <UserIcon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 lg:w-64 bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 backdrop-blur-md">
                    {user.full_name && (
                      <div className="px-4 py-2 lg:px-6 lg:py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-medium text-sm">
                              {user.full_name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-white truncate">
                            {user.full_name}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <ChartPieIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-3" />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <UserIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-3" />
                        Profile Settings
                      </Link>
                      {(user.role === 'admin' || user.role === 'moderator') && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <ShieldCheckIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-3" />
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg lg:rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400 dark:hover:from-blue-600 dark:hover:to-blue-500 rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 lg:p-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg lg:rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
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
        <div className="md:hidden bg-white dark:bg-gray-900 backdrop-blur-md border-t border-gray-200 dark:border-gray-700">
          {/* Navigation Links */}
          <div className="px-4 pt-4 pb-2 space-y-1">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  onClick={() => setIsOpen(false)}
                >
                  {Icon && <Icon className="w-5 h-5 mr-3" />}
                  {link.name}
                </Link>
              );
            })}
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-blue-900/20 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-800"
            >
              {darkMode ? (
                <>
                  <SunIcon className="w-5 h-5 mr-3" />
                  Light Mode
                </>
              ) : (
                <>
                  <MoonIcon className="w-5 h-5 mr-3" />
                  Dark Mode
                </>
              )}
            </button>
          </div>

          {/* User Section */}
          {user ? (
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              {/* User Info */}
              <div className="flex items-center justify-center mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* User Menu Items */}
              <div className="space-y-1">
                <Link
                  to="/dashboard"
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  onClick={() => setIsOpen(false)}
                >
                  <ChartPieIcon className="w-5 h-5 mr-3" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  onClick={() => setIsOpen(false)}
                >
                  <UserIcon className="w-5 h-5 mr-3" />
                  Profile Settings
                </Link>
                {(user.role === 'admin' || user.role === 'moderator') && (
                  <Link
                    to="/admin"
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShieldCheckIcon className="w-5 h-5 mr-3" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-center transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400 dark:hover:from-blue-600 dark:hover:to-blue-500 rounded-xl text-center shadow-lg transition-all duration-200 transform hover:scale-105"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {profileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
