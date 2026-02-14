import React, { useState, useEffect, useRef } from 'react';
import { 
  generateSrcSet, 
  generateSizes, 
  getOptimizedImageUrl, 
  getPlaceholderImage,
  generateBlurPlaceholder 
} from '../utils/imageOptimization';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  placeholder?: 'blur' | 'empty' | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * Optimized Image Component
 * Features:
 * - Lazy loading with Intersection Observer
 * - Responsive images with srcset
 * - WebP format support with fallbacks
 * - Blur placeholder while loading
 * - Error handling with fallback
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  quality = 80,
  sizes,
  onLoad,
  onError,
  placeholder = 'blur',
  objectFit = 'cover'
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate placeholder
  const placeholderSrc = placeholder === 'blur' 
    ? generateBlurPlaceholder(src)
    : placeholder === 'empty'
    ? ''
    : placeholder;

  useEffect(() => {
    const loadImage = async () => {
      try {
        // Get optimized URL with WebP support
        const optimizedUrl = await getOptimizedImageUrl(src, { width, quality });
        
        if (loading === 'lazy' && imgRef.current) {
          // Use Intersection Observer for lazy loading
          observerRef.current = new IntersectionObserver(
            (entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  setImageSrc(optimizedUrl);
                  observerRef.current?.disconnect();
                }
              });
            },
            {
              root: null,
              rootMargin: '50px',
              threshold: 0.01
            }
          );

          observerRef.current.observe(imgRef.current);
        } else {
          // Load immediately for eager loading
          setImageSrc(optimizedUrl);
        }
      } catch (error) {
        console.error('Failed to optimize image:', error);
        setImageSrc(src); // Fallback to original
      }
    };

    loadImage();

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, width, quality, loading]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    const error = new Error(`Failed to load image: ${src}`);
    onError?.(error);
    
    // Set fallback placeholder
    setImageSrc(getPlaceholderImage(width || 400, height || 300, '🏛️'));
  };

  // Generate responsive srcset
  const srcSet = imageSrc ? generateSrcSet(imageSrc) : '';
  const sizesAttr = sizes || generateSizes();

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Blur placeholder */}
      {isLoading && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full blur-sm"
          style={{ objectFit }}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={imageSrc || placeholderSrc}
        srcSet={srcSet}
        sizes={sizesAttr}
        alt={alt}
        className={`w-full h-full transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ objectFit }}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        decoding="async"
      />

      {/* Loading indicator */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-sandstone-100/50">
          <div className="animate-spin text-2xl">🕉️</div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-sandstone-100">
          <div className="text-center text-charcoal-400">
            <div className="text-4xl mb-2">🏛️</div>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
