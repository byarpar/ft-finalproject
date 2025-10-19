/**
 * AuthCallback Component
 * 
 * Handles OAuth callback after Google authentication.
 * Processes token or error from URL params and redirects appropriately.
 * Features:
 * - Auto-redirect on success/error
 * - Timeout handling with manual retry
 * - Enhanced error messages
 * - Loading state with progress indicator
 * - Keyboard shortcut (Escape to cancel)
 * - Manual redirect link as fallback
 */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import PageLayout from '../components/Layout/PageLayout';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [timeoutError, setTimeoutError] = useState(false);
  const [processing, setProcessing] = useState(true);

  /**
   * Process authentication callback
   */
  const processAuth = useCallback(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // Redirect to login with error message
      const errorMessages = {
        authentication_failed: 'Google authentication failed. Please try again.',
        oauth_failed: 'OAuth login failed. Please try again.',
        access_denied: 'Access was denied. Please try again.',
        invalid_request: 'Invalid authentication request.',
      };
      const message = errorMessages[error] || 'An error occurred during authentication.';
      navigate('/login', { state: { error: message } });
      return;
    }

    if (token) {
      try {
        // Store token and redirect to home
        localStorage.setItem('token', token);
        login(token);
        navigate('/');
      } catch (err) {
        console.error('Token storage error:', err);
        navigate('/login', { state: { error: 'Failed to complete authentication. Please try again.' } });
      }
    } else {
      // No token or error after delay, show timeout
      setTimeoutError(true);
      setProcessing(false);
    }
  }, [searchParams, navigate, login]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      navigate('/login');
    }
  }, [navigate]);

  /**
   * Handle manual retry
   */
  const handleRetry = () => {
    setTimeoutError(false);
    setProcessing(true);
    processAuth();
  };

  useEffect(() => {
    // Add keyboard listener
    window.addEventListener('keydown', handleKeyDown);

    // Process auth immediately
    processAuth();

    // Set timeout fallback (10 seconds)
    const timeoutId = setTimeout(() => {
      if (processing && !searchParams.get('token') && !searchParams.get('error')) {
        setTimeoutError(true);
        setProcessing(false);
      }
    }, 10000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, [searchParams, navigate, login, handleKeyDown, processAuth, processing]);

  return (
    <PageLayout
      title="Completing Sign In - Lisu Dictionary"
      description="Processing your authentication..."
      background="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      fullWidth
    >
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-md w-full mx-4">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            {timeoutError ? (
              // Timeout/Error State
              <>
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <ExclamationTriangleIcon
                      className="w-16 h-16 text-yellow-600"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-yellow-100 rounded-full blur-xl opacity-50"></div>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Taking Longer Than Expected
                </h1>
                <p className="text-gray-600 mb-6">
                  The authentication process is taking longer than usual. This may be a temporary issue.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleRetry}
                    className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2:ring-offset-gray-800"
                    aria-label="Retry authentication"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200:bg-gray-600 text-gray-900 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2:ring-offset-gray-800"
                    aria-label="Return to login"
                  >
                    Return to Login
                  </button>
                </div>

                <div className="mt-6 text-center text-xs text-gray-500">
                  Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Esc</kbd> to return to login
                </div>
              </>
            ) : (
              // Loading State
              <>
                {/* Animated Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <ArrowPathIcon
                      className="w-16 h-16 text-indigo-600 animate-spin"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  </div>
                </div>

                {/* Loading Text */}
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Completing Sign In
                </h1>
                <p
                  className="text-gray-600"
                  role="status"
                  aria-live="polite"
                >
                  Please wait while we complete your authentication...
                </p>

                {/* Progress Indicator */}
                <div className="mt-8 space-y-3">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-progress"></div>
                  </div>
                  <p className="text-sm text-gray-500">
                    This should only take a moment
                  </p>
                </div>

                <div className="mt-6 text-center text-xs text-gray-500">
                  Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Esc</kbd> to cancel
                </div>
              </>
            )}
          </div>

          {/* Info Text */}
          {!timeoutError && (
            <p className="mt-6 text-center text-sm text-gray-600">
              If you're not redirected automatically,{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-indigo-600 hover:text-indigo-700:text-indigo-300 font-medium underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2:ring-offset-gray-800 rounded px-1"
              >
                click here to return to login
              </button>
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AuthCallback;
