import { describe, it, expect, beforeAll } from 'vitest';
import { apiClient } from './apiClient';

/**
 * Integration tests for API client
 * These tests verify that the frontend can communicate with the backend
 * 
 * Prerequisites:
 * - Backend server must be running on http://localhost:3000
 * - Database must be seeded with test data
 */

describe('API Client Integration Tests', () => {
  beforeAll(() => {
    // Set default language
    apiClient.setLanguage('en');
  });

  describe('Health Check', () => {
    it('should successfully connect to backend', async () => {
      const result = await apiClient.healthCheck();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result.status).toBe('ok');
    });
  });

  describe('Languages API', () => {
    it('should fetch supported languages', async () => {
      const result = await apiClient.getLanguages();
      
      expect(result).toHaveProperty('languages');
      expect(Array.isArray(result.languages)).toBe(true);
      expect(result.languages.length).toBeGreaterThan(0);
      
      // Verify language structure
      const language = result.languages[0];
      expect(language).toHaveProperty('code');
      expect(language).toHaveProperty('name');
      expect(language).toHaveProperty('englishName');
      
      // Verify English is included
      const english = result.languages.find(lang => lang.code === 'en');
      expect(english).toBeDefined();
      expect(english?.englishName).toBe('English');
    });
  });

  describe('Cities API', () => {
    it('should fetch cities in English', async () => {
      apiClient.setLanguage('en');
      const result = await apiClient.getCities();
      
      expect(result).toHaveProperty('cities');
      expect(Array.isArray(result.cities)).toBe(true);
      expect(result.cities.length).toBeGreaterThan(0);
      
      // Verify city structure
      const city = result.cities[0];
      expect(city).toHaveProperty('id');
      expect(city).toHaveProperty('name');
      expect(city).toHaveProperty('state');
      expect(city).toHaveProperty('region');
    });

    it('should fetch cities in Hindi', async () => {
      apiClient.setLanguage('hi');
      const result = await apiClient.getCities();
      
      expect(result).toHaveProperty('cities');
      expect(Array.isArray(result.cities)).toBe(true);
      expect(result.cities.length).toBeGreaterThan(0);
    });

    it('should filter cities by state', async () => {
      apiClient.setLanguage('en');
      const result = await apiClient.getCities({ state: 'Maharashtra' });
      
      expect(result).toHaveProperty('cities');
      expect(Array.isArray(result.cities)).toBe(true);
      
      // All cities should be from Maharashtra
      result.cities.forEach(city => {
        expect(city.state).toBe('Maharashtra');
      });
    });

    it('should filter cities by region', async () => {
      apiClient.setLanguage('en');
      const result = await apiClient.getCities({ region: 'West' });
      
      expect(result).toHaveProperty('cities');
      expect(Array.isArray(result.cities)).toBe(true);
      
      // All cities should be from West region
      result.cities.forEach(city => {
        expect(city.region).toBe('West');
      });
    });

    it('should search cities by name', async () => {
      apiClient.setLanguage('en');
      const result = await apiClient.getCities({ searchTerm: 'Mumbai' });
      
      expect(result).toHaveProperty('cities');
      expect(Array.isArray(result.cities)).toBe(true);
    });
  });

  describe('City Heritage API', () => {
    let testCityId: string;

    beforeAll(async () => {
      // Get a city ID for testing
      apiClient.setLanguage('en');
      const citiesResult = await apiClient.getCities();
      if (citiesResult.cities.length > 0) {
        testCityId = citiesResult.cities[0].id;
      }
    });

    it('should fetch heritage items for a city', async () => {
      if (!testCityId) {
        console.log('Skipping test: No cities available');
        return;
      }

      apiClient.setLanguage('en');
      const result = await apiClient.getCityHeritage(testCityId);
      
      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('heritageItems');
      expect(Array.isArray(result.heritageItems)).toBe(true);
      
      // Verify city structure
      expect(result.city).toHaveProperty('id');
      expect(result.city).toHaveProperty('name');
      expect(result.city).toHaveProperty('state');
      expect(result.city).toHaveProperty('region');
      
      // Verify heritage item structure if any exist
      if (result.heritageItems.length > 0) {
        const item = result.heritageItems[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('summary');
      }
    });

    it('should fetch heritage items in different language', async () => {
      if (!testCityId) {
        console.log('Skipping test: No cities available');
        return;
      }

      apiClient.setLanguage('hi');
      const result = await apiClient.getCityHeritage(testCityId);
      
      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('heritageItems');
    });

    it('should filter heritage items by category', async () => {
      if (!testCityId) {
        console.log('Skipping test: No cities available');
        return;
      }

      apiClient.setLanguage('en');
      const result = await apiClient.getCityHeritage(testCityId, { category: 'monuments' });
      
      expect(result).toHaveProperty('heritageItems');
      
      // All items should be monuments
      result.heritageItems.forEach(item => {
        expect(item.category).toBe('monuments');
      });
    });
  });

  describe('Heritage Detail API', () => {
    let testHeritageId: string;

    beforeAll(async () => {
      // Get a heritage ID for testing
      apiClient.setLanguage('en');
      const citiesResult = await apiClient.getCities();
      if (citiesResult.cities.length > 0) {
        const cityId = citiesResult.cities[0].id;
        const heritageResult = await apiClient.getCityHeritage(cityId);
        if (heritageResult.heritageItems.length > 0) {
          testHeritageId = heritageResult.heritageItems[0].id;
        }
      }
    });

    it('should fetch heritage details', async () => {
      if (!testHeritageId) {
        console.log('Skipping test: No heritage items available');
        return;
      }

      apiClient.setLanguage('en');
      const result = await apiClient.getHeritageDetail(testHeritageId);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('detailedDescription');
      expect(result).toHaveProperty('images');
      expect(Array.isArray(result.images)).toBe(true);
    });

    it('should fetch heritage details in different language', async () => {
      if (!testHeritageId) {
        console.log('Skipping test: No heritage items available');
        return;
      }

      apiClient.setLanguage('hi');
      const result = await apiClient.getHeritageDetail(testHeritageId);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
    });
  });

  describe('Heritage Images API', () => {
    let testHeritageId: string;

    beforeAll(async () => {
      // Get a heritage ID for testing
      apiClient.setLanguage('en');
      const citiesResult = await apiClient.getCities();
      if (citiesResult.cities.length > 0) {
        const cityId = citiesResult.cities[0].id;
        const heritageResult = await apiClient.getCityHeritage(cityId);
        if (heritageResult.heritageItems.length > 0) {
          testHeritageId = heritageResult.heritageItems[0].id;
        }
      }
    });

    it('should fetch images for heritage item', async () => {
      if (!testHeritageId) {
        console.log('Skipping test: No heritage items available');
        return;
      }

      const result = await apiClient.getHeritageImages(testHeritageId);
      
      expect(result).toHaveProperty('images');
      expect(Array.isArray(result.images)).toBe(true);
      
      // Verify image structure if any exist
      if (result.images.length > 0) {
        const image = result.images[0];
        expect(image).toHaveProperty('id');
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('thumbnailUrl');
        expect(image).toHaveProperty('caption');
        expect(image).toHaveProperty('altText');
        expect(image).toHaveProperty('description');
        expect(image).toHaveProperty('culturalContext');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent city', async () => {
      apiClient.setLanguage('en');
      
      try {
        await apiClient.getCityHeritage('00000000-0000-0000-0000-000000000000');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toHaveProperty('message');
        expect(error.status).toBe(404);
      }
    });

    it('should handle non-existent heritage item', async () => {
      apiClient.setLanguage('en');
      
      try {
        await apiClient.getHeritageDetail('00000000-0000-0000-0000-000000000000');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toHaveProperty('message');
        expect(error.status).toBe(404);
      }
    });

    it('should handle network errors gracefully', async () => {
      // Create a new client with invalid URL
      const invalidClient = new (apiClient.constructor as any)();
      invalidClient.client.defaults.baseURL = 'http://localhost:9999/api/v1';
      
      try {
        await invalidClient.getCities();
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toHaveProperty('message');
        expect(error.code).toBe('NETWORK_ERROR');
      }
    });
  });

  describe('Language Switching', () => {
    it('should switch languages correctly', async () => {
      // Test English
      apiClient.setLanguage('en');
      expect(apiClient.getCurrentLanguage()).toBe('en');
      const enResult = await apiClient.getCities();
      expect(enResult.cities.length).toBeGreaterThan(0);
      
      // Test Hindi
      apiClient.setLanguage('hi');
      expect(apiClient.getCurrentLanguage()).toBe('hi');
      const hiResult = await apiClient.getCities();
      expect(hiResult.cities.length).toBeGreaterThan(0);
      
      // Test Tamil
      apiClient.setLanguage('ta');
      expect(apiClient.getCurrentLanguage()).toBe('ta');
      const taResult = await apiClient.getCities();
      expect(taResult.cities.length).toBeGreaterThan(0);
    });
  });
});
