import { db } from '../config/database';

export interface Language {
  code: string;
  name: string;
  englishName: string;
}

export interface Translation {
  language: string;
  content: Record<string, string>;
}

export class TranslationService {
  private readonly fallbackLanguage = 'en';
  private languagesCache: Language[] | null = null;

  /**
   * Get translation for a specific entity and fields
   * Falls back to English if translation is not available
   */
  async getTranslation(
    entityType: string,
    entityId: string,
    language: string,
    fields: string[]
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    // Query for translations in requested language
    const translations = await db.query<{
      field_name: string;
      content: string;
    }>(`
      SELECT field_name, content
      FROM translations
      WHERE entity_type = $1
        AND entity_id = $2
        AND language_code = $3
        AND field_name = ANY($4)
    `, [entityType, entityId, language, fields]);

    // Map translations to result
    const translationMap = new Map(
      translations.map(t => [t.field_name, t.content])
    );

    // For each requested field, use translation or fallback to English
    for (const field of fields) {
      if (translationMap.has(field)) {
        result[field] = translationMap.get(field)!;
      } else {
        // Fallback to English
        const fallback = await db.query<{ content: string }>(`
          SELECT content
          FROM translations
          WHERE entity_type = $1
            AND entity_id = $2
            AND language_code = $3
            AND field_name = $4
          LIMIT 1
        `, [entityType, entityId, this.fallbackLanguage, field]);

        result[field] = fallback[0]?.content || '';
      }
    }

    return result;
  }

  /**
   * Get translations for multiple entities in batch (optimized)
   */
  async getBatchTranslations(
    entityType: string,
    entityIds: string[],
    language: string,
    fields: string[]
  ): Promise<Map<string, Record<string, string>>> {
    if (entityIds.length === 0) {
      return new Map();
    }

    // Query for all translations in requested language
    const translations = await db.query<{
      entity_id: string;
      field_name: string;
      content: string;
    }>(`
      SELECT entity_id, field_name, content
      FROM translations
      WHERE entity_type = $1
        AND entity_id = ANY($2)
        AND language_code = $3
        AND field_name = ANY($4)
    `, [entityType, entityIds, language, fields]);

    // Build map of entity_id -> field_name -> content
    const translationMap = new Map<string, Map<string, string>>();
    for (const t of translations) {
      if (!translationMap.has(t.entity_id)) {
        translationMap.set(t.entity_id, new Map());
      }
      translationMap.get(t.entity_id)!.set(t.field_name, t.content);
    }

    // Find missing translations
    const missingTranslations: Array<{ entityId: string; field: string }> = [];
    for (const entityId of entityIds) {
      const entityTranslations = translationMap.get(entityId);
      for (const field of fields) {
        if (!entityTranslations?.has(field)) {
          missingTranslations.push({ entityId, field });
        }
      }
    }

    // Fetch fallback translations for missing ones
    if (missingTranslations.length > 0) {
      const fallbackEntityIds = [...new Set(missingTranslations.map(m => m.entityId))];
      const fallbackFields = [...new Set(missingTranslations.map(m => m.field))];

      const fallbacks = await db.query<{
        entity_id: string;
        field_name: string;
        content: string;
      }>(`
        SELECT entity_id, field_name, content
        FROM translations
        WHERE entity_type = $1
          AND entity_id = ANY($2)
          AND language_code = $3
          AND field_name = ANY($4)
      `, [entityType, fallbackEntityIds, this.fallbackLanguage, fallbackFields]);

      // Add fallback translations
      for (const f of fallbacks) {
        if (!translationMap.has(f.entity_id)) {
          translationMap.set(f.entity_id, new Map());
        }
        const entityTranslations = translationMap.get(f.entity_id)!;
        if (!entityTranslations.has(f.field_name)) {
          entityTranslations.set(f.field_name, f.content);
        }
      }
    }

    // Convert to final result format
    const result = new Map<string, Record<string, string>>();
    for (const entityId of entityIds) {
      const entityTranslations = translationMap.get(entityId);
      const record: Record<string, string> = {};
      
      for (const field of fields) {
        record[field] = entityTranslations?.get(field) || '';
      }
      
      result.set(entityId, record);
    }

    return result;
  }

  /**
   * Get all supported languages
   */
  async getSupportedLanguages(): Promise<Language[]> {
    // Return cached languages if available
    if (this.languagesCache) {
      return this.languagesCache;
    }

    const languages = await db.query<{
      code: string;
      native_name: string;
      english_name: string;
    }>(`
      SELECT code, native_name, english_name
      FROM languages
      WHERE is_active = true
      ORDER BY english_name
    `);

    this.languagesCache = languages.map(l => ({
      code: l.code,
      name: l.native_name,
      englishName: l.english_name,
    }));

    return this.languagesCache;
  }

  /**
   * Get the fallback language code
   */
  getFallbackLanguage(): string {
    return this.fallbackLanguage;
  }

  /**
   * Check if a language is supported
   */
  async isLanguageSupported(languageCode: string): Promise<boolean> {
    const languages = await this.getSupportedLanguages();
    return languages.some(l => l.code === languageCode);
  }

  /**
   * Clear the languages cache (useful for testing or when languages are updated)
   */
  clearCache(): void {
    this.languagesCache = null;
  }
}

// Export singleton instance
export const translationService = new TranslationService();
