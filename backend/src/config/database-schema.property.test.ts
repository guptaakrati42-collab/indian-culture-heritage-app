/**
 * Property-Based Test: Database Schema Integrity
 * Property 14: Data persistence round-trip
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 8.1
 * 
 * This test validates that data can be stored and retrieved correctly (round-trip)
 * for all entity types: cities, heritage items, images, and translations.
 */

import * as fc from 'fast-check';
import { Pool, PoolClient } from 'pg';
import { db } from './database';

// Test database configuration
const TEST_DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'indian_culture_test',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

describe('Property 14: Data Persistence Round-Trip', () => {
  let testPool: Pool;
  let client: PoolClient;

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
  });

  afterAll(async () => {
    if (client) client.release();
    if (testPool) await testPool.end();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await client.query('DELETE FROM images');
    await client.query('DELETE FROM translations WHERE entity_type IN (\'city\', \'heritage\', \'image\')');
    await client.query('DELETE FROM heritage_items');
    await client.query('DELETE FROM cities');
  });

  /**
   * Arbitrary generators for test data
   */

  // Generate valid UUID v4
  const uuidArb = fc.uuid();

  // Generate valid language codes from the 23 supported languages
  const languageCodeArb = fc.constantFrom(
    'en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa', 'as',
    'ks', 'kok', 'mni', 'ne', 'sa', 'sd', 'ur', 'brx', 'sat', 'mai', 'doi'
  );

  // Generate valid heritage categories
  const categoryArb = fc.constantFrom(
    'monuments', 'temples', 'festivals', 'traditions',
    'cuisine', 'art_forms', 'historical_events', 'customs'
  );

  // Generate valid region names
  const regionArb = fc.constantFrom(
    'North', 'South', 'East', 'West', 'Central', 'Northeast'
  );

  // Generate city data
  const cityArb = fc.record({
    slug: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz-'.split('')), { minLength: 3, maxLength: 50 }),
    state: fc.string({ minLength: 3, maxLength: 50 }),
    region: regionArb,
    preview_image_url: fc.option(fc.webUrl(), { nil: null }),
  });

  // Generate heritage item data
  const heritageItemArb = fc.record({
    category: categoryArb,
    historical_period: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: null }),
    thumbnail_image_url: fc.option(fc.webUrl(), { nil: null }),
  });

  // Generate translation data
  const translationArb = fc.record({
    entity_type: fc.constantFrom('city', 'heritage', 'image'),
    field_name: fc.constantFrom('name', 'summary', 'description', 'caption', 'alt_text'),
    content: fc.string({ minLength: 1, maxLength: 500 }),
  });

  // Generate image data
  const imageArb = fc.record({
    url: fc.webUrl(),
    thumbnail_url: fc.webUrl(),
    display_order: fc.integer({ min: 0, max: 100 }),
  });

  /**
   * Property Test: City data round-trip
   * Validates Requirement 5.1 and 8.1
   */
  it('should persist and retrieve city data correctly', async () => {
    await fc.assert(
      fc.asyncProperty(cityArb, async (cityData) => {
        // Insert city
        const insertResult = await client.query(
          `INSERT INTO cities (slug, state, region, preview_image_url)
           VALUES ($1, $2, $3, $4)
           RETURNING id, slug, state, region, preview_image_url, created_at, updated_at`,
          [cityData.slug, cityData.state, cityData.region, cityData.preview_image_url]
        );

        const insertedCity = insertResult.rows[0];

        // Retrieve city
        const selectResult = await client.query(
          'SELECT id, slug, state, region, preview_image_url FROM cities WHERE id = $1',
          [insertedCity.id]
        );

        const retrievedCity = selectResult.rows[0];

        // Verify round-trip
        expect(retrievedCity).toBeDefined();
        expect(retrievedCity.slug).toBe(cityData.slug);
        expect(retrievedCity.state).toBe(cityData.state);
        expect(retrievedCity.region).toBe(cityData.region);
        expect(retrievedCity.preview_image_url).toBe(cityData.preview_image_url);

        // Clean up
        await client.query('DELETE FROM cities WHERE id = $1', [insertedCity.id]);
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property Test: Heritage item data round-trip
   * Validates Requirement 5.2 and 8.1
   */
  it('should persist and retrieve heritage item data correctly', async () => {
    await fc.assert(
      fc.asyncProperty(cityArb, heritageItemArb, async (cityData, heritageData) => {
        // First insert a city
        const cityResult = await client.query(
          `INSERT INTO cities (slug, state, region)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [cityData.slug, cityData.state, cityData.region]
        );

        const cityId = cityResult.rows[0].id;

        // Insert heritage item
        const insertResult = await client.query(
          `INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
           VALUES ($1, $2, $3, $4)
           RETURNING id, city_id, category, historical_period, thumbnail_image_url`,
          [cityId, heritageData.category, heritageData.historical_period, heritageData.thumbnail_image_url]
        );

        const insertedHeritage = insertResult.rows[0];

        // Retrieve heritage item
        const selectResult = await client.query(
          'SELECT id, city_id, category, historical_period, thumbnail_image_url FROM heritage_items WHERE id = $1',
          [insertedHeritage.id]
        );

        const retrievedHeritage = selectResult.rows[0];

        // Verify round-trip
        expect(retrievedHeritage).toBeDefined();
        expect(retrievedHeritage.city_id).toBe(cityId);
        expect(retrievedHeritage.category).toBe(heritageData.category);
        expect(retrievedHeritage.historical_period).toBe(heritageData.historical_period);
        expect(retrievedHeritage.thumbnail_image_url).toBe(heritageData.thumbnail_image_url);

        // Verify referential integrity (Requirement 8.2)
        await client.query('DELETE FROM cities WHERE id = $1', [cityId]);
        const afterDelete = await client.query(
          'SELECT id FROM heritage_items WHERE id = $1',
          [insertedHeritage.id]
        );
        expect(afterDelete.rows.length).toBe(0); // Should be cascade deleted
      }),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property Test: Translation data round-trip
   * Validates Requirement 5.3, 5.4 and 8.1
   */
  it('should persist and retrieve translation data correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        cityArb,
        languageCodeArb,
        translationArb,
        async (cityData, languageCode, translationData) => {
          // First insert a city
          const cityResult = await client.query(
            `INSERT INTO cities (slug, state, region)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [cityData.slug, cityData.state, cityData.region]
          );

          const entityId = cityResult.rows[0].id;

          // Insert translation
          const insertResult = await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, entity_type, entity_id, language_code, field_name, content`,
            ['city', entityId, languageCode, translationData.field_name, translationData.content]
          );

          const insertedTranslation = insertResult.rows[0];

          // Retrieve translation
          const selectResult = await client.query(
            `SELECT entity_type, entity_id, language_code, field_name, content
             FROM translations
             WHERE id = $1`,
            [insertedTranslation.id]
          );

          const retrievedTranslation = selectResult.rows[0];

          // Verify round-trip
          expect(retrievedTranslation).toBeDefined();
          expect(retrievedTranslation.entity_type).toBe('city');
          expect(retrievedTranslation.entity_id).toBe(entityId);
          expect(retrievedTranslation.language_code).toBe(languageCode);
          expect(retrievedTranslation.field_name).toBe(translationData.field_name);
          expect(retrievedTranslation.content).toBe(translationData.content);

          // Clean up
          await client.query('DELETE FROM cities WHERE id = $1', [entityId]);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property Test: Image data round-trip
   * Validates Requirement 5.3 and 8.1
   */
  it('should persist and retrieve image data correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        cityArb,
        heritageItemArb,
        imageArb,
        async (cityData, heritageData, imageData) => {
          // First insert a city
          const cityResult = await client.query(
            `INSERT INTO cities (slug, state, region)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [cityData.slug, cityData.state, cityData.region]
          );

          const cityId = cityResult.rows[0].id;

          // Insert heritage item
          const heritageResult = await client.query(
            `INSERT INTO heritage_items (city_id, category)
             VALUES ($1, $2)
             RETURNING id`,
            [cityId, heritageData.category]
          );

          const heritageId = heritageResult.rows[0].id;

          // Insert image
          const insertResult = await client.query(
            `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
             VALUES ($1, $2, $3, $4)
             RETURNING id, heritage_id, url, thumbnail_url, display_order`,
            [heritageId, imageData.url, imageData.thumbnail_url, imageData.display_order]
          );

          const insertedImage = insertResult.rows[0];

          // Retrieve image
          const selectResult = await client.query(
            'SELECT heritage_id, url, thumbnail_url, display_order FROM images WHERE id = $1',
            [insertedImage.id]
          );

          const retrievedImage = selectResult.rows[0];

          // Verify round-trip
          expect(retrievedImage).toBeDefined();
          expect(retrievedImage.heritage_id).toBe(heritageId);
          expect(retrievedImage.url).toBe(imageData.url);
          expect(retrievedImage.thumbnail_url).toBe(imageData.thumbnail_url);
          expect(retrievedImage.display_order).toBe(imageData.display_order);

          // Verify referential integrity (Requirement 8.3)
          await client.query('DELETE FROM heritage_items WHERE id = $1', [heritageId]);
          const afterDelete = await client.query(
            'SELECT id FROM images WHERE id = $1',
            [insertedImage.id]
          );
          expect(afterDelete.rows.length).toBe(0); // Should be cascade deleted

          // Clean up
          await client.query('DELETE FROM cities WHERE id = $1', [cityId]);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property Test: Unique constraint on translations
   * Validates Requirement 5.4
   */
  it('should enforce unique constraint on translations', async () => {
    await fc.assert(
      fc.asyncProperty(
        cityArb,
        languageCodeArb,
        fc.string({ minLength: 3, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (cityData, languageCode, fieldName, content) => {
          // Insert a city
          const cityResult = await client.query(
            `INSERT INTO cities (slug, state, region)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [cityData.slug, cityData.state, cityData.region]
          );

          const entityId = cityResult.rows[0].id;

          // Insert first translation
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['city', entityId, languageCode, fieldName, content]
          );

          // Try to insert duplicate translation (should fail)
          let errorOccurred = false;
          try {
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['city', entityId, languageCode, fieldName, 'different content']
            );
          } catch (error: any) {
            errorOccurred = true;
            expect(error.code).toBe('23505'); // Unique violation error code
          }

          expect(errorOccurred).toBe(true);

          // Clean up
          await client.query('DELETE FROM cities WHERE id = $1', [entityId]);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);
});
