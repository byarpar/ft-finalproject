import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { EnvelopeIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import PageLayout from '../components/Layout/PageLayout';

/**
 * VerifyEmail Page - Email verification with 6-digit code
 * 
 * Enhanced with modern React patterns:
 * - Auto-focus first input on mount
 * - Smart paste handling for 6-digit codes
 * - Auto-advance on digit entry
 * - Backspace navigation between inputs
 * - Keyboard shortcuts (Enter to submit, Escape to clear)
 * - Resend cooldown timer with visual feedback
 * - Success animation and auto-redirect
 * - Enhanced accessibility with ARIA attributes
 * - Real-time validation feedback
 * 
 * @component
 * @requires {string} location.state.email - User's email address (from registration)
 * @fires {Toast} Success/Error notifications
 * @redirects /login - After successful verification
 */
const VerifyEmail = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state (passed from register page)
  const email = location.state?.email || 'your.email@example.com';
  const isExampleEmail = email === 'your.email@example.com';

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  /**
   * Handle verification submission
   */
  const handleVerify = useCallback(async (e) => {
    e.preventDefault();

    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      // Focus first empty input
      const firstEmptyIndex = code.findIndex(val => !val);
      if (firstEmptyIndex !== -1) {
        inputRefs.current[firstEmptyIndex]?.focus();
      }
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        toast.success('Email verified successfully! Redirecting...', {
          position: 'top-center',
          duration: 2000,
        });
        setTimeout(() => {
          navigate('/login', {
            state: {
              verified: true,
              message: 'Your email has been verified! You can now log in.'
            }
          });
        }, 2000);
      } else {
        const errorMessage = data.message || 'Invalid verification code';
        setError(errorMessage);
        toast.error(errorMessage, {
          position: 'top-center',
          duration: 4000,
        });
        // Clear code inputs on error
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-center',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [code, email, navigate]); // Added navigate dependency

  // Auto-submit when code is complete
  useEffect(() => {
    const verificationCode = code.join('');
    if (verificationCode.length === 6 && !loading && !success) {
      // Small delay to show the last digit before submitting
      const timer = setTimeout(() => {
        handleVerify({ preventDefault: () => { } });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [code, loading, success, handleVerify]);

  /**
   * Handle code input with validation
   */
  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit is now handled by useEffect
  };

  /**
   * Handle backspace navigation
   */
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else if (code[index]) {
        // Clear current input
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
        setError('');
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Escape') {
      // Clear all inputs
      setCode(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    }
  };

  /**
   * Handle paste with validation
   */
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pastedData.length === 0) return;

    const newCode = [...code];
    pastedData.split('').forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
      }
    });

    setCode(newCode);
    setError('');

    // Focus on the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex(val => !val);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if all 6 digits are pasted (trigger via form submit instead)
    if (pastedData.length === 6) {
      // Will be handled by form's auto-submit logic
    }
  }, [code]);

  /**
   * Handle resend code with cooldown
   */
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isExampleEmail) return;

    setResendCooldown(60);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Verification code sent! Check your inbox.', {
          position: 'top-center',
          duration: 4000,
        });
        // Clear existing code
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(data.message || 'Failed to resend code', {
          position: 'top-center',
          duration: 4000,
        });
        // Reset cooldown on error
        setResendCooldown(0);
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend code. Please try again.', {
        position: 'top-center',
        duration: 4000,
      });
      // Reset cooldown on error
      setResendCooldown(0);
    }
  };

  return (
    <PageLayout
      title="Verify Email - Lisu Dictionary"
      description="Verify your email address to activate your Lisu Dictionary account and access all features."
      fullWidth={true}
      background=""
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Warning if no email provided */}
          {isExampleEmail && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg" role="alert">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    No email address found
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Please{' '}
                    <Link to="/register" className="underline hover:text-yellow-900:text-yellow-100">
                      register
                    </Link>
                    {' '}first to receive a verification code.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Centralized Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 transition-colors"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${success
                  ? 'bg-green-100'
                  : 'bg-teal-100'
                  }`}>
                  {success ? (
                    <CheckCircleIcon className="w-8 h-8 text-green-600" aria-hidden="true" />
                  ) : (
                    <EnvelopeIcon className="w-8 h-8 text-teal-600" aria-hidden="true" />
                  )}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {success ? 'Email Verified!' : 'Verify Your Email'}
              </h1>
              {!success && (
                <>
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit code sent to
                  </p>
                  <p className="text-sm font-semibold text-teal-600 mt-1 break-all">
                    {email}
                  </p>
                  {!isExampleEmail && (
                    <p className="text-xs text-gray-500 mt-2">
                      Check your spam folder if you don't see it
                    </p>
                  )}
                </>
              )}
              {success && (
                <p className="text-sm text-gray-600 mt-2">
                  Redirecting you to login...
                </p>
              )}
            </div>

            <form onSubmit={handleVerify} aria-label="Email verification form">
              {/* Code Input Boxes */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={success}
                    aria-label={`Digit ${index + 1} of 6`}
                    aria-required="true"
                    aria-invalid={error ? 'true' : 'false'}
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white text-gray-900 ${success
                      ? 'border-green-500 bg-green-50'
                      : error
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    autoFocus={index === 0}
                    autoComplete="off"
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
                  <div className="flex items-center justify-center gap-2">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" aria-hidden="true" />
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg" role="status" aria-live="polite">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                    <p className="text-sm text-green-600 text-center font-medium">Email verified successfully!</p>
                  </div>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || code.join('').length !== 6 || success}
                aria-busy={loading}
                className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700:bg-teal-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2:ring-offset-gray-800 disabled:hover:bg-teal-600 disabled:hover:shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center" aria-live="polite">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </span>
                ) : success ? (
                  <span className="flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                    Verified
                  </span>
                ) : (
                  'Verify Account'
                )}
              </button>

              {/* Keyboard hints */}
              {!success && (
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Use <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">←</kbd> <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">→</kbd> to navigate · <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">Esc</kbd> to clear
                </p>
              )}
            </form>

            {/* Helper Links */}
            {!success && (
              <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
                <div>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || isExampleEmail}
                    className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded px-2 py-1 ${resendCooldown > 0 || isExampleEmail
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-teal-600 hover:text-teal-700:text-teal-300'
                      }`}
                    aria-label={resendCooldown > 0 ? `Resend code available in ${resendCooldown} seconds` : 'Resend verification code'}
                  >
                    {resendCooldown > 0
                      ? `Resend code in 0:${resendCooldown.toString().padStart(2, '0')}`
                      : 'Resend Code'}
                  </button>
                  {isExampleEmail && (
                    <p className="text-xs text-gray-500 mt-2">
                      Please register first to receive a code
                    </p>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  <Link
                    to="/register"
                    state={{ changeEmail: true }}
                    className="font-medium text-teal-600 hover:text-teal-700:text-teal-300 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded px-1"
                  >
                    Change Email
                  </Link>
                  {' · '}
                  <Link
                    to="/contact"
                    className="font-medium text-teal-600 hover:text-teal-700:text-teal-300 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded px-1"
                  >
                    Need Help?
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default VerifyEmail;
