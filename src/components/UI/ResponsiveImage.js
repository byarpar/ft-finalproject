import React, { useState, useRef, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUtils';

/**
 * ResponsiveImage - Optimized image component with lazy loading and responsive sizing
 */
const ResponsiveImage = ({
  src,
  alt,
  className = '',
  onClick,
  onError,
  sizes = {
    mobile: '400w',
    tablet: '600w',
    desktop: '800w'
  },
  aspectRatio = 'auto',
  lazy = true,
  placeholder = true,
  errorFallback = null,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  const getResponsiveSrc = () => {
    if (!src) {
      return '';
    }
    const baseUrl = getImageUrl(src);

    // For now, return the base URL
    // In a production app, you'd have different image sizes generated
    return baseUrl;
  };

  const generateSrcSet = () => {
    if (!src) return '';
    const baseUrl = getImageUrl(src);

    // In a real implementation, you'd have multiple image sizes
    // For now, we'll just use the same image
    return `${baseUrl} 1x, ${baseUrl} 2x`;
  };

  const containerClasses = `
    relative overflow-hidden transition-all duration-300
    ${aspectRatio !== 'auto' ? `aspect-${aspectRatio}` : ''}
    ${className}
  `;

  const imageClasses = `
    w-full h-full object-cover transition-all duration-500
    ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
    ${hasError ? 'hidden' : ''}
  `;

  const placeholderClasses = `
    absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800
    flex items-center justify-center transition-opacity duration-500
    ${isLoaded ? 'opacity-0' : 'opacity-100'}
  `;

  return (
    <div ref={imgRef} className={containerClasses} onClick={onClick} {...props}>
      {/* Placeholder */}
      {placeholder && !hasError && (
        <div className={placeholderClasses}>
          <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
            <svg className="w-8 h-8 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Loading...</span>
          </div>
        </div>
      )}

      {/* Image */}
      {isInView && !hasError && (
        <img
          src={getResponsiveSrc()}
          srcSet={generateSrcSet()}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={alt}
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {errorFallback || (
            <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span className="text-xs">Failed to load</span>
            </div>
          )}
        </div>
      )}

      {/* Loading overlay for interactive elements */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm animate-pulse" />
      )}
    </div>
  );
};

export default ResponsiveImage;