/**
 * Unit Tests: TranslationService
 * 
 * Validates: Requirements 1.1, 1.2, 1.5
 * 
 * Tests translation retrieval for all 23 languages, fallback to English
 * when translation is missing, and error handling for invalid language codes.
 */

import { TranslationService } from './TranslationService';
import { createMockPool } from '../config/test-database';

describe('TranslationService', () => {
  let mockPool: any;
  let translationService: TranslationService;

  // All 23 supported languages
  const ALL_LANGUAGES = [
    'en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa', 'as',
    'ks', 'kok', 'mni', 'ne', 'sa', 'sd', 'ur', 'brx', 'sat', 'mai', 'doi'
  ];

  beforeAll(async () => {
    // Create mock database pool for testing
    mockPool = createMockPool();

    translationService = new TranslationService();
  });

  afterAll(async () => {
    if (client) client.release();
    if (testPool) await testPool.end();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await client.query('DELETE FROM translations WHERE entity_type = \'test_entity\'');
    translationService.clearCache();
  });

  describe('getTranslation', () => {
    /**
     * Test: Translation retrieval for all 23 languages
     * Validates Requirement 1.1
     */
    it('should retrieve translations for all 23 supported languages', async () => {
      const entityId = '123e4567-e89b-12d3-a456-426614174000';
      const field = 'name';

      // Insert translations for all languages
      for (const lang of ALL_LANGUAGES) {
        await client.query(
          `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
           VALUES ($1, $2, $3, $4, $5)`,
          ['test_entity', entityId, lang, field, `Content in ${lang}`]
        );
      }

      // Test retrieval for each language
      for (const lang of ALL_LANGUAGES) {
        const result = await translationService.getTranslation(
          'test_entity',
          entityId,
          lang,
          [field]
        );

        expect(result[field]).toBe(`Content in ${lang}`);
      }
    });

    /**
     * Test: Fallback to English when translation is missing
     * Validates Requirement 1.2, 1.5
     */
    it('should fallback to English when translation is missing', async () => {
      const entityId = '123e4567-e89b-12d3-a456-426614174001';
      const field = 'description';

      // Insert only English translation
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['test_entity', entityId, 'en', field, 'English description']
      );

      // Request translation in Hindi (not available)
      const result = await translationService.getTranslation(
        'test_entity',
        entityId,
        'hi',
        [field]
      );

      expect(result[field]).toBe('English description');
    });

    /**
     * Test: Multiple fields with mixed availability
     * Validates Requirement 1.2
     */
    it('should handle multiple fields with mixed translation availability', async () => {
      const entityId = '123e4567-e89b-12d3-a456-426614174002';
      const fields = ['name', 'summary', 'description'];

      // Insert translations: name in Hindi and English, summary only in English, description only in Hindi
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES 
           ($1, $2, 'hi', 'name', 'नाम'),
           ($1, $2, 'en', 'name', 'Name'),
           ($1, $2, 'en', 'summary', 'Summary'),
           ($1, $2, 'hi', 'description', 'विवरण')`,
        ['test_entity', entityId]
      );

      // Request in Hindi
      const result = await translationService.getTranslation(
        'test_entity',
        entityId,
        'hi',
        fields
      );

      expect(result.name).toBe('नाम'); // Hindi available
      expect(result.summary).toBe('Summary'); // Fallback to English
      expect(result.description).toBe('विवरण'); // Hindi available
    });

    /**
     * Test: Empty string when no translation exists
     * Validates Requirement 1.2
     */
    it('should return empty string when no translation exists at all', async () => {
      const entityId = '123e4567-e89b-12d3-a456-426614174003';
      const field = 'nonexistent';

      const result = await translationService.getTranslation(
        'test_entity',
        entityId,
        'hi',
        [field]
      );

      expect(result[field]).toBe('');
    });

    /**
     * Test: English language request
     * Validates Requirement 1.1
     */
    it('should retrieve English translations directly', async () => {
      const entityId = '123e4567-e89b-12d3-a456-426614174004';
      const field = 'name';

      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, $3, $4, $5)`,
        ['test_entity', entityId, 'en', field, 'English Name']
      );

      const result = await translationService.getTranslation(
        'test_entity',
        entityId,
        'en',
        [field]
      );

      expect(result[field]).toBe('English Name');
    });
  });

  describe('getBatchTranslations', () => {
    /**
     * Test: Batch retrieval for multiple entities
     * Validates Requirement 1.1
     */
    it('should retrieve translations for multiple entities efficiently', async () => {
      const entityIds = [
        '123e4567-e89b-12d3-a456-426614174010',
        '123e4567-e89b-12d3-a456-426614174011',
        '123e4567-e89b-12d3-a456-426614174012'
      ];
      const fields = ['name', 'summary'];

      // Insert translations for all entities
      for (const entityId of entityIds) {
        await client.query(
          `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
           VALUES 
             ($1, $2, 'hi', 'name', $3),
             ($1, $2, 'hi', 'summary', $4)`,
          ['test_entity', entityId, `Name ${entityId}`, `Summary ${entityId}`]
        );
      }

      const result = await translationService.getBatchTranslations(
        'test_entity',
        entityIds,
        'hi',
        fields
      );

      expect(result.size).toBe(3);
      for (const entityId of entityIds) {
        const translations = result.get(entityId);
        expect(translations).toBeDefined();
        expect(translations!.name).toBe(`Name ${entityId}`);
        expect(translations!.summary).toBe(`Summary ${entityId}`);
      }
    });

    /**
     * Test: Batch retrieval with fallback
     * Validates Requirement 1.2
     */
    it('should fallback to English for missing translations in batch', async () => {
      const entityIds = [
        '123e4567-e89b-12d3-a456-426614174020',
        '123e4567-e89b-12d3-a456-426614174021'
      ];
      const field = 'name';

      // Entity 1: Has Hindi translation
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, 'hi', $3, 'हिंदी नाम')`,
        ['test_entity', entityIds[0], field]
      );

      // Entity 2: Only has English translation
      await client.query(
        `INSERT INTO translations (entity_type, entity_id, language_code, field_name, content)
         VALUES ($1, $2, 'en', $3, 'English Name')`,
        ['test_entity', entityIds[1], field]
      );

      const result = await translationService.getBatchTranslations(
        'test_entity',
        entityIds,
        'hi',
        [field]
      );

      expect(result.size).toBe(2);
      expect(result.get(entityIds[0])![field]).toBe('हिंदी नाम');
      expect(result.get(entityIds[1])![field]).toBe('English Name'); // Fallback
    });

    /**
     * Test: Empty entity list
     * Validates edge case handling
     */
    it('should return empty map for empty entity list', async () => {
      const result = await translationService.getBatchTranslations(
        'test_entity',
        [],
        'hi',
        ['name']
      );

      expect(result.size).toBe(0);
    });
  });

  describe('getSupportedLanguages', () => {
    /**
     * Test: Returns all 23 supported languages
     * Validates Requirement 1.1
     */
    it('should return all 23 supported languages', async () => {
      const languages = await translationService.getSupportedLanguages();

      expect(languages.length).toBeGreaterThanOrEqual(23);

      // Check that all expected languages are present
      const languageCodes = languages.map(l => l.code);
      for (const expectedLang of ALL_LANGUAGES) {
        expect(languageCodes).toContain(expectedLang);
      }
    });

    /**
     * Test: Each language has required fields
     * Validates Requirement 1.1
     */
    it('should return languages with all required fields', async () => {
      const languages = await translationService.getSupportedLanguages();

      for (const lang of languages) {
        expect(lang.code).toBeTruthy();
        expect(typeof lang.code).toBe('string');
        expect(lang.name).toBeTruthy();
        expect(typeof lang.name).toBe('string');
        expect(lang.englishName).toBeTruthy();
        expect(typeof lang.englishName).toBe('string');
      }
    });

    /**
     * Test: English language is included
     * Validates Requirement 1.1, 1.5
     */
    it('should include English language', async () => {
      const languages = await translationService.getSupportedLanguages();

      const english = languages.find(l => l.code === 'en');
      expect(english).toBeDefined();
      expect(english!.englishName).toBe('English');
    });

    /**
     * Test: Results are cached
     * Validates performance optimization
     */
    it('should cache supported languages', async () => {
      const languages1 = await translationService.getSupportedLanguages();
      const languages2 = await translationService.getSupportedLanguages();

      // Should return the same reference (cached)
      expect(languages1).toBe(languages2);
    });

    /**
     * Test: Cache can be cleared
     * Validates cache management
     */
    it('should allow cache clearing', async () => {
      const languages1 = await translationService.getSupportedLanguages();
      translationService.clearCache();
      const languages2 = await translationService.getSupportedLanguages();

      // Should return different references after cache clear
      expect(languages1).not.toBe(languages2);
      // But content should be the same
      expect(languages1).toEqual(languages2);
    });
  });

  describe('getFallbackLanguage', () => {
    /**
     * Test: Returns English as fallback
     * Validates Requirement 1.5
     */
    it('should return English as the fallback language', () => {
      const fallback = translationService.getFallbackLanguage();
      expect(fallback).toBe('en');
    });
  });

  describe('isLanguageSupported', () => {
    /**
     * Test: Validates supported languages
     * Validates Requirement 1.1
     */
    it('should return true for all supported languages', async () => {
      for (const lang of ALL_LANGUAGES) {
        const isSupported = await translationService.isLanguageSupported(lang);
        expect(isSupported).toBe(true);
      }
    });

    /**
     * Test: Rejects unsupported languages
     * Validates error handling
     */
    it('should return false for unsupported languages', async () => {
      const unsupportedLanguages = ['fr', 'de', 'es', 'zh', 'invalid'];

      for (const lang of unsupportedLanguages) {
        const isSupported = await translationService.isLanguageSupported(lang);
        expect(isSupported).toBe(false);
      }
    });
  });
});
