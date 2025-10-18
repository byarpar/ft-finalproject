import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  SpeakerWaveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PlusIcon,
  BookOpenIcon,
  InformationCircleIcon,
  UserCircleIcon,
  ArrowRightCircleIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  BellIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import SearchBar from '../components/Search/SearchBar';
import SEO from '../components/SEO/SEO';
import { searchAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { notificationsAPI } from '../services/notificationsAPI';
import socketClient from '../services/socketClient';
import toast from 'react-hot-toast';

const Dictionary = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedWords, setBookmarkedWords] = useState(new Set());
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userProfileDropdownOpen, setUserProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Helper function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Filter states
  const [filters, setFilters] = useState({
    language: {
      lisuToEnglish: false,
      englishToLisu: false
    },
    partOfSpeech: {
      noun: false,
      verb: false,
      adjective: false,
      pronoun: false,
      adverb: false
    },
    toneCategory: {
      highTone: false,
      lowTone: false,
      midTone: false
    },
    origin: {
      native: false,
      loanword: false
    }
  });

  const [sortBy, setSortBy] = useState('relevance');
  const resultsPerPage = 10;

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

  // Socket.IO notification listener
  useEffect(() => {
    if (user) {
      socketClient.onNewNotification((notification) => {
        fetchUnreadCount();
        toast.success(notification.message || 'You have a new notification');
      });
    }

    return () => {
      if (user) {
        socketClient.socket?.off('newNotification');
      }
    };
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setUserProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  // Fetch search results
  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await searchAPI.search({
          q: query,
          page: currentPage,
          limit: resultsPerPage
        });

        const words = response.data?.results || response.results || [];
        setResults(words);
        setTotalResults(response.data?.total || response.total || words.length);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, currentPage, sortBy]);

  // Handle new search
  const handleSearch = (searchQuery) => {
    if (searchQuery) {
      setSearchParams({ q: searchQuery });
      setCurrentPage(1);
    } else {
      // Clear the search query from URL when empty
      setSearchParams({});
      setResults([]);
      setTotalResults(0);
      setCurrentPage(1);
    }
  };

  // Toggle bookmark
  const toggleBookmark = (wordId) => {
    setBookmarkedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  };

  // Apply filters
  const handleApplyFilters = () => {
    // Filter logic would be implemented here
    setShowFilters(false);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      language: { lisuToEnglish: false, englishToLisu: false },
      partOfSpeech: { noun: false, verb: false, adjective: false, pronoun: false, adverb: false },
      toneCategory: { highTone: false, lowTone: false, midTone: false },
      origin: { native: false, loanword: false }
    });
  };

  // Pagination
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  // Highlight search query in text
  const highlightQuery = (text, query) => {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : part
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO
        title={query ? `Search Results for "${query}"` : 'Dictionary Search'}
        description={`Search results for ${query} in the Lisu Dictionary`}
      />

      {/* Oxford-Style Header Navigation */}
      <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 dark:from-teal-700 dark:via-teal-800 dark:to-teal-900">
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
                              to="/discussions"
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
                            {user.role === 'admin' && (
                              <Link
                                to="/admin"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => setUserProfileDropdownOpen(false)}
                              >
                                <ShieldCheckIcon className="w-4 h-4 mr-3 text-gray-400" />
                                Admin Panel
                              </Link>
                            )}
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
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
                    className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                    aria-label="Toggle mobile menu"
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

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && user && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HomeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium">Home</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ChartPieIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link
                  to="/discussions"
                  className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium">Discussions</span>
                </Link>
                <Link
                  to="/about"
                  className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <InformationCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium">About Us</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Cog6ToothIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium">Settings</span>
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Search Query & Result Count */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {query ? `Search Results for '${query}'` : 'Dictionary Search'}
            </h1>
            {totalResults > 0 && (
              <p className="text-teal-100 text-sm">
                Showing {startResult}-{endResult} of {totalResults} results
              </p>
            )}
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl">
            <SearchBar
              placeholder="Search for Lisu or English words..."
              value={query}
              onChange={handleSearch}
              onSearch={handleSearch}
              size="medium"
              showEnhancedFeatures={true}
              showSuggestions={true}
              redirectOnSearch={false}
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar - Filters (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Filter Results
              </h2>

              {/* Language Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Language</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.language.lisuToEnglish}
                      onChange={(e) => setFilters({ ...filters, language: { ...filters.language, lisuToEnglish: e.target.checked } })}
                      className="mr-2 rounded text-teal-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Lisu (to English)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.language.englishToLisu}
                      onChange={(e) => setFilters({ ...filters, language: { ...filters.language, englishToLisu: e.target.checked } })}
                      className="mr-2 rounded text-teal-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">English (to Lisu)</span>
                  </label>
                </div>
              </div>

              {/* Part of Speech Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Part of Speech</h3>
                <div className="space-y-2">
                  {Object.keys(filters.partOfSpeech).map(pos => (
                    <label key={pos} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.partOfSpeech[pos]}
                        onChange={(e) => setFilters({
                          ...filters,
                          partOfSpeech: { ...filters.partOfSpeech, [pos]: e.target.checked }
                        })}
                        className="mr-2 rounded text-teal-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{pos}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tone Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Tone Category</h3>
                <div className="space-y-2">
                  {Object.keys(filters.toneCategory).map(tone => (
                    <label key={tone} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.toneCategory[tone]}
                        onChange={(e) => setFilters({
                          ...filters,
                          toneCategory: { ...filters.toneCategory, [tone]: e.target.checked }
                        })}
                        className="mr-2 rounded text-teal-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {tone.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Origin Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Origin</h3>
                <div className="space-y-2">
                  {Object.keys(filters.origin).map(origin => (
                    <label key={origin} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.origin[origin]}
                        onChange={(e) => setFilters({
                          ...filters,
                          origin: { ...filters.origin, [origin]: e.target.checked }
                        })}
                        className="mr-2 rounded text-teal-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{origin}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleApplyFilters}
                  className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="w-full px-4 py-2 text-teal-600 dark:text-teal-400 hover:underline text-sm"
                >
                  Clear Filters
                </button>
              </div>

              {/* Contribute CTA */}
              <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Can't find what you're looking for?
                </p>
                <Link
                  to="/contribute"
                  className="inline-flex items-center text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Suggest a New Word
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Results Column */}
          <main className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">Filter Results</span>
              </button>
            </div>

            {/* Sorting Options */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="length">Length</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                {/* Search Results List */}
                <div className="space-y-4">
                  {results.map((word) => (
                    <div
                      key={word.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-teal-500"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Lisu Word & English Word */}
                          <div className="flex items-baseline gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {highlightQuery(word.lisu_word || 'ꓡꓴ', query)}
                            </h3>
                            {word.pronunciation_lisu && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                /{word.pronunciation_lisu}/
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-lg font-semibold text-teal-600 dark:text-teal-400">
                              {highlightQuery(word.english_word, query)}
                            </span>
                            {word.part_of_speech && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs uppercase rounded">
                                {typeof word.part_of_speech === 'object' ? word.part_of_speech?.name : word.part_of_speech}
                              </span>
                            )}
                          </div>

                          {/* Brief Definition */}
                          <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                            {highlightQuery(word.english_definition || word.lisu_definition || 'No definition available', query)}
                          </p>

                          {/* Interactive Icons & Link */}
                          <div className="flex items-center gap-4">
                            {/* Audio Icon */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                console.log('Play pronunciation for:', word.lisu_word);
                              }}
                              className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                              title="Play pronunciation"
                            >
                              <SpeakerWaveIcon className="w-5 h-5" />
                              <span className="text-sm">Listen</span>
                            </button>

                            {/* Bookmark Icon */}
                            <button
                              onClick={() => toggleBookmark(word.id)}
                              className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                              title="Bookmark word"
                            >
                              {bookmarkedWords.has(word.id) ? (
                                <BookmarkSolidIcon className="w-5 h-5" />
                              ) : (
                                <BookmarkIcon className="w-5 h-5" />
                              )}
                              <span className="text-sm">Save</span>
                            </button>

                            {/* View Definition Link */}
                            <Link
                              to={`/words/${word.id}`}
                              className="ml-auto inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold transition-colors"
                            >
                              View Definition
                              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === pageNum
                            ? 'bg-teal-600 text-white'
                            : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && <span className="text-gray-500">...</span>}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                )}
              </>
            ) : query ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                  No results found for "{query}"
                </p>
                <p className="text-gray-500 dark:text-gray-500 mb-6">
                  Try adjusting your search or filters
                </p>
                <Link
                  to="/contribute"
                  className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Suggest This Word
                </Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Start searching to see results
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
          <div className="fixed inset-x-0 bottom-0 bg-white dark:bg-gray-800 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Filter Results</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Mobile filter content - same as desktop sidebar */}
            <div className="space-y-6">
              {/* Same filter sections as desktop */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Language</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded text-teal-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Lisu (to English)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded text-teal-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">English (to Lisu)</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dictionary;
