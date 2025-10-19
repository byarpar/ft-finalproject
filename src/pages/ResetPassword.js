/**
 * ResetPassword Component
 * 
 * Allows users to set a new password using a token from their email.
 * Features:
 * - Password strength indicator (Weak/Fair/Strong)
 * - Show/hide password toggles for both fields
 * - Real-time validation with touched state tracking
 * - Visual password match indicator with checkmark
 * - Keyboard shortcuts (Escape to clear form)
 * - Auto-focus on password input
 * - Enhanced accessibility with ARIA attributes
 * - Full keyboard navigation support
 * - Responsive design with dark mode support
 * 
 * @component
 * @requires {string} searchParams.token - Password reset token from email link
 * @redirects /login - After successful password reset (3 second delay)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import PageLayout from '../components/Layout/PageLayout';
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  // Refs for focus management
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid or expired link. Please request a new reset.');
    }
  }, [searchParams]);

  // Auto-focus password input on mount
  useEffect(() => {
    if (token && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [token]);

  /**
   * Get validation error for a field
   */
  const getFieldError = useCallback((name, value) => {
    if (name === 'password') {
      if (!value.trim()) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      return '';
    }
    if (name === 'confirmPassword') {
      if (!value.trim()) return 'Please confirm your password';
      if (value !== formData.password) return 'Passwords do not match';
      return '';
    }
    return '';
  }, [formData.password]);

  /**
   * Handle input change with real-time validation
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear global error when user starts typing
    if (error) setError('');

    // Real-time validation for touched fields
    if (touched[name]) {
      getFieldError(name, value);
      // Update error state if needed (optional, for now just clear global error)
    }

    // Re-validate confirm password when password changes
    if (name === 'password' && touched.confirmPassword && formData.confirmPassword) {
      // Trigger re-validation of confirm password
      getFieldError('confirmPassword', formData.confirmPassword);
      // (Error display is handled in JSX)
    }
  };

  /**
   * Handle input blur - mark field as touched
   */
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      // Clear form
      setFormData({
        password: '',
        confirmPassword: '',
      });
      setError('');
      setTouched({
        password: false,
        confirmPassword: false,
      });
      passwordInputRef.current?.focus();
    }
  };

  /**
   * Get password strength indicator
   * @param {string} password - The password to evaluate
   * @returns {Object} Strength info with level and text
   */
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: '', color: '' };
    if (password.length < 8) return { level: 1, text: 'Weak', color: 'text-red-500' };
    if (password.length < 12) return { level: 2, text: 'Fair', color: 'text-yellow-500' };
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 3, text: 'Strong', color: 'text-green-500' };
    }
    return { level: 2, text: 'Good', color: 'text-blue-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or expired link. Please request a new reset.');
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/reset-password`, {
        token,
        newPassword: formData.password
      });

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.error?.message || 'Invalid or expired link. Please request a new reset.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageLayout
        title="Password Reset Successful - Lisu Dictionary"
        description="Your password has been successfully reset. You can now log in with your new password."
        background="bg-gradient-to-br from-gray-50 to-green-50"
        fullWidth
      >
        <div className="min-h-screen flex flex-col">
          {/* Hero Section - Very Minimal */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircleIcon className="w-16 h-16 text-white" aria-hidden="true" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Password Reset Successful!
              </h1>
              <p className="text-green-50 text-lg">
                Your password has been successfully reset.
              </p>
            </div>
          </div>

          {/* Main Content - Success Message */}
          <div className="flex-1 flex items-center justify-center px-4 py-16 bg-gray-50">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-lg shadow-lg p-10 md:p-12 text-center space-y-6">
                <div className="mb-2">
                  <LockClosedIcon className="mx-auto h-20 w-20 text-green-600" aria-hidden="true" />
                </div>

                <div className="space-y-2">
                  <p className="text-gray-900 text-lg font-semibold">
                    All Set!
                  </p>
                  <p className="text-gray-600 text-base">
                    You can now log in with your new password.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    ✓ Password successfully updated<br />
                    ✓ You can now access your account
                  </p>
                </div>

                <Link
                  to="/login"
                  className="inline-block w-full px-6 py-3.5 bg-teal-600 hover:bg-teal-700:bg-teal-700 text-white font-semibold rounded-lg transition-all duration-200 text-base shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  Continue to Log In
                </Link>

                <p className="mt-4 text-sm text-gray-500" aria-live="polite">
                  Redirecting automatically in 3 seconds...
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Reset Password - Lisu Dictionary"
      description="Set a new password for your Lisu Dictionary account."
      background="bg-gradient-to-br from-gray-50 to-teal-50"
      fullWidth
    >
      <div className="min-h-screen flex flex-col">
        {/* Hero Section - Very Minimal */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <LockClosedIcon className="w-10 h-10 text-white" aria-hidden="true" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Set Your New Password
            </h1>
            <p className="text-teal-50 text-lg">
              Enter and confirm your new password below.
            </p>
          </div>
        </div>

        {/* Main Content Area - Centralized Card */}
        <div className="flex-1 flex items-center justify-center px-4 py-16 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-10 md:p-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                Set a New Password
              </h2>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3" role="alert" aria-live="assertive">
                  <div className="flex items-start gap-2">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-5" noValidate aria-label="Reset password form">
                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      aria-required="true"
                      aria-invalid={touched.password && getFieldError('password', formData.password) ? 'true' : 'false'}
                      aria-describedby="password-hint password-error"
                      className="w-full px-4 py-3.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white text-gray-900 placeholder-gray-400 text-base"
                      placeholder="Enter new password (min. 8 characters)"
                    />
                    {/* Show/Hide Password Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded p-1 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {/* Password Error */}
                  {touched.password && getFieldError('password', formData.password) && (
                    <p id="password-error" className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
                      <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      {getFieldError('password', formData.password)}
                    </p>
                  )}
                  {/* Password strength indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${passwordStrength.level === 1 ? 'w-1/3 bg-red-500' :
                              passwordStrength.level === 2 ? 'w-2/3 bg-yellow-500' :
                                passwordStrength.level === 3 ? 'w-full bg-green-500' : 'w-0'
                              }`}
                            aria-hidden="true"
                          />
                        </div>
                        <span className={`text-xs font-medium ${passwordStrength.color}`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <p id="password-hint" className="text-xs text-gray-500 mt-1">
                        Use 12+ characters with uppercase, numbers for best security
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={confirmPasswordInputRef}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      aria-required="true"
                      aria-invalid={touched.confirmPassword && getFieldError('confirmPassword', formData.confirmPassword) ? 'true' : 'false'}
                      aria-describedby="confirmPassword-error"
                      className="w-full px-4 py-3.5 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white text-gray-900 placeholder-gray-400 text-base"
                      placeholder="Re-enter new password"
                    />
                    {/* Checkmark when passwords match */}
                    {passwordsMatch && (
                      <CheckCircleIcon
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500"
                        aria-hidden="true"
                      />
                    )}
                    {/* Show/Hide Password Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded p-1 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {/* Confirm Password Error */}
                  {touched.confirmPassword && getFieldError('confirmPassword', formData.confirmPassword) && (
                    <p id="confirmPassword-error" className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
                      <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      {getFieldError('confirmPassword', formData.confirmPassword)}
                    </p>
                  )}
                  {/* Success - Passwords Match */}
                  {passwordsMatch && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Keyboard Hint */}
                <div className="text-center text-xs text-gray-500 mt-4">
                  Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd> to reset or <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Esc</kbd> to clear
                </div>

                <button
                  type="submit"
                  disabled={loading || !token || !passwordsMatch}
                  aria-busy={loading}
                  className="w-full px-6 py-3.5 bg-teal-600 hover:bg-teal-700:bg-teal-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-600 text-base mt-6 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2:ring-offset-gray-800"
                >
                  {loading ? (
                    <span className="flex items-center justify-center" aria-live="polite">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              {/* Back to Login Link */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Remember your password?
                </p>
                <Link
                  to="/login"
                  className="text-teal-600 hover:text-teal-700:text-teal-300 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-2 py-1"
                >
                  Sign in here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResetPassword;
