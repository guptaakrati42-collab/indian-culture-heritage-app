import { Router, Request, Response, NextFunction } from 'express';
import { heritageService } from '../services/HeritageService';
import { imageService } from '../services/ImageService';
import { translationService } from '../services/TranslationService';
import { validate } from '../middleware/validation';
import {
  getHeritageDetailsSchema,
  getHeritageImagesSchema,
  getLanguagesSchema,
} from '../middleware/validationSchemas';
import {
  cache,
  generateHeritageKey,
  generateHeritageImagesKey,
  generateLanguagesKey,
} from '../utils/cache';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/v1/languages
 * Get all supported languages
 * Requirements: 1.1, 1.4, 6.5
 */
router.get(
  '/languages',
  validate(getLanguagesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Generate cache key
      const cacheKey = generateLanguagesKey();

      // Check cache
      const cachedLanguages = cache.get(cacheKey);
      if (cachedLanguages) {
        return res.json({ languages: cachedLanguages });
      }

      // Fetch languages
      const languages = await translationService.getSupportedLanguages();

      // Cache the result (longer TTL for languages as they rarely change)
      cache.set(cacheKey, languages, 3600); // 1 hour

      res.json({ languages });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/heritage/:heritageId
 * Get detailed heritage information with translations
 * Requirements: 3.1, 3.2, 3.7, 3.8, 6.3
 */
router.get(
  '/:heritageId',
  validate(getHeritageDetailsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { heritageId } = req.params;
      const language = req.language;

      // Generate cache key
      const cacheKey = generateHeritageKey(heritageId, language);

      // Check cache
      const cachedHeritage = cache.get(cacheKey);
      if (cachedHeritage) {
        return res.json(cachedHeritage);
      }

      // Fetch heritage details
      const heritage = await heritageService.getHeritageById(heritageId, language);

      if (!heritage) {
        throw new AppError('Heritage item not found', 404);
      }

      // Cache the result
      cache.set(cacheKey, heritage);

      res.json(heritage);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/heritage/:heritageId/images
 * Get all images for a heritage item with CDN optimization
 * Requirements: 4.1, 4.2, 4.3, 4.4, 6.4, 10.4
 */
router.get(
  '/:heritageId/images',
  validate(getHeritageImagesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { heritageId } = req.params;

      // Generate cache key
      const cacheKey = generateHeritageImagesKey(heritageId);

      // Check cache
      const cachedImages = cache.get(cacheKey);
      if (cachedImages) {
        // Set CDN cache headers
        const cacheHeaders = imageService.getCacheHeaders();
        Object.entries(cacheHeaders).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        
        return res.json({ images: cachedImages });
      }

      // Fetch images
      const images = await heritageService.getHeritageImages(heritageId);

      const response = { images };

      // Cache the result
      cache.set(cacheKey, images);

      // Set CDN cache headers for image responses
      const cacheHeaders = imageService.getCacheHeaders();
      Object.entries(cacheHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
