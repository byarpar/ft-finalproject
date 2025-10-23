# Step-by-Step Implementation Guide
## Refactoring Login.js and Register.js

This guide provides detailed instructions for applying the refactoring to the Login and Register pages.

---

## Part 1: Refactoring Login.js

### Step 1: Update Imports

**REPLACE** the existing imports section:

```javascript
// OLD imports (keep React, Link, navigate, useAuth)
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
```

**WITH** new imports:

```javascript
// Keep existing imports
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import PageLayout from '../components/Layout/PageLayout';

// NEW: Import shared utilities
import { validateEmail, validateLoginPassword } from '../utils/validation';
import { usePasswordToggle, useFieldTouch, useFormValidation, useFormKeyboard } from '../hooks/useAuthForm';
import { createHandleChange, createHandleBlur, focusFirstError, preloadProfileImage } from '../utils/formHandlers';

// NEW: Import shared components
import PasswordToggleButton from '../components/Auth/PasswordToggleButton';
import FieldError from '../components/Auth/FieldError';
import GoogleOAuthButton from '../components/Auth/GoogleOAuthButton';
```

### Step 2: Replace State Management

**REMOVE** these state declarations:

```javascript
// OLD (REMOVE)
const [showPassword, setShowPassword] = useState(false);
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({
  email: false,
  password: false
});
```

**REPLACE WITH** custom hooks:

```javascript
// NEW: Use custom hooks for state management
const { showPassword, togglePasswordVisibility } = usePasswordToggle();
const { touched, markTouched, markAllTouched, resetTouched } = useFieldTouch({
  email: false,
  password: false
});
const { errors, setErrors, setFieldError, clearError, clearAllErrors } = useFormValidation();

// Keep existing state
const [formData, setFormData] = useState({
  email: '',
  password: '',
  rememberMe: false
});
const [loading, setLoading] = useState(false);
const [loginSuccess, setLoginSuccess] = useState(false);
```

### Step 3: Replace Validation Function

**REMOVE** the existing `validateField()` function:

```javascript
// OLD (REMOVE)
const validateField = useCallback((name, value) => {
  switch (name) {
    case 'email':
      if (!value.trim()) {
        return 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        return 'Please enter a valid email address';
      }
      return '';
    case 'password':
      if (!value) {
        return 'Password is required';
      } else if (value.length < 6) {
        return 'Password must be at least 6 characters';
      }
      return '';
    default:
      return '';
  }
}, []);
```

**REPLACE WITH** a unified validator:

```javascript
// NEW: Unified validator using imported functions
const validateField = useCallback((name, value) => {
  switch (name) {
    case 'email':
      return validateEmail(value);
    case 'password':
      return validateLoginPassword(value);
    default:
      return '';
  }
}, []);
```

### Step 4: Replace Event Handlers

**REMOVE** existing handlers:

```javascript
// OLD (REMOVE)
const handleChange = (e) => { ... };
const handleBlur = (e) => { ... };
const togglePasswordVisibility = () => { ... };
```

**REPLACE WITH** shared handlers:

```javascript
// NEW: Use shared handler creators
const handleChange = createHandleChange(
  setFormData,
  validateField,
  touched,
  setErrors
);

const handleBlur = createHandleBlur(
  validateField,
  markTouched,
  setErrors
);

// togglePasswordVisibility is already provided by usePasswordToggle() hook
```

### Step 5: Update Keyboard Handler

**REMOVE** existing `handleKeyDown()`:

```javascript
// OLD (REMOVE)
const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    setFormData({ email: '', password: '', rememberMe: false });
    setErrors({});
    setTouched({ email: false, password: false });
    emailInputRef.current?.focus();
  }
};
```

**REPLACE WITH** hook:

```javascript
// NEW: Use keyboard shortcut hook
const clearForm = useCallback(() => {
  setFormData({ email: '', password: '', rememberMe: false });
  clearAllErrors();
  resetTouched();
  emailInputRef.current?.focus();
}, [clearAllErrors, resetTouched]);

const handleKeyDown = useFormKeyboard(clearForm, null);
```

### Step 6: Update validateForm() Function

**UPDATE** the existing `validateForm()`:

