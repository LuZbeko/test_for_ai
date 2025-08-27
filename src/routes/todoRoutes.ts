import { Router } from 'express';
import { TodoController } from '../controllers/TodoController';
import {
  validateTodoCreation,
  validateTodoUpdate,
  validateUuidParam,
} from '../middleware/validation';
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
 * PUT /api/todos/:id - Update existing todo
 * Middleware chain:
 * 1. validateUuidParam - Validate the UUID parameter format
 * 2. validateTodoUpdate - Express validator rules for partial updates
 * 3. handleValidationErrors - Process validation errors
 * 4. TodoController.updateTodo - Handle the request
 */
todoRouter.put(
  '/:id',
  validateUuidParam,
  validateTodoUpdate,
  handleValidationErrors,
  TodoController.updateTodo
);

/**
 * Future endpoints can be added here:
 * DELETE /api/todos/:id - Delete todo
 */

export { todoRouter };
