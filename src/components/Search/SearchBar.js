import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import { searchAPI } from '../../services/api';

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
  showEnhancedFeatures = false, // Enable voice, image, Lisu keyboard
  showSuggestions = false, // Enable dynamic suggestions
  redirectOnSearch = true, // Auto-redirect to dictionary page on search
}) => {
  const navigate = useNavigate();
  const [internalValue, setInternalValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Fetch suggestions when user types (debounced)
  useEffect(() => {
    if (!showSuggestions || !value || value.length < 1) {
      setSuggestions([]);
      setShowSuggestionsList(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await searchAPI.search({
          query: value,
          limit: 5,
        });

        // Extract results from response
        const words = response.data?.words || response.words || [];
        setSuggestions(words);
        setShowSuggestionsList(words.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, showSuggestions]);

  // Debounce onChange/onSearch
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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSelectedSuggestionIndex(-1);
    if (!isControlled) {
      setInternalValue(newValue);
    }
    // For controlled components, call onChange immediately
    if (isControlled && onChange) {
      onChange(newValue);
    }
  };

  // Clear function - currently unused but kept for potential future use
  // const handleClear = () => {
  //   if (!isControlled) {
  //     setInternalValue('');
  //   }
  //   if (onChange) {
  //     onChange('');
  //   }
  //   if (onSearch) {
  //     onSearch('');
  //   }
  //   setSuggestions([]);
  //   setShowSuggestionsList(false);
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value && value.trim()) {
      // Redirect to dictionary page with search query
      if (redirectOnSearch) {
        navigate(`/dictionary?q=${encodeURIComponent(value.trim())}`);
      }
      // Also call the onSearch callback if provided
      if (onSearch) {
        onSearch(value);
      }
    }
    setShowSuggestionsList(false);
  };

  const handleSuggestionClick = (word) => {
    const searchTerm = word.english_word || word.lisu_word;

    // Redirect to dictionary page with selected word
    if (redirectOnSearch && searchTerm) {
      navigate(`/dictionary?q=${encodeURIComponent(searchTerm)}`);
    }

    if (!isControlled) {
      setInternalValue(searchTerm);
    }
    if (onChange) {
      onChange(searchTerm);
    }
    if (onSearch) {
      onSearch(searchTerm);
    }
    setShowSuggestionsList(false);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestionsList || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestionsList(false);
        setSelectedSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  // Voice Search Handler
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (!isControlled) {
        setInternalValue(transcript);
      }
      if (onChange) {
        onChange(transcript);
      }
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Image Search Handler - currently unused (camera icon removed)
  // const handleImageSearch = () => {
  //   alert('Image search feature coming soon! This will allow you to search by uploading an image of Lisu script.');
  // };

  // Lisu Keyboard Toggle - currently unused
  // const handleLisuKeyboardToggle = () => {
  //   setLisuKeyboardActive(!lisuKeyboardActive);
  //   if (!lisuKeyboardActive) {
  //     alert('Lisu keyboard helper activated! (Virtual keyboard integration coming soon)');
  //   }
  // };

  // Size classes
  const sizeClasses = {
    small: 'h-10 text-sm',
    medium: 'h-12 text-base',
    large: 'h-14 sm:h-16 text-base sm:text-lg',
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-5 h-5 sm:w-6 sm:h-6',
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center bg-white rounded-full shadow-lg overflow-hidden">
        {/* Search Icon */}
        <div className="pl-4 sm:pl-5 pr-2 sm:pr-3 pointer-events-none flex-shrink-0">
          <MagnifyingGlassIcon
            className={`${iconSizeClasses[size]} text-gray-400`}
          />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          className={`
            flex-1 ${sizeClasses[size]} 
            bg-transparent
            border-none
            outline-none
            text-gray-700
            placeholder-gray-400
            disabled:opacity-50 disabled:cursor-not-allowed
            pr-2 sm:pr-3
            font-normal
            text-base sm:text-lg
            min-w-0
          `}
          aria-label="Search"
        />

        {/* Right Side Icons - Inside the input area */}
        <div className="flex items-center gap-1 sm:gap-2 pr-2 sm:pr-3 flex-shrink-0">
          {/* Voice Search */}
          {showEnhancedFeatures && (
            <button
              type="button"
              onClick={handleVoiceSearch}
              disabled={isListening}
              className={`p-2 sm:p-2.5 rounded-full transition-colors ${isListening
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'hover:bg-gray-100 text-teal-600'
                }`}
              title="Voice Search"
              aria-label="Voice search"
            >
              <MicrophoneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Image Search - Disabled */}
          {/* {showEnhancedFeatures && (
            <button
              type="button"
              onClick={handleImageSearch}
              className="p-1.5 rounded-full hover:bg-gray-100 text-teal-600 transition-colors"
              title="Search by Image"
              aria-label="Image search"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
          )} */}

          {/* Vertical Divider */}
          <div className="h-6 sm:h-7 w-px bg-gray-300 mx-1 sm:mx-2"></div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={disabled}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm sm:text-base whitespace-nowrap"
            aria-label="Search"
          >
            <span className="hidden xs:inline sm:inline">Search</span>
            <MagnifyingGlassIcon className="w-5 h-5 xs:hidden sm:hidden" />
          </button>
        </div>
      </form>

      {/* Dynamic Suggestions Dropdown */}
      {showSuggestions && showSuggestionsList && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[400px] overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}
        >
          <div className="divide-y divide-gray-100">
            {suggestions.map((word, index) => (
              <button
                key={word.id || index}
                type="button"
                onClick={() => handleSuggestionClick(word)}
                className={`w-full text-left px-4 py-2.5 hover:bg-gray-50:bg-gray-700 transition-all duration-150 ${index === selectedSuggestionIndex ? 'bg-gray-50' : ''
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Detect if search is in Lisu script */}
                    {(() => {
                      const isLisuSearch = value && value.charCodeAt(0) >= 42192 && value.charCodeAt(0) <= 42239;

                      if (isLisuSearch) {
                        // Show Lisu word first for Lisu searches
                        return (
                          <>
                            {/* Lisu Word */}
                            <div className="text-sm font-bold text-gray-800 mb-0.5 leading-tight">
                              {word.lisu_word || 'ꓡꓴ'}
                            </div>

                            {/* English Word and Part of Speech Row */}
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs font-semibold text-teal-600">
                                {word.english_word}
                              </span>
                              {word.part_of_speech && (
                                <span className="px-1.5 py-0.5 bg-gray-100 text-[10px] font-medium text-gray-500 uppercase tracking-wide rounded">
                                  {typeof word.part_of_speech === 'object' ? word.part_of_speech?.name : word.part_of_speech}
                                </span>
                              )}
                            </div>
                          </>
                        );
                      } else {
                        // Show English word first for English searches
                        return (
                          <>
                            {/* English Word */}
                            <div className="text-sm font-bold text-gray-800 mb-0.5 leading-tight flex items-center gap-1.5">
                              <span>{word.english_word}</span>
                              {word.part_of_speech && (
                                <span className="px-1.5 py-0.5 bg-gray-100 text-[10px] font-medium text-gray-500 uppercase tracking-wide rounded">
                                  {typeof word.part_of_speech === 'object' ? word.part_of_speech?.name : word.part_of_speech}
                                </span>
                              )}
                            </div>

                            {/* Lisu Word */}
                            <div className="text-xs font-semibold text-teal-600 mb-0.5">
                              {word.lisu_word || 'ꓡꓴ'}
                            </div>
                          </>
                        );
                      }
                    })()}

                    {/* Definition */}
                    <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-1">
                      {word.english_definition || word.lisu_definition || 'No definition available'}
                    </p>
                  </div>

                  {/* Search Icon on Right */}
                  <div className="flex-shrink-0 ml-2">
                    <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
