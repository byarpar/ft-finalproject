import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './UIComponents';

/**
 * Consolidated Auth Components
 * Combined all authentication-related components into a single file
 */

/**
 * Reusable Form Field Error Message Component
 * Displays validation errors in a consistent style
 */
export const FieldError = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <p className={`mt-1 text-sm text-red-600 flex items-center ${className}`}>
      <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
      <span>{error}</span>
    </p>
  );
};

/**
 * Reusable Password Toggle Button Component
 * Shows/hides password in input fields
 */
export const PasswordToggleButton = ({ showPassword, onToggle, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors ${className}`}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      tabIndex={-1}
    >
      {showPassword ? (
        <EyeSlashIcon className="h-5 w-5" />
      ) : (
        <EyeIcon className="h-5 w-5" />
      )}
    </button>
  );
};

/**
 * Reusable Google OAuth Login Button Component
 * Prevents code duplication across Login and Register forms
 */
export const GoogleOAuthButton = ({
  onClick,
  text = 'Continue with Google',
  disabled = false,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {text}
    </button>
  );
};

/**
 * Private Route Component
 * Protects routes that require authentication
 */
export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * Admin Route Component  
 * Protects admin-only routes
 */
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Default exports for backward compatibility
const AuthComponents = {
  FieldError,
  PasswordToggleButton,
  GoogleOAuthButton,
  PrivateRoute,
  AdminRoute
};

export default AuthComponents;