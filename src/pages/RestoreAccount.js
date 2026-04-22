/**
 * RestoreAccount Component
 * 
 * Allows users to restore their deleted account within the grace period (30 days).
 * Features:
 * - Countdown timer showing days remaining
 * - One-click account restoration
 * - Email input validation
 * - Error handling with detailed messages
 * - Redirect to home after successful restoration
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ExclamationCircleIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { PageLayout } from '../components/LayoutComponents';
import { useAuth } from '../contexts/AuthContext';

const RestoreAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletionStatus, setDeletionStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const checkDeletionStatus = useCallback(async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setCheckingStatus(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/check-deletion-status`,
        { email }
      );

      const status = response.data.data;
      setDeletionStatus(status);

      if (!status.isDeleted) {
        setError('This account is not deleted. Please log in normally.');
      } else if (!status.canRestore) {
        setError('This account cannot be restored. The grace period has expired or the account has been permanently deleted.');
      }
    } catch (err) {
      console.error('Check deletion status error:', err);
      setError(err.response?.data?.error?.message || 'Failed to check account status');
    } finally {
      setCheckingStatus(false);
    }
  }, [email]);

  useEffect(() => {
    // Check deletion status when email is provided
    if (email) {
      checkDeletionStatus();
    }
  }, [email, checkDeletionStatus]);

  const handleRestore = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/restore-account`,
        { email }
      );

      const { token, message } = response.data.data;

      // Log in with the restored account token
      await loginWithToken(token);

      // Redirect to home
      setTimeout(() => {
        navigate('/', { state: { message: message || 'Welcome back! Your account has been restored.' } });
      }, 1500);

    } catch (err) {
      console.error('Restore account error:', err);
      const errorMessage = err.response?.data?.error?.message || 'Failed to restore account. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Restore Account - Lisu Dictionary"
      background="bg-gradient-to-br from-blue-50 to-indigo-50"
      fullWidth
    >
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-4">
              <ArrowPathIcon className="w-16 h-16 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Restore Your Account
            </h1>
            <p className="text-blue-50 text-lg">
              You can restore your deleted account within 30 days of deletion
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-16 bg-white">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-10 md:p-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Restore Deleted Account
              </h2>

              {/* Info Message */}
              {location.state?.message && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <ExclamationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-blue-800">{location.state.message}</p>
                  </div>
                </div>
              )}

              {/* Deletion Status Info */}
              {deletionStatus && deletionStatus.isDeleted && deletionStatus.canRestore && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <ClockIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Account deleted {deletionStatus.daysElapsed} {deletionStatus.daysElapsed === 1 ? 'day' : 'days'} ago</p>
                      <p>You have <span className="font-bold">{deletionStatus.daysRemaining} {deletionStatus.daysRemaining === 1 ? 'day' : 'days'}</span> remaining to restore your account.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
                  <div className="flex items-start gap-2">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleRestore} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={checkDeletionStatus}
                    required
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
                    placeholder="your.email@example.com"
                    disabled={loading || checkingStatus}
                  />
                </div>

                {deletionStatus && deletionStatus.canRestore && (
                  <button
                    type="submit"
                    disabled={loading || checkingStatus || !deletionStatus.canRestore}
                    className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Restoring...
                      </span>
                    ) : (
                      <>
                        <ArrowPathIcon className="w-5 h-5 inline-block mr-2" />
                        Restore My Account
                      </>
                    )}
                  </button>
                )}

                {!deletionStatus && !checkingStatus && email && (
                  <button
                    type="button"
                    onClick={checkDeletionStatus}
                    disabled={loading || checkingStatus}
                    className="w-full px-6 py-3.5 bg-white text-gray-700 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 border border-gray-300 hover:bg-gray-50"
                  >
                    {checkingStatus ? 'Checking...' : 'Check Account Status'}
                  </button>
                )}
              </form>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">What happens when you restore?</h3>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    <li>Your account will be reactivated immediately</li>
                    <li>All your data will be restored</li>
                    <li>You can log in and use the service normally</li>
                  </ul>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Don't want to restore?
                  </p>
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default RestoreAccount;
