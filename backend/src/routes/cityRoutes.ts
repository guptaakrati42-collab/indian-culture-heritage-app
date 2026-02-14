import { Router, Request, Response, NextFunction } from 'express';
import { cityService } from '../services/CityService';
import { validate } from '../middleware/validation';
import { getCitiesSchema, getCityHeritageSchema } from '../middleware/validationSchemas';
import { cache, generateCitiesKey, generateCityHeritageKey } from '../utils/cache';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/v1/cities
 * Get all cities with optional filters
 * Requirements: 2.1, 2.2, 2.5, 2.6, 2.8, 6.1
 */
router.get(
  '/',
  validate(getCitiesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const language = req.language;
      const filters = {
        state: req.query.state as string | undefined,
        region: req.query.region as string | undefined,
        searchTerm: req.query.search as string | undefined,
      };

      // Generate cache key
      const cacheKey = generateCitiesKey(language, {
        state: filters.state,
        region: filters.region,
        search: filters.searchTerm,
      });

      // Check cache
      const cachedCities = cache.get(cacheKey);
      if (cachedCities) {
        return res.json({ cities: cachedCities });
      }

      // Fetch from service
      const cities = await cityService.getAllCities(language, filters);

      // Cache the result
      cache.set(cacheKey, cities);

      res.json({ cities });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/cities/:cityId/heritage
 * Get all heritage items for a specific city
 * Requirements: 2.3, 2.4, 3.1, 3.5, 3.6, 6.2, 6.7
 */
router.get(
  '/:cityId/heritage',
  validate(getCityHeritageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cityId } = req.params;
      const language = req.language;
      const category = req.query.category as string | undefined;

      // Generate cache key
      const cacheKey = generateCityHeritageKey(cityId, language, category);

      // Check cache
      const cachedHeritage = cache.get(cacheKey);
      if (cachedHeritage) {
        return res.json(cachedHeritage);
      }

      // Verify city exists
      const city = await cityService.getCityById(cityId, language);
      if (!city) {
        throw new AppError('City not found', 404);
      }

      // Fetch heritage items
      const heritageItems = await cityService.getCityHeritage(
        cityId,
        language,
        category
      );

      const response = {
        city: {
          id: city.id,
          name: city.name,
          state: city.state,
          region: city.region,
        },
        heritageItems,
      };

      // Cache the result
      cache.set(cacheKey, response);

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
