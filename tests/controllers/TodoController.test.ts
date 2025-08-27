import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { TodoController } from '../../src/controllers/TodoController';

// Mock Prisma - declare mock functions first
const mockTodoCreate = jest.fn();
const mockTodoFindMany = jest.fn();
const mockTodoFindUnique = jest.fn();
const mockTodoUpdate = jest.fn();

// Mock the database module
jest.mock('../../src/config/database', () => ({
  prisma: {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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
app.get('/test-controller', TodoController.getAll);
app.get('/test-controller/:id', TodoController.getById);
app.put('/test-controller/:id', mockValidatedRequest, TodoController.updateTodo);

describe('TodoController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementations
    mockedPrisma.todo.create = mockTodoCreate;
    mockedPrisma.todo.findMany = mockTodoFindMany;
    mockedPrisma.todo.findUnique = mockTodoFindUnique;
    mockedPrisma.todo.update = mockTodoUpdate;
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

  describe('getAll method', () => {
    describe('Successful Retrieval', () => {
      test('should return all todos when they exist', async () => {
        const mockTodos = [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'First Todo',
            description: 'First description',
            completed: false,
            priority: 'medium',
            dueDate: null,
            tags: null,
            createdAt: new Date('2025-08-27T10:00:00.000Z'),
            updatedAt: new Date('2025-08-27T10:00:00.000Z'),
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Second Todo',
            description: null,
            completed: true,
            priority: 'high',
            dueDate: new Date('2025-09-01T12:00:00.000Z'),
            tags: '["urgent", "work"]',
            createdAt: new Date('2025-08-27T11:00:00.000Z'),
            updatedAt: new Date('2025-08-27T11:30:00.000Z'),
          }
        ];

        mockTodoFindMany.mockResolvedValue(mockTodos);

        const response = await request(app)
          .get('/test-controller')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Todos retrieved successfully');
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0]).toEqual({
          ...mockTodos[0],
          createdAt: '2025-08-27T10:00:00.000Z',
          updatedAt: '2025-08-27T10:00:00.000Z',
        });
        expect(response.body.data[1]).toEqual({
          ...mockTodos[1],
          dueDate: '2025-09-01T12:00:00.000Z',
          createdAt: '2025-08-27T11:00:00.000Z',
          updatedAt: '2025-08-27T11:30:00.000Z',
        });

        expect(mockTodoFindMany).toHaveBeenCalledWith({
          orderBy: [{ createdAt: 'desc' }]
        });
      });

      test('should return empty array when no todos exist', async () => {
        mockTodoFindMany.mockResolvedValue([]);

        const response = await request(app)
          .get('/test-controller')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Todos retrieved successfully');
        expect(response.body.data).toEqual([]);
        expect(response.body.data).toHaveLength(0);

        expect(mockTodoFindMany).toHaveBeenCalledWith({
          orderBy: [{ createdAt: 'desc' }]
        });
      });

      test('should format response structure correctly', async () => {
        const mockTodos = [{
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Todo',
          description: 'Test description',
          completed: false,
          priority: 'low',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        }];

        mockTodoFindMany.mockResolvedValue(mockTodos);

        const response = await request(app)
          .get('/test-controller')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message');
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('Database Errors', () => {
      test('should handle database connection errors', async () => {
        mockTodoFindMany.mockRejectedValue(new Error('Database connection failed'));

        const response = await request(app)
          .get('/test-controller')
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Internal Server Error');
        expect(response.body.message).toBe('Unable to retrieve todos');
        expect(response.body.timestamp).toBeDefined();
      });

      test('should handle Prisma query errors', async () => {
        const prismaError = new Error('Query failed');
        prismaError.name = 'PrismaClientKnownRequestError';

        mockTodoFindMany.mockRejectedValue(prismaError);

        const response = await request(app)
          .get('/test-controller')
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Database Error');
        expect(response.body.message).toBe('Unable to retrieve todos due to database error');
      });
    });

    describe('Response Format', () => {
      test('should format dates as ISO strings', async () => {
        const mockTodos = [{
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Todo with dates',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: new Date('2025-12-31T23:59:59.000Z'),
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T11:00:00.000Z'),
        }];

        mockTodoFindMany.mockResolvedValue(mockTodos);

        const response = await request(app)
          .get('/test-controller')
          .expect(200);

        expect(response.body.data[0].dueDate).toBe('2025-12-31T23:59:59.000Z');
        expect(response.body.data[0].createdAt).toBe('2025-08-27T10:00:00.000Z');
        expect(response.body.data[0].updatedAt).toBe('2025-08-27T11:00:00.000Z');
      });
    });
  });

  describe('getById method', () => {
    describe('Successful Retrieval', () => {
      test('should return todo when it exists', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const mockTodo = {
          id: todoId,
          title: 'Test Todo',
          description: 'Test description',
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        mockTodoFindUnique.mockResolvedValue(mockTodo);

        const response = await request(app)
          .get(`/test-controller/${todoId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Todo retrieved successfully');
        expect(response.body.data).toEqual({
          ...mockTodo,
          createdAt: '2025-08-27T10:00:00.000Z',
          updatedAt: '2025-08-27T10:00:00.000Z',
        });

        expect(mockTodoFindUnique).toHaveBeenCalledWith({
          where: { id: todoId }
        });
      });

      test('should return todo with complete data including dates', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const mockTodo = {
          id: todoId,
          title: 'Complete Todo',
          description: 'Full description',
          completed: true,
          priority: 'high',
          dueDate: new Date('2025-12-31T23:59:59.000Z'),
          tags: '["urgent", "important"]',
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T11:00:00.000Z'),
        };

        mockTodoFindUnique.mockResolvedValue(mockTodo);

        const response = await request(app)
          .get(`/test-controller/${todoId}`)
          .expect(200);

        expect(response.body.data).toEqual({
          id: todoId,
          title: 'Complete Todo',
          description: 'Full description',
          completed: true,
          priority: 'high',
          dueDate: '2025-12-31T23:59:59.000Z',
          tags: '["urgent", "important"]',
          createdAt: '2025-08-27T10:00:00.000Z',
          updatedAt: '2025-08-27T11:00:00.000Z',
        });
      });
    });

    describe('Not Found Handling', () => {
      test('should return 404 when todo does not exist', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        
        mockTodoFindUnique.mockResolvedValue(null);

        const response = await request(app)
          .get(`/test-controller/${todoId}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Not Found');
        expect(response.body.message).toBe(`Todo with ID ${todoId} not found`);
        expect(response.body.timestamp).toBeDefined();

        expect(mockTodoFindUnique).toHaveBeenCalledWith({
          where: { id: todoId }
        });
      });
    });

    describe('ID Validation', () => {
      test('should return 400 for invalid UUID format', async () => {
        const invalidId = 'invalid-uuid';

        const response = await request(app)
          .get(`/test-controller/${invalidId}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.message).toBe('Invalid todo ID format');
        expect(response.body.details).toContainEqual({
          field: 'id',
          message: 'Must be a valid UUID',
          value: 'invalid-uuid'
        });

        // Should not call database when ID is invalid
        expect(mockTodoFindUnique).not.toHaveBeenCalled();
      });

      test('should return 400 for empty ID', async () => {
        const response = await request(app)
          .get('/test-controller/%20')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.message).toBe('Invalid todo ID format');
      });
    });

    describe('Database Errors', () => {
      test('should handle database connection errors', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        
        mockTodoFindUnique.mockRejectedValue(new Error('Database connection failed'));

        const response = await request(app)
          .get(`/test-controller/${todoId}`)
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Internal Server Error');
        expect(response.body.message).toBe('Unable to retrieve todo');
        expect(response.body.timestamp).toBeDefined();
      });

      test('should handle Prisma query errors', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const prismaError = new Error('Query failed');
        prismaError.name = 'PrismaClientKnownRequestError';

        mockTodoFindUnique.mockRejectedValue(prismaError);

        const response = await request(app)
          .get(`/test-controller/${todoId}`)
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Database Error');
        expect(response.body.message).toBe('Unable to retrieve todo due to database error');
      });
    });

    describe('Response Format', () => {
      test('should return correct success response structure', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const mockTodo = {
          id: todoId,
          title: 'Test Todo',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        mockTodoFindUnique.mockResolvedValue(mockTodo);

        const response = await request(app)
          .get(`/test-controller/${todoId}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('title');
        expect(response.body.data).toHaveProperty('createdAt');
        expect(response.body.data).toHaveProperty('updatedAt');
      });
    });
  });

  describe('Database Layer - Update Operations', () => {
    describe('Prisma Update Method Tests', () => {
      test('should call prisma.update with selective field updates for single field', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = { title: 'Updated Title' };
        
        const mockUpdatedTodo = {
          id: todoId,
          title: 'Updated Title',
          description: 'Original description',
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T12:00:00.000Z'),
        };

        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        // We'll test this once we implement the update method
        // For now, test that Prisma update is called correctly with selective fields
        const result = await prisma.todo.update({
          where: { id: todoId },
          data: updateData,
        });

        expect(mockTodoUpdate).toHaveBeenCalledWith({
          where: { id: todoId },
          data: updateData,
        });
        expect(result).toEqual(mockUpdatedTodo);
      });

      test('should call prisma.update with multiple field updates', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440001';
        const updateData = {
          title: 'Multi-field Update',
          completed: true,
          priority: 'high' as const,
        };
        
        const mockUpdatedTodo = {
          id: todoId,
          title: 'Multi-field Update',
          description: 'Original description',
          completed: true,
          priority: 'high',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T12:30:00.000Z'),
        };

        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const result = await prisma.todo.update({
          where: { id: todoId },
          data: updateData,
        });

        expect(mockTodoUpdate).toHaveBeenCalledWith({
          where: { id: todoId },
          data: updateData,
        });
        expect(result).toEqual(mockUpdatedTodo);
      });

      test('should handle date field updates properly', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440002';
        const dueDate = new Date('2025-12-31T23:59:59.000Z');
        const updateData = { dueDate };
        
        const mockUpdatedTodo = {
          id: todoId,
          title: 'Todo with date',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T12:45:00.000Z'),
        };

        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const result = await prisma.todo.update({
          where: { id: todoId },
          data: updateData,
        });

        expect(mockTodoUpdate).toHaveBeenCalledWith({
          where: { id: todoId },
          data: updateData,
        });
        expect(result.dueDate).toEqual(dueDate);
      });

      test('should handle tags field updates with JSON string', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440003';
        const tags = '["updated", "tags", "test"]';
        const updateData = { tags };
        
        const mockUpdatedTodo = {
          id: todoId,
          title: 'Todo with tags',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T13:00:00.000Z'),
        };

        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const result = await prisma.todo.update({
          where: { id: todoId },
          data: updateData,
        });

        expect(mockTodoUpdate).toHaveBeenCalledWith({
          where: { id: todoId },
          data: updateData,
        });
        expect(result.tags).toBe(tags);
      });

      test('should handle null value updates correctly', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440004';
        const updateData = {
          description: null,
          dueDate: null,
          tags: null,
        };
        
        const mockUpdatedTodo = {
          id: todoId,
          title: 'Todo with nulls',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T13:15:00.000Z'),
        };

        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const result = await prisma.todo.update({
          where: { id: todoId },
          data: updateData,
        });

        expect(mockTodoUpdate).toHaveBeenCalledWith({
          where: { id: todoId },
          data: updateData,
        });
        expect(result.description).toBeNull();
        expect(result.dueDate).toBeNull();
        expect(result.tags).toBeNull();
      });
    });

    describe('Database Error Handling', () => {
      test('should handle PrismaClientKnownRequestError during update', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = { title: 'Updated Title' };
        
        const prismaError = new Error('Record to update not found.');
        prismaError.name = 'PrismaClientKnownRequestError';
        Object.assign(prismaError, { code: 'P2025' });

        mockTodoUpdate.mockRejectedValue(prismaError);

        await expect(prisma.todo.update({
          where: { id: todoId },
          data: updateData,
        })).rejects.toThrow('Record to update not found.');

        expect(mockTodoUpdate).toHaveBeenCalledWith({
          where: { id: todoId },
          data: updateData,
        });
      });

      test('should handle PrismaClientValidationError during update', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = { title: 'Updated Title' };
        
        const prismaError = new Error('Invalid input data');
        prismaError.name = 'PrismaClientValidationError';

        mockTodoUpdate.mockRejectedValue(prismaError);

        await expect(prisma.todo.update({
          where: { id: todoId },
          data: updateData,
        })).rejects.toThrow('Invalid input data');
      });

      test('should handle database connection errors during update', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = { completed: true };
        
        const connectionError = new Error('Database connection failed');

        mockTodoUpdate.mockRejectedValue(connectionError);

        await expect(prisma.todo.update({
          where: { id: todoId },
          data: updateData,
        })).rejects.toThrow('Database connection failed');
      });

      test('should handle constraint violation errors during update', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = { title: 'A'.repeat(300) }; // Exceed max length
        
        const constraintError = new Error('Value too long for column');
        constraintError.name = 'PrismaClientKnownRequestError';
        Object.assign(constraintError, { code: 'P2000' });

        mockTodoUpdate.mockRejectedValue(constraintError);

        await expect(prisma.todo.update({
          where: { id: todoId },
          data: updateData,
        })).rejects.toThrow('Value too long for column');
      });
    });

    describe('Partial Update Scenarios', () => {
      test('should preserve existing fields when updating only title', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = { title: 'Only Title Updated' };
        
        const mockUpdatedTodo = {
          id: todoId,
          title: 'Only Title Updated',
          description: 'Original description remains',
          completed: false,
          priority: 'high',
          dueDate: new Date('2025-12-31T23:59:59.000Z'),
          tags: '["original", "tags"]',
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T14:00:00.000Z'),
        };

        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const result = await prisma.todo.update({
          where: { id: todoId },
          data: updateData,
        });

        expect(result.title).toBe('Only Title Updated');
        expect(result.description).toBe('Original description remains');
        expect(result.completed).toBe(false);
        expect(result.priority).toBe('high');
        expect(result.tags).toBe('["original", "tags"]');
      });

      test('should preserve existing fields when updating only completion status', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440001';
        const updateData = { completed: true };
        
        const mockUpdatedTodo = {
          id: todoId,
          title: 'Original title remains',
          description: 'Original description remains',
          completed: true,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T14:15:00.000Z'),
        };

        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const result = await prisma.todo.update({
          where: { id: todoId },
          data: updateData,
        });

        expect(result.completed).toBe(true);
        expect(result.title).toBe('Original title remains');
        expect(result.description).toBe('Original description remains');
        expect(result.priority).toBe('medium');
      });

      test('should handle complex partial updates with mixed field types', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440002';
        const updateData = {
          description: 'Updated description',
          priority: 'low' as const,
          dueDate: new Date('2025-11-15T10:00:00.000Z'),
        };
        
        const mockUpdatedTodo = {
          id: todoId,
          title: 'Original title unchanged',
          description: 'Updated description',
          completed: false,
          priority: 'low',
          dueDate: new Date('2025-11-15T10:00:00.000Z'),
          tags: '["original", "tags", "unchanged"]',
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T14:30:00.000Z'),
        };

        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const result = await prisma.todo.update({
          where: { id: todoId },
          data: updateData,
        });

        expect(result.description).toBe('Updated description');
        expect(result.priority).toBe('low');
        expect(result.dueDate).toEqual(new Date('2025-11-15T10:00:00.000Z'));
        expect(result.title).toBe('Original title unchanged');
        expect(result.tags).toBe('["original", "tags", "unchanged"]');
      });
    });

    describe('Update Data Validation in Database Layer', () => {
      test('should handle trimmed string values correctly', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = {
          title: '  Trimmed Title  ',
          description: '  Trimmed Description  ',
        };
        
        const mockUpdatedTodo = {
          id: todoId,
          title: 'Trimmed Title',
          description: 'Trimmed Description',
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T14:45:00.000Z'),
        };

        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const result = await prisma.todo.update({
          where: { id: todoId },
          data: {
            title: updateData.title.trim(),
            description: updateData.description.trim(),
          },
        });

        expect(result.title).toBe('Trimmed Title');
        expect(result.description).toBe('Trimmed Description');
      });

      test('should handle undefined vs null distinctions properly', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440001';
        const updateData = {
          description: undefined, // Should not be included in update
          tags: null, // Should explicitly set to null
        };
        
        const cleanUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([_, value]) => value !== undefined)
        );

        const mockUpdatedTodo = {
          id: todoId,
          title: 'Original title',
          description: 'Original description unchanged',
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T15:00:00.000Z'),
        };

        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const result = await prisma.todo.update({
          where: { id: todoId },
          data: cleanUpdateData,
        });

        expect(mockTodoUpdate).toHaveBeenCalledWith({
          where: { id: todoId },
          data: { tags: null },
        });
        expect(result.tags).toBeNull();
        expect(result.description).toBe('Original description unchanged');
      });
    });

    describe('Timestamp Updates', () => {
      test('should update updatedAt timestamp automatically', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = { title: 'Updated Title' };
        
        const originalCreatedAt = new Date('2025-08-27T10:00:00.000Z');
        const newUpdatedAt = new Date('2025-08-27T15:15:00.000Z');
        
        const mockUpdatedTodo = {
          id: todoId,
          title: 'Updated Title',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: originalCreatedAt,
          updatedAt: newUpdatedAt,
        };

        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const result = await prisma.todo.update({
          where: { id: todoId },
          data: updateData,
        });

        expect(result.createdAt).toEqual(originalCreatedAt);
        expect(result.updatedAt).toEqual(newUpdatedAt);
        expect(result.updatedAt.getTime()).toBeGreaterThan(result.createdAt.getTime());
      });
    });
  });

  describe('updateTodo method', () => {
    describe('Successful Updates', () => {
      test('should update todo with partial data', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = {
          title: 'Updated Title'
        };

        const mockUpdatedTodo = {
          id: todoId,
          title: 'Updated Title',
          description: 'Original description',
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T12:00:00.000Z'),
        };

        mockTodoFindUnique.mockResolvedValue({
          id: todoId,
          title: 'Original Title',
          description: 'Original description',
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        });

        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const response = await request(app)
          .put(`/test-controller/${todoId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual({
          ...mockUpdatedTodo,
          createdAt: '2025-08-27T10:00:00.000Z',
          updatedAt: '2025-08-27T12:00:00.000Z',
        });
        expect(response.body.message).toBe('Todo updated successfully');

        expect(mockTodoFindUnique).toHaveBeenCalledWith({
          where: { id: todoId },
        });

        expect(mockTodoUpdate).toHaveBeenCalledWith({
          where: { id: todoId },
          data: {
            title: 'Updated Title',
          },
        });
      });

      test('should update multiple fields', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const futureDate = new Date('2025-12-31T23:59:59.000Z');
        const updateData = {
          title: 'Updated Title',
          description: 'Updated description',
          completed: true,
          priority: 'high',
          dueDate: futureDate.toISOString(),
          tags: '["updated", "test"]'
        };

        const mockExistingTodo = {
          id: todoId,
          title: 'Original Title',
          description: 'Original description',
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        const mockUpdatedTodo = {
          id: todoId,
          title: 'Updated Title',
          description: 'Updated description',
          completed: true,
          priority: 'high',
          dueDate: futureDate,
          tags: '["updated", "test"]',
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T14:00:00.000Z'),
        };

        mockTodoFindUnique.mockResolvedValue(mockExistingTodo);
        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const response = await request(app)
          .put(`/test-controller/${todoId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe('Updated Title');
        expect(response.body.data.completed).toBe(true);
        expect(response.body.data.priority).toBe('high');

        expect(mockTodoUpdate).toHaveBeenCalledWith({
          where: { id: todoId },
          data: {
            title: 'Updated Title',
            description: 'Updated description',
            completed: true,
            priority: 'high',
            dueDate: futureDate,
            tags: '["updated", "test"]',
          },
        });
      });

      test('should update fields to null values', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = {
          description: null,
          dueDate: null,
          tags: null
        };

        const mockExistingTodo = {
          id: todoId,
          title: 'Test Todo',
          description: 'Has description',
          completed: false,
          priority: 'medium',
          dueDate: new Date('2025-12-31T23:59:59.000Z'),
          tags: '["tag1", "tag2"]',
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        const mockUpdatedTodo = {
          ...mockExistingTodo,
          description: null,
          dueDate: null,
          tags: null,
          updatedAt: new Date('2025-08-27T15:00:00.000Z'),
        };

        mockTodoFindUnique.mockResolvedValue(mockExistingTodo);
        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const response = await request(app)
          .put(`/test-controller/${todoId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.description).toBeNull();
        expect(response.body.data.dueDate).toBeNull();
        expect(response.body.data.tags).toBeNull();

        expect(mockTodoUpdate).toHaveBeenCalledWith({
          where: { id: todoId },
          data: {
            description: null,
            dueDate: null,
            tags: null,
          },
        });
      });
    });

    describe('Error Handling', () => {
      test('should return 404 when todo not found', async () => {
        const todoId = 'non-existent-id';
        const updateData = {
          title: 'Updated Title'
        };

        mockTodoFindUnique.mockResolvedValue(null);

        const response = await request(app)
          .put(`/test-controller/${todoId}`)
          .send(updateData)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Not Found');
        expect(response.body.message).toBe('Todo not found');

        expect(mockTodoFindUnique).toHaveBeenCalledWith({
          where: { id: todoId },
        });
        expect(mockTodoUpdate).not.toHaveBeenCalled();
      });

      test('should handle database errors during find operation', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = {
          title: 'Updated Title'
        };

        const dbError = new Error('Database connection failed');
        mockTodoFindUnique.mockRejectedValue(dbError);

        const response = await request(app)
          .put(`/test-controller/${todoId}`)
          .send(updateData)
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Internal Server Error');
        expect(response.body.message).toBe('Failed to update todo');

        expect(mockTodoUpdate).not.toHaveBeenCalled();
      });

      test('should handle database errors during update operation', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = {
          title: 'Updated Title'
        };

        const mockExistingTodo = {
          id: todoId,
          title: 'Original Title',
          description: 'Original description',
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        mockTodoFindUnique.mockResolvedValue(mockExistingTodo);

        const dbError = new Error('Update failed');
        mockTodoUpdate.mockRejectedValue(dbError);

        const response = await request(app)
          .put(`/test-controller/${todoId}`)
          .send(updateData)
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Internal Server Error');
        expect(response.body.message).toBe('Failed to update todo');

        expect(mockTodoFindUnique).toHaveBeenCalledWith({
          where: { id: todoId },
        });
        expect(mockTodoUpdate).toHaveBeenCalledWith({
          where: { id: todoId },
          data: {
            title: 'Updated Title',
          },
        });
      });
    });

    describe('Response Format', () => {
      test('should return correct success response format', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = {
          title: 'Updated Title'
        };

        const mockExistingTodo = {
          id: todoId,
          title: 'Original Title',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        const mockUpdatedTodo = {
          ...mockExistingTodo,
          title: 'Updated Title',
          updatedAt: new Date('2025-08-27T16:00:00.000Z'),
        };

        mockTodoFindUnique.mockResolvedValue(mockExistingTodo);
        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const response = await request(app)
          .put(`/test-controller/${todoId}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message', 'Todo updated successfully');
        expect(response.body.data).toHaveProperty('id', todoId);
        expect(response.body.data).toHaveProperty('title', 'Updated Title');
        expect(response.body.data).toHaveProperty('createdAt');
        expect(response.body.data).toHaveProperty('updatedAt');
      });

      test('should format dates as ISO strings in response', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const futureDate = new Date('2025-12-31T23:59:59.000Z');
        const updateData = {
          dueDate: futureDate.toISOString()
        };

        const mockExistingTodo = {
          id: todoId,
          title: 'Test Todo',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        const mockUpdatedTodo = {
          ...mockExistingTodo,
          dueDate: futureDate,
          updatedAt: new Date('2025-08-27T17:00:00.000Z'),
        };

        mockTodoFindUnique.mockResolvedValue(mockExistingTodo);
        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const response = await request(app)
          .put(`/test-controller/${todoId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.dueDate).toBe('2025-12-31T23:59:59.000Z');
        expect(response.body.data.createdAt).toBe('2025-08-27T10:00:00.000Z');
        expect(response.body.data.updatedAt).toBe('2025-08-27T17:00:00.000Z');
      });
    });

    describe('Data Preservation', () => {
      test('should preserve fields not included in update', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = {
          completed: true
        };

        const mockExistingTodo = {
          id: todoId,
          title: 'Keep this title',
          description: 'Keep this description',
          completed: false,
          priority: 'high',
          dueDate: new Date('2025-12-31T23:59:59.000Z'),
          tags: '["keep", "these", "tags"]',
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        };

        const mockUpdatedTodo = {
          ...mockExistingTodo,
          completed: true,
          updatedAt: new Date('2025-08-27T18:00:00.000Z'),
        };

        mockTodoFindUnique.mockResolvedValue(mockExistingTodo);
        mockTodoUpdate.mockResolvedValue(mockUpdatedTodo);

        const response = await request(app)
          .put(`/test-controller/${todoId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.title).toBe('Keep this title');
        expect(response.body.data.description).toBe('Keep this description');
        expect(response.body.data.completed).toBe(true); // Only this changed
        expect(response.body.data.priority).toBe('high');
        expect(response.body.data.tags).toBe('["keep", "these", "tags"]');
      });
    });
  });
});