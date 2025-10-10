import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const VerifyEmail = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state (passed from register page)
  const email = location.state?.email || 'your.email@example.com';

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle code input
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
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];

    pastedData.split('').forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
      }
    });

    setCode(newCode);

    // Focus on the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex(val => !val);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  // Handle verification
  const handleVerify = async (e) => {
    e.preventDefault();

    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call
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
        toast.success('Email verified successfully! Redirecting...', {
          position: 'top-center',
          duration: 2000,
        });
        setTimeout(() => {
          navigate('/login', { state: { verified: true } });
        }, 2000);
      } else {
        const errorMessage = data.message || 'Invalid verification code';
        setError(errorMessage);
        toast.error(errorMessage, {
          position: 'top-center',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Connection failed. Please try again.');
      toast.error('Connection failed. Please try again.', {
        position: 'top-center',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setResendCooldown(60);

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
      } else {
        toast.error(data.message || 'Failed to resend code', {
          position: 'top-center',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend code. Please try again.', {
        position: 'top-center',
        duration: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Centralized Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                <EnvelopeIcon className="w-8 h-8 text-teal-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to
            </p>
            <p className="text-sm font-semibold text-teal-600 mt-1">
              {email}
            </p>
          </div>

          <form onSubmit={handleVerify}>
            {/* Code Input Boxes */}
            <div className="flex justify-center gap-3 mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${error
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-teal-500'
                    }`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || code.join('').length !== 6}
              className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Account'
              )}
            </button>
          </form>

          {/* Helper Links */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0}
              className={`text-sm font-medium transition-colors ${resendCooldown > 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-teal-600 hover:text-teal-700'
                }`}
            >
              {resendCooldown > 0
                ? `Resend code in 0:${resendCooldown.toString().padStart(2, '0')}`
                : 'Resend Code'}
            </button>

            <div className="text-sm text-gray-500">
              <Link
                to="/register"
                state={{ changeEmail: true }}
                className="font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                Change Email
              </Link>
              {' · '}
              <Link
                to="/contact"
                className="font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                Need Help?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
