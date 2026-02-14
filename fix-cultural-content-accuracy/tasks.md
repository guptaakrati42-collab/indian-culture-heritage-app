# Implementation Plan: Fix Cultural Content Accuracy

## Overview

This implementation plan addresses three critical issues:
1. Replace random placeholder images with category-appropriate images in seed files
2. Fix button text from "Learn More" to "Click to Explore" in HeritageCard component
3. Add comprehensive amazing facts (detailed_description and significance) for all heritage categories

The implementation focuses on data fixes in seed files and a simple text change in the frontend component.

## Tasks

- [ ] 1. Fix HeritageCard button text
  - Change button text from "Learn More" to "Click to Explore" in collapsed state
  - File: `frontend/src/components/HeritageCard.tsx`
  - Line ~175: Update the button text string
  - _Requirements: 2.1, 2.3_

- [ ]* 1.1 Write unit test for button text
  - Test collapsed state shows "Click to Explore"
  - Test expanded state shows "Show Less"
  - Test that "Learn More" never appears
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2. Update heritage items seed file with category-appropriate images
  - [ ] 2.1 Replace all picsum.photos URLs in heritage_items table
    - File: `backend/seeds/003_seed_heritage_items.sql`
    - Replace thumbnail_image_url for all heritage items
    - Use category-specific Unsplash keywords (no random parameters)
    - Monuments: `https://source.unsplash.com/400x300/?indian-monument-architecture`
    - Temples: `https://source.unsplash.com/400x300/?indian-temple-architecture`
    - Festivals: `https://source.unsplash.com/400x300/?indian-festival-celebration`
    - Cuisine: `https://source.unsplash.com/400x300/?indian-food-dish`
    - Art forms: `https://source.unsplash.com/400x300/?indian-dance-art`
    - Traditions: `https://source.unsplash.com/400x300/?indian-tradition-practice`
    - Historical events: `https://source.unsplash.com/400x300/?historical-site-india`
    - Customs: `https://source.unsplash.com/400x300/?indian-custom-culture`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

  - [ ] 2.2 Replace all random unsplash URLs in heritage_items table
    - Remove `?random=` parameters from all source.unsplash.com URLs
    - Ensure search terms match heritage category
    - _Requirements: 1.10_

- [ ] 3. Update images seed file with category-appropriate gallery images
  - [ ] 3.1 Replace all picsum.photos URLs in images table
    - File: `backend/seeds/005_seed_images.sql`
    - Replace url and thumbnail_url for all image records
    - Use category-specific keywords matching the heritage item's category
    - Ensure 3+ images per heritage item with varied keywords
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

  - [ ] 3.2 Update image URLs to use category-specific patterns
    - Remove random seed parameters
    - Use heritage item category to determine image keywords
    - Example: For Delhi monuments, use fort/palace keywords
    - Example: For Mumbai cuisine, use street-food keywords
    - _Requirements: 1.10_

- [ ]* 3.3 Write property test for image URL validation
  - **Property 1: Category-Appropriate Image URLs**
  - **Property 2: No Random Placeholder Images**
  - **Property 3: No Random Unsplash Parameters**
  - Generate all heritage items from seed data
  - Verify no picsum.photos URLs exist
  - Verify no ?random= parameters exist
  - Verify URLs contain category-related keywords
  - _Requirements: 1.1-1.10, 5.1-5.4_

