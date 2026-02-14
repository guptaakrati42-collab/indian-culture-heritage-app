import request from 'supertest';
import app from './index';
import { db } from './config/database';

describe('End-to-End Integration Tests', () => {
  beforeAll(async () => {
    // Wait for database to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    await db.close();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database');
    });
  });

  describe('API Base Endpoint', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Indian Culture App API');
    });
  });

  describe('Languages Endpoint', () => {
    it('should return list of supported languages', async () => {
      const response = await request(app)
        .get('/api/v1/languages')
        .expect(200);

      expect(response.body).toHaveProperty('languages');
      expect(Array.isArray(response.body.languages)).toBe(true);
      expect(response.body.languages.length).toBeGreaterThan(0);
      
      // Verify language structure
      const language = response.body.languages[0];
      expect(language).toHaveProperty('code');
      expect(language).toHaveProperty('name');
      expect(language).toHaveProperty('englishName');
    });
  });

  describe('Cities Endpoint', () => {
    it('should return list of cities', async () => {
      const response = await request(app)
        .get('/api/v1/cities')
        .query({ language: 'en' })
        .expect(200);

      expect(response.body).toHaveProperty('cities');
      expect(Array.isArray(response.body.cities)).toBe(true);
    });

    it('should return cities in Hindi', async () => {
      const response = await request(app)
        .get('/api/v1/cities')
        .query({ language: 'hi' })
        .expect(200);

      expect(response.body).toHaveProperty('cities');
      expect(Array.isArray(response.body.cities)).toBe(true);
    });

    it('should filter cities by state', async () => {
      const response = await request(app)
        .get('/api/v1/cities')
        .query({ language: 'en', state: 'Maharashtra' })
        .expect(200);

      expect(response.body).toHaveProperty('cities');
      expect(Array.isArray(response.body.cities)).toBe(true);
    });

    it('should filter cities by region', async () => {
      const response = await request(app)
        .get('/api/v1/cities')
        .query({ language: 'en', region: 'West' })
        .expect(200);

      expect(response.body).toHaveProperty('cities');
      expect(Array.isArray(response.body.cities)).toBe(true);
    });

    it('should handle Accept-Language header', async () => {
      const response = await request(app)
        .get('/api/v1/cities')
        .set('Accept-Language', 'hi')
        .expect(200);

      expect(response.body).toHaveProperty('cities');
    });
  });

  describe('City Heritage Endpoint', () => {
    let cityId: string;

    beforeAll(async () => {
      // Get a city ID for testing
      const citiesResponse = await request(app)
        .get('/api/v1/cities')
        .query({ language: 'en' });
      
      if (citiesResponse.body.cities && citiesResponse.body.cities.length > 0) {
        cityId = citiesResponse.body.cities[0].id;
      }
    });

    it('should return heritage items for a city', async () => {
      if (!cityId) {
        console.log('Skipping test: No cities available');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/cities/${cityId}/heritage`)
        .query({ language: 'en' })
        .expect(200);

      expect(response.body).toHaveProperty('city');
      expect(response.body).toHaveProperty('heritageItems');
      expect(Array.isArray(response.body.heritageItems)).toBe(true);
    });

    it('should filter heritage items by category', async () => {
      if (!cityId) {
        console.log('Skipping test: No cities available');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/cities/${cityId}/heritage`)
        .query({ language: 'en', category: 'monuments' })
        .expect(200);

      expect(response.body).toHaveProperty('heritageItems');
    });

    it('should return 404 for non-existent city', async () => {
      const response = await request(app)
        .get('/api/v1/cities/00000000-0000-0000-0000-000000000000/heritage')
        .query({ language: 'en' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Heritage Detail Endpoint', () => {
    let heritageId: string;

    beforeAll(async () => {
      // Get a heritage ID for testing
      const citiesResponse = await request(app)
        .get('/api/v1/cities')
        .query({ language: 'en' });
      
      if (citiesResponse.body.cities && citiesResponse.body.cities.length > 0) {
        const cityId = citiesResponse.body.cities[0].id;
        const heritageResponse = await request(app)
          .get(`/api/v1/cities/${cityId}/heritage`)
          .query({ language: 'en' });
        
        if (heritageResponse.body.heritageItems && heritageResponse.body.heritageItems.length > 0) {
          heritageId = heritageResponse.body.heritageItems[0].id;
        }
      }
    });

    it('should return heritage details', async () => {
      if (!heritageId) {
        console.log('Skipping test: No heritage items available');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/heritage/${heritageId}`)
        .query({ language: 'en' })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('summary');
    });

    it('should return heritage details in different language', async () => {
      if (!heritageId) {
        console.log('Skipping test: No heritage items available');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/heritage/${heritageId}`)
        .query({ language: 'hi' })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
    });

    it('should return 404 for non-existent heritage item', async () => {
      const response = await request(app)
        .get('/api/v1/heritage/00000000-0000-0000-0000-000000000000')
        .query({ language: 'en' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Heritage Images Endpoint', () => {
    let heritageId: string;

    beforeAll(async () => {
      // Get a heritage ID for testing
      const citiesResponse = await request(app)
        .get('/api/v1/cities')
        .query({ language: 'en' });
      
      if (citiesResponse.body.cities && citiesResponse.body.cities.length > 0) {
        const cityId = citiesResponse.body.cities[0].id;
        const heritageResponse = await request(app)
          .get(`/api/v1/cities/${cityId}/heritage`)
          .query({ language: 'en' });
        
        if (heritageResponse.body.heritageItems && heritageResponse.body.heritageItems.length > 0) {
          heritageId = heritageResponse.body.heritageItems[0].id;
        }
      }
    });

    it('should return images for heritage item', async () => {
      if (!heritageId) {
        console.log('Skipping test: No heritage items available');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/heritage/${heritageId}/images`)
        .expect(200);

      expect(response.body).toHaveProperty('images');
      expect(Array.isArray(response.body.images)).toBe(true);
    });

    it('should return 404 for non-existent heritage item', async () => {
      const response = await request(app)
        .get('/api/v1/heritage/00000000-0000-0000-0000-000000000000/images')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/cities')
        .query({ language: 'invalid_lang_code_that_is_too_long' });

      // Should still return 200 with fallback to English
      expect(response.status).toBe(200);
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/api/v1/cities')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
