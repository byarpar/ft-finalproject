import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpenIcon, GlobeAltIcon, LightBulbIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access - default to search for dictionary app
  const from = location.state?.from?.pathname || '/search';
  const redirectMessage = location.state?.message;

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
  }, [location.search, location.pathname, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Don't clear any errors - let them stay visible
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        // Use backend error messages only
        const errorData = result.error?.data || {};
        const backendMessage = result.error?.details || result.error?.message || '';

        // Set error state with backend message
        setErrors({
          general: backendMessage,
          accountNotFound: errorData.accountNotFound || false,
          accountDeleted: errorData.accountDeleted || false
        });

        // Email not verified - redirect to verification page after showing message
        if (errorData.requiresVerification) {
          setTimeout(() => {
            navigate('/verify-email', {
              state: {
                email: errorData.email || formData.email
              }
            });
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: 'Network error. Unable to connect to server.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth route
    // REACT_APP_BACKEND_URL doesn't include /api, so we add it
    window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/auth/google`;
  };

  return (
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
      <div className="lg:w-[42%] bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 lg:p-12 min-h-screen lg:min-h-0 transition-colors duration-200">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Log In to Your Account
            </h2>
          </div>

          {/* Info Message - Login Required */}
          {redirectMessage && (
            <div className="mb-6 border border-teal-300 dark:border-teal-700 rounded-lg p-4 bg-teal-50 dark:bg-teal-900/30">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-teal-800 dark:text-teal-200 font-medium">
                  {redirectMessage}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className={`mb-6 border rounded-lg p-4 ${errors.accountDeleted || errors.accountNotFound
              ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
              <div className="flex items-start">
                {(errors.accountDeleted || errors.accountNotFound) && (
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <div className="flex-1">
                  <p className={`text-sm ${errors.accountDeleted || errors.accountNotFound
                    ? 'text-red-700 dark:text-red-200 font-semibold'
                    : 'text-red-600 dark:text-red-300'
                    }`}>
                    {errors.general}
                  </p>

                  {/* Show verification help if email not verified */}
                  {errors.general.toLowerCase().includes('verify') && !errors.accountNotFound && formData.email && (
                    <div className="mt-3 pt-3 border-t border-red-300 dark:border-red-700">
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
                        Need help with verification?
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/verify-email', { state: { email: formData.email } })}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold underline"
                      >
                        → Go to Verification Page
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-teal-600 dark:text-teal-500 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-gray-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Log In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3.5 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
