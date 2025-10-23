/**
 * Common form field handlers for authentication pages
 * Centralizes form handling logic to prevent duplication
 * 
 * @module utils/formHandlers
 */

/**
 * Check if account is deleted and can be restored
 * @param {string} email - Email to check
 * @param {Function} setErrors - Function to update errors
 * @returns {Promise<void>}
 */
export const checkAccountDeletionStatus = async (email, setErrors) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/check-deletion-status`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }
    );

    if (response.ok) {
      const data = await response.json();
      const status = data.data;

      if (status.isDeleted && status.canRestore) {
        setErrors(prev => ({
          ...prev,
          general: `This account was deleted ${status.daysElapsed} ${status.daysElapsed === 1 ? 'day' : 'days'} ago. You have ${status.daysRemaining} ${status.daysRemaining === 1 ? 'day' : 'days'} to restore it.`,
          accountDeleted: true,
          canRestore: true,
          deletedEmail: email
        }));
      } else if (status.isDeleted && !status.canRestore) {
        setErrors(prev => ({
          ...prev,
          general: 'This account has been permanently deleted. Please create a new account.',
          accountDeleted: true,
          canRestore: false
        }));
      }
    }
  } catch (err) {
    console.error('Error checking deletion status:', err);
    // Don't show error, just proceed normally
  }
};

/**
 * Redirect to Google OAuth for authentication
 */
export const handleGoogleAuth = () => {
  window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/auth/google`;
};

/**
 * Create handleChange function for form inputs
 * @param {Function} setFormData - setState function for form data
 * @param {Function} validateField - Validation function for individual field
 * @param {Object} touched - Object tracking which fields have been touched
 * @param {Function} setErrors - setState function for errors
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.validatePasswordMatch] - Whether to validate password confirmation
 * @param {string} [options.passwordField] - Name of password field (for confirmation validation)
 * @param {string} [options.confirmField] - Name of confirmation field
 * @returns {Function} handleChange event handler
 */
export const createHandleChange = (
  setFormData,
  validateField,
  touched,
  setErrors,
  options = {}
) => {
  return (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };

      // If password changes, revalidate confirm password if it's been touched
      if (
        options.validatePasswordMatch &&
        name === options.passwordField &&
        touched[options.confirmField] &&
        prev[options.confirmField]
      ) {
        const confirmError = validateField(
          options.confirmField,
          prev[options.confirmField],
          updated
        );
        setErrors(prevErrors => ({
          ...prevErrors,
          [options.confirmField]: confirmError
        }));
      }

      return updated;
    });

    // Validate field if it's been touched
    if (touched[name]) {
      const fieldError = validateField(name, newValue);
      setErrors(prev => {
        const newErrors = { ...prev };
        if (fieldError) {
          newErrors[name] = fieldError;
        } else {
          delete newErrors[name]; // Remove error if validation passes
        }
        newErrors.general = ''; // Clear general error when user types
        return newErrors;
      });
    }
  };
};

/**
 * Create handleBlur function for form inputs
 * @param {Function} validateField - Validation function for individual field
 * @param {Function} setTouched - setState function for touched fields
 * @param {Function} setErrors - setState function for errors
 * @returns {Function} handleBlur event handler
 */
export const createHandleBlur = (validateField, setTouched, setErrors) => {
  return (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setTouched(prev => ({ ...prev, [name]: true }));

    const fieldError = validateField(name, fieldValue);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (fieldError) {
        newErrors[name] = fieldError;
      } else {
        delete newErrors[name]; // Remove error if validation passes
      }
      return newErrors;
    });
  };
};

/**
 * Focus first error field in form
 * @param {Object} errors - Object containing field errors
 * @param {Object} refs - Object containing field refs (e.g., { email: emailRef, password: passwordRef })
 * @param {string[]} fieldOrder - Order of fields to check (e.g., ['email', 'password'])
 */
export const focusFirstError = (errors, refs, fieldOrder) => {
  for (const fieldName of fieldOrder) {
    if (errors[fieldName] && refs[fieldName]?.current) {
      refs[fieldName].current.focus();
      break;
    }
  }
};

/**
 * Preload user profile image to prevent flickering
 * @param {string|null} profilePhotoUrl - URL of profile photo
 * @param {number} [timeout=300] - Maximum time to wait for image load (ms)
 * @returns {Promise} Promise that resolves when image is loaded or timeout
 */
export const preloadProfileImage = (profilePhotoUrl, timeout = 300) => {
  return new Promise((resolve) => {
    if (profilePhotoUrl) {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Continue even if image fails
      img.src = profilePhotoUrl;

      // Timeout to prevent blocking navigation too long
      setTimeout(resolve, timeout);
    } else {
      resolve();
    }
  });
};

/**
 * Map backend validation errors to form field errors
 * Handles both array format (with field/message) and object format errors
 * @param {Array|Object} backendErrors - Errors from backend
 * @returns {Object} Object mapping field names to error messages
 */
export const mapBackendErrors = (backendErrors) => {
  const errors = {};

  if (Array.isArray(backendErrors)) {
    // Handle array format: [{ field: 'email', message: 'Invalid email' }, ...]
    backendErrors.forEach(err => {
      if (err.field && err.message) {
        errors[err.field] = err.message;
      }
    });
  } else if (typeof backendErrors === 'object') {
    // Handle object format: { email: 'Invalid email', password: 'Too short' }
    Object.entries(backendErrors).forEach(([field, message]) => {
      if (message) {
        errors[field] = message;
      }
    });
  }

  return errors;
};
