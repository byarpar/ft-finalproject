import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageLayout from '../components/Layout/PageLayout';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  SpeakerWaveIcon,
  WrenchScrewdriverIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

/**
 * HelpSearch Component
 * 
 * Provides search functionality for the Help Center with category filtering,
 * result highlighting, and comprehensive search across all help articles.
 */
const HelpSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Category filter options
  const categories = [
    { id: 'all', name: 'All Categories', icon: null },
    { id: 'dictionary', name: 'Using the Dictionary', icon: BookOpenIcon },
    { id: 'community', name: 'Community & Discussions', icon: ChatBubbleLeftRightIcon },
    { id: 'account', name: 'Account & Profile', icon: UserCircleIcon },
    { id: 'pronunciation', name: 'Pronunciation Help', icon: SpeakerWaveIcon },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: WrenchScrewdriverIcon },
    { id: 'contribution', name: 'Contribution Guide', icon: PencilSquareIcon }
  ];

  // Mock search database - in production, this would be an API call
  const allArticles = [
    {
      slug: 'how-to-search',
      title: 'How to Search for Words',
      description: 'Learn different search methods including exact match, contains, and starts with',
      category: { id: 'dictionary', name: 'Using the Dictionary' },
      keywords: ['search', 'find', 'lookup', 'query', 'exact', 'contains']
    },
    {
      slug: 'lisu-keyboard',
      title: 'Using the Lisu Virtual Keyboard',
      description: 'How to type Lisu characters using our virtual keyboard',
      category: { id: 'dictionary', name: 'Using the Dictionary' },
      keywords: ['keyboard', 'typing', 'input', 'characters', 'lisu script']
    },
    {
      slug: 'understanding-word-entries',
      title: 'Understanding Word Entries',
      description: 'Learn about definitions, examples, etymology, and pronunciation',
      category: { id: 'dictionary', name: 'Using the Dictionary' },
      keywords: ['definition', 'etymology', 'pronunciation', 'examples', 'word entry']
    },
    {
      slug: 'reset-password',
      title: 'Reset Your Password',
      description: 'Recover access if you forgot your password',
      category: { id: 'account', name: 'Account & Profile' },
      keywords: ['password', 'reset', 'forgot', 'recover', 'login', 'access']
    },
    {
      slug: 'verify-email',
      title: 'Email Verification Issues',
      description: 'Troubleshoot verification email problems',
      category: { id: 'account', name: 'Account & Profile' },
      keywords: ['email', 'verification', 'verify', 'confirm', 'activate']
    },
    {
      slug: 'create-account',
      title: 'Creating an Account',
      description: 'Sign up for a Lisu Dictionary account',
      category: { id: 'account', name: 'Account & Profile' },
      keywords: ['account', 'sign up', 'register', 'create', 'new user']
    },
    {
      slug: 'community-guidelines',
      title: 'Community Guidelines',
      description: 'Rules and best practices for respectful interaction',
      category: { id: 'community', name: 'Community & Discussions' },
      keywords: ['guidelines', 'rules', 'community', 'conduct', 'behavior']
    },
    {
      slug: 'creating-discussions',
      title: 'Creating a New Discussion',
      description: 'How to start conversations and ask questions',
      category: { id: 'community', name: 'Community & Discussions' },
      keywords: ['discussion', 'post', 'create', 'ask', 'question', 'topic']
    },
    {
      slug: 'lisu-tones',
      title: 'Understanding Lisu Tones',
      description: 'Learn the 6 tones of the Lisu language',
      category: { id: 'pronunciation', name: 'Pronunciation Help' },
      keywords: ['tones', 'pronunciation', 'speak', 'sound', 'accent']
    },
    {
      slug: 'pronunciation-guide',
      title: 'Complete Pronunciation Guide',
      description: 'How to pronounce Lisu sounds correctly',
      category: { id: 'pronunciation', name: 'Pronunciation Help' },
      keywords: ['pronunciation', 'guide', 'speak', 'sound', 'phonetics']
    },
    {
      slug: 'cant-login',
      title: 'Cannot Log In',
      description: 'Troubleshoot login problems',
      category: { id: 'troubleshooting', name: 'Troubleshooting' },
      keywords: ['login', 'sign in', 'access', 'error', 'problem', 'cant', 'unable']
    },
    {
      slug: 'search-not-working',
      title: 'Search Not Working',
      description: 'Fix dictionary search issues',
      category: { id: 'troubleshooting', name: 'Troubleshooting' },
      keywords: ['search', 'broken', 'not working', 'error', 'problem', 'fix']
    },
    {
      slug: 'suggest-new-word',
      title: 'Suggesting a New Word',
      description: 'How to submit new words for the dictionary',
      category: { id: 'contribution', name: 'Contribution Guide' },
      keywords: ['suggest', 'submit', 'add', 'contribute', 'new word']
    }
  ];

  const performSearch = (query, category) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate API delay
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let results = allArticles.filter(article => {
        const matchesQuery =
          article.title.toLowerCase().includes(lowerQuery) ||
          article.description.toLowerCase().includes(lowerQuery) ||
          article.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery));

        const matchesCategory = category === 'all' || article.category.id === category;

        return matchesQuery && matchesCategory;
      });

      // Sort by relevance (title match first)
      results.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(lowerQuery);
        const bTitle = b.title.toLowerCase().includes(lowerQuery);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return 0;
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  // Perform initial search if query exists in URL
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, selectedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      performSearch(searchQuery, selectedCategory);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (searchQuery.trim()) {
      performSearch(searchQuery, categoryId);
    }
  };

  return (
    <PageLayout
      title={searchQuery ? `Search: "${searchQuery}" - Help Center - Lisu Dictionary` : 'Search Help Center - Lisu Dictionary'}
      description="Search the Lisu Dictionary Help Center for answers to your questions"
      fullWidth={true}
      background=""
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
              to="/help"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium mb-6 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Help Center
            </Link>

            <h1 className="text-3xl sm:text-4xl font-bold mb-6">Search Help Articles</h1>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="What do you need help with?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg focus:ring-2 focus:ring-white focus:outline-none bg-white text-gray-900 placeholder-gray-500 text-lg"
                autoFocus
              />
            </form>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FunnelIcon className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Filter by Category
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${selectedCategory === category.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-teal-500:border-teal-400'
                      }`}
                  >
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div>
            {searchQuery && (
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {isSearching
                  ? 'Searching...'
                  : searchResults.length > 0
                    ? `Found ${searchResults.length} ${searchResults.length === 1 ? 'article' : 'articles'} for "${searchQuery}"`
                    : `No results found for "${searchQuery}"`}
              </h2>
            )}

            {isSearching ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((article) => {
                  const CategoryIcon = categories.find(c => c.id === article.category.id)?.icon;
                  return (
                    <Link
                      key={article.slug}
                      to={`/help/article/${article.slug}`}
                      className="block bg-white rounded-lg border border-gray-200 p-6 hover:border-teal-500:border-teal-400 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {CategoryIcon && (
                              <CategoryIcon className="w-4 h-4 text-teal-600" />
                            )}
                            <span className="text-sm text-teal-600 font-medium">
                              {article.category.name}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600:text-teal-400 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {article.description}
                          </p>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-teal-600:text-teal-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn't find any articles matching "{searchQuery}". Try different keywords or browse by category.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/help"
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Browse All Categories
                  </Link>
                  <Link
                    to="/contact"
                    className="px-6 py-3 bg-white text-teal-600 font-semibold rounded-lg border border-teal-600 hover:bg-teal-50:bg-gray-700 transition-colors"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  Enter a search query to find help articles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HelpSearch;
