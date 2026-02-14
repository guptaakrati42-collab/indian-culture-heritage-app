import request from 'supertest';
import express, { Application } from 'express';
import cityRoutes from './cityRoutes';
import { languageMiddleware } from '../middleware/languageMiddleware';
import { errorHandler } from '../middleware/errorHandler';
import { cityService } from '../services/CityService';
import { cache } from '../utils/cache';

// Mock the city service
jest.mock('../services/CityService');

describe('City Routes Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use(languageMiddleware);
    app.use('/api/v1/cities', cityRoutes);
    app.use(errorHandler);

    // Clear cache before each test
    cache.flush();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/v1/cities', () => {
    const mockCities = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Mumbai',
        state: 'Maharashtra',
        region: 'West',
        previewImage: 'https://example.com/mumbai.jpg',
        heritageCount: 5,
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        name: 'Delhi',
        state: 'Delhi',
        region: 'North',
        previewImage: 'https://example.com/delhi.jpg',
        heritageCount: 8,
      },
    ];

    it('should return all cities with default language (English)', async () => {
      (cityService.getAllCities as jest.Mock).mockResolvedValue(mockCities);

      const response = await request(app).get('/api/v1/cities');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cities');
      expect(response.body.cities).toEqual(mockCities);
      expect(cityService.getAllCities).toHaveBeenCalledWith('en', {
        state: undefined,
        region: undefined,
        searchTerm: undefined,
      });
    });

    it('should return cities in Hindi when language parameter is provided', async () => {
      const mockHindiCities = [
        { ...mockCities[0], name: 'मुंबई', state: 'महाराष्ट्र' },
        { ...mockCities[1], name: 'दिल्ली', state: 'दिल्ली' },
      ];
      (cityService.getAllCities as jest.Mock).mockResolvedValue(mockHindiCities);

      const response = await request(app).get('/api/v1/cities?language=hi');

      expect(response.status).toBe(200);
      expect(response.body.cities).toEqual(mockHindiCities);
      expect(cityService.getAllCities).toHaveBeenCalledWith('hi', {
        state: undefined,
        region: undefined,
        searchTerm: undefined,
      });
    });

    it('should filter cities by state', async () => {
      const filteredCities = [mockCities[0]];
      (cityService.getAllCities as jest.Mock).mockResolvedValue(filteredCities);

      const response = await request(app).get('/api/v1/cities?state=Maharashtra');

      expect(response.status).toBe(200);
      expect(response.body.cities).toEqual(filteredCities);
      expect(cityService.getAllCities).toHaveBeenCalledWith('en', {
        state: 'Maharashtra',
        region: undefined,
        searchTerm: undefined,
      });
    });

    it('should filter cities by region', async () => {
      const filteredCities = [mockCities[1]];
      (cityService.getAllCities as jest.Mock).mockResolvedValue(filteredCities);

      const response = await request(app).get('/api/v1/cities?region=North');

      expect(response.status).toBe(200);
      expect(response.body.cities).toEqual(filteredCities);
      expect(cityService.getAllCities).toHaveBeenCalledWith('en', {
        state: undefined,
        region: 'North',
        searchTerm: undefined,
      });
    });

    it('should search cities by name', async () => {
      const searchResults = [mockCities[0]];
      (cityService.getAllCities as jest.Mock).mockResolvedValue(searchResults);

      const response = await request(app).get('/api/v1/cities?search=Mumbai');

      expect(response.status).toBe(200);
      expect(response.body.cities).toEqual(searchResults);
      expect(cityService.getAllCities).toHaveBeenCalledWith('en', {
        state: undefined,
        region: undefined,
        searchTerm: 'Mumbai',
      });
    });

    it('should return cached results on second request', async () => {
      (cityService.getAllCities as jest.Mock).mockResolvedValue(mockCities);

      // First request
      await request(app).get('/api/v1/cities');
      
      // Second request should use cache
      const response = await request(app).get('/api/v1/cities');

      expect(response.status).toBe(200);
      expect(response.body.cities).toEqual(mockCities);
      // Service should only be called once (first request)
      expect(cityService.getAllCities).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for invalid region', async () => {
      const response = await request(app).get('/api/v1/cities?region=InvalidRegion');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid language', async () => {
      const response = await request(app).get('/api/v1/cities?language=invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/cities/:cityId/heritage', () => {
    const mockCity = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Mumbai',
      state: 'Maharashtra',
      region: 'West',
      previewImage: 'https://example.com/mumbai.jpg',
      heritageCount: 5,
    };

    const mockHeritageItems = [
      {
        id: '323e4567-e89b-12d3-a456-426614174002',
        name: 'Gateway of India',
        category: 'monuments',
        summary: 'An iconic monument built during the British Raj',
        thumbnailImage: 'https://example.com/gateway.jpg',
      },
      {
        id: '423e4567-e89b-12d3-a456-426614174003',
        name: 'Ganesh Chaturthi',
        category: 'festivals',
        summary: 'A major Hindu festival celebrating Lord Ganesha',
        thumbnailImage: 'https://example.com/ganesh.jpg',
      },
    ];

    it('should return city heritage items with default language', async () => {
      (cityService.getCityById as jest.Mock).mockResolvedValue(mockCity);
      (cityService.getCityHeritage as jest.Mock).mockResolvedValue(mockHeritageItems);

      const response = await request(app).get(
        `/api/v1/cities/${mockCity.id}/heritage`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('city');
      expect(response.body).toHaveProperty('heritageItems');
      expect(response.body.city.id).toBe(mockCity.id);
      expect(response.body.heritageItems).toEqual(mockHeritageItems);
      expect(cityService.getCityHeritage).toHaveBeenCalledWith(
        mockCity.id,
        'en',
        undefined
      );
    });

    it('should return heritage items in specified language', async () => {
      const mockHindiCity = { ...mockCity, name: 'मुंबई' };
      const mockHindiHeritage = [
        { ...mockHeritageItems[0], name: 'गेटवे ऑफ इंडिया' },
      ];
      (cityService.getCityById as jest.Mock).mockResolvedValue(mockHindiCity);
      (cityService.getCityHeritage as jest.Mock).mockResolvedValue(mockHindiHeritage);

      const response = await request(app).get(
        `/api/v1/cities/${mockCity.id}/heritage?language=hi`
      );

      expect(response.status).toBe(200);
      expect(response.body.heritageItems).toEqual(mockHindiHeritage);
      expect(cityService.getCityHeritage).toHaveBeenCalledWith(
        mockCity.id,
        'hi',
        undefined
      );
    });

    it('should filter heritage items by category', async () => {
      const filteredHeritage = [mockHeritageItems[0]];
      (cityService.getCityById as jest.Mock).mockResolvedValue(mockCity);
      (cityService.getCityHeritage as jest.Mock).mockResolvedValue(filteredHeritage);

      const response = await request(app).get(
        `/api/v1/cities/${mockCity.id}/heritage?category=monuments`
      );

      expect(response.status).toBe(200);
      expect(response.body.heritageItems).toEqual(filteredHeritage);
      expect(cityService.getCityHeritage).toHaveBeenCalledWith(
        mockCity.id,
        'en',
        'monuments'
      );
    });

    it('should return 404 for non-existent city', async () => {
      (cityService.getCityById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get(
        '/api/v1/cities/999e4567-e89b-12d3-a456-426614174999/heritage'
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('City not found');
    });

    it('should return 400 for invalid city ID format', async () => {
      const response = await request(app).get('/api/v1/cities/invalid-id/heritage');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app).get(
        `/api/v1/cities/${mockCity.id}/heritage?category=invalid_category`
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return cached results on second request', async () => {
      (cityService.getCityById as jest.Mock).mockResolvedValue(mockCity);
      (cityService.getCityHeritage as jest.Mock).mockResolvedValue(mockHeritageItems);

      // First request
      await request(app).get(`/api/v1/cities/${mockCity.id}/heritage`);
      
      // Second request should use cache
      const response = await request(app).get(
        `/api/v1/cities/${mockCity.id}/heritage`
      );

      expect(response.status).toBe(200);
      expect(response.body.heritageItems).toEqual(mockHeritageItems);
      // getCityById should be called twice (not cached), but getCityHeritage only once
      expect(cityService.getCityById).toHaveBeenCalledTimes(2);
      expect(cityService.getCityHeritage).toHaveBeenCalledTimes(1);
    });
  });
});
