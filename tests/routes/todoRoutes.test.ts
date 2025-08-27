import request from 'supertest';
import express from 'express';
import { todoRouter } from '../../src/routes/todoRoutes';
import { prisma } from '../../src/config/database';

// Mock functions
const mockTodoCreate = jest.fn();
const mockTodoFindMany = jest.fn();
const mockTodoFindUnique = jest.fn();

// Mock the database module
jest.mock('../../src/config/database', () => ({
  prisma: {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

// Create test app
const app = express();
app.use(express.json());
app.use('/api/todos', todoRouter);

describe('Todo Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockedPrisma.todo.create = mockTodoCreate;
    mockedPrisma.todo.findMany = mockTodoFindMany;
    mockedPrisma.todo.findUnique = mockTodoFindUnique;
  });

  describe('GET /api/todos', () => {
    describe('Successful Retrieval', () => {
      test('should retrieve all todos successfully', async () => {
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
          .get('/api/todos')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Todos retrieved successfully');
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0].title).toBe('First Todo');
        expect(response.body.data[1].title).toBe('Second Todo');

        expect(mockTodoFindMany).toHaveBeenCalledWith({
          orderBy: [{ createdAt: 'desc' }]
        });
      });

      test('should return empty array when no todos exist', async () => {
        mockTodoFindMany.mockResolvedValue([]);

        const response = await request(app)
          .get('/api/todos')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Todos retrieved successfully');
        expect(response.body.data).toEqual([]);
        expect(response.body.data).toHaveLength(0);
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
          .get('/api/todos')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data[0]).toHaveProperty('id');
        expect(response.body.data[0]).toHaveProperty('title');
        expect(response.body.data[0]).toHaveProperty('createdAt');
        expect(response.body.data[0]).toHaveProperty('updatedAt');
      });

      test('should format dates as ISO strings in response', async () => {
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
          .get('/api/todos')
          .expect(200);

        expect(response.body.data[0].dueDate).toBe('2025-12-31T23:59:59.000Z');
        expect(response.body.data[0].createdAt).toBe('2025-08-27T10:00:00.000Z');
        expect(response.body.data[0].updatedAt).toBe('2025-08-27T11:00:00.000Z');
      });
    });

    describe('Database Errors', () => {
      test('should handle database connection errors', async () => {
        mockTodoFindMany.mockRejectedValue(new Error('Database connection failed'));

        const response = await request(app)
          .get('/api/todos')
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
          .get('/api/todos')
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Database Error');
        expect(response.body.message).toBe('Unable to retrieve todos due to database error');
      });
    });
  });

  describe('GET /api/todos/:id', () => {
    describe('Successful Retrieval', () => {
      test('should retrieve todo by valid ID', async () => {
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
          .get(`/api/todos/${todoId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Todo retrieved successfully');
        expect(response.body.data.id).toBe(todoId);
        expect(response.body.data.title).toBe('Test Todo');

        expect(mockTodoFindUnique).toHaveBeenCalledWith({
          where: { id: todoId }
        });
      });

      test('should retrieve todo with complete data including dates', async () => {
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
          .get(`/api/todos/${todoId}`)
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

      test('should return correct response structure', async () => {
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
          .get(`/api/todos/${todoId}`)
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

    describe('Not Found Handling', () => {
      test('should return 404 when todo does not exist', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        
        mockTodoFindUnique.mockResolvedValue(null);

        const response = await request(app)
          .get(`/api/todos/${todoId}`)
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
          .get(`/api/todos/${invalidId}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.message).toBe('Invalid todo ID format');
        expect(response.body.details).toContainEqual({
          field: 'id',
          message: 'Must be a valid UUID',
          value: invalidId
        });

        // Should not call database when ID is invalid
        expect(mockTodoFindUnique).not.toHaveBeenCalled();
      });

      test('should return 400 for non-UUID strings', async () => {
        const invalidIds = [
          '123',
          'abc-def-ghi',
          'not-a-uuid-at-all',
          '550e8400-e29b-41d4-a716',  // too short
          '550e8400-e29b-41d4-a716-446655440000-extra'  // too long
        ];

        for (const invalidId of invalidIds) {
          const response = await request(app)
            .get(`/api/todos/${invalidId}`)
            .expect(400);

          expect(response.body.success).toBe(false);
          expect(response.body.error).toBe('Validation Error');
          expect(response.body.message).toBe('Invalid todo ID format');
        }

        // Should not call database for any invalid IDs
        expect(mockTodoFindUnique).not.toHaveBeenCalled();
      });
    });

    describe('Database Errors', () => {
      test('should handle database connection errors', async () => {
        const todoId = '550e8400-e29b-41d4-a716-446655440000';
        
        mockTodoFindUnique.mockRejectedValue(new Error('Database connection failed'));

        const response = await request(app)
          .get(`/api/todos/${todoId}`)
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
          .get(`/api/todos/${todoId}`)
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Database Error');
        expect(response.body.message).toBe('Unable to retrieve todo due to database error');
      });
    });
  });

  describe('Route Integration', () => {
    test('should handle multiple requests correctly', async () => {
      // Setup mocks for both requests
      mockTodoFindMany.mockResolvedValue([
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'First Todo',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: new Date('2025-08-27T10:00:00.000Z'),
          updatedAt: new Date('2025-08-27T10:00:00.000Z'),
        }
      ]);

      mockTodoFindUnique.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'First Todo',
        description: null,
        completed: false,
        priority: 'medium',
        dueDate: null,
        tags: null,
        createdAt: new Date('2025-08-27T10:00:00.000Z'),
        updatedAt: new Date('2025-08-27T10:00:00.000Z'),
      });

      // Test GET all todos
      const getAllResponse = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(getAllResponse.body.success).toBe(true);
      expect(getAllResponse.body.data).toHaveLength(1);

      // Test GET specific todo
      const getByIdResponse = await request(app)
        .get('/api/todos/550e8400-e29b-41d4-a716-446655440000')
        .expect(200);

      expect(getByIdResponse.body.success).toBe(true);
      expect(getByIdResponse.body.data.id).toBe('550e8400-e29b-41d4-a716-446655440000');

      // Verify both database calls were made
      expect(mockTodoFindMany).toHaveBeenCalledTimes(1);
      expect(mockTodoFindUnique).toHaveBeenCalledTimes(1);
    });

    test('should maintain consistent error response format across routes', async () => {
      // Test error format for GET all todos
      mockTodoFindMany.mockRejectedValue(new Error('Database error'));

      const getAllErrorResponse = await request(app)
        .get('/api/todos')
        .expect(500);

      expect(getAllErrorResponse.body).toHaveProperty('success', false);
      expect(getAllErrorResponse.body).toHaveProperty('error');
      expect(getAllErrorResponse.body).toHaveProperty('message');
      expect(getAllErrorResponse.body).toHaveProperty('timestamp');

      // Reset mock and test error format for GET by ID
      jest.clearAllMocks();
      mockTodoFindUnique.mockRejectedValue(new Error('Database error'));

      const getByIdErrorResponse = await request(app)
        .get('/api/todos/550e8400-e29b-41d4-a716-446655440000')
        .expect(500);

      expect(getByIdErrorResponse.body).toHaveProperty('success', false);
      expect(getByIdErrorResponse.body).toHaveProperty('error');
      expect(getByIdErrorResponse.body).toHaveProperty('message');
      expect(getByIdErrorResponse.body).toHaveProperty('timestamp');
    });
  });
});