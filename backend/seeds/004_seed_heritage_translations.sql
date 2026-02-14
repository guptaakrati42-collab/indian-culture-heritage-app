-- Seed script for heritage item translations (English and Hindi)
-- Requirements: 3.1, 5.3, 5.4, 9.1, 9.2, 9.3

-- Helper function to get heritage item IDs by city and category
-- This will be used in the INSERT statements

-- Delhi heritage translations (English)
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'name',
  CASE h.category
    WHEN 'monuments' THEN 'Red Fort'
    WHEN 'temples' THEN 'Akshardham Temple'
    WHEN 'festivals' THEN 'Diwali Celebrations'
    WHEN 'cuisine' THEN 'Mughlai Cuisine'
    WHEN 'art_forms' THEN 'Delhi Street Art'
    WHEN 'historical_events' THEN 'Independence Day 1947'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'delhi'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'summary',
  CASE h.category
    WHEN 'monuments' THEN 'A magnificent red sandstone fort built by Mughal Emperor Shah Jahan'
    WHEN 'temples' THEN 'A stunning modern Hindu temple complex showcasing traditional architecture'
    WHEN 'festivals' THEN 'The festival of lights celebrated with grandeur across Delhi'
    WHEN 'cuisine' THEN 'Rich and aromatic dishes from the Mughal era'
    WHEN 'art_forms' THEN 'Vibrant street art movement transforming Delhi''s urban landscape'
    WHEN 'historical_events' THEN 'India gained independence from British rule on August 15, 1947'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'delhi'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'detailed_description',
  CASE h.category
    WHEN 'monuments' THEN 'The Red Fort, also known as Lal Qila, served as the main residence of Mughal emperors for nearly 200 years. Built in 1648, it represents the zenith of Mughal architecture with its massive red sandstone walls, intricate marble work, and beautiful gardens. The fort complex includes palaces, audience halls, and mosques.'
    WHEN 'temples' THEN 'Akshardham Temple is a masterpiece of Indian architecture, culture, and spirituality. Opened in 2005, it showcases 10,000 years of Indian heritage through intricately carved pillars, domes, and sculptures. The temple is built entirely of pink sandstone and Italian Carrara marble without any steel.'
    WHEN 'festivals' THEN 'Diwali in Delhi is celebrated with immense enthusiasm. Homes are decorated with diyas (oil lamps), rangoli patterns adorn doorsteps, and the night sky lights up with fireworks. Markets bustle with shoppers buying sweets, gifts, and new clothes. The festival symbolizes the victory of light over darkness.'
    WHEN 'cuisine' THEN 'Mughlai cuisine represents the cooking style of the Mughal Empire. Characterized by rich gravies, aromatic spices, and slow-cooking techniques, dishes like biryani, kebabs, and korma showcase Persian influences blended with Indian flavors. The use of dry fruits, saffron, and cream creates luxurious textures.'
    WHEN 'art_forms' THEN 'Delhi''s street art scene has exploded in recent years, with artists using walls as canvases to express social commentary, cultural identity, and urban stories. From Lodhi Art District to Shahpur Jat, murals blend traditional Indian motifs with contemporary themes.'
    WHEN 'historical_events' THEN 'On August 15, 1947, India achieved independence after nearly 200 years of British colonial rule. The first Prime Minister, Jawaharlal Nehru, hoisted the Indian flag at the Red Fort and delivered his famous "Tryst with Destiny" speech, marking the birth of the world''s largest democracy.'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'delhi'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- Delhi heritage translations (Hindi)
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'hi', 'name',
  CASE h.category
    WHEN 'monuments' THEN 'लाल किला'
    WHEN 'temples' THEN 'अक्षरधाम मंदिर'
    WHEN 'festivals' THEN 'दिवाली उत्सव'
    WHEN 'cuisine' THEN 'मुगलई व्यंजन'
    WHEN 'art_forms' THEN 'दिल्ली स्ट्रीट आर्ट'
    WHEN 'historical_events' THEN 'स्वतंत्रता दिवस 1947'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'delhi'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'hi', 'summary',
  CASE h.category
    WHEN 'monuments' THEN 'मुगल सम्राट शाहजहाँ द्वारा निर्मित एक भव्य लाल बलुआ पत्थर का किला'
    WHEN 'temples' THEN 'पारंपरिक वास्तुकला को प्रदर्शित करने वाला एक आश्चर्यजनक आधुनिक हिंदू मंदिर परिसर'
    WHEN 'festivals' THEN 'दिल्ली भर में भव्यता के साथ मनाया जाने वाला प्रकाश का त्योहार'
    WHEN 'cuisine' THEN 'मुगल युग के समृद्ध और सुगंधित व्यंजन'
    WHEN 'art_forms' THEN 'दिल्ली के शहरी परिदृश्य को बदलता जीवंत स्ट्रीट आर्ट आंदोलन'
    WHEN 'historical_events' THEN 'भारत ने 15 अगस्त 1947 को ब्रिटिश शासन से स्वतंत्रता प्राप्त की'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'delhi'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- Mumbai heritage translations (English)
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'name',
  CASE h.category
    WHEN 'monuments' THEN 'Gateway of India'
    WHEN 'temples' THEN 'Elephanta Caves'
    WHEN 'festivals' THEN 'Ganesh Chaturthi'
    WHEN 'cuisine' THEN 'Vada Pav'
    WHEN 'art_forms' THEN 'Bollywood Cinema'
    WHEN 'traditions' THEN 'Dabbawalas'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'mumbai'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'summary',
  CASE h.category
    WHEN 'monuments' THEN 'An iconic arch monument built during the British Raj'
    WHEN 'temples' THEN 'Ancient rock-cut cave temples dedicated to Lord Shiva'
    WHEN 'festivals' THEN 'Mumbai''s grandest festival celebrating Lord Ganesha'
    WHEN 'cuisine' THEN 'Mumbai''s beloved street food - spicy potato fritter in a bun'
    WHEN 'art_forms' THEN 'The heart of India''s film industry producing thousands of movies'
    WHEN 'traditions' THEN 'World-famous lunchbox delivery system with incredible accuracy'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'mumbai'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'detailed_description',
  CASE h.category
    WHEN 'monuments' THEN 'The Gateway of India was built in 1924 to commemorate the visit of King George V and Queen Mary. This 26-meter high basalt arch combines Hindu and Muslim architectural styles. It overlooks the Arabian Sea and has become Mumbai''s most recognizable landmark, witnessing both the arrival of British monarchs and the departure of the last British troops in 1948.'
    WHEN 'temples' THEN 'The Elephanta Caves, dating back to the 5th-8th centuries, are a UNESCO World Heritage Site. Located on Elephanta Island, these rock-cut temples feature magnificent sculptures of Hindu deities, most notably the 20-foot Trimurti (three-faced Shiva). The caves represent the pinnacle of Indian rock-cut architecture.'
    WHEN 'festivals' THEN 'Ganesh Chaturthi transforms Mumbai for 10 days each year. Elaborate pandals (temporary structures) house beautifully crafted Ganesha idols. Communities compete in creativity and devotion. The festival culminates in grand processions where idols are immersed in the sea, accompanied by music, dance, and chants of "Ganpati Bappa Morya."'
    WHEN 'cuisine' THEN 'Vada Pav, created in the 1960s, is Mumbai''s answer to the burger. A deep-fried potato dumpling (batata vada) spiced with green chilies and garlic is sandwiched in a pav (bread roll) with chutneys. This affordable, filling snack fuels the city''s workforce and represents Mumbai''s fast-paced culture.'
    WHEN 'art_forms' THEN 'Bollywood, based in Mumbai, is the world''s largest film industry by number of films produced. Since the 1930s, it has created a unique cinematic language blending drama, music, dance, and emotion. Bollywood films have shaped Indian popular culture and gained global recognition for their colorful storytelling.'
    WHEN 'traditions' THEN 'Mumbai''s dabbawalas have operated since 1890, delivering over 200,000 lunch boxes daily with a Six Sigma accuracy rate. Using a complex coding system, they collect home-cooked meals and deliver them to office workers across the city. This efficient system has been studied by business schools worldwide.'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'mumbai'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- Varanasi heritage translations (English) - Sacred city example
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'name',
  CASE h.category
    WHEN 'monuments' THEN 'Ghats of Varanasi'
    WHEN 'temples' THEN 'Kashi Vishwanath Temple'
    WHEN 'festivals' THEN 'Dev Deepawali'
    WHEN 'cuisine' THEN 'Banarasi Paan'
    WHEN 'art_forms' THEN 'Banarasi Silk Weaving'
    WHEN 'customs' THEN 'Ganga Aarti'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'varanasi'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'summary',
  CASE h.category
    WHEN 'monuments' THEN 'Ancient stone steps leading to the sacred Ganges River'
    WHEN 'temples' THEN 'One of the most sacred Hindu temples dedicated to Lord Shiva'
    WHEN 'festivals' THEN 'Festival of lights celebrated on the full moon night'
    WHEN 'cuisine' THEN 'Traditional betel leaf preparation with aromatic ingredients'
    WHEN 'art_forms' THEN 'Centuries-old tradition of weaving luxurious silk sarees'
    WHEN 'customs' THEN 'Daily evening ritual of worship performed on the riverbank'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'varanasi'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'detailed_description',
  CASE h.category
    WHEN 'monuments' THEN 'The 88 ghats of Varanasi are the city''s spiritual heart. These stone embankments along the Ganges have served as sites for bathing, cremation, and worship for over 2,000 years. Each ghat has its own history and significance. Pilgrims believe bathing in the Ganges cleanses sins and brings salvation.'
    WHEN 'temples' THEN 'Kashi Vishwanath Temple, rebuilt in 1780, houses one of the twelve Jyotirlingas (sacred representations of Shiva). The temple''s gold-plated spire and dome are iconic. Despite being destroyed and rebuilt multiple times through history, it remains the spiritual center of Varanasi, attracting millions of devotees annually.'
    WHEN 'festivals' THEN 'Dev Deepawali, celebrated 15 days after Diwali, is when the gods descend to earth. The ghats are illuminated with over a million earthen lamps, creating a breathtaking spectacle. Devotees perform Kartik Snan (holy bath) and witness special aartis. The Ganges reflects the golden glow of countless diyas.'
    WHEN 'cuisine' THEN 'Banarasi Paan is an art form. Betel leaves are filled with areca nut, slaked lime, catechu, and various sweet or savory ingredients like gulkand (rose petal preserve), coconut, dates, and spices. Each paan maker has secret recipes passed through generations. It''s consumed after meals as a digestive and mouth freshener.'
    WHEN 'art_forms' THEN 'Banarasi silk weaving dates back to the Mughal era. Weavers create intricate brocade patterns using gold and silver threads (zari work). A single saree can take weeks to months to complete. The designs feature Mughal motifs like flowers, leaves, and paisleys. These sarees are treasured heirlooms in Indian families.'
    WHEN 'customs' THEN 'Ganga Aarti at Dashashwamedh Ghat is a spectacular daily ceremony. As the sun sets, priests in saffron robes perform synchronized rituals with fire lamps, incense, and conch shells. The ceremony honors the river goddess Ganga. Thousands gather to witness this mesmerizing display of devotion, accompanied by bells and chants.'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'varanasi'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- Agra heritage translations (English)
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'name',
  CASE h.category
    WHEN 'monuments' THEN 'Taj Mahal'
    WHEN 'temples' THEN 'Mankameshwar Temple'
    WHEN 'festivals' THEN 'Taj Mahotsav'
    WHEN 'cuisine' THEN 'Agra Petha'
    WHEN 'art_forms' THEN 'Marble Inlay Work'
    WHEN 'historical_events' THEN 'Mughal Capital Era'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'agra'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'summary',
  CASE h.category
    WHEN 'monuments' THEN 'The world''s most beautiful monument to love, built in white marble'
    WHEN 'temples' THEN 'Ancient Shiva temple believed to be the city''s oldest'
    WHEN 'festivals' THEN 'Annual cultural festival celebrating Agra''s rich heritage'
    WHEN 'cuisine' THEN 'Translucent sweet made from ash gourd, Agra''s signature delicacy'
    WHEN 'art_forms' THEN 'Intricate stone inlay technique using semi-precious stones'
    WHEN 'historical_events' THEN 'Agra served as the Mughal Empire''s capital for nearly a century'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'agra'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- Add similar translations for remaining cities (abbreviated for brevity)
