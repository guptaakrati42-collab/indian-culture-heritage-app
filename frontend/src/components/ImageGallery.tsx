import React, { useState, useCallback, useMemo } from 'react';
import { Image } from '../hooks/useHeritage';
import Lightbox from './Lightbox';

export interface ImageGalleryProps {
  images: Image[];
  initialIndex?: number;
  culturalTheme?: 'temple' | 'palace' | 'folk' | 'modern';
}

const ImageGallery: React.FC<ImageGalleryProps> = React.memo(({ 
  images, 
  initialIndex = 0,
  culturalTheme = 'temple'
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const previousImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Theme-based styling - memoized to prevent recalculation
  const themeStyles = useMemo(() => ({
    temple: 'border-saffron-400 bg-saffron-50',
    palace: 'border-rajasthani-400 bg-rajasthani-50',
    folk: 'border-emerald-400 bg-emerald-50',
    modern: 'border-kerala-400 bg-kerala-50',
  }), []);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-sacred-lg">
        <p className="text-charcoal-600">No images available</p>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-sacred-md">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`
              relative overflow-hidden rounded-lg cursor-pointer
              border-2 ${themeStyles[culturalTheme]}
              shadow-cultural hover:shadow-temple
              transition-all duration-300 hover:-translate-y-1
              group
            `}
            onClick={() => openLightbox(index)}
          >
            {/* Thumbnail Image */}
            <div className="aspect-w-4 aspect-h-3 relative">
              <img
                src={image.thumbnailUrl}
                alt={image.altText}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  // Fallback to placeholder on error
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                }}
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-sacred-sm">
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {image.caption}
                  </p>
                </div>
              </div>

              {/* Cultural corner decoration */}
              <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
                <div className="absolute -top-2 -right-2 w-4 h-4 rotate-45 bg-gradient-to-br from-saffron-400 to-saffron-500 opacity-60" />
              </div>
            </div>

            {/* Image Info Badge */}
            {(image.location || image.period) && (
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-charcoal-700 shadow-sm">
                {image.period && <span className="font-medium">{image.period}</span>}
                {image.period && image.location && <span className="mx-1">•</span>}
                {image.location && <span>{image.location}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <Lightbox
          image={images[currentIndex]}
          currentIndex={currentIndex}
          totalImages={images.length}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrevious={previousImage}
          culturalTheme={culturalTheme}
        />
      )}
    </div>
  );
});

export default ImageGallery;
