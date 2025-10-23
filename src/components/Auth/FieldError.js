import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Reusable Form Field Error Message Component
 * Displays validation errors in a consistent style
 * Prevents code duplication across form components
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.error - Error message to display
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element|null}
 */
const FieldError = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <p className={`mt-1 text-sm text-red-600 flex items-center ${className}`}>
      <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
      <span>{error}</span>
    </p>
  );
};

export default FieldError;
