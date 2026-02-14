-- Seed script for heritage items (at least 5 per city covering all categories)
-- Requirements: 3.1, 5.2, 9.1, 9.2
-- Categories: monuments, temples, festivals, traditions, cuisine, art_forms, historical_events, customs

-- Delhi heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '17th Century', 'https://source.unsplash.com/400x300/?red-fort,delhi'
FROM cities WHERE slug = 'delhi'
UNION ALL
SELECT id, 'temples', '18th Century', 'https://source.unsplash.com/400x300/?temple,delhi'
FROM cities WHERE slug = 'delhi'
UNION ALL
SELECT id, 'festivals', 'Modern Era', 'https://source.unsplash.com/400x300/?diwali,festival'
FROM cities WHERE slug = 'delhi'
UNION ALL
SELECT id, 'cuisine', 'Mughal Period', 'https://source.unsplash.com/400x300/?indian-food,delhi'
FROM cities WHERE slug = 'delhi'
UNION ALL
SELECT id, 'art_forms', '20th Century', 'https://source.unsplash.com/400x300/?indian-art,craft'
FROM cities WHERE slug = 'delhi'
UNION ALL
SELECT id, 'historical_events', '1947', 'https://source.unsplash.com/400x300/?india-gate,monument'
FROM cities WHERE slug = 'delhi'
ON CONFLICT DO NOTHING;

-- Mumbai heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '19th Century', 'https://source.unsplash.com/400x300/?gateway-of-india,mumbai'
FROM cities WHERE slug = 'mumbai'
UNION ALL
SELECT id, 'temples', 'Ancient', 'https://source.unsplash.com/400x300/?elephanta-caves,temple'
FROM cities WHERE slug = 'mumbai'
UNION ALL
SELECT id, 'festivals', 'Modern Era', 'https://source.unsplash.com/400x300/?ganesh-chaturthi,festival'
FROM cities WHERE slug = 'mumbai'
UNION ALL
SELECT id, 'cuisine', 'Colonial Period', 'https://source.unsplash.com/400x300/?street-food,mumbai'
FROM cities WHERE slug = 'mumbai'
UNION ALL
SELECT id, 'art_forms', '20th Century', 'https://source.unsplash.com/400x300/?bollywood,cinema'
FROM cities WHERE slug = 'mumbai'
UNION ALL
SELECT id, 'traditions', 'Modern Era', 'https://source.unsplash.com/400x300/?mumbai,culture'
FROM cities WHERE slug = 'mumbai'
ON CONFLICT DO NOTHING;

-- Kolkata heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '19th Century', 'https://source.unsplash.com/400x300/?victoria-memorial,kolkata'
FROM cities WHERE slug = 'kolkata'
UNION ALL
SELECT id, 'temples', '18th Century', 'https://source.unsplash.com/400x300/?temple,kolkata'
FROM cities WHERE slug = 'kolkata'
UNION ALL
SELECT id, 'festivals', 'Ancient', 'https://source.unsplash.com/400x300/?durga-puja,festival'
FROM cities WHERE slug = 'kolkata'
UNION ALL
SELECT id, 'cuisine', 'Bengali Tradition', 'https://source.unsplash.com/400x300/?bengali-sweets,food'
FROM cities WHERE slug = 'kolkata'
UNION ALL
SELECT id, 'art_forms', '19th Century', 'https://source.unsplash.com/400x300/?indian-music,art'
FROM cities WHERE slug = 'kolkata'
UNION ALL
SELECT id, 'customs', 'Traditional', 'https://source.unsplash.com/400x300/?kolkata,culture'
FROM cities WHERE slug = 'kolkata'
ON CONFLICT DO NOTHING;

-- Chennai heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '17th Century', 'https://source.unsplash.com/400x300/?fort,chennai'
FROM cities WHERE slug = 'chennai'
UNION ALL
SELECT id, 'temples', '8th Century', 'https://source.unsplash.com/400x300/?temple,chennai'
FROM cities WHERE slug = 'chennai'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?pongal,festival'
FROM cities WHERE slug = 'chennai'
UNION ALL
SELECT id, 'cuisine', 'Tamil Tradition', 'https://source.unsplash.com/400x300/?south-indian-food,dosa'
FROM cities WHERE slug = 'chennai'
UNION ALL
SELECT id, 'art_forms', 'Ancient', 'https://source.unsplash.com/400x300/?bharatanatyam,dance'
FROM cities WHERE slug = 'chennai'
UNION ALL
SELECT id, 'traditions', 'Traditional', 'https://source.unsplash.com/400x300/?kolam,art'
FROM cities WHERE slug = 'chennai'
ON CONFLICT DO NOTHING;

