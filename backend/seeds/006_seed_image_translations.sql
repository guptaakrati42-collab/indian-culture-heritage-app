-- Seed script for image translations (captions, descriptions, cultural context)
-- Requirements: 4.1, 4.7, 5.3, 5.4, 9.1, 9.2

-- Image translations for Red Fort images (English)
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'caption',
  CASE i.display_order
    WHEN 1 THEN 'Red Fort Main Entrance'
    WHEN 2 THEN 'Diwan-i-Aam (Hall of Public Audience)'
    WHEN 3 THEN 'Intricate Marble Work'
  END
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'delhi' AND h.category = 'monuments'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'description',
  CASE i.display_order
    WHEN 1 THEN 'The imposing Lahori Gate entrance with its massive red sandstone walls'
    WHEN 2 THEN 'The grand hall where the emperor held public audiences with ornate arches'
    WHEN 3 THEN 'Delicate floral patterns carved in white marble inlaid with precious stones'
  END
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'delhi' AND h.category = 'monuments'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'cultural_context',
  CASE i.display_order
    WHEN 1 THEN 'This gate faces Lahore, symbolizing the Mughal Empire''s connection to its origins. The Prime Minister hoists the national flag here every Independence Day.'
    WHEN 2 THEN 'This hall represents Mughal administrative power where common citizens could present petitions to the emperor, showcasing the empire''s governance system.'
    WHEN 3 THEN 'This pietra dura technique was brought from Italy and perfected by Mughal artisans, representing the cultural synthesis of the era.'
  END
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'delhi' AND h.category = 'monuments'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'alt_text',
  CASE i.display_order
    WHEN 1 THEN 'Red sandstone entrance gate of Red Fort with large archway'
    WHEN 2 THEN 'Interior view of Diwan-i-Aam showing rows of arched columns'
    WHEN 3 THEN 'Close-up of white marble with inlaid floral patterns in semi-precious stones'
  END
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'delhi' AND h.category = 'monuments'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- Image translations for Gateway of India (English)
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'caption',
  CASE i.display_order
    WHEN 1 THEN 'Gateway of India at Sunset'
    WHEN 2 THEN 'View from the Arabian Sea'
    WHEN 3 THEN 'Architectural Details'
  END
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'mumbai' AND h.category = 'monuments'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'description',
  CASE i.display_order
    WHEN 1 THEN 'The iconic arch monument silhouetted against the evening sky'
    WHEN 2 THEN 'The Gateway viewed from a boat, showing its waterfront location'
    WHEN 3 THEN 'Indo-Saracenic architectural elements combining Hindu and Muslim styles'
  END
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'mumbai' AND h.category = 'monuments'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'cultural_context',
  CASE i.display_order
    WHEN 1 THEN 'Built to commemorate the 1911 visit of King George V and Queen Mary, it became a symbol of British colonial power and later of Indian independence.'
    WHEN 2 THEN 'The Gateway overlooks the Arabian Sea, historically the entry point for visitors arriving by ship, making it Mumbai''s symbolic entrance.'
    WHEN 3 THEN 'The architecture blends Islamic arches with Hindu decorative elements, representing India''s diverse cultural heritage under British interpretation.'
  END
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'mumbai' AND h.category = 'monuments'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- Image translations for Taj Mahal (English)
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'caption',
  CASE i.display_order
    WHEN 1 THEN 'Taj Mahal Front View'
    WHEN 2 THEN 'Taj Mahal at Dawn'
    WHEN 3 THEN 'Intricate Calligraphy and Inlay'
  END
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'agra' AND h.category = 'monuments'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'description',
  CASE i.display_order
    WHEN 1 THEN 'The pristine white marble mausoleum with its iconic dome and four minarets'
    WHEN 2 THEN 'The monument bathed in soft morning light reflecting in the water channel'
    WHEN 3 THEN 'Quranic verses in black marble calligraphy with floral inlay work'
  END
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'agra' AND h.category = 'monuments'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'cultural_context',
  CASE i.display_order
    WHEN 1 THEN 'Built by Emperor Shah Jahan in memory of his wife Mumtaz Mahal, it represents the pinnacle of Mughal architecture and eternal love.'
    WHEN 2 THEN 'The changing colors of the marble throughout the day symbolize the different moods of a woman, according to Mughal poetry and aesthetics.'
    WHEN 3 THEN 'The calligraphy was designed to appear uniform from ground level through careful size gradation, showcasing advanced mathematical and artistic knowledge.'
  END
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'agra' AND h.category = 'monuments'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- Image translations for Varanasi Ghats (English)
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'caption',
  CASE i.display_order
    WHEN 1 THEN 'Dashashwamedh Ghat During Ganga Aarti'
    WHEN 2 THEN 'Morning Rituals at the Ghats'
    WHEN 3 THEN 'Boats on the Ganges'
  END
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'varanasi' AND h.category = 'monuments'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'description',
  CASE i.display_order
    WHEN 1 THEN 'Priests performing the evening aarti ceremony with large brass lamps'
    WHEN 2 THEN 'Devotees bathing in the sacred Ganges at sunrise'
    WHEN 3 THEN 'Traditional wooden boats lined along the ancient stone steps'
  END
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'varanasi' AND h.category = 'monuments'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'cultural_context',
  CASE i.display_order
    WHEN 1 THEN 'The Ganga Aarti is a daily ritual that has been performed for centuries, representing the eternal worship of the river goddess and the cycle of life and death.'
    WHEN 2 THEN 'Bathing in the Ganges at Varanasi is believed to cleanse sins and break the cycle of rebirth, making it one of Hinduism''s most sacred acts.'
    WHEN 3 THEN 'These boats have ferried pilgrims and tourists for generations, offering a unique perspective of the city''s spiritual landscape from the water.'
  END
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'varanasi' AND h.category = 'monuments'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- Generic image translations for all other images (English)
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'caption',
  c.slug || ' ' || h.category || ' - Image ' || i.display_order
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM translations t 
  WHERE t.entity_type = 'image' 
  AND t.entity_id = i.id 
  AND t.field_name = 'caption'
)
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'description',
  'A view showcasing the ' || h.category || ' heritage of ' || c.slug
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM translations t 
  WHERE t.entity_type = 'image' 
  AND t.entity_id = i.id 
  AND t.field_name = 'description'
)
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'cultural_context',
  'This image represents an important aspect of ' || c.slug || '''s cultural heritage in the ' || h.category || ' category'
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM translations t 
  WHERE t.entity_type = 'image' 
  AND t.entity_id = i.id 
  AND t.field_name = 'cultural_context'
)
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'alt_text',
  'Image of ' || h.category || ' from ' || c.slug
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM translations t 
  WHERE t.entity_type = 'image' 
  AND t.entity_id = i.id 
  AND t.field_name = 'alt_text'
)
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- Add location information for images
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'location',
  c.slug || ', ' || c.state
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
JOIN cities c ON h.city_id = c.id
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- Add period information for images (use heritage item's historical period)
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'image', i.id, 'en', 'period',
  COALESCE(h.historical_period, 'Historical')
FROM images i
JOIN heritage_items h ON i.heritage_id = h.id
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;
