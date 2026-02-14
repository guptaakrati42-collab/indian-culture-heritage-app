/**
 * Property-Based Test: Heritage Service
 * Property 4: Heritage detail expansion
 * Property 6: Category filtering correctness
 * 
 * Validates: Requirements 3.2, 3.3, 3.4, 3.6, 6.7
 * 
 * Property 4: For any heritage item, when requesting detailed information,
 * the system should return all required fields (name, summary, detailed description,
 * historical period, significance) in the requested language with fallback to English.
 * 
 * Property 6: Category filtering should return only heritage items matching
 * the specified category.
 */

import * as fc from 'fast-check';
import { Pool, PoolClient } from 'pg';
import { HeritageService } from './HeritageService';

// Test database configuration
const TEST_DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'indian_culture_test',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

describe('Property 4: Heritage Detail Expansion', () => {
  let testPool: Pool;
  let client: PoolClient;
  let heritageService: HeritageService;

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

    heritageService = new HeritageService();
  });

  afterAll(async () => {
    if (client) client.release();
    if (testPool) await testPool.end();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await client.query('DELETE FROM translations WHERE entity_type IN (\'heritage\', \'image\')');
    await client.query('DELETE FROM images');
    await client.query('DELETE FROM heritage_items');
    await client.query('DELETE FROM cities');
  });

  /**
   * Arbitrary generators for test data
   */

  // Generate valid language codes
  const languageCodeArb = fc.constantFrom(
    'en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa'
  );

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
  const longContentArb = fc.string({ minLength: 50, maxLength: 500 });

  // Generate historical period
  const historicalPeriodArb = fc.constantFrom(
    '10th Century', '15th Century', '18th Century', 'Ancient', 'Medieval', 'Modern'
  );

  /**
   * Property Test: Heritage detail expansion returns all required fields
   * Validates Requirements 3.2, 3.3, 3.4
   */
  it('should return all required fields when expanding heritage details', async () => {
    await fc.assert(
      fc.asyncProperty(
        citySlugArb,
        stateArb,
        regionArb,
        languageCodeArb,
        categoryArb,
        historicalPeriodArb,
        contentArb,
        contentArb,
        longContentArb,
        longContentArb,
        async (
          citySlug,
          state,
          region,
          language,
          category,
          historicalPeriod,
          name,
          summary,
          detailedDescription,
          significance
        ) => {
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
            `INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [cityId, category, historicalPeriod, 'https://example.com/thumb.jpg']
          );
          const heritageId = heritageResult.rows[0].id;

          // Insert heritage translations
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, language, 'name', name]
          );
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, language, 'summary', summary]
          );
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, language, 'detailed_description', detailedDescription]
          );
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, language, 'significance', significance]
          );

          // Execute: Get heritage details
          const result = await heritageService.getHeritageById(heritageId, language);

          // Verify: Result is not null
          expect(result).not.toBeNull();

          if (result) {
            // Property: All required fields are present and have correct types
            expect(result.id).toBe(heritageId);
            expect(typeof result.id).toBe('string');

            expect(result.name).toBe(name);
            expect(typeof result.name).toBe('string');
            expect(result.name.length).toBeGreaterThan(0);

            expect(result.category).toBe(category);
            expect(typeof result.category).toBe('string');

            expect(result.summary).toBe(summary);
            expect(typeof result.summary).toBe('string');
            expect(result.summary.length).toBeGreaterThan(0);

            expect(result.detailedDescription).toBe(detailedDescription);
            expect(typeof result.detailedDescription).toBe('string');
            expect(result.detailedDescription.length).toBeGreaterThan(0);

            expect(result.historicalPeriod).toBe(historicalPeriod);
            expect(typeof result.historicalPeriod).toBe('string');

            expect(result.significance).toBe(significance);
            expect(typeof result.significance).toBe('string');
            expect(result.significance.length).toBeGreaterThan(0);

            expect(Array.isArray(result.images)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Heritage detail expansion with fallback to English
   * Validates Requirements 3.2, 3.3, 3.4
   */
  it('should fallback to English when translation is not available', async () => {
    await fc.assert(
      fc.asyncProperty(
        citySlugArb,
        stateArb,
        regionArb,
        languageCodeArb.filter(lang => lang !== 'en'),
        categoryArb,
        historicalPeriodArb,
        contentArb,
        contentArb,
        longContentArb,
        longContentArb,
        async (
          citySlug,
          state,
          region,
          language,
          category,
          historicalPeriod,
          name,
          summary,
          detailedDescription,
          significance
        ) => {
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
            `INSERT INTO heritage_items (city_id, category, historical_period)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [cityId, category, historicalPeriod]
          );
          const heritageId = heritageResult.rows[0].id;

          // Insert ONLY English translations (no translation in requested language)
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, 'en', 'name', name]
          );
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, 'en', 'summary', summary]
          );
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, 'en', 'detailed_description', detailedDescription]
          );
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, 'en', 'significance', significance]
          );

          // Execute: Get heritage details in non-English language
          const result = await heritageService.getHeritageById(heritageId, language);

          // Verify: Result is not null
          expect(result).not.toBeNull();

          if (result) {
            // Property: English translations are returned as fallback
            expect(result.name).toBe(name);
            expect(result.summary).toBe(summary);
            expect(result.detailedDescription).toBe(detailedDescription);
            expect(result.significance).toBe(significance);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Heritage detail expansion includes images
   * Validates Requirements 3.2, 4.1, 4.2
   */
  it('should include all images when expanding heritage details', async () => {
    await fc.assert(
      fc.asyncProperty(
        citySlugArb,
        stateArb,
        regionArb,
        languageCodeArb,
        categoryArb,
        contentArb,
        fc.array(
          fc.record({
            url: fc.webUrl(),
            thumbnailUrl: fc.webUrl(),
            caption: contentArb,
            altText: contentArb,
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (citySlug, state, region, language, category, name, images) => {
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

          // Insert heritage translations
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, language, 'name', name]
          );
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, language, 'summary', 'Summary']
          );
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, language, 'detailed_description', 'Description']
          );
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, language, 'significance', 'Significance']
          );

          // Setup: Create images
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

          // Execute: Get heritage details
          const result = await heritageService.getHeritageById(heritageId, language);

          // Verify: Result is not null
          expect(result).not.toBeNull();

          if (result) {
            // Property: All images are included
            expect(result.images.length).toBe(images.length);

            // Property: Images are in correct order
            for (let i = 0; i < result.images.length; i++) {
              const resultImage = result.images[i];
              const expectedImage = images[i];

              expect(resultImage.id).toBe(imageIds[i]);
              expect(resultImage.url).toBe(expectedImage.url);
              expect(resultImage.thumbnailUrl).toBe(expectedImage.thumbnailUrl);
              expect(resultImage.caption).toBe(expectedImage.caption);
              expect(resultImage.altText).toBe(expectedImage.altText);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Non-existent heritage returns null
   * Validates error handling
   */
  it('should return null for non-existent heritage item', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        languageCodeArb,
        async (nonExistentHeritageId, language) => {
          // Execute: Get heritage for non-existent ID
          const result = await heritageService.getHeritageById(nonExistentHeritageId, language);

          // Verify: Null is returned
          expect(result).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);
});


describe('Property 6: Category Filtering Correctness', () => {
  let testPool: Pool;
  let client: PoolClient;
  let heritageService: HeritageService;

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

    heritageService = new HeritageService();
  });

  afterAll(async () => {
    if (client) client.release();
    if (testPool) await testPool.end();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await client.query('DELETE FROM translations WHERE entity_type = \'heritage\'');
    await client.query('DELETE FROM images');
    await client.query('DELETE FROM heritage_items');
    await client.query('DELETE FROM cities');
  });

  /**
   * Arbitrary generators for test data
   */

  const languageCodeArb = fc.constantFrom('en', 'hi', 'bn', 'te', 'mr', 'ta');

  const categoryArb = fc.constantFrom(
    'monuments', 'temples', 'festivals', 'traditions',
    'cuisine', 'art_forms', 'historical_events', 'customs'
  );

  const regionArb = fc.constantFrom('North', 'South', 'East', 'West', 'Central', 'Northeast');

  const stateArb = fc.constantFrom('Maharashtra', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Gujarat');

  const citySlugArb = fc.string({ minLength: 3, maxLength: 30 })
    .map(s => s.toLowerCase().replace(/[^a-z0-9]/g, '-'));

  const contentArb = fc.string({ minLength: 10, maxLength: 200 });

  /**
   * Property Test: Category filtering returns only matching heritage items
   * Validates Requirements 3.6, 6.7
   */
  it('should return only heritage items matching the specified category', async () => {
    await fc.assert(
      fc.asyncProperty(
        citySlugArb,
        stateArb,
        regionArb,
        languageCodeArb,
        categoryArb,
        fc.array(categoryArb, { minLength: 3, maxLength: 10 }),
        async (citySlug, state, region, language, filterCategory, categories) => {
          // Setup: Create city
          const cityResult = await client.query(
            `INSERT INTO cities (slug, state, region)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [citySlug, state, region]
          );
          const cityId = cityResult.rows[0].id;

          // Setup: Create heritage items with various categories
          const expectedCount = categories.filter(c => c === filterCategory).length;
          
          for (const category of categories) {
            const heritageResult = await client.query(
              `INSERT INTO heritage_items (city_id, category, thumbnail_image_url)
               VALUES ($1, $2, $3)
               RETURNING id`,
              [cityId, category, 'https://example.com/thumb.jpg']
            );
            const heritageId = heritageResult.rows[0].id;

            // Insert heritage translations
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['heritage', heritageId, language, 'name', `Heritage ${category}`]
            );
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['heritage', heritageId, language, 'summary', `Summary for ${category}`]
            );
          }

          // Execute: Get heritage by category
          const result = await heritageService.getHeritageByCategory(cityId, filterCategory, language);

          // Verify: Only items with the specified category are returned
          expect(result.length).toBe(expectedCount);

          // Property: All returned items have the filtered category
          for (const item of result) {
            expect(item.category).toBe(filterCategory);
            expect(typeof item.id).toBe('string');
            expect(typeof item.name).toBe('string');
            expect(typeof item.summary).toBe('string');
            expect(typeof item.thumbnailImage).toBe('string');
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Empty category returns empty array
   * Validates edge case handling
   */
  it('should return empty array when no heritage items match the category', async () => {
    await fc.assert(
      fc.asyncProperty(
        citySlugArb,
        stateArb,
        regionArb,
        languageCodeArb,
        categoryArb,
        categoryArb.filter((c1, c2) => c1 !== c2),
        async (citySlug, state, region, language, existingCategory, filterCategory) => {
          // Setup: Create city
          const cityResult = await client.query(
            `INSERT INTO cities (slug, state, region)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [citySlug, state, region]
          );
          const cityId = cityResult.rows[0].id;

          // Setup: Create heritage items with different category
          const heritageResult = await client.query(
            `INSERT INTO heritage_items (city_id, category)
             VALUES ($1, $2)
             RETURNING id`,
            [cityId, existingCategory]
          );
          const heritageId = heritageResult.rows[0].id;

          // Insert heritage translations
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, language, 'name', 'Heritage Name']
          );
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['heritage', heritageId, language, 'summary', 'Summary']
          );

          // Execute: Get heritage by different category
          const result = await heritageService.getHeritageByCategory(cityId, filterCategory, language);

          // Verify: Empty array is returned
          expect(result).toEqual([]);
          expect(result.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * Property Test: Non-existent city returns empty array
   * Validates error handling
   */
  it('should return empty array for non-existent city', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        categoryArb,
        languageCodeArb,
        async (nonExistentCityId, category, language) => {
          // Execute: Get heritage for non-existent city
          const result = await heritageService.getHeritageByCategory(
            nonExistentCityId,
            category,
            language
          );

          // Verify: Empty array is returned
          expect(result).toEqual([]);
          expect(result.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);
});
