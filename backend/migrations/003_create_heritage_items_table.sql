-- Migration: Create heritage_items table with indexes
-- Requirements: 5.2, 8.1, 8.2, 8.3, 8.4

CREATE TABLE IF NOT EXISTS heritage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  historical_period VARCHAR(100),
  thumbnail_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_heritage_city ON heritage_items(city_id);
CREATE INDEX IF NOT EXISTS idx_heritage_category ON heritage_items(category);
CREATE INDEX IF NOT EXISTS idx_heritage_city_category ON heritage_items(city_id, category);
