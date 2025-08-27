import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { checkDatabaseConnection } from './config/database';
import { apiRouter } from './routes';
import { handleNotFound, handleServerErrors } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();

  res.status(dbStatus ? 200 : 503).json({
    status: dbStatus ? 'healthy' : 'unhealthy',
    message: 'Server is running',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
  });
});

// Mount API routes
app.use('/api', apiRouter);

// Handle 404 errors for undefined routes
app.use(handleNotFound);

// Global error handling middleware (must be last)
app.use(handleServerErrors);

export default app;
