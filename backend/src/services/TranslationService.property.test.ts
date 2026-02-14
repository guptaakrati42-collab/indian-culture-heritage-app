/**
 * Property-Based Test: Translation Service
 * Property 1: Language selection consistency
 * 
 * Validates: Requirements 1.2, 2.6, 6.5, 9.4
 * 
 * This test validates that for any supported language code and any content request,
 * when that language is specified, all returned text content should be in the
 * requested language, or fall back to English if the translation is unavailable.
 */

import * as fc from 'fast-check';
import { Pool, PoolClient } from 'pg';
import { TranslationService } from './TranslationService';

// Test database configuration
const TEST_DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'indian_culture_test',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

describe('Property 1: Language Selection Consistency', () => {
  let testPool: Pool;
  let client: PoolClient;
  let translationService: TranslationService;

  beforeAll(async () => {
    // Create a separate pool for testing
    testPool = new Pool(TEST_DB_CONFIG);
    
    // Wait for database to be ready
    let retries = 5;
    while (retries > 0) {
      try {
        client = await testPool.connect();
        await client.query('SELECT 1');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    translationService = new TranslationService();
  });

  afterAll(async () => {
    if (client) client.release();
    if (testPool) await testPool.end();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await client.query('DELETE FROM translations WHERE entity_type IN (\'test_city\', \'test_heritage\')');
    await client.query('DELETE FROM heritage_items');
    await client.query('DELETE FROM cities');
  });

  /**
   * Arbitrary generators for test data
   */

  // Generate valid language codes from the 23 supported languages
  const languageCodeArb = fc.constantFrom(
    'en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa', 'as',
    'ks', 'kok', 'mni', 'ne', 'sa', 'sd', 'ur', 'brx', 'sat', 'mai', 'doi'
  );

  // Generate entity types
  const entityTypeArb = fc.constantFrom('test_city', 'test_heritage');

  // Generate field names
  const fieldNameArb = fc.constantFrom('name', 'summary', 'description', 'significance');

  // Generate content strings
  const contentArb = fc.string({ minLength: 5, maxLength: 200 });

  // Generate UUID
  const uuidArb = fc.uuid();

  /**
   * Property Test: Translation returns requested language or falls back to English
   * Validates Requirements 1.2, 2.6, 6.5, 9.4
   */
  it('should return content in requested language or fallback to English', async () => {
    await fc.assert(
      fc.asyncProperty(
        entityTypeArb,
        uuidArb,
        languageCodeArb,
        fc.array(fieldNameArb, { minLength: 1, maxLength: 4 }).map(arr => [...new Set(arr)]),
        fc.record({
          hasRequestedLanguage: fc.boolean(),
          hasEnglishFallback: fc.boolean(),
        }),
        async (entityType, entityId, requestedLanguage, fields, config) => {
          // Setup: Insert translations based on configuration
          for (const field of fields) {
            // Always insert English translation if configured
            if (config.hasEnglishFallback) {
              await client.query(
                `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
                 VALUES ($1, $2, $3, $4, $5)`,
                [entityType, entityId, 'en', field, `English ${field} content`]
              );
            }

            // Insert requested language translation if configured
            if (config.hasRequestedLanguage && requestedLanguage !== 'en') {
              await client.query(
                `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
                 VALUES ($1, $2, $3, $4, $5)`,
                [entityType, entityId, requestedLanguage, field, `${requestedLanguage} ${field} content`]
              );
            }
          }

          // Execute: Get translations
          const result = await translationService.getTranslation(
            entityType,
            entityId,
            requestedLanguage,
            fields
          );

          // Verify: Check that all fields are present
          expect(Object.keys(result).length).toBe(fields.length);

          for (const field of fields) {
            // Property: Content should be in requested language or English fallback
            if (config.hasRequestedLanguage || (requestedLanguage === 'en' && config.hasEnglishFallback)) {
              // Should have content in requested language
              expect(result[field]).toBeTruthy();
              if (requestedLanguage === 'en') {
                expect(result[field]).toContain('English');
              } else if (config.hasRequestedLanguage) {
                expect(result[field]).toContain(requestedLanguage);
              }
            } else if (config.hasEnglishFallback) {
              // Should fallback to English
              expect(result[field]).toContain('English');
            } else {
              // No translation available
              expect(result[field]).toBe('');
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Batch translations maintain consistency
   * Validates Requirements 1.2, 9.4
   */
  it('should return consistent translations for batch requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        entityTypeArb,
        fc.array(uuidArb, { minLength: 1, maxLength: 5 }).map(arr => [...new Set(arr)]),
        languageCodeArb,
        fc.array(fieldNameArb, { minLength: 1, maxLength: 3 }).map(arr => [...new Set(arr)]),
        async (entityType, entityIds, requestedLanguage, fields) => {
          // Setup: Insert translations for all entities
          for (const entityId of entityIds) {
            for (const field of fields) {
              // Insert English translation
              await client.query(
                `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
                 VALUES ($1, $2, $3, $4, $5)`,
                [entityType, entityId, 'en', field, `English ${field} for ${entityId}`]
              );

              // Randomly insert requested language translation (50% chance)
              if (requestedLanguage !== 'en' && Math.random() > 0.5) {
                await client.query(
                  `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
                   VALUES ($1, $2, $3, $4, $5)`,
                  [entityType, entityId, requestedLanguage, field, `${requestedLanguage} ${field} for ${entityId}`]
                );
              }
            }
          }

          // Execute: Get batch translations
          const batchResult = await translationService.getBatchTranslations(
            entityType,
            entityIds,
            requestedLanguage,
            fields
          );

          // Verify: All entities should have translations
          expect(batchResult.size).toBe(entityIds.length);

          for (const entityId of entityIds) {
            const entityTranslations = batchResult.get(entityId);
            expect(entityTranslations).toBeDefined();
            expect(Object.keys(entityTranslations!).length).toBe(fields.length);

            // Property: Each field should have content (either requested language or English)
            for (const field of fields) {
              expect(entityTranslations![field]).toBeTruthy();
              // Content should contain either the requested language or English
              const content = entityTranslations![field];
              expect(
                content.includes(requestedLanguage) || content.includes('English')
              ).toBe(true);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  /**
   * Property Test: Fallback language is always English
   * Validates Requirement 1.5
   */
  it('should always use English as fallback language', async () => {
    await fc.assert(
      fc.asyncProperty(
        entityTypeArb,
        uuidArb,
        languageCodeArb.filter(lang => lang !== 'en'),
        fieldNameArb,
        contentArb,
        async (entityType, entityId, nonEnglishLanguage, field, englishContent) => {
          // Setup: Insert only English translation
          await client.query(
            `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
             VALUES ($1, $2, $3, $4, $5)`,
            [entityType, entityId, 'en', field, englishContent]
          );

          // Execute: Request translation in non-English language
          const result = await translationService.getTranslation(
            entityType,
            entityId,
            nonEnglishLanguage,
            [field]
          );

          // Verify: Should fallback to English content
          expect(result[field]).toBe(englishContent);

          // Verify: getFallbackLanguage returns 'en'
          expect(translationService.getFallbackLanguage()).toBe('en');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property Test: Supported languages list is consistent
   * Validates Requirement 6.5
   */
  it('should return consistent list of supported languages', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        // Execute: Get supported languages multiple times
        const languages1 = await translationService.getSupportedLanguages();
        const languages2 = await translationService.getSupportedLanguages();

        // Verify: Results should be identical (cached)
        expect(languages1).toEqual(languages2);

        // Verify: All 23 languages should be present
        expect(languages1.length).toBeGreaterThanOrEqual(23);

        // Verify: Each language has required fields
        for (const lang of languages1) {
          expect(lang.code).toBeTruthy();
          expect(lang.name).toBeTruthy();
          expect(lang.englishName).toBeTruthy();
        }

        // Verify: English is in the list
        const englishLang = languages1.find(l => l.code === 'en');
        expect(englishLang).toBeDefined();
        expect(englishLang!.englishName).toBe('English');
      }),
      { numRuns: 10 }
    );
  }, 30000);

  /**
   * Property Test: Empty entity IDs return empty results
   * Validates edge case handling
   */
  it('should handle empty entity ID list gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        entityTypeArb,
        languageCodeArb,
        fc.array(fieldNameArb, { minLength: 1, maxLength: 3 }),
        async (entityType, language, fields) => {
          // Execute: Get batch translations with empty entity list
          const result = await translationService.getBatchTranslations(
            entityType,
            [],
            language,
            fields
          );

          // Verify: Should return empty map
          expect(result.size).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);
});
