-- Seed script for cities
-- Requirements: 2.1, 5.1, 5.2, 9.1

-- Insert 20 major Indian cities covering all regions
INSERT INTO cities (slug, state, region, preview_image_url) VALUES
  ('delhi', 'Delhi', 'North', 'https://source.unsplash.com/800x600/?delhi,india,monument'),
  ('mumbai', 'Maharashtra', 'West', 'https://source.unsplash.com/800x600/?mumbai,india,city'),
  ('kolkata', 'West Bengal', 'East', 'https://source.unsplash.com/800x600/?kolkata,india,heritage'),
  ('chennai', 'Tamil Nadu', 'South', 'https://source.unsplash.com/800x600/?chennai,india,temple'),
  ('bangalore', 'Karnataka', 'South', 'https://source.unsplash.com/800x600/?bangalore,india,palace'),
  ('hyderabad', 'Telangana', 'South', 'https://source.unsplash.com/800x600/?hyderabad,india,charminar'),
  ('ahmedabad', 'Gujarat', 'West', 'https://source.unsplash.com/800x600/?ahmedabad,india,architecture'),
  ('pune', 'Maharashtra', 'West', 'https://source.unsplash.com/800x600/?pune,india,fort'),
  ('jaipur', 'Rajasthan', 'North', 'https://source.unsplash.com/800x600/?jaipur,india,palace'),
  ('lucknow', 'Uttar Pradesh', 'North', 'https://source.unsplash.com/800x600/?lucknow,india,monument'),
  ('varanasi', 'Uttar Pradesh', 'North', 'https://source.unsplash.com/800x600/?varanasi,india,ganga'),
  ('agra', 'Uttar Pradesh', 'North', 'https://source.unsplash.com/800x600/?agra,india,tajmahal'),
  ('amritsar', 'Punjab', 'North', 'https://source.unsplash.com/800x600/?amritsar,india,temple'),
  ('kochi', 'Kerala', 'South', 'https://source.unsplash.com/800x600/?kochi,india,backwaters'),
  ('guwahati', 'Assam', 'Northeast', 'https://source.unsplash.com/800x600/?guwahati,india,temple'),
  ('bhubaneswar', 'Odisha', 'East', 'https://source.unsplash.com/800x600/?bhubaneswar,india,temple'),
  ('mysore', 'Karnataka', 'South', 'https://source.unsplash.com/800x600/?mysore,india,palace'),
  ('udaipur', 'Rajasthan', 'North', 'https://source.unsplash.com/800x600/?udaipur,india,lake'),
  ('madurai', 'Tamil Nadu', 'South', 'https://source.unsplash.com/800x600/?madurai,india,temple'),
  ('jodhpur', 'Rajasthan', 'North', 'https://source.unsplash.com/800x600/?jodhpur,india,fort')
ON CONFLICT (slug) DO NOTHING;
