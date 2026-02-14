import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'indian_culture_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runSeedFile(filePath: string): Promise<void> {
  const sql = fs.readFileSync(filePath, 'utf-8');
  console.log(`Running seed file: ${path.basename(filePath)}`);
  
  try {
    await pool.query(sql);
    console.log(`✓ Successfully executed ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`✗ Error executing ${path.basename(filePath)}:`, error);
    throw error;
  }
}

async function seedDatabase(): Promise<void> {
  const seedsDir = path.join(__dirname, '../../seeds');
  
  const seedFiles = [
    '001_seed_cities.sql',
    '002_seed_city_translations.sql',
    '003_seed_heritage_items.sql',
    '004_seed_heritage_translations.sql',
    '005_seed_images.sql',
    '006_seed_image_translations.sql',
  ];

  console.log('Starting database seeding...\n');

  try {
    for (const file of seedFiles) {
      const filePath = path.join(seedsDir, file);
      await runSeedFile(filePath);
    }

    // Verify seed data
    console.log('\nVerifying seed data...');
    
    const citiesResult = await pool.query('SELECT COUNT(*) FROM cities');
    console.log(`Cities seeded: ${citiesResult.rows[0].count}`);
    
    const heritageResult = await pool.query('SELECT COUNT(*) FROM heritage_items');
    console.log(`Heritage items seeded: ${heritageResult.rows[0].count}`);
    
    const imagesResult = await pool.query('SELECT COUNT(*) FROM images');
    console.log(`Images seeded: ${imagesResult.rows[0].count}`);
    
    const translationsResult = await pool.query('SELECT COUNT(*) FROM translations');
    console.log(`Translations seeded: ${translationsResult.rows[0].count}`);

    // Verify referential integrity
    console.log('\nVerifying referential integrity...');
    
    const citiesWithoutTranslations = await pool.query(`
      SELECT COUNT(*) 
      FROM cities c 
      WHERE NOT EXISTS (
        SELECT 1 FROM translations t 
        WHERE t.entity_type = 'city' 
        AND t.entity_id = c.id 
        AND t.language_code = 'en'
      )
    `);
    console.log(`Cities without English translations: ${citiesWithoutTranslations.rows[0].count}`);
    
    const heritageWithoutTranslations = await pool.query(`
      SELECT COUNT(*) 
      FROM heritage_items h 
      WHERE NOT EXISTS (
        SELECT 1 FROM translations t 
        WHERE t.entity_type = 'heritage' 
        AND t.entity_id = h.id 
        AND t.language_code = 'en'
      )
    `);
    console.log(`Heritage items without English translations: ${heritageWithoutTranslations.rows[0].count}`);
    
    const imagesWithoutTranslations = await pool.query(`
      SELECT COUNT(*) 
      FROM images i 
      WHERE NOT EXISTS (
        SELECT 1 FROM translations t 
        WHERE t.entity_type = 'image' 
        AND t.entity_id = i.id 
        AND t.language_code = 'en'
      )
    `);
    console.log(`Images without English translations: ${imagesWithoutTranslations.rows[0].count}`);

    console.log('\n✓ Database seeding completed successfully!');
  } catch (error) {
    console.error('\n✗ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the seeding
seedDatabase();
