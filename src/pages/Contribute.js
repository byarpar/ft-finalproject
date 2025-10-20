import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PencilIcon,
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import PageLayout from '../components/Layout/PageLayout';

/**
 * Contribute Component
 * 
 * Allows users to contribute new words, edit existing entries,
 * and participate in community discussions.
 */

const Contribute = () => {
  const [activeTab, setActiveTab] = useState('new-word');
  const [formData, setFormData] = useState({
    lisuWord: '',
    englishTranslation: '',
    partOfSpeech: '',
    exampleSentenceLisu: '',
    exampleSentenceEnglish: '',
    pronunciationNotes: '',
    source: '',
    audioFile: null
  });
  const [searchWord, setSearchWord] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Parts of speech options
  const partsOfSpeech = [
    'Noun',
    'Verb',
    'Adjective',
    'Adverb',
    'Pronoun',
    'Preposition',
    'Conjunction',
    'Interjection',
    'Particle',
    'Phrase',
    'Idiom'
  ];

  // Contribution cards data
  const contributionCards = [
    {
      id: 'new-word',
      icon: PencilIcon,
      title: 'Suggest a New Word',
      description: 'Add new Lisu words to expand the dictionary',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      id: 'improve-definition',
      icon: ChatBubbleLeftRightIcon,
      title: 'Improve a Definition',
      description: 'Help refine existing word definitions',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'add-audio',
      icon: MicrophoneIcon,
      title: 'Add Pronunciation Audio',
      description: 'Record audio to help with pronunciation',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'moderator',
      icon: UserGroupIcon,
      title: 'Join Our Moderators',
      description: 'Help manage and grow our community',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  // Featured contributors (sample data)
  const featuredContributors = [
    { id: 1, name: 'Sarah Chen', avatar: 'SC', contributions: 245 },
    { id: 2, name: 'David Wong', avatar: 'DW', contributions: 189 },
    { id: 3, name: 'Maria Garcia', avatar: 'MG', contributions: 156 },
    { id: 4, name: 'James Smith', avatar: 'JS', contributions: 134 },
    { id: 5, name: 'Lisa Zhang', avatar: 'LZ', contributions: 112 }
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          handleCardClick('new-word');
          break;
        case 'i':
          handleCardClick('improve-definition');
          break;
        case 'a':
          handleCardClick('add-audio');
          break;
        case 'r':
          handleReset();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCardClick = useCallback((cardId) => {
    setActiveTab(cardId);
    setSubmitted(false);
    setErrors({});
    // Scroll to form
    const formElement = document.getElementById('submission-form');
    if (formElement) {
      const offset = 100;
      const elementPosition = formElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition
      });
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (audio only)
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          audioFile: 'Please upload a valid audio file (MP3, WAV, or OGG)'
        }));
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          audioFile: 'Audio file must be less than 10MB'
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        audioFile: file
      }));
      setErrors(prev => ({
        ...prev,
        audioFile: ''
      }));
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (activeTab === 'new-word') {
      if (!formData.lisuWord.trim()) {
        newErrors.lisuWord = 'Lisu word is required';
      }
      if (!formData.englishTranslation.trim()) {
        newErrors.englishTranslation = 'English translation is required';
      }
      if (!formData.partOfSpeech) {
        newErrors.partOfSpeech = 'Part of speech is required';
      }
    } else if (activeTab === 'improve-definition') {
      if (!searchWord.trim()) {
        newErrors.searchWord = 'Please search for a word to improve';
      }
      if (!formData.englishTranslation.trim()) {
        newErrors.englishTranslation = 'Improved definition is required';
      }
    } else if (activeTab === 'add-audio') {
      if (!searchWord.trim()) {
        newErrors.searchWord = 'Please search for a word to add audio';
      }
      if (!formData.audioFile) {
        newErrors.audioFile = 'Audio file is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [activeTab, formData, searchWord]);

  const handleReset = useCallback(() => {
    setFormData({
      lisuWord: '',
      englishTranslation: '',
      partOfSpeech: '',
      exampleSentenceLisu: '',
      exampleSentenceEnglish: '',
      pronunciationNotes: '',
      source: '',
      audioFile: null
    });
    setSearchWord('');
    setSubmitted(false);
    setErrors({});
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Here you would normally send the data to your backend
    console.log('Submitting contribution:', {
      type: activeTab,
      data: formData,
      searchWord: activeTab !== 'new-word' ? searchWord : null
    });

    // Simulate successful submission
    setTimeout(() => {
      setSubmitted(true);
      setIsLoading(false);

      // Reset form after 3 seconds
      setTimeout(() => {
        handleReset();
      }, 3000);
    }, 1000);
  }, [activeTab, formData, searchWord, validateForm, handleReset]);

  const getFormTitle = () => {
    switch (activeTab) {
      case 'new-word':
        return 'Suggest a New Word';
      case 'improve-definition':
        return 'Improve an Existing Definition';
      case 'add-audio':
        return 'Add Pronunciation Audio';
      case 'moderator':
        return 'Apply to Be a Moderator';
      default:
        return 'Submit Your Contribution';
    }
  };

  return (
    <PageLayout
      title="Contribute - Lisu Dictionary"
      description="Contribute to the Lisu Dictionary. Share your knowledge, add new words, improve definitions, and help preserve the Lisu language for future generations."
    >
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600"></div>
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="contribute-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#contribute-pattern)" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-black opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left: Text Content */}
              <div className="text-white">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                  Empower the Lisu Language
                </h1>
                <p className="text-xl sm:text-2xl text-teal-50 mb-6">
                  Your Knowledge, Your Legacy. Help us build the most comprehensive Lisu resource.
                </p>
                <div className="flex items-center space-x-2 text-teal-100">
                  <CheckCircleIcon className="h-6 w-6" />
                  <p className="text-lg">
                    Every contribution helps thousands of learners worldwide!
                  </p>
                </div>
              </div>

              {/* Right: Featured Image */}
              <div className="hidden lg:block">
                <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                  <img
                    src="/images/hero/lisu-people.jpg"
                    alt="People collaborating and learning together"
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent && !parent.querySelector('.fallback-content')) {
                        parent.innerHTML = `
                          <div class="fallback-content w-full h-64 bg-white flex items-center justify-center p-4">
                            <div class="text-center">
                              <svg class="h-24 w-24 mx-auto text-teal-500 opacity-50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              <p class="text-gray-600 font-medium">Your Knowledge, Your Legacy</p>
                              <p class="text-sm text-gray-500 mt-2">Empowering Lisu Language Together</p>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Contribution Cards */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {contributionCards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`${card.bgColor} ${card.borderColor} border-2 rounded-lg p-6 text-center hover:shadow-lg transition-all ${activeTab === card.id ? 'ring-4 ring-white ring-opacity-50' : ''
                      }`}
                  >
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${card.color} mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {card.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column: Guidelines & Impact */}
            <div className="lg:col-span-2">
              {/* Contribution Guidelines */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center mb-4">
                  <DocumentTextIcon className="h-6 w-6 text-teal-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Contribution Guidelines
                  </h2>
                </div>

                <p className="text-gray-600 mb-4">
                  Follow these guidelines to ensure your contributions are accurate and helpful:
                </p>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Be Accurate</h3>
                      <p className="text-sm text-gray-600">
                        Verify your information from reliable sources before submitting.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Provide Examples</h3>
                      <p className="text-sm text-gray-600">
                        Context is key for definitions and usage. Include example sentences.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Use Respectful Language</h3>
                      <p className="text-sm text-gray-600">
                        Maintain a positive and respectful tone in all contributions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Review Existing Entries</h3>
                      <p className="text-sm text-gray-600">
                        Avoid duplicates and focus on enhancing existing content.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/help/article/contribution-guidelines"
                  className="inline-flex items-center mt-6 text-teal-600 hover:text-teal-700:text-teal-300 font-medium"
                >
                  Read Full Guidelines
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {/* Meet Our Contributors */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Meet Our Contributors
                </h2>

                <p className="text-gray-600 mb-6">
                  Join our community of dedicated language preservers and educators.
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  {featuredContributors.map((contributor) => (
                    <div
                      key={contributor.id}
                      className="flex flex-col items-center"
                      title={`${contributor.name} - ${contributor.contributions} contributions`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm mb-1">
                        {contributor.avatar}
                      </div>
                      <span className="text-xs text-gray-600">
                        {contributor.contributions}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                  <p className="text-teal-900 font-medium text-center">
                    🌟 Every contribution helps thousands of learners worldwide!
                  </p>
                </div>

                <Link
                  to="/members"
                  className="inline-flex items-center text-teal-600 hover:text-teal-700:text-teal-300 font-medium"
                >
                  View All Contributors
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Right Column: Submission Form */}
            <div className="lg:col-span-3" id="submission-form">
              <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  {getFormTitle()}
                </h2>

                {/* Success Message */}
                {submitted && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <h3 className="text-green-900 font-semibold">
                          Thank you for your contribution!
                        </h3>
                        <p className="text-green-700 text-sm">
                          It will be reviewed by our team shortly.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Word Form */}
                  {activeTab === 'new-word' && (
                    <>
                      {/* Lisu Word */}
                      <div>
                        <label htmlFor="lisuWord" className="block text-sm font-medium text-gray-700 mb-2">
                          Lisu Word <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="lisuWord"
                          name="lisuWord"
                          value={formData.lisuWord}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.lisuWord ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="Enter the Lisu word"
                        />
                        {errors.lisuWord && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {errors.lisuWord}
                          </p>
                        )}
                      </div>

                      {/* English Translation */}
                      <div>
                        <label htmlFor="englishTranslation" className="block text-sm font-medium text-gray-700 mb-2">
                          English Translation(s) <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="englishTranslation"
                          name="englishTranslation"
                          value={formData.englishTranslation}
                          onChange={handleInputChange}
                          rows="3"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.englishTranslation ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="Enter English translation(s), separated by commas"
                        />
                        {errors.englishTranslation && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {errors.englishTranslation}
                          </p>
                        )}
                      </div>

                      {/* Part of Speech */}
                      <div>
                        <label htmlFor="partOfSpeech" className="block text-sm font-medium text-gray-700 mb-2">
                          Part of Speech <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="partOfSpeech"
                          name="partOfSpeech"
                          value={formData.partOfSpeech}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.partOfSpeech ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                          <option value="">Select part of speech</option>
                          {partsOfSpeech.map((pos) => (
                            <option key={pos} value={pos.toLowerCase()}>
                              {pos}
                            </option>
                          ))}
                        </select>
                        {errors.partOfSpeech && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {errors.partOfSpeech}
                          </p>
                        )}
                      </div>

                      {/* Example Sentence (Lisu) */}
                      <div>
                        <label htmlFor="exampleSentenceLisu" className="block text-sm font-medium text-gray-700 mb-2">
                          Example Sentence (Lisu)
                        </label>
                        <input
                          type="text"
                          id="exampleSentenceLisu"
                          name="exampleSentenceLisu"
                          value={formData.exampleSentenceLisu}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Provide an example sentence in Lisu"
                        />
                      </div>

                      {/* Example Sentence (English) */}
                      <div>
                        <label htmlFor="exampleSentenceEnglish" className="block text-sm font-medium text-gray-700 mb-2">
                          Example Sentence (English)
                        </label>
                        <input
                          type="text"
                          id="exampleSentenceEnglish"
                          name="exampleSentenceEnglish"
                          value={formData.exampleSentenceEnglish}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="English translation of the example sentence"
                        />
                      </div>

                      {/* Pronunciation Notes */}
                      <div>
                        <label htmlFor="pronunciationNotes" className="block text-sm font-medium text-gray-700 mb-2">
                          Pronunciation Notes (Optional)
                        </label>
                        <input
                          type="text"
                          id="pronunciationNotes"
                          name="pronunciationNotes"
                          value={formData.pronunciationNotes}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="e.g., Tone: Rising, IPA: /ˈexample/"
                        />
                      </div>

                      {/* Audio Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pronunciation Audio (Optional)
                        </label>
                        <div className="flex items-center space-x-4">
                          <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500:border-teal-400">
                            <CloudArrowUpIcon className="h-6 w-6 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {formData.audioFile ? formData.audioFile.name : 'Choose audio file'}
                            </span>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {errors.audioFile && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {errors.audioFile}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          Supported formats: MP3, WAV, OGG (Max 10MB)
                        </p>
                      </div>

                      {/* Source/Reference */}
                      <div>
                        <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                          Source/Reference (Optional)
                        </label>
                        <input
                          type="text"
                          id="source"
                          name="source"
                          value={formData.source}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Where did you learn this word?"
                        />
                      </div>
                    </>
                  )}

                  {/* Improve Definition Form */}
                  {activeTab === 'improve-definition' && (
                    <>
                      {/* Search for Word */}
                      <div>
                        <label htmlFor="searchWord" className="block text-sm font-medium text-gray-700 mb-2">
                          Search for Word to Improve <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            id="searchWord"
                            value={searchWord}
                            onChange={(e) => setSearchWord(e.target.value)}
                            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.searchWord ? 'border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="Enter the word you want to improve"
                          />
                          <button
                            type="button"
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                          >
                            Search
                          </button>
                        </div>
                        {errors.searchWord && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {errors.searchWord}
                          </p>
                        )}
                      </div>

                      {/* Current Definition (placeholder) */}
                      {searchWord && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            Current Definition:
                          </h3>
                          <p className="text-gray-600 text-sm italic">
                            Search for a word to see its current definition...
                          </p>
                        </div>
                      )}

                      {/* Improved Definition */}
                      <div>
                        <label htmlFor="englishTranslation" className="block text-sm font-medium text-gray-700 mb-2">
                          Improved Definition <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="englishTranslation"
                          name="englishTranslation"
                          value={formData.englishTranslation}
                          onChange={handleInputChange}
                          rows="4"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.englishTranslation ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="Enter your improved definition"
                        />
                        {errors.englishTranslation && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {errors.englishTranslation}
                          </p>
                        )}
                      </div>

                      {/* Reason for Improvement */}
                      <div>
                        <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for Improvement (Optional)
                        </label>
                        <textarea
                          id="source"
                          name="source"
                          value={formData.source}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Why do you think this is a better definition?"
                        />
                      </div>
                    </>
                  )}

                  {/* Add Audio Form */}
                  {activeTab === 'add-audio' && (
                    <>
                      {/* Search for Word */}
                      <div>
                        <label htmlFor="searchWord" className="block text-sm font-medium text-gray-700 mb-2">
                          Search for Word <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            id="searchWord"
                            value={searchWord}
                            onChange={(e) => setSearchWord(e.target.value)}
                            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.searchWord ? 'border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="Enter the word to add audio"
                          />
                          <button
                            type="button"
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                          >
                            Search
                          </button>
                        </div>
                        {errors.searchWord && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {errors.searchWord}
                          </p>
                        )}
                      </div>

                      {/* Word Info (placeholder) */}
                      {searchWord && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            Word: <span className="text-teal-600">{searchWord}</span>
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Search for a word to see its details...
                          </p>
                        </div>
                      )}

                      {/* Audio Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pronunciation Audio <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <MicrophoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <label className="cursor-pointer">
                            <span className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                              {formData.audioFile ? 'Change Audio File' : 'Upload Audio File'}
                            </span>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                          {formData.audioFile && (
                            <p className="mt-3 text-sm text-gray-600">
                              Selected: <span className="font-medium">{formData.audioFile.name}</span>
                            </p>
                          )}
                          {errors.audioFile && (
                            <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
                              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                              {errors.audioFile}
                            </p>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Supported formats: MP3, WAV, OGG (Max 10MB)
                        </p>
                      </div>

                      {/* Recording Tips */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">
                          Recording Tips:
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                          <li>Record in a quiet environment</li>
                          <li>Speak clearly and at a normal pace</li>
                          <li>Pronounce the word 2-3 times with a brief pause between</li>
                          <li>Keep recording under 5 seconds</li>
                        </ul>
                      </div>
                    </>
                  )}

                  {/* Moderator Application Form */}
                  {activeTab === 'moderator' && (
                    <>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-purple-900 mb-3">
                          Moderator Responsibilities:
                        </h3>
                        <ul className="text-sm text-purple-800 space-y-2 list-disc list-inside">
                          <li>Review and approve word submissions</li>
                          <li>Monitor discussion forums for guideline violations</li>
                          <li>Help new users understand contribution guidelines</li>
                          <li>Maintain quality standards across the dictionary</li>
                          <li>Commit to 3-5 hours per week</li>
                        </ul>
                      </div>

                      <div>
                        <label htmlFor="englishTranslation" className="block text-sm font-medium text-gray-700 mb-2">
                          Why do you want to be a moderator? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="englishTranslation"
                          name="englishTranslation"
                          value={formData.englishTranslation}
                          onChange={handleInputChange}
                          rows="4"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.englishTranslation ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="Tell us about your experience and motivation..."
                        />
                        {errors.englishTranslation && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {errors.englishTranslation}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                          Relevant Experience (Optional)
                        </label>
                        <textarea
                          id="source"
                          name="source"
                          value={formData.source}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Previous moderation experience, language expertise, etc."
                        />
                      </div>

                      <div>
                        <label htmlFor="exampleSentenceLisu" className="block text-sm font-medium text-gray-700 mb-2">
                          Time Availability
                        </label>
                        <input
                          type="text"
                          id="exampleSentenceLisu"
                          name="exampleSentenceLisu"
                          value={formData.exampleSentenceLisu}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="e.g., Weekdays 6-9pm, Weekends mornings"
                        />
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-500">
                        <span className="text-red-500">*</span> Required fields
                      </p>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-sm text-gray-600 hover:text-gray-900:text-gray-200 underline"
                        title="Reset form (R)"
                      >
                        Reset
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={submitted || isLoading}
                      className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-teal-300:ring-teal-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
                      {submitted ? 'Submitted!' : isLoading ? 'Submitting...' : 'Submit Contribution'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contribute;
