import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  UserGroupIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import SearchBar from '../components/Search/SearchBar';
import { wordsAPI, discussionsAPI } from '../services/api';

const Home = () => {
  const [featuredWords, setFeaturedWords] = useState([]);
  const [recentDiscussions, setRecentDiscussions] = useState([]);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(true);

  // Fetch featured words on component mount
  useEffect(() => {
    const fetchFeaturedWords = async () => {
      try {
        setIsLoadingWords(true);
        // Get top words by frequency score for featured section (limit to 3)
        const response = await wordsAPI.getWords({ limit: 3, sort: 'frequency_score', order: 'DESC' });
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
          limit: 3,
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative py-20 lg:py-32 overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(55, 125, 115, 0.85), rgba(55, 125, 115, 0.85)), url(/images/hero/lisu-people.jpg)',
          backgroundColor: '#377d73'
        }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-2xl">
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
              LISU DICTIONARY:
            </h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight">
              Your Gateway to the Lisu Language
            </h2>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
              Lisu Language
            </h2>

            {/* Subtitle/Tagline */}
            <p className="text-xl md:text-2xl text-white mb-10 font-light">
              Connect, Learn, Translate
            </p>

            {/* Large Search Bar */}
            <div className="max-w-xl mb-8">
              <SearchBar
                placeholder="Search for a English word..."
                className="text-lg shadow-xl"
                autoFocus={false}
              />
            </div>
          </div>
        </div>
      </section>      {/* Featured Words / Word of the Day Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Featured Words
            </h2>
          </div>

          {isLoadingWords ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-8 shadow-md animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : featuredWords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredWords.map((word, index) => (
                <div
                  key={word.id || index}
                  className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4 border-teal-500 flex flex-col"
                >
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-800 mb-2">
                      {word.lisu_word || 'ꓡꓴ'}
                    </div>
                    {word.pronunciation_lisu && (
                      <div className="text-sm text-gray-400 italic mb-2">
                        /{word.pronunciation_lisu}/
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-teal-700">
                        {word.english_word || 'word'}
                      </div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide px-2 py-1 bg-gray-100 rounded">
                        {typeof word.part_of_speech === 'object' ? word.part_of_speech?.name : word.part_of_speech || 'noun'}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                    {word.english_definition || word.lisu_definition || 'The definition provides meaning and context for this Lisu word.'}
                  </p>
                  <Link
                    to={`/dictionary?q=${word.english_word || word.lisu_word}`}
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors duration-200 mt-auto"
                  >
                    View Word
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No featured words available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Learn Lisu / About the Community Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
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
                className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors duration-200"
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

      {/* Join the Discussion Teaser Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left side - Discussion list */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Join the Discussion
                </h2>
                <p className="text-lg text-gray-600">
                  Connect with fellow learners, ask questions, and share your knowledge
                </p>
              </div>

              {isLoadingDiscussions ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentDiscussions.length > 0 ? (
                <div className="space-y-4">
                  {recentDiscussions.map((discussion) => (
                    <Link
                      key={discussion.id}
                      to={`/discussions/${discussion.id}`}
                      className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-teal-500 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium">
                          {typeof discussion.category === 'object' ? discussion.category?.name : discussion.category || 'General'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {discussion.answers_count || 0} replies
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-teal-600 line-clamp-2">
                        {discussion.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {discussion.content?.replace(/<[^>]*>/g, '') || 'Join the discussion to learn more...'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          {discussion.username || 'Anonymous'}
                        </span>
                        <span className="flex items-center">
                          <HeartIcon className="h-4 w-4 mr-1" />
                          {discussion.likes_count || 0}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent discussions available.</p>
                </div>
              )}

              <div className="mt-8">
                <Link
                  to="/discussions"
                  className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold"
                >
                  Explore All Discussions
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '125%', position: 'relative' }}>
                  <img
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80&fit=crop"
                    alt="Join the discussion"
                    className="absolute inset-0 object-cover w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/600x750/0d9488/ffffff?text=Join+Discussion";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contribute / Get Involved Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Contribute & Get Involved
            </h2>
            <p className="text-lg text-gray-700 mb-10 leading-relaxed">
              Help us build the most comprehensive Lisu dictionary. Your contributions make a difference
              in preserving and promoting the Lisu language for future generations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpenIcon className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Words</h3>
                <p className="text-sm text-gray-600">
                  Add new Lisu words and definitions to expand our dictionary
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIcon className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Knowledge</h3>
                <p className="text-sm text-gray-600">
                  Help others by answering questions and sharing insights
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PencilSquareIcon className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Suggest Edits</h3>
                <p className="text-sm text-gray-600">
                  Improve existing entries with corrections and additional context
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md transition-colors duration-200"
              >
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Join Community
              </Link>
              <Link
                to="/discussions"
                className="inline-flex items-center justify-center px-8 py-3 bg-white hover:bg-gray-50 text-teal-600 font-semibold rounded-md border-2 border-teal-600 transition-colors duration-200"
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
