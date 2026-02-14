-- Migration: Create translations table with full-text search indexes
-- Requirements: 5.3, 5.4, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3

CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  language_code VARCHAR(10) NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
  field_name VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  search_vector tsvector,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_type, entity_id, language_code, field_name)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_translations_entity ON translations(entity_type, entity_id, language_code);
CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language_code);
CREATE INDEX IF NOT EXISTS idx_translations_entity_type ON translations(entity_type, entity_id);

-- Full-text search index using GIN
CREATE INDEX IF NOT EXISTS idx_translations_search ON translations USING GIN(search_vector);

-- Function to automatically update search_vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search_vector on insert or update
CREATE TRIGGER trigger_update_search_vector
  BEFORE INSERT OR UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();
