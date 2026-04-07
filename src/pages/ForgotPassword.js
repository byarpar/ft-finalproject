import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { EnvelopeIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { PageLayout } from '../components/LayoutComponents';

/**
 * ForgotPassword Page - Password reset request
 * 
 * Enhanced with modern React patterns:
 * - Auto-focus email input on mount
 * - Real-time email validation
 * - Keyboard shortcuts (Enter to submit, Escape to clear)
 * - Better error messaging
 * - Success state with helpful instructions
 * - Rate limiting feedback
 * - Enhanced accessibility
 * 
 * @component
 * @requires {string} location.state.email - Optional pre-filled email
 * @redirects none - Shows success message on same page
 */
const ForgotPassword = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const emailInputRef = useRef(null);

  // Focus email input on mount (unless pre-filled)
  useEffect(() => {
    if (!email) {
      emailInputRef.current?.focus();
    }
  }, [email]);

  /**
   * Validate email format
   */
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  /**
   * Get validation error message
   */
  const getEmailError = useCallback((email) => {
    if (!email.trim()) {
      return 'Email address is required';
    }
    if (!validateEmail(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  }, [validateEmail]);

  /**
   * Handle email input change
   */
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // Real-time validation after field is touched
    if (touched) {
      const errorMsg = getEmailError(newEmail);
      setError(errorMsg);
    }
  };

  /**
   * Handle blur to mark field as touched
   */
  const handleBlur = () => {
    setTouched(true);
    const errorMsg = getEmailError(email);
    setError(errorMsg);
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setEmail('');
      setError('');
      setTouched(false);
      emailInputRef.current?.focus();
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    const errorMsg = getEmailError(email);
    if (errorMsg) {
      setError(errorMsg);
      emailInputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/forgot-password`, {
        email: email.trim()
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Forgot password error:', err);

      // Handle specific error cases
      if (err.response?.status === 429) {
        setError('Too many requests. Please try again in a few minutes.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        // Generic error - don't reveal if account exists
        setError('If an account with that email exists, a reset link has been sent.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PageLayout
        title="Check Your Email - Lisu Dictionary"
        description="Password reset link has been sent to your email address."
        background="bg-gradient-to-br from-gray-50 to-teal-50"
        fullWidth
      >
        <div className="min-h-screen flex flex-col">
          {/* Hero Section - Very Minimal */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircleIcon className="w-16 h-16 text-white" aria-hidden="true" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Check Your Email
              </h1>
              <p className="text-teal-50 text-lg max-w-2xl mx-auto">
                If an account with that email exists, a password reset link has been sent to your inbox.
              </p>
            </div>
          </div>

          {/* Main Content - Success Message */}
          <div className="flex-1 flex items-center justify-center px-4 py-16 bg-gray-50">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-lg shadow-lg p-10 md:p-12 text-center space-y-6">
                <div className="mb-2">
                  <EnvelopeIcon className="mx-auto h-20 w-20 text-teal-600" aria-hidden="true" />
                </div>

                <div className="space-y-3">
                  <p className="text-gray-900 text-base font-medium">
                    Email sent to:
                  </p>
                  <p className="text-teal-600 text-base font-semibold break-all">
                    {email}
                  </p>
                </div>

                <p className="text-gray-600 text-sm">
                  Please check your spam folder if you don't see the email within a few minutes.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Next steps:
                  </p>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Check your email inbox</li>
                    <li>Click the reset link in the email</li>
                    <li>Create a new password</li>
                  </ol>
                </div>

                <div className="mt-8 pt-4 space-y-2">
                  <Link
                    to="/login"
                    className="block text-teal-600 hover:text-teal-700:text-teal-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded px-2 py-1"
                  >
                    ← Back to Log In
                  </Link>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="block w-full text-gray-600 hover:text-gray-700:text-gray-300 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded px-2 py-1"
                  >
                    Send to a different email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Forgot Password - Lisu Dictionary"
      description="Reset your Lisu Dictionary password. Enter your email address to receive a password reset link."
      fullWidth={true}
      background=""
    >
      <div className="min-h-screen flex flex-col">
        {/* Hero Section - Very Minimal */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Forgot Password?
            </h1>
            <p className="text-teal-50 text-lg">
              Enter your email to receive a reset link.
            </p>
          </div>
        </div>

        {/* Main Content Area - Centralized Card */}
        <div className="flex-1 flex items-center justify-center px-4 py-16 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-10 md:p-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                Reset Your Password
              </h2>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3" role="alert" aria-live="assertive">
                  <div className="flex items-center gap-2">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" aria-hidden="true" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                className="space-y-6"
                noValidate
                aria-label="Password reset form"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={emailInputRef}
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={handleBlur}
                      required
                      aria-required="true"
                      aria-invalid={error ? 'true' : 'false'}
                      aria-describedby={error ? 'email-error' : 'email-hint'}
                      className={`w-full px-4 py-3.5 border ${error
                        ? 'border-red-500'
                        : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400 text-base`}
                      placeholder="your.email@example.com"
                    />
                    {error && (
                      <ExclamationCircleIcon
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  {error ? (
                    <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
                      <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      {error}
                    </p>
                  ) : (
                    <p id="email-hint" className="mt-2 text-xs text-gray-500">
                      We'll send a password reset link to this email
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !!error}
                  aria-busy={loading}
                  className="w-full px-6 py-3.5 bg-teal-600 hover:bg-teal-700:bg-teal-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-600 disabled:hover:shadow-md text-base shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2:ring-offset-gray-800"
                >
                  {loading ? (
                    <span className="flex items-center justify-center" aria-live="polite">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                {/* Keyboard hint */}
                <p className="text-xs text-gray-500 text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Enter</kbd> to send or <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Esc</kbd> to clear
                </p>
              </form>

              {/* Back to Login Link */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-3">
                <Link
                  to="/login"
                  className="block text-sm text-teal-600 hover:text-teal-700:text-teal-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded px-2 py-1"
                >
                  ← Back to Log In
                </Link>
                <p className="text-xs text-gray-500">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="text-teal-600 hover:text-teal-700:text-teal-300"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ForgotPassword;