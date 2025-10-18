import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  UserGroupIcon,
  PencilSquareIcon,
  UserCircleIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import SearchBar from '../components/Search/SearchBar';
import SEO, { SEOConfigs } from '../components/SEO/SEO';
import { wordsAPI, discussionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [featuredWords, setFeaturedWords] = useState([]);
  const [recentDiscussions, setRecentDiscussions] = useState([]);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

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

  // Fetch featured words on component mount
  useEffect(() => {
    const fetchFeaturedWords = async () => {
      try {
        setIsLoadingWords(true);
        // Get top words by frequency score for featured section (limit to 4 for better display)
        const response = await wordsAPI.getWords({ limit: 4, sort: 'frequency_score', order: 'DESC' });
        const words = response.data?.words || response.words || [];
        console.log('Fetched featured words:', words);
        setFeaturedWords(words);
      } catch (error) {
        console.error('Error fetching featured words:', error);
        // Set default words if API fails
        setFeaturedWords([]);
      } finally {
        setIsLoadingWords(false);
      }
    };

    fetchFeaturedWords();
  }, []);

  // Fetch recent discussions
  useEffect(() => {
    const fetchRecentDiscussions = async () => {
      try {
        setIsLoadingDiscussions(true);
        const response = await discussionsAPI.getDiscussions({
          limit: 2,
          sort: 'recent',
          page: 1
        });
        const discussions = response.discussions || response.data?.discussions || [];
        console.log('Fetched recent discussions:', discussions);
        setRecentDiscussions(discussions);
      } catch (error) {
        console.error('Error fetching recent discussions:', error);
        setRecentDiscussions([]);
      } finally {
        setIsLoadingDiscussions(false);
      }
    };

    fetchRecentDiscussions();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* SEO Meta Tags */}
      <SEO {...SEOConfigs.home} />

      {/* Hero Section - Search Focused & Culturally Rich */}
      <section
        className="relative py-20 lg:py-32 overflow-hidden bg-cover bg-center min-h-[80vh]"
        style={{
          backgroundImage: 'linear-gradient(rgba(55, 125, 115, 0.75), rgba(55, 125, 115, 0.75)), url(/images/hero/lisu-people.jpg)',
          backgroundColor: '#377d73'
        }}
      >
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="text-white font-light text-2xl tracking-widest uppercase">
                Lisu Dict
              </div>
            </Link>

            {/* Top Right Icons */}
            <div className="flex items-center gap-4">
              <Link
                to="/help"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                aria-label="Help"
                title="Help Center"
              >
                <InformationCircleIcon className="w-6 h-6 text-white" />
              </Link>

              {!user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                    aria-label="Profile menu"
                  >
                    <UserCircleIcon className="w-6 h-6 text-white" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <Link
                        to="/login"
                        className="block px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Log In
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium rounded-full transition-all duration-200"
                >
                  <UserCircleIcon className="w-6 h-6" />
                  <span className="hidden sm:inline">{user.username || 'Dashboard'}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center">
            {/* Dictionary Abbreviation */}
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-wide">
                <span className="text-5xl md:text-6xl">LD</span> | Lisu Dictionary
              </h2>
            </div>

            {/* Search Bar with Dropdown */}
            <div className="max-w-3xl mx-auto mb-12">
              <div className="relative">
                <SearchBar
                  placeholder="Search for Lisu or English words..."
                  className="text-lg"
                  autoFocus={false}
                  size="large"
                  showEnhancedFeatures={true}
                  showSuggestions={true}
                />
              </div>
            </div>

            {/* Subtitle */}
            <div className="max-w-3xl mx-auto mb-12">
              <h1 className="text-2xl md:text-3xl font-light text-white mb-4">
                The historical Lisu dictionary
              </h1>
              <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto mb-8">
                An unsurpassed guide for researchers in any discipline to the meaning, history, and
                usage of Lisu words and phrases across the Lisu-speaking world.
              </p>

              {/* CTA Button */}
              <div>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white hover:bg-white/10 font-medium rounded-md transition-all duration-200"
                >
                  Find out more about LD
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-200">
                  Featured Words
                </h2>
              </div>

              {isLoadingWords ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-700 rounded-lg p-6 animate-pulse shadow-sm">
                      <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded mb-2 w-20"></div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded mb-2 w-16"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : featuredWords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featuredWords.map((word, index) => (
                    <Link
                      key={word.id || index}
                      to={`/dictionary?q=${word.english_word || word.lisu_word}`}
                      className="block bg-white dark:bg-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md group"
                    >
                      {/* Lisu Word - Large and Bold */}
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {word.lisu_word || 'ꓡꓴ'}
                      </div>

                      {/* Pronunciation */}
                      {word.pronunciation_lisu && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                          {word.pronunciation_lisu}
                        </div>
                      )}

                      {/* English Translation */}
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {word.english_word || 'word'}
                      </div>

                      {/* Definition */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {word.english_definition || word.lisu_definition || 'Explore the meaning and context for this Lisu word.'}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <BookOpenIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No featured words available at the moment.</p>
                </div>
              )}
            </div>

            {/* Right Column: Community Hub */}
            <div>
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-200">
                  Community Hub
                </h2>
              </div>

              {/* Recent Discussions Card */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Recent Discussions
                </h3>

                {isLoadingDiscussions ? (
                  <div className="space-y-4">
                    {[1].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                      </div>
                    ))}
                  </div>
                ) : recentDiscussions.length > 0 ? (
                  <div className="space-y-4">
                    {recentDiscussions.slice(0, 1).map((discussion) => (
                      <Link
                        key={discussion.id}
                        to={`/discussions/${discussion.id}`}
                        className="block hover:opacity-80 transition-opacity"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
                              {discussion.username?.charAt(0).toUpperCase() || 'A'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {discussion.username || 'Anonymous'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {typeof discussion.category === 'object' ? discussion.category?.name : discussion.category || 'General'}
                            </div>
                          </div>
                        </div>

                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 hover:text-teal-600 dark:hover:text-teal-400">
                          {discussion.title}
                        </h4>

                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {discussion.content?.replace(/<[^>]*>/g, '') || 'Join the discussion to learn more...'}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                            {discussion.answers_count || 0} replies
                          </span>
                          <span className="flex items-center">
                            <HeartIcon className="h-4 w-4 mr-1" />
                            {discussion.likes_count || 0} likes
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent discussions.</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Link
                to="/discussions/new"
                className="flex items-center justify-center w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <PencilSquareIcon className="h-5 w-5 mr-2" />
                Start a Discussion
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Learn Lisu / Cultural Immersion Section */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Why Learn Lisu?
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                The Lisu language is spoken by over 1 million people across China, Myanmar,
                Thailand, and India. Our dictionary helps preserve this rich linguistic
                tradition while making it accessible to new learners worldwide.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-teal-500 dark:bg-teal-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Cultural Preservation</h3>
                    <p className="text-gray-600 dark:text-gray-400">Help preserve and promote the Lisu language for future generations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-teal-500 dark:bg-teal-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Connect with Communities</h3>
                    <p className="text-gray-600 dark:text-gray-400">Bridge communication gaps and connect with Lisu-speaking communities</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-teal-500 dark:bg-teal-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Rich History & Etymology</h3>
                    <p className="text-gray-600 dark:text-gray-400">Explore the fascinating linguistic development and cultural context</p>
                  </div>
                </div>
              </div>
              <Link
                to="/about"
                className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium rounded-md transition-colors duration-200"
              >
                Learn More About Us
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Link>
            </div>

            {/* Image/Visual Content */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="rounded-lg overflow-hidden shadow-xl" style={{ paddingBottom: '75%', position: 'relative' }}>
                  <img
                    src="/images/hero/lisu-people.jpg"
                    alt="Learning and community"
                    className="absolute inset-0 object-cover w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/800x600/0d9488/ffffff?text=Learning+Community";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contribute / Get Involved Section */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Contribute & Get Involved
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-10 leading-relaxed">
              Help us build the most comprehensive Lisu dictionary. Your contributions make a difference
              in preserving and promoting the Lisu language for future generations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpenIcon className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Submit Words</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add new Lisu words and definitions to expand our dictionary
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIcon className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Share Knowledge</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help others by answering questions and sharing insights
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PencilSquareIcon className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Suggest Edits</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Improve existing entries with corrections and additional context
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold rounded-md transition-colors duration-200"
              >
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Join Community
              </Link>
              <Link
                to="/discussions"
                className="inline-flex items-center justify-center px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-teal-600 dark:text-teal-400 font-semibold rounded-md border-2 border-teal-600 dark:border-teal-500 transition-colors duration-200"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Start Contributing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-teal-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Exploring Today
          </h2>
          <p className="text-xl text-teal-50 mb-8">
            Whether you're learning Lisu, studying linguistics, or preserving cultural heritage,
            our dictionary is your gateway to understanding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dictionary"
              className="inline-flex items-center justify-center bg-white text-teal-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-xl"
            >
              <MagnifyingGlassIcon className="h-6 w-6 mr-2" />
              Start Searching
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center bg-teal-800 text-white hover:bg-teal-900 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
            >
              Learn More
              <ArrowRightIcon className="h-6 w-6 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