```javascript
// UPDATED: Use markAllTouched from hook
const validateForm = () => {
  const newErrors = {};

  const emailError = validateField('email', formData.email);
  const passwordError = validateField('password', formData.password);

  if (emailError) newErrors.email = emailError;
  if (passwordError) newErrors.password = passwordError;

  setErrors(newErrors);
  markAllTouched(); // Changed from manual setTouched

  return Object.keys(newErrors).length === 0;
};
```

### Step 7: Update handleSubmit() Function

**UPDATE** to use shared utilities:

```javascript
// UPDATED: Use focusFirstError and preloadProfileImage utilities
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    // Use shared focus handler
    focusFirstError(
      errors,
      { email: emailInputRef, password: passwordInputRef },
      ['email', 'password']
    );
    return;
  }

  setLoading(true);
  clearAllErrors(); // Changed from setErrors({})

  try {
    const result = await login(formData.email, formData.password);

    if (result.success) {
      setLoginSuccess(true);

      // Use shared image preloader
      await preloadProfileImage(result.user?.profile_photo_url);

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 200);
    } else {
      // ... rest of error handling stays the same
    }
  } catch (error) {
    console.error('Login error:', error);
    setErrors({
      general: error.message || 'Network error. Unable to connect to server. Please check your connection and try again.'
    });
  } finally {
    setLoading(false);
  }
};
```

### Step 8: Update JSX - Password Field

**FIND** the password input field in the JSX and **REPLACE** the toggle button:

```jsx
{/* OLD (REMOVE the button element) */}
<button
  type="button"
  onClick={togglePasswordVisibility}
  aria-label={showPassword ? 'Hide password' : 'Show password'}
  tabIndex={-1}
>
  {showPassword ? (
    <EyeSlashIcon className="h-5 w-5" />
  ) : (
    <EyeIcon className="h-5 w-5" />
  )}
</button>

{/* NEW: Replace with component */}
<PasswordToggleButton
  showPassword={showPassword}
  onToggle={togglePasswordVisibility}
/>
```

### Step 9: Update JSX - Error Messages

**FIND** error message displays and **REPLACE** with component:

```jsx
{/* OLD (REMOVE) */}
{errors.email && touched.email && (
  <p className="mt-1 text-sm text-red-600 flex items-center">
    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
    <span>{errors.email}</span>
  </p>
)}

{/* NEW: Replace with component */}
{touched.email && <FieldError error={errors.email} />}
```

**Repeat for all error displays** (email, password, general errors).

### Step 10: Update JSX - Google OAuth Button

**FIND** the Google OAuth button and **REPLACE**:

```jsx
{/* OLD (REMOVE entire button with SVG) */}
<button
  type="button"
  onClick={handleGoogleLogin}
  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300..."
>
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    {/* ... Google SVG paths ... */}
  </svg>
  Continue with Google
</button>

{/* NEW: Replace with component */}
<GoogleOAuthButton
  onClick={handleGoogleLogin}
  text="Continue with Google"
  disabled={loading}
/>
```

---

## Part 2: Refactoring Register.js

### Step 1: Update Imports

**ADD** these imports (similar to Login.js):

```javascript
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import PageLayout from '../components/Layout/PageLayout';

// NEW: Import shared utilities
import {
  validateEmail,
  validateRegisterPassword,
  validateFullName,
  validateConfirmPassword,
  validateTermsAgreement,
  calculatePasswordStrength
} from '../utils/validation';
import {
  usePasswordToggle,
  useFieldTouch,
  useFormValidation,
  useFormKeyboard
} from '../hooks/useAuthForm';
import {
  createHandleChange,
  createHandleBlur,
  focusFirstError,
  mapBackendErrors
} from '../utils/formHandlers';

// NEW: Import shared components
import PasswordToggleButton from '../components/Auth/PasswordToggleButton';
import FieldError from '../components/Auth/FieldError';
import GoogleOAuthButton from '../components/Auth/GoogleOAuthButton';
```

### Step 2: Replace State Management

**REMOVE** these state declarations:

```javascript
// OLD (REMOVE)
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({
  full_name: false,
  email: false,
  password: false,
  confirmPassword: false,
  agreeTerms: false
});
```

**REPLACE WITH** custom hooks:

