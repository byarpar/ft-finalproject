import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ClockIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  SpeakerWaveIcon,
  WrenchScrewdriverIcon,
  PencilSquareIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const HelpCategory = () => {
  const { categoryId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState([]);

  // Category definitions
  const categories = {
    dictionary: {
      id: 'dictionary',
      name: 'Using the Dictionary',
      icon: BookOpenIcon,
      description: 'Learn how to search, browse, and use all dictionary features effectively',
      color: 'from-teal-500 to-cyan-500',
      articles: [
        {
          slug: 'how-to-search',
          title: 'How to Search for Words',
          description: 'Learn different search methods including exact match, contains, and starts with',
          lastUpdated: '2025-10-10'
        },
        {
          slug: 'understanding-word-entries',
          title: 'Understanding Word Entries',
          description: 'Learn about definitions, examples, etymology, and pronunciation',
          lastUpdated: '2025-10-08'
        },
        {
          slug: 'lisu-keyboard',
          title: 'Using the Lisu Virtual Keyboard',
          description: 'How to type Lisu characters using our virtual keyboard',
          lastUpdated: '2025-10-12'
        },
        {
          slug: 'save-favorite-words',
          title: 'Saving and Managing Favorite Words',
          description: 'How to save words for quick access later',
          lastUpdated: '2025-10-05'
        },
        {
          slug: 'browse-by-letter',
          title: 'Browsing Words by Letter',
          description: 'How to explore the dictionary alphabetically',
          lastUpdated: '2025-10-03'
        },
        {
          slug: 'advanced-search',
          title: 'Advanced Search Features',
          description: 'Using filters, part of speech, and other advanced options',
          lastUpdated: '2025-09-28'
        },
        {
          slug: 'word-of-the-day',
          title: 'Word of the Day Feature',
          description: 'Learn a new Lisu word every day',
          lastUpdated: '2025-09-25'
        },
        {
          slug: 'related-words',
          title: 'Discovering Related Words',
          description: 'How to find synonyms and related vocabulary',
          lastUpdated: '2025-10-11'
        }
      ]
    },
    community: {
      id: 'community',
      name: 'Community & Discussions',
      icon: ChatBubbleLeftRightIcon,
      description: 'Guidelines for participating in the Lisu Dictionary community',
      color: 'from-blue-500 to-indigo-500',
      articles: [
        {
          slug: 'community-guidelines',
          title: 'Community Guidelines',
          description: 'Rules and best practices for respectful interaction',
          lastUpdated: '2025-10-09'
        },
        {
          slug: 'creating-discussions',
          title: 'Creating a New Discussion',
          description: 'How to start conversations and ask questions',
          lastUpdated: '2025-10-07'
        },
        {
          slug: 'replying-to-posts',
          title: 'Replying to Discussions',
          description: 'How to participate in ongoing conversations',
          lastUpdated: '2025-10-06'
        },
        {
          slug: 'markdown-formatting',
          title: 'Formatting Your Posts',
          description: 'Using markdown and formatting options',
          lastUpdated: '2025-10-04'
        },
        {
          slug: 'reporting-content',
          title: 'Reporting Inappropriate Content',
          description: 'How to flag posts that violate guidelines',
          lastUpdated: '2025-10-01'
        },
        {
          slug: 'following-discussions',
          title: 'Following Discussions and Notifications',
          description: 'Get notified about replies and updates',
          lastUpdated: '2025-09-29'
        }
      ]
    },
    account: {
      id: 'account',
      name: 'Account & Profile',
      icon: UserCircleIcon,
      description: 'Manage your account settings and profile information',
      color: 'from-purple-500 to-pink-500',
      articles: [
        {
          slug: 'create-account',
          title: 'Creating an Account',
          description: 'Sign up for a Lisu Dictionary account',
          lastUpdated: '2025-10-08'
        },
        {
          slug: 'reset-password',
          title: 'Reset Your Password',
          description: 'Recover access if you forgot your password',
          lastUpdated: '2025-10-10'
        },
        {
          slug: 'verify-email',
          title: 'Email Verification Issues',
          description: 'Troubleshoot verification email problems',
          lastUpdated: '2025-10-07'
        },
        {
          slug: 'update-profile',
          title: 'Updating Your Profile',
          description: 'Change your name, bio, and profile picture',
          lastUpdated: '2025-10-05'
        },
        {
          slug: 'privacy-settings',
          title: 'Privacy Settings',
          description: 'Control what others can see about you',
          lastUpdated: '2025-10-02'
        },
        {
          slug: 'delete-account',
          title: 'Deleting Your Account',
          description: 'How to permanently delete your account',
          lastUpdated: '2025-09-30'
        }
      ]
    },
    pronunciation: {
      id: 'pronunciation',
      name: 'Pronunciation Help',
      icon: SpeakerWaveIcon,
      description: 'Master Lisu sounds, tones, and pronunciation',
      color: 'from-orange-500 to-amber-500',
      articles: [
        {
          slug: 'lisu-tones',
          title: 'Understanding Lisu Tones',
          description: 'Learn the 6 tones of the Lisu language',
          lastUpdated: '2025-10-11'
        },
        {
          slug: 'pronunciation-guide',
          title: 'Complete Pronunciation Guide',
          description: 'How to pronounce Lisu sounds correctly',
          lastUpdated: '2025-10-09'
        },
        {
          slug: 'audio-not-playing',
          title: 'Audio Not Playing',
          description: 'Fix issues with pronunciation audio',
          lastUpdated: '2025-10-06'
        },
        {
          slug: 'tone-marks',
          title: 'Reading Tone Marks',
          description: 'Understanding tone notation in Fraser script',
          lastUpdated: '2025-10-03'
        },
        {
          slug: 'practice-pronunciation',
          title: 'Practice Tips',
          description: 'Effective ways to practice Lisu pronunciation',
          lastUpdated: '2025-09-27'
        }
      ]
    },
    troubleshooting: {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      icon: WrenchScrewdriverIcon,
      description: 'Fix common technical issues and problems',
      color: 'from-red-500 to-rose-500',
      articles: [
        {
          slug: 'cant-login',
          title: 'Cannot Log In',
          description: 'Troubleshoot login problems',
          lastUpdated: '2025-10-10'
        },
        {
          slug: 'search-not-working',
          title: 'Search Not Working',
          description: 'Fix dictionary search issues',
          lastUpdated: '2025-10-08'
        },
        {
          slug: 'lisu-characters-not-displaying',
          title: 'Lisu Characters Not Displaying',
          description: 'Fix font and character rendering issues',
          lastUpdated: '2025-10-07'
        },
        {
          slug: 'slow-performance',
          title: 'Slow Loading or Performance Issues',
          description: 'Improve site speed and responsiveness',
          lastUpdated: '2025-10-05'
        },
        {
          slug: 'mobile-app-issues',
          title: 'Mobile App Problems',
          description: 'Common mobile browsing issues',
          lastUpdated: '2025-10-02'
        },
        {
          slug: 'browser-compatibility',
          title: 'Browser Compatibility',
          description: 'Which browsers work best',
          lastUpdated: '2025-09-29'
        },
        {
          slug: 'report-bug',
          title: 'How to Report a Bug',
          description: 'Help us fix technical problems',
          lastUpdated: '2025-09-26'
        }
      ]
    },
    contribution: {
      id: 'contribution',
      name: 'Contribution Guide',
      icon: PencilSquareIcon,
      description: 'Learn how to contribute to the dictionary',
      color: 'from-green-500 to-emerald-500',
      articles: [
        {
          slug: 'suggest-new-word',
          title: 'Suggesting a New Word',
          description: 'How to submit new words for the dictionary',
          lastUpdated: '2025-10-11'
        },
        {
          slug: 'edit-existing-word',
          title: 'Editing Existing Entries',
          description: 'Propose corrections and improvements',
          lastUpdated: '2025-10-09'
        },
        {
          slug: 'translation-guidelines',
          title: 'Translation Guidelines',
          description: 'Best practices for accurate translations',
          lastUpdated: '2025-10-07'
        },
        {
          slug: 'add-examples',
          title: 'Adding Example Sentences',
          description: 'How to contribute example usage',
          lastUpdated: '2025-10-04'
        },
        {
          slug: 'etymology-contributions',
          title: 'Contributing Etymology Information',
          description: 'Share word origins and history',
          lastUpdated: '2025-10-01'
        },
        {
          slug: 'audio-contributions',
          title: 'Recording Pronunciation Audio',
          description: 'How to submit audio recordings',
          lastUpdated: '2025-09-28'
        },
        {
          slug: 'contribution-review',
          title: 'Contribution Review Process',
          description: 'How submissions are reviewed and approved',
          lastUpdated: '2025-09-25'
        }
      ]
    }
  };

  const category = categories[categoryId];

  useEffect(() => {
    if (category) {
      setFilteredArticles(category.articles);
    }
  }, [categoryId, category]);

  const handleSearchInCategory = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (category) {
      if (query.trim()) {
        const filtered = category.articles.filter(
          article =>
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.description.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredArticles(filtered);
      } else {
        setFilteredArticles(category.articles);
      }
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Category Not Found
          </h1>
          <Link
            to="/help"
            className="text-teal-600 dark:text-teal-400 hover:underline"
          >
            Return to Help Center
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = category.icon;
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>{category.name} - Help Center - Lisu Dictionary</title>
        <meta name="description" content={category.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className={`relative bg-gradient-to-br ${category.color} text-white overflow-hidden`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm mb-6 text-white/80">
              <Link to="/help" className="hover:text-white transition-colors">
                Help Center
              </Link>
              <ChevronRightIcon className="w-4 h-4" />
              <span className="text-white font-medium">{category.name}</span>
            </nav>

            {/* Category Header */}
            <div className="flex items-start gap-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <IconComponent className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                  {category.name}
                </h1>
                <p className="text-lg text-white/90 max-w-3xl">
                  {category.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link
            to="/help"
            className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Help Center
          </Link>

          {/* Search within Category */}
          <div className="mb-8">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search in ${category.name}...`}
                value={searchQuery}
                onChange={handleSearchInCategory}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          {/* Article List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Articles ({filteredArticles.length})
            </h2>

            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <Link
                  key={article.slug}
                  to={`/help/article/${article.slug}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {article.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <ClockIcon className="w-4 h-4" />
                        <span>Updated {formatDate(article.lastUpdated)}</span>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  No articles found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>

          {/* Help CTA */}
          <div className="mt-12 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800 p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Can't Find What You're Looking For?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our support team is here to help you with any questions.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpCategory;
