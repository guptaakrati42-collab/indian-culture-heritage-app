-- Seed script for city translations (English and Hindi)
-- Requirements: 2.1, 5.3, 5.4, 9.1, 9.2, 9.3

-- City name translations in English
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'city', id, 'en', 'name',
  CASE slug
    WHEN 'delhi' THEN 'Delhi'
    WHEN 'mumbai' THEN 'Mumbai'
    WHEN 'kolkata' THEN 'Kolkata'
    WHEN 'chennai' THEN 'Chennai'
    WHEN 'bangalore' THEN 'Bangalore'
    WHEN 'hyderabad' THEN 'Hyderabad'
    WHEN 'ahmedabad' THEN 'Ahmedabad'
    WHEN 'pune' THEN 'Pune'
    WHEN 'jaipur' THEN 'Jaipur'
    WHEN 'lucknow' THEN 'Lucknow'
    WHEN 'varanasi' THEN 'Varanasi'
    WHEN 'agra' THEN 'Agra'
    WHEN 'amritsar' THEN 'Amritsar'
    WHEN 'kochi' THEN 'Kochi'
    WHEN 'guwahati' THEN 'Guwahati'
    WHEN 'bhubaneswar' THEN 'Bhubaneswar'
    WHEN 'mysore' THEN 'Mysore'
    WHEN 'udaipur' THEN 'Udaipur'
    WHEN 'madurai' THEN 'Madurai'
    WHEN 'jodhpur' THEN 'Jodhpur'
  END
FROM cities
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- City name translations in Hindi
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'city', id, 'hi', 'name',
  CASE slug
    WHEN 'delhi' THEN 'दिल्ली'
    WHEN 'mumbai' THEN 'मुंबई'
    WHEN 'kolkata' THEN 'कोलकाता'
    WHEN 'chennai' THEN 'चेन्नई'
    WHEN 'bangalore' THEN 'बेंगलुरु'
    WHEN 'hyderabad' THEN 'हैदराबाद'
    WHEN 'ahmedabad' THEN 'अहमदाबाद'
    WHEN 'pune' THEN 'पुणे'
    WHEN 'jaipur' THEN 'जयपुर'
    WHEN 'lucknow' THEN 'लखनऊ'
    WHEN 'varanasi' THEN 'वाराणसी'
    WHEN 'agra' THEN 'आगरा'
    WHEN 'amritsar' THEN 'अमृतसर'
    WHEN 'kochi' THEN 'कोच्चि'
    WHEN 'guwahati' THEN 'गुवाहाटी'
    WHEN 'bhubaneswar' THEN 'भुवनेश्वर'
    WHEN 'mysore' THEN 'मैसूर'
    WHEN 'udaipur' THEN 'उदयपुर'
    WHEN 'madurai' THEN 'मदुरै'
    WHEN 'jodhpur' THEN 'जोधपुर'
  END
FROM cities
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- State translations in English
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'city', id, 'en', 'state', state
FROM cities
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;

-- State translations in Hindi
INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
SELECT 'city', id, 'hi', 'state',
  CASE state
    WHEN 'Delhi' THEN 'दिल्ली'
    WHEN 'Maharashtra' THEN 'महाराष्ट्र'
    WHEN 'West Bengal' THEN 'पश्चिम बंगाल'
    WHEN 'Tamil Nadu' THEN 'तमिलनाडु'
    WHEN 'Karnataka' THEN 'कर्नाटक'
    WHEN 'Telangana' THEN 'तेलंगाना'
    WHEN 'Gujarat' THEN 'गुजरात'
    WHEN 'Rajasthan' THEN 'राजस्थान'
    WHEN 'Uttar Pradesh' THEN 'उत्तर प्रदेश'
    WHEN 'Punjab' THEN 'पंजाब'
    WHEN 'Kerala' THEN 'केरल'
    WHEN 'Assam' THEN 'असम'
    WHEN 'Odisha' THEN 'ओडिशा'
    ELSE state
  END
FROM cities
ON CONFLICT (entity_type, entity_id, language_code, field_name) DO NOTHING;
