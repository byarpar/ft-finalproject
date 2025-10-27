import React from 'react';
import { XMarkIcon, ArrowDownTrayIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const ImageLightbox = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onIndexChange
}) => {
  const downloadImage = async () => {
    try {
      const imageUrl = typeof images[currentIndex] === 'string'
        ? images[currentIndex]
        : (images[currentIndex]?.data || images[currentIndex]?.url);

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleKeyDown = React.useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrevious();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrevious, onNext]);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImageUrl = typeof images[currentIndex] === 'string'
    ? images[currentIndex]
    : (images[currentIndex]?.data || images[currentIndex]?.url);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
        {/* Top Control Bar */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-between z-10">
          <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-gray-800">
            {currentIndex + 1} / {images.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); downloadImage(); }}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 bg-white rounded-full hover:bg-gray-100 active:scale-95 transition-all"
              title="Download Image"
            >
              <ArrowDownTrayIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
            </button>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 bg-white rounded-full hover:bg-gray-100 active:scale-95 transition-all"
              title="Close (Esc)"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrevious(); }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 min-h-[56px] min-w-[56px] flex items-center justify-center p-2 sm:p-3 bg-white/90 rounded-full hover:bg-white active:scale-95 transition-all z-10 shadow-lg"
              title="Previous (←)"
            >
              <ChevronUpIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-800 transform -rotate-90" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 min-h-[56px] min-w-[56px] flex items-center justify-center p-2 sm:p-3 bg-white/90 rounded-full hover:bg-white active:scale-95 transition-all z-10 shadow-lg"
              title="Next (→)"
            >
              <ChevronUpIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-800 transform rotate-90" />
            </button>
          </>
        )}

        {/* Main Image */}
        <div className="max-w-7xl max-h-full flex items-center justify-center px-12 sm:px-16" onClick={(e) => e.stopPropagation()}>
          <img
            src={currentImageUrl}
            alt={`Discussion attachment ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] sm:max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)]">
            <div className="flex gap-1.5 sm:gap-2 bg-white/95 p-2 rounded-lg overflow-x-auto scrollbar-hide">
              {images.map((img, idx) => {
                const thumbUrl = typeof img === 'string' ? img : (img?.data || img?.url);
                return (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); onIndexChange(idx); }}
                    className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden border-2 transition-all active:scale-95 ${idx === currentIndex ? 'border-teal-500 ring-2 ring-teal-400' : 'border-transparent hover:border-gray-400'
                      }`}
                  >
                    <img src={thumbUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
