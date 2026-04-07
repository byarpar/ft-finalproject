import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  UserIcon,
  AcademicCapIcon,
  UsersIcon,
  BriefcaseIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';
import {
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { PageLayout } from '../components/LayoutComponents';

// Shared utilities
import {
  validateEmail,
  validateRegisterPassword,
  validateFullName,
  validateConfirmPassword,
  validateTermsAgreement,
  calculatePasswordStrength
} from '../utils/validation';
import {
  usePasswordToggle,
  useFieldTouch,
  useFormValidation,
  useFormKeyboard,
  useClearForm
} from '../hooks/useAuthForm';
import {
  createHandleChange,
  createHandleBlur,
  focusFirstError,
  mapBackendErrors,
  handleGoogleAuth
} from '../utils/formHandlers';

// Shared components
import { PasswordToggleButton, FieldError, GoogleOAuthButton } from '../components/AuthComponents';

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
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  // Custom hooks for form management
  const passwordToggle = usePasswordToggle();
  const confirmPasswordToggle = usePasswordToggle();
  const { touched, markTouched, markAllTouched, resetTouched } = useFieldTouch({
    full_name: false,
    email: false,
    password: false,
    confirmPassword: false,
    agreeTerms: false
  });
  const { errors, setErrors, clearAllErrors } = useFormValidation();

  // Destructure for cleaner usage
  const { showPassword, togglePasswordVisibility } = passwordToggle;
  const {
    showPassword: showConfirmPassword,
    togglePasswordVisibility: toggleConfirmPasswordVisibility
  } = confirmPasswordToggle;

  // Refs for focus management
  const fullNameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Focus full_name input on mount
  useEffect(() => {
    fullNameInputRef.current?.focus();
  }, []);

  /**
   * Field validator - uses shared validation utilities
   */
  const validateField = useCallback((name, value, allFormData = formData) => {
    if (name === 'full_name') return validateFullName(value);
    if (name === 'email') return validateEmail(value);
    if (name === 'password') return validateRegisterPassword(value);
    if (name === 'confirmPassword') return validateConfirmPassword(value, allFormData.password);
    if (name === 'agreeTerms') return validateTermsAgreement(value);
    return '';
  }, [formData]);

  /**
   * Event handlers using shared utilities
   */
  const handleChange = createHandleChange(
    setFormData,
    validateField,
    touched,
    setErrors,
    {
      validatePasswordMatch: true,
      passwordField: 'password',
      confirmField: 'confirmPassword'
    }
  );

  const handleBlur = createHandleBlur(validateField, markTouched, setErrors);

  /**
   * Validate entire form before submission
   */
  const validateForm = () => {
    const newErrors = {
      full_name: validateField('full_name', formData.full_name),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
      agreeTerms: validateField('agreeTerms', formData.agreeTerms)
    };

    // Check reCAPTCHA
    if (!recaptchaToken) {
      newErrors.recaptcha = 'Please complete the reCAPTCHA verification';
    }

    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    markAllTouched();

    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle reCAPTCHA change
   */
  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    // Clear reCAPTCHA error when user completes it
    if (token && errors.recaptcha) {
      const newErrors = { ...errors };
      delete newErrors.recaptcha;
      setErrors(newErrors);
    }
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
        {
          full_name: fullNameInputRef,
          email: emailInputRef,
          password: passwordInputRef,
          confirmPassword: confirmPasswordInputRef
        },
        ['full_name', 'email', 'password', 'confirmPassword']
      );
      return;
    }

    setLoading(true);
    clearAllErrors();

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
        // Handle validation errors from backend
        if (result.error?.details?.errors && Array.isArray(result.error.details.errors)) {
          // Use shared backend error mapper
          const backendErrors = mapBackendErrors(result.error.details.errors);
          setErrors(backendErrors);

          // Use shared focus handler
          focusFirstError(
            backendErrors,
            {
              full_name: fullNameInputRef,
              email: emailInputRef,
              password: passwordInputRef,
              confirmPassword: confirmPasswordInputRef
            },
            ['full_name', 'email', 'password', 'confirmPassword']
          );
        } else {
          // Extract error message and ensure it's a string
          let errorMessage = result.error?.message || result.error?.details || result.error || 'Registration failed. Please try again.';

          // Convert to string if it's not already
          if (typeof errorMessage !== 'string') {
            errorMessage = JSON.stringify(errorMessage);
          }

          // Check if error is "user already exists"
          const errorLower = errorMessage.toLowerCase();
          if (errorLower.includes('already exists') ||
            errorLower.includes('account with this email') ||
            errorLower.includes('user with this email')) {
            setErrors({
              email: 'User with this email already exists',
              accountExists: true // Flag for conditional rendering
            });
            // Focus on email field
            emailInputRef.current?.focus();
          } else {
            setErrors({ general: errorMessage });
          }
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Network error. Unable to connect to server. Please check your connection and try again.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  /**
 * Clear form using shared hook
 */
  const clearForm = useClearForm(
    setFormData,
    clearAllErrors,
    resetTouched,
    { full_name: '', email: '', password: '', confirmPassword: '', agreeTerms: false },
    fullNameInputRef,
    () => {
      // Reset reCAPTCHA
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
    }
  );

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useFormKeyboard(clearForm, null);

  /**
   * Calculate password strength
   */
  const passwordStrength = calculatePasswordStrength(formData.password);

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
        <div className="lg:w-[42%] bg-gray-50 flex items-center justify-center p-6 lg:p-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md my-auto">
            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Create Your Account
              </h2>
            </div>

            {/* Error Message */}
            {errors.general && !errors.accountExists && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Registration Form */}
            <form
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              className="space-y-4"
              noValidate
              aria-label="Registration form"
            >
              {/* Full Name Field */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                  <span className="text-red-500 ml-1" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={fullNameInputRef}
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="name"
                    aria-required="true"
                    aria-invalid={errors.full_name ? 'true' : 'false'}
                    aria-describedby={errors.full_name ? 'full-name-error' : undefined}
                    className={`w-full px-3 py-2 border ${errors.full_name ? 'border-red-500' : 'border-gray-300'} text-sm rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400`}
                    placeholder="Enter your full name"
                  />
                  {errors.full_name && (
                    <ExclamationCircleIcon
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <FieldError error={errors.full_name} />
              </div>

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
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="email"
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
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : 'password-hint'}
                    className={`w-full px-4 py-3 pr-12 border ${errors.password ? 'border-red-500' : 'border-gray-300'} text-sm rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400`}
                    placeholder="Enter a strong password"
                  />
                  {/* Show/Hide Password Toggle */}
                  <PasswordToggleButton
                    showPassword={showPassword}
                    onToggle={togglePasswordVisibility}
                  />
                </div>
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.score === 1 ? 'w-1/5 bg-red-500' :
                            passwordStrength.score === 2 ? 'w-2/5 bg-red-400' :
                              passwordStrength.score === 3 ? 'w-3/5 bg-yellow-500' :
                                passwordStrength.score === 4 ? 'w-4/5 bg-blue-500' :
                                  passwordStrength.score === 5 ? 'w-full bg-green-500' : 'w-0'
                            }`}
                          aria-hidden="true"
                        />
                      </div>
                      <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
                <FieldError error={errors.password} />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                    className={`w-full px-4 py-3 pr-12 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} text-sm rounded-lg focus:ring-2 focus:ring-teal-500:ring-teal-400 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400`}
                    placeholder="Re-enter your password"
                  />
                  {/* Show/Hide Password Toggle */}
                  <PasswordToggleButton
                    showPassword={showConfirmPassword}
                    onToggle={toggleConfirmPasswordVisibility}
                  />
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
                <FieldError error={errors.confirmPassword} />
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
                    I agree to the Privacy Policy and Terms of Service
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                </div>
                <div className="ml-7">
                  <FieldError error={errors.agreeTerms} />
                </div>
              </div>

              {/* reCAPTCHA */}
              <div>
                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6Lew1_IrAAAAADRERW8rY4BRUD21XFQc-LI4MJUE"}
                    onChange={handleRecaptchaChange}
                    onExpired={() => {
                      setRecaptchaToken(null);
                      setErrors({ ...errors, recaptcha: 'reCAPTCHA expired. Please verify again.' });
                    }}
                    theme="light"
                  />
                </div>
                {errors.recaptcha && (
                  <div className="mt-2 text-center">
                    <FieldError error={errors.recaptcha} />
                  </div>
                )}
              </div>

              {/* Create Account Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700:bg-teal-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2:ring-offset-gray-900 disabled:hover:bg-teal-600 disabled:hover:shadow-md"
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
              <div className="relative pt-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-2 pt-1">
                <GoogleOAuthButton
                  onClick={handleGoogleAuth}
                  text="Sign up with Google"
                  disabled={loading}
                />
              </div>

              {/* Login Link */}
              <div className="text-center pt-3">
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
