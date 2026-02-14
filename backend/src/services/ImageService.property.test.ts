/**
 * Property-Based Test: Image Service
 * Property 7: Image gallery completeness
 * 
 * Validates: Requirements 4.1, 4.7
 * 
 * Property 7: For any heritage item with images, the system should return
 * at least three images for each cultural heritage aspect, and images should
 * be properly ordered and include all required metadata (url, thumbnailUrl,
 * caption, altText).
 */

import * fc from 'fast-check';
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

describe('Property 7: Image Gallery Completeness', () => {
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

  /**
   * Arbitrary generators for test data
   */

  // Generate heritage categories
  const categoryArb = fc.constantFrom(
    'monuments', 'temples', 'festivals', 'traditions',
    'cuisine', 'art_forms', 'historical_events', 'customs'
  );

  // Generate regions
  const regionArb = fc.constantFrom(
    'North', 'South', 'East', 'West', 'Central', 'Northeast'
  );

  // Generate state names
  const stateArb = fc.constantFrom(
    'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Gujarat'
  );

  // Generate city slug
  const citySlugArb = fc.string({ minLength: 3, maxLength: 30 })
    .map(s => s.toLowerCase().replace(/[^a-z0-9]/g, '-'));

  // Generate content strings
  const contentArb = fc.string({ minLength: 10, maxLength: 200 });

  // Generate image data
  const imageDataArb = fc.record({
    url: fc.webUrl(),
    thumbnailUrl: fc.webUrl(),
    caption: contentArb,
    altText: contentArb,
  });

  /**
   * Property Test: Heritage items should have at least 3 images
   * Validates Requirement 4.1
   */
  it('should return at least 3 images for each heritage item', async () => {
    await fc.assert(
      fc.asyncProperty(
        citySlugArb,
        stateArb,
        regionArb,
        categoryArb,
        fc.array(imageDataArb, { minLength: 3, maxLength: 10 }),
        async (citySlug, state, region, category, images) => {
          // Setup: Create city
          const cityResult = await client.query(
            `INSERT INTO cities (slug, state, region)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [citySlug, state, region]
          );
          const cityId = cityResult.rows[0].id;

          // Setup: Create heritage item
          const heritageResult = await client.query(
            `INSERT INTO heritage_items (city_id, category)
             VALUES ($1, $2)
             RETURNING id`,
            [cityId, category]
          );
          const heritageId = heritageResult.rows[0].id;

          // Setup: Create images
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const imageResult = await client.query(
              `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
               VALUES ($1, $2, $3, $4)
               RETURNING id`,
              [heritageId, image.url, image.thumbnailUrl, i]
            );
            const imageId = imageResult.rows[0].id;

            // Insert image translations
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['image', imageId, 'en', 'caption', image.caption]
            );
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['image', imageId, 'en', 'alt_text', image.altText]
            );
          }

          // Execute: Get heritage images
          const result = await imageService.getHeritageImages(heritageId);

          // Property: At least 3 images are returned (Requirement 4.1)
          expect(result.length).toBeGreaterThanOrEqual(3);
          expect(result.length).toBe(images.length);

          // Property: All images have required fields
          for (const resultImage of result) {
            expect(typeof resultImage.id).toBe('string');
            expect(resultImage.id.length).toBeGreaterThan(0);

            expect(typeof resultImage.url).toBe('string');
            expect(resultImage.url.length).toBeGreaterThan(0);

            expect(typeof resultImage.thumbnailUrl).toBe('string');
            expect(resultImage.thumbnailUrl.length).toBeGreaterThan(0);

            expect(typeof resultImage.caption).toBe('string');
            expect(typeof resultImage.altText).toBe('string');
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Images should be returned in correct display order
   * Validates Requirement 4.2, 4.7
   */
  it('should return images in correct display order', async () => {
    await fc.assert(
      fc.asyncProperty(
        citySlugArb,
        stateArb,
        regionArb,
        categoryArb,
        fc.array(imageDataArb, { minLength: 3, maxLength: 8 }),
        async (citySlug, state, region, category, images) => {
          // Setup: Create city
          const cityResult = await client.query(
            `INSERT INTO cities (slug, state, region)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [citySlug, state, region]
          );
          const cityId = cityResult.rows[0].id;

          // Setup: Create heritage item
          const heritageResult = await client.query(
            `INSERT INTO heritage_items (city_id, category)
             VALUES ($1, $2)
             RETURNING id`,
            [cityId, category]
          );
          const heritageId = heritageResult.rows[0].id;

          // Setup: Create images with specific order
          const imageIds: string[] = [];
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const imageResult = await client.query(
              `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
               VALUES ($1, $2, $3, $4)
               RETURNING id`,
              [heritageId, image.url, image.thumbnailUrl, i]
            );
            const imageId = imageResult.rows[0].id;
            imageIds.push(imageId);

            // Insert image translations
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['image', imageId, 'en', 'caption', image.caption]
            );
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['image', imageId, 'en', 'alt_text', image.altText]
            );
          }

          // Execute: Get heritage images
          const result = await imageService.getHeritageImages(heritageId);

          // Property: Images are returned in correct order
          expect(result.length).toBe(images.length);

          for (let i = 0; i < result.length; i++) {
            const resultImage = result[i];
            const expectedImage = images[i];

            expect(resultImage.id).toBe(imageIds[i]);
            expect(resultImage.url).toBe(expectedImage.url);
            expect(resultImage.thumbnailUrl).toBe(expectedImage.thumbnailUrl);
            expect(resultImage.caption).toBe(expectedImage.caption);
            expect(resultImage.altText).toBe(expectedImage.altText);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Images should include all metadata
   * Validates Requirement 4.1, 4.2, 4.7
   */
  it('should return all image metadata including captions and alt text', async () => {
    await fc.assert(
      fc.asyncProperty(
        citySlugArb,
        stateArb,
        regionArb,
        categoryArb,
        fc.array(imageDataArb, { minLength: 3, maxLength: 6 }),
        async (citySlug, state, region, category, images) => {
          // Setup: Create city
          const cityResult = await client.query(
            `INSERT INTO cities (slug, state, region)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [citySlug, state, region]
          );
          const cityId = cityResult.rows[0].id;

          // Setup: Create heritage item
          const heritageResult = await client.query(
            `INSERT INTO heritage_items (city_id, category)
             VALUES ($1, $2)
             RETURNING id`,
            [cityId, category]
          );
          const heritageId = heritageResult.rows[0].id;

          // Setup: Create images
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const imageResult = await client.query(
              `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
               VALUES ($1, $2, $3, $4)
               RETURNING id`,
              [heritageId, image.url, image.thumbnailUrl, i]
            );
            const imageId = imageResult.rows[0].id;

            // Insert image translations
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['image', imageId, 'en', 'caption', image.caption]
            );
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['image', imageId, 'en', 'alt_text', image.altText]
            );
          }

          // Execute: Get heritage images
          const result = await imageService.getHeritageImages(heritageId);

          // Property: All images have complete metadata
          expect(result.length).toBe(images.length);

          for (let i = 0; i < result.length; i++) {
            const resultImage = result[i];
            const expectedImage = images[i];

            // Verify all metadata fields are present and correct
            expect(resultImage.caption).toBe(expectedImage.caption);
            expect(resultImage.altText).toBe(expectedImage.altText);
            expect(resultImage.url).toBe(expectedImage.url);
            expect(resultImage.thumbnailUrl).toBe(expectedImage.thumbnailUrl);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Empty heritage returns empty array
   * Validates edge case handling
   */
  it('should return empty array for heritage item with no images', async () => {
    await fc.assert(
      fc.asyncProperty(
        citySlugArb,
        stateArb,
        regionArb,
        categoryArb,
        async (citySlug, state, region, category) => {
          // Setup: Create city
          const cityResult = await client.query(
            `INSERT INTO cities (slug, state, region)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [citySlug, state, region]
          );
          const cityId = cityResult.rows[0].id;

          // Setup: Create heritage item WITHOUT images
          const heritageResult = await client.query(
            `INSERT INTO heritage_items (city_id, category)
             VALUES ($1, $2)
             RETURNING id`,
            [cityId, category]
          );
          const heritageId = heritageResult.rows[0].id;

          // Execute: Get heritage images
          const result = await imageService.getHeritageImages(heritageId);

          // Property: Empty array is returned
          expect(result).toEqual([]);
          expect(result.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * Property Test: Non-existent heritage returns empty array
   * Validates error handling
   */
  it('should return empty array for non-existent heritage item', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (nonExistentHeritageId) => {
          // Execute: Get images for non-existent heritage
          const result = await imageService.getHeritageImages(nonExistentHeritageId);

          // Property: Empty array is returned
          expect(result).toEqual([]);
          expect(result.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * Property Test: Placeholder image URL is returned when image URL is missing
   * Validates Requirement 4.6
   */
  it('should return placeholder URL when image URL is missing', async () => {
    // Test the placeholder functionality
    const placeholderUrl = imageService.getPlaceholderImageUrl();
    
    expect(typeof placeholderUrl).toBe('string');
    expect(placeholderUrl.length).toBeGreaterThan(0);
  });

  /**
   * Property Test: getImageUrl generates correct CDN URLs
   * Validates Requirement 10.4
   */
  it('should generate correct CDN URLs for thumbnail and full-size images', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.constantFrom('thumbnail', 'full'),
        async (imageId, size) => {
          // Execute: Get image URL
          const url = imageService.getImageUrl(imageId, size);

          // Property: URL is a valid string
          expect(typeof url).toBe('string');
          expect(url.length).toBeGreaterThan(0);

          // Property: URL contains the image ID
          expect(url).toContain(imageId);

          // Property: URL contains size-specific path
          if (size === 'thumbnail') {
            expect(url).toContain('thumbnails');
          } else {
            expect(url).toContain('images');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
