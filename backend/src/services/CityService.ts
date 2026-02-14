import { db } from '../config/database';
import { translationService } from './TranslationService';

export interface City {
  id: string;
  name: string;
  state: string;
  region: string;
  previewImage: string;
  heritageCount: number;
}

export interface CityFilters {
  state?: string;
  region?: string;
  searchTerm?: string;
}

export interface HeritageItem {
  id: string;
  name: string;
  category: string;
  summary: string;
  thumbnailImage: string;
}

export class CityService {
  /**
   * Get all cities with language support and optional filters
   * Requirements: 2.1, 2.2, 2.5, 2.6, 2.8, 5.1, 5.5
   */
  async getAllCities(language: string, filters?: CityFilters): Promise<City[]> {
    // Build query with filters
    let query = `
      SELECT 
        c.id,
        c.slug,
        c.state,
        c.region,
        c.preview_image_url,
        COUNT(h.id) as heritage_count
      FROM cities c
      LEFT JOIN heritage_items h ON h.city_id = c.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    // Apply state filter
    if (filters?.state) {
      query += ` AND c.state = $${paramIndex}`;
      params.push(filters.state);
      paramIndex++;
    }

    // Apply region filter
    if (filters?.region) {
      query += ` AND c.region = $${paramIndex}`;
      params.push(filters.region);
      paramIndex++;
    }

    query += `
      GROUP BY c.id, c.slug, c.state, c.region, c.preview_image_url
      ORDER BY c.slug
    `;

    // Execute query
    const cities = await db.query<{
      id: string;
      slug: string;
      state: string;
      region: string;
      preview_image_url: string;
      heritage_count: string;
    }>(query, params);

    if (cities.length === 0) {
      return [];
    }

    // Get translations for all cities in batch
    const cityIds = cities.map(c => c.id);
    const translations = await translationService.getBatchTranslations(
      'city',
      cityIds,
      language,
      ['name', 'state']
    );

    // Map results with translations
    let result = cities.map(c => {
      const cityTranslations = translations.get(c.id) || { name: '', state: '' };
      return {
        id: c.id,
        name: cityTranslations.name || c.slug,
        state: cityTranslations.state || c.state,
        region: c.region,
        previewImage: c.preview_image_url || '',
        heritageCount: parseInt(c.heritage_count, 10),
      };
    });

    // Apply search filter on translated names (client-side filtering after translation)
    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(city => 
        city.name.toLowerCase().includes(searchLower) ||
        city.state.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }

  /**
   * Get a specific city by ID with translations
   * Requirements: 2.1, 2.2, 2.6, 5.1
   */
  async getCityById(cityId: string, language: string): Promise<City | null> {
    // Query for city
    const cities = await db.query<{
      id: string;
      slug: string;
      state: string;
      region: string;
      preview_image_url: string;
    }>(`
      SELECT 
        c.id,
        c.slug,
        c.state,
        c.region,
        c.preview_image_url,
        COUNT(h.id) as heritage_count
      FROM cities c
      LEFT JOIN heritage_items h ON h.city_id = c.id
      WHERE c.id = $1
      GROUP BY c.id, c.slug, c.state, c.region, c.preview_image_url
    `, [cityId]);

    if (cities.length === 0) {
      return null;
    }

    const city = cities[0];

    // Get translations
    const translations = await translationService.getTranslation(
      'city',
      city.id,
      language,
      ['name', 'state']
    );

    return {
      id: city.id,
      name: translations.name || city.slug,
      state: translations.state || city.state,
      region: city.region,
      previewImage: city.preview_image_url || '',
      heritageCount: parseInt((city as any).heritage_count, 10),
    };
  }

  /**
   * Get all heritage items for a city with optional category filtering
   * Requirements: 2.3, 2.7, 2.8, 3.1, 3.5, 3.6, 5.1, 5.5
   */
  async getCityHeritage(
    cityId: string,
    language: string,
    category?: string
  ): Promise<HeritageItem[]> {
    // Build query with optional category filter
    let query = `
      SELECT 
        h.id,
        h.category,
        h.thumbnail_image_url
      FROM heritage_items h
      WHERE h.city_id = $1
    `;

    const params: any[] = [cityId];

    // Apply category filter if provided
    if (category) {
      query += ` AND h.category = $2`;
      params.push(category);
    }

    query += ` ORDER BY h.category, h.created_at`;

    // Execute query
    const heritageItems = await db.query<{
      id: string;
      category: string;
      thumbnail_image_url: string;
    }>(query, params);

    if (heritageItems.length === 0) {
      return [];
    }

    // Get translations for all heritage items in batch
    const heritageIds = heritageItems.map(h => h.id);
    const translations = await translationService.getBatchTranslations(
      'heritage',
      heritageIds,
      language,
      ['name', 'summary']
    );

    // Map results with translations
    return heritageItems.map(h => {
      const heritageTranslations = translations.get(h.id) || { name: '', summary: '' };
      return {
        id: h.id,
        name: heritageTranslations.name || '',
        category: h.category,
        summary: heritageTranslations.summary || '',
        thumbnailImage: h.thumbnail_image_url || '',
      };
    });
  }
}

// Export singleton instance
export const cityService = new CityService();
