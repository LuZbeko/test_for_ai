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
 * Interface for todo update request body
 */
interface UpdateTodoRequest {
  title?: string;
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
   * Get all todos
   * GET /api/todos
   */
  static async getAll(
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      // Log the incoming request
      console.log('Retrieving all todos:', {
        timestamp: new Date().toISOString(),
      });

      // Fetch all todos from database using Prisma
      const todos = await prisma.todo.findMany({
        orderBy: [{ createdAt: 'desc' }],
      });

      // Log successful retrieval
      console.log('Todos retrieved successfully:', {
        count: todos.length,
        timestamp: new Date().toISOString(),
      });

      // Format response data with ISO string dates
      const responseData = todos.map((todo) => ({
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
        dueDate: todo.dueDate ? todo.dueDate.toISOString() : null,
      }));

      // Send success response
      const successResponse = createSuccessResponse(
        responseData,
        'Todos retrieved successfully'
      );

      res.status(200).json(successResponse);
    } catch (error) {
      // Log error for debugging
      console.error('Error retrieving todos:', {
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
            'Unable to retrieve todos due to database error',
            500
          );
          res.status(500).json(errorResponse);
          return;
        }
      }

      // Handle generic errors
      const errorResponse = createErrorResponse(
        'Internal Server Error',
        'Unable to retrieve todos',
        500
      );

      res.status(500).json(errorResponse);
    }
  }

  /**
   * Get todo by ID
   * GET /api/todos/:id
   */
  static async getById(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!id || !uuidRegex.test(id.trim())) {
        const errorResponse = createErrorResponse(
          'Validation Error',
          'Invalid todo ID format',
          400,
          [
            {
              field: 'id',
              message: 'Must be a valid UUID',
              value: id,
            },
          ]
        );
        res.status(400).json(errorResponse);
        return;
      }

      // Log the incoming request
      console.log('Retrieving todo by ID:', {
        id,
        timestamp: new Date().toISOString(),
      });

      // Fetch specific todo from database using Prisma
      const todo = await prisma.todo.findUnique({
        where: { id: id.trim() },
      });

      // Check if todo was found
      if (!todo) {
        const errorResponse = createErrorResponse(
          'Not Found',
          `Todo with ID ${id} not found`,
          404
        );
        res.status(404).json(errorResponse);
        return;
      }

      // Log successful retrieval
      console.log('Todo retrieved successfully:', {
        id: todo.id,
        title: todo.title,
        timestamp: new Date().toISOString(),
      });

      // Format response data with ISO string dates
      const responseData = {
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
        dueDate: todo.dueDate ? todo.dueDate.toISOString() : null,
      };

      // Send success response
      const successResponse = createSuccessResponse(
        responseData,
        'Todo retrieved successfully'
      );

      res.status(200).json(successResponse);
    } catch (error) {
      // Log error for debugging
      console.error('Error retrieving todo:', {
        id: req.params['id'],
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
            'Unable to retrieve todo due to database error',
            500
          );
          res.status(500).json(errorResponse);
          return;
        }
      }

      // Handle generic errors
      const errorResponse = createErrorResponse(
        'Internal Server Error',
        'Unable to retrieve todo',
        500
      );

      res.status(500).json(errorResponse);
    }
  }

  /**
   * Update existing todo by ID with partial field support
   * PUT /api/todos/:id
   */
  static async update(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        completed,
        priority,
        dueDate,
        tags,
      }: UpdateTodoRequest = req.body;

      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!id || !uuidRegex.test(id.trim())) {
        const errorResponse = createErrorResponse(
          'Validation Error',
          'Invalid todo ID format',
          400,
          [
            {
              field: 'id',
              message: 'Must be a valid UUID',
              value: id,
            },
          ]
        );
        res.status(400).json(errorResponse);
        return;
      }

      // Log the incoming request
      console.log('Updating todo:', {
        id,
        fieldsToUpdate: {
          title: title !== undefined ? 'provided' : 'not provided',
          description: description !== undefined ? 'provided' : 'not provided',
          completed: completed !== undefined ? 'provided' : 'not provided',
          priority: priority !== undefined ? 'provided' : 'not provided',
          dueDate: dueDate !== undefined ? 'provided' : 'not provided',
          tags: tags !== undefined ? 'provided' : 'not provided',
        },
        timestamp: new Date().toISOString(),
      });

      // Build update data object with only provided fields
      const updateData: any = {};

      // Process title - trim if provided
      if (title !== undefined) {
        updateData.title = title.trim();
      }

      // Process description - trim if provided, allow null
      if (description !== undefined) {
        updateData.description = description === null ? null : description.trim();
      }

      // Process completed status
      if (completed !== undefined) {
        updateData.completed = completed;
      }

      // Process priority
      if (priority !== undefined) {
        updateData.priority = priority;
      }

      // Process due date - convert string to Date if provided
      if (dueDate !== undefined) {
        if (dueDate === null) {
          updateData.dueDate = null;
        } else {
          const processedDueDate = new Date(dueDate);

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
          updateData.dueDate = processedDueDate;
        }
      }

      // Process tags - validate if provided
      if (tags !== undefined) {
        if (tags === null) {
          updateData.tags = null;
        } else {
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
            updateData.tags = tags;
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
      }

      // Check if at least one field is provided for update
      if (Object.keys(updateData).length === 0) {
        const errorResponse = createErrorResponse(
          'Validation Error',
          'At least one field must be provided for update',
          400
        );
        res.status(400).json(errorResponse);
        return;
      }

      // Update todo in database using Prisma with selective field updates
      const updatedTodo = await prisma.todo.update({
        where: { id: id.trim() },
        data: updateData,
      });

      // Log successful update
      console.log('Todo updated successfully:', {
        id: updatedTodo.id,
        title: updatedTodo.title,
        fieldsUpdated: Object.keys(updateData),
        timestamp: new Date().toISOString(),
      });

      // Format response with ISO string dates
      const responseData = {
        ...updatedTodo,
        createdAt: updatedTodo.createdAt.toISOString(),
        updatedAt: updatedTodo.updatedAt.toISOString(),
        dueDate: updatedTodo.dueDate ? updatedTodo.dueDate.toISOString() : null,
      };

      // Send success response
      const successResponse = createSuccessResponse(
        responseData,
        'Todo updated successfully'
      );

      res.status(200).json(successResponse);
    } catch (error) {
      // Log error for debugging
      console.error('Error updating todo:', {
        id: req.params['id'],
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });

      // Handle specific Prisma errors
      if (error instanceof Error) {
        // Handle record not found error (P2025)
        if (
          error.name === 'PrismaClientKnownRequestError' &&
          (error as any).code === 'P2025'
        ) {
          const errorResponse = createErrorResponse(
            'Not Found',
            `Todo with ID ${req.params['id']} not found`,
            404
          );
          res.status(404).json(errorResponse);
          return;
        }

        // Handle other Prisma errors
        if (
          error.name === 'PrismaClientKnownRequestError' ||
          error.name === 'PrismaClientUnknownRequestError' ||
          error.name === 'PrismaClientValidationError'
        ) {
          const errorResponse = createErrorResponse(
            'Database Error',
            'Unable to update todo due to database error',
            500
          );
          res.status(500).json(errorResponse);
          return;
        }
      }

      // Handle generic errors
      const errorResponse = createErrorResponse(
        'Internal Server Error',
        'Unable to update todo',
        500
      );

      res.status(500).json(errorResponse);
    }
  }
}
