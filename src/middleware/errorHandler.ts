import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

/**
 * Interface for standardized error response
 */
interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: ValidationErrorDetail[];
  timestamp: string;
}

/**
 * Interface for validation error details
 */
interface ValidationErrorDetail {
  field: string;
  message: string;
  value: any;
  location?: string;
}

/**
 * Middleware to handle express-validator validation errors
 * Formats validation errors into a consistent API response format
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors: ValidationErrorDetail[] = errors
      .array()
      .map((error: ValidationError) => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined,
        location: error.type === 'field' ? error.location : undefined,
      }));

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Validation Error',
      details: validationErrors,
      timestamp: new Date().toISOString(),
    };

    res.status(400).json(errorResponse);
    return;
  }

  next();
};

/**
 * Global error handling middleware for unhandled errors
 * Should be the last middleware in the stack
 */
export const handleServerErrors = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle JSON parsing errors
  if (error.type === 'entity.parse.failed') {
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Invalid JSON',
      message: 'The request body contains invalid JSON',
      timestamp: new Date().toISOString(),
    };
    res.status(400).json(errorResponse);
    return;
  }

  console.error('Server Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Don't send error details in production
  const isDevelopment = process.env['NODE_ENV'] === 'development';

  const errorResponse: ErrorResponse = {
    success: false,
    error: 'Internal Server Error',
    message: isDevelopment
      ? error.message
      : 'Something went wrong. Please try again later.',
    timestamp: new Date().toISOString(),
  };

  // Use existing status code if available, otherwise default to 500
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware to handle database errors specifically
 */
export const handleDatabaseErrors = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Check if it's a Prisma error or database-related error
  if (
    error.name === 'PrismaClientKnownRequestError' ||
    error.name === 'PrismaClientUnknownRequestError' ||
    error.name === 'PrismaClientValidationError'
  ) {
    console.error('Database Error:', {
      name: error.name,
      message: error.message,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Database Error',
      message:
        'Unable to process request due to database error. Please try again later.',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(errorResponse);
    return;
  }

  // If not a database error, pass to next error handler
  _next(error);
};

/**
 * Middleware to handle 404 errors for undefined routes
 */
export const handleNotFound = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(errorResponse);
};

/**
 * Utility function to create consistent error responses
 */
export const createErrorResponse = (
  error: string,
  message?: string,
  _statusCode: number = 500,
  details?: ValidationErrorDetail[]
): ErrorResponse => {
  return {
    success: false,
    error,
    message,
    details,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Utility function to create consistent success responses
 */
export const createSuccessResponse = (
  data: any,
  message?: string
): { success: true; data: any; message?: string } => {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
};
