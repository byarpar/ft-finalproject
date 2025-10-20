import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  UserIcon,
  AcademicCapIcon,
  UsersIcon,
  BriefcaseIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import PageLayout from '../components/Layout/PageLayout';

/**
 * Register Page - User registration with email/password or Google OAuth
 * 
 * Enhanced with modern React patterns:
 * - Real-time field validation with touched state
 * - Password strength meter with visual feedback
 * - Show/hide password toggles for both password fields
 * - Focus management for better UX
 * - Keyboard shortcuts (Escape to clear)
 * - Password confirmation matching indicator
 * - Enhanced accessibility with ARIA attributes
 * 
 * @component
 * @requires {Function} register - From AuthContext to create new user accounts
 * @requires {Object} location.state.email - Optional pre-filled email (from login page)
 * @fires {Toast} Success/Error notifications using react-hot-toast
 */
const Register = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    full_name: '',
    email: location.state?.email || '', // Pre-fill email if coming from login
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    agreeTerms: false
  });

  // Refs for focus management
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Focus email input on mount (unless pre-filled)
  useEffect(() => {
    if (!formData.email) {
      emailInputRef.current?.focus();
    }
  }, [formData.email]);

  /**
   * Validate individual field
   */
  const validateField = useCallback((name, value, allFormData = formData) => {
    switch (name) {
      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';

      case 'password':
        if (!value) {
          return 'Password is required';
        } else if (value.length < 8) {
          return 'Password must be at least 8 characters';
        }
        return '';

      case 'confirmPassword':
        if (!value) {
          return 'Please confirm your password';
        } else if (value !== allFormData.password) {
          return 'Passwords do not match';
        }
        return '';

      case 'agreeTerms':
        if (!value) {
          return 'You must agree to the Privacy Policy and Terms of Service';
        }
        return '';

      default:
        return '';
    }
  }, [formData]);

  /**
   * Handle input changes with real-time validation
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };

      // If password changes, revalidate confirm password if it's been touched
      if (name === 'password' && touched.confirmPassword && prev.confirmPassword) {
        const confirmError = validateField('confirmPassword', prev.confirmPassword, updated);
        setErrors(prevErrors => ({
          ...prevErrors,
          confirmPassword: confirmError
        }));
      }

      return updated;
    });

    // Clear error when user starts typing (only if field was touched)
    if (touched[name]) {
      const fieldError = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError,
        general: '' // Clear general error
      }));
    }
  };

  /**
   * Mark field as touched on blur
   */
  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setTouched(prev => ({ ...prev, [name]: true }));

    const fieldError = validateField(name, fieldValue);
    if (fieldError) {
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  /**
   * Validate entire form before submission
   */
  const validateForm = () => {
    const newErrors = {};

    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
    const agreeTermsError = validateField('agreeTerms', formData.agreeTerms);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    if (agreeTermsError) newErrors.agreeTerms = agreeTermsError;

    setErrors(newErrors);
    setTouched({ email: true, password: true, confirmPassword: true, agreeTerms: true });

    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Focus first error field
      if (errors.email) {
        emailInputRef.current?.focus();
      } else if (errors.password) {
        passwordInputRef.current?.focus();
      } else if (errors.confirmPassword) {
        confirmPasswordInputRef.current?.focus();
      }
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await register(formData.email, formData.password, formData.full_name);

      if (result.success) {
        toast.success('Account created successfully! Please check your email for verification code.', {
          position: 'top-center',
          duration: 4000,
        });
        // Redirect to verify-email page with email in state
        navigate('/verify-email', { state: { email: formData.email } });
      } else {
        const errorMessage = (result.error && (result.error.details || result.error.message)) || result.error || 'Registration failed. Please try again.';

        // Check if error is "user already exists"
        if (errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('account with this email')) {
          toast.error('An account with this email already exists', {
            position: 'top-center',
            duration: 6000,
          });
          setErrors({
            general: errorMessage,
            accountExists: true // Flag for conditional rendering
          });
        } else {
          toast.error(errorMessage, {
            position: 'top-center',
            duration: 6000,
          });
          setErrors({ general: errorMessage });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Network error. Unable to connect to server. Please check your connection and try again.';
      toast.error(errorMessage, {
        position: 'top-center',
        duration: 6000,
      });
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  /**
   * Toggle confirm password visibility
   */
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  /**
   * Handle Google OAuth registration
   */
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth route
    window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/auth/google`;
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e) => {
    // Escape key clears form
    if (e.key === 'Escape') {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      });
      setErrors({});
      setTouched({ email: false, password: false, confirmPassword: false, agreeTerms: false });
      emailInputRef.current?.focus();
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

  return (
    <PageLayout
      title="Create Account - Lisu Dictionary"
      description="Join the Lisu Dictionary community. Create your account to contribute, learn, and connect with others preserving the Lisu language."
      fullWidth
      background="bg-gray-50"
    >
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Visual Storytelling / Branding Block (55-60%) */}
        <div
          className="lg:w-[58%] relative overflow-hidden flex items-center justify-center p-8 lg:p-12 min-h-[400px] lg:min-h-screen"
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
            {/* Custom Illustration - Community Circle */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-64 h-64">
                {/* Large decorative circle with cultural motif */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-800/90 to-teal-600/80 rounded-full shadow-2xl flex items-center justify-center backdrop-blur-sm">
                  {/* Inner content - stylized people/community */}
                  <div className="relative w-48 h-48">
                    {/* Center flower/plant motif */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <SparklesIcon className="w-16 h-16 text-orange-400" />
                    </div>

                    {/* People icons around the center in circular formation */}
                    {/* Top - Professional */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2">
                      <div className="w-12 h-12 bg-teal-400 rounded-full flex items-center justify-center shadow-lg">
                        <BriefcaseIcon className="w-6 h-6 text-teal-900" />
                      </div>
                    </div>

                    {/* Bottom - Student/Graduate */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                      <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center shadow-lg">
                        <AcademicCapIcon className="w-6 h-6 text-orange-900" />
                      </div>
                    </div>

                    {/* Left - Individual */}
                    <div className="absolute top-1/2 left-2 -translate-y-1/2">
                      <div className="w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center shadow-lg">
                        <UserIcon className="w-6 h-6 text-orange-900" />
                      </div>
                    </div>

                    {/* Right - Community/Friends */}
                    <div className="absolute top-1/2 right-2 -translate-y-1/2">
                      <div className="w-12 h-12 bg-teal-300 rounded-full flex items-center justify-center shadow-lg">
                        <UsersIcon className="w-7 h-7 text-teal-900" />
                      </div>
                    </div>

                    {/* Decorative leaves/elements */}
                    <div className="absolute top-8 left-0">
                      <svg className="w-8 h-8 text-teal-400 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                      </svg>
                    </div>

                    <div className="absolute bottom-8 right-0">
                      <svg className="w-8 h-8 text-orange-400 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bold Message */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              JOIN OUR<br />JOURNEY
            </h1>

            {/* Supporting Tagline */}
            <p className="text-lg lg:text-xl text-teal-50 font-light max-w-md mx-auto">
              Connect with a vibrant community preserving and celebrating the Lisu language
            </p>
          </div>
        </div>

        {/* Right Side - Registration Form (40-45%) */}
        <div className="lg:w-[42%] bg-gray-50 flex items-center justify-center p-6 lg:p-12 min-h-screen lg:min-h-0 transition-colors duration-200">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Create Your Account
              </h2>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.general}</p>

                {/* Show helpful actions if account already exists */}
                {errors.accountExists && formData.email && (
                  <div className="mt-4 pt-4 border-t border-red-300">
                    <p className="text-sm text-red-800 font-medium mb-3">
                      Already have an account? Choose an option:
                    </p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => navigate('/login', { state: { email: formData.email } })}
                        className="block w-full text-left px-3 py-2 text-sm bg-white border border-red-300 rounded-lg hover:bg-red-50:bg-gray-700 text-teal-700 font-semibold transition-colors"
                      >
                        → Try to Log In
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/verify-email', { state: { email: formData.email } })}
                        className="block w-full text-left px-3 py-2 text-sm bg-white border border-red-300 rounded-lg hover:bg-red-50:bg-gray-700 text-teal-700 font-semibold transition-colors"
                      >
                        → Verify Email (if unverified)
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password', { state: { email: formData.email } })}
                        className="block w-full text-left px-3 py-2 text-sm bg-white border border-red-300 rounded-lg hover:bg-red-50:bg-gray-700 text-teal-700 font-semibold transition-colors"
                      >
                        → Reset Password (if forgotten)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Registration Form */}
            <form
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              className="space-y-5"
              noValidate
              aria-label="Registration form"
            >
              {/* Full Name Field (Optional) */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  autoComplete="name"
                  aria-label="Full name (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
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
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <ExclamationCircleIcon
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500"
                      aria-hidden="true"
                    />
                  )}
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
                    <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                  <span className="text-red-500 ml-1" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : 'password-hint'}
                    className={`w-full px-4 py-3 pr-12 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400`}
                    placeholder="Minimum 8 characters"
                  />
                  {/* Show/Hide Password Toggle */}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded p-1 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {/* Password strength indicator */}
                {formData.password && !errors.password && (
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
                {errors.password && (
                  <p id="password-error" className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
                    <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                  <span className="text-red-500 ml-1" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={confirmPasswordInputRef}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                    className={`w-full px-4 py-3 pr-12 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400`}
                    placeholder="Re-enter your password"
                  />
                  {/* Show/Hide Password Toggle */}
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded p-1 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                  {/* Match indicator - shown when passwords match */}
                  {formData.confirmPassword && formData.confirmPassword === formData.password && !errors.confirmPassword && (
                    <CheckCircleIcon
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500"
                      aria-hidden="true"
                    />
                  )}
                  {/* Error indicator */}
                  {errors.confirmPassword && (
                    <ExclamationCircleIcon
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500"
                      aria-hidden="true"
                    />
                  )}
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
                    <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    {errors.confirmPassword}
                  </p>
                )}
                {formData.confirmPassword && formData.confirmPassword === formData.password && !errors.confirmPassword && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Terms Consent Checkbox */}
              <div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    aria-required="true"
                    aria-invalid={errors.agreeTerms ? 'true' : 'false'}
                    aria-describedby={errors.agreeTerms ? 'terms-error' : undefined}
                    className={`h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:ring-offset-2:ring-offset-gray-900 mt-1 bg-white transition-colors ${errors.agreeTerms ? 'border-red-500' : ''}`}
                  />
                  <label htmlFor="agreeTerms" className="ml-3 text-sm text-gray-700 cursor-pointer select-none">
                    I agree to the{' '}
                    <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700:text-teal-300 underline focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">
                      Privacy Policy
                    </Link>
                    {' '}and{' '}
                    <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700:text-teal-300 underline focus:outline-none focus:ring-2 focus:ring-teal-500 rounded">
                      Terms of Service
                    </Link>
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                </div>
                {errors.agreeTerms && (
                  <p id="terms-error" className="mt-2 text-sm text-red-600 ml-7 flex items-center gap-1" role="alert">
                    <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    {errors.agreeTerms}
                  </p>
                )}
              </div>

              {/* Create Account Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="w-full px-6 py-3.5 bg-teal-600 hover:bg-teal-700:bg-teal-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2:ring-offset-gray-900 disabled:hover:bg-teal-600 disabled:hover:shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center" aria-live="polite">
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
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
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50:bg-gray-700 transition-all duration-200 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Continue with Google account"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-teal-600 hover:text-teal-700:text-teal-300 font-semibold">
                    Log In
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

export default Register;
