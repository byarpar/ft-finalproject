import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { searchAPI } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  SparklesIcon,
  HeartIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import SearchBar from '../components/Search/SearchBar';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Search = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Handle URL search parameter
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      handleSearch(query);
    }
  }, [searchParams]);

  const handleSearch = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await searchAPI.search({ q: query, limit: 20 });
      setSearchResults(response.data?.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const sampleSearches = [
    { term: 'mountain', description: 'Physical geography terms' },
    { term: 'water', description: 'Essential vocabulary' },
    { term: 'family', description: 'Relationship words' },
    { term: 'food', description: 'Daily life vocabulary' },
    { term: 'beautiful', description: 'Descriptive words' },
    { term: 'learn', description: 'Education terms' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Header for Authenticated Users */}
      {user && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-xl text-blue-100">
                Ready to explore the English-Lisu Dictionary?
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="text-center mb-8">
            {!user && (
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Search English-Lisu Dictionary
              </h1>
            )}
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Search for words in English or Lisu. Get definitions, etymology, and cultural context.
            </p>
          </div>

          <div className="relative">
            <SearchBar
              placeholder="Search for English or Lisu words..."
              onSearch={handleSearch}
              value={searchTerm}
              onChange={setSearchTerm}
              className="text-lg py-4"
              autoFocus={true}
            />
          </div>
        </div>

        {/* Quick Actions for Authenticated Users */}
        {user && !hasSearched && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <BookOpenIcon className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Browse Dictionary</h3>
                <p className="text-gray-600 dark:text-gray-400">Explore words alphabetically</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <HeartIcon className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">My Favorites</h3>
                <p className="text-gray-600 dark:text-gray-400">View your saved words</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <ClockIcon className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recent Searches</h3>
                <p className="text-gray-600 dark:text-gray-400">Continue where you left off</p>
              </div>
            </div>
          </div>
        )}

        {/* Sample Searches */}
        {!hasSearched && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Try These Popular Searches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {sampleSearches.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(sample.term)}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-left hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start">
                    <SparklesIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-3 group-hover:text-blue-600 dark:group-hover:text-blue-300" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {sample.term}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {sample.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {isSearching && (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Searching...</p>
          </div>
        )}

        {hasSearched && !isSearching && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results
                {searchResults.length > 0 && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    ({searchResults.length} found)
                  </span>
                )}
              </h2>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  Try a different search term or browse our dictionary.
                </p>
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setSearchTerm('');
                    setSearchResults([]);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {result.english || result.word}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {result.part_of_speech || 'noun'}
                      </span>
                    </div>

                    {result.lisu && (
                      <div className="mb-3">
                        <span className="text-lg font-lisu text-blue-600 dark:text-blue-400">
                          {result.lisu}
                        </span>
                      </div>
                    )}

                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {result.definition || 'Definition not available'}
                    </p>

                    {result.etymology && (
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Etymology:</strong> {result.etymology}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Call to Action for Non-Authenticated Users */}
        {!user && (
          <div className="bg-blue-50 rounded-lg p-8 text-center max-w-2xl mx-auto mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Get More Features
            </h2>
            <p className="text-gray-600 mb-6">
              Sign up for a free account to save your favorite words, track your searches, and access advanced features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Create Account
              </a>
              <a
                href="/login"
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Sign In
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
