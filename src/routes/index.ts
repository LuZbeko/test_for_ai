import { Router } from 'express';
import { todoRouter } from './todoRoutes';

/**
 * Main router that combines all API routes
 */
const apiRouter = Router();

/**
 * Mount todo routes at /api/todos
 */
apiRouter.use('/todos', todoRouter);

/**
 * Future route modules can be added here:
 * apiRouter.use('/users', userRouter);
 * apiRouter.use('/auth', authRouter);
 */

export { apiRouter };
