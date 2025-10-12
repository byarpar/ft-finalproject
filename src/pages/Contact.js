import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
    newsletter: false
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const [errors, setErrors] = useState({});

  const subjectOptions = [
    'General Inquiry',
    'Bug Report',
    'Word Suggestion',
    'Partnership Opportunity',
    'Technical Support',
    'Translation Help',
    'Account Issue',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await contactAPI.sendMessage(formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFormStatus({
        submitted: true,
        success: true,
        message: 'Thank you for your message! We\'ll get back to you within 24-48 hours.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
        newsletter: false
      });

      // Scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      setFormStatus({
        submitted: true,
        success: false,
        message: 'There was an error sending your message. Please try again or contact us directly via email.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section
        className="relative py-16 lg:py-20 overflow-hidden bg-gradient-to-br from-teal-600 to-teal-700"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ChatBubbleLeftRightIcon className="h-16 w-16 text-white mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-teal-50 max-w-2xl mx-auto">
            We're here to help! Reach out with your questions, feedback, or suggestions.
          </p>
        </div>
      </section>

      {/* Success/Error Message */}
      {formStatus.submitted && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className={`rounded-lg p-4 ${formStatus.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            <div className="flex items-start">
              {formStatus.success ? (
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              ) : (
                <ExclamationCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              )}
              <p className={`${formStatus.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                {formStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Before You Contact Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Before You Send Your Message...
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your question might already be answered! Check out these helpful resources first:
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/faq"
                className="inline-flex items-center px-4 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors duration-200 text-sm font-medium"
              >
                Visit our FAQ
              </Link>
              <Link
                to="/discussions/guidelines"
                className="inline-flex items-center px-4 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors duration-200 text-sm font-medium"
              >
                Community Guidelines
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-4 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors duration-200 text-sm font-medium"
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left Column - Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Send Us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {subjectOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="6"
                      className={`w-full px-4 py-3 border ${errors.message ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-colors resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`}
                      placeholder="Tell us how we can help you..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Minimum 10 characters
                    </p>
                  </div>

                  {/* Newsletter Checkbox */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleChange}
                      className="h-4 w-4 text-teal-600 dark:text-teal-500 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:focus:ring-teal-400 mt-1 bg-white dark:bg-gray-700"
                    />
                    <label htmlFor="newsletter" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      I would like to receive newsletter updates about new features and Lisu language resources
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      className="w-full px-8 py-4 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                      Send Message
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    By sending a message, you agree to our{' '}
                    <Link to="/privacy" className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline">
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              </div>
            </div>

            {/* Right Column - Other Ways to Connect */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Other Ways to Connect
                </h2>

                {/* Email Addresses */}
                <div className="space-y-6 mb-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                      General Inquiries
                    </h3>
                    <a
                      href="mailto:info@lisudictionary.org"
                      className="flex items-start text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors group"
                    >
                      <EnvelopeIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="group-hover:underline">info@lisudictionary.org</span>
                    </a>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                      Technical Support
                    </h3>
                    <a
                      href="mailto:support@lisudictionary.org"
                      className="flex items-start text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors group"
                    >
                      <EnvelopeIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="group-hover:underline">support@lisudictionary.org</span>
                    </a>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                      Media & Partnerships
                    </h3>
                    <a
                      href="mailto:partnerships@lisudictionary.org"
                      className="flex items-start text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors group"
                    >
                      <EnvelopeIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="group-hover:underline">partnerships@lisudictionary.org</span>
                    </a>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                    Response Time
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We typically respond within 24-48 hours during business days (Monday-Friday).
                  </p>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                    Social Media
                  </h3>
                  <div className="flex space-x-4">
                    <a
                      href="https://facebook.com/lisudictionary"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-200 dark:bg-gray-700 hover:bg-teal-600 dark:hover:bg-teal-600 text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-white rounded-full flex items-center justify-center transition-colors duration-200"
                      aria-label="Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a
                      href="https://twitter.com/lisudictionary"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-200 dark:bg-gray-700 hover:bg-teal-600 dark:hover:bg-teal-600 text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-white rounded-full flex items-center justify-center transition-colors duration-200"
                      aria-label="Twitter"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </a>
                    <a
                      href="https://instagram.com/lisudictionary"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-200 dark:bg-gray-700 hover:bg-teal-600 dark:hover:bg-teal-600 text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-white rounded-full flex items-center justify-center transition-colors duration-200"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
