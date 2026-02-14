-- Migration: Create images table with indexes
-- Requirements: 5.3, 8.1, 8.2, 8.3, 8.4

CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heritage_id UUID NOT NULL REFERENCES heritage_items(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_images_heritage ON images(heritage_id);
CREATE INDEX IF NOT EXISTS idx_images_heritage_order ON images(heritage_id, display_order);