-- Bangalore heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '16th Century', 'https://source.unsplash.com/400x300/?palace,bangalore'
FROM cities WHERE slug = 'bangalore'
UNION ALL
SELECT id, 'temples', '16th Century', 'https://source.unsplash.com/400x300/?temple,bangalore'
FROM cities WHERE slug = 'bangalore'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?karnataka,festival'
FROM cities WHERE slug = 'bangalore'
UNION ALL
SELECT id, 'cuisine', 'Karnataka Tradition', 'https://source.unsplash.com/400x300/?south-indian-food,karnataka'
FROM cities WHERE slug = 'bangalore'
UNION ALL
SELECT id, 'art_forms', 'Traditional', 'https://source.unsplash.com/400x300/?indian-dance,karnataka'
FROM cities WHERE slug = 'bangalore'
UNION ALL
SELECT id, 'customs', 'Modern Era', 'https://source.unsplash.com/400x300/?bangalore,technology'
FROM cities WHERE slug = 'bangalore'
ON CONFLICT DO NOTHING;

-- Hyderabad heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '16th Century', 'https://source.unsplash.com/400x300/?charminar,hyderabad'
FROM cities WHERE slug = 'hyderabad'
UNION ALL
SELECT id, 'temples', '12th Century', 'https://source.unsplash.com/400x300/?temple,hyderabad'
FROM cities WHERE slug = 'hyderabad'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?telangana,festival'
FROM cities WHERE slug = 'hyderabad'
UNION ALL
SELECT id, 'cuisine', 'Nizami Tradition', 'https://source.unsplash.com/400x300/?biryani,hyderabad'
FROM cities WHERE slug = 'hyderabad'
UNION ALL
SELECT id, 'art_forms', 'Traditional', 'https://source.unsplash.com/400x300/?indian-craft,art'
FROM cities WHERE slug = 'hyderabad'
UNION ALL
SELECT id, 'historical_events', '1948', 'https://source.unsplash.com/400x300/?hyderabad,history'
FROM cities WHERE slug = 'hyderabad'
ON CONFLICT DO NOTHING;

-- Ahmedabad heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '15th Century', 'https://source.unsplash.com/400x300/?sabarmati,ahmedabad'
FROM cities WHERE slug = 'ahmedabad'
UNION ALL
SELECT id, 'temples', '11th Century', 'https://source.unsplash.com/400x300/?temple,ahmedabad'
FROM cities WHERE slug = 'ahmedabad'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?navratri,festival'
FROM cities WHERE slug = 'ahmedabad'
UNION ALL
SELECT id, 'cuisine', 'Gujarati Tradition', 'https://source.unsplash.com/400x300/?gujarati-food,dhokla'
FROM cities WHERE slug = 'ahmedabad'
UNION ALL
SELECT id, 'art_forms', 'Traditional', 'https://source.unsplash.com/400x300/?textile,gujarat'
FROM cities WHERE slug = 'ahmedabad'
UNION ALL
SELECT id, 'customs', 'Traditional', 'https://source.unsplash.com/400x300/?kite,festival'
FROM cities WHERE slug = 'ahmedabad'
ON CONFLICT DO NOTHING;

-- Pune heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '18th Century', 'https://source.unsplash.com/400x300/?fort,pune'
FROM cities WHERE slug = 'pune'
UNION ALL
SELECT id, 'temples', '17th Century', 'https://source.unsplash.com/400x300/?temple,pune'
FROM cities WHERE slug = 'pune'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?ganesh,festival'
FROM cities WHERE slug = 'pune'
UNION ALL
SELECT id, 'cuisine', 'Marathi Tradition', 'https://source.unsplash.com/400x300/?maharashtrian-food,misal'
FROM cities WHERE slug = 'pune'
UNION ALL
SELECT id, 'art_forms', 'Traditional', 'https://source.unsplash.com/400x300/?indian-dance,maharashtra'
FROM cities WHERE slug = 'pune'
UNION ALL
SELECT id, 'historical_events', '17th Century', 'https://source.unsplash.com/400x300/?maratha,history'
FROM cities WHERE slug = 'pune'
ON CONFLICT DO NOTHING;

