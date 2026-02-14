import { db } from '../config/database';
import fs from 'fs';
import path from 'path';

/**
 * Database initialization script
 * Runs all migration files in order
 */
async function initializeDatabase(): Promise<void> {
  try {
    console.log('Starting database initialization...');

    // Initialize connection
    await db.initialize();
    console.log('Database connection established');

    // Get migration files
    const migrationsDir = path.join(__dirname, '../../migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql') && file !== 'run-migrations.sql')
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      // Execute the entire SQL file as one statement to handle functions/triggers properly
      try {
        await db.query(sql);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.code === '42P07' || error.message.includes('already exists')) {
          console.log(`  Skipping (already exists)`);
        } else {
          throw error;
        }
      }

      console.log(`  ✓ Completed: ${file}`);
    }

    // Verify tables were created
    const tables = await db.query<{ tablename: string }>(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log('\nDatabase tables:');
    tables.forEach((table) => {
      console.log(`  - ${table.tablename}`);
    });

    console.log('\n✓ Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { initializeDatabase };
