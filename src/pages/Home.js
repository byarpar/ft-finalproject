import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import SearchBar from '../components/Search/SearchBar';
import HeroNavbar from '../components/Layout/HeroNavbar';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import { wordsAPI, discussionsAPI } from '../services/api';
import PageLayout from '../components/Layout/PageLayout';

/**
 * Home Component
 * 
 * Main landing page with hero section, search functionality,
 * featured words, and recent discussions.
 */

const Home = () => {
  const [featuredWords, setFeaturedWords] = useState([]);
  const [recentDiscussions, setRecentDiscussions] = useState([]);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(true);

  // Fetch featured words on component mount
  const fetchFeaturedWords = useCallback(async () => {
    try {
      setIsLoadingWords(true);
      // Get recently added words for featured section (limit to 4 for better display)
      const response = await wordsAPI.getWords({ limit: 4, sort: 'created_at', order: 'DESC' });
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
  }, []);

  useEffect(() => {
    fetchFeaturedWords();
  }, [fetchFeaturedWords]);

  // Fetch recent discussions
  const fetchRecentDiscussions = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchRecentDiscussions();
  }, [fetchRecentDiscussions]);

  return (
    <PageLayout
      title="Lisu English Dictionary - Learn, Explore, Connect"
      description="Your comprehensive Lisu-English dictionary. Discover meanings, pronunciations, and cultural insights. Join our vibrant community of language learners and native speakers."
      fullWidth={true}
      background=""
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 transition-colors duration-200">
        {/* Hero Section - Modern Minimalist Design */}
        <section className="relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/hero/lisu-people.jpg)',
            }}
          />
          {/* Enhanced overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-900/90 via-teal-800/75 to-teal-700/60 sm:bg-gradient-to-r sm:from-teal-800/85 sm:via-teal-700/60 sm:to-teal-600/40" />

          {/* Hero Navbar Component */}
          <HeroNavbar />

          {/* Main Hero Content */}
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="text-center">
              {/* Main Heading */}
              <div className="mb-12">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
                  Lisu Dictionary
                </h1>
                <p className="text-xl md:text-2xl text-white/80 font-light max-w-3xl mx-auto">
                  Discover, learn, and preserve the Lisu language
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-12 md:h-16" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
              <path d="M0,32 Q360,64 720,32 T1440,32 L1440,80 L0,80 Z" className="fill-gray-50" />
            </svg>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-8 sm:py-12 -mt-8 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SearchBar
              placeholder="Search Lisu or English words..."
              className="text-lg"
              autoFocus={false}
              size="large"
              showEnhancedFeatures={true}
              showSuggestions={true}
            />
          </div>
        </section>

        {/* Featured Content Section */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

              {/* Left Column: Featured Words */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpenIcon className="w-6 h-6 text-teal-600" />
                    Featured Words
                  </h3>
                  <Link to="/dictionary" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                    View all
                  </Link>
                </div>

                {isLoadingWords ? (
                  <div className="space-y-3">
                    <SkeletonLoader variant="card" count={4} />
                  </div>
                ) : featuredWords.length > 0 ? (
                  <div className="space-y-3">
                    {featuredWords.map((word, index) => (
                      <Link
                        key={word.id || index}
                        to={`/dictionary?q=${word.english_word || word.lisu_word}`}
                        className="block bg-white rounded-xl p-5 hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-teal-300:border-teal-600 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* English Word (shown first for better accessibility) */}
                            <div className="text-lg font-bold text-gray-900 mb-1 group-hover:text-teal-600:text-teal-400 transition-colors">
                              {word.english_word || 'Word'}
                            </div>

                            {/* Lisu Translation */}
                            <div className="text-sm font-medium text-gray-600 mb-2">
                              {word.lisu_word || 'ꓡꓴ'}
                              {word.pronunciation_lisu && (
                                <span className="text-xs text-gray-400 ml-2">
                                  • {word.pronunciation_lisu}
                                </span>
                              )}
                              {word.part_of_speech && (
                                <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-[10px] font-medium text-gray-500 uppercase tracking-wide rounded">
                                  {typeof word.part_of_speech === 'object' ? word.part_of_speech?.name : word.part_of_speech}
                                </span>
                              )}
                            </div>

                            {/* Definition */}
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {word.english_definition || word.lisu_definition || 'Explore the meaning and context for this word.'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No featured words available</p>
                  </div>
                )}
              </div>

              {/* Right Column: Community Hub */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-teal-600" />
                    Community
                  </h3>
                  <Link to="/discussions" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                    View all
                  </Link>
                </div>

                {/* Recent Discussions Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 mb-4 hover:shadow-lg transition-shadow">
                  <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    Recent Discussions
                  </h4>

                  {isLoadingDiscussions ? (
                    <div className="space-y-4">
                      <SkeletonLoader variant="list-item" count={2} />
                    </div>
                  ) : recentDiscussions.length > 0 ? (
                    <div className="space-y-6">
                      {recentDiscussions.slice(0, 2).map((discussion, index) => (
                        <React.Fragment key={discussion.id}>
                          <Link
                            to={`/discussions/${discussion.id}`}
                            className="block hover:opacity-80 transition-opacity"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {discussion.user_data?.display_picture && (
                                  <img
                                    src={discussion.user_data.display_picture}
                                    alt={discussion.user_data?.username || 'User'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                                {!discussion.user_data?.display_picture && (
                                  <span className="text-sm font-bold text-teal-700">
                                    {discussion.user_data?.username?.charAt(0).toUpperCase() || 'A'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 truncate">
                                  {discussion.user_data?.username || 'Anonymous'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {typeof discussion.category === 'object' ? discussion.category?.name : discussion.category || 'General'}
                                </div>
                              </div>
                            </div>

                            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-teal-600:text-teal-400">
                              {discussion.title}
                            </h4>

                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {discussion.content?.replace(/<[^>]*>/g, '') || 'Join the discussion to learn more...'}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
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
                          {index < recentDiscussions.slice(0, 2).length - 1 && (
                            <div className="border-t border-gray-200 my-4"></div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500">No recent discussions.</p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Link
                  to="/discussions/new"
                  className="flex items-center justify-center w-full px-6 py-3 bg-teal-600 hover:bg-teal-700:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  <PencilSquareIcon className="h-5 w-5 mr-2" />
                  Start a Discussion
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why Learn Lisu / Cultural Immersion Section */}
        <section className="py-16 lg:py-20 bg-gray-50 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="order-2 lg:order-1">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Why Learn Lisu?
                </h2>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  The Lisu language is spoken by over 1 million people across China, Myanmar,
                  Thailand, and India. Our dictionary helps preserve this rich linguistic
                  tradition while making it accessible to new learners worldwide.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Cultural Preservation</h3>
                      <p className="text-gray-600">Help preserve and promote the Lisu language for future generations</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Connect with Communities</h3>
                      <p className="text-gray-600">Bridge communication gaps and connect with Lisu-speaking communities</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Rich History & Etymology</h3>
                      <p className="text-gray-600">Explore the fascinating linguistic development and cultural context</p>
                    </div>
                  </div>
                </div>
                <Link
                  to="/about"
                  className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700:bg-teal-700 text-white font-medium rounded-md transition-colors duration-200"
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
        <section className="py-16 lg:py-20 bg-white transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpenIcon className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Words</h3>
                  <p className="text-sm text-gray-600">
                    Add new Lisu words and definitions to expand our dictionary
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AcademicCapIcon className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Knowledge</h3>
                  <p className="text-sm text-gray-600">
                    Help others by answering questions and sharing insights
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PencilSquareIcon className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Suggest Edits</h3>
                  <p className="text-sm text-gray-600">
                    Improve existing entries with corrections and additional context
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Home;
