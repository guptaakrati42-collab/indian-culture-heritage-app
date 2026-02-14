/**
 * Unit Tests: City Service
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.5, 2.6
 * 
 * Tests specific examples and edge cases for CityService functionality:
 * - City retrieval with different languages
 * - City filtering by state and region
 * - City search functionality
 * - Error handling for non-existent cities
 */

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

describe('CityService Unit Tests', () => {
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

  describe('getAllCities', () => {
    /**
     * Test: City retrieval with English language
     * Validates Requirements 2.1, 2.2, 2.6
     */
    it('should retrieve cities with English translations', async () => {
      // Setup: Create test cities
      const cityResult1 = await client.query(
        `INSERT INTO cities (slug, state, region, preview_image_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        ['mumbai', 'Maharashtra', 'West', 'https://example.com/mumbai.jpg']
      );
      const cityId1 = cityResult1.rows[0].id;

      const cityResult2 = await client.query(
        `INSERT INTO cities (slug, state, region, preview_image_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        ['bangalore', 'Karnataka', 'South', 'https://example.com/bangalore.jpg']
      );
      const cityId2 = cityResult2.rows[0].id;

      // Insert English translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId1, 'en', 'name', 'Mumbai']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId1, 'en', 'state', 'Maharashtra']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId2, 'en', 'name', 'Bangalore']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId2, 'en', 'state', 'Karnataka']
      );

      // Execute
      const cities = await cityService.getAllCities('en');

      // Verify
      expect(cities).toHaveLength(2);
      expect(cities[0].name).toBe('Bangalore'); // Sorted by slug
      expect(cities[0].state).toBe('Karnataka');
      expect(cities[0].region).toBe('South');
      expect(cities[1].name).toBe('Mumbai');
      expect(cities[1].state).toBe('Maharashtra');
      expect(cities[1].region).toBe('West');
    });

    /**
     * Test: City retrieval with Hindi language
     * Validates Requirements 2.1, 2.2, 2.6
     */
    it('should retrieve cities with Hindi translations', async () => {
      // Setup: Create test city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['delhi', 'Delhi', 'North']
      );
      const cityId = cityResult.rows[0].id;

      // Insert Hindi translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId, 'hi', 'name', 'दिल्ली']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId, 'hi', 'state', 'दिल्ली']
      );

      // Execute
      const cities = await cityService.getAllCities('hi');

      // Verify
      expect(cities).toHaveLength(1);
      expect(cities[0].name).toBe('दिल्ली');
      expect(cities[0].state).toBe('दिल्ली');
      expect(cities[0].region).toBe('North');
    });

    /**
     * Test: City filtering by state
     * Validates Requirements 2.5, 2.8
     */
    it('should filter cities by state', async () => {
      // Setup: Create cities in different states
      const cityResult1 = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['mumbai', 'Maharashtra', 'West']
      );
      const cityId1 = cityResult1.rows[0].id;

      const cityResult2 = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['pune', 'Maharashtra', 'West']
      );
      const cityId2 = cityResult2.rows[0].id;

      const cityResult3 = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['bangalore', 'Karnataka', 'South']
      );
      const cityId3 = cityResult3.rows[0].id;

      // Insert translations
      for (const [cityId, name, state] of [
        [cityId1, 'Mumbai', 'Maharashtra'],
        [cityId2, 'Pune', 'Maharashtra'],
        [cityId3, 'Bangalore', 'Karnataka'],
      ]) {
        await client.query(
          `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
           VALUES ($1, $2, $3, $4, $5)`,
          ['city', cityId, 'en', 'name', name]
        );
        await client.query(
          `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
           VALUES ($1, $2, $3, $4, $5)`,
          ['city', cityId, 'en', 'state', state]
        );
      }

      // Execute
      const cities = await cityService.getAllCities('en', { state: 'Maharashtra' });

      // Verify
      expect(cities).toHaveLength(2);
      expect(cities.every(c => c.state === 'Maharashtra')).toBe(true);
      expect(cities.map(c => c.name).sort()).toEqual(['Mumbai', 'Pune']);
    });

    /**
     * Test: City filtering by region
     * Validates Requirements 2.5, 2.8
     */
    it('should filter cities by region', async () => {
      // Setup: Create cities in different regions
      const cityResult1 = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['chennai', 'Tamil Nadu', 'South']
      );
      const cityId1 = cityResult1.rows[0].id;

      const cityResult2 = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['bangalore', 'Karnataka', 'South']
      );
      const cityId2 = cityResult2.rows[0].id;

      const cityResult3 = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['delhi', 'Delhi', 'North']
      );
      const cityId3 = cityResult3.rows[0].id;

      // Insert translations
      for (const [cityId, name, state] of [
        [cityId1, 'Chennai', 'Tamil Nadu'],
        [cityId2, 'Bangalore', 'Karnataka'],
        [cityId3, 'Delhi', 'Delhi'],
      ]) {
        await client.query(
          `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
           VALUES ($1, $2, $3, $4, $5)`,
          ['city', cityId, 'en', 'name', name]
        );
        await client.query(
          `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
           VALUES ($1, $2, $3, $4, $5)`,
          ['city', cityId, 'en', 'state', state]
        );
      }

      // Execute
      const cities = await cityService.getAllCities('en', { region: 'South' });

      // Verify
      expect(cities).toHaveLength(2);
      expect(cities.every(c => c.region === 'South')).toBe(true);
      expect(cities.map(c => c.name).sort()).toEqual(['Bangalore', 'Chennai']);
    });

    /**
     * Test: City search functionality
     * Validates Requirements 2.5
     */
    it('should search cities by name', async () => {
      // Setup: Create test cities
      const cityResult1 = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['bangalore', 'Karnataka', 'South']
      );
      const cityId1 = cityResult1.rows[0].id;

      const cityResult2 = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['mumbai', 'Maharashtra', 'West']
      );
      const cityId2 = cityResult2.rows[0].id;

      // Insert translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId1, 'en', 'name', 'Bangalore']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId1, 'en', 'state', 'Karnataka']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId2, 'en', 'name', 'Mumbai']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId2, 'en', 'state', 'Maharashtra']
      );

      // Execute
      const cities = await cityService.getAllCities('en', { searchTerm: 'bang' });

      // Verify
      expect(cities).toHaveLength(1);
      expect(cities[0].name).toBe('Bangalore');
    });

    /**
     * Test: Heritage count is included
     * Validates Requirements 2.2
     */
    it('should include heritage count for each city', async () => {
      // Setup: Create city with heritage items
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['jaipur', 'Rajasthan', 'North']
      );
      const cityId = cityResult.rows[0].id;

      // Insert translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId, 'en', 'name', 'Jaipur']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId, 'en', 'state', 'Rajasthan']
      );

      // Create heritage items
      await client.query(
        `INSERT INTO heritage_items (city_id, category, thumbnail_image_url)
         VALUES ($1, $2, $3)`,
        [cityId, 'monuments', 'https://example.com/thumb1.jpg']
      );
      await client.query(
        `INSERT INTO heritage_items (city_id, category, thumbnail_image_url)
         VALUES ($1, $2, $3)`,
        [cityId, 'festivals', 'https://example.com/thumb2.jpg']
      );

      // Execute
      const cities = await cityService.getAllCities('en');

      // Verify
      expect(cities).toHaveLength(1);
      expect(cities[0].heritageCount).toBe(2);
    });
  });

  describe('getCityById', () => {
    /**
     * Test: Get specific city by ID
     * Validates Requirements 2.1, 2.2, 2.6
     */
    it('should retrieve a specific city by ID', async () => {
      // Setup: Create test city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region, preview_image_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        ['kolkata', 'West Bengal', 'East', 'https://example.com/kolkata.jpg']
      );
      const cityId = cityResult.rows[0].id;

      // Insert translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId, 'en', 'name', 'Kolkata']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['city', cityId, 'en', 'state', 'West Bengal']
      );

      // Execute
      const city = await cityService.getCityById(cityId, 'en');

      // Verify
      expect(city).not.toBeNull();
      expect(city!.id).toBe(cityId);
      expect(city!.name).toBe('Kolkata');
      expect(city!.state).toBe('West Bengal');
      expect(city!.region).toBe('East');
      expect(city!.previewImage).toBe('https://example.com/kolkata.jpg');
    });

    /**
     * Test: Non-existent city returns null
     * Validates error handling
     */
    it('should return null for non-existent city', async () => {
      // Execute
      const city = await cityService.getCityById('00000000-0000-0000-0000-000000000000', 'en');

      // Verify
      expect(city).toBeNull();
    });
  });

  describe('getCityHeritage', () => {
    /**
     * Test: Get all heritage items for a city
     * Validates Requirements 2.3, 2.6
     */
    it('should retrieve all heritage items for a city', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['varanasi', 'Uttar Pradesh', 'North']
      );
      const cityId = cityResult.rows[0].id;

      // Create heritage items
      const heritageResult1 = await client.query(
        `INSERT INTO heritage_items (city_id, category, thumbnail_image_url)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [cityId, 'temples', 'https://example.com/temple.jpg']
      );
      const heritageId1 = heritageResult1.rows[0].id;

      const heritageResult2 = await client.query(
        `INSERT INTO heritage_items (city_id, category, thumbnail_image_url)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [cityId, 'festivals', 'https://example.com/festival.jpg']
      );
      const heritageId2 = heritageResult2.rows[0].id;

      // Insert heritage translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId1, 'en', 'name', 'Kashi Vishwanath Temple']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId1, 'en', 'summary', 'Ancient temple dedicated to Lord Shiva']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId2, 'en', 'name', 'Dev Deepawali']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId2, 'en', 'summary', 'Festival of lights celebrated on the Ganges']
      );

      // Execute
      const heritage = await cityService.getCityHeritage(cityId, 'en');

      // Verify
      expect(heritage).toHaveLength(2);
      expect(heritage[0].name).toBe('Dev Deepawali'); // Sorted by category
      expect(heritage[0].category).toBe('festivals');
      expect(heritage[1].name).toBe('Kashi Vishwanath Temple');
      expect(heritage[1].category).toBe('temples');
    });

    /**
     * Test: Filter heritage items by category
     * Validates Requirements 2.8, 3.6
     */
    it('should filter heritage items by category', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['agra', 'Uttar Pradesh', 'North']
      );
      const cityId = cityResult.rows[0].id;

      // Create heritage items in different categories
      const heritageResult1 = await client.query(
        `INSERT INTO heritage_items (city_id, category, thumbnail_image_url)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [cityId, 'monuments', 'https://example.com/tajmahal.jpg']
      );
      const heritageId1 = heritageResult1.rows[0].id;

      const heritageResult2 = await client.query(
        `INSERT INTO heritage_items (city_id, category, thumbnail_image_url)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [cityId, 'cuisine', 'https://example.com/petha.jpg']
      );
      const heritageId2 = heritageResult2.rows[0].id;

      // Insert translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId1, 'en', 'name', 'Taj Mahal']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId1, 'en', 'summary', 'Iconic white marble mausoleum']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId2, 'en', 'name', 'Petha']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId2, 'en', 'summary', 'Traditional sweet made from ash gourd']
      );

      // Execute
      const heritage = await cityService.getCityHeritage(cityId, 'en', 'monuments');

      // Verify
      expect(heritage).toHaveLength(1);
      expect(heritage[0].name).toBe('Taj Mahal');
      expect(heritage[0].category).toBe('monuments');
    });

    /**
     * Test: Empty city returns empty array
     * Validates edge case handling
     */
    it('should return empty array for city with no heritage items', async () => {
      // Setup: Create city without heritage
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['newcity', 'State', 'Region']
      );
      const cityId = cityResult.rows[0].id;

      // Execute
      const heritage = await cityService.getCityHeritage(cityId, 'en');

      // Verify
      expect(heritage).toEqual([]);
    });
  });
});
