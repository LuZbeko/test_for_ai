import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../middleware/errorHandler';

/**
 * Interface for todo creation request body
 */
interface CreateTodoRequest {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string;
}

/**
 * TodoController class handling todo-related HTTP requests
 */
export class TodoController {
  /**
   * Create a new todo item
   * POST /api/todos
   */
  static async create(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const {
        title,
        description,
        completed,
        priority,
        dueDate,
        tags,
      }: CreateTodoRequest = req.body;

      // Log the incoming request
      console.log('Creating new todo:', {
        title,
        description: description ? 'provided' : 'not provided',
        completed,
        priority,
        dueDate: dueDate ? 'provided' : 'not provided',
        tags: tags ? 'provided' : 'not provided',
        timestamp: new Date().toISOString(),
      });

      // Process due date - convert string to Date if provided
      let processedDueDate: Date | undefined;
      if (dueDate) {
        processedDueDate = new Date(dueDate);

        // Additional business logic validation - ensure due date is in future
        const now = new Date();
        if (processedDueDate <= now) {
          const errorResponse = createErrorResponse(
            'Validation Error',
            'Due date must be in the future',
            400
          );
          res.status(400).json(errorResponse);
          return;
        }
      }

      // Validate tags if provided - should be valid JSON array
      if (tags) {
        try {
          const parsedTags = JSON.parse(tags);
          if (!Array.isArray(parsedTags)) {
            const errorResponse = createErrorResponse(
              'Validation Error',
              'Tags must be a valid JSON array',
              400
            );
            res.status(400).json(errorResponse);
            return;
          }

          // Check tag limits
          if (parsedTags.length > 10) {
            const errorResponse = createErrorResponse(
              'Validation Error',
              'Maximum 10 tags allowed',
              400
            );
            res.status(400).json(errorResponse);
            return;
          }

          // Validate each tag
          for (const tag of parsedTags) {
            if (typeof tag !== 'string') {
              const errorResponse = createErrorResponse(
                'Validation Error',
                'Each tag must be a string',
                400
              );
              res.status(400).json(errorResponse);
              return;
            }
            if (tag.length > 50) {
              const errorResponse = createErrorResponse(
                'Validation Error',
                'Each tag must not exceed 50 characters',
                400
              );
              res.status(400).json(errorResponse);
              return;
            }
          }
        } catch (error) {
          const errorResponse = createErrorResponse(
            'Validation Error',
            'Tags must be valid JSON',
            400
          );
          res.status(400).json(errorResponse);
          return;
        }
      }

      // Create todo in database using Prisma
      const newTodo = await prisma.todo.create({
        data: {
          title: title.trim(),
          description: description?.trim() || undefined,
          completed: completed,
          priority: priority,
          dueDate: processedDueDate,
          tags: tags,
        },
      });

      // Log successful creation
      console.log('Todo created successfully:', {
        id: newTodo.id,
        title: newTodo.title,
        timestamp: new Date().toISOString(),
      });

      // Format response with ISO string dates
      const responseData = {
        ...newTodo,
        createdAt: newTodo.createdAt.toISOString(),
        updatedAt: newTodo.updatedAt.toISOString(),
        dueDate: newTodo.dueDate ? newTodo.dueDate.toISOString() : null,
      };

      // Send success response
      const successResponse = createSuccessResponse(
        responseData,
        'Todo created successfully'
      );

      res.status(201).json(successResponse);
    } catch (error) {
      // Log error for debugging
      console.error('Error creating todo:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });

      // Handle specific Prisma errors
      if (error instanceof Error) {
        if (
          error.name === 'PrismaClientKnownRequestError' ||
          error.name === 'PrismaClientUnknownRequestError' ||
          error.name === 'PrismaClientValidationError'
        ) {
          const errorResponse = createErrorResponse(
            'Database Error',
            'Unable to create todo due to database error',
            500
          );
          res.status(500).json(errorResponse);
          return;
        }
      }

      // Handle generic errors
      const errorResponse = createErrorResponse(
        'Internal Server Error',
        'Unable to create todo',
        500
      );

      res.status(500).json(errorResponse);
    }
  }

  /**
   * Additional controller methods can be added here for other CRUD operations
   * static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> { ... }
   * static async getById(req: Request, res: Response, next: NextFunction): Promise<void> { ... }
   * static async update(req: Request, res: Response, next: NextFunction): Promise<void> { ... }
   * static async delete(req: Request, res: Response, next: NextFunction): Promise<void> { ... }
   */
}