-- Jaipur heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '18th Century', 'https://source.unsplash.com/400x300/?hawa-mahal,jaipur'
FROM cities WHERE slug = 'jaipur'
UNION ALL
SELECT id, 'temples', '18th Century', 'https://source.unsplash.com/400x300/?temple,jaipur'
FROM cities WHERE slug = 'jaipur'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?rajasthan,festival'
FROM cities WHERE slug = 'jaipur'
UNION ALL
SELECT id, 'cuisine', 'Rajasthani Tradition', 'https://source.unsplash.com/400x300/?rajasthani-food,dal-baati'
FROM cities WHERE slug = 'jaipur'
UNION ALL
SELECT id, 'art_forms', 'Traditional', 'https://source.unsplash.com/400x300/?pottery,jaipur'
FROM cities WHERE slug = 'jaipur'
UNION ALL
SELECT id, 'customs', 'Royal Tradition', 'https://source.unsplash.com/400x300/?turban,rajasthan'
FROM cities WHERE slug = 'jaipur'
ON CONFLICT DO NOTHING;

-- Lucknow heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '18th Century', 'https://source.unsplash.com/400x300/?imambara,lucknow'
FROM cities WHERE slug = 'lucknow'
UNION ALL
SELECT id, 'temples', '19th Century', 'https://source.unsplash.com/400x300/?temple,lucknow'
FROM cities WHERE slug = 'lucknow'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?lucknow,festival'
FROM cities WHERE slug = 'lucknow'
UNION ALL
SELECT id, 'cuisine', 'Awadhi Tradition', 'https://source.unsplash.com/400x300/?kebab,lucknow'
FROM cities WHERE slug = 'lucknow'
UNION ALL
SELECT id, 'art_forms', 'Mughal Period', 'https://source.unsplash.com/400x300/?embroidery,chikankari'
FROM cities WHERE slug = 'lucknow'
UNION ALL
SELECT id, 'customs', 'Nawabi Tradition', 'https://source.unsplash.com/400x300/?lucknow,culture'
FROM cities WHERE slug = 'lucknow'
ON CONFLICT DO NOTHING;

-- Varanasi heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', 'Ancient', 'https://source.unsplash.com/400x300/?varanasi,ghats'
FROM cities WHERE slug = 'varanasi'
UNION ALL
SELECT id, 'temples', 'Ancient', 'https://source.unsplash.com/400x300/?temple,varanasi'
FROM cities WHERE slug = 'varanasi'
UNION ALL
SELECT id, 'festivals', 'Ancient', 'https://source.unsplash.com/400x300/?diwali,varanasi'
FROM cities WHERE slug = 'varanasi'
UNION ALL
SELECT id, 'cuisine', 'Traditional', 'https://source.unsplash.com/400x300/?paan,betel'
FROM cities WHERE slug = 'varanasi'
UNION ALL
SELECT id, 'art_forms', 'Ancient', 'https://source.unsplash.com/400x300/?silk,varanasi'
FROM cities WHERE slug = 'varanasi'
UNION ALL
SELECT id, 'customs', 'Ancient', 'https://source.unsplash.com/400x300/?ganga-aarti,varanasi'
FROM cities WHERE slug = 'varanasi'
ON CONFLICT DO NOTHING;

-- Agra heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '17th Century', 'https://source.unsplash.com/400x300/?taj-mahal,agra'
FROM cities WHERE slug = 'agra'
UNION ALL
SELECT id, 'temples', '16th Century', 'https://source.unsplash.com/400x300/?temple,agra'
FROM cities WHERE slug = 'agra'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?agra,festival'
FROM cities WHERE slug = 'agra'
UNION ALL
SELECT id, 'cuisine', 'Mughal Tradition', 'https://source.unsplash.com/400x300/?petha,sweet'
FROM cities WHERE slug = 'agra'
UNION ALL
SELECT id, 'art_forms', 'Mughal Period', 'https://source.unsplash.com/400x300/?marble,inlay'
FROM cities WHERE slug = 'agra'
UNION ALL
SELECT id, 'historical_events', '17th Century', 'https://source.unsplash.com/400x300/?mughal,architecture'
FROM cities WHERE slug = 'agra'
ON CONFLICT DO NOTHING;

