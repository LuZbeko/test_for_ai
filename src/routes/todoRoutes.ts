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
 * Future endpoints can be added here:
 * GET /api/todos - Get all todos
 * GET /api/todos/:id - Get todo by ID
 * PUT /api/todos/:id - Update todo
 * DELETE /api/todos/:id - Delete todo
 */

export { todoRouter };
