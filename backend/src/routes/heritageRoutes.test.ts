import request from 'supertest';
import express, { Application } from 'express';
import heritageRoutes from './heritageRoutes';
import { languageMiddleware } from '../middleware/languageMiddleware';
import { errorHandler } from '../middleware/errorHandler';
import { heritageService } from '../services/HeritageService';
import { translationService } from '../services/TranslationService';
import { cache } from '../utils/cache';

// Mock the services
jest.mock('../services/HeritageService');
jest.mock('../services/TranslationService');

describe('Heritage Routes Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use(languageMiddleware);
    app.use('/api/v1/heritage', heritageRoutes);
    app.use('/api/v1', heritageRoutes); // For /languages endpoint
    app.use(errorHandler);

    // Clear cache before each test
    cache.flush();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/v1/heritage/:heritageId', () => {
    const mockHeritageDetail = {
      id: '323e4567-e89b-12d3-a456-426614174002',
      name: 'Gateway of India',
      category: 'monuments',
      summary: 'An iconic monument built during the British Raj',
      detailedDescription:
        'The Gateway of India is an arch-monument built in the early 20th century in Mumbai. It was erected to commemorate the landing of King George V and Queen Mary at Apollo Bunder.',
      historicalPeriod: '1911-1924',
      significance:
        'Symbol of Mumbai and a major tourist attraction representing colonial architecture',
      images: [
        {
          id: 'img1',
          url: 'https://example.com/gateway-full.jpg',
          thumbnailUrl: 'https://example.com/gateway-thumb.jpg',
          caption: 'Gateway of India at sunset',
          altText: 'Gateway of India monument',
        },
      ],
    };

    it('should return heritage details with default language (English)', async () => {
      (heritageService.getHeritageById as jest.Mock).mockResolvedValue(
        mockHeritageDetail
      );

      const response = await request(app).get(
        `/api/v1/heritage/${mockHeritageDetail.id}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHeritageDetail);
      expect(heritageService.getHeritageById).toHaveBeenCalledWith(
        mockHeritageDetail.id,
        'en'
      );
    });

    it('should return heritage details in Hindi when language parameter is provided', async () => {
      const mockHindiHeritage = {
        ...mockHeritageDetail,
        name: 'गेटवे ऑफ इंडिया',
        summary: 'ब्रिटिश राज के दौरान बनाया गया एक प्रतिष्ठित स्मारक',
      };
      (heritageService.getHeritageById as jest.Mock).mockResolvedValue(
        mockHindiHeritage
      );

      const response = await request(app).get(
        `/api/v1/heritage/${mockHeritageDetail.id}?language=hi`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHindiHeritage);
      expect(heritageService.getHeritageById).toHaveBeenCalledWith(
        mockHeritageDetail.id,
        'hi'
      );
    });

    it('should return heritage details in Tamil', async () => {
      const mockTamilHeritage = {
        ...mockHeritageDetail,
        name: 'கேட்வே ஆஃப் இந்தியா',
      };
      (heritageService.getHeritageById as jest.Mock).mockResolvedValue(
        mockTamilHeritage
      );

      const response = await request(app).get(
        `/api/v1/heritage/${mockHeritageDetail.id}?language=ta`
      );

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('கேட்வே ஆஃப் இந்தியா');
      expect(heritageService.getHeritageById).toHaveBeenCalledWith(
        mockHeritageDetail.id,
        'ta'
      );
    });

    it('should return 404 for non-existent heritage item', async () => {
      (heritageService.getHeritageById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get(
        '/api/v1/heritage/999e4567-e89b-12d3-a456-426614174999'
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Heritage item not found');
    });

    it('should return 400 for invalid heritage ID format', async () => {
      const response = await request(app).get('/api/v1/heritage/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid language code', async () => {
      const response = await request(app).get(
        `/api/v1/heritage/${mockHeritageDetail.id}?language=invalid`
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return cached results on second request', async () => {
      (heritageService.getHeritageById as jest.Mock).mockResolvedValue(
        mockHeritageDetail
      );

      // First request
      await request(app).get(`/api/v1/heritage/${mockHeritageDetail.id}`);

      // Second request should use cache
      const response = await request(app).get(
        `/api/v1/heritage/${mockHeritageDetail.id}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHeritageDetail);
      // Service should only be called once (first request)
      expect(heritageService.getHeritageById).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/v1/heritage/:heritageId/images', () => {
    const mockImages = [
      {
        id: 'img1',
        url: 'https://example.com/gateway-1.jpg',
        thumbnailUrl: 'https://example.com/gateway-1-thumb.jpg',
        caption: 'Gateway of India at sunset',
        altText: 'Gateway of India monument at sunset',
      },
      {
        id: 'img2',
        url: 'https://example.com/gateway-2.jpg',
        thumbnailUrl: 'https://example.com/gateway-2-thumb.jpg',
        caption: 'Gateway of India front view',
        altText: 'Front view of Gateway of India',
      },
      {
        id: 'img3',
        url: 'https://example.com/gateway-3.jpg',
        thumbnailUrl: 'https://example.com/gateway-3-thumb.jpg',
        caption: 'Gateway of India with boats',
        altText: 'Gateway of India with boats in foreground',
      },
    ];

    const heritageId = '323e4567-e89b-12d3-a456-426614174002';

    it('should return all images for a heritage item', async () => {
      (heritageService.getHeritageImages as jest.Mock).mockResolvedValue(mockImages);

      const response = await request(app).get(`/api/v1/heritage/${heritageId}/images`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('images');
      expect(response.body.images).toEqual(mockImages);
      expect(response.body.images).toHaveLength(3);
      expect(heritageService.getHeritageImages).toHaveBeenCalledWith(heritageId);
    });

    it('should return empty array when heritage has no images', async () => {
      (heritageService.getHeritageImages as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get(`/api/v1/heritage/${heritageId}/images`);

      expect(response.status).toBe(200);
      expect(response.body.images).toEqual([]);
    });

    it('should return 400 for invalid heritage ID format', async () => {
      const response = await request(app).get('/api/v1/heritage/invalid-id/images');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return cached results on second request', async () => {
      (heritageService.getHeritageImages as jest.Mock).mockResolvedValue(mockImages);

      // First request
      await request(app).get(`/api/v1/heritage/${heritageId}/images`);

      // Second request should use cache
      const response = await request(app).get(`/api/v1/heritage/${heritageId}/images`);

      expect(response.status).toBe(200);
      expect(response.body.images).toEqual(mockImages);
      // Service should only be called once (first request)
      expect(heritageService.getHeritageImages).toHaveBeenCalledTimes(1);
    });

    it('should include all required image fields', async () => {
      (heritageService.getHeritageImages as jest.Mock).mockResolvedValue(mockImages);

      const response = await request(app).get(`/api/v1/heritage/${heritageId}/images`);

      expect(response.status).toBe(200);
      response.body.images.forEach((image: any) => {
        expect(image).toHaveProperty('id');
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('thumbnailUrl');
        expect(image).toHaveProperty('caption');
        expect(image).toHaveProperty('altText');
      });
    });
  });

  describe('GET /api/v1/languages', () => {
    const mockLanguages = [
      { code: 'en', name: 'English', englishName: 'English' },
      { code: 'hi', name: 'हिन्दी', englishName: 'Hindi' },
      { code: 'bn', name: 'বাংলা', englishName: 'Bengali' },
      { code: 'te', name: 'తెలుగు', englishName: 'Telugu' },
      { code: 'mr', name: 'मराठी', englishName: 'Marathi' },
      { code: 'ta', name: 'தமிழ்', englishName: 'Tamil' },
      { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati' },
      { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada' },
      { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam' },
      { code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Odia' },
      { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi' },
      { code: 'as', name: 'অসমীয়া', englishName: 'Assamese' },
      { code: 'ks', name: 'कॉशुर', englishName: 'Kashmiri' },
      { code: 'kok', name: 'कोंकणी', englishName: 'Konkani' },
      { code: 'mni', name: 'মৈতৈলোন্', englishName: 'Manipuri' },
      { code: 'ne', name: 'नेपाली', englishName: 'Nepali' },
      { code: 'sa', name: 'संस्कृतम्', englishName: 'Sanskrit' },
      { code: 'sd', name: 'سنڌي', englishName: 'Sindhi' },
      { code: 'ur', name: 'اردو', englishName: 'Urdu' },
      { code: 'brx', name: 'बड़ो', englishName: 'Bodo' },
      { code: 'sat', name: 'ᱥᱟᱱᱛᱟᱲᱤ', englishName: 'Santhali' },
      { code: 'mai', name: 'मैथिली', englishName: 'Maithili' },
      { code: 'doi', name: 'डोगरी', englishName: 'Dogri' },
    ];

    it('should return all supported languages', async () => {
      (translationService.getSupportedLanguages as jest.Mock).mockResolvedValue(
        mockLanguages
      );

      const response = await request(app).get('/api/v1/languages');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('languages');
      expect(response.body.languages).toEqual(mockLanguages);
      expect(response.body.languages).toHaveLength(23);
      expect(translationService.getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should return languages with all required fields', async () => {
      (translationService.getSupportedLanguages as jest.Mock).mockResolvedValue(
        mockLanguages
      );

      const response = await request(app).get('/api/v1/languages');

      expect(response.status).toBe(200);
      response.body.languages.forEach((language: any) => {
        expect(language).toHaveProperty('code');
        expect(language).toHaveProperty('name');
        expect(language).toHaveProperty('englishName');
      });
    });

    it('should return cached results on second request', async () => {
      (translationService.getSupportedLanguages as jest.Mock).mockResolvedValue(
        mockLanguages
      );

      // First request
      await request(app).get('/api/v1/languages');

      // Second request should use cache
      const response = await request(app).get('/api/v1/languages');

      expect(response.status).toBe(200);
      expect(response.body.languages).toEqual(mockLanguages);
      // Service should only be called once (first request)
      expect(translationService.getSupportedLanguages).toHaveBeenCalledTimes(1);
    });

    it('should include all 22 Indian languages plus English', async () => {
      (translationService.getSupportedLanguages as jest.Mock).mockResolvedValue(
        mockLanguages
      );

      const response = await request(app).get('/api/v1/languages');

      expect(response.status).toBe(200);
      expect(response.body.languages).toHaveLength(23);
      
      // Verify English is included
      const english = response.body.languages.find((l: any) => l.code === 'en');
      expect(english).toBeDefined();
      expect(english.englishName).toBe('English');
    });
  });
});
