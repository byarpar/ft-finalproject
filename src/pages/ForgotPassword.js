import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  BookOpenIcon,
  GlobeAltIcon,
  LightBulbIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { PageLayout } from '../components/LayoutComponents';

const AuthSidebar = () => (
  <div
    className="lg:w-[58%] relative overflow-hidden flex items-center justify-center p-8 lg:p-8 min-h-[400px] lg:min-h-screen"
    style={{
      backgroundImage: 'linear-gradient(to bottom right, rgba(15, 118, 110, 0.92), rgba(13, 148, 136, 0.88)), url(/images/hero/dev-community.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}
  >
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-0 right-0 w-full h-full bg-white transform origin-top-right rotate-12 translate-x-1/2"></div>
    </div>

    <div className="relative z-10 text-center max-w-lg">
      <div className="mb-8 flex justify-center">
        <div className="relative w-64 h-64">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-800/90 to-teal-600/80 rounded-full shadow-2xl flex items-center justify-center backdrop-blur-sm">
            <div className="relative w-48 h-48">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                  <BookOpenIcon className="w-11 h-11 text-white" />
                </div>
              </div>

              <div className="absolute top-2 left-1/2 -translate-x-1/2">
                <div className="w-14 h-14 bg-teal-400 rounded-full flex items-center justify-center shadow-lg">
                  <LightBulbIcon className="w-7 h-7 text-teal-900" />
                </div>
              </div>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <div className="w-14 h-14 bg-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  <UserGroupIcon className="w-8 h-8 text-orange-900" />
                </div>
              </div>

              <div className="absolute top-1/2 left-0 -translate-y-1/2">
                <div className="w-14 h-14 bg-orange-300 rounded-full flex items-center justify-center shadow-lg">
                  <GlobeAltIcon className="w-7 h-7 text-orange-900" />
                </div>
              </div>

              <div className="absolute top-1/2 right-0 -translate-y-1/2">
                <div className="w-14 h-14 bg-teal-300 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-teal-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                    <path d="M2 17L12 22L22 17V11L12 16L2 11V17Z" opacity="0.7" />
                  </svg>
                </div>
              </div>

              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 192 192">
                <circle cx="96" cy="96" r="70" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="96" cy="96" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </div>
          </div>

          <div className="absolute -top-4 -left-4 w-16 h-16 border-4 border-teal-400/30 rounded-full"></div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-4 border-orange-400/30 rounded-full"></div>
        </div>
      </div>

      <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight">
        RESET YOUR<br />PASSWORD
      </h1>

      <p className="text-lg lg:text-xl text-teal-50 font-light max-w-md mx-auto">
        Recover your account securely and get back to your learning journey quickly.
      </p>
    </div>
  </div>
);

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
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [recaptchaError, setRecaptchaError] = useState('');

  const emailInputRef = useRef(null);
  const recaptchaRef = useRef(null);

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
      setRecaptchaError('');
      setTouched(false);
      setRecaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
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

    if (!recaptchaToken) {
      setRecaptchaError('Please complete the reCAPTCHA verification');
      return;
    }

    setLoading(true);
    setError('');
    setRecaptchaError('');

    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/forgot-password`, {
        email: email.trim(),
        recaptchaToken
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
        background="bg-gray-50"
        fullWidth
      >
        <div className="min-h-screen flex flex-col lg:flex-row">
          <AuthSidebar />

          <div className="lg:w-[42%] bg-gray-50 flex items-center justify-center p-6 lg:p-8 min-h-screen lg:min-h-0 transition-colors duration-200">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Check Your Email</h2>
              </div>

              <div className="mb-6 border border-teal-200 rounded-lg p-4 bg-teal-50">
                <div className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm text-teal-900 font-medium mb-1">Email sent to:</p>
                    <p className="text-sm text-teal-700 font-semibold break-all">{email}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Please check your spam folder if you do not see the email within a few minutes.
              </p>

              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">Next steps:</p>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the reset link in the email</li>
                  <li>Create a new password</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block text-teal-600 hover:text-teal-700:text-teal-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded px-2 py-1"
                >
                  ← Back to Log In
                </Link>
                <button
                  onClick={() => setSubmitted(false)}
                  className="block w-full text-left text-gray-600 hover:text-gray-700:text-gray-300 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded px-2 py-1"
                >
                  Send to a different email
                </button>
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
      fullWidth={true}
      background="bg-gray-50"
    >
      <div className="min-h-screen flex flex-col lg:flex-row">
        <AuthSidebar />

        <div className="lg:w-[42%] bg-gray-50 flex items-center justify-center p-6 lg:p-8 min-h-screen lg:min-h-0 transition-colors duration-200">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
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
              className="space-y-4"
              noValidate
              aria-label="Password reset form"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                    className={`w-full px-3 py-2 border ${error
                      ? 'border-red-500'
                      : 'border-gray-300'
                      } text-sm rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400`}
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

              <div>
                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || ''}
                    onChange={(token) => {
                      setRecaptchaToken(token);
                      if (token) {
                        setRecaptchaError('');
                      }
                    }}
                    onExpired={() => {
                      setRecaptchaToken(null);
                      setRecaptchaError('reCAPTCHA expired. Please verify again.');
                    }}
                    theme="light"
                  />
                </div>
                {recaptchaError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
                    <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    {recaptchaError}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !email || !!error || !!recaptchaError}
                  aria-busy={loading}
                  className="w-full px-6 py-3.5 bg-teal-600 hover:bg-teal-700:bg-teal-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-600 disabled:hover:shadow-md shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2:ring-offset-gray-800"
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
              </div>

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
    </PageLayout>
  );
};

export default ForgotPassword;