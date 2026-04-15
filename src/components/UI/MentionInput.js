import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { usersAPI } from '../../services/api';
import { getMentionContext, replaceMention, debounce, extractMentions } from '../../utils/mentionUtils';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

/**
 * MentionInput Component
 * 
 * A textarea with @mention functionality that shows user suggestions
 * and handles mention selection with keyboard navigation.
 */
const MentionInput = forwardRef(({
  value = '',
  onChange,
  placeholder = 'Type your message...',
  className = '',
  disabled = false,
  rows = 6,
  maxLength,
  autoFocus = false,
  showCharCount = true,
  ...props
}, ref) => {
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionContext, setMentionContext] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Expose textarea methods to parent component
  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    blur: () => textareaRef.current?.blur(),
    selectionStart: textareaRef.current?.selectionStart,
    selectionEnd: textareaRef.current?.selectionEnd,
    setSelectionRange: (start, end) => textareaRef.current?.setSelectionRange(start, end),
    value: textareaRef.current?.value,
    textarea: textareaRef.current
  }), []);

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = debounce(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await usersAPI.getMentionSuggestions(query);
      const users = response.data?.users || [];

      setSuggestions(users);
      setShowSuggestions(users.length > 0);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Error fetching mention suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  // Handle text change and detect mentions
  const handleTextChange = useCallback((e) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    // Update parent component
    onChange(newValue);

    // Check for mention context
    const context = getMentionContext(newValue, cursorPosition);
    setMentionContext(context);

    if (context && context.query !== undefined) {
      debouncedSearch(context.query);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [onChange, debouncedSearch]);

  // Select a user from suggestions
  const selectUser = useCallback((user) => {
    if (!mentionContext || !textareaRef.current) {
      return;
    }

    const { text: newText, cursorPosition } = replaceMention(
      value,
      mentionContext,
      user.username
    );

    // Update the textarea value and cursor position
    onChange(newText);

    // Set cursor position after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);

    // Hide suggestions
    setShowSuggestions(false);
    setSuggestions([]);
    setMentionContext(null);
  }, [value, mentionContext, onChange, setShowSuggestions, setSuggestions, setMentionContext]);

  // Handle keyboard navigation in suggestions
  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          selectUser(suggestions[selectedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSuggestions([]);
        setMentionContext(null);
        break;

      default:
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, selectUser]);

  // Handle touch events for suggestion selection
  const handleTouchStart = useCallback((e, user) => {
    e.preventDefault();
    setTouchStartY(e.touches[0].clientY);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTouchEnd = useCallback((e, user, index) => {
    e.preventDefault();
    const touchEndY = e.changedTouches[0].clientY;
    const touchDelta = Math.abs(touchEndY - touchStartY);

    // Only select if it was a tap (not a scroll)
    if (touchDelta < 10) {
      setSelectedIndex(index);
      selectUser(user);
    }
  }, [touchStartY, selectUser]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
        textareaRef.current && !textareaRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Auto-focus if needed (but not on touch devices to prevent keyboard popup)
  useEffect(() => {
    if (autoFocus && textareaRef.current && !isTouchDevice) {
      textareaRef.current.focus();
    }
  }, [autoFocus, isTouchDevice]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 resize-none disabled:opacity-50 font-mono text-sm ${className} ${isTouchDevice ? 'touch-manipulation' : ''}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        {...props}
      />

      {/* Mention Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          style={{ touchAction: 'pan-y' }}
        >
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Searching users...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                Mention a user
              </div>
              {suggestions.map((user, index) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => selectUser(user)}
                  onTouchStart={(e) => handleTouchStart(e, user)}
                  onTouchEnd={(e) => handleTouchEnd(e, user, index)}
                  className={`w-full px-4 py-4 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-50 last:border-b-0 transition-colors duration-150 active:bg-teal-100 ${index === selectedIndex ? 'bg-teal-50 border-teal-100' : ''
                    } ${isTouchDevice ? 'touch-manipulation' : ''}`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {user.profile_photo_url ? (
                        <img
                          src={user.profile_photo_url}
                          alt={user.username}
                          className="avatar-unified bg-gray-100"
                        />
                      ) : (
                        <div className="avatar-unified bg-teal-100">
                          <span className="text-teal-600 font-medium text-sm">
                            {(user.full_name || user.username).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        @{user.username}
                      </div>
                      {user.full_name && user.full_name !== user.username && (
                        <div className="text-sm text-gray-500 truncate">
                          {user.full_name}
                        </div>
                      )}
                    </div>
                    {index === selectedIndex && (
                      <div className="text-teal-500 ml-2">
                        <ChevronUpIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
              <div className="px-3 py-2 text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
                {isTouchDevice ? 'Tap to select a user' : 'Use ↑↓ to navigate, Enter to select, Esc to cancel'}
              </div>
            </>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No users found matching "{mentionContext?.query}"
            </div>
          )}
        </div>
      )}

      {/* Helpful text */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>
          Type @ to mention someone • {extractMentions(value).length} mentions
        </span>
        {maxLength && showCharCount && (
          <span>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});



export default MentionInput;