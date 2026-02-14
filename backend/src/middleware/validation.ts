import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

/**
 * Validation middleware factory
 * Creates middleware that validates request data against a Joi schema
 */
export const validate = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const validationErrors: string[] = [];

    // Validate request body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        validationErrors.push(
          ...error.details.map((detail) => `Body: ${detail.message}`)
        );
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        validationErrors.push(
          ...error.details.map((detail) => `Query: ${detail.message}`)
        );
      }
    }

    // Validate route parameters
    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        validationErrors.push(
          ...error.details.map((detail) => `Params: ${detail.message}`)
        );
      }
    }

    // If validation errors exist, throw AppError
    if (validationErrors.length > 0) {
      throw new AppError(
        `Validation failed: ${validationErrors.join('; ')}`,
        400
      );
    }

    next();
  };
};
