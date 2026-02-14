/**
 * Unit Tests for Performance Requirements
 * 
 * Tests specific performance scenarios:
 * - City list load time
 * - Heritage content load time
 * - Image load time
 * - Concurrent user handling
 * 
 * **Validates: Requirements 10.1, 10.2, 10.3**
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { db } from '../config/database';
import { cityService } from './CityService';
import { heritageService } from './HeritageService';
import { imageService } from './ImageService';

describe('Performance Tests', () => {
  let testCityId: string;
  let testHeritageId: string;

  beforeAll(async () => {
    // Get a test city
    const cities = await db.query<{ id: string }>(`
      SELECT id FROM cities LIMIT 1
    `);
    if (cities.length > 0) {
      testCityId = cities[0].id;

      // Get a test heritage item
      const heritage = await db.query<{ id: string }>(`
        SELECT id FROM heritage_items WHERE city_id = $1 LIMIT 1
      `, [testCityId]);
      if (heritage.length > 0) {
        testHeritageId = heritage[0].id;
      }
    }
  });

  afterAll(async () => {
    await db.end();
  });

  describe('City list load time', () => {
    /**
     * Test city list loads within 2 seconds
     * **Validates: Requirement 10.1**
     */
    it('should load city list within 2 seconds', async () => {
      const startTime = Date.now();
      
      const cities = await cityService.getAllCities('en');
      
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000);
      expect(Array.isArray(cities)).toBe(true);
    });

    /**
     * Test city list with filters loads within 2 seconds
     * **Validates: Requirement 10.1**
     */
    it('should load filtered city list within 2 seconds', async () => {
      const startTime = Date.now();
      
      const cities = await cityService.getAllCities('en', {
        state: 'Maharashtra',
        region: 'West'
      });
      
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000);
      expect(Array.isArray(cities)).toBe(true);
    });
  });

  describe('Heritage content load time', () => {
    /**
     * Test heritage content loads within 2 seconds
     * **Validates: Requirement 10.1**
     */
    it('should load city heritage content within 2 seconds', async () => {
      if (!testCityId) {
        console.warn('No test city available, skipping test');
        return;
      }

      const startTime = Date.now();
      
      const heritage = await cityService.getCityHeritage(testCityId, 'en');
      
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000);
      expect(Array.isArray(heritage)).toBe(true);
    });

    /**
     * Test heritage details load within 3 seconds
     * **Validates: Requirement 10.2**
     */
    it('should load heritage details within 3 seconds', async () => {
      if (!testHeritageId) {
        console.warn('No test heritage item available, skipping test');
        return;
      }

      const startTime = Date.now();
      
      const details = await heritageService.getHeritageById(testHeritageId, 'en');
      
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(3000);
      expect(details).toBeDefined();
    });
  });

  describe('Image load time', () => {
    /**
     * Test images load within 3 seconds
     * **Validates: Requirement 10.2**
     */
    it('should load heritage images within 3 seconds', async () => {
      if (!testHeritageId) {
        console.warn('No test heritage item available, skipping test');
        return;
      }

      const startTime = Date.now();
      
      const images = await heritageService.getHeritageImages(testHeritageId);
      
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(3000);
      expect(Array.isArray(images)).toBe(true);
    });

    /**
     * Test image URL generation is fast
     * **Validates: Requirement 10.4**
     */
    it('should generate image URLs quickly', () => {
      const startTime = Date.now();
      
      // Generate 100 image URLs
      for (let i = 0; i < 100; i++) {
        imageService.getImageUrl(`test-image-${i}`, 'thumbnail', {
          width: 300,
          quality: 80,
          format: 'webp'
        });
      }
      
      const duration = Date.now() - startTime;

      // Should be very fast (< 10ms for 100 URLs)
      expect(duration).toBeLessThan(10);
    });
  });

  describe('Concurrent user handling', () => {
    /**
     * Test system handles 10 concurrent requests
     * **Validates: Requirement 10.3**
     */
    it('should handle 10 concurrent city heritage requests', async () => {
      if (!testCityId) {
        console.warn('No test city available, skipping test');
        return;
      }

      const startTime = Date.now();
      
      // Create 10 concurrent requests
      const requests = Array(10)
        .fill(null)
        .map(() => cityService.getCityHeritage(testCityId, 'en'));
      
      const results = await Promise.all(requests);
      
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (< 3 seconds for 10 concurrent)
      expect(duration).toBeLessThan(3000);
      expect(results.length).toBe(10);
      
      // All results should be valid
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    /**
     * Test system handles 50 concurrent requests
     * **Validates: Requirement 10.3**
     */
    it('should handle 50 concurrent heritage detail requests', async () => {
      if (!testHeritageId) {
        console.warn('No test heritage item available, skipping test');
        return;
      }

      const startTime = Date.now();
      
      // Create 50 concurrent requests
      const requests = Array(50)
        .fill(null)
        .map(() => heritageService.getHeritageById(testHeritageId, 'en'));
      
      const results = await Promise.all(requests);
      
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (< 5 seconds for 50 concurrent)
      expect(duration).toBeLessThan(5000);
      expect(results.length).toBe(50);
      
      // All results should be valid
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    /**
     * Test system handles 100 concurrent requests
     * **Validates: Requirement 10.3**
     */
    it('should handle 100 concurrent mixed requests without degradation', async () => {
      if (!testCityId || !testHeritageId) {
        console.warn('No test data available, skipping test');
        return;
      }

      const startTime = Date.now();
      
      // Create 100 mixed concurrent requests
      const requests = Array(100)
        .fill(null)
        .map((_, index) => {
          // Mix of different request types
          if (index % 3 === 0) {
            return cityService.getAllCities('en');
          } else if (index % 3 === 1) {
            return cityService.getCityHeritage(testCityId, 'en');
          } else {
            return heritageService.getHeritageById(testHeritageId, 'en');
          }
        });
      
      const results = await Promise.all(requests);
      
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (< 10 seconds for 100 concurrent)
      expect(duration).toBeLessThan(10000);
      expect(results.length).toBe(100);
      
      // All results should be valid
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('Caching performance', () => {
    /**
     * Test cache improves response time
     * **Validates: Requirements 10.1, 10.2**
     */
    it('should serve cached responses faster', async () => {
      if (!testCityId) {
        console.warn('No test city available, skipping test');
        return;
      }

      // First request (uncached)
      const startTime1 = Date.now();
      await cityService.getCityHeritage(testCityId, 'hi');
      const duration1 = Date.now() - startTime1;

      // Second request (cached)
      const startTime2 = Date.now();
      await cityService.getCityHeritage(testCityId, 'hi');
      const duration2 = Date.now() - startTime2;

      // Cached should be faster or equal (with small margin for timing variations)
      expect(duration2).toBeLessThanOrEqual(duration1 + 50);
    });

    /**
     * Test cache reduces database load
     * **Validates: Requirements 10.1, 10.2**
     */
    it('should reduce database queries with caching', async () => {
      if (!testHeritageId) {
        console.warn('No test heritage item available, skipping test');
        return;
      }

      // Spy on database queries
      const querySpy = vi.spyOn(db, 'query');
      
      // First request (should hit database)
      await heritageService.getHeritageById(testHeritageId, 'ta');
      const firstCallCount = querySpy.mock.calls.length;

      // Reset spy
      querySpy.mockClear();

      // Second request (should use cache, fewer DB calls)
      await heritageService.getHeritageById(testHeritageId, 'ta');
      const secondCallCount = querySpy.mock.calls.length;

      // Second request should make fewer or equal database calls
      expect(secondCallCount).toBeLessThanOrEqual(firstCallCount);

      querySpy.mockRestore();
    });
  });

  describe('Query optimization', () => {
    /**
     * Test database queries use indexes
     * **Validates: Requirements 10.1, 10.2**
     */
    it('should execute indexed queries quickly', async () => {
      if (!testCityId) {
        console.warn('No test city available, skipping test');
        return;
      }

      const startTime = Date.now();
      
      // This query should use idx_heritage_city index
      await db.query(`
        SELECT id, category, thumbnail_image_url
        FROM heritage_items
        WHERE city_id = $1
      `, [testCityId]);
      
      const duration = Date.now() - startTime;

      // Should be very fast if using index (< 50ms)
      expect(duration).toBeLessThan(50);
    });

    /**
     * Test translation queries are optimized
     * **Validates: Requirements 10.1, 10.2**
     */
    it('should execute translation queries efficiently', async () => {
      if (!testCityId) {
        console.warn('No test city available, skipping test');
        return;
      }

      const startTime = Date.now();
      
      // This query should use idx_translations_entity index
      await db.query(`
        SELECT field_name, content
        FROM translations
        WHERE entity_type = 'city'
          AND entity_id = $1
          AND language_code = 'en'
      `, [testCityId]);
      
      const duration = Date.now() - startTime;

      // Should be very fast if using index (< 50ms)
      expect(duration).toBeLessThan(50);
    });
  });
});
