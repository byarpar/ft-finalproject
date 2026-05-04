/**
 * Shared validation utilities for authentication forms
 * Centralizes validation logic to prevent duplication across Login and Register pages
 * 
 * @module utils/validation
 */

/**
 * Validate email field
 * Matches backend: max 255 chars, proper format
 * @param {string} value - Email value to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateEmail = (value) => {
  if (!value || !value.trim()) {
    return 'Please enter your email';
  }
  // Standard email regex pattern
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Please enter a valid email';
  }
  if (value.length > 255) {
    return 'Email is too long';
  }
  return '';
};

/**
 * Validate password field for login
 * Matches backend: min 8 chars (same as register for consistency)
 * @param {string} value - Password value to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateLoginPassword = (value) => {
  if (!value || !value.trim()) {
    return 'Please enter your password';
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (value.length > 128) {
    return 'Password is too long';
  }
  return '';
};

/**
 * Validate password field for registration
 * Matches backend: 8-128 chars, uppercase, lowercase, number, and special char required
 * @param {string} value - Password value to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateRegisterPassword = (value) => {
  if (!value || !value.trim()) {
    return 'Please create a password';
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (value.length > 128) {
    return 'Password is too long';
  }
  // Check for uppercase, lowercase, number, and special character
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#])/.test(value)) {
    return 'Add uppercase, lowercase, number & special character';
  }
  return '';
};

/**
 * Validate full name field
 * Matches backend: 2-100 chars, trimmed
 * @param {string} value - Full name value to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateFullName = (value) => {
  if (!value || !value.trim()) {
    return 'Please enter your name';
  }
  const trimmed = value.trim();
  if (trimmed.length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (trimmed.length > 100) {
    return 'Name is too long';
  }
  return '';
};

/**
 * Validate password confirmation field
 * Matches backend: must match password exactly
 * @param {string} confirmPassword - Confirmation password value
 * @param {string} password - Original password value
 * @returns {string} Error message or empty string if valid
 */
export const validateConfirmPassword = (confirmPassword, password) => {
  if (!confirmPassword || !confirmPassword.trim()) {
    return 'Please confirm your password';
  }
  if (confirmPassword !== password) {
    return 'Passwords don\'t match';
  }
  return '';
};

/**
 * Validate terms and conditions agreement
 * @param {boolean} value - Agreement checkbox value
 * @returns {string} Error message or empty string if valid
 */
export const validateTermsAgreement = (value) => {
  if (!value) {
    return 'Please accept the terms to continue';
  }
  return '';
};

/**
 * Calculate password strength score
 * Based on password requirements: uppercase, lowercase, number, special character
 * Example strong password: Byarpar1@
 * @param {string} password - Password to evaluate
 * @returns {Object} Object containing score (0-4), label, and color
 */
export const calculatePasswordStrength = (password) => {
  if (!password) {
    return { score: 0, label: 'None', color: 'gray' };
  }

  let score = 0;

  // Check all required character types
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&\-_#]/.test(password);

  // Minimum length (8 characters)
  if (password.length >= 8) score++;

  // Has lowercase letter
  if (hasLower) score++;

  // Has uppercase letter
  if (hasUpper) score++;

  // Has number
  if (hasNumber) score++;

  // Has special character
  if (hasSpecial) score++;

  // If all requirements are met (length + 4 character types), ensure Strong
  if (password.length >= 8 && hasLower && hasUpper && hasNumber && hasSpecial) {
    score = 5; // All requirements met
  }

  // Map score to strength levels
  let label, color;
  if (score === 0) {
    label = 'None';
    color = 'gray';
  } else if (score <= 2) {
    label = 'Weak';
    color = 'red';
  } else if (score === 3) {
    label = 'Fair';
    color = 'yellow';
  } else if (score === 4) {
    label = 'Good';
    color = 'blue';
  } else {
    label = 'Strong';
    color = 'green';
  }

  return {
    score: Math.min(score, 5),
    label,
    color
  };
};

