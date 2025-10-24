import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpenIcon,
  GlobeAltIcon,
  LightBulbIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import PageLayout from '../components/Layout/PageLayout';

// Shared utilities
import { validateEmail, validateLoginPassword } from '../utils/validation';
import { usePasswordToggle, useFieldTouch, useFormValidation, useFormKeyboard, useClearForm } from '../hooks/useAuthForm';
import {
  createHandleChange,
  createHandleBlur,
  focusFirstError,
  preloadProfileImage,
  checkAccountDeletionStatus,
  handleGoogleAuth
} from '../utils/formHandlers';

// Shared components
import PasswordToggleButton from '../components/Auth/PasswordToggleButton';
import FieldError from '../components/Auth/FieldError';
import GoogleOAuthButton from '../components/Auth/GoogleOAuthButton';

/**
 * Login Page - User authentication with email/password or Google OAuth
 * 
 * Enhanced with modern React patterns:
 * - Show/hide password toggle for better UX
 * - Keyboard navigation (Enter to submit, Escape to clear)
 * - Focus management and ARIA attributes
 * - Real-time field validation
 * - Graceful error handling with user-friendly messages
 * - Responsive design with split-screen layout
 * 
 * @component
 * @requires {Function} login - From AuthContext to authenticate users
 * @requires {Object} location.state.from - Redirect path after successful login
 * @requires {string} location.state.message - Optional message to display (e.g., "Please log in to continue")
 */
