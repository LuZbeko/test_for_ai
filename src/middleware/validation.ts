import { body, ValidationChain } from 'express-validator';

/**
 * Validation rules for creating a new todo
 */
export const validateTodoCreation: ValidationChain[] = [
  // Title validation - required, string, 1-255 characters
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),

  // Description validation - optional, string, max 1000 characters
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  // Completed validation - optional, boolean, defaults to false
  body('completed')
    .optional()
    .custom((value) => {
      if (value !== undefined && value !== null) {
        if (typeof value !== 'boolean') {
          throw new Error('Completed must be a boolean value');
        }
      }
      return true;
    }),

  // Priority validation - optional, enum values, defaults to 'medium'
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),

  // Due date validation - optional, ISO 8601 date string, must be future date
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date in ISO 8601 format')
    .custom((value) => {
      if (value) {
        const dueDate = new Date(value);
        const now = new Date();
        if (dueDate <= now) {
          throw new Error('Due date must be a future date');
        }
      }
      return true;
    }),

  // Tags validation - optional, JSON string array, max 10 tags
  body('tags')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null/empty values
      }

      try {
        const tags = JSON.parse(value);

        // Must be an array
        if (!Array.isArray(tags)) {
          throw new Error('Tags must be a JSON array');
        }

        // Maximum 10 tags
        if (tags.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }

        // Each tag must be a string and max 50 characters
        for (const tag of tags) {
          if (typeof tag !== 'string') {
            throw new Error('Each tag must be a string');
          }
          if (tag.length > 50) {
            throw new Error('Each tag must not exceed 50 characters');
          }
        }

        return true;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Tags must be a valid JSON array');
      }
    }),
];

/**
 * Custom validation for business rules
 */
export const validateTodoBusinessRules: ValidationChain[] = [
  // Additional business logic validations can be added here
  body('title').custom((value) => {
    // Trim and check for actual content (not just whitespace)
    const trimmed = value?.trim();
    if (!trimmed || trimmed.length === 0) {
      throw new Error('Title cannot be empty or contain only whitespace');
    }
    return true;
  }),

  body('dueDate')
    .optional()
    .custom((value) => {
      if (value) {
        const dueDate = new Date(value);

        // Check if date is too far in the future (more than 10 years)
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 10);

        if (dueDate > maxFutureDate) {
          throw new Error(
            'Due date cannot be more than 10 years in the future'
          );
        }
      }
      return true;
    }),
];
