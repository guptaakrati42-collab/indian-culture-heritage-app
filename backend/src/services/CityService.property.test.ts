/**
 * Property-Based Test: City Service
 * Property 2: City heritage completeness
 * Property 5: City filtering correctness
 * 
 * Validates: Requirements 2.3, 2.5, 2.8, 3.5
 * 
 * Property 2: For any city with cultural heritage content, requesting heritage items
 * for that city should return all associated heritage items with all required fields
 * (id, name, category, summary, thumbnail image).
 * 
 * Property 5: City filtering by state and region should return only cities matching
 * the specified criteria.
 */

import * as fc from 'fast-check';
import { Pool, PoolClient } from 'pg';
import { CityService } from './CityService';

// Test database configuration
const TEST_DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'indian_culture_test',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

describe('Property 2: City Heritage Completeness', () => {
  let testPool: Pool;
  let client: PoolClient;
  let cityService: CityService;

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

    cityService = new CityService();
  });

  afterAll(async () => {
    if (client) client.release();
    if (testPool) await testPool.end();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await client.query('DELETE FROM translations WHERE entity_type IN (\'city\', \'heritage\')');
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
    'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Gujarat',
    'Rajasthan', 'Delhi', 'West Bengal', 'Uttar Pradesh', 'Punjab'
  );

  // Generate city slug
  const citySlugArb = fc.string({ minLength: 3, maxLength: 30 })
    .map(s => s.toLowerCase().replace(/[^a-z0-9]/g, '-'));

  // Generate content strings
  const contentArb = fc.string({ minLength: 10, maxLength: 200 });

  /**
   * Property Test: All heritage items for a city are returned with required fields
   * Validates Requirements 2.3, 3.5
   */
  it('should return all heritage items for a city with all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        citySlugArb,
        stateArb,
        regionArb,
        languageCodeArb,
        fc.array(
          fc.record({
            category: categoryArb,
            thumbnailUrl: fc.webUrl(),
            name: contentArb,
            summary: contentArb,
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (citySlug, state, region, language, heritageItems) => {
          // Setup: Create city
          const cityResult = await client.query(
            `INSERT INTO cities (slug, state, region, preview_image_url)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [citySlug, state, region, 'https://example.com/preview.jpg']
          );
          const cityId = cityResult.rows[0].id;

          // Insert city translations
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['city', cityId, language, 'name', `City ${citySlug}`]
          );
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['city', cityId, language, 'state', state]
          );

          // Setup: Create heritage items
          const heritageIds: string[] = [];
          for (const item of heritageItems) {
            const heritageResult = await client.query(
              `INSERT INTO heritage_items (city_id, category, thumbnail_image_url)
               VALUES ($1, $2, $3)
               RETURNING id`,
              [cityId, item.category, item.thumbnailUrl]
            );
            const heritageId = heritageResult.rows[0].id;
            heritageIds.push(heritageId);

            // Insert heritage translations
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['heritage', heritageId, language, 'name', item.name]
            );
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['heritage', heritageId, language, 'summary', item.summary]
            );
          }

          // Execute: Get city heritage
          const result = await cityService.getCityHeritage(cityId, language);

          // Verify: All heritage items are returned
          expect(result.length).toBe(heritageItems.length);

          // Verify: All required fields are present for each item
          for (const item of result) {
            // Property: Each heritage item has all required fields
            expect(item.id).toBeTruthy();
            expect(typeof item.id).toBe('string');
            
            expect(item.name).toBeTruthy();
            expect(typeof item.name).toBe('string');
            
            expect(item.category).toBeTruthy();
            expect(typeof item.category).toBe('string');
            
            expect(item.summary).toBeTruthy();
            expect(typeof item.summary).toBe('string');
            
            expect(typeof item.thumbnailImage).toBe('string');

            // Verify the item ID is in our created list
            expect(heritageIds).toContain(item.id);
          }

          // Verify: All created heritage items are in the result
          const resultIds = result.map(r => r.id);
          for (const heritageId of heritageIds) {
            expect(resultIds).toContain(heritageId);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Category filtering returns only matching heritage items
   * Validates Requirements 2.8, 3.6
   */
  it('should return only heritage items matching the specified category', async () => {
    await fc.assert(
      fc.asyncProperty(
        citySlugArb,
        stateArb,
        regionArb,
        languageCodeArb,
        categoryArb,
        fc.array(categoryArb, { minLength: 2, maxLength: 8 }),
        async (citySlug, state, region, language, filterCategory, categories) => {
          // Setup: Create city
          const cityResult = await client.query(
            `INSERT INTO cities (slug, state, region)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [citySlug, state, region]
          );
          const cityId = cityResult.rows[0].id;

          // Insert city translations
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            ['city', cityId, language, 'name', `City ${citySlug}`]
          );

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

          // Execute: Get city heritage with category filter
          const result = await cityService.getCityHeritage(cityId, language, filterCategory);

          // Verify: Only items with the specified category are returned
          expect(result.length).toBe(expectedCount);

          // Property: All returned items have the filtered category
          for (const item of result) {
            expect(item.category).toBe(filterCategory);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Empty city returns empty heritage list
   * Validates edge case handling
   */
  it('should return empty array for city with no heritage items', async () => {
    await fc.assert(
      fc.asyncProperty(
        citySlugArb,
        stateArb,
        regionArb,
        languageCodeArb,
        async (citySlug, state, region, language) => {
          // Setup: Create city without heritage items
          const cityResult = await client.query(
            `INSERT INTO cities (slug, state, region)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [citySlug, state, region]
          );
          const cityId = cityResult.rows[0].id;

          // Execute: Get city heritage
          const result = await cityService.getCityHeritage(cityId, language);

          // Verify: Empty array is returned
          expect(result).toEqual([]);
          expect(result.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * Property Test: Non-existent city returns empty heritage list
   * Validates error handling
   */
  it('should return empty array for non-existent city', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        languageCodeArb,
        async (nonExistentCityId, language) => {
          // Execute: Get heritage for non-existent city
          const result = await cityService.getCityHeritage(nonExistentCityId, language);

          // Verify: Empty array is returned
          expect(result).toEqual([]);
          expect(result.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);
});


describe('Property 5: City Filtering Correctness', () => {
  let testPool: Pool;
  let client: PoolClient;
  let cityService: CityService;

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

    cityService = new CityService();
  });

  afterAll(async () => {
    if (client) client.release();
    if (testPool) await testPool.end();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await client.query('DELETE FROM translations WHERE entity_type = \'city\'');
    await client.query('DELETE FROM heritage_items');
    await client.query('DELETE FROM cities');
  });

  /**
   * Arbitrary generators for test data
   */

  const languageCodeArb = fc.constantFrom('en', 'hi', 'bn', 'te', 'mr', 'ta');

  const regionArb = fc.constantFrom(
    'North', 'South', 'East', 'West', 'Central', 'Northeast'
  );

  const stateArb = fc.constantFrom(
    'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Gujarat',
    'Rajasthan', 'Delhi', 'West Bengal', 'Uttar Pradesh', 'Punjab'
  );

  const citySlugArb = fc.string({ minLength: 3, maxLength: 30 })
    .map(s => s.toLowerCase().replace(/[^a-z0-9]/g, '-'));

  /**
   * Property Test: State filtering returns only cities in that state
   * Validates Requirements 2.5, 2.8
   */
  it('should return only cities matching the state filter', async () => {
    await fc.assert(
      fc.asyncProperty(
        languageCodeArb,
        stateArb,
        fc.array(
          fc.record({
            slug: citySlugArb,
            state: stateArb,
            region: regionArb,
          }),
          { minLength: 3, maxLength: 10 }
        ),
        async (language, filterState, cities) => {
          // Setup: Create cities with various states
          const cityIds: string[] = [];
          
          for (const city of cities) {
            const cityResult = await client.query(
              `INSERT INTO cities (slug, state, region, preview_image_url)
               VALUES ($1, $2, $3, $4)
               RETURNING id`,
              [city.slug, city.state, city.region, 'https://example.com/preview.jpg']
            );
            const cityId = cityResult.rows[0].id;
            cityIds.push(cityId);

            // Insert city translations
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['city', cityId, language, 'name', `City ${city.slug}`]
            );
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['city', cityId, language, 'state', city.state]
            );
          }

          // Calculate expected count
          const expectedCount = cities.filter(c => c.state === filterState).length;

          // Execute: Get cities with state filter
          const result = await cityService.getAllCities(language, { state: filterState });

          // Verify: Only cities in the filtered state are returned
          expect(result.length).toBe(expectedCount);

          // Property: All returned cities have the filtered state
          for (const city of result) {
            expect(city.state).toBe(filterState);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Region filtering returns only cities in that region
   * Validates Requirements 2.5, 2.8
   */
  it('should return only cities matching the region filter', async () => {
    await fc.assert(
      fc.asyncProperty(
        languageCodeArb,
        regionArb,
        fc.array(
          fc.record({
            slug: citySlugArb,
            state: stateArb,
            region: regionArb,
          }),
          { minLength: 3, maxLength: 10 }
        ),
        async (language, filterRegion, cities) => {
          // Setup: Create cities with various regions
          for (const city of cities) {
            const cityResult = await client.query(
              `INSERT INTO cities (slug, state, region, preview_image_url)
               VALUES ($1, $2, $3, $4)
               RETURNING id`,
              [city.slug, city.state, city.region, 'https://example.com/preview.jpg']
            );
            const cityId = cityResult.rows[0].id;

            // Insert city translations
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['city', cityId, language, 'name', `City ${city.slug}`]
            );
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['city', cityId, language, 'state', city.state]
            );
          }

          // Calculate expected count
          const expectedCount = cities.filter(c => c.region === filterRegion).length;

          // Execute: Get cities with region filter
          const result = await cityService.getAllCities(language, { region: filterRegion });

          // Verify: Only cities in the filtered region are returned
          expect(result.length).toBe(expectedCount);

          // Property: All returned cities have the filtered region
          for (const city of result) {
            expect(city.region).toBe(filterRegion);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Combined state and region filtering
   * Validates Requirements 2.5, 2.8
   */
  it('should return only cities matching both state and region filters', async () => {
    await fc.assert(
      fc.asyncProperty(
        languageCodeArb,
        stateArb,
        regionArb,
        fc.array(
          fc.record({
            slug: citySlugArb,
            state: stateArb,
            region: regionArb,
          }),
          { minLength: 5, maxLength: 15 }
        ),
        async (language, filterState, filterRegion, cities) => {
          // Setup: Create cities with various states and regions
          for (const city of cities) {
            const cityResult = await client.query(
              `INSERT INTO cities (slug, state, region)
               VALUES ($1, $2, $3)
               RETURNING id`,
              [city.slug, city.state, city.region]
            );
            const cityId = cityResult.rows[0].id;

            // Insert city translations
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['city', cityId, language, 'name', `City ${city.slug}`]
            );
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['city', cityId, language, 'state', city.state]
            );
          }

          // Calculate expected count
          const expectedCount = cities.filter(
            c => c.state === filterState && c.region === filterRegion
          ).length;

          // Execute: Get cities with both filters
          const result = await cityService.getAllCities(language, {
            state: filterState,
            region: filterRegion,
          });

          // Verify: Only cities matching both filters are returned
          expect(result.length).toBe(expectedCount);

          // Property: All returned cities match both filters
          for (const city of result) {
            expect(city.state).toBe(filterState);
            expect(city.region).toBe(filterRegion);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Search term filtering
   * Validates Requirements 2.5
   */
  it('should return only cities matching the search term', async () => {
    await fc.assert(
      fc.asyncProperty(
        languageCodeArb,
        fc.string({ minLength: 2, maxLength: 10 }).filter(s => s.trim().length > 0),
        fc.array(
          fc.record({
            slug: citySlugArb,
            state: stateArb,
            region: regionArb,
            nameContainsSearch: fc.boolean(),
          }),
          { minLength: 3, maxLength: 8 }
        ),
        async (language, searchTerm, cities) => {
          // Setup: Create cities, some with search term in name
          for (const city of cities) {
            const cityResult = await client.query(
              `INSERT INTO cities (slug, state, region)
               VALUES ($1, $2, $3)
               RETURNING id`,
              [city.slug, city.state, city.region]
            );
            const cityId = cityResult.rows[0].id;

            // Insert city translations with or without search term
            const cityName = city.nameContainsSearch
              ? `City ${searchTerm} ${city.slug}`
              : `City ${city.slug}`;

            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['city', cityId, language, 'name', cityName]
            );
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['city', cityId, language, 'state', city.state]
            );
          }

          // Execute: Get cities with search term
          const result = await cityService.getAllCities(language, {
            searchTerm: searchTerm,
          });

          // Property: All returned cities have the search term in their name or state
          for (const city of result) {
            const nameMatch = city.name.toLowerCase().includes(searchTerm.toLowerCase());
            const stateMatch = city.state.toLowerCase().includes(searchTerm.toLowerCase());
            expect(nameMatch || stateMatch).toBe(true);
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  /**
   * Property Test: No filters returns all cities
   * Validates Requirements 2.1, 2.2
   */
  it('should return all cities when no filters are applied', async () => {
    await fc.assert(
      fc.asyncProperty(
        languageCodeArb,
        fc.array(
          fc.record({
            slug: citySlugArb,
            state: stateArb,
            region: regionArb,
          }),
          { minLength: 1, maxLength: 10 }
        ).map(arr => {
          // Ensure unique slugs
          const seen = new Set();
          return arr.filter(city => {
            if (seen.has(city.slug)) return false;
            seen.add(city.slug);
            return true;
          });
        }),
        async (language, cities) => {
          // Setup: Create cities
          for (const city of cities) {
            const cityResult = await client.query(
              `INSERT INTO cities (slug, state, region)
               VALUES ($1, $2, $3)
               RETURNING id`,
              [city.slug, city.state, city.region]
            );
            const cityId = cityResult.rows[0].id;

            // Insert city translations
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['city', cityId, language, 'name', `City ${city.slug}`]
            );
            await client.query(
              `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
               VALUES ($1, $2, $3, $4, $5)`,
              ['city', cityId, language, 'state', city.state]
            );
          }

          // Execute: Get all cities without filters
          const result = await cityService.getAllCities(language);

          // Verify: All cities are returned
          expect(result.length).toBe(cities.length);
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  /**
   * Property Test: Empty database returns empty array
   * Validates edge case handling
   */
  it('should return empty array when no cities exist', async () => {
    await fc.assert(
      fc.asyncProperty(
        languageCodeArb,
        async (language) => {
          // Execute: Get cities from empty database
          const result = await cityService.getAllCities(language);

          // Verify: Empty array is returned
          expect(result).toEqual([]);
          expect(result.length).toBe(0);
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});
