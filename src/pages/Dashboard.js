import React from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { wordsAPI, searchAPI } from '../services/api';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch user's recent searches
  const { data: recentSearches, isLoading: searchesLoading } = useQuery(
    ['recentSearches'],
    () => searchAPI.getAnalytics({ user_only: true, limit: 5 }),
    { enabled: !!user }
  );

  // Fetch user's favorite words
  const { data: favoriteWords, isLoading: favoritesLoading } = useQuery(
    ['favoriteWords'],
    () => wordsAPI.getFavorites({ limit: 8 }),
    { enabled: !!user }
  );

  // Fetch trending words
  const { data: trendingWords, isLoading: trendingLoading } = useQuery(
    ['trendingWords'],
    () => wordsAPI.getTrending({ limit: 6 })
  );

  // Mock user stats (would come from API in real app)
  const userStats = {
    searches_today: 12,
    words_learned: 45,
    streak_days: 7,
    total_searches: 234
  };

  const quickActions = [
    {
      icon: MagnifyingGlassIcon,
      title: 'Advanced Search',
      description: 'Search with filters and sorting options',
      href: '/search',
      color: 'blue'
    },
    {
      icon: BookOpenIcon,
      title: 'Browse Words',
      description: 'Explore the dictionary alphabetically',
      href: '/browse',
      color: 'green'
    },
    {
      icon: HeartIcon,
      title: 'My Favorites',
      description: 'View your saved words',
      href: '/favorites',
      color: 'red'
    },
    {
      icon: ArrowTrendingUpIcon,
      title: 'Learning Progress',
      description: 'Track your language learning journey',
      href: '/progress',
      color: 'purple'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || user?.email}! 👋
        </h1>
        <p className="text-gray-600">
          Continue your Lisu language learning journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Searches</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.searches_today}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Words Learned</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.words_learned}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Learning Streak</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.streak_days} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Searches</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.total_searches}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start">
                    <div className={`p-2 bg-${action.color}-100 rounded-lg`}>
                      <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Searches</h2>
            {searchesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentSearches?.data?.length > 0 ? (
              <div className="space-y-3">
                {recentSearches.data.map((search, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">{search.query}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {search.results_count} results
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent searches yet. Start exploring!</p>
            )}
          </div>

          {/* Trending Words */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Trending Words</h2>
            {trendingLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : trendingWords?.data?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingWords.data.map((word) => (
                  <a
                    key={word.id}
                    href={`/word/${word.id}`}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                        {word.english_word}
                      </h3>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Trending
                      </span>
                    </div>
                    <p className="text-blue-600 font-medium mb-1">{word.lisu_translation}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{word.definition}</p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No trending words available.</p>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">{user?.name || 'User'}</h3>
                <p className="text-sm text-gray-600">Language Learner</p>
              </div>
            </div>
            <a
              href="/profile"
              className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors block"
            >
              Edit Profile
            </a>
          </div>

          {/* Favorite Words */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Words</h3>
            {favoritesLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : favoriteWords?.data?.length > 0 ? (
              <div className="space-y-3">
                {favoriteWords.data.slice(0, 5).map((word) => (
                  <a
                    key={word.id}
                    href={`/word/${word.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{word.english_word}</div>
                    <div className="text-sm text-blue-600">{word.lisu_translation}</div>
                  </a>
                ))}
                {favoriteWords.data.length > 5 && (
                  <a
                    href="/favorites"
                    className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2"
                  >
                    View all favorites →
                  </a>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No favorite words yet. Start adding some!</p>
            )}
          </div>

          {/* Learning Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Learning Tip</h3>
            <p className="text-sm text-gray-700 mb-4">
              Try to learn 5 new words every day. Consistency is key to language learning success!
            </p>
            <a
              href="/tips"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              More learning tips →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
