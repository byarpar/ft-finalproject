import React from 'react';

/**
 * SkeletonLoader Component
 * 
 * Provides animated skeleton loaders for various content types.
 * Used to improve perceived performance during data loading.
 * 
 * @param {string} variant - Type of skeleton: 'text', 'card', 'stat', 'avatar', 'list'
 * @param {number} count - Number of skeleton items to render (for lists)
 * @param {string} className - Additional CSS classes
 */

const SkeletonLoader = ({ variant = 'text', count = 1, className = '' }) => {
  const baseClass = 'animate-pulse bg-gray-200 rounded';

  const renderSkeleton = () => {
    switch (variant) {
      case 'avatar':
        return (
          <div className={`${baseClass} w-16 h-16 rounded-full ${className}`} aria-label="Loading avatar" />
        );

      case 'stat':
        return (
          <div className={`space-y-3 ${className}`}>
            <div className={`${baseClass} h-6 w-20`} />
            <div className={`${baseClass} h-10 w-32`} />
            <div className={`${baseClass} h-4 w-24`} />
          </div>
        );

      case 'card':
        return (
          <div className={`${className}`}>
            <div className={`${baseClass} h-6 w-3/4 mb-4`} />
            <div className="space-y-2">
              <div className={`${baseClass} h-4 w-full`} />
              <div className={`${baseClass} h-4 w-5/6`} />
              <div className={`${baseClass} h-4 w-4/6`} />
            </div>
          </div>
        );

      case 'list-item':
        return (
          <div className={`flex items-start space-x-3 ${className}`}>
            <div className={`${baseClass} w-10 h-10 rounded`} />
            <div className="flex-1 space-y-2">
              <div className={`${baseClass} h-4 w-3/4`} />
              <div className={`${baseClass} h-3 w-1/2`} />
            </div>
          </div>
        );

      case 'activity-feed':
        return (
          <div className={`space-y-4 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <div className={`${baseClass} w-10 h-10 rounded-full flex-shrink-0`} />
                <div className="flex-1 space-y-2">
                  <div className={`${baseClass} h-4 w-3/4`} />
                  <div className={`${baseClass} h-3 w-1/2`} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'saved-item':
        return (
          <div className={`space-y-4 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className={`${baseClass} h-5 w-3/4 mb-3`} />
                <div className={`${baseClass} h-3 w-full mb-2`} />
                <div className={`${baseClass} h-3 w-2/3`} />
              </div>
            ))}
          </div>
        );

      case 'recommended-topic':
        return (
          <div className={`space-y-3 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="p-3 border border-gray-200 rounded-lg">
                <div className={`${baseClass} h-4 w-4/5 mb-2`} />
                <div className="flex justify-between items-center">
                  <div className={`${baseClass} h-6 w-20`} />
                  <div className="flex space-x-2">
                    <div className={`${baseClass} h-4 w-12`} />
                    <div className={`${baseClass} h-4 w-12`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'stats-grid':
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${baseClass} w-12 h-12 rounded-lg`} />
                  <div className={`${baseClass} w-6 h-6 rounded`} />
                </div>
                <div className={`${baseClass} h-8 w-24 mb-2`} />
                <div className={`${baseClass} h-4 w-32`} />
              </div>
            ))}
          </div>
        );

      case 'chat-message':
        return (
          <div className={`space-y-4 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex items-start space-x-2 max-w-[70%] ${i % 2 === 1 ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`${baseClass} w-8 h-8 rounded-full flex-shrink-0`} />
                  <div className={`${baseClass} rounded-2xl p-3 ${i % 2 === 0 ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
                    <div className={`${baseClass} h-3 w-32 mb-1`} />
                    <div className={`${baseClass} h-3 w-24`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'text':
      default:
        return (
          <div className={`space-y-2 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className={`${baseClass} h-4 w-full`} />
            ))}
          </div>
        );
    }
  };

  return (
    <div role="status" aria-label="Loading content">
      {renderSkeleton()}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default SkeletonLoader;
