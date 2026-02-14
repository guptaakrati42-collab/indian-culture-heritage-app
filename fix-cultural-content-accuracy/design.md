# Design Document: Fix Cultural Content Accuracy

## Overview

This design addresses three critical content accuracy issues in the Indian Culture App:

1. **Random Images**: Current seed data uses picsum.photos and unsplash random URLs that show completely unrelated images (e.g., landscapes for temples, abstract art for cuisine)
2. **Incorrect Button Text**: HeritageCard component displays "Learn More" instead of "Click to Explore"
3. **Missing Amazing Facts**: Translation seed data lacks detailed_description and significance fields for most heritage items

The solution involves updating seed files with category-appropriate image URLs, modifying the HeritageCard component button text, and populating comprehensive amazing facts for all 8 heritage categories across all cities.

## Architecture

### Affected Components

1. **Seed Data Layer**
   - `backend/seeds/003_seed_heritage_items.sql` - Heritage item thumbnail images
   - `backend/seeds/004_seed_heritage_translations.sql` - Amazing facts (detailed_description, significance)
   - `backend/seeds/005_seed_images.sql` - Gallery images

2. **Frontend Component Layer**
   - `frontend/src/components/HeritageCard.tsx` - Button text display

3. **Data Flow**
   - Seed files → Database → API → Frontend components
   - No changes to API layer or service layer required
   - Changes are purely data content and UI text

### Design Principles

1. **Category Consistency**: Each heritage category must have visually consistent image patterns
2. **Cultural Authenticity**: Amazing facts must reflect accurate cultural and historical information
3. **Minimal Code Changes**: Focus on data fixes rather than architectural changes
4. **Backward Compatibility**: Maintain existing database schema and API contracts

## Components and Interfaces

### 1. Image URL Strategy

**Problem**: Current implementation uses RANDOM placeholder services that show UNRELATED images
```sql
-- Current (WRONG - SHOWS RANDOM IMAGES)
'https://picsum.photos/800/600?random=1'  -- Shows random landscape, person, or abstract image
'https://source.unsplash.com/400x300/?temple,delhi'  -- Still random, ignores search terms
```

**Solution**: Replace ALL random URLs with category-specific Unsplash URLs
```sql
-- Proposed (CORRECT - SHOWS CATEGORY-RELATED IMAGES)
-- For monuments: Use architecture/building keywords
'https://source.unsplash.com/800x600/?indian-monument-architecture'
'https://source.unsplash.com/800x600/?fort-palace-india'

-- For temples: Use temple/religious keywords
'https://source.unsplash.com/800x600/?indian-temple-architecture'
'https://source.unsplash.com/800x600/?hindu-temple-india'

-- For cuisine: Use food keywords
'https://source.unsplash.com/800x600/?indian-food-dish'
'https://source.unsplash.com/800x600/?traditional-indian-cuisine'

-- For festivals: Use celebration keywords
'https://source.unsplash.com/800x600/?indian-festival-celebration'
'https://source.unsplash.com/800x600/?diwali-holi-festival'
```

**Key Change**: Remove "?random=" parameters and use SPECIFIC category keywords so images match the heritage type

**Category-Specific Image Keywords** (to ensure images match category):
- **monuments**: indian-monument, fort-architecture, palace-building, historical-monument-india
- **temples**: indian-temple, hindu-temple, religious-architecture-india, shrine-temple
- **festivals**: indian-festival, celebration-india, diwali-holi, festival-crowd
- **traditions**: indian-tradition, traditional-practice-india, cultural-ceremony
- **cuisine**: indian-food, traditional-dish-india, indian-cuisine, food-plate
- **art_forms**: indian-dance, classical-dance-india, indian-art, traditional-craft
- **historical_events**: historical-site-india, memorial-india, independence-monument
- **customs**: indian-custom, traditional-dress-india, cultural-practice

### 2. HeritageCard Button Text

**Current Implementation**:
```tsx
<span>{isExpanded ? 'Show Less' : 'Learn More'}</span>
```

**Required Change**:
```tsx
<span>{isExpanded ? 'Show Less' : 'Click to Explore'}</span>
```

