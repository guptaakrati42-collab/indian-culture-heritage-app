/**
 * Property-Based Tests for Performance Requirements
 * 
 * Property 15: Response time requirements
 * **Validates: Requirements 10.1, 10.2**
 * 
 * For any valid city ID and heritage ID, the system should:
 * - Load city heritage content within 2 seconds (Requirement 10.1)
 * - Load heritage details and images within 3 seconds (Requirement 10.2)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fc from 'fast-check';
import { db } from '../config/database';
import { cityService } from './CityService';
import { heritageService } from './HeritageService';

describe('Property 15: Response time requirements', () => {
  let testCityIds: string[] = [];
  let testHeritageIds: string[] = [];

  beforeAll(async () => {
    // Get sample city IDs for testing
    const cities = await db.query<{ id: string }>(`
      SELECT id FROM cities LIMIT 5
    `);
    testCityIds = cities.map(c => c.id);

    // Get sample heritage IDs for testing
    if (testCityIds.length > 0) {
      const heritage = await db.query<{ id: string }>(`
        SELECT id FROM heritage_items 
        WHERE city_id = ANY($1)
        LIMIT 10
      `, [testCityIds]);
      testHeritageIds = heritage.map(h => h.id);
    }
  });

  afterAll(async () => {
    await db.end();
  });

  /**
   * Property 15.1: City heritage content loads within 2 seconds
   * **Validates: Requirement 10.1**
   */
  it('should load city heritage content within 2 seconds for any valid city', async () => {
    if (testCityIds.length === 0) {
      console.warn('No test cities available, skipping performance test');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testCityIds),
        fc.constantFrom('en', 'hi', 'ta', 'bn'),
        async (cityId, language) => {
          const startTime = Date.now();
          
          // Fetch city heritage
          const heritage = await cityService.getCityHeritage(cityId, language);
          
          const endTime = Date.now();
          const duration = endTime - startTime;

          // Should complete within 2000ms (2 seconds)
          expect(duration).toBeLessThan(2000);
          
          // Should return valid data
          expect(Array.isArray(heritage)).toBe(true);
          
          return true;
        }
      ),
      {
        numRuns: 20, // Run 20 times to test performance consistency
        verbose: true
      }
    );
  });

  /**
   * Property 15.2: Heritage details and images load within 3 seconds
   * **Validates: Requirement 10.2**
   */
  it('should load heritage details and images within 3 seconds for any valid heritage item', async () => {
    if (testHeritageIds.length === 0) {
      console.warn('No test heritage items available, skipping performance test');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testHeritageIds),
        fc.constantFrom('en', 'hi', 'ta', 'bn'),
        async (heritageId, language) => {
          const startTime = Date.now();
          
          // Fetch heritage details and images in parallel
          const [details, images] = await Promise.all([
            heritageService.getHeritageById(heritageId, language),
            heritageService.getHeritageImages(heritageId)
          ]);
          
          const endTime = Date.now();
          const duration = endTime - startTime;

          // Should complete within 3000ms (3 seconds)
          expect(duration).toBeLessThan(3000);
          
          // Should return valid data
          expect(details).toBeDefined();
          expect(Array.isArray(images)).toBe(true);
          
          return true;
        }
      ),
      {
        numRuns: 20, // Run 20 times to test performance consistency
        verbose: true
      }
    );
  });

  /**
   * Property 15.3: Cached responses are faster than uncached
   * **Validates: Requirements 10.1, 10.2**
   */
  it('should serve cached responses faster than initial requests', async () => {
    if (testCityIds.length === 0 || testHeritageIds.length === 0) {
      console.warn('No test data available, skipping cache performance test');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testCityIds),
        fc.constantFrom(...testHeritageIds),
        fc.constantFrom('en', 'hi'),
        async (cityId, heritageId, language) => {
          // First request (uncached)
          const startTime1 = Date.now();
          await cityService.getCityHeritage(cityId, language);
          const duration1 = Date.now() - startTime1;

          // Second request (should be cached)
          const startTime2 = Date.now();
          await cityService.getCityHeritage(cityId, language);
          const duration2 = Date.now() - startTime2;

          // Cached request should be faster or equal
          // Allow some margin for timing variations
          expect(duration2).toBeLessThanOrEqual(duration1 + 50);
          
          // Test heritage caching
          const startTime3 = Date.now();
          await heritageService.getHeritageById(heritageId, language);
          const duration3 = Date.now() - startTime3;

          const startTime4 = Date.now();
          await heritageService.getHeritageById(heritageId, language);
          const duration4 = Date.now() - startTime4;

          expect(duration4).toBeLessThanOrEqual(duration3 + 50);
          
          return true;
        }
      ),
      {
        numRuns: 10,
        verbose: true
      }
    );
  });

  /**
   * Property 15.4: Response times remain consistent under load
   * **Validates: Requirements 10.1, 10.2, 10.3**
   */
  it('should maintain consistent response times for concurrent requests', async () => {
    if (testCityIds.length === 0) {
      console.warn('No test cities available, skipping concurrent load test');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testCityIds),
        fc.constantFrom('en', 'hi', 'ta'),
        fc.integer({ min: 5, max: 20 }), // Number of concurrent requests
        async (cityId, language, concurrentRequests) => {
          const startTime = Date.now();
          
          // Create array of concurrent requests
          const requests = Array(concurrentRequests)
            .fill(null)
            .map(() => cityService.getCityHeritage(cityId, language));
          
          // Execute all requests concurrently
          const results = await Promise.all(requests);
          
          const endTime = Date.now();
          const duration = endTime - startTime;

          // All requests should complete within reasonable time
          // Allow 2 seconds base + 100ms per concurrent request
          const maxDuration = 2000 + (concurrentRequests * 100);
          expect(duration).toBeLessThan(maxDuration);
          
          // All results should be valid and identical
          expect(results.length).toBe(concurrentRequests);
          results.forEach(result => {
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual(results[0]); // All should return same data
          });
          
          return true;
        }
      ),
      {
        numRuns: 10,
        verbose: true
      }
    );
  });

  /**
   * Property 15.5: Database query performance is optimized
   * **Validates: Requirements 10.1, 10.2**
   */
  it('should execute database queries efficiently with proper indexing', async () => {
    if (testCityIds.length === 0) {
      console.warn('No test cities available, skipping query performance test');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testCityIds),
        async (cityId) => {
          // Test that queries use indexes by checking execution time
          const startTime = Date.now();
          
          // This query should use the idx_heritage_city index
          await db.query(`
            SELECT id, category, thumbnail_image_url
            FROM heritage_items
            WHERE city_id = $1
          `, [cityId]);
          
          const duration = Date.now() - startTime;

          // Query should complete very quickly (< 100ms) if using index
          expect(duration).toBeLessThan(100);
          
          return true;
        }
      ),
      {
        numRuns: 20,
        verbose: true
      }
    );
  });
});
