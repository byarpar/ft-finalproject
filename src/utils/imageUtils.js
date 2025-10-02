/**
 * Utility functions for handling image URLs
 */

/**
 * Converts an image reference to a full URL
 * @param {string|object} imageRef - Image reference (base64 data URI, file path, or image object)
 * @returns {string} - Full URL to the image
 */
export const getImageUrl = (imageRef) => {
  if (!imageRef) {
    return '';
  }

  // Handle object format (from answers or complex image objects)
  if (typeof imageRef === 'object') {
    // If it has a data property, it's likely base64
    if (imageRef.data) {
      // Check if data is already a proper data URI
      if (imageRef.data.startsWith('data:')) {
        return imageRef.data;
      }
      // If data is raw base64, construct proper data URI
      if (imageRef.data && !imageRef.data.startsWith('http') && !imageRef.data.startsWith('/')) {
        const mimeType = imageRef.mimetype || 'image/jpeg';
        return `data:${mimeType};base64,${imageRef.data}`;
      }
      return imageRef.data;
    }
    // If it has a filename, construct URL using proxy
    if (imageRef.filename) {
      return `/uploads/${imageRef.filename}`;
    }
    // If it has a url property, use it
    if (imageRef.url) {
      return typeof imageRef.url === 'string' ? getImageUrl(imageRef.url) : '';
    }
    // If it has a src property, use it
    if (imageRef.src) {
      return typeof imageRef.src === 'string' ? getImageUrl(imageRef.src) : '';
    }
    return '';
  }

  // Handle string format
  if (typeof imageRef !== 'string') {
    return '';
  }

  // If it's already a base64 data URI, return as is
  if (imageRef.startsWith('data:')) {
    return imageRef;
  }

  // If it's a file path, use proxy for uploads

  // If it already starts with http, return as is
  if (imageRef.startsWith('http')) {
    return imageRef;
  }

  // If it starts with /, it's an absolute path - use as is for proxy
  if (imageRef.startsWith('/')) {
    return imageRef;
  }

  // Otherwise, assume it's a filename and add /uploads/
  return `/uploads/${imageRef}`;
};
