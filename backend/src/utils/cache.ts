import NodeCache from 'node-cache';
import logger from '../config/logger';

// Cache configuration
const CACHE_TTL = 900; // 15 minutes in seconds
const CACHE_CHECK_PERIOD = 120; // Check for expired keys every 2 minutes

/**
 * Cache utility class for managing in-memory cache
 */
class CacheManager {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: CACHE_TTL,
      checkperiod: CACHE_CHECK_PERIOD,
      useClones: false, // Don't clone objects for better performance
    });

    // Log cache statistics periodically
    this.cache.on('expired', (key) => {
      logger.debug(`Cache key expired: ${key}`);
    });

    this.cache.on('flush', () => {
      logger.info('Cache flushed');
    });
  }

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value or undefined if not found
   */
  get<T>(key: string): T | undefined {
    try {
      const value = this.cache.get<T>(key);
      if (value !== undefined) {
        logger.debug(`Cache hit: ${key}`);
      } else {
        logger.debug(`Cache miss: ${key}`);
      }
      return value;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Optional TTL in seconds (overrides default)
   * @returns Success boolean
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const success = this.cache.set(key, value, ttl || CACHE_TTL);
      if (success) {
        logger.debug(`Cache set: ${key} (TTL: ${ttl || CACHE_TTL}s)`);
      }
      return success;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param key Cache key or array of keys
   * @returns Number of deleted entries
   */
  del(key: string | string[]): number {
    try {
      const deleted = this.cache.del(key);
      logger.debug(`Cache deleted: ${Array.isArray(key) ? key.join(', ') : key}`);
      return deleted;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Invalidate cache entries by pattern
   * @param pattern String pattern to match keys (supports wildcards)
   */
  invalidatePattern(pattern: string): number {
    try {
      const keys = this.cache.keys();
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      const matchingKeys = keys.filter((key) => regex.test(key));
      
      if (matchingKeys.length > 0) {
        const deleted = this.cache.del(matchingKeys);
        logger.info(`Cache invalidated ${deleted} keys matching pattern: ${pattern}`);
        return deleted;
      }
      return 0;
    } catch (error) {
      logger.error(`Cache invalidate pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists in cache
   * @param key Cache key
   * @returns Boolean indicating if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Flush all cache entries
   */
  flush(): void {
    this.cache.flushAll();
    logger.info('All cache entries flushed');
  }

  /**
   * Get cache statistics
   * @returns Cache statistics object
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Get all cache keys
   * @returns Array of cache keys
   */
  keys(): string[] {
    return this.cache.keys();
  }
}

/**
 * Generate cache key for cities list
 */
export const generateCitiesKey = (
  language: string,
  filters?: { state?: string; region?: string; search?: string }
): string => {
  const parts = ['cities', language];
  if (filters?.state) parts.push(`state:${filters.state}`);
  if (filters?.region) parts.push(`region:${filters.region}`);
  if (filters?.search) parts.push(`search:${filters.search}`);
  return parts.join(':');
};

/**
 * Generate cache key for city heritage
 */
export const generateCityHeritageKey = (
  cityId: string,
  language: string,
  category?: string
): string => {
  const parts = ['city', cityId, 'heritage', language];
  if (category) parts.push(`category:${category}`);
  return parts.join(':');
};

/**
 * Generate cache key for heritage details
 */
export const generateHeritageKey = (
  heritageId: string,
  language: string
): string => {
  return `heritage:${heritageId}:${language}`;
};

/**
 * Generate cache key for heritage images
 */
export const generateHeritageImagesKey = (heritageId: string): string => {
  return `heritage:${heritageId}:images`;
};

/**
 * Generate cache key for languages list
 */
export const generateLanguagesKey = (): string => {
  return 'languages:all';
};

// Export singleton instance
export const cache = new CacheManager();
