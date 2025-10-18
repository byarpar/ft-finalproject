import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  BookOpenIcon,
  SpeakerWaveIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  PlusIcon,
  UserIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowRightCircleIcon,
  UserPlusIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { notificationsAPI } from '../services/notificationsAPI';
import socketClient from '../services/socketClient';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const WordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Word detail state
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedWords, setRelatedWords] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Header navigation state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userProfileDropdownOpen, setUserProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    loadWordDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadWordDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/words/${id}`);
      if (response.data.success) {
        setWord(response.data.data.word);

        // Add to recently viewed
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const newViewed = [
          { id: response.data.data.word.id, english_word: response.data.data.word.english_word, lisu_word: response.data.data.word.lisu_word },
          ...viewed.filter(w => w.id !== response.data.data.word.id)
        ].slice(0, 5);
        localStorage.setItem('recentlyViewed', JSON.stringify(newViewed));

        // Load related words
        loadRelatedWords(response.data.data.word);
        // Load comments (mock for now)
        loadComments();
      }
    } catch (error) {
      console.error('Failed to load word:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedWords = async (currentWord) => {
    try {
      let relatedWordsFound = [];

      // Strategy 1: Search by tags if available
      if (currentWord.tags && currentWord.tags.length > 0) {
        const tagResponse = await axios.get(`${API_URL}/search`, {
          params: { q: currentWord.tags[0] }
        });
        if (tagResponse.data.success) {
          relatedWordsFound = tagResponse.data.data.results.filter(w => w.id !== currentWord.id);
        }
      }

      // Strategy 2: If not enough results, search by first word of definition
      if (relatedWordsFound.length < 3 && currentWord.english_definition) {
        const firstWord = currentWord.english_definition.split(' ')[0].toLowerCase();
        const defResponse = await axios.get(`${API_URL}/search`, {
          params: { q: firstWord }
        });
        if (defResponse.data.success) {
          const newWords = defResponse.data.data.results.filter(
            w => w.id !== currentWord.id && !relatedWordsFound.find(rw => rw.id === w.id)
          );
          relatedWordsFound = [...relatedWordsFound, ...newWords];
        }
      }

      // Strategy 3: If still not enough, get recent words with same part of speech
      if (relatedWordsFound.length < 3 && currentWord.part_of_speech) {
        const posResponse = await axios.get(`${API_URL}/words`, {
          params: { limit: 10 }
        });
        if (posResponse.data.success && posResponse.data.data.words) {
          const newWords = posResponse.data.data.words.filter(
            w => w.id !== currentWord.id &&
              w.part_of_speech === currentWord.part_of_speech &&
              !relatedWordsFound.find(rw => rw.id === w.id)
          );
          relatedWordsFound = [...relatedWordsFound, ...newWords];
        }
      }

      // Take top 3 results
      setRelatedWords(relatedWordsFound.slice(0, 3));
    } catch (error) {
      console.error('Failed to load related words:', error);
      // Show some words anyway as fallback
      try {
        const fallbackResponse = await axios.get(`${API_URL}/words`, {
          params: { limit: 5 }
        });
        if (fallbackResponse.data.success && fallbackResponse.data.data.words) {
          const fallback = fallbackResponse.data.data.words.filter(w => w.id !== currentWord.id).slice(0, 3);
          setRelatedWords(fallback);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  };

  const loadComments = () => {
    // Mock comments for now
    setComments([
      {
        id: 1,
        user: { name: 'John Doe', avatar: null },
        content: 'This is a very important greeting in Lisu culture. It\'s used when meeting elders.',
        timestamp: '2 hours ago'
      }
    ]);
  };

  // Helper function to check if a route is active
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

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`${API_URL}/words/${id}/favorite`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setIsFavorite(false);
      } else {
        await axios.post(`${API_URL}/words/${id}/favorite`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const playPronunciation = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const shareWord = () => {
    if (navigator.share) {
      navigator.share({
        title: `${word.english_word} - Lisu Dictionary`,
        text: `${word.english_word} (${word.lisu_word})`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    const comment = {
      id: comments.length + 1,
      user: { name: user.full_name || user.email, avatar: null },
      content: newComment,
      timestamp: 'Just now'
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

  // Parse examples
  let examples = [];
  if (word?.examples) {
    if (typeof word.examples === 'string') {
      try {
        examples = JSON.parse(word.examples);
      } catch (e) {
        examples = [word.examples];
      }
    } else if (Array.isArray(word.examples)) {
      examples = word.examples;
    }
  }

  const partOfSpeechColors = {
    'Noun': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Verb': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Adjective': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Adverb': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'default': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!word) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <BookOpenIcon className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Word Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The word you're looking for doesn't exist in our dictionary.
            </p>
            <button
              onClick={() => navigate('/dictionary')}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Back to Dictionary
            </button>
          </div>
        </div>
      </div>
    );
  }

  const posColor = partOfSpeechColors[word.part_of_speech] || partOfSpeechColors.default;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Oxford-Style Header Navigation */}
      <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 dark:from-teal-700 dark:via-teal-800 dark:to-teal-900">
        {/* Top Navigation Bar */}
        <div className="relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Logo/Brand */}
            <Link to="/" className="group flex items-center gap-3">
              <div className="relative w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/25 transition-all border border-white/20">
                <BookOpenIcon className="w-8 h-8 text-white/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-[9px] tracking-tight drop-shadow-lg">LED</span>
                </div>
              </div>
              <div className="text-white font-light text-xl tracking-[0.3em] uppercase">
                LISU DICT
              </div>
            </Link>

            {/* Center Navigation Links - Desktop only, show when logged in */}
            {user && !isMobile && (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  to="/"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/')
                    ? 'bg-white/10 text-white border-b-2 border-white'
                    : 'text-white hover:text-teal-100 hover:bg-white/5'
                    }`}
                >
                  Home
                </Link>
                <Link
                  to="/discussions"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/discussions')
                    ? 'bg-white/10 text-white border-b-2 border-white'
                    : 'text-white hover:text-teal-100 hover:bg-white/5'
                    }`}
                >
                  Discussions
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/about')
                    ? 'bg-white/10 text-white border-b-2 border-white'
                    : 'text-white hover:text-teal-100 hover:bg-white/5'
                    }`}
                >
                  About Us
                </Link>
              </div>
            )}

            {/* Top Right Icons */}
            <div className="flex items-center gap-2">
              {!user ? (
                <>
                  {/* Desktop: Show profile dropdown */}
                  <div className="hidden md:block relative" ref={dropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
                      aria-label="Profile menu"
                    >
                      <UserCircleIcon className="w-5 h-5 text-white" />
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
                  <div className="md:hidden flex items-center gap-1">
                    <Link
                      to="/login"
                      className="px-2 py-1 text-white text-xs font-medium hover:opacity-80 transition-opacity"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="px-2 py-1 bg-white/20 text-white text-xs font-medium rounded-lg hover:bg-white/30 transition-colors"
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
                    <BellIcon className="w-5 h-5 text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Desktop: Profile Button with Dropdown */}
                  <div className="hidden md:block relative" ref={userDropdownRef}>
                    <button
                      onClick={() => setUserProfileDropdownOpen(!userProfileDropdownOpen)}
                      className="flex items-center gap-2 px-2 py-1 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg transition-all duration-200 border border-white/10"
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-teal-600 to-teal-500 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
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
                        <UserIcon className={`w-4 h-4 text-white ${user.profile_photo_url ? 'hidden' : ''}`} />
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
                    className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                    aria-label="Toggle mobile menu"
                  >
                    {mobileMenuOpen ? (
                      <XMarkIcon className="w-5 h-5 text-white" />
                    ) : (
                      <Bars3Icon className="w-5 h-5 text-white" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && user && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
              <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HomeIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm font-medium">Home</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ChartPieIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <Link
                  to="/discussions"
                  className="flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm font-medium">Discussions</span>
                </Link>
                <Link
                  to="/about"
                  className="flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpenIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm font-medium">About Us</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Cog6ToothIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm font-medium">Settings</span>
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Link to="/dictionary" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Dictionary
            </Link>
            <ChevronRightIcon className="w-4 h-4 mx-2" />
            <Link to={`/dictionary?q=${word.english_word?.charAt(0) || ''}`} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {word.english_word?.charAt(0).toUpperCase() || ''}
            </Link>
            <ChevronRightIcon className="w-4 h-4 mx-2" />
            <span className="text-gray-900 dark:text-white font-medium">{word.lisu_word}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Content (70%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lisu Word Block */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Lisu Script
                    </span>
                  </div>

                  {/* Large Lisu Word with Tones */}
                  <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'serif' }}>
                    {word.lisu_word}
                  </h1>

                  {/* Phonetic Pronunciation */}
                  {word.pronunciation_lisu && (
                    <div className="mb-4">
                      <p className="text-xl text-gray-600 dark:text-gray-400 font-mono">
                        /{word.pronunciation_lisu}/
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">IPA Transcription</p>
                    </div>
                  )}

                  {/* English Translation */}
                  <div className="mt-4 flex items-center gap-3 flex-wrap">
                    {word.part_of_speech && (
                      <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${posColor}`}>
                        {word.part_of_speech}
                      </span>
                    )}
                    <span className="text-lg text-gray-700 dark:text-gray-300 font-medium">
                      {word.english_word}
                    </span>
                  </div>

                  {/* Quick Definition */}
                  {(word.meaning || word.english_definition) && (
                    <p className="mt-4 text-base text-gray-600 dark:text-gray-400 italic">
                      "{(word.meaning || word.english_definition).substring(0, 150)}{(word.meaning || word.english_definition).length > 150 ? '...' : ''}"
                    </p>
                  )}
                </div>

                {/* Interactive Icons */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => playPronunciation(word.lisu_word)}
                    className="p-3 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded-full transition-colors group"
                    title="Play pronunciation"
                  >
                    <SpeakerWaveIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className="p-3 bg-gray-50 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {isFavorite ? (
                      <HeartIconSolid className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={shareWord}
                    className="p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                    title="Share word"
                  >
                    <ShareIcon className="w-6 h-6 text-gray-400" />
                  </button>
                  {user && (
                    <button
                      onClick={() => navigate(`/contribute?word=${id}`)}
                      className="p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                      title="Contribute/Edit"
                    >
                      <PencilSquareIcon className="w-6 h-6 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Word Metadata Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    {word.is_verified && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                    {word.created_at && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        Added {new Date(word.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  {word.frequency_score && (
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      Usage: {word.frequency_score}/100
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Definition(s) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpenIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                Primary Definition
              </h2>
              <div className="space-y-4">
                {word.meaning && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-5 border-l-4 border-teal-500">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {word.english_word || 'Translation'}
                    </p>
                    <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {word.meaning}
                    </p>
                  </div>
                )}
                {word.english_definition && word.english_definition !== word.meaning && (
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {word.english_definition}
                  </p>
                )}
                {!word.meaning && !word.english_definition && (
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    No definition available yet.
                    <button
                      onClick={() => navigate(`/contribute?word=${id}`)}
                      className="text-teal-600 dark:text-teal-400 hover:underline ml-1"
                    >
                      Be the first to contribute!
                    </button>
                  </p>
                )}
              </div>
            </div>

            {/* Example Sentences */}
            {examples.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Example Sentences
                </h2>
                <div className="space-y-4">
                  {examples.slice(0, 3).map((example, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-5 border-l-4 border-teal-500">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-base text-gray-900 dark:text-white mb-2 font-medium">
                            {example.split('\n')[0]}
                          </p>
                          {example.split('\n')[1] && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                              {example.split('\n')[1]}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => playPronunciation(example.split('\n')[0])}
                          className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors flex-shrink-0"
                          title="Listen to example"
                        >
                          <SpeakerWaveIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Synonyms & Antonyms */}
            {((word.synonyms && word.synonyms.length > 0) || (word.antonyms && word.antonyms.length > 0)) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Synonyms & Antonyms
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Synonyms */}
                  {word.synonyms && word.synonyms.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Synonyms
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {word.synonyms.map((synonym, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
                            onClick={() => {
                              // Try to search for the synonym
                              navigate(`/dictionary?q=${synonym}`);
                            }}
                          >
                            {synonym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Antonyms */}
                  {word.antonyms && word.antonyms.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Antonyms
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {word.antonyms.map((antonym, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                            onClick={() => {
                              // Try to search for the antonym
                              navigate(`/dictionary?q=${antonym}`);
                            }}
                          >
                            {antonym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Phrases/Usage */}
            {word.phrase && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  Common Phrases & Usage
                </h2>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-5 border-l-4 border-purple-500">
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {word.phrase}
                  </p>
                </div>
              </div>
            )}

            {/* Etymology */}
            {word.etymology_origin && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Etymology & Historical Context
                </h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">Origin</h3>
                    <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {word.etymology_origin}
                    </p>
                  </div>
                  {word.etymology_context && (
                    <div>
                      <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">Historical Context</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {word.etymology_context}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      From Lisu Dictionary 2025 - Preserving linguistic heritage
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Word Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Word Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {examples.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Examples</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {word.synonyms ? word.synonyms.length : 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Synonyms</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {word.antonyms ? word.antonyms.length : 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Antonyms</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {relatedWords.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Related</div>
                </div>
              </div>
            </div>

            {/* Grammar Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Grammar Notes
              </h2>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                {word.part_of_speech && (
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400 mt-1 text-xl">•</span>
                    <span>
                      <strong>Part of Speech:</strong> {word.part_of_speech}
                      {word.part_of_speech === 'Verb' && ' - Can be conjugated based on tense'}
                      {word.part_of_speech === 'Noun' && ' - Can take plural forms and possessive markers'}
                      {word.part_of_speech === 'Adjective' && ' - Describes or modifies nouns'}
                      {word.part_of_speech === 'Adverb' && ' - Modifies verbs, adjectives, or other adverbs'}
                    </span>
                  </li>
                )}
                {word.frequency_score && (
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400 mt-1 text-xl">•</span>
                    <span>
                      <strong>Usage Frequency:</strong>
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${word.frequency_score > 70 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        word.frequency_score > 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                        {word.frequency_score > 70 ? 'Very Common' : word.frequency_score > 40 ? 'Common' : 'Less Common'}
                      </span>
                    </span>
                  </li>
                )}
                {word.synonyms && word.synonyms.length > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400 mt-1 text-xl">•</span>
                    <span>Has <strong>{word.synonyms.length}</strong> synonym{word.synonyms.length > 1 ? 's' : ''} that can be used interchangeably in similar contexts</span>
                  </li>
                )}
                {word.antonyms && word.antonyms.length > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400 mt-1 text-xl">•</span>
                    <span>Has <strong>{word.antonyms.length}</strong> antonym{word.antonyms.length > 1 ? 's' : ''} with opposite meaning</span>
                  </li>
                )}
                {examples.length > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400 mt-1 text-xl">•</span>
                    <span>See <strong>{examples.length}</strong> usage example{examples.length > 1 ? 's' : ''} below to understand context</span>
                  </li>
                )}
                {word.phrase && (
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400 mt-1 text-xl">•</span>
                    <span>Commonly used in phrases and expressions (see Phrases section)</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Comments/Discussions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                Discussions about '{word.lisu_word}'
              </h2>

              {/* Comments List */}
              <div className="space-y-4 mb-6">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">{comment.user.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              {user ? (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this word..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows="3"
                  />
                  <button
                    onClick={handleAddComment}
                    className="mt-3 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Add Comment
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Sign in to join the discussion
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Related Content (30%) */}
          <div className="space-y-6">
            {/* Related Words */}
            {relatedWords.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Related Words
                </h3>
                <div className="space-y-3">
                  {relatedWords.map((related) => (
                    <Link
                      key={related.id}
                      to={`/words/${related.id}`}
                      className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
                            {related.lisu_word}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {related.english_word}
                          </p>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Contribute Card */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-teal-800 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Contribute
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Help enrich this word entry
              </p>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium transition-colors text-left flex items-center gap-2">
                  <PencilSquareIcon className="w-4 h-4" />
                  Suggest a Correction
                </button>
                <button className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium transition-colors text-left flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Add New Meaning
                </button>
                <button className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium transition-colors text-left flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Provide Example
                </button>
                <button className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium transition-colors text-left flex items-center gap-2">
                  <SpeakerWaveIcon className="w-4 h-4" />
                  Upload Audio
                </button>
              </div>
            </div>

            {/* Cultural Context */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Cultural Insights
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                This word carries special significance in Lisu traditions and is often used in formal greetings.
              </p>
              <Link
                to="/discussions?tag=culture"
                className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
              >
                Learn more about Lisu culture →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordDetail;