```javascript
// NEW: Use custom hooks for state management
const passwordToggle = usePasswordToggle();
const confirmPasswordToggle = usePasswordToggle();
const { touched, markTouched, markAllTouched, resetTouched } = useFieldTouch({
  full_name: false,
  email: false,
  password: false,
  confirmPassword: false,
  agreeTerms: false
});
const { errors, setErrors, setFieldError, clearError, clearAllErrors } = useFormValidation();

// Destructure for cleaner usage
const { showPassword, togglePasswordVisibility } = passwordToggle;
const {
  showPassword: showConfirmPassword,
  togglePasswordVisibility: toggleConfirmPasswordVisibility
} = confirmPasswordToggle;

// Keep existing form data state
const [formData, setFormData] = useState({
  full_name: '',
  email: location.state?.email || '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
});
const [loading, setLoading] = useState(false);
```

### Step 3: Replace Validation Function

**REMOVE** the large `validateField()` function and **REPLACE**:

```javascript
// NEW: Unified validator using imported functions
const validateField = useCallback((name, value, allFormData = formData) => {
  switch (name) {
    case 'full_name':
      return validateFullName(value);
    case 'email':
      return validateEmail(value);
    case 'password':
      return validateRegisterPassword(value);
    case 'confirmPassword':
      return validateConfirmPassword(value, allFormData.password);
    case 'agreeTerms':
      return validateTermsAgreement(value);
    default:
      return '';
  }
}, [formData]);
```

### Step 4: Replace Event Handlers

**REMOVE** existing handlers and **REPLACE**:

```javascript
// NEW: Use shared handler creators
const handleChange = createHandleChange(
  setFormData,
  validateField,
  touched,
  setErrors,
  {
    validatePasswordMatch: true,
    passwordField: 'password',
    confirmField: 'confirmPassword'
  }
);

const handleBlur = createHandleBlur(
  validateField,
  markTouched,
  setErrors
);
```

### Step 5: Update Keyboard Handler

**REMOVE** existing `handleKeyDown()` and **REPLACE**:

```javascript
// NEW: Use keyboard shortcut hook
const clearForm = useCallback(() => {
  setFormData({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  clearAllErrors();
  resetTouched();
  fullNameInputRef.current?.focus();
}, [clearAllErrors, resetTouched]);

const handleKeyDown = useFormKeyboard(clearForm, null);
```

### Step 6: Update validateForm() Function

```javascript
// UPDATED: Use markAllTouched from hook
const validateForm = () => {
  const newErrors = {};

  const fullNameError = validateField('full_name', formData.full_name);
  const emailError = validateField('email', formData.email);
  const passwordError = validateField('password', formData.password);
  const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
  const agreeTermsError = validateField('agreeTerms', formData.agreeTerms);

  if (fullNameError) newErrors.full_name = fullNameError;
  if (emailError) newErrors.email = emailError;
  if (passwordError) newErrors.password = passwordError;
  if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
  if (agreeTermsError) newErrors.agreeTerms = agreeTermsError;

  setErrors(newErrors);
  markAllTouched(); // Changed from manual setTouched

  return Object.keys(newErrors).length === 0;
};
```

### Step 7: Update handleSubmit() Function

```javascript
// UPDATED: Use shared utilities
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    // Use shared focus handler
    focusFirstError(
      errors,
      {
        full_name: fullNameInputRef,
        email: emailInputRef,
        password: passwordInputRef,
        confirmPassword: confirmPasswordInputRef
      },
      ['full_name', 'email', 'password', 'confirmPassword']
    );
    return;
  }

  setLoading(true);
  clearAllErrors();

  try {
    const result = await register(formData.email, formData.password, formData.full_name);

    if (result.success) {
      toast.success('Account created successfully! Please check your email for verification code.', {
        position: 'top-center',
        duration: 4000,
      });
      navigate('/verify-email', { state: { email: formData.email } });
    } else {
      // Use shared backend error mapper
      if (result.error?.details?.errors && Array.isArray(result.error.details.errors)) {
        const backendErrors = mapBackendErrors(result.error.details.errors);
        setErrors(backendErrors);

        // Show first error in toast
        const firstError = result.error.details.errors[0];
        toast.error(firstError.message, {
          position: 'top-center',
          duration: 6000,
        });

        // Use shared focus handler
        focusFirstError(
          backendErrors,
          {
            full_name: fullNameInputRef,
            email: emailInputRef,
            password: passwordInputRef,
            confirmPassword: confirmPasswordInputRef
          },
          ['full_name', 'email', 'password', 'confirmPassword']
        );
      } else {
        // ... rest of error handling
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error.message || 'Network error. Unable to connect to server. Please check your connection and try again.';
    toast.error(errorMessage, {
      position: 'top-center',
      duration: 6000,
    });
    setErrors({ general: errorMessage });
  } finally {
    setLoading(false);
  }
};
```

