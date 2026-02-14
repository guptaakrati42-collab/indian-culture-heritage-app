import { db } from '../config/database';
import { translationService } from './TranslationService';

export interface Image {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  altText: string;
}

export interface ImageMetadata {
  heritageId: string;
  caption: string;
  altText: string;
}

export class ImageService {
  private readonly cdnBaseUrl: string;
  private readonly placeholderImageUrl: string;
  private readonly supportedFormats: string[] = ['webp', 'jpg', 'png'];
  private readonly defaultQuality: number = 80;

  constructor() {
    // CDN base URL from environment or default
    this.cdnBaseUrl = process.env.CDN_BASE_URL || 'https://cdn.example.com';
    this.placeholderImageUrl = process.env.PLACEHOLDER_IMAGE_URL || 'https://via.placeholder.com/300x200?text=No+Image';
  }

  /**
   * Get image URL for thumbnail or full-size images with optimization parameters
   * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 10.4
   */
  getImageUrl(
    imageId: string, 
    size: 'thumbnail' | 'full',
    options?: {
      width?: number;
      quality?: number;
      format?: 'webp' | 'jpg' | 'png';
    }
  ): string {
    if (!imageId) {
      return this.placeholderImageUrl;
    }

    // Generate CDN URL based on size
    const sizePrefix = size === 'thumbnail' ? 'thumbnails' : 'images';
    let url = `${this.cdnBaseUrl}/${sizePrefix}/${imageId}`;

    // Add optimization parameters if provided
    if (options) {
      const params = new URLSearchParams();
      if (options.width) params.append('w', String(options.width));
      if (options.quality) params.append('q', String(options.quality));
      if (options.format && this.supportedFormats.includes(options.format)) {
        params.append('fm', options.format);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }

    return url;
  }

  /**
   * Get CDN cache headers for image responses
   * Requirements: 10.4
   */
  getCacheHeaders(): Record<string, string> {
    return {
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
      'CDN-Cache-Control': 'public, max-age=31536000',
      'Cloudflare-CDN-Cache-Control': 'public, max-age=31536000',
      'Vary': 'Accept', // Vary on Accept header for WebP support
    };
  }

  /**
   * Generate responsive image srcset
   * Requirements: 4.5, 10.4
   */
  generateSrcSet(
    imageId: string,
    size: 'thumbnail' | 'full',
    widths: number[] = [320, 640, 960, 1280, 1920]
  ): string {
    return widths
      .map(width => {
        const url = this.getImageUrl(imageId, size, { 
          width, 
          quality: this.defaultQuality,
          format: 'webp' 
        });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Upload image with S3/Cloudinary integration
   * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 10.4
   * 
   * Note: This is a placeholder implementation. In production, this would:
   * 1. Upload original image to S3/Cloudinary
   * 2. Generate and upload thumbnail
   * 3. Store metadata in database
   * 4. Store translations for caption and alt text
   */
  async uploadImage(
    file: Buffer,
    metadata: ImageMetadata
  ): Promise<Image> {
    // In production, this would upload to S3/Cloudinary
    // For now, we'll simulate the process
    const imageId = this.generateImageId();
    const url = this.getImageUrl(imageId, 'full');
    const thumbnailUrl = this.getImageUrl(imageId, 'thumbnail');

    // Get the next display order for this heritage item
    const orderResult = await db.query<{ max_order: number }>(`
      SELECT COALESCE(MAX(display_order), 0) as max_order
      FROM images
      WHERE heritage_id = $1
    `, [metadata.heritageId]);

    const displayOrder = (orderResult[0]?.max_order || 0) + 1;

    // Store image metadata in database
    const result = await db.query<{
      id: string;
      heritage_id: string;
      url: string;
      thumbnail_url: string;
      display_order: number;
    }>(`
      INSERT INTO images (id, heritage_id, url, thumbnail_url, display_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, heritage_id, url, thumbnail_url, display_order
    `, [imageId, metadata.heritageId, url, thumbnailUrl, displayOrder]);

    const image = result[0];

    // Store translations for caption and alt text (English only for now)
    await this.storeImageTranslations(image.id, metadata.caption, metadata.altText);

    return {
      id: image.id,
      url: image.url,
      thumbnailUrl: image.thumbnail_url,
      caption: metadata.caption,
      altText: metadata.altText,
    };
  }

  /**
   * Delete image from storage and database
   * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 10.4
   * 
   * Note: This is a placeholder implementation. In production, this would:
   * 1. Delete image from S3/Cloudinary
   * 2. Delete thumbnail from S3/Cloudinary
   * 3. Delete metadata from database
   * 4. Delete translations
   */
  async deleteImage(imageId: string): Promise<void> {
    // In production, this would delete from S3/Cloudinary
    // For now, we'll just delete from database
    
    // Delete translations first
    await db.query(`
      DELETE FROM translations
      WHERE entity_type = 'image' AND entity_id = $1
    `, [imageId]);

    // Delete image record
    await db.query(`
      DELETE FROM images
      WHERE id = $1
    `, [imageId]);
  }

  /**
   * Get all images for a heritage item
   * Requirements: 4.1, 4.2, 4.3, 4.4, 4.7
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
        url: img.url || this.placeholderImageUrl,
        thumbnailUrl: img.thumbnail_url || this.placeholderImageUrl,
        caption: imgTranslations.caption || '',
        altText: imgTranslations.alt_text || '',
      };
    });
  }

  /**
   * Get placeholder image URL
   * Requirements: 4.6
   */
  getPlaceholderImageUrl(): string {
    return this.placeholderImageUrl;
  }

  /**
   * Generate a unique image ID
   * In production, this would be handled by S3/Cloudinary
   */
  private generateImageId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Store translations for image caption and alt text
   */
  private async storeImageTranslations(
    imageId: string,
    caption: string,
    altText: string
  ): Promise<void> {
    // Store caption translation
    await db.query(`
      INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
      VALUES ('image', $1, 'en', 'caption', $2)
      ON CONFLICT (entity_type, entity_id, language_code, field_name)
      DO UPDATE SET content = EXCLUDED.content
    `, [imageId, caption]);

    // Store alt text translation
    await db.query(`
      INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
      VALUES ('image', $1, 'en', 'alt_text', $2)
      ON CONFLICT (entity_type, entity_id, language_code, field_name)
      DO UPDATE SET content = EXCLUDED.content
    `, [imageId, altText]);
  }
}

// Export singleton instance
export const imageService = new ImageService();
