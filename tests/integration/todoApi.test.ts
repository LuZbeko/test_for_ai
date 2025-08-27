import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';

/**
 * Integration tests for the Todo API endpoints
 * These tests run against the actual database and full application stack
 */

describe('Todo API Integration Tests', () => {
  beforeAll(async () => {
    // Ensure database connection is established
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up and close database connection
    await prisma.todo.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.todo.deleteMany();
  });

  describe('POST /api/todos', () => {
    describe('Successful Creation', () => {
      test('should create a todo with minimal data', async () => {
        const todoData = {
          title: 'Integration test todo'
        };

        const response = await request(app)
          .post('/api/todos')
          .send(todoData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Todo created successfully');
        expect(response.body.data).toMatchObject({
          id: expect.any(String),
          title: 'Integration test todo',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });

        // Verify the todo was actually created in the database
        const createdTodo = await prisma.todo.findUnique({
          where: { id: response.body.data.id }
        });

        expect(createdTodo).not.toBeNull();
        expect(createdTodo!.title).toBe('Integration test todo');
      });

      test('should create a todo with complete data', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);

        const todoData = {
          title: 'Complete integration test',
          description: 'Test creating a todo with all fields populated',
          completed: false,
          priority: 'high',
          dueDate: futureDate.toISOString(),
          tags: '["testing", "integration", "api"]'
        };

        const response = await request(app)
          .post('/api/todos')
          .send(todoData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          title: 'Complete integration test',
          description: 'Test creating a todo with all fields populated',
          completed: false,
          priority: 'high',
          dueDate: futureDate.toISOString(),
          tags: '["testing", "integration", "api"]',
        });

        // Verify in database
        const createdTodo = await prisma.todo.findUnique({
          where: { id: response.body.data.id }
        });

        expect(createdTodo).not.toBeNull();
        expect(createdTodo!.priority).toBe('high');
        expect(createdTodo!.tags).toBe('["testing", "integration", "api"]');
      });

      test('should generate unique IDs for multiple todos', async () => {
        const todoData1 = { title: 'First todo' };
        const todoData2 = { title: 'Second todo' };

        const response1 = await request(app)
          .post('/api/todos')
          .send(todoData1)
          .expect(201);

        const response2 = await request(app)
          .post('/api/todos')
          .send(todoData2)
          .expect(201);

        expect(response1.body.data.id).not.toBe(response2.body.data.id);
        expect(response1.body.data.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
        expect(response2.body.data.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
      });
    });

    describe('Validation Errors', () => {
      test('should return 400 for missing title', async () => {
        const invalidTodo = {
          description: 'Todo without title'
        };

        const response = await request(app)
          .post('/api/todos')
          .send(invalidTodo)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'title',
            message: expect.stringContaining('required')
          })
        );
      });

      test('should return 400 for invalid priority', async () => {
        const invalidTodo = {
          title: 'Valid title',
          priority: 'urgent'
        };

        const response = await request(app)
          .post('/api/todos')
          .send(invalidTodo)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'priority',
            message: expect.stringContaining('low, medium, high')
          })
        );
      });

      test('should return 400 for past due date', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);

        const invalidTodo = {
          title: 'Valid title',
          dueDate: pastDate.toISOString()
        };

        const response = await request(app)
          .post('/api/todos')
          .send(invalidTodo)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'dueDate',
            message: expect.stringContaining('future date')
          })
        );
      });

      test('should return 400 for invalid JSON tags', async () => {
        const invalidTodo = {
          title: 'Valid title',
          tags: 'not-valid-json'
        };

        const response = await request(app)
          .post('/api/todos')
          .send(invalidTodo)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'tags',
            message: expect.stringContaining('JSON')
          })
        );
      });
    });

    describe('Business Logic Validation', () => {
      test('should handle controller-level due date validation', async () => {
        // Use a date that will definitely be in the past when controller processes it
        const pastDate = new Date();
        pastDate.setMinutes(pastDate.getMinutes() - 1); // 1 minute ago

        const todoData = {
          title: 'Test todo',
          dueDate: pastDate.toISOString()
        };

        const response = await request(app)
          .post('/api/todos')
          .send(todoData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'dueDate',
            message: 'Due date must be a future date'
          })
        );
      });

      test('should validate tags at controller level', async () => {
        const invalidTodo = {
          title: 'Valid title',
          tags: '["valid", "but", "too", "many", "tags", "here", "exceeds", "ten", "limit", "error", "fail"]'
        };

        const response = await request(app)
          .post('/api/todos')
          .send(invalidTodo)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'tags',
            message: 'Maximum 10 tags allowed'
          })
        );
      });
    });

    describe('Error Handling', () => {
      test('should handle malformed JSON', async () => {
        const response = await request(app)
          .post('/api/todos')
          .set('Content-Type', 'application/json')
          .send('{ invalid json }')
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });

      test('should handle large payloads gracefully', async () => {
        const largeTodo = {
          title: 'a'.repeat(1000), // Exceeds 255 character limit
          description: 'b'.repeat(2000) // Exceeds 1000 character limit
        };

        const response = await request(app)
          .post('/api/todos')
          .send(largeTodo)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
      });
    });
  });

  describe('API Structure', () => {
    test('should have consistent response format for success', async () => {
      const todoData = { title: 'Test todo' };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    test('should have consistent response format for errors', async () => {
      const invalidTodo = { title: '' };

      const response = await request(app)
        .post('/api/todos')
        .send(invalidTodo)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should return 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('Database Persistence', () => {
    test('should persist todo data correctly', async () => {
      const todoData = {
        title: 'Persistent todo',
        description: 'This should be saved to database',
        priority: 'low',
        tags: '["persistence", "test"]'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      // Verify data persisted correctly
      const savedTodo = await prisma.todo.findUnique({
        where: { id: response.body.data.id }
      });

      expect(savedTodo).not.toBeNull();
      expect(savedTodo!.title).toBe('Persistent todo');
      expect(savedTodo!.description).toBe('This should be saved to database');
      expect(savedTodo!.priority).toBe('low');
      expect(savedTodo!.tags).toBe('["persistence", "test"]');
      expect(savedTodo!.completed).toBe(false);
    });

    test('should handle database constraints properly', async () => {
      const todoData = { title: 'Test todo' };

      // Create first todo
      const response1 = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      // Create second todo with same title (should succeed)
      const response2 = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      expect(response1.body.data.id).not.toBe(response2.body.data.id);
    });
  });
});