import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronRightIcon,
  ArrowLeftIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid
} from '@heroicons/react/24/solid';

const HelpArticle = () => {
  const { articleId } = useParams();
  const [helpful, setHelpful] = useState(null); // null, 'yes', or 'no'
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Article content database
  const articles = {
    'how-to-search': {
      slug: 'how-to-search',
      title: 'How to Search for Words',
      category: { id: 'dictionary', name: 'Using the Dictionary' },
      lastUpdated: '2025-10-10',
      readTime: '3 min',
      content: [
        {
          type: 'paragraph',
          text: 'The Lisu Dictionary offers powerful search capabilities to help you find words quickly and efficiently. This guide will walk you through all available search methods.'
        },
        {
          type: 'heading',
          text: 'Search Methods'
        },
        {
          type: 'subheading',
          text: '1. Exact Match Search'
        },
        {
          type: 'paragraph',
          text: 'By default, the search looks for exact matches. Simply type the word you\'re looking for in either Lisu script or English.'
        },
        {
          type: 'code',
          text: 'Example: "ꓨꓴ" or "hello"'
        },
        {
          type: 'subheading',
          text: '2. Contains Search'
        },
        {
          type: 'paragraph',
          text: 'Find all words that contain your search term anywhere in the word or definition.'
        },
        {
          type: 'list',
          items: [
            'Useful for finding words when you only know part of it',
            'Searches through both Lisu and English text',
            'Case-insensitive for English searches'
          ]
        },
        {
          type: 'subheading',
          text: '3. Starts With Search'
        },
        {
          type: 'paragraph',
          text: 'Find all words that begin with your search term. Perfect for browsing alphabetically.'
        },
        {
          type: 'tip',
          text: 'Pro Tip: Use the "Starts With" method when you know the first few letters but can\'t remember the complete word.'
        },
        {
          type: 'heading',
          text: 'Search Tips'
        },
        {
          type: 'list',
          items: [
            'Use the virtual keyboard to type Lisu characters',
            'Search works in both directions: Lisu to English and English to Lisu',
            'Results show related words and similar terms',
            'Click on any result to see full details including etymology and examples'
          ]
        }
      ],
      relatedArticles: ['lisu-keyboard', 'understanding-word-entries', 'advanced-search']
    },
    'reset-password': {
      slug: 'reset-password',
      title: 'Reset Your Password',
      category: { id: 'account', name: 'Account & Profile' },
      lastUpdated: '2025-10-10',
      readTime: '2 min',
      content: [
        {
          type: 'paragraph',
          text: 'If you\'ve forgotten your password, you can easily reset it through our password recovery system.'
        },
        {
          type: 'heading',
          text: 'Steps to Reset Your Password'
        },
        {
          type: 'numbered-list',
          items: [
            'Go to the Login page',
            'Click on "Forgot Password?" link below the login form',
            'Enter your registered email address',
            'Click "Send Reset Link"',
            'Check your email for the password reset link',
            'Click the link in the email (valid for 1 hour)',
            'Enter your new password twice to confirm',
            'Click "Reset Password" to save your new password'
          ]
        },
        {
          type: 'heading',
          text: 'Troubleshooting'
        },
        {
          type: 'subheading',
          text: 'Didn\'t Receive the Email?'
        },
        {
          type: 'list',
          items: [
            'Check your spam/junk folder',
            'Make sure you entered the correct email address',
            'Wait a few minutes - emails can sometimes be delayed',
            'Try requesting another reset link'
          ]
        },
        {
          type: 'warning',
          text: 'Reset links expire after 1 hour for security reasons. If your link has expired, request a new one.'
        },
        {
          type: 'subheading',
          text: 'Link Expired?'
        },
        {
          type: 'paragraph',
          text: 'If your reset link has expired, simply request a new one by going through the "Forgot Password" process again.'
        },
        {
          type: 'heading',
          text: 'Password Requirements'
        },
        {
          type: 'list',
          items: [
            'At least 8 characters long',
            'Mix of uppercase and lowercase letters recommended',
            'Include numbers or special characters for better security',
            'Don\'t use common passwords or personal information'
          ]
        }
      ],
      relatedArticles: ['create-account', 'verify-email', 'cant-login']
    },
    'community-guidelines': {
      slug: 'community-guidelines',
      title: 'Community Guidelines',
      category: { id: 'community', name: 'Community & Discussions' },
      lastUpdated: '2025-10-09',
      readTime: '5 min',
      content: [
        {
          type: 'paragraph',
          text: 'The Lisu Dictionary community is built on respect, collaboration, and a shared passion for preserving and promoting the Lisu language. These guidelines help ensure a positive experience for everyone.'
        },
        {
          type: 'heading',
          text: 'Core Principles'
        },
        {
          type: 'list',
          items: [
            'Be respectful and kind to all community members',
            'Contribute positively to discussions',
            'Share knowledge and help others learn',
            'Respect cultural sensitivity regarding the Lisu language and people',
            'Keep discussions relevant and on-topic'
          ]
        },
        {
          type: 'heading',
          text: 'What We Encourage'
        },
        {
          type: 'list',
          items: [
            'Asking questions about Lisu language and culture',
            'Sharing your knowledge and expertise',
            'Providing helpful feedback on dictionary entries',
            'Suggesting improvements to translations',
            'Helping other learners',
            'Sharing resources and learning materials'
          ]
        },
        {
          type: 'heading',
          text: 'What We Don\'t Allow'
        },
        {
          type: 'warning',
          text: 'Violations of these rules may result in warnings, content removal, or account suspension.'
        },
        {
          type: 'list',
          items: [
            'Harassment, bullying, or personal attacks',
            'Hate speech or discriminatory language',
            'Spam or excessive self-promotion',
            'Posting off-topic or irrelevant content',
            'Sharing false or misleading information',
            'Copyright violations',
            'Impersonating others'
          ]
        },
        {
          type: 'heading',
          text: 'Reporting Issues'
        },
        {
          type: 'paragraph',
          text: 'If you see content that violates these guidelines, please report it using the report button on the post. Our moderation team reviews all reports and takes appropriate action.'
        },
        {
          type: 'tip',
          text: 'Help us maintain a healthy community by reporting problems rather than engaging with problematic content.'
        }
      ],
      relatedArticles: ['creating-discussions', 'replying-to-posts', 'reporting-content']
    }
  };

  // Related articles for examples
  const relatedArticlesData = {
    'lisu-keyboard': { title: 'Using the Lisu Virtual Keyboard', slug: 'lisu-keyboard' },
    'understanding-word-entries': { title: 'Understanding Word Entries', slug: 'understanding-word-entries' },
    'advanced-search': { title: 'Advanced Search Features', slug: 'advanced-search' },
    'create-account': { title: 'Creating an Account', slug: 'create-account' },
    'verify-email': { title: 'Email Verification Issues', slug: 'verify-email' },
    'cant-login': { title: 'Cannot Log In', slug: 'cant-login' },
    'creating-discussions': { title: 'Creating a New Discussion', slug: 'creating-discussions' },
    'replying-to-posts': { title: 'Replying to Discussions', slug: 'replying-to-posts' },
    'reporting-content': { title: 'Reporting Inappropriate Content', slug: 'reporting-content' }
  };

  const article = articles[articleId];

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Article Not Found
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

  const handleFeedback = (value) => {
    setHelpful(value);
    setFeedbackSubmitted(true);
    // In production, send feedback to backend
    console.log(`Article feedback: ${value}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderContent = (item) => {
    switch (item.type) {
      case 'paragraph':
        return <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.text}</p>;

      case 'heading':
        return <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">{item.text}</h2>;

      case 'subheading':
        return <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">{item.text}</h3>;

      case 'list':
        return (
          <ul className="space-y-2 ml-6">
            {item.items.map((listItem, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-300 flex items-start">
                <span className="text-teal-600 dark:text-teal-400 mr-2">•</span>
                <span>{listItem}</span>
              </li>
            ))}
          </ul>
        );

      case 'numbered-list':
        return (
          <ol className="space-y-2 ml-6 list-decimal">
            {item.items.map((listItem, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-300">{listItem}</li>
            ))}
          </ol>
        );

      case 'code':
        return (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
            {item.text}
          </div>
        );

      case 'tip':
        return (
          <div className="bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-500 p-4 rounded-r-lg">
            <p className="text-teal-900 dark:text-teal-100 font-medium">
              💡 {item.text}
            </p>
          </div>
        );

      case 'warning':
        return (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <p className="text-amber-900 dark:text-amber-100 font-medium">
              ⚠️ {item.text}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>{article.title} - Help Center - Lisu Dictionary</title>
        <meta name="description" content={article.content[0]?.text || article.title} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm mb-6 text-gray-600 dark:text-gray-400">
            <Link to="/help" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Help Center
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
            <Link
              to={`/help/category/${article.category.id}`}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              {article.category.name}
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">{article.title}</span>
          </nav>

          {/* Back Button */}
          <Link
            to={`/help/category/${article.category.id}`}
            className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium mb-8 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to {article.category.name}
          </Link>

          {/* Article Header */}
          <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                <span>{article.readTime} read</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpenIcon className="w-4 h-4" />
                <span>Updated {formatDate(article.lastUpdated)}</span>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
              {article.content.map((item, index) => (
                <div key={index}>
                  {renderContent(item)}
                </div>
              ))}
            </div>

            {/* Was This Helpful? */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Was this article helpful?
                </h3>

                {!feedbackSubmitted ? (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => handleFeedback('yes')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${helpful === 'yes'
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      {helpful === 'yes' ? (
                        <HandThumbUpIconSolid className="w-5 h-5" />
                      ) : (
                        <HandThumbUpIcon className="w-5 h-5" />
                      )}
                      Yes
                    </button>
                    <button
                      onClick={() => handleFeedback('no')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${helpful === 'no'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      {helpful === 'no' ? (
                        <HandThumbDownIconSolid className="w-5 h-5" />
                      ) : (
                        <HandThumbDownIcon className="w-5 h-5" />
                      )}
                      No
                    </button>
                  </div>
                ) : (
                  <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-6">
                    <p className="text-teal-900 dark:text-teal-100 font-medium">
                      Thank you for your feedback!
                      {helpful === 'no' && ' We\'re sorry this didn\'t help. Please contact support for more assistance.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </article>

          {/* Related Articles */}
          {article.relatedArticles && article.relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Related Articles
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {article.relatedArticles.map((relatedSlug) => {
                  const related = relatedArticlesData[relatedSlug];
                  if (!related) return null;
                  return (
                    <Link
                      key={relatedSlug}
                      to={`/help/article/${relatedSlug}`}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {related.title}
                        </h3>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Still Need Help CTA */}
          <div className="mt-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl p-8 text-white text-center">
            <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Still Need Help?</h3>
            <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
              Our support team is here to answer your questions and help you get the most out of Lisu Dictionary.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpArticle;
