import Joi from 'joi';

// Supported languages
const SUPPORTED_LANGUAGES = [
  'en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa',
  'as', 'ks', 'kok', 'mni', 'ne', 'sa', 'sd', 'ur', 'brx', 'sat', 'mai', 'doi',
];

// Heritage categories
const HERITAGE_CATEGORIES = [
  'monuments',
  'temples',
  'festivals',
  'traditions',
  'cuisine',
  'art_forms',
  'historical_events',
  'customs',
];

// Indian regions
const REGIONS = ['North', 'South', 'East', 'West', 'Central', 'Northeast'];

/**
 * Validation schema for GET /api/v1/cities
 */
export const getCitiesSchema = {
  query: Joi.object({
    language: Joi.string().max(10).optional(), // Allow locale codes like en-US, will be normalized by middleware
    state: Joi.string().max(100).optional(),
    region: Joi.string().valid(...REGIONS).optional(),
    search: Joi.string().max(255).optional(),
  }),
};

/**
 * Validation schema for GET /api/v1/cities/:cityId/heritage
 */
export const getCityHeritageSchema = {
  params: Joi.object({
    cityId: Joi.string().uuid().required(),
  }),
  query: Joi.object({
    language: Joi.string().max(10).optional(), // Allow locale codes like en-US, will be normalized by middleware
    category: Joi.string().valid(...HERITAGE_CATEGORIES).optional(),
  }),
};

/**
 * Validation schema for GET /api/v1/heritage/:heritageId
 */
export const getHeritageDetailsSchema = {
  params: Joi.object({
    heritageId: Joi.string().uuid().required(),
  }),
  query: Joi.object({
    language: Joi.string().max(10).optional(), // Allow locale codes like en-US, will be normalized by middleware
  }),
};

/**
 * Validation schema for GET /api/v1/heritage/:heritageId/images
 */
export const getHeritageImagesSchema = {
  params: Joi.object({
    heritageId: Joi.string().uuid().required(),
  }),
};

/**
 * Validation schema for GET /api/v1/languages
 */
export const getLanguagesSchema = {
  query: Joi.object({}),
};
