-- Migration: Create languages table with seed data for 23 languages
-- Requirements: 5.1, 5.2, 5.3, 5.4, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3

CREATE TABLE IF NOT EXISTS languages (
  code VARCHAR(10) PRIMARY KEY,
  native_name VARCHAR(100) NOT NULL,
  english_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data for 23 languages (22 official Indian languages + English)
INSERT INTO languages (code, native_name, english_name) VALUES
  ('en', 'English', 'English'),
  ('hi', 'हिन्दी', 'Hindi'),
  ('bn', 'বাংলা', 'Bengali'),
  ('te', 'తెలుగు', 'Telugu'),
  ('mr', 'मराठी', 'Marathi'),
  ('ta', 'தமிழ்', 'Tamil'),
  ('gu', 'ગુજરાતી', 'Gujarati'),
  ('kn', 'ಕನ್ನಡ', 'Kannada'),
  ('ml', 'മലയാളം', 'Malayalam'),
  ('or', 'ଓଡ଼ିଆ', 'Odia'),
  ('pa', 'ਪੰਜਾਬੀ', 'Punjabi'),
  ('as', 'অসমীয়া', 'Assamese'),
  ('ks', 'कॉशुर', 'Kashmiri'),
  ('kok', 'कोंकणी', 'Konkani'),
  ('mni', 'মৈতৈলোন্', 'Manipuri'),
  ('ne', 'नेपाली', 'Nepali'),
  ('sa', 'संस्कृतम्', 'Sanskrit'),
  ('sd', 'سنڌي', 'Sindhi'),
  ('ur', 'اردو', 'Urdu'),
  ('brx', 'बड़ो', 'Bodo'),
  ('sat', 'ᱥᱟᱱᱛᱟᱲᱤ', 'Santhali'),
  ('mai', 'मैथिली', 'Maithili'),
  ('doi', 'डोगरी', 'Dogri')
ON CONFLICT (code) DO NOTHING;
