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
    return 'Email required';
  }
  // Standard email regex pattern
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Invalid email format';
  }
  if (value.length > 255) {
    return 'Email too long (max 255 characters)';
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
    return 'Password required';
  }
  if (value.length < 8) {
    return 'Minimum 8 characters';
  }
  if (value.length > 128) {
    return 'Maximum 128 characters';
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
    return 'Password required';
  }
  if (value.length < 8) {
    return 'Minimum 8 characters';
  }
  if (value.length > 128) {
    return 'Maximum 128 characters';
  }
  // Check for uppercase, lowercase, number, and special character
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#])/.test(value)) {
    return 'Must include uppercase, lowercase, number, and special character (@$!%*?&-_#)';
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
    return 'Full name required';
  }
  const trimmed = value.trim();
  if (trimmed.length < 2) {
    return 'Minimum 2 characters';
  }
  if (trimmed.length > 100) {
    return 'Maximum 100 characters';
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
    return 'Confirm password required';
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
    return 'Please accept terms to continue';
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

