import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  SpeakerWaveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
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
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedWords, setBookmarkedWords] = useState(new Set());

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
  }, [query, currentPage]); // sortBy is state, not needed as dependency

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

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    // Filter logic would be implemented here
    setShowFilters(false);
  }, []);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      language: { lisuToEnglish: false, englishToLisu: false },
      partOfSpeech: { noun: false, verb: false, adjective: false, pronoun: false, adverb: false },
      toneCategory: { highTone: false, lowTone: false, midTone: false },
      origin: { native: false, loanword: false }
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
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Filter Results
                </h2>

                {/* Language Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Language</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.language.lisuToEnglish}
                        onChange={(e) => setFilters({ ...filters, language: { ...filters.language, lisuToEnglish: e.target.checked } })}
                        className="mr-2 rounded text-teal-600"
                      />
                      <span className="text-sm text-gray-700">Lisu (to English)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.language.englishToLisu}
                        onChange={(e) => setFilters({ ...filters, language: { ...filters.language, englishToLisu: e.target.checked } })}
                        className="mr-2 rounded text-teal-600"
                      />
                      <span className="text-sm text-gray-700">English (to Lisu)</span>
                    </label>
                  </div>
                </div>

                {/* Part of Speech Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Part of Speech</h3>
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
                        <span className="text-sm text-gray-700 capitalize">{pos}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tone Category Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Tone Category</h3>
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
                        <span className="text-sm text-gray-700">
                          {tone.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Origin Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Origin</h3>
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
                        <span className="text-sm text-gray-700 capitalize">{origin}</span>
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
                    className="w-full px-4 py-2 text-teal-600 hover:underline text-sm"
                  >
                    Clear Filters
                  </button>
                </div>

                {/* Contribute CTA */}
                <div className="mt-6 p-4 bg-teal-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    Can't find what you're looking for?
                  </p>
                  <Link
                    to="/contribute"
                    className="inline-flex items-center text-sm font-semibold text-teal-600 hover:underline"
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
                  className="flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50:bg-gray-700 transition-colors"
                >
                  <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="font-semibold text-gray-900">Filter Results</span>
                </button>
              </div>

              {/* Sorting Options */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500"
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
                            {/* Lisu Word & English Word */}
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

        {/* Mobile Filter Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
            <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filter Results</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Mobile filter content - same as desktop sidebar */}
              <div className="space-y-6">
                {/* Same filter sections as desktop */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Language</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 rounded text-teal-600" />
                      <span className="text-sm text-gray-700">Lisu (to English)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 rounded text-teal-600" />
                      <span className="text-sm text-gray-700">English (to Lisu)</span>
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
    </PageLayout>
  );
};

export default Dictionary;
