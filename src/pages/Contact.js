import React, { useState, useCallback } from 'react';
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import PageLayout from '../components/Layout/PageLayout';

/**
 * Contact Component
 * 
 * Contact form for users to reach out with inquiries,
 * bug reports, and suggestions.
 */

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
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
    'Technical Support',
    'Other'
  ];

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validateForm = useCallback(() => {
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
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
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
        message: 'Thank you for contacting us. We will respond within 24-48 hours.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
      });

      // Scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      setFormStatus({
        submitted: true,
        success: false,
        message: 'Error sending message. Please try again or email us directly at info@lisudictionary.org'
      });
    }
  }, [validateForm]); // formData is used inside, not a dependency

  return (
    <PageLayout
      title="Contact Us - Lisu Dictionary"
      description="Have questions or feedback? Get in touch with the Lisu Dictionary team. We're here to help."
      fullWidth={true}
      background=""
    >
      <div className="min-h-screen bg-white transition-colors duration-200">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden bg-gradient-to-br from-teal-600 to-teal-700">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-teal-50 max-w-2xl mx-auto">
              Have questions or feedback? We're here to help.
            </p>
          </div>
        </section>

        {/* Success/Error Message */}
        {formStatus.submitted && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className={`rounded-lg p-4 ${formStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start">
                {formStatus.success ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                ) : (
                  <ExclamationCircleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                )}
                <p className={`${formStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                  {formStatus.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

              {/* Left Column - Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    Send Us a Message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400`}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400`}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    {/* Subject Field */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900"
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
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="6"
                        className={`w-full px-4 py-3 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors resize-vertical bg-white text-gray-900 placeholder-gray-400`}
                        placeholder="Tell us how we can help you..."
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        Minimum 10 characters
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        className="w-full px-8 py-4 bg-teal-600 hover:bg-teal-700:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column - Contact Information */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Contact Information
                  </h2>

                  {/* Email Addresses */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                        General Inquiries
                      </h3>
                      <a
                        href="mailto:info@lisudictionary.org"
                        className="flex items-start text-teal-600 hover:text-teal-700:text-teal-300 transition-colors group"
                      >
                        <EnvelopeIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="group-hover:underline">info@lisudictionary.org</span>
                      </a>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                        Technical Support
                      </h3>
                      <a
                        href="mailto:support@lisudictionary.org"
                        className="flex items-start text-teal-600 hover:text-teal-700:text-teal-300 transition-colors group"
                      >
                        <EnvelopeIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="group-hover:underline">support@lisudictionary.org</span>
                      </a>
                    </div>

                    {/* Response Time */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                        Response Time
                      </h3>
                      <p className="text-sm text-gray-600">
                        We typically respond within 24-48 hours during business days (Monday-Friday).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Contact;
