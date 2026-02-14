# Database Migrations

This directory contains SQL migration files for the Indian Culture App database schema.

## Migration Files

The migrations are numbered to ensure they run in the correct order:

1. **001_create_languages_table.sql** - Creates the languages table and seeds it with 23 languages (22 official Indian languages + English)
2. **002_create_cities_table.sql** - Creates the cities table with indexes for state, region, and slug
3. **003_create_heritage_items_table.sql** - Creates the heritage_items table with indexes for city_id and category
4. **004_create_translations_table.sql** - Creates the translations table with full-text search support
5. **005_create_images_table.sql** - Creates the images table with indexes for heritage_id

## Running Migrations

### Using psql (Recommended)

From the migrations directory:

```bash
psql -U your_username -d indian_culture_db -f run-migrations.sql
```

Or run individual migrations:

```bash
psql -U your_username -d indian_culture_db -f 001_create_languages_table.sql
psql -U your_username -d indian_culture_db -f 002_create_cities_table.sql
# ... and so on
```

### Using Docker Compose

If you're using the Docker setup:

```bash
# Start the database
docker-compose up -d db

# Run migrations
docker-compose exec db psql -U postgres -d indian_culture_db -f /migrations/run-migrations.sql
```

### Using Node.js

You can also run migrations programmatically using the pg library:

```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigrations() {
  const migrationFiles = [
    '001_create_languages_table.sql',
    '002_create_cities_table.sql',
    '003_create_heritage_items_table.sql',
    '004_create_translations_table.sql',
    '005_create_images_table.sql'
  ];

  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
    await pool.query(sql);
    console.log(`Completed: ${file}`);
  }

  await pool.end();
}

runMigrations().catch(console.error);
```

## Schema Overview

### Tables

- **languages**: Stores supported languages with native and English names
- **cities**: Stores city information with state and region
- **heritage_items**: Stores cultural heritage items linked to cities
- **translations**: Stores all translatable content for cities, heritage items, and images
- **images**: Stores image metadata for heritage items

### Relationships

- `heritage_items.city_id` → `cities.id` (CASCADE DELETE)
- `images.heritage_id` → `heritage_items.id` (CASCADE DELETE)
- `translations.language_code` → `languages.code` (CASCADE DELETE)
- `translations.entity_id` → References various tables based on `entity_type`

### Indexes

All tables include appropriate indexes for:
- Foreign key relationships
- Frequently queried fields (state, region, category)
- Full-text search (translations table using GIN index)

## Notes

- All migrations use `IF NOT EXISTS` to be idempotent
- The languages table includes seed data for all 23 supported languages
- The translations table includes a trigger to automatically update the search_vector for full-text search
- All tables use UUID primary keys with `gen_random_uuid()`
- Timestamps are automatically managed with `created_at` and `updated_at` fields
