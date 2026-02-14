import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include language property
declare global {
  namespace Express {
    interface Request {
      language: string;
    }
  }
}

// All 23 supported languages (22 Indian + English)
const SUPPORTED_LANGUAGES = [
  'en',   // English
  'hi',   // Hindi
  'bn',   // Bengali
  'te',   // Telugu
  'mr',   // Marathi
  'ta',   // Tamil
  'gu',   // Gujarati
  'kn',   // Kannada
  'ml',   // Malayalam
  'or',   // Odia
  'pa',   // Punjabi
  'as',   // Assamese
  'ks',   // Kashmiri
  'kok',  // Konkani
  'mni',  // Manipuri
  'ne',   // Nepali
  'sa',   // Sanskrit
  'sd',   // Sindhi
  'ur',   // Urdu
  'brx',  // Bodo
  'sat',  // Santhali
  'mai',  // Maithili
  'doi',  // Dogri
];

const DEFAULT_LANGUAGE = 'en';

/**
 * Middleware to extract and validate language from request
 * Checks query parameter, then Accept-Language header, then defaults to English
 */
export const languageMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Try to get language from query parameter first
  let language = req.query.language as string;

  // If not in query, try Accept-Language header
  if (!language) {
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
      // Parse Accept-Language header (e.g., "en-US,en;q=0.9,hi;q=0.8")
      const languages = acceptLanguage
        .split(',')
        .map((lang) => lang.split(';')[0].trim().toLowerCase().split('-')[0]);
      
      // Find first supported language
      language = languages.find((lang) => SUPPORTED_LANGUAGES.includes(lang)) || '';
    }
  }

  // Validate and set language, fallback to English if invalid
  const languageStr = typeof language === 'string' ? language : '';
  req.language = SUPPORTED_LANGUAGES.includes(languageStr.toLowerCase())
    ? languageStr.toLowerCase()
    : DEFAULT_LANGUAGE;

  next();
};

/**
 * Get list of all supported languages
 */
export const getSupportedLanguages = (): string[] => {
  return [...SUPPORTED_LANGUAGES];
};

/**
 * Check if a language code is supported
 */
export const isLanguageSupported = (languageCode: string): boolean => {
  return SUPPORTED_LANGUAGES.includes(languageCode.toLowerCase());
};

/**
 * Get the default fallback language
 */
export const getDefaultLanguage = (): string => {
  return DEFAULT_LANGUAGE;
};
