import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookmarkIcon,
  SpeakerWaveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import SearchBar from '../components/Search/SearchBar';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import { searchAPI } from '../services/api';
import PageLayout from '../components/Layout/PageLayout';
import HeroNavbar from '../components/Layout/HeroNavbar';

/**
 * Dictionary Component
 * 
 * Main dictionary page with search, filtering, and word browsing functionality.
 */

const Dictionary = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedWords, setBookmarkedWords] = useState(new Set());

  const resultsPerPage = 10;

  // Fetch search results
  const fetchResults = useCallback(async () => {
    if (!query) return;

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
  }, [query, currentPage]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Handle new search
  const handleSearch = useCallback((searchQuery) => {
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
  }, [setSearchParams]);

  // Toggle bookmark
  const toggleBookmark = useCallback((wordId) => {
    setBookmarkedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  }, []);

  // Pagination
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  // Highlight search query in text
  const highlightQuery = useCallback((text, query) => {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? <mark key={index} className="bg-yellow-200">{part}</mark> : part
    );
  }, []);

  return (
    <PageLayout
      title={query ? `Search Results for "${query}" - Lisu Dictionary` : 'Dictionary Search - Lisu Dictionary'}
      description={query ? `Search results for ${query} in the Lisu Dictionary` : 'Browse and search the Lisu Dictionary'}
      fullWidth={true}
      background=""
    >
      <div className="min-h-screen bg-gray-50">
        {/* Hero Navigation Bar */}
        <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800">
          <HeroNavbar />

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
                showSuggestions={false}
                redirectOnSearch={false}
              />
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Results Column */}
          <main className="max-w-4xl mx-auto">
            {/* Loading State */}
            {isLoading ? (
              <div className="space-y-4">
                <SkeletonLoader variant="card" count={5} />
              </div>
            ) : results.length > 0 ? (
              <>
                {/* Search Results List */}
                <div className="space-y-4">
                  {results.map((word) => (
                    <div
                      key={word.id}
                      className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-teal-500"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Detect if search is in Lisu script */}
                          {(() => {
                            const isLisuSearch = query && query.charCodeAt(0) >= 42192 && query.charCodeAt(0) <= 42239;

                            if (isLisuSearch) {
                              // Show Lisu word first for Lisu searches
                              return (
                                <>
                                  {/* Lisu Word & Pronunciation */}
                                  <div className="flex items-baseline gap-3 mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                      {highlightQuery(word.lisu_word || 'ꓡꓴ', query)}
                                    </h3>
                                    {word.pronunciation_lisu && (
                                      <span className="text-sm text-gray-500 italic">
                                        /{word.pronunciation_lisu}/
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="text-lg font-semibold text-teal-600">
                                      {highlightQuery(word.english_word, query)}
                                    </span>
                                    {word.part_of_speech && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs uppercase rounded">
                                        {typeof word.part_of_speech === 'object' ? word.part_of_speech?.name : word.part_of_speech}
                                      </span>
                                    )}
                                  </div>
                                </>
                              );
                            } else {
                              // Show English word first for English searches
                              return (
                                <>
                                  {/* English Word & Part of Speech */}
                                  <div className="flex items-baseline gap-3 mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                      {highlightQuery(word.english_word, query)}
                                    </h3>
                                    {word.part_of_speech && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs uppercase rounded">
                                        {typeof word.part_of_speech === 'object' ? word.part_of_speech?.name : word.part_of_speech}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="text-lg font-semibold text-teal-600">
                                      {highlightQuery(word.lisu_word || 'ꓡꓴ', query)}
                                    </span>
                                    {word.pronunciation_lisu && (
                                      <span className="text-sm text-gray-500 italic">
                                        /{word.pronunciation_lisu}/
                                      </span>
                                    )}
                                  </div>
                                </>
                              );
                            }
                          })()}

                          {/* Brief Definition */}
                          <p className="text-gray-700 mb-4 line-clamp-2">
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
                              className="flex items-center gap-1 text-teal-600 hover:text-teal-700:text-teal-300 transition-colors"
                              title="Play pronunciation"
                            >
                              <SpeakerWaveIcon className="w-5 h-5" />
                              <span className="text-sm">Listen</span>
                            </button>

                            {/* Bookmark Icon */}
                            <button
                              onClick={() => toggleBookmark(word.id)}
                              className="flex items-center gap-1 text-teal-600 hover:text-teal-700:text-teal-300 transition-colors"
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
                              className="ml-auto inline-flex items-center text-teal-600 hover:text-teal-700:text-teal-300 font-semibold transition-colors"
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
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                    </button>

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === pageNum
                            ? 'bg-teal-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50:bg-gray-800'
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
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </>
            ) : query ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-xl text-gray-600 mb-4">
                  No results found for "{query}"
                </p>
                <p className="text-gray-500 mb-6">
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
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-xl text-gray-600">
                  Start searching to see results
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dictionary;
