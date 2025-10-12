import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { searchAPI, wordsAPI } from '../services/api';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  SparklesIcon,
  HeartIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  LanguageIcon,
  PlusIcon,
  FireIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dictionary = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchDirection, setSearchDirection] = useState('both');
  const [searchType, setSearchType] = useState('contains');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showLisuKeyboard, setShowLisuKeyboard] = useState(false);
  const englishLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [relatedWords, setRelatedWords] = useState({});
  const [loadingRelated, setLoadingRelated] = useState({});

  // Load initial words on mount
  useEffect(() => {
    const loadInitialWords = async () => {
      try {
        setIsSearching(true);
        const response = await wordsAPI.getWords({ page: 1 });
        if (response.success && response.data?.words) {
          setSearchResults(response.data.words);
          setHasSearched(true);
        }
      } catch (error) {
        console.error('Failed to load initial words:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      handleSearch(query);
    } else {
      loadInitialWords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setSelectedLetter(null);
    try {
      const response = await searchAPI.search({
        q: query
      });
      // Handle response structure: response.success, response.data.results
      if (response.success && response.data?.results) {
        setSearchResults(response.data.results);
        // Automatically fetch related words for all results
        response.data.results.forEach(result => {
          if (result.id) {
            fetchRelatedWords(result.id);
          }
        });
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    setSearchTerm(letter.toLowerCase());
    handleSearch(letter.toLowerCase());
  };

  // Fetch related words for a given word
  const fetchRelatedWords = async (wordId) => {
    if (!wordId || relatedWords[wordId]) return; // Skip if already loaded

    setLoadingRelated(prev => ({ ...prev, [wordId]: true }));
    try {
      const response = await wordsAPI.getSimilarWords(wordId);
      if (response.success && response.data?.words) {
        setRelatedWords(prev => ({
          ...prev,
          [wordId]: response.data.words
        }));
      } else {
        // Set empty array to prevent retry
        setRelatedWords(prev => ({
          ...prev,
          [wordId]: []
        }));
      }
    } catch (error) {
      console.warn('Failed to fetch related words:', error.message || error);
      // Set empty array to prevent retry on error
      setRelatedWords(prev => ({
        ...prev,
        [wordId]: []
      }));
    } finally {
      setLoadingRelated(prev => ({ ...prev, [wordId]: false }));
    }
  };

  const recentSearches = ['mountain', 'water', 'family', 'hello'];
  const popularSearches = [
    { term: 'ꓡꓲꓻ (mountain)', count: '1.2k', english: 'mountain' },
    { term: 'ꓐꓬ (water)', count: '980', english: 'water' },
    { term: 'ꓟꓬꓻ (family)', count: '856', english: 'family' },
    { term: 'ꓡꓬ (hello)', count: '745', english: 'hello' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-700 dark:to-cyan-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <BookOpenIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">LISU DICTIONARY</h1>
            <p className="text-lg text-teal-50 mb-1">Your Gateway to the Lisu Language</p>
            <p className="text-teal-100 text-sm">Learn, Connect, and Translate</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search for English or Lisu words..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                  className="w-full pl-14 pr-32 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                  <button type="button" onClick={() => setShowLisuKeyboard(!showLisuKeyboard)} className="p-2 text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" title="Lisu Virtual Keyboard">
                    <LanguageIcon className="w-6 h-6" />
                  </button>
                  <button type="button" onClick={() => handleSearch(searchTerm)} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors">
                    Search
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="direction" value="both" checked={searchDirection === 'both'} onChange={(e) => setSearchDirection(e.target.value)} className="mr-2 text-teal-600 focus:ring-teal-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Both</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="direction" value="lisu-to-english" checked={searchDirection === 'lisu-to-english'} onChange={(e) => setSearchDirection(e.target.value)} className="mr-2 text-teal-600 focus:ring-teal-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Lisu → English</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="direction" value="english-to-lisu" checked={searchDirection === 'english-to-lisu'} onChange={(e) => setSearchDirection(e.target.value)} className="mr-2 text-teal-600 focus:ring-teal-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">English → Lisu</span>
                  </label>
                </div>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500">
                  <option value="contains">Contains</option>
                  <option value="exact">Exact Match</option>
                  <option value="starts-with">Starts With</option>
                </select>
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 px-3 py-1.5 text-sm text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  Advanced
                </button>
              </div>
              {showLisuKeyboard && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Lisu Script Characters:</p>
                  <div className="flex flex-wrap gap-2">
                    {['ꓐ', 'ꓑ', 'ꓒ', 'ꓓ', 'ꓔ', 'ꓕ', 'ꓖ', 'ꓗ', 'ꓘ', 'ꓙ', 'ꓚ', 'ꓛ', 'ꓜ', 'ꓝ', 'ꓞ', 'ꓟ', 'ꓠ', 'ꓡ', 'ꓢ', 'ꓣ', 'ꓤ', 'ꓥ', 'ꓦ', 'ꓧ', 'ꓨ', 'ꓩ', 'ꓪ', 'ꓫ', 'ꓬ', 'ꓭ'].map((char) => (
                      <button key={char} type="button" onClick={() => setSearchTerm(prev => prev + char)} className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-lg hover:bg-teal-50 dark:hover:bg-gray-500 hover:border-teal-500 transition-colors">{char}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {!hasSearched && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Browse by Letter</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex flex-wrap gap-2">
                    {englishLetters.map((letter) => (
                      <button key={letter} type="button" onClick={() => handleLetterClick(letter)} className={`w-10 h-10 flex items-center justify-center rounded-lg font-semibold transition-all ${selectedLetter === letter ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-600 hover:text-teal-600'}`}>{letter}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!hasSearched && user && recentSearches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ClockIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    Recent Searches
                  </h2>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentSearches.map((term, index) => (
                    <button key={index} type="button" onClick={() => handleSearch(term)} className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group">
                      <span className="text-gray-900 dark:text-white">{term}</span>
                      <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!hasSearched && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FireIcon className="w-6 h-6 text-orange-500" />
                    Popular Searches
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {popularSearches.map((item, index) => (
                    <button key={index} type="button" onClick={() => handleSearch(item.english)} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-left hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">{item.term}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.count} searches</div>
                        </div>
                        <SparklesIcon className="w-5 h-5 text-orange-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isSearching && (
              <div className="text-center py-16">
                <LoadingSpinner />
                <p className="text-gray-600 dark:text-gray-400 mt-4 font-medium">Searching dictionary...</p>
              </div>
            )}
            {hasSearched && !isSearching && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dictionary Entries
                    {searchResults.length > 0 && (
                      <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-3">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
                    )}
                  </h2>
                  <button type="button" onClick={() => { setHasSearched(false); setSearchTerm(''); setSearchResults([]); }} className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">Clear Search</button>
                </div>
                {searchResults.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No results found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                      We couldn't find any words matching "<span className="font-semibold text-gray-900 dark:text-white">{searchTerm}</span>".
                      Try adjusting your search or explore our suggestions below.
                    </p>

                    <div className="max-w-2xl mx-auto">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Search Tips
                        </h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 text-left">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                            <span>Check your spelling - try different variations</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                            <span>Use the "Contains" search instead of "Exact Match"</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                            <span>Try searching in both English and Lisu</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                            <span>Browse by letter to discover similar words</span>
                          </li>
                        </ul>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => { setHasSearched(false); setSearchTerm(''); setSearchResults([]); }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Browse All Words
                        </button>
                        <Link
                          to="/contribute"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          <PlusIcon className="w-5 h-5" />
                          Suggest This Word
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {searchResults.map((result, index) => (
                      <div key={result.id || index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
                        {/* Word Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                  {result.english_word || result.english || result.word}
                                </h3>
                                <span className="px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 rounded-full uppercase tracking-wide">
                                  {result.part_of_speech || 'noun'}
                                </span>
                              </div>

                              {/* Lisu Word with larger, elegant font */}
                              {(result.lisu_word || result.lisu) && (
                                <div className="text-2xl text-teal-600 dark:text-teal-400 font-semibold mb-3" style={{ fontFamily: 'serif' }}>
                                  {result.lisu_word || result.lisu}
                                </div>
                              )}

                              {/* Pronunciation with audio icon */}
                              {(result.pronunciation_english || result.pronunciation) && (
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <span className="text-base">/{result.pronunciation_english || result.pronunciation}/</span>
                                  <button
                                    type="button"
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                    title="Listen to pronunciation"
                                  >
                                    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 3.5a.75.75 0 00-1.264-.546L5.203 6H3.227a.75.75 0 00-.75.75v6.5c0 .414.336.75.75.75h1.976l3.533 3.046A.75.75 0 0010 16.5v-13zM15.95 5.05a.75.75 0 011.06 0 7.5 7.5 0 010 10.607.75.75 0 11-1.06-1.06 6 6 0 000-8.486.75.75 0 010-1.06zm-1.414 1.414a.75.75 0 011.06 0 4.5 4.5 0 010 6.364.75.75 0 01-1.06-1.06 3 3 0 000-4.243.75.75 0 010-1.06z" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Definitions Section */}
                        <div className="p-6">
                          <div className="mb-4">
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                              {result.english_definition || result.definition || result.meaning || 'Definition not available'}
                            </p>
                          </div>

                          {/* Example Sentences */}
                          {((result.examples && result.examples.length > 0) || result.example) && (
                            <div className="mt-5">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">Example Sentences</h4>
                              <div className="space-y-3">
                                {(result.examples && result.examples.length > 0) ? (
                                  result.examples.slice(0, 2).map((example, idx) => (
                                    <div key={idx} className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg p-4 border-l-4 border-teal-500">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                          <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">{example}</p>
                                        </div>
                                        <button
                                          type="button"
                                          className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors flex-shrink-0"
                                          title="Listen to example"
                                        >
                                          <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 3.5a.75.75 0 00-1.264-.546L5.203 6H3.227a.75.75 0 00-.75.75v6.5c0 .414.336.75.75.75h1.976l3.533 3.046A.75.75 0 0010 16.5v-13z" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                ) : result.example && (
                                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg p-4 border-l-4 border-teal-500">
                                    <div className="flex items-start gap-3">
                                      <div className="flex-1">
                                        <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">{result.example}</p>
                                      </div>
                                      <button
                                        type="button"
                                        className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors flex-shrink-0"
                                        title="Listen to example"
                                      >
                                        <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M10 3.5a.75.75 0 00-1.264-.546L5.203 6H3.227a.75.75 0 00-.75.75v6.5c0 .414.336.75.75.75h1.976l3.533 3.046A.75.75 0 0010 16.5v-13z" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Etymology */}
                          {(result.etymology_origin || result.etymology) && (
                            <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold">Etymology:</span> {result.etymology_origin || result.etymology}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Related Words Section - Only show if there are related words */}
                          {result.id && relatedWords[result.id] && relatedWords[result.id].length > 0 && (
                            <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Related Words
                              </h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {relatedWords[result.id].map((relatedWord, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setSearchTerm(relatedWord.english_word || relatedWord.lisu_word);
                                      handleSearch(relatedWord.english_word || relatedWord.lisu_word);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md transition-all text-left"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                        {relatedWord.english_word}
                                      </span>
                                      <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                                    </div>
                                    {relatedWord.lisu_word && (
                                      <div className="text-sm text-teal-600 dark:text-teal-400 mb-1" style={{ fontFamily: 'serif' }}>
                                        {relatedWord.lisu_word}
                                      </div>
                                    )}
                                    {relatedWord.english_definition && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {relatedWord.english_definition}
                                      </p>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Loading state for related words */}
                          {result.id && loadingRelated[result.id] && (
                            <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Related Words
                              </h4>
                              <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 dark:border-teal-400"></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="px-6 pb-6 flex items-center gap-3 flex-wrap">
                          <Link
                            to={`/words/${result.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium text-sm transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Full Details
                          </Link>

                          <Link
                            to={`/discussions?word=${result.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Discuss this Word
                          </Link>

                          {user && (
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-red-50 dark:hover:bg-gray-600 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 font-medium text-sm transition-colors"
                            >
                              <HeartIcon className="w-4 h-4" />
                              Save
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="lg:w-80 space-y-6">
            {showAdvanced && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Advanced Search
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Part of Speech</label>
                    <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500">
                      <option>All</option>
                      <option>Noun</option>
                      <option>Verb</option>
                      <option>Adjective</option>
                      <option>Adverb</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cultural Context</label>
                    <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500">
                      <option>All</option>
                      <option>Traditional</option>
                      <option>Modern</option>
                      <option>Religious</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Word of the Day */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Word of the Day</h3>
                </div>
                <div className="mb-3">
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Glaatba</h4>
                  <p className="text-lg text-orange-600 dark:text-orange-400 mb-2" style={{ fontFamily: 'serif' }}>ꓖꓳꓰꓽ ꓐꓬ</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">Thank you / Gratitude</p>
                </div>
                <Link
                  to="/words/word-of-day"
                  className="inline-flex items-center text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                >
                  Learn more →
                </Link>
              </div>
            </div>

            {/* Recently Viewed Words */}
            {user && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ClockIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Recently Viewed</h3>
                </div>
                <div className="space-y-3">
                  {['mountain', 'water', 'friend'].map((word, idx) => (
                    <Link
                      key={idx}
                      to={`/words/${idx + 1}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 capitalize">
                            {word}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">2 hours ago</div>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural & Grammar Context */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Learning Resources</h3>
              </div>
              <ul className="space-y-3">
                <li>
                  <Link to="/discussions?tag=grammar" className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group">
                    <ChevronRightIcon className="w-4 h-4 mt-0.5 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                    <div>
                      <div className="font-medium">Basic Grammar Rules</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Learn sentence structure</div>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link to="/discussions?tag=pronunciation" className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group">
                    <ChevronRightIcon className="w-4 h-4 mt-0.5 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                    <div>
                      <div className="font-medium">Pronunciation Guide</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Master Lisu sounds</div>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link to="/discussions?tag=tones" className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group">
                    <ChevronRightIcon className="w-4 h-4 mt-0.5 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                    <div>
                      <div className="font-medium">Tones & Accents</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Understanding tone marks</div>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link to="/discussions?tag=culture" className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group">
                    <ChevronRightIcon className="w-4 h-4 mt-0.5 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                    <div>
                      <div className="font-medium">Cultural Context</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Lisu traditions & customs</div>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-teal-800 p-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Suggest a Word</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Help us expand the dictionary by suggesting new words or translations.</p>
              <Link to="/contribute" className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors w-full justify-center shadow-sm hover:shadow-md">
                <PlusIcon className="w-5 h-5" />
                Contribute
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Community Contributors</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Over <strong className="text-teal-600 dark:text-teal-400">100+</strong> community members have contributed to this dictionary.
              </p>
              <Link to="/about" className="inline-flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300">
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dictionary;
