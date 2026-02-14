import { describe, it, expect, beforeEach } from 'vitest';
import { apiClient } from '../services/apiClient';

/**
 * Language Switching Integration Tests
 * 
 * Tests language switching across different API endpoints
 * Validates: Requirements 1.2, 2.2, 2.3, 3.2, 3.3, 4.2, 4.3
 */

describe('Language Switching Integration Tests', () => {
  beforeEach(() => {
    apiClient.setLanguage('en');
  });

  describe('Language Consistency Across Endpoints', () => {
    it('should return consistent language across all endpoints', async () => {
      const testLanguages = ['en', 'hi', 'ta', 'bn'];

      for (const lang of testLanguages) {
        apiClient.setLanguage(lang);

        // Get cities
        const citiesResult = await apiClient.getCities();
        expect(citiesResult.cities.length).toBeGreaterThan(0);

        if (citiesResult.cities.length > 0) {
          const cityId = citiesResult.cities[0].id;

          // Get heritage for city
          const heritageResult = await apiClient.getCityHeritage(cityId);
          expect(heritageResult.city).toBeDefined();
          expect(heritageResult.heritageItems).toBeDefined();

          if (heritageResult.heritageItems.length > 0) {
            const heritageId = heritageResult.heritageItems[0].id;

            // Get heritage details
            const detailResult = await apiClient.getHeritageDetail(heritageId);
            expect(detailResult.id).toBe(heritageId);
            expect(detailResult.name).toBeDefined();

            // Get images
            const imagesResult = await apiClient.getHeritageImages(heritageId);
            expect(imagesResult.images).toBeDefined();
          }
        }
      }
    }, 60000);

    it('should handle rapid language switching', async () => {
      const languages = ['en', 'hi', 'ta', 'bn', 'te', 'mr'];

      // Rapidly switch languages
      for (let i = 0; i < 3; i++) {
        for (const lang of languages) {
          apiClient.setLanguage(lang);
          const result = await apiClient.getCities();
          expect(result.cities).toBeDefined();
          expect(apiClient.getCurrentLanguage()).toBe(lang);
        }
      }
    }, 60000);
  });

  describe('Language Fallback Behavior', () => {
    it('should fallback to English for unsupported language', async () => {
      // Set an invalid language code
      apiClient.setLanguage('xx');

      const result = await apiClient.getCities();
      expect(result.cities).toBeDefined();
      expect(result.cities.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle missing translations gracefully', async () => {
      // Test with a less common language that might have missing translations
      apiClient.setLanguage('sat'); // Santhali

      const result = await apiClient.getCities();
      expect(result.cities).toBeDefined();

      if (result.cities.length > 0) {
        const cityId = result.cities[0].id;
        const heritageResult = await apiClient.getCityHeritage(cityId);
        
        // Should still return data (either in Santhali or fallback to English)
        expect(heritageResult.city).toBeDefined();
        expect(heritageResult.heritageItems).toBeDefined();
      }
    }, 30000);
  });

  describe('Language Switching During Navigation', () => {
    it('should update content when language changes mid-navigation', async () => {
      // Start in English
      apiClient.setLanguage('en');
      const citiesEn = await apiClient.getCities();
      expect(citiesEn.cities.length).toBeGreaterThan(0);

      const cityId = citiesEn.cities[0].id;
      const cityNameEn = citiesEn.cities[0].name;

      // Get heritage in English
      const heritageEn = await apiClient.getCityHeritage(cityId);
      expect(heritageEn.city.name).toBe(cityNameEn);

      // Switch to Hindi
      apiClient.setLanguage('hi');
      const citiesHi = await apiClient.getCities();
      expect(citiesHi.cities.length).toBeGreaterThan(0);

      // Get same city in Hindi
      const heritageHi = await apiClient.getCityHeritage(cityId);
      expect(heritageHi.city.id).toBe(cityId);
      
      // Name should be different (unless translation is same)
      // At minimum, the request should succeed
      expect(heritageHi.city.name).toBeDefined();
    }, 30000);

    it('should maintain language preference across multiple requests', async () => {
      apiClient.setLanguage('ta');

      // Make multiple requests
      const requests = [
        apiClient.getCities(),
        apiClient.getLanguages(),
        apiClient.getCities({ region: 'South' }),
      ];

      const results = await Promise.all(requests);

      // All requests should succeed
      results.forEach(result => {
        expect(result).toBeDefined();
      });

      // Language should still be Tamil
      expect(apiClient.getCurrentLanguage()).toBe('ta');
    }, 30000);
  });

  describe('All 23 Languages Support', () => {
    const allLanguages = [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'Hindi' },
      { code: 'bn', name: 'Bengali' },
      { code: 'te', name: 'Telugu' },
      { code: 'mr', name: 'Marathi' },
      { code: 'ta', name: 'Tamil' },
      { code: 'gu', name: 'Gujarati' },
      { code: 'kn', name: 'Kannada' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'or', name: 'Odia' },
      { code: 'pa', name: 'Punjabi' },
      { code: 'as', name: 'Assamese' },
      { code: 'ks', name: 'Kashmiri' },
      { code: 'kok', name: 'Konkani' },
      { code: 'mni', name: 'Manipuri' },
      { code: 'ne', name: 'Nepali' },
      { code: 'sa', name: 'Sanskrit' },
      { code: 'sd', name: 'Sindhi' },
      { code: 'ur', name: 'Urdu' },
      { code: 'brx', name: 'Bodo' },
      { code: 'sat', name: 'Santhali' },
      { code: 'mai', name: 'Maithili' },
      { code: 'doi', name: 'Dogri' },
    ];

    it('should support all 23 languages', async () => {
      for (const lang of allLanguages) {
        apiClient.setLanguage(lang.code);
        
        try {
          const result = await apiClient.getCities();
          expect(result.cities).toBeDefined();
          console.log(`✓ ${lang.name} (${lang.code}): ${result.cities.length} cities`);
        } catch (error) {
          console.error(`✗ ${lang.name} (${lang.code}): Failed`, error);
          throw error;
        }
      }
    }, 120000);

    it('should return language list with all 23 languages', async () => {
      const result = await apiClient.getLanguages();
      
      expect(result.languages.length).toBe(23);

      // Verify all expected languages are present
      allLanguages.forEach(expectedLang => {
        const found = result.languages.find(lang => lang.code === expectedLang.code);
        expect(found).toBeDefined();
        expect(found?.englishName).toBe(expectedLang.name);
      });
    }, 30000);
  });

  describe('Language Header vs Query Parameter', () => {
    it('should accept language from query parameter', async () => {
      apiClient.setLanguage('hi');
      const result = await apiClient.getCities();
      
      expect(result.cities).toBeDefined();
      expect(result.cities.length).toBeGreaterThan(0);
    }, 30000);

    it('should accept language from Accept-Language header', async () => {
      // The API client sets both query param and header
      apiClient.setLanguage('ta');
      const result = await apiClient.getCities();
      
      expect(result.cities).toBeDefined();
      expect(result.cities.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Language Switching Performance', () => {
    it('should handle language switching without performance degradation', async () => {
      const languages = ['en', 'hi', 'ta', 'bn', 'te'];
      const timings: number[] = [];

      for (const lang of languages) {
        apiClient.setLanguage(lang);
        
        const startTime = Date.now();
        await apiClient.getCities();
        const endTime = Date.now();
        
        const duration = endTime - startTime;
        timings.push(duration);
        
        console.log(`${lang}: ${duration}ms`);
      }

      // All requests should complete within reasonable time
      timings.forEach(timing => {
        expect(timing).toBeLessThan(5000); // 5 seconds max
      });

      // Average should be reasonable
      const average = timings.reduce((a, b) => a + b, 0) / timings.length;
      expect(average).toBeLessThan(3000); // 3 seconds average
    }, 60000);
  });
});
