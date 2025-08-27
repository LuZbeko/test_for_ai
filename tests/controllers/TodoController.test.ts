import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { TodoController } from '../../src/controllers/TodoController';

// Mock Prisma - declare mock function first
const mockTodoCreate = jest.fn();

// Mock the database module
jest.mock('../../src/config/database', () => ({
  prisma: {
    todo: {
      create: jest.fn(),
    },
  },
}));

// Import the mocked module to get access to the mock
import { prisma } from '../../src/config/database';
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());

// Mock request handler that passes validated data
const mockValidatedRequest = (_req: Request, _res: Response, next: NextFunction) => {
  // Simulate that validation has already passed
  next();
};

app.post('/test-controller', mockValidatedRequest, TodoController.create);

describe('TodoController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation
    mockedPrisma.todo.create = mockTodoCreate;
  });

  describe('create method', () => {
    describe('Successful Creation', () => {
      test('should create todo with minimal data', async () => {
        const todoData = {
          title: 'Test Todo'
        };

        const mockCreatedTodo = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Todo',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        mockTodoCreate.mockResolvedValue(mockCreatedTodo);

        const response = await request(app)
          .post('/test-controller')
          .send(todoData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual({
          ...mockCreatedTodo,
          createdAt: '2025-08-27T10:00:00.000Z',
          updatedAt: '2025-08-27T10:00:00.000Z',
        });
        expect(response.body.message).toBe('Todo created successfully');

        expect(mockTodoCreate).toHaveBeenCalledWith({
          data: {
            title: 'Test Todo',
            description: undefined,
            completed: undefined,
            priority: undefined,
            dueDate: undefined,
            tags: undefined,
          },
        });
      });

      test('should create todo with complete data', async () => {
        const todoData = {
          title: 'Complete project documentation',
          description: 'Write comprehensive API documentation for the todo management system',
          completed: false,
          priority: 'high',
          dueDate: '2025-09-01T10:00:00.000Z',
          tags: '["work", "documentation", "urgent"]'
        };

        const mockCreatedTodo = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Complete project documentation',
          description: 'Write comprehensive API documentation for the todo management system',
          completed: false,
          priority: 'high',
          dueDate: new Date('2025-09-01T10:00:00.000Z'),
          tags: '["work", "documentation", "urgent"]',
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        mockTodoCreate.mockResolvedValue(mockCreatedTodo);

        const response = await request(app)
          .post('/test-controller')
          .send(todoData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual({
          ...mockCreatedTodo,
          dueDate: '2025-09-01T10:00:00.000Z',
          createdAt: '2025-08-27T10:00:00.000Z',
          updatedAt: '2025-08-27T10:00:00.000Z',
        });

        expect(mockTodoCreate).toHaveBeenCalledWith({
          data: {
            title: 'Complete project documentation',
            description: 'Write comprehensive API documentation for the todo management system',
            completed: false,
            priority: 'high',
            dueDate: new Date('2025-09-01T10:00:00.000Z'),
            tags: '["work", "documentation", "urgent"]',
          },
        });
      });

      test('should handle default values properly', async () => {
        const todoData = {
          title: 'Simple task'
        };

        const mockCreatedTodo = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Simple task',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        mockTodoCreate.mockResolvedValue(mockCreatedTodo);

        const response = await request(app)
          .post('/test-controller')
          .send(todoData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.completed).toBe(false);
        expect(response.body.data.priority).toBe('medium');
        expect(response.body.data.description).toBeNull();
        expect(response.body.data.dueDate).toBeNull();
        expect(response.body.data.tags).toBeNull();
      });

      test('should generate unique ID for each todo', async () => {
        const todoData = {
          title: 'Test Todo'
        };

        const mockCreatedTodo = {
          id: expect.any(String),
          title: 'Test Todo',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        mockTodoCreate.mockResolvedValue({
          ...mockCreatedTodo,
          id: '550e8400-e29b-41d4-a716-446655440000',
        });

        const response = await request(app)
          .post('/test-controller')
          .send(todoData)
          .expect(201);

        expect(response.body.data.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
      });
    });

    describe('Database Errors', () => {
      test('should handle database connection errors', async () => {
        const todoData = {
          title: 'Test Todo'
        };

        mockTodoCreate.mockRejectedValue(new Error('Database connection failed'));

        const response = await request(app)
          .post('/test-controller')
          .send(todoData)
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Internal Server Error');
        expect(response.body.message).toBe('Unable to create todo');
        expect(response.body.timestamp).toBeDefined();
      });

      test('should handle Prisma validation errors', async () => {
        const todoData = {
          title: 'Test Todo'
        };

        const prismaError = new Error('Invalid data');
        prismaError.name = 'PrismaClientValidationError';

        mockTodoCreate.mockRejectedValue(prismaError);

        const response = await request(app)
          .post('/test-controller')
          .send(todoData)
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Database Error');
        expect(response.body.message).toBe('Unable to create todo due to database error');
      });

      test('should handle unknown database errors', async () => {
        const todoData = {
          title: 'Test Todo'
        };

        mockTodoCreate.mockRejectedValue(new Error('Unknown database error'));

        const response = await request(app)
          .post('/test-controller')
          .send(todoData)
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Internal Server Error');
        expect(response.body.timestamp).toBeDefined();
      });
    });

    describe('Data Processing', () => {
      test('should properly convert date strings to Date objects', async () => {
        const todoData = {
          title: 'Task with due date',
          dueDate: '2025-12-31T23:59:59.000Z'
        };

        const mockCreatedTodo = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Task with due date',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: new Date('2025-12-31T23:59:59.000Z'),
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        mockTodoCreate.mockResolvedValue(mockCreatedTodo);

        await request(app)
          .post('/test-controller')
          .send(todoData);

        expect(mockTodoCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            dueDate: new Date('2025-12-31T23:59:59.000Z'),
          }),
        });
      });

      test('should handle null and undefined values correctly', async () => {
        const todoData = {
          title: 'Test Todo',
          description: null,
          completed: undefined,
          tags: null
        };

        const mockCreatedTodo = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Todo',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        mockTodoCreate.mockResolvedValue(mockCreatedTodo);

        await request(app)
          .post('/test-controller')
          .send(todoData)
          .expect(201);

        expect(mockTodoCreate).toHaveBeenCalledWith({
          data: {
            title: 'Test Todo',
            description: undefined,
            completed: undefined,
            priority: undefined,
            dueDate: undefined,
            tags: null,
          },
        });
      });
    });

    describe('Response Format', () => {
      test('should return correct success response format', async () => {
        const todoData = {
          title: 'Test Todo'
        };

        const mockCreatedTodo = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Todo',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        mockTodoCreate.mockResolvedValue(mockCreatedTodo);

        const response = await request(app)
          .post('/test-controller')
          .send(todoData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message', 'Todo created successfully');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('title');
        expect(response.body.data).toHaveProperty('createdAt');
        expect(response.body.data).toHaveProperty('updatedAt');
      });

      test('should format dates as ISO strings in response', async () => {
        const todoData = {
          title: 'Test Todo',
          dueDate: '2025-12-31T23:59:59.000Z'
        };

        const mockCreatedTodo = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Todo',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: new Date('2025-12-31T23:59:59.000Z'),
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        mockTodoCreate.mockResolvedValue(mockCreatedTodo);

        const response = await request(app)
          .post('/test-controller')
          .send(todoData)
          .expect(201);

        expect(response.body.data.dueDate).toBe('2025-12-31T23:59:59.000Z');
        expect(response.body.data.createdAt).toBe('2025-08-27T10:00:00.000Z');
        expect(response.body.data.updatedAt).toBe('2025-08-27T10:00:00.000Z');
      });
    });

    describe('Logging', () => {
      let consoleSpy: jest.SpyInstance;

      beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      });

      afterEach(() => {
        consoleSpy.mockRestore();
      });

      test('should log successful todo creation', async () => {
        const todoData = {
          title: 'Test Todo'
        };

        const mockCreatedTodo = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Todo',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        mockTodoCreate.mockResolvedValue(mockCreatedTodo);

        await request(app)
          .post('/test-controller')
          .send(todoData);

        expect(consoleSpy).toHaveBeenCalledWith(
          'Todo created successfully:',
          expect.objectContaining({
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Test Todo',
            timestamp: expect.any(String)
          })
        );
      });
    });
  });
});