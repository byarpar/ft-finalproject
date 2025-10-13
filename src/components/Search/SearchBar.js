import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  onChange,
  value: controlledValue,
  className = '',
  autoFocus = false,
  debounceMs = 300,
  showClearButton = true,
  disabled = false,
  size = 'medium', // 'small', 'medium', 'large'
}) => {
  const [internalValue, setInternalValue] = useState('');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Debounce timer
  useEffect(() => {
    if (!onChange && !onSearch) return;

    const timer = setTimeout(() => {
      if (onChange) {
        onChange(value);
      }
      if (onSearch && value) {
        onSearch(value);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, onChange, onSearch]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    // For controlled components, call onChange immediately
    if (isControlled && onChange) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    if (onChange) {
      onChange('');
    }
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && value) {
      onSearch(value);
    }
  };

  // Size classes
  const sizeClasses = {
    small: 'h-8 text-sm',
    medium: 'h-10 text-base',
    large: 'h-12 text-lg',
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  const paddingClasses = {
    small: 'pl-8 pr-8',
    medium: 'pl-10 pr-10',
    large: 'pl-12 pr-12',
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <MagnifyingGlassIcon
          className={`${iconSizeClasses[size]} text-gray-400 dark:text-gray-500`}
        />
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className={`
          w-full ${sizeClasses[size]} ${paddingClasses[size]}
          border border-gray-300 dark:border-gray-600
          rounded-lg
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          focus:ring-2 focus:ring-teal-500 focus:border-transparent
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${value ? 'pr-10' : ''}
        `}
        aria-label="Search"
      />

      {/* Clear Button */}
      {showClearButton && value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Clear search"
        >
          <XMarkIcon
            className={`${iconSizeClasses[size]} text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300`}
          />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