**Location**: `frontend/src/components/HeritageCard.tsx` line ~175

### 3. Amazing Facts Data Structure

**Database Schema** (existing, no changes):
```sql
translations (
  entity_type: 'heritage',
  entity_id: heritage_item.id,
  language_code: 'en' | 'hi',
  field_name: 'detailed_description' | 'significance',
  content: TEXT
)
```

**Content Requirements**:
- **detailed_description**: 2-4 sentences describing the heritage item's history, features, or practices
- **significance**: 1-2 sentences explaining cultural, religious, or historical importance

## Data Models

### Heritage Item Categories and Content Templates

#### 1. Monuments
- **detailed_description**: Architectural style, construction period, builder/patron, physical features, current state
- **significance**: Historical importance, architectural innovation, cultural symbol, UNESCO status (if applicable)
- **Image keywords**: architecture, fort, palace, monument, historical building

#### 2. Temples
- **detailed_description**: Deity/religion, architectural style, construction period, unique features, rituals
- **significance**: Religious importance, pilgrimage significance, architectural heritage, spiritual meaning
- **Image keywords**: temple, shrine, religious architecture, worship place

#### 3. Festivals
- **detailed_description**: Celebration timing, rituals performed, traditional activities, community participation
- **significance**: Cultural meaning, religious significance, social bonding, historical origins
- **Image keywords**: festival, celebration, crowd, decorations, rituals

#### 4. Traditions
- **detailed_description**: Traditional practice details, when/how performed, participants, materials used
- **significance**: Cultural preservation, community identity, historical continuity, social function
- **Image keywords**: traditional practice, ceremony, cultural activity

#### 5. Cuisine
- **detailed_description**: Main ingredients, preparation method, serving style, regional variations
- **significance**: Cultural identity, historical origins, social occasions, culinary heritage
- **Image keywords**: food, dish, cuisine, traditional cooking

#### 6. Art Forms
- **detailed_description**: Art technique, performance style, training required, traditional elements
- **significance**: Cultural expression, historical development, artistic heritage, preservation efforts
- **Image keywords**: dance, music, craft, art, performance

#### 7. Historical Events
- **detailed_description**: Event date, key figures, what happened, immediate outcomes
- **significance**: Historical impact, national importance, commemorative practices, lessons learned
- **Image keywords**: historical site, memorial, monument, commemoration

#### 8. Customs
- **detailed_description**: Custom practice, when observed, who participates, traditional elements
- **significance**: Social meaning, cultural identity, community cohesion, traditional values
- **Image keywords**: custom, traditional dress, cultural practice, social ritual

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Category-Appropriate Image URLs

*For any* heritage item in the database, the thumbnail_image_url and all associated gallery image URLs must contain keywords or patterns that match the item's category (monuments show architecture, temples show religious structures, festivals show celebrations, cuisine shows food, art_forms show artistic works, traditions show traditional practices, historical_events show historical sites, customs show cultural practices).

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 5.1, 5.4**

### Property 2: No Random Placeholder Images

*For any* heritage item or image record in the seed data, the URL must not contain "picsum.photos" as the domain.

**Validates: Requirements 1.9, 5.2**

### Property 3: No Random Unsplash Parameters

*For any* heritage item or image record in the seed data using unsplash URLs, the URL must not contain "?random=" parameters that generate random unrelated images.

**Validates: Requirements 1.10, 5.3**

### Property 4: Button Text Displays "Click to Explore"

*For any* HeritageCard component rendered in collapsed state (isExpanded = false), the button text must display exactly "Click to Explore" (not "Learn More").

**Validates: Requirements 2.1, 2.3**

### Property 5: Complete Amazing Facts for All Heritage Items

*For any* heritage item in the database, there must exist translation records for both "detailed_description" and "significance" fields in at least English and Hindi languages, and the content must be non-empty and category-appropriate (monuments describe architecture, temples describe religious significance, festivals describe celebrations, etc.).

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16, 3.17**

### Property 6: Translation Parity Across Languages

*For any* heritage item that has detailed_description and significance in English, equivalent translations must exist in Hindi with non-empty content.

**Validates: Requirements 4.1, 4.3**

## Error Handling

### Image URL Validation

