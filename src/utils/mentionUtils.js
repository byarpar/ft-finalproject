/**
 * Mention Utilities for Frontend
 * 
 * Client-side utilities for handling user mentions in text input
 */

/**
 * Extract mentions from text content
 * @param {string} content - Text content to parse
 * @returns {Array<string>} Array of unique usernames mentioned
 */
export function extractMentions(content) {
  if (!content || typeof content !== 'string') {
    return [];
  }

  // Match @username pattern (alphanumeric, underscore, hyphen)
  const mentionRegex = /(?:^|[\s\n\r.,!?;:]|^)@([a-zA-Z0-9_-]+)(?=[\s\n\r.,!?;:]|$)/g;

  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1];
    if (username && username.length >= 2 && username.length <= 50) {
      mentions.push(username.toLowerCase());
    }
  }

  return [...new Set(mentions)];
}

/**
 * Get cursor position for mention suggestions
 * @param {string} text - Current text content
 * @param {number} cursorPosition - Current cursor position
 * @returns {Object|null} Mention context or null
 */
export function getMentionContext(text, cursorPosition) {
  if (!text || cursorPosition < 1) {
    return null;
  }

  // Look backwards from cursor to find '@' symbol
  let mentionStart = -1;
  for (let i = cursorPosition - 1; i >= 0; i--) {
    const char = text[i];

    if (char === '@') {
      // Check if @ is at start or preceded by whitespace/punctuation
      const prevChar = i > 0 ? text[i - 1] : '';
      if (i === 0 || /[\s\n\r.,!?;:]/.test(prevChar)) {
        mentionStart = i;
        break;
      }
    }

    // If we hit whitespace or punctuation, no valid mention context
    if (/[\s\n\r]/.test(char)) {
      break;
    }
  }

  if (mentionStart === -1) {
    return null;
  }

  // Extract the partial username after @
  const mentionText = text.substring(mentionStart + 1, cursorPosition);

  // Validate mention text format (allow letters, numbers, underscores, hyphens, and dots)
  if (!/^[a-zA-Z0-9_.-]*$/.test(mentionText)) {
    return null;
  }

  return {
    start: mentionStart,
    end: cursorPosition,
    query: mentionText,
    fullMatch: '@' + mentionText
  };
}

/**
 * Replace mention in text with selected user
 * @param {string} text - Current text content
 * @param {Object} mentionContext - Context from getMentionContext
 * @param {string} username - Selected username
 * @returns {Object} Updated text and cursor position
 */
export function replaceMention(text, mentionContext, username) {
  if (!mentionContext || !username) {
    return { text, cursorPosition: text.length };
  }

  const beforeMention = text.substring(0, mentionContext.start);
  const afterMention = text.substring(mentionContext.end);
  const newMention = `@${username} `;

  const newText = beforeMention + newMention + afterMention;
  const newCursorPosition = mentionContext.start + newMention.length;

  return {
    text: newText,
    cursorPosition: newCursorPosition
  };
}

/**
 * Highlight mentions in text for display
 * @param {string} text - Text to process
 * @returns {Array} Array of text segments with mention flags
 */
export function highlightMentions(text) {
  if (!text) {
    return [{ text: '', isMention: false }];
  }

  const segments = [];
  const mentionRegex = /(?:^|[\s\n\r.,!?;:]|^)@([a-zA-Z0-9_.-]+)(?=[\s\n\r.,!?;:]|$)/g;

  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const username = match[1];
    const matchStart = match.index;
    const matchEnd = match.index + fullMatch.length;

    // Add text before mention
    if (matchStart > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, matchStart),
        isMention: false,
        isUrl: false
      });
    }

    // Check if there's a prefix character (space, punctuation, etc.)
    const prefix = fullMatch.charAt(0) !== '@' ? fullMatch.charAt(0) : '';

    // Add prefix if it exists
    if (prefix) {
      segments.push({
        text: prefix,
        isMention: false,
        isUrl: false
      });
    }

    // Add mention
    segments.push({
      text: `@${username}`,
      isMention: true,
      isUrl: false,
      username: username
    });

    lastIndex = matchEnd;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    // Check for URLs in remaining text
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
    const urlSegments = [];
    let urlLastIndex = 0;
    let urlMatch;

    while ((urlMatch = urlRegex.exec(remainingText)) !== null) {
      // Add text before URL
      if (urlMatch.index > urlLastIndex) {
        urlSegments.push({
          text: remainingText.substring(urlLastIndex, urlMatch.index),
          isMention: false,
          isUrl: false
        });
      }

      // Add URL
      urlSegments.push({
        text: urlMatch[1],
        isMention: false,
        isUrl: true,
        url: urlMatch[1]
      });

      urlLastIndex = urlMatch.index + urlMatch[0].length;
    }

    // Add remaining text after URLs
    if (urlLastIndex < remainingText.length) {
      urlSegments.push({
        text: remainingText.substring(urlLastIndex),
        isMention: false,
        isUrl: false
      });
    }

    if (urlSegments.length > 0) {
      segments.push(...urlSegments);
    } else {
      segments.push({
        text: remainingText,
        isMention: false,
        isUrl: false
      });
    }
  }

  return segments.length > 0 ? segments : [{ text, isMention: false, isUrl: false }];
}

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {boolean} Whether username is valid for mentions
 */
export function isValidMentionUsername(username) {
  if (!username || typeof username !== 'string') {
    return false;
  }

  if (username.length < 2 || username.length > 50) {
    return false;
  }

  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return usernameRegex.test(username);
}

/**
 * Debounce function for search requests
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}