### Step 8: Replace Password Strength Function

**REMOVE** `getPasswordStrength()` function and **REPLACE**:

```javascript
// OLD (REMOVE entire function)
const getPasswordStrength = (password) => { ... };
const passwordStrength = getPasswordStrength(formData.password);

// NEW: Use imported function
const passwordStrength = calculatePasswordStrength(formData.password);
```

### Step 9: Update JSX - Password Fields

**REPLACE** both password toggle buttons:

```jsx
{/* Password field */}
<PasswordToggleButton
  showPassword={showPassword}
  onToggle={togglePasswordVisibility}
/>

{/* Confirm password field */}
<PasswordToggleButton
  showPassword={showConfirmPassword}
  onToggle={toggleConfirmPasswordVisibility}
/>
```

### Step 10: Update JSX - Error Messages

**REPLACE** all error message displays:

```jsx
{/* For each field */}
{touched.full_name && <FieldError error={errors.full_name} />}
{touched.email && <FieldError error={errors.email} />}
{touched.password && <FieldError error={errors.password} />}
{touched.confirmPassword && <FieldError error={errors.confirmPassword} />}
{touched.agreeTerms && <FieldError error={errors.agreeTerms} />}
```

### Step 11: Update JSX - Google OAuth Button

```jsx
<GoogleOAuthButton
  onClick={handleGoogleLogin}
  text="Sign up with Google"
  disabled={loading}
/>
```

---

## Testing Checklist

After completing the refactoring:

### Login.js Tests:
- [ ] Email validation displays errors correctly
- [ ] Password validation displays errors correctly
- [ ] Password visibility toggle works
- [ ] Escape key clears form
- [ ] Error messages display properly
- [ ] Form submission works
- [ ] Google OAuth button works
- [ ] Focus management works (first error field)
- [ ] Deleted account detection works
- [ ] Account restoration flow works

### Register.js Tests:
- [ ] All field validations work
- [ ] Password strength indicator displays
- [ ] Confirm password validation works
- [ ] Both password toggles work independently
- [ ] Terms agreement validation works
- [ ] Escape key clears form
- [ ] Backend error mapping works
- [ ] Toast notifications display
- [ ] Form submission works
- [ ] Google OAuth button works
- [ ] Focus management works

### Cross-Browser Tests:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## Common Issues & Solutions

### Issue: Hook dependency warnings
**Solution**: Ensure all hook dependencies are properly listed in dependency arrays

### Issue: Toggle visibility not working
**Solution**: Make sure you're destructuring the hooks correctly:
```javascript
const { showPassword, togglePasswordVisibility } = usePasswordToggle();
```

### Issue: Validation not showing
**Solution**: Ensure `markTouched()` or `markAllTouched()` is called at appropriate times

### Issue: Form not clearing
**Solution**: Make sure `clearAllErrors()` and `resetTouched()` are called in the clear function

---

## Completion Verification

Run this checklist to verify refactoring is complete:

1. **No duplicate code**: Search for duplicate validation logic
2. **All imports used**: No unused imports remain
3. **All shared utilities used**: Validation, hooks, handlers all imported and used
4. **Components used**: PasswordToggleButton, FieldError, GoogleOAuthButton all used
5. **No console errors**: Check browser console for React warnings
6. **Functionality preserved**: All features work as before
7. **Code is cleaner**: File is shorter and more readable

---

**Estimated time**: 2-3 hours per file for careful refactoring
**Difficulty**: Medium (requires attention to detail but straightforward find-and-replace)
**Risk**: Low (shared utilities are well-tested patterns)