-- In production, all 20 cities would have complete English and Hindi translations

-- Jaipur heritage translations (English)
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'name',
  CASE h.category
    WHEN 'monuments' THEN 'Hawa Mahal'
    WHEN 'temples' THEN 'Govind Dev Ji Temple'
    WHEN 'festivals' THEN 'Teej Festival'
    WHEN 'cuisine' THEN 'Dal Baati Churma'
    WHEN 'art_forms' THEN 'Blue Pottery'
    WHEN 'customs' THEN 'Turban Tying Tradition'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'jaipur'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'summary',
  CASE h.category
    WHEN 'monuments' THEN 'Palace of Winds with 953 windows, an architectural marvel'
    WHEN 'temples' THEN 'Temple dedicated to Lord Krishna in the City Palace complex'
    WHEN 'festivals' THEN 'Monsoon festival celebrating womanhood and marital bliss'
    WHEN 'cuisine' THEN 'Traditional Rajasthani dish of lentils, baked wheat balls, and sweet crumble'
    WHEN 'art_forms' THEN 'Unique pottery technique using blue dye and no clay'
    WHEN 'customs' THEN 'Rajasthani turbans signify social status, region, and occasion'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'jaipur'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- Chennai heritage translations (English)
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'name',
  CASE h.category
    WHEN 'monuments' THEN 'Fort St. George'
    WHEN 'temples' THEN 'Kapaleeshwarar Temple'
    WHEN 'festivals' THEN 'Pongal'
    WHEN 'cuisine' THEN 'Idli and Dosa'
    WHEN 'art_forms' THEN 'Bharatanatyam'
    WHEN 'traditions' THEN 'Kolam'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'chennai'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'summary',
  CASE h.category
    WHEN 'monuments' THEN 'First English fortress in India, built in 1644'
    WHEN 'temples' THEN 'Magnificent Dravidian temple dedicated to Lord Shiva'
    WHEN 'festivals' THEN 'Tamil harvest festival celebrating the sun god'
    WHEN 'cuisine' THEN 'Iconic South Indian fermented rice cakes and crepes'
    WHEN 'art_forms' THEN 'Classical Indian dance form originating from Tamil Nadu'
    WHEN 'traditions' THEN 'Traditional floor art created with rice flour'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
WHERE c.slug = 'chennai'
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- Add significance field for all heritage items
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'heritage', h.id, 'en', 'significance',
  CASE 
    WHEN c.slug = 'delhi' AND h.category = 'monuments' THEN 'UNESCO World Heritage Site, symbol of Mughal power'
    WHEN c.slug = 'mumbai' AND h.category = 'monuments' THEN 'Symbol of Mumbai, witnessed India''s independence'
    WHEN c.slug = 'varanasi' AND h.category = 'temples' THEN 'Most sacred Shiva temple, spiritual heart of Hinduism'
    WHEN c.slug = 'agra' AND h.category = 'monuments' THEN 'UNESCO World Heritage Site, one of Seven Wonders of the World'
    ELSE 'Significant cultural heritage of India'
  END
FROM heritage_items h
JOIN cities c ON h.city_id = c.id
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;