-- Amritsar heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '16th Century', 'https://source.unsplash.com/400x300/?golden-temple,amritsar'
FROM cities WHERE slug = 'amritsar'
UNION ALL
SELECT id, 'temples', '16th Century', 'https://source.unsplash.com/400x300/?temple,amritsar'
FROM cities WHERE slug = 'amritsar'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?vaisakhi,festival'
FROM cities WHERE slug = 'amritsar'
UNION ALL
SELECT id, 'cuisine', 'Punjabi Tradition', 'https://source.unsplash.com/400x300/?kulcha,punjabi-food'
FROM cities WHERE slug = 'amritsar'
UNION ALL
SELECT id, 'art_forms', 'Traditional', 'https://source.unsplash.com/400x300/?embroidery,punjab'
FROM cities WHERE slug = 'amritsar'
UNION ALL
SELECT id, 'historical_events', '1919', 'https://source.unsplash.com/400x300/?jallianwala-bagh,memorial'
FROM cities WHERE slug = 'amritsar'
ON CONFLICT DO NOTHING;

-- Kochi heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '16th Century', 'https://source.unsplash.com/400x300/?palace,kochi'
FROM cities WHERE slug = 'kochi'
UNION ALL
SELECT id, 'temples', '16th Century', 'https://source.unsplash.com/400x300/?temple,kochi'
FROM cities WHERE slug = 'kochi'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?onam,festival'
FROM cities WHERE slug = 'kochi'
UNION ALL
SELECT id, 'cuisine', 'Kerala Tradition', 'https://source.unsplash.com/400x300/?appam,kerala-food'
FROM cities WHERE slug = 'kochi'
UNION ALL
SELECT id, 'art_forms', 'Ancient', 'https://source.unsplash.com/400x300/?kathakali,dance'
FROM cities WHERE slug = 'kochi'
UNION ALL
SELECT id, 'customs', 'Traditional', 'https://source.unsplash.com/400x300/?fishing-nets,kochi'
FROM cities WHERE slug = 'kochi'
ON CONFLICT DO NOTHING;

-- Guwahati heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '17th Century', 'https://source.unsplash.com/400x300/?assam,monument'
FROM cities WHERE slug = 'guwahati'
UNION ALL
SELECT id, 'temples', '8th Century', 'https://source.unsplash.com/400x300/?kamakhya,temple'
FROM cities WHERE slug = 'guwahati'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?bihu,festival'
FROM cities WHERE slug = 'guwahati'
UNION ALL
SELECT id, 'cuisine', 'Assamese Tradition', 'https://source.unsplash.com/400x300/?assamese-food,fish'
FROM cities WHERE slug = 'guwahati'
UNION ALL
SELECT id, 'art_forms', 'Traditional', 'https://source.unsplash.com/400x300/?sattriya,dance'
FROM cities WHERE slug = 'guwahati'
UNION ALL
SELECT id, 'customs', 'Traditional', 'https://source.unsplash.com/400x300/?gamosa,assam'
FROM cities WHERE slug = 'guwahati'
ON CONFLICT DO NOTHING;

-- Bhubaneswar heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '11th Century', 'https://source.unsplash.com/400x300/?temple,bhubaneswar'
FROM cities WHERE slug = 'bhubaneswar'
UNION ALL
SELECT id, 'temples', '7th Century', 'https://source.unsplash.com/400x300/?odisha,temple'
FROM cities WHERE slug = 'bhubaneswar'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?rath-yatra,festival'
FROM cities WHERE slug = 'bhubaneswar'
UNION ALL
SELECT id, 'cuisine', 'Odia Tradition', 'https://source.unsplash.com/400x300/?odia-food,dalma'
FROM cities WHERE slug = 'bhubaneswar'
UNION ALL
SELECT id, 'art_forms', 'Ancient', 'https://source.unsplash.com/400x300/?odissi,dance'
FROM cities WHERE slug = 'bhubaneswar'
UNION ALL
SELECT id, 'customs', 'Traditional', 'https://source.unsplash.com/400x300/?pattachitra,art'
FROM cities WHERE slug = 'bhubaneswar'
ON CONFLICT DO NOTHING;

