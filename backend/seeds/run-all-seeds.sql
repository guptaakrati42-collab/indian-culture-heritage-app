-- Master seed script to run all seeds in correct order
-- Requirements: 2.1, 3.1, 4.1, 5.1, 5.2, 5.3, 5.4, 9.1, 9.2, 9.3

-- Note: Languages table is already seeded in migration 001_create_languages_table.sql

-- 1. Seed cities
\i 001_seed_cities.sql

-- 2. Seed city translations
\i 002_seed_city_translations.sql

-- 3. Seed heritage items
\i 003_seed_heritage_items.sql

-- 4. Seed heritage translations
\i 004_seed_heritage_translations.sql

-- 5. Seed images
\i 005_seed_images.sql

-- 6. Seed image translations
\i 006_seed_image_translations.sql

-- Verify seed data
SELECT 'Cities seeded: ' || COUNT(*) FROM cities;
SELECT 'Heritage items seeded: ' || COUNT(*) FROM heritage_items;
SELECT 'Images seeded: ' || COUNT(*) FROM images;
SELECT 'Translations seeded: ' || COUNT(*) FROM translations;

-- Verify referential integrity
SELECT 'Cities without translations: ' || COUNT(*) 
FROM cities c 
WHERE NOT EXISTS (
  SELECT 1 FROM translations t 
  WHERE t.entity_type = 'city' 
  AND t.entity_id = c.id 
  AND t.language_code = 'en'
);

SELECT 'Heritage items without translations: ' || COUNT(*) 
FROM heritage_items h 
WHERE NOT EXISTS (
  SELECT 1 FROM translations t 
  WHERE t.entity_type = 'heritage' 
  AND t.entity_id = h.id 
  AND t.language_code = 'en'
);

SELECT 'Images without translations: ' || COUNT(*) 
FROM images i 
WHERE NOT EXISTS (
  SELECT 1 FROM translations t 
  WHERE t.entity_type = 'image' 
  AND t.entity_id = i.id 
  AND t.language_code = 'en'
);
