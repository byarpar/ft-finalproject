import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  KeyIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { PageLayout } from '../components/LayoutComponents';

const AuthSidebar = () => (
  <div
    className="lg:w-[58%] relative overflow-hidden flex items-center justify-center p-8 lg:p-8 min-h-[400px] lg:min-h-screen"
    style={{
      backgroundImage: 'linear-gradient(to bottom right, rgba(15, 118, 110, 0.92), rgba(13, 148, 136, 0.88)), url(/images/hero/lisu-people.jpg)',
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
              {/* Center icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                  <KeyIcon className="w-11 h-11 text-white" />
                </div>
              </div>
              {/* Top */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2">
                <div className="w-14 h-14 bg-teal-400 rounded-full flex items-center justify-center shadow-lg">
                  <ShieldCheckIcon className="w-7 h-7 text-teal-900" />
                </div>
              </div>
              {/* Bottom */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <div className="w-14 h-14 bg-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  <LockClosedIcon className="w-7 h-7 text-orange-900" />
                </div>
              </div>
              {/* Left */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2">
                <div className="w-14 h-14 bg-orange-300 rounded-full flex items-center justify-center shadow-lg">
                  <ArrowPathIcon className="w-7 h-7 text-orange-900" />
                </div>
              </div>
              {/* Right */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2">
                <div className="w-14 h-14 bg-teal-300 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircleIcon className="w-7 h-7 text-teal-900" />
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
        SET YOUR<br />NEW PASSWORD
      </h1>
      <p className="text-lg lg:text-xl text-teal-50 font-light max-w-md mx-auto">
        Choose a strong password to keep your account safe and secure.
      </p>
    </div>
  </div>
);
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
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword
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
      <PageLayout title="Password Reset Successful - AMDF" background="bg-gray-50" fullWidth>
        <div className="min-h-screen flex flex-col lg:flex-row">
          <AuthSidebar />
          <div className="lg:w-[42%] bg-gray-50 flex items-center justify-center p-6 lg:p-8 min-h-screen lg:min-h-0">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Password Updated!</h2>
                <p className="mt-2 text-sm text-gray-600">Your password has been successfully reset.</p>
              </div>

              <div className="mb-6 border border-teal-200 rounded-lg p-4 bg-teal-50">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-teal-900 font-medium">All done!</p>
                    <p className="text-sm text-teal-700 mt-0.5">You can now sign in with your new password.</p>
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">What happened:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 flex-shrink-0" /> Password successfully updated</li>
                  <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 flex-shrink-0" /> Old reset link has been invalidated</li>
                  <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 flex-shrink-0" /> Your account is ready to use</li>
                </ul>
              </div>

              <Link
                to="/login"
                className="block w-full text-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Continue to Sign In
              </Link>

              <p className="mt-4 text-sm text-gray-500 text-center">
                Redirecting automatically in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Reset Password - AMDF" fullWidth background="bg-gray-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        <AuthSidebar />

        <div className="lg:w-[42%] bg-gray-50 flex items-center justify-center p-6 lg:p-8 min-h-screen lg:min-h-0">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Set New Password</h2>
              <p className="mt-2 text-sm text-gray-600">Enter and confirm your new password below.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3" role="alert" aria-live="assertive">
                <div className="flex items-center gap-2">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4" noValidate>
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password <span className="text-red-500">*</span>
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
                    className={`w-full px-3 py-2 pr-10 border ${touched.password && getFieldError('password', formData.password) ? 'border-red-500' : 'border-gray-300'} text-sm rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                {touched.password && getFieldError('password', formData.password) && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                    {getFieldError('password', formData.password)}
                  </p>
                )}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 rounded-full ${passwordStrength.level === 1 ? 'w-1/3 bg-red-500' :
                          passwordStrength.level === 2 ? 'w-2/3 bg-yellow-500' :
                            passwordStrength.level === 3 ? 'w-full bg-green-500' : 'w-0'
                          }`} />
                      </div>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.text}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use 12+ characters with uppercase and numbers</p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
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
                    className={`w-full px-3 py-2 pr-16 border ${touched.confirmPassword && getFieldError('confirmPassword', formData.confirmPassword) ? 'border-red-500' : passwordsMatch ? 'border-green-400' : 'border-gray-300'} text-sm rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors bg-white text-gray-900 placeholder-gray-400`}
                    placeholder="Re-enter new password"
                  />
                  {passwordsMatch && (
                    <CheckCircleIcon className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                {touched.confirmPassword && getFieldError('confirmPassword', formData.confirmPassword) && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                    {getFieldError('confirmPassword', formData.confirmPassword)}
                  </p>
                )}
                {passwordsMatch && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                    Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !token || !passwordsMatch}
                className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Updating...
                  </span>
                ) : 'Set New Password'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResetPassword;