-- Mysore heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '14th Century', 'https://source.unsplash.com/400x300/?mysore-palace,mysore'
FROM cities WHERE slug = 'mysore'
UNION ALL
SELECT id, 'temples', '12th Century', 'https://source.unsplash.com/400x300/?temple,mysore'
FROM cities WHERE slug = 'mysore'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?dasara,festival'
FROM cities WHERE slug = 'mysore'
UNION ALL
SELECT id, 'cuisine', 'Karnataka Tradition', 'https://source.unsplash.com/400x300/?mysore-pak,sweet'
FROM cities WHERE slug = 'mysore'
UNION ALL
SELECT id, 'art_forms', 'Traditional', 'https://source.unsplash.com/400x300/?painting,mysore'
FROM cities WHERE slug = 'mysore'
UNION ALL
SELECT id, 'customs', 'Royal Tradition', 'https://source.unsplash.com/400x300/?silk,mysore'
FROM cities WHERE slug = 'mysore'
ON CONFLICT DO NOTHING;

-- Udaipur heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '16th Century', 'https://source.unsplash.com/400x300/?city-palace,udaipur'
FROM cities WHERE slug = 'udaipur'
UNION ALL
SELECT id, 'temples', '17th Century', 'https://source.unsplash.com/400x300/?temple,udaipur'
FROM cities WHERE slug = 'udaipur'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?mewar,festival'
FROM cities WHERE slug = 'udaipur'
UNION ALL
SELECT id, 'cuisine', 'Rajasthani Tradition', 'https://source.unsplash.com/400x300/?rajasthani-food,curry'
FROM cities WHERE slug = 'udaipur'
UNION ALL
SELECT id, 'art_forms', 'Traditional', 'https://source.unsplash.com/400x300/?miniature-painting,rajasthan'
FROM cities WHERE slug = 'udaipur'
UNION ALL
SELECT id, 'customs', 'Royal Tradition', 'https://source.unsplash.com/400x300/?lake-palace,udaipur'
FROM cities WHERE slug = 'udaipur'
ON CONFLICT DO NOTHING;

-- Madurai heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '17th Century', 'https://source.unsplash.com/400x300/?palace,madurai'
FROM cities WHERE slug = 'madurai'
UNION ALL
SELECT id, 'temples', '6th Century', 'https://source.unsplash.com/400x300/?meenakshi-temple,madurai'
FROM cities WHERE slug = 'madurai'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?tamil,festival'
FROM cities WHERE slug = 'madurai'
UNION ALL
SELECT id, 'cuisine', 'Tamil Tradition', 'https://source.unsplash.com/400x300/?jigarthanda,drink'
FROM cities WHERE slug = 'madurai'
UNION ALL
SELECT id, 'art_forms', 'Ancient', 'https://source.unsplash.com/400x300/?tamil,literature'
FROM cities WHERE slug = 'madurai'
UNION ALL
SELECT id, 'customs', 'Traditional', 'https://source.unsplash.com/400x300/?jasmine,flower'
FROM cities WHERE slug = 'madurai'
ON CONFLICT DO NOTHING;

-- Jodhpur heritage items
INSERT INTO heritage_items (city_id, category, historical_period, thumbnail_image_url)
SELECT id, 'monuments', '15th Century', 'https://source.unsplash.com/400x300/?mehrangarh-fort,jodhpur'
FROM cities WHERE slug = 'jodhpur'
UNION ALL
SELECT id, 'temples', '15th Century', 'https://source.unsplash.com/400x300/?temple,jodhpur'
FROM cities WHERE slug = 'jodhpur'
UNION ALL
SELECT id, 'festivals', 'Traditional', 'https://source.unsplash.com/400x300/?marwar,festival'
FROM cities WHERE slug = 'jodhpur'
UNION ALL
SELECT id, 'cuisine', 'Rajasthani Tradition', 'https://source.unsplash.com/400x300/?mirchi-vada,snack'
FROM cities WHERE slug = 'jodhpur'
UNION ALL
SELECT id, 'art_forms', 'Traditional', 'https://source.unsplash.com/400x300/?bandhani,textile'
FROM cities WHERE slug = 'jodhpur'
UNION ALL
SELECT id, 'customs', 'Traditional', 'https://source.unsplash.com/400x300/?blue-city,jodhpur'
FROM cities WHERE slug = 'jodhpur'
ON CONFLICT DO NOTHING;
