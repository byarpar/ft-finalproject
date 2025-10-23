import { useState, useCallback } from 'react';

/**
 * Custom hook for password visibility toggle
 * Provides state and handler for showing/hiding password inputs
 * Prevents code duplication across Login and Register components
 * 
 * @returns {Object} Object containing showPassword state and toggle function
 * @example
 * const { showPassword, togglePasswordVisibility } = usePasswordToggle();
 */
export const usePasswordToggle = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return {
    showPassword,
    togglePasswordVisibility
  };
};

/**
 * Custom hook for managing field touch state
 * Tracks which form fields have been interacted with for validation display
 * 
 * @param {Object} initialFields - Initial fields object (e.g., { email: false, password: false })
 * @returns {Object} Object containing touched state and markTouched function
 * @example
 * const { touched, markTouched } = useFieldTouch({ email: false, password: false });
 */
export const useFieldTouch = (initialFields = {}) => {
  const [touched, setTouched] = useState(initialFields);

  const markTouched = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  const markAllTouched = useCallback(() => {
    const allTouched = {};
    Object.keys(initialFields).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
  }, [initialFields]);

  const resetTouched = useCallback(() => {
    setTouched(initialFields);
  }, [initialFields]);

  return {
    touched,
    markTouched,
    markAllTouched,
    resetTouched
  };
};

/**
 * Custom hook for form validation
 * Manages validation errors and provides validation utilities
 * 
 * @returns {Object} Object containing errors state and validation functions
 * @example
 * const { errors, setFieldError, setErrors, clearError } = useFormValidation();
 */
export const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const setFieldError = useCallback((fieldName, errorMessage) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }));
  }, []);

  const clearError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    setErrors,
    setFieldError,
    clearError,
    clearAllErrors
  };
};

/**
 * Custom hook for keyboard shortcuts in forms
 * Provides common keyboard event handlers (Escape to clear, Enter to submit)
 * 
 * @param {Function} onClear - Function to call when Escape is pressed
 * @param {Function} onSubmit - Function to call when Enter is pressed (optional)
 * @returns {Function} Keyboard event handler
 * @example
 * const handleKeyDown = useFormKeyboard(clearForm, handleSubmit);
 */
export const useFormKeyboard = (onClear, onSubmit = null) => {
  const handleKeyDown = useCallback((e) => {
    // Escape key clears form
    if (e.key === 'Escape' && onClear) {
      e.preventDefault();
      onClear();
    }

    // Enter key submits form (if onSubmit provided and not in textarea)
    if (e.key === 'Enter' && onSubmit && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      onSubmit(e);
    }
  }, [onClear, onSubmit]);

  return handleKeyDown;
};

/**
 * Custom hook for form clearing with integrated cleanup
 * Provides a standardized way to clear form data, errors, and touched state
 * 
 * @param {Object} initialFormData - Initial form data object
 * @param {Function} setFormData - setState function for form data
 * @param {Function} clearAllErrors - Function to clear all errors
 * @param {Function} resetTouched - Function to reset touched state
 * @param {Object} firstInputRef - Ref to first input to focus after clear
 * @returns {Function} clearForm function
 * @example
 * const clearForm = useClearForm(initialData, setFormData, clearAllErrors, resetTouched, emailRef);
 */
export const useClearForm = (initialFormData, setFormData, clearAllErrors, resetTouched, firstInputRef) => {
  return useCallback(() => {
    setFormData(initialFormData);
    clearAllErrors();
    resetTouched();
    firstInputRef?.current?.focus();
  }, [initialFormData, setFormData, clearAllErrors, resetTouched, firstInputRef]);
};
