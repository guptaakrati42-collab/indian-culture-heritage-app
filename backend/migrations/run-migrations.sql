-- Run all migrations in order
-- This file executes all migration files in the correct sequence

\echo 'Running database migrations...'
\echo ''

\echo 'Migration 1: Creating languages table...'
\i 001_create_languages_table.sql
\echo 'Migration 1: Complete'
\echo ''

\echo 'Migration 2: Creating cities table...'
\i 002_create_cities_table.sql
\echo 'Migration 2: Complete'
\echo ''

\echo 'Migration 3: Creating heritage_items table...'
\i 003_create_heritage_items_table.sql
\echo 'Migration 3: Complete'
\echo ''

\echo 'Migration 4: Creating translations table...'
\i 004_create_translations_table.sql
\echo 'Migration 4: Complete'
\echo ''

\echo 'Migration 5: Creating images table...'
\i 005_create_images_table.sql
\echo 'Migration 5: Complete'
\echo ''

\echo 'Migration 6: Enhancing images table...'
\i 006_enhance_images_table.sql
\echo 'Migration 6: Complete'
\echo ''

\echo 'All migrations completed successfully!'
