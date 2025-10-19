/**
 * Date Utility Functions
 * Centralized date formatting functions to avoid duplication across components
 */

/**
 * Format date with relative time (e.g., "2 hours ago", "3 days ago")
 * Falls back to locale date string if more than 7 days old
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatRelativeDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString();
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Format date in a standard locale format
 * @param {string} dateString - ISO date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString);
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  return date.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Format date and time in a standard locale format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format date as simple locale date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatSimpleDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Format date with full month name
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string (e.g., "January 15, 2024")
 */
export const formatLongDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get time ago string (e.g., "2 hours ago", "just now")
 * @param {string} dateString - ISO date string
 * @returns {string} Time ago string
 */
export const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
};

/**
 * Check if a date is today
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
export const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is within the last N days
 * @param {string} dateString - ISO date string
 * @param {number} days - Number of days
 * @returns {boolean}
 */
export const isWithinDays = (dateString, days) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
  return daysDiff <= days;
};
