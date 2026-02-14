import { describe, it, expect, beforeEach } from 'vitest';
import { apiClient, isApiError, getApiErrorMessage } from '../services/apiClient';

/**
 * Error Handling Integration Tests
 * 
 * Tests error scenarios across the full stack
 * Validates error handling for network failures, invalid data, etc.
 */

describe('Error Handling Integration Tests', () => {
  beforeEach(() => {
    apiClient.setLanguage('en');
  });

  describe('404 Errors', () => {
    it('should handle non-existent city gracefully', async () => {
      const invalidCityId = '00000000-0000-0000-0000-000000000000';

      try {
        await apiClient.getCityHeritage(invalidCityId);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(404);
          expect(error.message).toBeDefined();
          expect(error.message.length).toBeGreaterThan(0);
        }
      }
    });

    it('should handle non-existent heritage item gracefully', async () => {
      const invalidHeritageId = '00000000-0000-0000-0000-000000000000';

      try {
        await apiClient.getHeritageDetail(invalidHeritageId);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(404);
          expect(error.message).toBeDefined();
        }
      }
    });

    it('should handle non-existent heritage images gracefully', async () => {
      const invalidHeritageId = '00000000-0000-0000-0000-000000000000';

      try {
        await apiClient.getHeritageImages(invalidHeritageId);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.status).toBe(404);
        }
      }
    });
  });

  describe('Invalid Input Handling', () => {
    it('should handle invalid language codes', async () => {
      // Set invalid language
      apiClient.setLanguage('invalid_language_code_xyz');

      // Should still work (fallback to English)
      const result = await apiClient.getCities();
      expect(result.cities).toBeDefined();
    });

    it('should handle empty search term', async () => {
      const result = await apiClient.getCities({ searchTerm: '' });
      expect(result.cities).toBeDefined();
    });

    it('should handle invalid state filter', async () => {
      const result = await apiClient.getCities({ state: 'NonExistentState' });
      expect(result.cities).toBeDefined();
      // Should return empty array or all cities
      expect(Array.isArray(result.cities)).toBe(true);
    });

    it('should handle invalid region filter', async () => {
      const result = await apiClient.getCities({ region: 'InvalidRegion' });
      expect(result.cities).toBeDefined();
      expect(Array.isArray(result.cities)).toBe(true);
    });

    it('should handle invalid category filter', async () => {
      // Get a valid city first
      const citiesResult = await apiClient.getCities();
      if (citiesResult.cities.length > 0) {
        const cityId = citiesResult.cities[0].id;

        const result = await apiClient.getCityHeritage(cityId, { 
          category: 'invalid_category' 
        });
        
        expect(result.heritageItems).toBeDefined();
        expect(Array.isArray(result.heritageItems)).toBe(true);
      }
    });
  });

  describe('Network Error Handling', () => {
    it('should handle timeout errors', async () => {
      // Create a client with very short timeout
      const originalTimeout = apiClient['client'].defaults.timeout;
      apiClient['client'].defaults.timeout = 1; // 1ms timeout

      try {
        await apiClient.getCities();
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        if (isApiError(error)) {
          expect(error.code).toBeDefined();
        }
      } finally {
        // Restore original timeout
        apiClient['client'].defaults.timeout = originalTimeout;
      }
    }, 30000);

    it('should provide user-friendly error messages', async () => {
      const invalidCityId = '00000000-0000-0000-0000-000000000000';

      try {
        await apiClient.getCityHeritage(invalidCityId);
      } catch (error) {
        const message = getApiErrorMessage(error);
        expect(message).toBeDefined();
        expect(message.length).toBeGreaterThan(0);
        expect(typeof message).toBe('string');
      }
    });
  });

  describe('Concurrent Request Error Handling', () => {
    it('should handle multiple failed requests', async () => {
      const invalidIds = [
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003',
      ];

      const requests = invalidIds.map(id => 
        apiClient.getCityHeritage(id).catch(error => error)
      );

      const results = await Promise.all(requests);

      // All should be errors
      results.forEach(result => {
        expect(isApiError(result)).toBe(true);
        if (isApiError(result)) {
          expect(result.status).toBe(404);
        }
      });
    });

    it('should handle mix of successful and failed requests', async () => {
      // Get a valid city
      const citiesResult = await apiClient.getCities();
      const validCityId = citiesResult.cities[0]?.id;

      if (validCityId) {
        const requests = [
          apiClient.getCityHeritage(validCityId),
          apiClient.getCityHeritage('00000000-0000-0000-0000-000000000000').catch(e => e),
          apiClient.getCities(),
        ];

        const results = await Promise.all(requests);

        // First should succeed
        expect(results[0]).toHaveProperty('city');
        expect(results[0]).toHaveProperty('heritageItems');

        // Second should be error
        expect(isApiError(results[1])).toBe(true);

        // Third should succeed
        expect(results[2]).toHaveProperty('cities');
      }
    });
  });

  describe('Error Recovery', () => {
    it('should recover from errors and continue working', async () => {
      // Make a failing request
      try {
        await apiClient.getCityHeritage('00000000-0000-0000-0000-000000000000');
      } catch (error) {
        expect(isApiError(error)).toBe(true);
      }

      // Make a successful request
      const result = await apiClient.getCities();
      expect(result.cities).toBeDefined();
      expect(result.cities.length).toBeGreaterThan(0);
    });

    it('should handle errors in different languages', async () => {
      const languages = ['en', 'hi', 'ta'];

      for (const lang of languages) {
        apiClient.setLanguage(lang);

        try {
          await apiClient.getCityHeritage('00000000-0000-0000-0000-000000000000');
          expect(true).toBe(false);
        } catch (error) {
          expect(isApiError(error)).toBe(true);
          if (isApiError(error)) {
            expect(error.status).toBe(404);
            expect(error.message).toBeDefined();
          }
        }
      }
    });
  });

  describe('Validation Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      // Try to get heritage with invalid ID format
      try {
        await apiClient.getCityHeritage('not-a-uuid');
      } catch (error) {
        expect(isApiError(error)).toBe(true);
        // Should get either 400 (validation error) or 404 (not found)
        if (isApiError(error)) {
          expect([400, 404]).toContain(error.status);
        }
      }
    });
  });

  describe('Error Message Consistency', () => {
    it('should provide consistent error structure', async () => {
      const testCases = [
        { fn: () => apiClient.getCityHeritage('00000000-0000-0000-0000-000000000000'), desc: 'Invalid city' },
        { fn: () => apiClient.getHeritageDetail('00000000-0000-0000-0000-000000000000'), desc: 'Invalid heritage' },
        { fn: () => apiClient.getHeritageImages('00000000-0000-0000-0000-000000000000'), desc: 'Invalid images' },
      ];

      for (const testCase of testCases) {
        try {
          await testCase.fn();
          expect(true).toBe(false);
        } catch (error) {
          expect(isApiError(error)).toBe(true);
          if (isApiError(error)) {
            expect(error).toHaveProperty('message');
            expect(error).toHaveProperty('status');
            expect(typeof error.message).toBe('string');
            expect(typeof error.status).toBe('number');
          }
        }
      }
    });
  });
});
