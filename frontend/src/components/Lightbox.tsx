import React, { useEffect, useState } from 'react';
import { Image } from '../hooks/useHeritage';

export interface LightboxProps {
  image: Image;
  currentIndex: number;
  totalImages: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  culturalTheme?: 'temple' | 'palace' | 'folk' | 'modern';
}

const Lightbox: React.FC<LightboxProps> = ({
  image,
  currentIndex,
  totalImages,
  onClose,
  onNext,
  onPrevious,
  culturalTheme = 'temple',
}) => {
  const [showInfo, setShowInfo] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Theme-based frame styling
  const frameStyles = {
    temple: 'border-saffron-500 shadow-saffron-500/20',
    palace: 'border-rajasthani-500 shadow-rajasthani-500/20',
    folk: 'border-emerald-500 shadow-emerald-500/20',
    modern: 'border-kerala-500 shadow-kerala-500/20',
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrevious();
          break;
        case 'ArrowRight':
          onNext();
          break;
        case 'i':
        case 'I':
          setShowInfo((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Touch gesture handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNext();
    } else if (isRightSwipe) {
      onPrevious();
    }
  };

  // Reset image loaded state when image changes
  useEffect(() => {
    setImageLoaded(false);
  }, [image.id]);

  return (
    <div
      className="fixed inset-0 z-50 bg-charcoal-900/95 backdrop-blur-sm flex items-center justify-center animate-cultural-fade"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all duration-200 group"
        aria-label="Close lightbox"
      >
        <svg
          className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Info Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowInfo(!showInfo);
        }}
        className="absolute top-4 right-20 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all duration-200"
        aria-label="Toggle image information"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Image Counter */}
      <div className="absolute top-4 left-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium">
        {currentIndex + 1} / {totalImages}
      </div>

      {/* Main Content Container */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative max-w-7xl w-full h-full flex flex-col md:flex-row gap-4">
          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center">
            <div className={`relative max-w-full max-h-full border-4 ${frameStyles[culturalTheme]} rounded-lg shadow-2xl overflow-hidden bg-white`}>
              {/* Loading Spinner */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-charcoal-100">
                  <div className="loading-mandala" />
                </div>
              )}
              
              {/* Full-size Image */}
              <img
                src={image.url}
                alt={image.altText}
                className={`max-w-full max-h-[80vh] object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f0f0f0" width="800" height="600"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                  setImageLoaded(true);
                }}
              />

              {/* Cultural Frame Decoration */}
              <div className="absolute top-0 left-0 w-12 h-12 overflow-hidden pointer-events-none">
                <div className="absolute -top-4 -left-4 w-8 h-8 rotate-45 bg-gradient-to-br from-saffron-400 to-saffron-500 opacity-60" />
              </div>
              <div className="absolute bottom-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
                <div className="absolute -bottom-4 -right-4 w-8 h-8 rotate-45 bg-gradient-to-br from-saffron-400 to-saffron-500 opacity-60" />
              </div>
            </div>
          </div>

          {/* Image Information Panel */}
          {showInfo && (
            <div className="md:w-96 bg-white/95 backdrop-blur-md rounded-lg p-sacred-md overflow-y-auto max-h-[80vh] shadow-2xl animate-cultural-fade">
              {/* Caption */}
              <div className="mb-sacred-md">
                <h3 className="text-cultural-heading text-xl font-semibold text-charcoal-800 mb-2">
                  {image.caption}
                </h3>
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center my-sacred-sm">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-saffron-400 to-transparent" />
                <span className="px-sacred-sm text-lg">🪷</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-saffron-400 to-transparent" />
              </div>

              {/* Description - What the image depicts */}
              {image.description && (
                <div className="mb-sacred-md">
                  <h4 className="text-cultural-heading font-semibold text-charcoal-800 mb-2 flex items-center">
                    <span className="mr-2">👁️</span>
                    What You See
                  </h4>
                  <p className="text-cultural-body text-charcoal-700 leading-relaxed">
                    {image.description}
                  </p>
                </div>
              )}

              {/* Cultural Context */}
              {image.culturalContext && (
                <div className="mb-sacred-md">
                  <h4 className="text-cultural-heading font-semibold text-charcoal-800 mb-2 flex items-center">
                    <span className="mr-2">🕉️</span>
                    Cultural Significance
                  </h4>
                  <p className="text-cultural-body text-charcoal-700 leading-relaxed">
                    {image.culturalContext}
                  </p>
                </div>
              )}

              {/* Location and Period */}
              <div className="space-y-2">
                {image.location && (
                  <div className="flex items-start">
                    <span className="text-charcoal-600 font-medium mr-2">📍 Location:</span>
                    <span className="text-charcoal-700">{image.location}</span>
                  </div>
                )}
                {image.period && (
                  <div className="flex items-start">
                    <span className="text-charcoal-600 font-medium mr-2">⏳ Period:</span>
                    <span className="text-charcoal-700">{image.period}</span>
                  </div>
                )}
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="mt-sacred-md pt-sacred-md border-t border-charcoal-200">
                <p className="text-xs text-charcoal-500">
                  <span className="font-medium">Keyboard shortcuts:</span> ← → to navigate, I to toggle info, ESC to close
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {totalImages > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all duration-200 group"
              aria-label="Previous image"
            >
              <svg
                className="w-8 h-8 text-white group-hover:-translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all duration-200 group"
              aria-label="Next image"
            >
              <svg
                className="w-8 h-8 text-white group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Lightbox;