**Scenario**: Invalid or broken image URLs in seed data
- **Prevention**: Use well-established image sources (Unsplash with specific IDs or search terms)
- **Detection**: Manual verification during seed data creation
- **Recovery**: Fallback to category-default images if URLs become inaccessible

### Missing Translation Data

**Scenario**: Heritage item lacks detailed_description or significance
- **Prevention**: Comprehensive seed data validation before deployment
- **Detection**: Database queries to find incomplete records
- **Recovery**: Display summary field as fallback, log warning for data team

### Button Text Regression

**Scenario**: Future code changes revert button text to "Learn More"
- **Prevention**: Unit tests checking exact button text
- **Detection**: Automated UI tests
- **Recovery**: Code review process catches regressions

## Testing Strategy

### Unit Testing

**Component Tests**:
- HeritageCard button text rendering
  - Test collapsed state shows "Click to Explore"
  - Test expanded state shows "Show Less"
  - Test that "Learn More" never appears

**Data Validation Tests**:
- Seed file content validation
  - Parse SQL files and extract image URLs
  - Verify no picsum.photos URLs exist
  - Verify no random unsplash parameters exist
  - Verify URL patterns match category keywords

### Property-Based Testing

Property-based tests will use a minimum of 100 iterations and will be tagged with the format: **Feature: fix-cultural-content-accuracy, Property {number}: {property_text}**

**Property Test 1: Category-Appropriate Images**
- Generate: Random heritage items from database
- Check: Image URLs contain category-related keywords
- Tag: **Feature: fix-cultural-content-accuracy, Property 1: Category-Appropriate Image URLs**

**Property Test 2: No Placeholder Images**
- Generate: All heritage items and image records
- Check: No URLs contain "picsum.photos"
- Tag: **Feature: fix-cultural-content-accuracy, Property 2: No Random Placeholder Images**

**Property Test 3: No Random Parameters**
- Generate: All heritage items and image records with unsplash URLs
- Check: No URLs contain "?random=" parameters
- Tag: **Feature: fix-cultural-content-accuracy, Property 3: No Random Unsplash Parameters**

**Property Test 4: Button Text Correctness**
- Generate: Random heritage items rendered in HeritageCard
- Check: Collapsed state shows "Click to Explore", expanded shows "Show Less"
- Tag: **Feature: fix-cultural-content-accuracy, Property 4: Button Text Displays Click to Explore**

**Property Test 5: Complete Amazing Facts**
- Generate: All heritage items from database
- Check: Each has detailed_description and significance in English and Hindi
- Tag: **Feature: fix-cultural-content-accuracy, Property 5: Complete Amazing Facts for All Heritage Items**

**Property Test 6: Translation Parity**
- Generate: All heritage items with English translations
- Check: Equivalent Hindi translations exist with non-empty content
- Tag: **Feature: fix-cultural-content-accuracy, Property 6: Translation Parity Across Languages**

### Integration Testing

**End-to-End Flow**:
1. Load seed data into test database
2. Query heritage items through API
3. Render HeritageCard components
4. Verify images display correctly
5. Verify button text is correct
6. Click "Click to Explore" button
7. Verify amazing facts display with detailed_description and significance

**Manual Testing Checklist**:
- [ ] Browse each heritage category (8 categories)
- [ ] Verify images match category (monuments show buildings, cuisine shows food, etc.)
- [ ] Verify no random/unrelated images appear
- [ ] Click "Click to Explore" on multiple items per category
- [ ] Verify amazing facts are category-specific and meaningful
- [ ] Test in both English and Hindi languages
- [ ] Verify button text is "Click to Explore" (not "Learn More")

### Test Data Requirements

**Seed Data Validation**:
- Minimum 5 heritage items per city per category
- Each item must have 3+ gallery images
- All images must use category-appropriate URLs
- All items must have detailed_description and significance in English and Hindi

**Category Coverage**:
- monuments: 20+ items across cities
- temples: 20+ items across cities
- festivals: 20+ items across cities
- traditions: 20+ items across cities
- cuisine: 20+ items across cities
- art_forms: 20+ items across cities
- historical_events: 20+ items across cities
- customs: 20+ items across cities
