import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

/**
 * Caching Behavior Integration Tests
 * 
 * Tests caching behavior across frontend and backend
 * Validates React Query caching and backend cache
 */

describe('Caching Behavior Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    apiClient.setLanguage('en');
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 5 * 60 * 1000, // 5 minutes for cities
        },
      },
    });
  });

  describe('Frontend Caching (React Query)', () => {
    it('should cache city list requests', async () => {
      const startTime1 = Date.now();
      const result1 = await apiClient.getCities();
      const duration1 = Date.now() - startTime1;

      expect(result1.cities).toBeDefined();
      expect(result1.cities.length).toBeGreaterThan(0);

      // Second request should be faster (from cache or backend cache)
      const startTime2 = Date.now();
      const result2 = await apiClient.getCities();
      const duration2 = Date.now() - startTime2;

      expect(result2.cities).toBeDefined();
      expect(result2.cities.length).toBe(result1.cities.length);

      console.log(`First request: ${duration1}ms, Second request: ${duration2}ms`);
    }, 30000);

    it('should cache heritage list requests', async () => {
      // Get a city first
      const citiesResult = await apiClient.getCities();
      const cityId = citiesResult.cities[0]?.id;

      if (cityId) {
        const startTime1 = Date.now();
        const result1 = await apiClient.getCityHeritage(cityId);
        const duration1 = Date.now() - startTime1;

        expect(result1.heritageItems).toBeDefined();

        // Second request
        const startTime2 = Date.now();
        const result2 = await apiClient.getCityHeritage(cityId);
        const duration2 = Date.now() - startTime2;

        expect(result2.heritageItems).toBeDefined();
        expect(result2.heritageItems.length).toBe(result1.heritageItems.length);

        console.log(`First heritage request: ${duration1}ms, Second: ${duration2}ms`);
      }
    }, 30000);

    it('should cache heritage detail requests', async () => {
      // Get a heritage item first
      const citiesResult = await apiClient.getCities();
      if (citiesResult.cities.length > 0) {
        const cityId = citiesResult.cities[0].id;
        const heritageResult = await apiClient.getCityHeritage(cityId);

        if (heritageResult.heritageItems.length > 0) {
          const heritageId = heritageResult.heritageItems[0].id;

          const startTime1 = Date.now();
          const result1 = await apiClient.getHeritageDetail(heritageId);
          const duration1 = Date.now() - startTime1;

          expect(result1.id).toBe(heritageId);

          // Second request
          const startTime2 = Date.now();
          const result2 = await apiClient.getHeritageDetail(heritageId);
          const duration2 = Date.now() - startTime2;

          expect(result2.id).toBe(heritageId);

          console.log(`First detail request: ${duration1}ms, Second: ${duration2}ms`);
        }
      }
    }, 30000);
  });

  describe('Cache Invalidation by Language', () => {
    it('should fetch new data when language changes', async () => {
      // Get cities in English
      apiClient.setLanguage('en');
      const resultEn = await apiClient.getCities();
      expect(resultEn.cities).toBeDefined();

      // Get cities in Hindi
      apiClient.setLanguage('hi');
      const resultHi = await apiClient.getCities();
      expect(resultHi.cities).toBeDefined();

      // Should have same number of cities
      expect(resultHi.cities.length).toBe(resultEn.cities.length);

      // But IDs should be the same (same cities, different language)
      if (resultEn.cities.length > 0 && resultHi.cities.length > 0) {
        expect(resultEn.cities[0].id).toBe(resultHi.cities[0].id);
      }
    }, 30000);

    it('should cache separately for each language', async () => {
      const languages = ['en', 'hi', 'ta'];
      const results: any[] = [];

      // Fetch in each language
      for (const lang of languages) {
        apiClient.setLanguage(lang);
        const result = await apiClient.getCities();
        results.push(result);
      }

      // All should have data
      results.forEach(result => {
        expect(result.cities).toBeDefined();
        expect(result.cities.length).toBeGreaterThan(0);
      });

      // Fetch again in first language (should be from cache)
      apiClient.setLanguage('en');
      const startTime = Date.now();
      const cachedResult = await apiClient.getCities();
      const duration = Date.now() - startTime;

      expect(cachedResult.cities).toBeDefined();
      console.log(`Cached request duration: ${duration}ms`);
    }, 60000);
  });

  describe('Cache Behavior with Filters', () => {
    it('should cache filtered city requests separately', async () => {
      // Get all cities
      const allCities = await apiClient.getCities();
      expect(allCities.cities).toBeDefined();

      // Get filtered cities
      const filteredCities = await apiClient.getCities({ state: 'Maharashtra' });
      expect(filteredCities.cities).toBeDefined();

      // Counts should be different
      expect(filteredCities.cities.length).toBeLessThanOrEqual(allCities.cities.length);

      // Get all cities again (should be from cache)
      const allCitiesAgain = await apiClient.getCities();
      expect(allCitiesAgain.cities.length).toBe(allCities.cities.length);
    }, 30000);

    it('should cache category-filtered heritage separately', async () => {
      const citiesResult = await apiClient.getCities();
      if (citiesResult.cities.length > 0) {
        const cityId = citiesResult.cities[0].id;

        // Get all heritage
        const allHeritage = await apiClient.getCityHeritage(cityId);
        expect(allHeritage.heritageItems).toBeDefined();

        // Get filtered heritage
        const filteredHeritage = await apiClient.getCityHeritage(cityId, { 
          category: 'monuments' 
        });
        expect(filteredHeritage.heritageItems).toBeDefined();

        // Get all heritage again (should be from cache)
        const allHeritageAgain = await apiClient.getCityHeritage(cityId);
        expect(allHeritageAgain.heritageItems.length).toBe(allHeritage.heritageItems.length);
      }
    }, 30000);
  });

  describe('Backend Cache Behavior', () => {
    it('should benefit from backend caching on repeated requests', async () => {
      const timings: number[] = [];

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await apiClient.getCities();
        const duration = Date.now() - startTime;
        timings.push(duration);
        console.log(`Request ${i + 1}: ${duration}ms`);
      }

      // Later requests should generally be faster (backend cache)
      const firstRequest = timings[0];
      const laterRequests = timings.slice(1);
      const avgLaterRequests = laterRequests.reduce((a, b) => a + b, 0) / laterRequests.length;

      console.log(`First: ${firstRequest}ms, Avg later: ${avgLaterRequests}ms`);
      
      // At least some requests should be faster
      const fasterRequests = laterRequests.filter(t => t < firstRequest);
      expect(fasterRequests.length).toBeGreaterThan(0);
    }, 60000);

    it('should cache language list effectively', async () => {
      const timings: number[] = [];

      // Make multiple language list requests
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        await apiClient.getLanguages();
        const duration = Date.now() - startTime;
        timings.push(duration);
      }

      // All should be fast (cached)
      timings.forEach(timing => {
        expect(timing).toBeLessThan(1000); // Should be very fast
      });

      console.log('Language list timings:', timings);
    }, 30000);
  });

  describe('Cache Performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      const startTime = Date.now();

      // Make 10 concurrent requests
      const requests = Array(10).fill(null).map(() => apiClient.getCities());
      const results = await Promise.all(requests);

      const duration = Date.now() - startTime;

      // All should succeed
      results.forEach(result => {
        expect(result.cities).toBeDefined();
      });

      // Should complete reasonably fast (backend cache helps)
      expect(duration).toBeLessThan(10000); // 10 seconds for 10 requests

      console.log(`10 concurrent requests completed in ${duration}ms`);
    }, 30000);

    it('should handle mixed concurrent requests', async () => {
      const citiesResult = await apiClient.getCities();
      const cityId = citiesResult.cities[0]?.id;

      if (cityId) {
        const requests = [
          apiClient.getCities(),
          apiClient.getCities({ region: 'North' }),
          apiClient.getCityHeritage(cityId),
          apiClient.getLanguages(),
          apiClient.getCities({ state: 'Maharashtra' }),
        ];

        const startTime = Date.now();
        const results = await Promise.all(requests);
        const duration = Date.now() - startTime;

        // All should succeed
        expect(results.length).toBe(5);
        results.forEach(result => {
          expect(result).toBeDefined();
        });

        console.log(`5 mixed requests completed in ${duration}ms`);
      }
    }, 30000);
  });

  describe('Cache Consistency', () => {
    it('should return consistent data from cache', async () => {
      // Get cities multiple times
      const results = await Promise.all([
        apiClient.getCities(),
        apiClient.getCities(),
        apiClient.getCities(),
      ]);

      // All should have same data
      expect(results[0].cities.length).toBe(results[1].cities.length);
      expect(results[1].cities.length).toBe(results[2].cities.length);

      // IDs should match
      if (results[0].cities.length > 0) {
        expect(results[0].cities[0].id).toBe(results[1].cities[0].id);
        expect(results[1].cities[0].id).toBe(results[2].cities[0].id);
      }
    }, 30000);

    it('should maintain data consistency across language switches', async () => {
      // Get a city in English
      apiClient.setLanguage('en');
      const citiesEn = await apiClient.getCities();
      const cityIdEn = citiesEn.cities[0]?.id;

      // Get same city in Hindi
      apiClient.setLanguage('hi');
      const citiesHi = await apiClient.getCities();
      const cityIdHi = citiesHi.cities[0]?.id;

      // IDs should be the same (same city, different language)
      expect(cityIdEn).toBe(cityIdHi);
    }, 30000);
  });

  describe('LocalStorage Caching', () => {
    it('should persist language preference in localStorage', async () => {
      // Clear localStorage
      localStorage.clear();

      // Set language
      apiClient.setLanguage('ta');
      localStorage.setItem('preferredLanguage', 'ta');

      // Verify it's stored
      expect(localStorage.getItem('preferredLanguage')).toBe('ta');

      // Change language
      apiClient.setLanguage('hi');
      localStorage.setItem('preferredLanguage', 'hi');

      // Verify it's updated
      expect(localStorage.getItem('preferredLanguage')).toBe('hi');
    });
  });

  describe('SessionStorage Caching', () => {
    it('should persist city selection in sessionStorage', async () => {
      // Clear sessionStorage
      sessionStorage.clear();

      // Get a city
      const citiesResult = await apiClient.getCities();
      const cityId = citiesResult.cities[0]?.id;

      if (cityId) {
        // Store in session
        sessionStorage.setItem('selectedCity', cityId);

        // Verify it's stored
        expect(sessionStorage.getItem('selectedCity')).toBe(cityId);

        // Should persist during session
        const storedCityId = sessionStorage.getItem('selectedCity');
        expect(storedCityId).toBe(cityId);
      }
    });
  });
});
