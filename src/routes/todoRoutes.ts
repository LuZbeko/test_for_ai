import { Router } from 'express';
import { TodoController } from '../controllers/TodoController';
import { validateTodoCreation } from '../middleware/validation';
import { handleValidationErrors } from '../middleware/errorHandler';

/**
 * Router for todo-related endpoints
 */
const todoRouter = Router();

/**
 * POST /api/todos - Create a new todo
 * Middleware chain:
 * 1. validateTodoCreation - Express validator rules
 * 2. handleValidationErrors - Process validation errors
 * 3. TodoController.create - Handle the request
 */
todoRouter.post(
  '/',
  validateTodoCreation,
  handleValidationErrors,
  TodoController.create
);

/**
 * GET /api/todos - Get all todos
 * No middleware needed - controller handles all logic
 */
todoRouter.get('/', TodoController.getAll);

/**
 * GET /api/todos/:id - Get todo by ID
 * No additional validation middleware needed - controller validates UUID format
 */
todoRouter.get('/:id', TodoController.getById);

/**
 * Future endpoints can be added here:
 * PUT /api/todos/:id - Update todo
 * DELETE /api/todos/:id - Delete todo
 */

export { todoRouter };
