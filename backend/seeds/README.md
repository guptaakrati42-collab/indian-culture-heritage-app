# Database Seeds

This directory contains seed data for the Indian Culture App database.

## Overview

The seed scripts populate the database with sample data including:
- 20 major Indian cities across all regions
- 5+ heritage items per city covering all 8 categories
- Translations in English and Hindi for all content
- 3+ images per heritage item with detailed metadata

## Seed Files

1. **001_seed_cities.sql** - Seeds 20 major Indian cities
2. **002_seed_city_translations.sql** - Seeds city name and state translations (English & Hindi)
3. **003_seed_heritage_items.sql** - Seeds heritage items for all cities (monuments, temples, festivals, traditions, cuisine, art_forms, historical_events, customs)
4. **004_seed_heritage_translations.sql** - Seeds heritage item translations (English & Hindi)
5. **005_seed_images.sql** - Seeds images for all heritage items (minimum 3 per item)
6. **006_seed_image_translations.sql** - Seeds image captions, descriptions, cultural context, and alt text

## Running Seeds

### Option 1: Using PostgreSQL CLI

```bash
cd backend/seeds
psql -U postgres -d indian_culture_db -f run-all-seeds.sql
```

### Option 2: Using Node.js Script

```bash
cd backend
npm run seed
```

Or with ts-node:

```bash
cd backend
npx ts-node src/scripts/seed-database.ts
```

## Prerequisites

- Database must be created and migrations must be run first
- Languages table is already seeded in migration 001_create_languages_table.sql
- All tables must exist before running seeds

## Data Structure

### Cities (20 cities)
- Delhi, Mumbai, Kolkata, Chennai, Bangalore
- Hyderabad, Ahmedabad, Pune, Jaipur, Lucknow
- Varanasi, Agra, Amritsar, Kochi, Guwahati
- Bhubaneswar, Mysore, Udaipur, Madurai, Jodhpur

### Heritage Categories (8 categories)
- monuments - Historical monuments and structures
- temples - Religious temples and shrines
- festivals - Cultural festivals and celebrations
- traditions - Traditional practices and customs
- cuisine - Traditional food and culinary heritage
- art_forms - Traditional arts and crafts
- historical_events - Significant historical events
- customs - Local customs and practices

### Translations
- All content has English translations
- All content has Hindi translations
- Fallback to English if translation missing

### Images
- Each heritage item has at least 3 images
- Each image has caption, description, cultural context, and alt text
- Images include location and historical period information

## Verification

After running seeds, verify:
- All cities have English and Hindi translations
- All heritage items have required fields and translations
- All images have valid URLs and translations
- Referential integrity is maintained

The seed script automatically runs verification queries and reports any issues.

## Notes

- Image URLs are placeholder URLs (https://images.example.com/...)
- In production, replace with actual CDN URLs
- Seed data is idempotent - can be run multiple times safely
- Uses ON CONFLICT DO NOTHING to prevent duplicates
