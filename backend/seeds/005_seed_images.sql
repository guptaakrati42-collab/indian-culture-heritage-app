-- Seed script for images (at least 3 per heritage item)
-- Requirements: 4.1, 5.3, 9.1, 9.2

-- Images for Delhi heritage items
INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
SELECT h.id, 
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/400/300?random=1',
  1
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'delhi' AND h.category = 'monuments'
UNION ALL
SELECT h.id, 
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/400/300?random=2',
  2
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'delhi' AND h.category = 'monuments'
UNION ALL
SELECT h.id, 
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/400/300?random=3',
  3
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'delhi' AND h.category = 'monuments'
ON CONFLICT DO NOTHING;

-- Images for Mumbai Gateway of India
INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
SELECT h.id, 
  'https://picsum.photos/800/600?random=4',
  'https://picsum.photos/400/300?random=4',
  1
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'mumbai' AND h.category = 'monuments'
UNION ALL
SELECT h.id, 
  'https://picsum.photos/800/600?random=5',
  'https://picsum.photos/400/300?random=5',
  2
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'mumbai' AND h.category = 'monuments'
UNION ALL
SELECT h.id, 
  'https://picsum.photos/800/600?random=6',
  'https://picsum.photos/400/300?random=6',
  3
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'mumbai' AND h.category = 'monuments'
ON CONFLICT DO NOTHING;

-- Images for Varanasi Ghats
INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
SELECT h.id, 
  'https://picsum.photos/800/600?random=7',
  'https://picsum.photos/400/300?random=7',
  1
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'varanasi' AND h.category = 'monuments'
UNION ALL
SELECT h.id, 
  'https://picsum.photos/800/600?random=8',
  'https://picsum.photos/400/300?random=8',
  2
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'varanasi' AND h.category = 'monuments'
UNION ALL
SELECT h.id, 
  'https://picsum.photos/800/600?random=9',
  'https://picsum.photos/400/300?random=9',
  3
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'varanasi' AND h.category = 'monuments'
ON CONFLICT DO NOTHING;

-- Images for Agra Taj Mahal
INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
SELECT h.id, 
  'https://picsum.photos/800/600?random=10',
  'https://picsum.photos/400/300?random=10',
  1
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'agra' AND h.category = 'monuments'
UNION ALL
SELECT h.id, 
  'https://picsum.photos/800/600?random=11',
  'https://picsum.photos/400/300?random=11',
  2
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'agra' AND h.category = 'monuments'
UNION ALL
SELECT h.id, 
  'https://picsum.photos/800/600?random=12',
  'https://picsum.photos/400/300?random=12',
  3
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'agra' AND h.category = 'monuments'
ON CONFLICT DO NOTHING;

-- Generic images for all other heritage items (3 images each)
-- Using a counter to ensure unique random seeds
INSERT INTO images (heritage_id, url, thumbnail_url, display_order)
SELECT h.id,
  'https://picsum.photos/800/600?random=' || (h.id * 10 + 1)::text,
  'https://picsum.photos/400/300?random=' || (h.id * 10 + 1)::text,
  1
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM images i WHERE i.heritage_id = h.id
)
UNION ALL
SELECT h.id,
  'https://picsum.photos/800/600?random=' || (h.id * 10 + 2)::text,
  'https://picsum.photos/400/300?random=' || (h.id * 10 + 2)::text,
  2
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM images i WHERE i.heritage_id = h.id AND i.display_order = 2
)
UNION ALL
SELECT h.id,
  'https://picsum.photos/800/600?random=' || (h.id * 10 + 3)::text,
  'https://picsum.photos/400/300?random=' || (h.id * 10 + 3)::text,
  3
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM images i WHERE i.heritage_id = h.id AND i.display_order = 3
)
ON CONFLICT DO NOTHING;
