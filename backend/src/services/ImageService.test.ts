/**
 * Unit Tests: Image Service
 * 
 * Validates: Requirements 4.1, 4.2, 4.6
 * 
 * Tests specific examples and edge cases for ImageService functionality:
 * - Image URL generation
 * - Thumbnail vs full-size URL handling
 * - Placeholder image fallback
 */

import { Pool, PoolClient } from 'pg';
import { ImageService } from './ImageService';

// Test database configuration
const TEST_DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'indian_culture_test',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

describe('ImageService Unit Tests', () => {
  let testPool: Pool;
  let client: PoolClient;
  let imageService: ImageService;

  beforeAll(async () => {
    // Create a separate pool for testing
    testPool = new Pool(TEST_DB_CONFIG);
    
    // Wait for database to be ready
    let retries = 5;
    while (retries > 0) {
      try {
        client = await testPool.connect();
        await client.query('SELECT 1');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    imageService = new ImageService();
  });

  afterAll(async () => {
    if (client) client.release();
    if (testPool) await testPool.end();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await client.query('DELETE FROM translations WHERE entity_type = \'image\'');
    await client.query('DELETE FROM images');
    await client.query('DELETE FROM heritage_items');
    await client.query('DELETE FROM cities');
  });

  describe('getImageUrl', () => {
    /**
     * Test: Generate thumbnail URL
     * Validates Requirement 4.1, 4.2
     */
    it('should generate correct thumbnail URL', () => {
      const imageId = 'test-image-123';
      const url = imageService.getImageUrl(imageId, 'thumbnail');

      expect(url).toContain('thumbnails');
      expect(url).toContain(imageId);
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });

    /**
     * Test: Generate full-size URL
     * Validates Requirement 4.1, 4.2
     */
    it('should generate correct full-size URL', () => {
      const imageId = 'test-image-456';
      const url = imageService.getImageUrl(imageId, 'full');

      expect(url).toContain('images');
      expect(url).toContain(imageId);
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });

    /**
     * Test: Return placeholder for empty image ID
     * Validates Requirement 4.6
     */
    it('should return placeholder URL for empty image ID', () => {
      const url = imageService.getImageUrl('', 'thumbnail');
      const placeholderUrl = imageService.getPlaceholderImageUrl();

      expect(url).toBe(placeholderUrl);
    });

    /**
     * Test: Different URLs for thumbnail vs full-size
     * Validates Requirement 4.2
     */
    it('should generate different URLs for thumbnail and full-size', () => {
      const imageId = 'test-image-789';
      const thumbnailUrl = imageService.getImageUrl(imageId, 'thumbnail');
      const fullUrl = imageService.getImageUrl(imageId, 'full');

      expect(thumbnailUrl).not.toBe(fullUrl);
      expect(thumbnailUrl).toContain('thumbnails');
      expect(fullUrl).toContain('images');
    });
  });

  describe('getPlaceholderImageUrl', () => {
    /**
     * Test: Placeholder URL is valid
     * Validates Requirement 4.6
     */
    it('should return a valid placeholder URL', () => {
      const placeholderUrl = imageService.getPlaceholderImageUrl();

      expect(typeof placeholderUrl).toBe('string');
      expect(placeholderUrl.length).toBeGreaterThan(0);
      expect(placeholderUrl).toMatch(/^https?:\/\//);
    });
  });

  describe('getHeritageImages', () => {
    /**
     * Test: Retrieve images for heritage item
     * Validates Requirements 4.1, 4.2
     */
    it('should retrieve all images for a heritage item', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['mumbai', 'Maharashtra', 'West']
      );
      const cityId = cityResult.rows[0].id;

      // Setup: Create heritage item
      const heritageResult = await client.query(
        `INSERT INTO heritage_items (city_id, category)
         VALUES ($1, $2)
         RETURNING id`,
        [cityId, 'monuments']
      );
      const heritageId = heritageResult.rows[0].id;

      // Setup: Create images
      const image1Result = await client.query(
        `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [heritageId, 'https://cdn.example.com/gateway1.jpg', 'https://cdn.example.com/gateway1-thumb.jpg', 0]
      );
      const image1Id = image1Result.rows[0].id;

      const image2Result = await client.query(
        `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [heritageId, 'https://cdn.example.com/gateway2.jpg', 'https://cdn.example.com/gateway2-thumb.jpg', 1]
      );
      const image2Id = image2Result.rows[0].id;

      // Insert image translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['image', image1Id, 'en', 'caption', 'Gateway of India - Front View']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['image', image1Id, 'en', 'alt_text', 'Front view of Gateway of India monument']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['image', image2Id, 'en', 'caption', 'Gateway of India - Side View']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['image', image2Id, 'en', 'alt_text', 'Side view of Gateway of India monument']
      );

      // Execute
      const images = await imageService.getHeritageImages(heritageId);

      // Verify
      expect(images).toHaveLength(2);
      
      expect(images[0].id).toBe(image1Id);
      expect(images[0].url).toBe('https://cdn.example.com/gateway1.jpg');
      expect(images[0].thumbnailUrl).toBe('https://cdn.example.com/gateway1-thumb.jpg');
      expect(images[0].caption).toBe('Gateway of India - Front View');
      expect(images[0].altText).toBe('Front view of Gateway of India monument');

      expect(images[1].id).toBe(image2Id);
      expect(images[1].url).toBe('https://cdn.example.com/gateway2.jpg');
      expect(images[1].thumbnailUrl).toBe('https://cdn.example.com/gateway2-thumb.jpg');
      expect(images[1].caption).toBe('Gateway of India - Side View');
      expect(images[1].altText).toBe('Side view of Gateway of India monument');
    });

    /**
     * Test: Images returned in correct display order
     * Validates Requirement 4.2
     */
    it('should return images in correct display order', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['jaipur', 'Rajasthan', 'North']
      );
      const cityId = cityResult.rows[0].id;

      // Setup: Create heritage item
      const heritageResult = await client.query(
        `INSERT INTO heritage_items (city_id, category)
         VALUES ($1, $2)
         RETURNING id`,
        [cityId, 'monuments']
      );
      const heritageId = heritageResult.rows[0].id;

      // Setup: Create images in specific order
      const imageIds: string[] = [];
      for (let i = 0; i < 5; i++) {
        const imageResult = await client.query(
          `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [heritageId, `https://cdn.example.com/image${i}.jpg`, `https://cdn.example.com/image${i}-thumb.jpg`, i]
        );
        const imageId = imageResult.rows[0].id;
        imageIds.push(imageId);

        // Insert image translations
        await client.query(
          `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
           VALUES ($1, $2, $3, $4, $5)`,
          ['image', imageId, 'en', 'caption', `Image ${i}`]
        );
        await client.query(
          `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
           VALUES ($1, $2, $3, $4, $5)`,
          ['image', imageId, 'en', 'alt_text', `Alt text ${i}`]
        );
      }

      // Execute
      const images = await imageService.getHeritageImages(heritageId);

      // Verify: Images are in correct order
      expect(images).toHaveLength(5);
      for (let i = 0; i < 5; i++) {
        expect(images[i].id).toBe(imageIds[i]);
        expect(images[i].caption).toBe(`Image ${i}`);
      }
    });

    /**
     * Test: Return empty array for heritage with no images
     * Validates edge case handling
     */
    it('should return empty array for heritage item with no images', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['kolkata', 'West Bengal', 'East']
      );
      const cityId = cityResult.rows[0].id;

      // Setup: Create heritage item WITHOUT images
      const heritageResult = await client.query(
        `INSERT INTO heritage_items (city_id, category)
         VALUES ($1, $2)
         RETURNING id`,
        [cityId, 'festivals']
      );
      const heritageId = heritageResult.rows[0].id;

      // Execute
      const images = await imageService.getHeritageImages(heritageId);

      // Verify
      expect(images).toEqual([]);
      expect(images).toHaveLength(0);
    });

    /**
     * Test: Return empty array for non-existent heritage
     * Validates error handling
     */
    it('should return empty array for non-existent heritage item', async () => {
      const nonExistentHeritageId = '00000000-0000-0000-0000-000000000000';

      // Execute
      const images = await imageService.getHeritageImages(nonExistentHeritageId);

      // Verify
      expect(images).toEqual([]);
      expect(images).toHaveLength(0);
    });

    /**
     * Test: Handle missing image URLs with placeholder
     * Validates Requirement 4.6
     */
    it('should use placeholder URL when image URL is null', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['chennai', 'Tamil Nadu', 'South']
      );
      const cityId = cityResult.rows[0].id;

      // Setup: Create heritage item
      const heritageResult = await client.query(
        `INSERT INTO heritage_items (city_id, category)
         VALUES ($1, $2)
         RETURNING id`,
        [cityId, 'temples']
      );
      const heritageId = heritageResult.rows[0].id;

      // Setup: Create image with null URLs
      const imageResult = await client.query(
        `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [heritageId, null, null, 0]
      );
      const imageId = imageResult.rows[0].id;

      // Insert image translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['image', imageId, 'en', 'caption', 'Temple Image']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['image', imageId, 'en', 'alt_text', 'Temple alt text']
      );

      // Execute
      const images = await imageService.getHeritageImages(heritageId);

      // Verify: Placeholder URL is used
      expect(images).toHaveLength(1);
      expect(images[0].url).toBe(imageService.getPlaceholderImageUrl());
      expect(images[0].thumbnailUrl).toBe(imageService.getPlaceholderImageUrl());
    });
  });

  describe('uploadImage', () => {
    /**
     * Test: Upload image with metadata
     * Validates Requirements 4.1, 4.2, 4.3
     */
    it('should upload image and store metadata', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['bangalore', 'Karnataka', 'South']
      );
      const cityId = cityResult.rows[0].id;

      // Setup: Create heritage item
      const heritageResult = await client.query(
        `INSERT INTO heritage_items (city_id, category)
         VALUES ($1, $2)
         RETURNING id`,
        [cityId, 'monuments']
      );
      const heritageId = heritageResult.rows[0].id;

      // Execute: Upload image
      const imageBuffer = Buffer.from('fake-image-data');
      const metadata = {
        heritageId,
        caption: 'Beautiful palace view',
        altText: 'Palace architecture',
      };

      const uploadedImage = await imageService.uploadImage(imageBuffer, metadata);

      // Verify
      expect(uploadedImage.id).toBeDefined();
      expect(uploadedImage.url).toContain(uploadedImage.id);
      expect(uploadedImage.thumbnailUrl).toContain(uploadedImage.id);
      expect(uploadedImage.caption).toBe('Beautiful palace view');
      expect(uploadedImage.altText).toBe('Palace architecture');

      // Verify image is in database
      const images = await imageService.getHeritageImages(heritageId);
      expect(images).toHaveLength(1);
      expect(images[0].id).toBe(uploadedImage.id);
    });

    /**
     * Test: Multiple image uploads maintain correct order
     * Validates Requirement 4.2
     */
    it('should maintain correct display order for multiple uploads', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['hyderabad', 'Telangana', 'South']
      );
      const cityId = cityResult.rows[0].id;

      // Setup: Create heritage item
      const heritageResult = await client.query(
        `INSERT INTO heritage_items (city_id, category)
         VALUES ($1, $2)
         RETURNING id`,
        [cityId, 'monuments']
      );
      const heritageId = heritageResult.rows[0].id;

      // Execute: Upload multiple images
      const imageBuffer = Buffer.from('fake-image-data');
      const uploadedImages = [];

      for (let i = 0; i < 3; i++) {
        const metadata = {
          heritageId,
          caption: `Image ${i}`,
          altText: `Alt ${i}`,
        };
        const uploadedImage = await imageService.uploadImage(imageBuffer, metadata);
        uploadedImages.push(uploadedImage);
      }

      // Verify: Images are in correct order
      const images = await imageService.getHeritageImages(heritageId);
      expect(images).toHaveLength(3);
      
      for (let i = 0; i < 3; i++) {
        expect(images[i].id).toBe(uploadedImages[i].id);
        expect(images[i].caption).toBe(`Image ${i}`);
      }
    });
  });

  describe('deleteImage', () => {
    /**
     * Test: Delete image and its metadata
     * Validates Requirements 4.1, 4.2
     */
    it('should delete image and all associated data', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['pune', 'Maharashtra', 'West']
      );
      const cityId = cityResult.rows[0].id;

      // Setup: Create heritage item
      const heritageResult = await client.query(
        `INSERT INTO heritage_items (city_id, category)
         VALUES ($1, $2)
         RETURNING id`,
        [cityId, 'monuments']
      );
      const heritageId = heritageResult.rows[0].id;

      // Setup: Create image
      const imageResult = await client.query(
        `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [heritageId, 'https://cdn.example.com/test.jpg', 'https://cdn.example.com/test-thumb.jpg', 0]
      );
      const imageId = imageResult.rows[0].id;

      // Insert image translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['image', imageId, 'en', 'caption', 'Test caption']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['image', imageId, 'en', 'alt_text', 'Test alt text']
      );

      // Verify image exists
      let images = await imageService.getHeritageImages(heritageId);
      expect(images).toHaveLength(1);

      // Execute: Delete image
      await imageService.deleteImage(imageId);

      // Verify: Image is deleted
      images = await imageService.getHeritageImages(heritageId);
      expect(images).toHaveLength(0);

      // Verify: Translations are deleted
      const translations = await client.query(
        `SELECT * FROM translations WHERE entity_type = 'image' AND entity_id = $1`,
        [imageId]
      );
      expect(translations.rows).toHaveLength(0);
    });
  });
});
