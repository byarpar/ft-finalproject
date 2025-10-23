import React from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

/**
 * Reusable Password Toggle Button Component
 * Shows/hides password in input fields
 * Prevents code duplication across Login and Register forms
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.showPassword - Whether password is currently visible
 * @param {Function} props.onToggle - Function to call when button is clicked
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element}
 */
const PasswordToggleButton = ({ showPassword, onToggle, className = '' }) => {
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

export default PasswordToggleButton;
