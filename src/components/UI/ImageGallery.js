import React, { useState, useEffect, useCallback } from 'react';
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import ResponsiveImage from './ResponsiveImage';
import { getImageUrl } from '../../utils/imageUtils';

/**
 * ImageGallery - Advanced image gallery with navigation, zoom, and sharing features
 */
const ImageGallery = ({ 
  images = [], 
  initialIndex = 0, 
  onClose, 
  showInfo = true,
  allowDownload = true,
  allowShare = true 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showImageInfo, setShowImageInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentImage = images[currentIndex];

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
    setIsZoomed(false);
    setIsLoading(true);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
    setIsZoomed(false);
    setIsLoading(true);
  }, [images.length]);

  const toggleZoom = useCallback(() => {
    setIsZoomed(!isZoomed);
  }, [isZoomed]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          toggleZoom();
          break;
        case 'i':
        case 'I':
          setShowImageInfo(!showImageInfo);
          break;
        default:
          // No action needed for other keys
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, showImageInfo, goToPrevious, goToNext, onClose, toggleZoom]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  // Preload adjacent images
  useEffect(() => {
    const preloadImages = () => {
      const preloadIndexes = [
        currentIndex - 1 >= 0 ? currentIndex - 1 : images.length - 1,
        currentIndex + 1 < images.length ? currentIndex + 1 : 0
      ];

      preloadIndexes.forEach(index => {
        if (images[index]) {
          const img = new Image();
          img.src = getImageUrl(images[index]);
        }
      });
    };

    preloadImages();
  }, [currentIndex, images]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!currentImage || !allowDownload) return;
    
    const link = document.createElement('a');
    link.href = getImageUrl(currentImage);
    link.download = `discussion-image-${currentIndex + 1}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!currentImage || !allowShare) return;

    const imageUrl = getImageUrl(currentImage);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Discussion Image ${currentIndex + 1}`,
          url: imageUrl,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(imageUrl);
        // You could add a toast notification here
      } catch (error) {
        console.log('Copy failed:', error);
      }
    }
  };

  if (!images.length || !currentImage) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
      onMouseMove={handleMouseMove}
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
            {/* Image Counter */}
            <div className="px-3 py-2 bg-white/10 text-white rounded-lg backdrop-blur-sm border border-white/20">
              <span className="text-sm font-medium">
                {currentIndex + 1} of {images.length}
              </span>
            </div>
            
            {/* Info Toggle */}
            {showInfo && (
              <button
                onClick={() => setShowImageInfo(!showImageInfo)}
                className={`p-2 rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                  showImageInfo 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
                title="Toggle image info (I)"
              >
                <InformationCircleIcon className="w-5 h-5" />
              </button>
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

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm ${
              showControls ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
            }`}
            title="Previous image (←)"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm ${
              showControls ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
            title="Next image (→)"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Image Container */}
      <div 
        className={`relative transition-all duration-500 ease-out max-w-full max-h-full ${
          isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
        }`}
        onClick={toggleZoom}
      >
        <img
          src={getImageUrl(currentImage)}
          alt={`Gallery item ${currentIndex + 1} of ${images.length}`}
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

      {/* Image Info Panel */}
      {showInfo && showImageInfo && (
        <div className="absolute right-4 top-20 bottom-20 w-80 bg-black/80 backdrop-blur-md rounded-xl p-4 text-white overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">Image Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-white/70">Position:</span>
              <span className="ml-2">{currentIndex + 1} of {images.length}</span>
            </div>
            <div>
              <span className="text-white/70">File:</span>
              <span className="ml-2">{currentImage.split('/').pop() || 'Unknown'}</span>
            </div>
            {/* Add more metadata here if available */}
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
      }`}>
        <div className="flex items-center justify-between p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {allowDownload && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
                title="Download image"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Download</span>
              </button>
            )}
            
            {allowShare && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
                title="Share image"
              >
                <ShareIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-white/70 text-sm bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm">
            <span className="hidden sm:inline">
              ← → Navigate • Space: Zoom • I: Info • Esc: Close
            </span>
            <span className="sm:hidden">
              Tap to zoom • Swipe to navigate
            </span>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip for Multiple Images */}
      {images.length > 1 && (
        <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }`}>
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-lg p-2 max-w-md overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsZoomed(false);
                  setIsLoading(true);
                }}
                className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                  index === currentIndex 
                    ? 'border-white scale-110' 
                    : 'border-white/30 hover:border-white/60 hover:scale-105'
                }`}
              >
                <ResponsiveImage
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full"
                  aspectRatio="1/1"
                  lazy={false}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;