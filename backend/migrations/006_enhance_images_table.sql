-- Migration: Enhance images table with location and historical period
-- Description: Add location and historical_period columns to images table for better image descriptions

-- Add new columns to images table
ALTER TABLE images 
ADD COLUMN location VARCHAR(255),
ADD COLUMN historical_period VARCHAR(100);

-- Add comments to explain the enhanced schema
COMMENT ON COLUMN images.location IS 'Physical location where the image was taken (e.g., "Main entrance of the temple")';
COMMENT ON COLUMN images.historical_period IS 'Historical period relevant to the image content (e.g., "12th century Chola period")';

-- Note: Image descriptions, captions, alt text, and cultural context are stored in translations table
-- with entity_type='image' and field_names: 'caption', 'alt_text', 'description', 'cultural_context'