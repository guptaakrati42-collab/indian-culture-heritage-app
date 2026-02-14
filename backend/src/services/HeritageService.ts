import { db } from '../config/database';
import { translationService } from './TranslationService';

export interface Image {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  altText: string;
}

export interface HeritageDetail {
  id: string;
  name: string;
  category: string;
  summary: string;
  detailedDescription: string;
  historicalPeriod: string;
  significance: string;
  images: Image[];
}

export interface HeritageItem {
  id: string;
  name: string;
  category: string;
  summary: string;
  thumbnailImage: string;
}

export class HeritageService {
  /**
   * Get heritage item by ID with full details and translations
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.7, 3.8, 5.2, 5.5
   */
  async getHeritageById(heritageId: string, language: string): Promise<HeritageDetail | null> {
    // Query for heritage item
    const heritageItems = await db.query<{
      id: string;
      city_id: string;
      category: string;
      historical_period: string;
      thumbnail_image_url: string;
    }>(`
      SELECT 
        id,
        city_id,
        category,
        historical_period,
        thumbnail_image_url
      FROM heritage_items
      WHERE id = $1
    `, [heritageId]);

    if (heritageItems.length === 0) {
      return null;
    }

    const heritage = heritageItems[0];

    // Get translations for all text fields
    const translations = await translationService.getTranslation(
      'heritage',
      heritage.id,
      language,
      ['name', 'summary', 'detailed_description', 'significance']
    );

    // Get images for this heritage item
    const images = await this.getHeritageImages(heritageId);

    return {
      id: heritage.id,
      name: translations.name || '',
      category: heritage.category,
      summary: translations.summary || '',
      detailedDescription: translations.detailed_description || '',
      historicalPeriod: heritage.historical_period || '',
      significance: translations.significance || '',
      images,
    };
  }

  /**
   * Get all images for a heritage item
   * Requirements: 4.1, 4.2, 4.3, 4.4, 5.2
   */
  async getHeritageImages(heritageId: string): Promise<Image[]> {
    // Query for images
    const images = await db.query<{
      id: string;
      url: string;
      thumbnail_url: string;
      display_order: number;
    }>(`
      SELECT 
        id,
        url,
        thumbnail_url,
        display_order
      FROM images
      WHERE heritage_id = $1
      ORDER BY display_order
    `, [heritageId]);

    if (images.length === 0) {
      return [];
    }

    // Get translations for captions and alt text
    // Using English as default for image metadata
    const imageIds = images.map(img => img.id);
    const translations = await translationService.getBatchTranslations(
      'image',
      imageIds,
      'en',
      ['caption', 'alt_text']
    );

    return images.map(img => {
      const imgTranslations = translations.get(img.id) || { caption: '', alt_text: '' };
      return {
        id: img.id,
        url: img.url,
        thumbnailUrl: img.thumbnail_url,
        caption: imgTranslations.caption || '',
        altText: imgTranslations.alt_text || '',
      };
    });
  }

  /**
   * Get heritage items by category for a city
   * Requirements: 3.1, 3.6, 5.2, 5.5
   */
  async getHeritageByCategory(
    cityId: string,
    category: string,
    language: string
  ): Promise<HeritageItem[]> {
    // Query for heritage items filtered by category
    const heritageItems = await db.query<{
      id: string;
      category: string;
      thumbnail_image_url: string;
    }>(`
      SELECT 
        id,
        category,
        thumbnail_image_url
      FROM heritage_items
      WHERE city_id = $1 AND category = $2
      ORDER BY created_at
    `, [cityId, category]);

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
export const heritageService = new HeritageService();
