import React, { useEffect, useState } from 'react';
import { 
  XMarkIcon, 
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ShareIcon,
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';

/**
 * ImageModal - Enhanced full-screen image viewer modal with modern UI
 */
const ImageModal = ({ src, onClose, categoryName, categoryIcon, imageInfo }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timeout;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `discussion-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Discussion Image',
          url: src,
        });
      } catch (error) {
        // Share failed silently
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(src);
      // You could add a toast notification here
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
      onMouseMove={handleMouseMove}
    >
      <div 
        className="relative w-full h-full flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {/* Top Controls Bar */}
        <div className={`absolute top-0 left-0 right-0 z-20 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}>
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <div className="flex items-center gap-3">
              {/* Category Badge */}
              {categoryName && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white rounded-lg backdrop-blur-sm border border-white/20">
                  {categoryIcon && (
                    <categoryIcon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{categoryName}</span>
                </div>
              )}
              
              {/* Image Info */}
              {imageInfo && (
                <div className="text-white/80 text-sm">
                  {imageInfo.title && <span className="font-medium">{imageInfo.title}</span>}
                  {imageInfo.uploadedBy && (
                    <span className="ml-2">by {imageInfo.uploadedBy}</span>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-white/20"
              title="Close (Esc)"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div 
          className={`relative transition-all duration-500 ease-out ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={toggleZoom}
        >
          <img
            src={src}
            alt="Full size view"
            className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Zoom Indicator */}
          {!isLoading && (
            <div className={`absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg backdrop-blur-sm transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              {isZoomed ? (
                <ArrowsPointingInIcon className="w-5 h-5" />
              ) : (
                <ArrowsPointingOutIcon className="w-5 h-5" />
              )}
            </div>
          )}
        </div>

        {/* Bottom Controls Bar */}
        <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }`}>
          <div className="flex items-center justify-between p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
                title="Download image"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Download</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
                title="Share image"
              >
                <ShareIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>

            {/* Instructions */}
            <div className="text-white/70 text-sm bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm">
              <span className="hidden sm:inline">Click image to zoom • Click outside or press Esc to close</span>
              <span className="sm:hidden">Tap to zoom • Tap outside to close</span>
            </div>
          </div>
        </div>

        {/* Mobile Touch Indicators */}
        <div className="sm:hidden absolute top-1/2 left-4 right-4 flex justify-between pointer-events-none">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-xs">←</span>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-xs">→</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;