/**
 * Markdown Utility Functions
 * Converts markdown text to HTML for display
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Configure marked options
 */
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
  headerIds: false, // Disable header IDs
  mangle: false, // Disable email mangling
});

// Configure renderer to fix link handling
const renderer = new marked.Renderer();

renderer.link = function (token) {
  // Handle both old (href, title, text) and new (token object) formats
  const href = typeof token === 'string' ? token : token.href;
  const text = typeof token === 'object' ? token.text : arguments[2];
  const title = typeof token === 'object' ? token.title : arguments[1];

  // Use href as text if text is undefined or empty
  const linkText = text || href || '';
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${linkText}</a>`;
};

marked.use({ renderer });

/**
 * Convert markdown to sanitized HTML
 * @param {string} markdown - The markdown text
 * @returns {string} Sanitized HTML
 */
export const markdownToHtml = (markdown) => {
  if (!markdown) return '';

  try {
    // Pre-process custom markdown extensions
    let processedMarkdown = markdown;

    // Support underline with __ (before marked processes it)
    processedMarkdown = processedMarkdown.replace(/__([^_]+)__/g, '<u>$1</u>');

    // Convert markdown to HTML
    const rawHtml = marked.parse(processedMarkdown);

    // Sanitize HTML to prevent XSS attacks while allowing color spans
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'title', 'class', 'style'],
      ALLOWED_STYLES: {
        '*': {
          'color': [/^#[0-9A-Fa-f]{6}$/],
          'background-color': [/^#[0-9A-Fa-f]{6}$/],
          'padding': [/.*/],
          'border-radius': [/.*/]
        }
      }
    });

    return cleanHtml;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return markdown; // Return original text if parsing fails
  }
};

/**
 * Strip markdown formatting and return plain text
 * @param {string} markdown - The markdown text
 * @returns {string} Plain text
 */
export const stripMarkdown = (markdown) => {
  if (!markdown) return '';

  return markdown
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/__([^_]+)__/g, '$1') // Underline
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/^[-*+]\s+/gm, '') // List items
    .replace(/^#+\s+/gm, '') // Headers
    .replace(/`([^`]+)`/g, '$1') // Code
    .replace(/<span[^>]*>([^<]+)<\/span>/g, '$1') // HTML spans (for colors)
    .trim();
};
