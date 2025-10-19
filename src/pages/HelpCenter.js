import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  SpeakerWaveIcon,
  WrenchScrewdriverIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import PageLayout from '../components/Layout/PageLayout';

/**
 * HelpCenter Component
 * 
 * Main help center page with categories and search functionality.
 */const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Help categories
  const categories = [
    {
      id: 'dictionary',
      name: 'Using the Dictionary',
      icon: BookOpenIcon,
      articleCount: 8,
      description: 'Learn how to search, browse, and use dictionary features',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'community',
      name: 'Community & Discussions',
      icon: ChatBubbleLeftRightIcon,
      articleCount: 12,
      description: 'Guidelines, posting tips, and community engagement',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'account',
      name: 'Account & Profile',
      icon: UserCircleIcon,
      articleCount: 6,
      description: 'Manage your account, settings, and preferences',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'pronunciation',
      name: 'Pronunciation Help',
      icon: SpeakerWaveIcon,
      articleCount: 5,
      description: 'Master Lisu tones, sounds, and pronunciation',
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      icon: WrenchScrewdriverIcon,
      articleCount: 10,
      description: 'Fix common issues and technical problems',
      color: 'from-red-500 to-rose-500'
    },
    {
      id: 'contribution',
      name: 'Contribution Guide',
      icon: PencilSquareIcon,
      articleCount: 7,
      description: 'How to contribute words, translations, and edits',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  // Quick links / Popular topics
  const quickLinks = [
    {
      title: 'Reset Your Password',
      icon: ShieldCheckIcon,
      link: '/help/article/reset-password',
      color: 'text-blue-600'
    },
    {
      title: 'Report a Bug',
      icon: ExclamationTriangleIcon,
      link: '/contact?subject=bug',
      color: 'text-red-600'
    },
    {
      title: 'Suggest a New Word',
      icon: LightBulbIcon,
      link: '/contribute',
      color: 'text-green-600'
    },
    {
      title: 'Community Guidelines',
      icon: DocumentTextIcon,
      link: '/help/article/community-guidelines',
      color: 'text-purple-600'
    }
  ];

  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Search suggestions data
    const allSuggestions = [
      'How to reset my password',
      'How to use the Lisu keyboard',
      'Understanding Lisu tones',
      'How to report a word error',
      'Community posting guidelines',
      'How to save words',
      'Account verification issues',
      'Pronunciation audio not working',
      'How to contribute translations',
      'Delete my account'
    ];

    if (query.trim().length > 0) {
      const filtered = allSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setSearchSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/help/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  }, [searchQuery, navigate]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/help/search?q=${encodeURIComponent(suggestion)}`);
  }, [navigate]);

  return (
    <PageLayout
      title="Help Center - Lisu Dictionary"
      description="Find answers to common questions, troubleshoot issues, and learn how to use the Lisu Dictionary effectively."
    >
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Search */}
        <section className="relative bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 text-white overflow-hidden">
          {/* Decorative Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                  <QuestionMarkCircleIcon className="h-16 w-16 text-white" />
                </div>
              </div>

              {/* Main Greeting */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
                Hello. How can we help you?
              </h1>
              <p className="text-lg sm:text-xl text-teal-50 max-w-2xl mx-auto mb-8">
                Search our knowledge base or browse categories to find answers
              </p>

              {/* Primary Search Bar */}
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for answers..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => searchQuery && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full pl-14 pr-14 py-5 text-lg border-2 border-transparent rounded-xl focus:ring-4 focus:ring-white/20 focus:border-white bg-white text-gray-900 placeholder-gray-400 shadow-xl transition-all"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                      title="Search"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-5 py-3 text-left hover:bg-gray-50:bg-gray-700 transition-colors flex items-center gap-3 group"
                        >
                          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 group-hover:text-teal-600:text-teal-400" />
                          <span className="text-gray-700 group-hover:text-teal-600:text-teal-400">
                            {suggestion}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Wave Separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
              <path
                fill="rgb(249, 250, 251)"
                fillOpacity="1"
                d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              />
            </svg>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Browse by Category - Main Section */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Browse by Category
                </h2>
                <p className="text-gray-600">
                  Find help articles organized by topic
                </p>
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Link
                      key={category.id}
                      to={`/help/category/${category.id}`}
                      className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:border-teal-500:border-teal-400"
                    >
                      {/* Icon with gradient background */}
                      <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>

                      {/* Category Name */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600:text-teal-400 transition-colors">
                        {category.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {category.description}
                      </p>

                      {/* Article Count and Arrow */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          {category.articleCount} articles
                        </span>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-teal-600:text-teal-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Sidebar - Quick Links & Support */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Links Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <LightBulbIcon className="w-6 h-6 text-teal-600" />
                  Quick Links
                </h3>
                <div className="space-y-3">
                  {quickLinks.map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                      <Link
                        key={index}
                        to={link.link}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50:bg-gray-700 transition-colors group"
                      >
                        <IconComponent className={`w-5 h-5 mt-0.5 ${link.color}`} />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 group-hover:text-teal-600:text-teal-400 transition-colors">
                            {link.title}
                          </span>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-teal-600:text-teal-400 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Contact Support CTA */}
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <PhoneIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">Still Need Help?</h3>
                </div>
                <p className="text-teal-50 text-sm mb-4">
                  Can't find what you're looking for? Our support team is here to assist you.
                </p>
                <Link
                  to="/contact"
                  className="block w-full text-center px-6 py-3 bg-white hover:bg-gray-50 text-teal-600 font-semibold rounded-lg transition-colors shadow-md"
                >
                  Contact Support
                </Link>
              </div>

              {/* Latest Updates */}
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  Latest Updates
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">
                      New: Lisu Keyboard Guide
                    </p>
                    <p className="text-gray-600 text-xs">2 days ago</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Updated: Community Guidelines
                    </p>
                    <p className="text-gray-600 text-xs">1 week ago</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      New: Pronunciation Tips
                    </p>
                    <p className="text-gray-600 text-xs">2 weeks ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HelpCenter;