- [ ] 4. Add amazing facts to heritage translations seed file
  - [ ] 4.1 Add detailed_description for all Delhi heritage items (English)
    - File: `backend/seeds/004_seed_heritage_translations.sql`
    - Add INSERT statements for field_name='detailed_description'
    - Cover all 6 categories: monuments, temples, festivals, cuisine, art_forms, historical_events
    - Each description: 2-4 sentences about history, features, or practices
    - _Requirements: 3.1, 3.3, 3.5, 3.7, 3.9, 3.11, 3.13, 3.15, 3.17_

  - [ ] 4.2 Add significance for all Delhi heritage items (English)
    - Add INSERT statements for field_name='significance'
    - Cover all 6 categories
    - Each significance: 1-2 sentences explaining cultural/historical importance
    - _Requirements: 3.2, 3.4, 3.6, 3.8, 3.10, 3.12, 3.14, 3.16, 3.17_

  - [ ] 4.3 Add detailed_description for all Mumbai heritage items (English)
    - Cover all 6 categories: monuments, temples, festivals, cuisine, art_forms, traditions
    - _Requirements: 3.1, 3.3, 3.5, 3.7, 3.9, 3.11, 3.17_

  - [ ] 4.4 Add significance for all Mumbai heritage items (English)
    - Cover all 6 categories
    - _Requirements: 3.2, 3.4, 3.6, 3.8, 3.10, 3.12, 3.17_

  - [ ] 4.5 Add detailed_description for all Kolkata heritage items (English)
    - Cover all 6 categories: monuments, temples, festivals, cuisine, art_forms, customs
    - _Requirements: 3.1, 3.3, 3.5, 3.7, 3.9, 3.15, 3.17_

  - [ ] 4.6 Add significance for all Kolkata heritage items (English)
    - Cover all 6 categories
    - _Requirements: 3.2, 3.4, 3.6, 3.8, 3.10, 3.16, 3.17_

  - [ ] 4.7 Add detailed_description for all Chennai heritage items (English)
    - Cover all 6 categories: monuments, temples, festivals, cuisine, art_forms, traditions
    - _Requirements: 3.1, 3.3, 3.5, 3.7, 3.9, 3.11, 3.17_

  - [ ] 4.8 Add significance for all Chennai heritage items (English)
    - Cover all 6 categories
    - _Requirements: 3.2, 3.4, 3.6, 3.8, 3.10, 3.12, 3.17_

  - [ ] 4.9 Add detailed_description for remaining cities (English)
    - Bangalore, Hyderabad, Ahmedabad, Pune, Jaipur, Lucknow, Varanasi, Agra, Amritsar, Kochi, Guwahati, Bhubaneswar, Mysore, Udaipur, Madurai, Jodhpur
    - Cover all heritage categories per city (6 items per city)
    - _Requirements: 3.1, 3.3, 3.5, 3.7, 3.9, 3.11, 3.13, 3.15, 3.17_

  - [ ] 4.10 Add significance for remaining cities (English)
    - All 16 remaining cities
    - Cover all heritage categories per city
    - _Requirements: 3.2, 3.4, 3.6, 3.8, 3.10, 3.12, 3.14, 3.16, 3.17_

- [ ] 5. Add Hindi translations for amazing facts
  - [ ] 5.1 Add detailed_description for all heritage items (Hindi)
    - Translate all English detailed_description content to Hindi
    - Maintain cultural accuracy and meaning
    - Cover all 20 cities and all categories
    - _Requirements: 3.17, 4.1, 4.3_

  - [ ] 5.2 Add significance for all heritage items (Hindi)
    - Translate all English significance content to Hindi
    - Cover all 20 cities and all categories
    - _Requirements: 3.17, 4.1, 4.3_

- [ ]* 5.3 Write property test for complete amazing facts
  - **Property 5: Complete Amazing Facts for All Heritage Items**
  - **Property 6: Translation Parity Across Languages**
  - Generate all heritage items from database
  - Verify each has detailed_description in English and Hindi
  - Verify each has significance in English and Hindi
  - Verify content is non-empty and category-appropriate
  - _Requirements: 3.17, 4.1, 4.3_

- [ ] 6. Checkpoint - Verify all changes
  - [ ] 6.1 Run database migrations and seed scripts
    - Ensure seed files execute without errors
    - Verify data loads correctly into test database
  
  - [ ] 6.2 Test frontend button text change
    - Start frontend development server
    - Navigate to heritage cards
    - Verify button shows "Click to Explore" (not "Learn More")
  
  - [ ] 6.3 Test amazing facts display
    - Click "Click to Explore" on heritage items from different categories
    - Verify detailed_description and significance appear
    - Test in both English and Hindi
    - Verify content is category-specific (monuments show architecture info, cuisine shows food info, etc.)
  
  - [ ] 6.4 Test image display
    - Browse heritage items from all 8 categories
    - Verify images match category (monuments show buildings, temples show temples, cuisine shows food)
    - Verify no random/unrelated images appear
  
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests
- Focus on data accuracy: images must match categories, amazing facts must be category-specific
- The button text fix is a simple one-line change
- Most work is in populating seed files with accurate content
- Test thoroughly across all 8 heritage categories and 20 cities
- Ensure Hindi translations maintain cultural accuracy
