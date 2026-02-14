/**
 * Unit Tests: Heritage Service
 * 
 * Validates: Requirements 3.1, 3.6, 4.1, 4.2
 * 
 * Tests specific examples and edge cases for HeritageService functionality:
 * - Heritage retrieval with translations
 * - Category filtering
 * - Image retrieval
 * - Error handling for invalid heritage IDs
 */

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

describe('HeritageService Unit Tests', () => {
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

  describe('getHeritageById', () => {
    /**
     * Test: Heritage retrieval with English translations
     * Validates Requirements 3.1, 3.2, 3.3, 3.4
     */
    it('should retrieve heritage with English translations', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['delhi', 'Delhi', 'North']
      );
      const cityId = cityResult.rows[0].id;

      // Setup: Create heritage item
      const heritageResult = await client.query(
        `INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [cityId, 'monuments', '17th Century', 'https://example.com/redfort-thumb.jpg']
      );
      const heritageId = heritageResult.rows[0].id;

      // Insert English translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'name', 'Red Fort']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'summary', 'Historic fortified palace built by Mughal Emperor Shah Jahan']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'detailed_description', 'The Red Fort served as the main residence of the Mughal emperors for nearly 200 years. It was built when Shah Jahan decided to shift his capital from Agra to Delhi.']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'significance', 'UNESCO World Heritage Site and symbol of Indian independence']
      );

      // Execute
      const heritage = await heritageService.getHeritageById(heritageId, 'en');

      // Verify
      expect(heritage).not.toBeNull();
      expect(heritage!.id).toBe(heritageId);
      expect(heritage!.name).toBe('Red Fort');
      expect(heritage!.category).toBe('monuments');
      expect(heritage!.summary).toBe('Historic fortified palace built by Mughal Emperor Shah Jahan');
      expect(heritage!.detailedDescription).toContain('The Red Fort served as the main residence');
      expect(heritage!.historicalPeriod).toBe('17th Century');
      expect(heritage!.significance).toBe('UNESCO World Heritage Site and symbol of Indian independence');
      expect(heritage!.images).toEqual([]);
    });

    /**
     * Test: Heritage retrieval with Hindi translations
     * Validates Requirements 3.1, 3.2
     */
    it('should retrieve heritage with Hindi translations', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['varanasi', 'Uttar Pradesh', 'North']
      );
      const cityId = cityResult.rows[0].id;

      // Setup: Create heritage item
      const heritageResult = await client.query(
        `INSERT INTO heritage_items (city_id, category, historical_period)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [cityId, 'temples', 'Ancient']
      );
      const heritageId = heritageResult.rows[0].id;

      // Insert Hindi translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'hi', 'name', 'काशी विश्वनाथ मंदिर']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'hi', 'summary', 'भगवान शिव को समर्पित प्राचीन मंदिर']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'hi', 'detailed_description', 'यह मंदिर हिंदू धर्म के सबसे पवित्र स्थानों में से एक है']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'hi', 'significance', 'बारह ज्योतिर्लिंगों में से एक']
      );

      // Execute
      const heritage = await heritageService.getHeritageById(heritageId, 'hi');

      // Verify
      expect(heritage).not.toBeNull();
      expect(heritage!.name).toBe('काशी विश्वनाथ मंदिर');
      expect(heritage!.summary).toBe('भगवान शिव को समर्पित प्राचीन मंदिर');
    });

    /**
     * Test: Heritage retrieval with images
     * Validates Requirements 3.2, 4.1, 4.2
     */
    it('should retrieve heritage with images', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['agra', 'Uttar Pradesh', 'North']
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

      // Insert heritage translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'name', 'Taj Mahal']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'summary', 'Iconic white marble mausoleum']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'detailed_description', 'Built by Emperor Shah Jahan in memory of his wife Mumtaz Mahal']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'significance', 'One of the Seven Wonders of the World']
      );

      // Create images
      const imageResult1 = await client.query(
        `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [heritageId, 'https://example.com/taj-full1.jpg', 'https://example.com/taj-thumb1.jpg', 0]
      );
      const imageId1 = imageResult1.rows[0].id;

      const imageResult2 = await client.query(
        `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [heritageId, 'https://example.com/taj-full2.jpg', 'https://example.com/taj-thumb2.jpg', 1]
      );
      const imageId2 = imageResult2.rows[0].id;

      // Insert image translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['image', imageId1, 'en', 'caption', 'Front view of Taj Mahal']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['image', imageId1, 'en', 'alt_text', 'Taj Mahal front facade']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['image', imageId2, 'en', 'caption', 'Taj Mahal at sunset']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['image', imageId2, 'en', 'alt_text', 'Taj Mahal during golden hour']
      );

      // Execute
      const heritage = await heritageService.getHeritageById(heritageId, 'en');

      // Verify
      expect(heritage).not.toBeNull();
      expect(heritage!.images).toHaveLength(2);
      expect(heritage!.images[0].url).toBe('https://example.com/taj-full1.jpg');
      expect(heritage!.images[0].thumbnailUrl).toBe('https://example.com/taj-thumb1.jpg');
      expect(heritage!.images[0].caption).toBe('Front view of Taj Mahal');
      expect(heritage!.images[0].altText).toBe('Taj Mahal front facade');
      expect(heritage!.images[1].url).toBe('https://example.com/taj-full2.jpg');
      expect(heritage!.images[1].caption).toBe('Taj Mahal at sunset');
    });

    /**
     * Test: Non-existent heritage returns null
     * Validates error handling
     */
    it('should return null for non-existent heritage ID', async () => {
      // Execute
      const heritage = await heritageService.getHeritageById('00000000-0000-0000-0000-000000000000', 'en');

      // Verify
      expect(heritage).toBeNull();
    });

    /**
     * Test: Fallback to English when translation missing
     * Validates Requirements 3.2
     */
    it('should fallback to English when translation is not available', async () => {
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

      // Insert ONLY English translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'name', 'Gateway of India']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'summary', 'Iconic arch monument']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'detailed_description', 'Built to commemorate the visit of King George V']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'significance', 'Symbol of Mumbai']
      );

      // Execute with Hindi language (no Hindi translation available)
      const heritage = await heritageService.getHeritageById(heritageId, 'hi');

      // Verify: English translations are returned as fallback
      expect(heritage).not.toBeNull();
      expect(heritage!.name).toBe('Gateway of India');
      expect(heritage!.summary).toBe('Iconic arch monument');
      expect(heritage!.detailedDescription).toBe('Built to commemorate the visit of King George V');
      expect(heritage!.significance).toBe('Symbol of Mumbai');
    });
  });

  describe('getHeritageImages', () => {
    /**
     * Test: Get all images for a heritage item
     * Validates Requirements 4.1, 4.2
     */
    it('should retrieve all images for a heritage item', async () => {
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

      // Create images
      const imageResult1 = await client.query(
        `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [heritageId, 'https://example.com/hawa-mahal1.jpg', 'https://example.com/hawa-thumb1.jpg', 0]
      );
      const imageId1 = imageResult1.rows[0].id;

      const imageResult2 = await client.query(
        `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [heritageId, 'https://example.com/hawa-mahal2.jpg', 'https://example.com/hawa-thumb2.jpg', 1]
      );
      const imageId2 = imageResult2.rows[0].id;

      const imageResult3 = await client.query(
        `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [heritageId, 'https://example.com/hawa-mahal3.jpg', 'https://example.com/hawa-thumb3.jpg', 2]
      );
      const imageId3 = imageResult3.rows[0].id;

      // Insert image translations
      for (const [imageId, caption, altText] of [
        [imageId1, 'Hawa Mahal facade', 'Front view of Hawa Mahal'],
        [imageId2, 'Hawa Mahal windows', 'Intricate window details'],
        [imageId3, 'Hawa Mahal interior', 'Inside view of palace'],
      ]) {
        await client.query(
          `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
           VALUES ($1, $2, $3, $4, $5)`,
          ['image', imageId, 'en', 'caption', caption]
        );
        await client.query(
          `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
           VALUES ($1, $2, $3, $4, $5)`,
          ['image', imageId, 'en', 'alt_text', altText]
        );
      }

      // Execute
      const images = await heritageService.getHeritageImages(heritageId);

      // Verify
      expect(images).toHaveLength(3);
      expect(images[0].caption).toBe('Hawa Mahal facade');
      expect(images[1].caption).toBe('Hawa Mahal windows');
      expect(images[2].caption).toBe('Hawa Mahal interior');
    });

    /**
     * Test: Empty heritage returns empty array
     * Validates edge case handling
     */
    it('should return empty array for heritage with no images', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['city', 'State', 'Region']
      );
      const cityId = cityResult.rows[0].id;

      // Setup: Create heritage item without images
      const heritageResult = await client.query(
        `INSERT INTO heritage_items (city_id, category)
         VALUES ($1, $2)
         RETURNING id`,
        [cityId, 'festivals']
      );
      const heritageId = heritageResult.rows[0].id;

      // Execute
      const images = await heritageService.getHeritageImages(heritageId);

      // Verify
      expect(images).toEqual([]);
    });

    /**
     * Test: Images are returned in correct order
     * Validates Requirements 4.2
     */
    it('should return images in display order', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['city', 'State', 'Region']
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

      // Create images with specific order
      const imageResult3 = await client.query(
        `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [heritageId, 'https://example.com/img3.jpg', 'https://example.com/thumb3.jpg', 2]
      );
      const imageId3 = imageResult3.rows[0].id;

      const imageResult1 = await client.query(
        `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [heritageId, 'https://example.com/img1.jpg', 'https://example.com/thumb1.jpg', 0]
      );
      const imageId1 = imageResult1.rows[0].id;

      const imageResult2 = await client.query(
        `INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [heritageId, 'https://example.com/img2.jpg', 'https://example.com/thumb2.jpg', 1]
      );
      const imageId2 = imageResult2.rows[0].id;

      // Insert image translations
      for (const [imageId, caption] of [
        [imageId1, 'First image'],
        [imageId2, 'Second image'],
        [imageId3, 'Third image'],
      ]) {
        await client.query(
          `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
           VALUES ($1, $2, $3, $4, $5)`,
          ['image', imageId, 'en', 'caption', caption]
        );
        await client.query(
          `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
           VALUES ($1, $2, $3, $4, $5)`,
          ['image', imageId, 'en', 'alt_text', caption]
        );
      }

      // Execute
      const images = await heritageService.getHeritageImages(heritageId);

      // Verify: Images are in correct order
      expect(images).toHaveLength(3);
      expect(images[0].caption).toBe('First image');
      expect(images[1].caption).toBe('Second image');
      expect(images[2].caption).toBe('Third image');
    });
  });

  describe('getHeritageByCategory', () => {
    /**
     * Test: Get heritage items by category
     * Validates Requirements 3.6
     */
    it('should retrieve heritage items filtered by category', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['chennai', 'Tamil Nadu', 'South']
      );
      const cityId = cityResult.rows[0].id;

      // Create heritage items in different categories
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
        [cityId, 'temples', 'https://example.com/temple2.jpg']
      );
      const heritageId2 = heritageResult2.rows[0].id;

      const heritageResult3 = await client.query(
        `INSERT INTO heritage_items (city_id, category, thumbnail_image_url)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [cityId, 'cuisine', 'https://example.com/food.jpg']
      );
      const heritageId3 = heritageResult3.rows[0].id;

      // Insert translations
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId1, 'en', 'name', 'Kapaleeshwarar Temple']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId1, 'en', 'summary', 'Ancient Shiva temple']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId2, 'en', 'name', 'Parthasarathy Temple']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId2, 'en', 'summary', 'Vishnu temple']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId3, 'en', 'name', 'Filter Coffee']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId3, 'en', 'summary', 'Traditional South Indian coffee']
      );

      // Execute
      const heritage = await heritageService.getHeritageByCategory(cityId, 'temples', 'en');

      // Verify
      expect(heritage).toHaveLength(2);
      expect(heritage.every(h => h.category === 'temples')).toBe(true);
      expect(heritage.map(h => h.name).sort()).toEqual(['Kapaleeshwarar Temple', 'Parthasarathy Temple']);
    });

    /**
     * Test: Empty category returns empty array
     * Validates edge case handling
     */
    it('should return empty array when no heritage items match category', async () => {
      // Setup: Create city
      const cityResult = await client.query(
        `INSERT INTO cities (slug, state, region)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['city', 'State', 'Region']
      );
      const cityId = cityResult.rows[0].id;

      // Create heritage item in different category
      const heritageResult = await client.query(
        `INSERT INTO heritage_items (city_id, category)
         VALUES ($1, $2)
         RETURNING id`,
        [cityId, 'monuments']
      );
      const heritageId = heritageResult.rows[0].id;

      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'name', 'Monument']
      );
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['heritage', heritageId, 'en', 'summary', 'Summary']
      );

      // Execute with different category
      const heritage = await heritageService.getHeritageByCategory(cityId, 'festivals', 'en');

      // Verify
      expect(heritage).toEqual([]);
    });

    /**
     * Test: Non-existent city returns empty array
     * Validates error handling
     */
    it('should return empty array for non-existent city', async () => {
      // Execute
      const heritage = await heritageService.getHeritageByCategory(
        '00000000-0000-0000-0000-000000000000',
        'monuments',
        'en'
      );

      // Verify
      expect(heritage).toEqual([]);
    });
  });
});
