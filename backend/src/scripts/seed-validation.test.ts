import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'indian_culture_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

describe('Seed Data Validation', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('Cities', () => {
    it('should have at least 20 cities seeded', async () => {
      const result = await pool.query('SELECT COUNT(*) FROM cities');
      const count = parseInt(result.rows[0].count);
      expect(count).toBeGreaterThanOrEqual(20);
    });

    it('should have all cities with required translations in English', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM cities c 
        WHERE NOT EXISTS (
          SELECT 1 FROM translations t 
          WHERE t.entity_type = 'city' 
          AND t.entity_id = c.id 
          AND t.language_code = 'en'
          AND t.field_name = 'name'
        )
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have all cities with required translations in Hindi', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM cities c 
        WHERE NOT EXISTS (
          SELECT 1 FROM translations t 
          WHERE t.entity_type = 'city'
          AND t.entity_id = c.id 
          AND t.language_code = 'hi'
          AND t.field_name = 'name'
        )
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have all cities with valid slugs', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM cities 
        WHERE slug IS NULL OR slug = ''
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have all cities with valid regions', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM cities 
        WHERE region NOT IN ('North', 'South', 'East', 'West', 'Central', 'Northeast')
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });
  });

  describe('Heritage Items', () => {
    it('should have at least 5 heritage items per city', async () => {
      const result = await pool.query(`
        SELECT c.slug, COUNT(h.id) as heritage_count
        FROM cities c
        LEFT JOIN heritage_items h ON c.id = h.city_id
        GROUP BY c.id, c.slug
        HAVING COUNT(h.id) < 5
      `);
      expect(result.rows.length).toBe(0);
    });

    it('should have all heritage items with required fields', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM heritage_items 
        WHERE city_id IS NULL 
        OR category IS NULL 
        OR category = ''
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have all heritage items with valid categories', async () => {
      const validCategories = [
        'monuments', 'temples', 'festivals', 'traditions',
        'cuisine', 'art_forms', 'historical_events', 'customs'
      ];
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM heritage_items 
        WHERE category NOT IN ($1, $2, $3, $4, $5, $6, $7, $8)
      `, validCategories);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have all heritage items with English translations', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM heritage_items h 
        WHERE NOT EXISTS (
          SELECT 1 FROM translations t 
          WHERE t.entity_type = 'heritage' 
          AND t.entity_id = h.id 
          AND t.language_code = 'en'
          AND t.field_name = 'name'
        )
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have all heritage items with summary translations', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM heritage_items h 
        WHERE NOT EXISTS (
          SELECT 1 FROM translations t 
          WHERE t.entity_type = 'heritage' 
          AND t.entity_id = h.id 
          AND t.language_code = 'en'
          AND t.field_name = 'summary'
        )
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should cover all 8 heritage categories across all cities', async () => {
      const result = await pool.query(`
        SELECT DISTINCT category 
        FROM heritage_items
      `);
      expect(result.rows.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Images', () => {
    it('should have at least 3 images per heritage item', async () => {
      const result = await pool.query(`
        SELECT h.id, COUNT(i.id) as image_count
        FROM heritage_items h
        LEFT JOIN images i ON h.id = i.heritage_id
        GROUP BY h.id
        HAVING COUNT(i.id) < 3
      `);
      expect(result.rows.length).toBe(0);
    });

    it('should have all images with valid URLs', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM images 
        WHERE url IS NULL 
        OR url = '' 
        OR thumbnail_url IS NULL 
        OR thumbnail_url = ''
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have all images with valid URL format', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM images 
        WHERE url NOT LIKE 'http%' 
        OR thumbnail_url NOT LIKE 'http%'
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have all images with English captions', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM images i 
        WHERE NOT EXISTS (
          SELECT 1 FROM translations t 
          WHERE t.entity_type = 'image' 
          AND t.entity_id = i.id 
          AND t.language_code = 'en'
          AND t.field_name = 'caption'
        )
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have all images with descriptions', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM images i 
        WHERE NOT EXISTS (
          SELECT 1 FROM translations t 
          WHERE t.entity_type = 'image' 
          AND t.entity_id = i.id 
          AND t.language_code = 'en'
          AND t.field_name = 'description'
        )
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have all images with cultural context', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM images i 
        WHERE NOT EXISTS (
          SELECT 1 FROM translations t 
          WHERE t.entity_type = 'image' 
          AND t.entity_id = i.id 
          AND t.language_code = 'en'
          AND t.field_name = 'cultural_context'
        )
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have all images with alt text', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM images i 
        WHERE NOT EXISTS (
          SELECT 1 FROM translations t 
          WHERE t.entity_type = 'image' 
          AND t.entity_id = i.id 
          AND t.language_code = 'en'
          AND t.field_name = 'alt_text'
        )
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });
  });

  describe('Referential Integrity', () => {
    it('should have all heritage items referencing valid cities', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM heritage_items h 
        WHERE NOT EXISTS (
          SELECT 1 FROM cities c WHERE c.id = h.city_id
        )
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have all images referencing valid heritage items', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM images i 
        WHERE NOT EXISTS (
          SELECT 1 FROM heritage_items h WHERE h.id = i.heritage_id
        )
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have all translations referencing valid language codes', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM translations t 
        WHERE NOT EXISTS (
          SELECT 1 FROM languages l WHERE l.code = t.language_code
        )
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have no orphaned translations', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM translations t 
        WHERE (
          t.entity_type = 'city' 
          AND NOT EXISTS (SELECT 1 FROM cities c WHERE c.id = t.entity_id)
        ) OR (
          t.entity_type = 'heritage' 
          AND NOT EXISTS (SELECT 1 FROM heritage_items h WHERE h.id = t.entity_id)
        ) OR (
          t.entity_type = 'image' 
          AND NOT EXISTS (SELECT 1 FROM images i WHERE i.id = t.entity_id)
        )
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });
  });

  describe('Data Quality', () => {
    it('should have non-empty translation content', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM translations 
        WHERE content IS NULL OR TRIM(content) = ''
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });

    it('should have unique city slugs', async () => {
      const result = await pool.query(`
        SELECT slug, COUNT(*) as count
        FROM cities
        GROUP BY slug
        HAVING COUNT(*) > 1
      `);
      expect(result.rows.length).toBe(0);
    });

    it('should have proper display order for images', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) 
        FROM images 
        WHERE display_order < 0
      `);
      const count = parseInt(result.rows[0].count);
      expect(count).toBe(0);
    });
  });
});
