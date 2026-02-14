/**
 * Image Optimization Utilities
 * Provides utilities for responsive images, lazy loading, and WebP support
 */

export interface ImageSrcSet {
  src: string;
  srcSet: string;
  sizes: string;
}

/**
 * Generate responsive image srcset for different screen sizes
 * @param baseUrl - Base image URL
 * @param widths - Array of widths to generate
 * @returns srcSet string
 */
export function generateSrcSet(baseUrl: string, widths: number[] = [320, 640, 960, 1280, 1920]): string {
  return widths
    .map(width => `${baseUrl}?w=${width} ${width}w`)
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 * @param breakpoints - Object mapping breakpoints to sizes
 * @returns sizes string
 */
export function generateSizes(breakpoints?: Record<string, string>): string {
  const defaultBreakpoints = {
    '(max-width: 640px)': '100vw',
    '(max-width: 1024px)': '50vw',
    '(max-width: 1280px)': '33vw',
    default: '25vw'
  };

  const bp = breakpoints || defaultBreakpoints;
  const entries = Object.entries(bp);
  const mediaQueries = entries
    .filter(([key]) => key !== 'default')
    .map(([query, size]) => `${query} ${size}`);
  
  const defaultSize = bp.default || '100vw';
  return [...mediaQueries, defaultSize].join(', ');
}

/**
 * Check if browser supports WebP format
 * @returns Promise<boolean>
 */
export async function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  // Check if already cached
  const cached = sessionStorage.getItem('webp-support');
  if (cached !== null) {
    return cached === 'true';
  }

  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      const support = webP.height === 2;
      sessionStorage.setItem('webp-support', String(support));
      resolve(support);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Get optimized image URL with WebP support
 * @param url - Original image URL
 * @param options - Optimization options
 * @returns Optimized image URL
 */
export async function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): Promise<string> {
  const { width, quality = 80, format } = options;
  
  // Check WebP support
  const webpSupported = await supportsWebP();
  const targetFormat = format || (webpSupported ? 'webp' : 'jpg');
  
  // Build query parameters
  const params = new URLSearchParams();
  if (width) params.append('w', String(width));
  params.append('q', String(quality));
  params.append('fm', targetFormat);
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
}

/**
 * Preload critical images
 * @param urls - Array of image URLs to preload
 */
export function preloadImages(urls: string[]): void {
  if (typeof window === 'undefined') return;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Get placeholder image data URL
 * @param width - Placeholder width
 * @param height - Placeholder height
 * @param text - Optional text to display
 * @returns Data URL for placeholder
 */
export function getPlaceholderImage(width: number = 400, height: number = 300, text: string = '🏛️'): string {
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"%3E%3Crect fill="%23F4E4BC" width="${width}" height="${height}"/%3E%3Ctext fill="%2336454F" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;
}

/**
 * Calculate blur hash placeholder (simplified version)
 * @param imageUrl - Image URL
 * @returns Base64 encoded tiny placeholder
 */
export function generateBlurPlaceholder(imageUrl: string): string {
  // In a real implementation, this would generate a blur hash
  // For now, return a simple gradient placeholder
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="30"%3E%3Cdefs%3E%3ClinearGradient id="g"%3E%3Cstop offset="0%25" stop-color="%23F4E4BC"/%3E%3Cstop offset="100%25" stop-color="%23E6D5A8"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="40" height="30" fill="url(%23g)"/%3E%3C/svg%3E';
}

/**
 * Lazy load image with Intersection Observer
 * @param img - Image element
 * @param src - Image source URL
 * @param options - Intersection Observer options
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  options: IntersectionObserverInit = {}
): () => void {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        target.src = src;
        observer.unobserve(target);
      }
    });
  }, defaultOptions);

  observer.observe(img);

  // Return cleanup function
  return () => observer.disconnect();
}

/**
 * Get CDN URL with optimizations
 * @param url - Original URL
 * @param cdnBase - CDN base URL
 * @returns CDN-optimized URL
 */
export function getCDNUrl(url: string, cdnBase?: string): string {
  if (!cdnBase || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  
  // If URL is already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Construct CDN URL
  return `${cdnBase}${url.startsWith('/') ? '' : '/'}${url}`;
}
