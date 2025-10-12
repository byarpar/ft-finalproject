import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuestions, setActiveQuestions] = useState({});
  const [filteredFaqs, setFilteredFaqs] = useState([]);

  // FAQ Categories and Questions
  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      questions: [
        {
          id: 'create-account',
          question: 'How do I create an account?',
          answer: 'Click the "Sign Up" button in the top right corner of any page and follow the prompts. You\'ll need to provide a valid email address, create a username, and set a password. After submitting, check your email for a verification link to activate your account.'
        },
        {
          id: 'forgot-password',
          question: 'I forgot my password. What should I do?',
          answer: (
            <>
              Visit the <Link to="/forgot-password" className="text-teal-600 dark:text-teal-400 hover:underline">Forgot Password page</Link>, enter your registered email address, and we'll send you a password reset link. The link will be valid for 24 hours. If you don't receive the email, check your spam folder or contact support.
            </>
          )
        },
        {
          id: 'verify-email',
          question: 'Why do I need to verify my email?',
          answer: 'Email verification helps us ensure account security and allows us to send you important notifications. It also enables password recovery and prevents unauthorized account creation. You won\'t be able to access all features until your email is verified.'
        },
        {
          id: 'login-issues',
          question: 'I can\'t log in. What should I check?',
          answer: (
            <>
              <ul className="list-disc list-inside space-y-1">
                <li>Verify you're using the correct email and password</li>
                <li>Check if Caps Lock is on</li>
                <li>Ensure your email has been verified</li>
                <li>Clear your browser cache and cookies</li>
                <li>Try a different browser or device</li>
                <li>Check if your account has been suspended (you'll receive an email)</li>
              </ul>
              <p className="mt-2">If none of these work, <Link to="/contact" className="text-teal-600 dark:text-teal-400 hover:underline">contact our support team</Link>.</p>
            </>
          )
        }
      ]
    },
    {
      id: 'using-dictionary',
      title: 'Using the Dictionary',
      questions: [
        {
          id: 'search-words',
          question: 'How do I search for words?',
          answer: 'Use the search bar at the top of any page or visit the Dictionary page. You can search in Lisu or English. The search supports partial matches, so typing a few letters will show relevant results. Use filters to narrow results by part of speech, dialect, or other criteria.'
        },
        {
          id: 'pronunciation',
          question: 'How can I hear word pronunciations?',
          answer: 'Many words have audio pronunciations recorded by native speakers. Look for the speaker icon (🔊) next to words. Click it to hear the pronunciation. If a word doesn\'t have audio yet, you can contribute by recording and submitting your own pronunciation!'
        },
        {
          id: 'save-words',
          question: 'Can I save words for later reference?',
          answer: 'Yes! When viewing a word, click the bookmark icon to save it to your personal collection. Access your saved words anytime from your Dashboard. You can organize them into custom lists and export them for offline study.'
        },
        {
          id: 'word-missing',
          question: 'What if I can\'t find a word?',
          answer: (
            <>
              If you can't find a word, you can help expand our dictionary! Visit the <Link to="/contribute" className="text-teal-600 dark:text-teal-400 hover:underline">Contribute page</Link> and use the "Suggest a New Word" form. Provide the Lisu word, English translation, part of speech, and example sentences. Our team will review and add it to the dictionary.
            </>
          )
        },
        {
          id: 'etymology',
          question: 'Does the dictionary include word origins and etymology?',
          answer: 'Yes! Many entries include etymology information showing the word\'s historical development and linguistic roots. Look for the "Etymology" section on word detail pages. This feature helps understand how Lisu words evolved and their connections to other languages.'
        }
      ]
    },
    {
      id: 'account-profile',
      title: 'Account & Profile',
      questions: [
        {
          id: 'change-username',
          question: 'Can I change my username?',
          answer: 'Yes, you can change your username once every 30 days. Go to your Profile settings, click "Edit Profile," and update your username. Note that your previous username may remain visible in old posts and comments for consistency.'
        },
        {
          id: 'profile-picture',
          question: 'How do I upload a profile picture?',
          answer: 'Visit your Profile page, click the camera icon on your avatar, and select an image from your device. Supported formats are JPG, PNG, and GIF (max 5MB). The image will be automatically cropped to a square. Profile pictures are visible to all users.'
        },
        {
          id: 'privacy-settings',
          question: 'What privacy settings are available?',
          answer: (
            <>
              You can control various privacy settings from your Profile settings:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Who can see your profile (Everyone, Members only, Private)</li>
                <li>Who can send you messages</li>
                <li>Email notification preferences</li>
                <li>Display your contribution count publicly</li>
                <li>Show/hide your activity history</li>
              </ul>
              <p className="mt-2">See our <Link to="/privacy" className="text-teal-600 dark:text-teal-400 hover:underline">Privacy Policy</Link> for more details.</p>
            </>
          )
        },
        {
          id: 'delete-account',
          question: 'How do I delete my account?',
          answer: 'To delete your account, go to Settings > Account > Delete Account. This action is permanent and cannot be undone. Your public contributions (word suggestions, definitions) will remain attributed to "Anonymous" to preserve the dictionary\'s integrity. Personal data will be deleted within 30 days as per our privacy policy.'
        },
        {
          id: 'notifications',
          question: 'How do I manage email notifications?',
          answer: 'Go to Settings > Notifications to customize what emails you receive. You can control notifications for: new messages, discussion replies, word approval, contribution feedback, newsletter, and community updates. You can also unsubscribe from specific types via the link at the bottom of any email we send.'
        }
      ]
    },
    {
      id: 'contributing',
      title: 'Contributing',
      questions: [
        {
          id: 'how-contribute',
          question: 'How can I contribute new words?',
          answer: (
            <>
              Visit the <Link to="/contribute" className="text-teal-600 dark:text-teal-400 hover:underline">Contribute page</Link> and select "Suggest a New Word." Fill in the required fields: Lisu word, English translation, and part of speech. Optional but helpful: example sentences, pronunciation notes, and audio recording. All contributions are reviewed by our team before being published.
            </>
          )
        },
        {
          id: 'improve-definition',
          question: 'Can I improve existing definitions?',
          answer: 'Absolutely! If you notice an incomplete or inaccurate definition, click "Suggest Improvement" on any word page, or use the "Improve a Definition" option on the Contribute page. Provide your improved definition and explain why it\'s better. Our moderators will review and implement approved improvements.'
        },
        {
          id: 'add-audio',
          question: 'Where can I find help with pronunciation recording?',
          answer: (
            <>
              Visit the <Link to="/help/article/audio-recording" className="text-teal-600 dark:text-teal-400 hover:underline">Audio Recording Guide</Link> in our Help Center for detailed instructions. Use a quiet environment, speak clearly at normal pace, and pronounce the word 2-3 times with brief pauses. Supported formats: MP3, WAV, OGG (max 10MB). Your recordings help thousands of learners!
            </>
          )
        },
        {
          id: 'contribution-approval',
          question: 'How long does it take for contributions to be approved?',
          answer: 'Most contributions are reviewed within 3-5 business days. Complex submissions (like those requiring linguistic verification) may take up to 2 weeks. You\'ll receive an email notification when your contribution is approved, needs revision, or is declined with an explanation.'
        },
        {
          id: 'contribution-guidelines',
          question: 'What are the contribution guidelines?',
          answer: (
            <>
              Please follow these guidelines:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Be Accurate:</strong> Verify information from reliable sources</li>
                <li><strong>Provide Examples:</strong> Include context and usage examples</li>
                <li><strong>Use Respectful Language:</strong> Maintain a positive tone</li>
                <li><strong>Review Existing Entries:</strong> Avoid duplicates</li>
                <li><strong>Cite Sources:</strong> When possible, mention where you learned the word</li>
              </ul>
              <p className="mt-2">Read the full <Link to="/help/article/contribution-guidelines" className="text-teal-600 dark:text-teal-400 hover:underline">Contribution Guidelines</Link> for detailed information.</p>
            </>
          )
        },
        {
          id: 'become-moderator',
          question: 'How can I become a moderator?',
          answer: (
            <>
              We're always looking for dedicated community members to help moderate! Requirements: active account for 6+ months, 50+ approved contributions, good standing in the community, and ability to commit 3-5 hours per week. Apply via the <Link to="/contribute" className="text-teal-600 dark:text-teal-400 hover:underline">Contribute page</Link> under "Join Our Moderators."
            </>
          )
        }
      ]
    },
    {
      id: 'community',
      title: 'Community & Discussions',
      questions: [
        {
          id: 'discussion-access',
          question: 'Do I need an account to participate in discussions?',
          answer: 'Yes, an account is required to post in discussions, comment, or vote. This helps maintain a respectful community and prevents spam. Creating an account is free and only takes a minute. You can browse discussions without an account, but you\'ll need to sign in to participate.'
        },
        {
          id: 'discussion-rules',
          question: 'What are the community discussion rules?',
          answer: (
            <>
              Our discussions are guided by these principles:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Be respectful and courteous to all members</li>
                <li>Stay on topic and keep discussions relevant</li>
                <li>No spam, self-promotion, or advertising</li>
                <li>No hate speech, harassment, or personal attacks</li>
                <li>Respect privacy - don't share personal information</li>
                <li>Use appropriate language and content</li>
              </ul>
              <p className="mt-2">See our full <Link to="/help/article/community-guidelines" className="text-teal-600 dark:text-teal-400 hover:underline">Community Guidelines</Link> for details.</p>
            </>
          )
        },
        {
          id: 'report-content',
          question: 'How do I report inappropriate content?',
          answer: 'Click the "Report" button (flag icon) on any post or comment. Select the reason for reporting (spam, harassment, off-topic, etc.) and provide additional context if needed. Reports are reviewed by moderators within 24 hours. All reports are confidential, and false reports may result in consequences.'
        },
        {
          id: 'discussion-categories',
          question: 'What discussion categories are available?',
          answer: 'Discussions are organized into categories: Language Learning (tips and resources), Translation Help (word and phrase translation), Culture & History (Lisu culture topics), Technical Support (website help), General Discussion (community topics), and Announcements (official updates). Choose the appropriate category when creating a new discussion.'
        },
        {
          id: 'private-messages',
          question: 'Can I send private messages to other users?',
          answer: 'This feature is currently in development and will be available soon! For now, you can interact through public discussions and comments. We\'re working on a secure messaging system that respects user privacy and prevents spam.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      questions: [
        {
          id: 'browser-support',
          question: 'Which browsers are supported?',
          answer: 'Lisu Dictionary works best on modern browsers: Chrome (90+), Firefox (88+), Safari (14+), Edge (90+), and Opera (76+). We recommend keeping your browser updated for the best experience. Mobile browsers on iOS and Android are also fully supported.'
        },
        {
          id: 'slow-loading',
          question: 'The website is loading slowly. What can I do?',
          answer: (
            <>
              Try these solutions:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Clear your browser cache and cookies</li>
                <li>Check your internet connection speed</li>
                <li>Disable browser extensions temporarily</li>
                <li>Try a different browser</li>
                <li>Reduce the number of open tabs</li>
                <li>Check if your device has sufficient memory</li>
              </ul>
              <p className="mt-2">If problems persist, <Link to="/contact" className="text-teal-600 dark:text-teal-400 hover:underline">contact support</Link> with details about your browser, device, and the specific page causing issues.</p>
            </>
          )
        },
        {
          id: 'audio-not-playing',
          question: 'Audio pronunciations aren\'t playing. Why?',
          answer: 'Check that your device volume is turned up and not muted. Ensure your browser has permission to play audio (check browser settings). Try refreshing the page or clearing your cache. If using a mobile device, make sure the "Silent" mode is off. Some ad blockers can interfere with audio - try disabling them temporarily.'
        },
        {
          id: 'mobile-app',
          question: 'Is there a mobile app?',
          answer: 'We don\'t have a dedicated mobile app yet, but our website is fully responsive and works great on mobile browsers! You can add our site to your home screen for an app-like experience: On iOS, tap the Share button and select "Add to Home Screen." On Android, tap the menu and select "Add to Home Screen." A native app is on our roadmap for 2026.'
        },
        {
          id: 'offline-access',
          question: 'Can I use the dictionary offline?',
          answer: 'Currently, an internet connection is required to use the dictionary. However, you can save words to your account and export them as a PDF or CSV file for offline reference. We\'re exploring offline functionality for future updates, which would allow cached searches and saved word lists to work without internet.'
        },
        {
          id: 'report-bug',
          question: 'I found a bug. How do I report it?',
          answer: (
            <>
              Thank you for helping us improve! <Link to="/contact" className="text-teal-600 dark:text-teal-400 hover:underline">Contact our support team</Link> with these details:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>What you were trying to do</li>
                <li>What happened instead (error message if any)</li>
                <li>Steps to reproduce the bug</li>
                <li>Your browser and operating system</li>
                <li>Screenshots if applicable</li>
              </ul>
              <p className="mt-2">We prioritize bug fixes and aim to resolve critical issues within 48 hours.</p>
            </>
          )
        }
      ]
    },
    {
      id: 'lisu-language',
      title: 'Lisu Language & Culture',
      questions: [
        {
          id: 'what-is-lisu',
          question: 'What is Lisu?',
          answer: 'Lisu is a Tibeto-Burman language spoken by approximately 1 million people, primarily in Yunnan Province (China), northern Myanmar, Thailand, and parts of India. It\'s a tonal language with a rich oral tradition and several dialects. The Lisu people have a unique culture with distinctive traditions, music, and festivals.'
        },
        {
          id: 'lisu-dialects',
          question: 'What dialects of Lisu are covered?',
          answer: 'Our dictionary primarily covers the Northern (Nujiang) dialect, which is the most widely spoken. We also include entries from Southern (Dehong) and Central dialects where they differ significantly. Dialect variations are marked in word entries, and you can filter searches by dialect preference in the advanced search options.'
        },
        {
          id: 'writing-system',
          question: 'What writing system does Lisu use?',
          answer: 'The Lisu people use the Fraser script (also called Old Lisu script), developed by missionary James O. Fraser in the early 1900s. It\'s a unique alphabetic system where letters are rotated Latin characters and punctuation marks. Our dictionary displays words in Fraser script, with optional romanization and IPA (International Phonetic Alphabet) for pronunciation.'
        },
        {
          id: 'learn-lisu',
          question: 'Can I learn Lisu using this dictionary?',
          answer: 'While our dictionary is an excellent reference tool, we recommend combining it with structured learning resources. Check our "Resources" section for recommended textbooks, online courses, and language partners. Join our discussions to connect with native speakers and fellow learners. We also have example sentences and audio to help with practical usage.'
        },
        {
          id: 'cultural-resources',
          question: 'Where can I learn about Lisu culture?',
          answer: 'Our dictionary includes cultural notes for many entries, especially those related to traditions, customs, and festivals. Visit our Discussions forum\'s "Culture & History" category where community members share insights, stories, and cultural knowledge. We also maintain a list of external resources including museums, cultural organizations, and academic publications about the Lisu people.'
        },
        {
          id: 'lisu-tones',
          question: 'How do I understand Lisu tones?',
          answer: 'Lisu has six distinct tones: high level, mid level, low level, high falling, mid falling, and low rising. Each tone changes word meaning, so they\'re crucial for proper communication. Word entries include tone markings in the Fraser script and IPA notation. Listen to audio pronunciations to hear tones in context. Our Help Center has a detailed guide to Lisu tones with examples.'
        }
      ]
    }
  ];

  // Initialize filtered FAQs
  useEffect(() => {
    setFilteredFaqs(faqCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFaqs(faqCategories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = faqCategories.map(category => ({
      ...category,
      questions: category.questions.filter(q => {
        const questionMatch = q.question.toLowerCase().includes(query);
        const answerMatch = typeof q.answer === 'string'
          ? q.answer.toLowerCase().includes(query)
          : false;
        return questionMatch || answerMatch;
      })
    })).filter(category => category.questions.length > 0);

    setFilteredFaqs(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const toggleQuestion = (categoryId, questionId) => {
    const key = `${categoryId}-${questionId}`;
    setActiveQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(categoryId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition
      });
    }
  };

  const isQuestionActive = (categoryId, questionId) => {
    const key = `${categoryId}-${questionId}`;
    return activeQuestions[key] || false;
  };

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions - Lisu Dictionary</title>
        <meta
          name="description"
          content="Find quick answers to common questions about the Lisu Dictionary, including how to search, contribute, and learn about the Lisu language and culture."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-700 dark:to-cyan-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <QuestionMarkCircleIcon className="h-16 w-16 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl sm:text-2xl text-teal-50 mb-8 max-w-3xl mx-auto">
                Find quick answers to your questions about the Lisu Dictionary
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for answers..."
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-lg border-2 border-transparent focus:border-teal-300 focus:ring-4 focus:ring-teal-200 focus:outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                {searchQuery && (
                  <p className="mt-2 text-teal-100 text-sm">
                    {filteredFaqs.reduce((acc, cat) => acc + cat.questions.length, 0)} result(s) found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Category Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:sticky lg:top-24">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Browse by Category
                </h2>
                <nav className="space-y-2">
                  {faqCategories.map((category) => {
                    const hasResults = filteredFaqs.some(c => c.id === category.id);
                    if (searchQuery && !hasResults) return null;

                    return (
                      <button
                        key={category.id}
                        onClick={() => scrollToCategory(category.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium"
                      >
                        {category.title}
                      </button>
                    );
                  })}
                </nav>

                {/* Quick Stats */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <strong className="text-gray-900 dark:text-white">
                      {faqCategories.reduce((acc, cat) => acc + cat.questions.length, 0)}
                    </strong> questions answered
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">
                      {faqCategories.length}
                    </strong> categories
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Questions & Answers */}
            <div className="lg:col-span-3">
              {filteredFaqs.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                  <QuestionMarkCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    We couldn't find any questions matching "{searchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredFaqs.map((category) => (
                    <div
                      key={category.id}
                      id={category.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                    >
                      {/* Category Header */}
                      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
                        <h2 className="text-2xl font-bold text-white">
                          {category.title}
                        </h2>
                      </div>

                      {/* Questions */}
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {category.questions.map((question) => {
                          const isActive = isQuestionActive(category.id, question.id);

                          return (
                            <div key={question.id} className="p-6">
                              {/* Question Button */}
                              <button
                                onClick={() => toggleQuestion(category.id, question.id)}
                                className="w-full flex items-start justify-between text-left group"
                              >
                                <span className="flex-1 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 pr-4">
                                  {question.question}
                                </span>
                                <span className="flex-shrink-0 ml-2">
                                  {isActive ? (
                                    <ChevronUpIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                                  ) : (
                                    <ChevronDownIcon className="h-6 w-6 text-gray-400" />
                                  )}
                                </span>
                              </button>

                              {/* Answer */}
                              {isActive && (
                                <div className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                                  {question.answer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Still Need Help Section */}
              <div className="mt-12 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-lg p-8 text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-teal-600 dark:text-teal-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Still Need Help?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  Can't find what you're looking for? Our support team is here to help you with any questions or issues.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Contact Support
                  </Link>
                  <Link
                    to="/help"
                    className="inline-flex items-center justify-center px-8 py-3 bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 font-semibold rounded-lg border-2 border-teal-600 dark:border-teal-400 hover:bg-teal-50 dark:hover:bg-gray-600"
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
                    Visit Help Center
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;