const Login = () => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Custom hooks for form management
  const { showPassword, togglePasswordVisibility } = usePasswordToggle();
  const { touched, markTouched, markAllTouched, resetTouched } = useFieldTouch({
    email: false,
    password: false
  });
  const { errors, setErrors, clearAllErrors } = useFormValidation();

  // Refs for focus management
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access - default to search for dictionary app
  const from = location.state?.from?.pathname || '/search';
  const redirectMessage = location.state?.message;

  // Focus email input on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Handle OAuth error messages from state (redirect from AuthCallback)
  useEffect(() => {
    if (location.state?.error) {
      setErrors({ general: location.state.error, accountDeleted: location.state.error.includes('deleted') });
      // Clear the state to prevent error from persisting on page refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, setErrors]);

  // Handle OAuth error messages from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const message = params.get('message');

    if (error) {
      let errorMessage = message || 'Authentication failed';

      // Map error codes to user-friendly messages
      switch (error) {
        case 'account_deleted':
          errorMessage = 'This account has been deleted. Please contact support if you believe this is an error.';
          setErrors({ general: errorMessage, accountDeleted: true });
          break;
        case 'account_inactive':
          errorMessage = 'Your account has been deactivated. Please contact support for assistance.';
          setErrors({ general: errorMessage });
          break;
        case 'authentication_failed':
          errorMessage = 'Authentication failed. Please try again.';
          setErrors({ general: errorMessage });
          break;
        case 'oauth_failed':
          errorMessage = 'Google login failed. Please try again or use email/password.';
          setErrors({ general: errorMessage });
          break;
        default:
          setErrors({ general: errorMessage });
      }

      // Clean up URL parameters
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate, setErrors]);

  /**
   * Field validator - uses shared validation utilities
   */
  const validateField = useCallback((name, value) => {
    if (name === 'email') return validateEmail(value);
    if (name === 'password') return validateLoginPassword(value);
    return '';
  }, []);

  /**
   * Event handlers using shared utilities
   */
  const handleChange = createHandleChange(setFormData, validateField, touched, setErrors);
  const handleBlur = createHandleBlur(validateField, markTouched, setErrors);

  /**
   * Validate entire form before submission
   */
  const validateForm = () => {
    const newErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password)
    };

    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    markAllTouched();

    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Use shared focus handler
      focusFirstError(
        errors,
        { email: emailInputRef, password: passwordInputRef },
        ['email', 'password']
      );
      return;
    }

    setLoading(true);
    clearAllErrors();

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Show success state briefly before navigation
        setLoginSuccess(true);

        // Use shared image preloader
        await preloadProfileImage(result.user?.profile_photo_url);

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 200);
      } else {
        // Handle backend errors
        const errorData = result.error?.data || {};
        const backendMessage = result.error?.message || result.error?.details || 'Login failed. Please try again.';

        // Set appropriate error states
        const newErrors = {
          general: backendMessage,
          accountNotFound: errorData.accountNotFound || false,
          accountDeleted: errorData.accountDeleted || false,
          canRestore: errorData.canRestore || false,
          deletedEmail: errorData.email || formData.email,
          incorrectPassword: errorData.incorrectPassword || false
        };

        // If account is deleted and can be restored, show that info immediately
        if (errorData.accountDeleted && errorData.canRestore) {
          newErrors.general = backendMessage; // Already has the days remaining message
          newErrors.canRestore = true;
          newErrors.deletedEmail = errorData.email || formData.email;
        }

        // If incorrect password, highlight the password field
        if (errorData.incorrectPassword) {
          newErrors.password = 'Incorrect password';
          passwordInputRef.current?.focus();
        }

        // If account not found (and not deleted), highlight the email field
        if (errorData.accountNotFound && !errorData.accountDeleted) {
          newErrors.email = 'No account found with this email';
          emailInputRef.current?.focus();

          // Still check if this is a deleted account (as a fallback)
          checkAccountDeletionStatus(formData.email, setErrors);
        }

        setErrors(newErrors);

        // Email not verified - show message (don't auto-redirect)
        if (errorData.requiresVerification) {
          // Store email for verification page link
          newErrors.unverifiedEmail = errorData.email || formData.email;
          setErrors(newErrors);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error.message || 'Network error. Unable to connect to server. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle remember me checkbox
   */
  const handleRememberMeChange = (e) => {
    setFormData(prev => ({ ...prev, rememberMe: e.target.checked }));
  };

  /**
   * Clear form using shared hook
   */
  const clearForm = useClearForm(
    { email: '', password: '', rememberMe: false },
    setFormData,
    clearAllErrors,
    resetTouched,
    emailInputRef
  );

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useFormKeyboard(clearForm, null);

  return (
    <PageLayout
      title="Log In - Lisu Dictionary"
      description="Log in to your Lisu Dictionary account to access personalized features, contribute to the community, and continue your language learning journey."
      fullWidth
      background="bg-gray-50"
    >
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Visual Storytelling / Branding Block (55-60%) */}
        <div
          className="lg:w-[58%] relative overflow-hidden flex items-center justify-center p-8 lg:p-8 min-h-[400px] lg:min-h-screen"
          style={{
            backgroundImage: 'linear-gradient(to bottom right, rgba(15, 118, 110, 0.92), rgba(13, 148, 136, 0.88)), url(/images/hero/lisu-people.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Diagonal accent overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-full h-full bg-white transform origin-top-right rotate-12 translate-x-1/2"></div>
          </div>

          {/* Central Content */}
          <div className="relative z-10 text-center max-w-lg">
            {/* Custom Illustration - Discovery & Learning */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-64 h-64">
                {/* Large decorative circle with learning/discovery motif */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-800/90 to-teal-600/80 rounded-full shadow-2xl flex items-center justify-center backdrop-blur-sm">
                  {/* Inner content - Book, Globe, Lightbulb arrangement */}
                  <div className="relative w-48 h-48">
                    {/* Center - Open Book (Main symbol) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                        <BookOpenIcon className="w-11 h-11 text-white" />
                      </div>
                    </div>

                    {/* Top - Lightbulb (Discovery/Knowledge) */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2">
                      <div className="w-14 h-14 bg-teal-400 rounded-full flex items-center justify-center shadow-lg">
                        <LightBulbIcon className="w-7 h-7 text-teal-900" />
                      </div>
                    </div>

                    {/* Bottom - Community */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                      <div className="w-14 h-14 bg-orange-400 rounded-full flex items-center justify-center shadow-lg">
                        <UserGroupIcon className="w-8 h-8 text-orange-900" />
                      </div>
                    </div>

                    {/* Left - Globe (Language/Culture) */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2">
                      <div className="w-14 h-14 bg-orange-300 rounded-full flex items-center justify-center shadow-lg">
                        <GlobeAltIcon className="w-7 h-7 text-orange-900" />
                      </div>
                    </div>

                    {/* Right - Another knowledge symbol */}
                    <div className="absolute top-1/2 right-0 -translate-y-1/2">
                      <div className="w-14 h-14 bg-teal-300 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-teal-900" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                          <path d="M2 17L12 22L22 17V11L12 16L2 11V17Z" opacity="0.7" />
                        </svg>
                      </div>
                    </div>

                    {/* Decorative elements - connecting paths */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 192 192">
                      <circle cx="96" cy="96" r="70" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
                      <circle cx="96" cy="96" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
                    </svg>

                    {/* Floating particles/stars */}
                    <div className="absolute top-4 right-8">
                      <div className="w-2 h-2 bg-teal-300 rounded-full animate-pulse"></div>
                    </div>
                    <div className="absolute bottom-8 left-6">
                      <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    <div className="absolute top-12 left-4">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                    <div className="absolute bottom-12 right-6">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                    </div>
                  </div>
                </div>

                {/* Outer decorative elements */}
                <div className="absolute -top-4 -left-4 w-16 h-16 border-4 border-teal-400/30 rounded-full"></div>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 border-4 border-orange-400/30 rounded-full"></div>
              </div>
            </div>

            {/* Bold Message */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              CONTINUE YOUR<br />DISCOVERY
            </h1>

            {/* Supporting Tagline */}
            <p className="text-lg lg:text-xl text-teal-50 font-light max-w-md mx-auto">
              Welcome back to your journey of exploring and preserving the Lisu language
            </p>
          </div>
        </div>

        {/* Right Side - Login Form (40-45%) */}
        <div className="lg:w-[42%] bg-gray-50 flex items-center justify-center p-6 lg:p-8 min-h-screen lg:min-h-0 transition-colors duration-200">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Log In to Your Account
              </h2>
            </div>

            {/* Info Message - Login Required */}
            {redirectMessage && (
              <div
                className="mb-6 border border-teal-300 rounded-lg p-4 bg-teal-50"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start">
                  <CheckCircleIcon
                    className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-teal-800 font-medium">
                    {redirectMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className={`mb-6 border rounded-lg p-4 ${errors.accountDeleted || errors.accountNotFound
                ? errors.canRestore ? 'bg-yellow-50 border-yellow-300' : 'bg-red-100 border-red-300'
                : errors.incorrectPassword
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-red-50 border-red-200'
                }`}>
                <div className="flex items-start">
                  {errors.canRestore ? (
                    <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  ) : (errors.accountDeleted || errors.accountNotFound) ? (
                    <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : errors.incorrectPassword && (
                    <svg className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${errors.canRestore
                      ? 'text-yellow-800 font-semibold'
                      : errors.accountDeleted || errors.accountNotFound
                        ? 'text-red-700 font-semibold'
                        : errors.incorrectPassword
                          ? 'text-orange-700 font-semibold'
                          : 'text-red-600'
                      }`}>
                      {errors.general}
                    </p>

                    {/* Show restore button if account can be restored */}
                    {errors.canRestore && errors.deletedEmail && (
                      <div className="mt-3 pt-3 border-t border-yellow-300">
                        <button
                          type="button"
                          onClick={() => navigate('/restore-account', { state: { email: errors.deletedEmail } })}
                          className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors duration-200"
                        >
                          Restore My Account
                        </button>
                      </div>
                    )}

                    {/* Show verification help if email not verified */}
                    {(errors.general.toLowerCase().includes('verify') || errors.unverifiedEmail) && !errors.accountNotFound && (
                      <div className="mt-3 pt-3 border-t border-red-300">
                        <p className="text-sm text-red-800 font-medium mb-2">
                          📧 Your email is not verified yet
                        </p>
                        <p className="text-xs text-red-700 mb-3">
                          Please check your inbox for the verification code we sent to <strong>{errors.unverifiedEmail || formData.email}</strong>
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate('/verify-email', { state: { email: errors.unverifiedEmail || formData.email } })}
                          className="w-full px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200"
                        >
                          Verify Email Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              className="space-y-4"
              noValidate
              aria-label="Login form"
            >
              {/* Email Field */}
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
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    aria-required="true"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} text-sm rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <ExclamationCircleIcon
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <FieldError error={errors.email} />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                  <span className="text-red-500 ml-1" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    aria-required="true"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className={`w-full px-4 py-2 pr-12 border ${errors.password ? 'border-red-500' : 'border-gray-300'} text-sm rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400`}
                    placeholder="Enter your password"
                  />
                  {/* Show/Hide Password Toggle */}
                  <PasswordToggleButton
                    showPassword={showPassword}
                    onToggle={togglePasswordVisibility}
                  />
                </div>
                <FieldError error={errors.password} />
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleRememberMeChange}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:ring-offset-2 bg-white transition-colors"
                    aria-label="Keep me logged in for 30 days"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-teal-600 hover:text-teal-700:text-teal-300 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 rounded px-1"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Log In Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || loginSuccess}
                  aria-busy={loading}
                  className={`w-full px-6 py-3.5 font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2:ring-offset-gray-900 disabled:hover:shadow-md ${loginSuccess
                    ? 'bg-green-600 hover:bg-green-600'
                    : 'bg-teal-600 hover:bg-teal-700:bg-teal-700 disabled:hover:bg-teal-600'
                    }`}
                >
                  {loginSuccess ? (
                    <span className="flex items-center justify-center" aria-live="polite">
                      <CheckCircleIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                      Success! Redirecting...
                    </span>
                  ) : loading ? (
                    <span className="flex items-center justify-center" aria-live="polite">
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Logging In...
                    </span>
                  ) : (
                    'Log In'
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative pt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3 pt-2">
                <GoogleOAuthButton
                  onClick={handleGoogleAuth}
                  text="Continue with Google"
                  disabled={loading}
                />
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-teal-600 hover:text-teal-700:text-teal-300 font-semibold">
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;
