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
          .expect(400);

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

  describe('GET /api/todos', () => {
    describe('Successful Retrieval', () => {
      test('should retrieve all todos when they exist', async () => {
        // Create test todos first
        const todo1Data = { title: 'First Integration Todo', priority: 'high' };
        const todo2Data = { title: 'Second Integration Todo', description: 'Test description', priority: 'low' };

        await request(app)
          .post('/api/todos')
          .send(todo1Data)
          .expect(201);

        await request(app)
          .post('/api/todos')
          .send(todo2Data)
          .expect(201);

        // Now retrieve all todos
        const response = await request(app)
          .get('/api/todos')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Todos retrieved successfully');
        expect(response.body.data).toHaveLength(2);
        expect(Array.isArray(response.body.data)).toBe(true);

        // Todos should be ordered by creation date (newest first)
        expect(response.body.data[0].title).toBe('Second Integration Todo');
        expect(response.body.data[1].title).toBe('First Integration Todo');

        // Verify all properties are present and correctly formatted
        expect(response.body.data[0]).toMatchObject({
          id: expect.any(String),
          title: 'Second Integration Todo',
          description: 'Test description',
          completed: false,
          priority: 'low',
          dueDate: null,
          tags: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });

      test('should return empty array when no todos exist', async () => {
        const response = await request(app)
          .get('/api/todos')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Todos retrieved successfully');
        expect(response.body.data).toEqual([]);
        expect(response.body.data).toHaveLength(0);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      test('should format response structure consistently', async () => {
        // Create a todo with all fields
        const todoData = {
          title: 'Complete Todo',
          description: 'Full description',
          completed: true,
          priority: 'medium',
          dueDate: '2025-12-31T23:59:59.000Z',
          tags: '["integration", "test"]'
        };

        await request(app)
          .post('/api/todos')
          .send(todoData)
          .expect(201);

        const response = await request(app)
          .get('/api/todos')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message');
        expect(response.body.data[0]).toHaveProperty('id');
        expect(response.body.data[0]).toHaveProperty('title');
        expect(response.body.data[0]).toHaveProperty('description');
        expect(response.body.data[0]).toHaveProperty('completed');
        expect(response.body.data[0]).toHaveProperty('priority');
        expect(response.body.data[0]).toHaveProperty('dueDate');
        expect(response.body.data[0]).toHaveProperty('tags');
        expect(response.body.data[0]).toHaveProperty('createdAt');
        expect(response.body.data[0]).toHaveProperty('updatedAt');

        // Verify dates are ISO strings
        expect(response.body.data[0].dueDate).toBe('2025-12-31T23:59:59.000Z');
        expect(response.body.data[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        expect(response.body.data[0].updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });
  });

  describe('GET /api/todos/:id', () => {
    describe('Successful Retrieval', () => {
      test('should retrieve specific todo by valid ID', async () => {
        // Create a test todo first
        const todoData = {
          title: 'Specific Todo Test',
          description: 'Testing retrieval by ID',
          priority: 'high',
          dueDate: '2025-09-15T14:30:00.000Z',
          tags: '["specific", "test"]'
        };

        const createResponse = await request(app)
          .post('/api/todos')
          .send(todoData)
          .expect(201);

        const todoId = createResponse.body.data.id;

        // Now retrieve the specific todo
        const response = await request(app)
          .get(`/api/todos/${todoId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Todo retrieved successfully');
        expect(response.body.data).toMatchObject({
          id: todoId,
          title: 'Specific Todo Test',
          description: 'Testing retrieval by ID',
          completed: false,
          priority: 'high',
          dueDate: '2025-09-15T14:30:00.000Z',
          tags: '["specific", "test"]',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });

        // Verify UUID format
        expect(todoId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      });

      test('should retrieve todo with minimal data', async () => {
        // Create a minimal todo
        const todoData = { title: 'Minimal Todo' };

        const createResponse = await request(app)
          .post('/api/todos')
          .send(todoData)
          .expect(201);

        const todoId = createResponse.body.data.id;

        const response = await request(app)
          .get(`/api/todos/${todoId}`)
          .expect(200);

        expect(response.body.data).toMatchObject({
          id: todoId,
          title: 'Minimal Todo',
          description: null,
          completed: false,
          priority: 'medium',
          dueDate: null,
          tags: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
    });

    describe('Not Found Handling', () => {
      test('should return 404 for non-existent valid UUID', async () => {
        const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';

        const response = await request(app)
          .get(`/api/todos/${nonExistentId}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Not Found');
        expect(response.body.message).toBe(`Todo with ID ${nonExistentId} not found`);
        expect(response.body.timestamp).toBeDefined();
      });

      test('should return 404 even after todo deletion', async () => {
        // Create and then delete a todo
        const todoData = { title: 'Temporary Todo' };

        const createResponse = await request(app)
          .post('/api/todos')
          .send(todoData)
          .expect(201);

        const todoId = createResponse.body.data.id;

        // Manually delete from database
        await prisma.todo.delete({ where: { id: todoId } });

        // Try to retrieve deleted todo
        const response = await request(app)
          .get(`/api/todos/${todoId}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Not Found');
      });
    });

    describe('ID Validation', () => {
      test('should return 400 for invalid UUID format', async () => {
        const invalidIds = [
          'invalid-uuid',
          '123',
          'not-a-uuid-at-all',
          '550e8400-e29b-41d4-a716', // too short
          '550e8400-e29b-41d4-a716-446655440000-extra', // too long
          'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' // wrong format
        ];

        for (const invalidId of invalidIds) {
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
          expect(response.body.timestamp).toBeDefined();
        }
      });
    });
  });

  describe('Response Format Consistency', () => {
    test('should maintain consistent success response format across all endpoints', async () => {
      // Create a todo via POST
      const todoData = { title: 'Consistency Test Todo' };
      
      const createResponse = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      const todoId = createResponse.body.data.id;

      // GET all todos
      const getAllResponse = await request(app)
        .get('/api/todos')
        .expect(200);

      // GET specific todo
      const getByIdResponse = await request(app)
        .get(`/api/todos/${todoId}`)
        .expect(200);

      // Verify all responses have consistent structure
      const responses = [createResponse.body, getAllResponse.body, getByIdResponse.body];
      
      responses.forEach(response => {
        expect(response).toHaveProperty('success', true);
        expect(response).toHaveProperty('data');
        expect(response).toHaveProperty('message');
        expect(typeof response.message).toBe('string');
      });

      // Verify individual todo objects have same structure across endpoints
      const createdTodo = createResponse.body.data;
      const allTodos = getAllResponse.body.data;
      const specificTodo = getByIdResponse.body.data;

      expect(allTodos[0]).toEqual(createdTodo);
      expect(specificTodo).toEqual(createdTodo);
    });

    test('should maintain consistent error response format across all endpoints', async () => {
      // Test GET all todos error (simulate by using wrong endpoint)
      const getAllErrorResponse = await request(app)
        .get('/api/todos/invalid-endpoint-path')
        .expect(400);

      // Test GET by ID error
      const getByIdErrorResponse = await request(app)
        .get('/api/todos/invalid-id')
        .expect(400);

      // Test 404 error
      const notFoundResponse = await request(app)
        .get('/api/todos/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);

      const errorResponses = [getAllErrorResponse.body, getByIdErrorResponse.body, notFoundResponse.body];

      errorResponses.forEach(response => {
        expect(response).toHaveProperty('success', false);
        expect(response).toHaveProperty('error');
        expect(response).toHaveProperty('timestamp');
        expect(typeof response.error).toBe('string');
        expect(typeof response.timestamp).toBe('string');
        expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });
  });

  describe('Integration Workflow', () => {
    test('should support complete CRUD read workflow', async () => {
      // Step 1: Create multiple todos
      const todos = [
        { title: 'First Workflow Todo', priority: 'high' },
        { title: 'Second Workflow Todo', description: 'Workflow description', priority: 'low' },
        { title: 'Third Workflow Todo', completed: true, priority: 'medium' }
      ];

      const createdTodos = [];
      for (const todoData of todos) {
        const response = await request(app)
          .post('/api/todos')
          .send(todoData)
          .expect(201);
        createdTodos.push(response.body.data);
      }

      // Step 2: Retrieve all todos and verify count
      const getAllResponse = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(getAllResponse.body.data).toHaveLength(3);
      expect(getAllResponse.body.success).toBe(true);

      // Step 3: Retrieve each todo individually and verify data integrity
      for (const createdTodo of createdTodos) {
        const getByIdResponse = await request(app)
          .get(`/api/todos/${createdTodo.id}`)
          .expect(200);

        expect(getByIdResponse.body.success).toBe(true);
        expect(getByIdResponse.body.data).toEqual(createdTodo);
      }

      // Step 4: Verify todos are properly ordered (newest first)
      const orderedTodos = getAllResponse.body.data;
      expect(orderedTodos[0].title).toBe('Third Workflow Todo');
      expect(orderedTodos[1].title).toBe('Second Workflow Todo');
      expect(orderedTodos[2].title).toBe('First Workflow Todo');
    });
  });

  describe('PUT /api/todos/:id', () => {
    let testTodo: any;

    beforeEach(async () => {
      // Create a test todo before each test
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      testTodo = await prisma.todo.create({
        data: {
          title: 'Original Title',
          description: 'Original description',
          completed: false,
          priority: 'medium',
          dueDate: futureDate,
          tags: '["original", "test"]',
        },
      });
    });

    describe('Successful Updates', () => {
      test('should update todo with partial data - title only', async () => {
        const updateData = {
          title: 'Updated Title'
        };

        const response = await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Todo updated successfully');
        expect(response.body.data).toMatchObject({
          id: testTodo.id,
          title: 'Updated Title',
          description: 'Original description', // Should remain unchanged
          completed: false, // Should remain unchanged
          priority: 'medium', // Should remain unchanged
          tags: '["original", "test"]', // Should remain unchanged
        });

        // Verify the update was persisted in the database
        const updatedTodo = await prisma.todo.findUnique({
          where: { id: testTodo.id }
        });

        expect(updatedTodo).not.toBeNull();
        expect(updatedTodo!.title).toBe('Updated Title');
        expect(updatedTodo!.description).toBe('Original description');
      });

      test('should update multiple fields at once', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);

        const updateData = {
          title: 'Completely Updated Title',
          description: 'Completely updated description',
          completed: true,
          priority: 'high',
          dueDate: futureDate.toISOString(),
          tags: '["updated", "integration", "test"]'
        };

        const response = await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          id: testTodo.id,
          title: 'Completely Updated Title',
          description: 'Completely updated description',
          completed: true,
          priority: 'high',
          dueDate: futureDate.toISOString(),
          tags: '["updated", "integration", "test"]',
        });

        // Verify all changes were persisted
        const updatedTodo = await prisma.todo.findUnique({
          where: { id: testTodo.id }
        });

        expect(updatedTodo!.completed).toBe(true);
        expect(updatedTodo!.priority).toBe('high');
        expect(updatedTodo!.tags).toBe('["updated", "integration", "test"]');
      });

      test('should update fields to null values', async () => {
        const updateData = {
          description: null,
          dueDate: null,
          tags: null
        };

        const response = await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          id: testTodo.id,
          title: 'Original Title', // Should remain unchanged
          description: null,
          dueDate: null,
          tags: null,
        });

        // Verify null values were persisted
        const updatedTodo = await prisma.todo.findUnique({
          where: { id: testTodo.id }
        });

        expect(updatedTodo!.description).toBeNull();
        expect(updatedTodo!.dueDate).toBeNull();
        expect(updatedTodo!.tags).toBeNull();
      });

      test('should handle completion status toggle', async () => {
        // First update: mark as completed
        await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send({ completed: true })
          .expect(200);

        let updatedTodo = await prisma.todo.findUnique({
          where: { id: testTodo.id }
        });
        expect(updatedTodo!.completed).toBe(true);

        // Second update: mark as not completed
        await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send({ completed: false })
          .expect(200);

        updatedTodo = await prisma.todo.findUnique({
          where: { id: testTodo.id }
        });
        expect(updatedTodo!.completed).toBe(false);
      });

      test('should update priority values', async () => {
        const priorities = ['low', 'medium', 'high'];

        for (const priority of priorities) {
          const response = await request(app)
            .put(`/api/todos/${testTodo.id}`)
            .send({ priority })
            .expect(200);

          expect(response.body.data.priority).toBe(priority);

          const updatedTodo = await prisma.todo.findUnique({
            where: { id: testTodo.id }
          });
          expect(updatedTodo!.priority).toBe(priority);
        }
      });
    });

    describe('Validation Errors', () => {
      test('should return 400 for empty request body', async () => {
        const response = await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: '',
            message: expect.stringContaining('At least one field must be provided')
          })
        );
      });

      test('should return 400 for invalid title', async () => {
        const updateData = {
          title: '' // Empty title
        };

        const response = await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'title',
            message: expect.stringContaining('between 1 and 255 characters')
          })
        );
      });

      test('should return 400 for invalid priority', async () => {
        const updateData = {
          priority: 'urgent' // Invalid priority
        };

        const response = await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'priority',
            message: expect.stringContaining('low, medium, high')
          })
        );
      });

      test('should return 400 for invalid due date', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);

        const updateData = {
          dueDate: pastDate.toISOString()
        };

        const response = await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'dueDate',
            message: expect.stringContaining('future date')
          })
        );
      });

      test('should return 400 for invalid completed value', async () => {
        const updateData = {
          completed: 'true' // String instead of boolean
        };

        const response = await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'completed',
            message: expect.stringContaining('boolean')
          })
        );
      });

      test('should return 400 for invalid tags format', async () => {
        const updateData = {
          tags: 'not-json'
        };

        const response = await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'tags',
            message: expect.stringContaining('valid JSON')
          })
        );
      });

      test('should return 400 for invalid UUID format', async () => {
        const updateData = {
          title: 'Updated Title'
        };

        const response = await request(app)
          .put('/api/todos/invalid-uuid')
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation Error');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'id',
            message: expect.stringContaining('valid UUID')
          })
        );
      });
    });

    describe('Not Found Errors', () => {
      test('should return 404 when todo does not exist', async () => {
        const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
        const updateData = {
          title: 'Updated Title'
        };

        const response = await request(app)
          .put(`/api/todos/${nonExistentId}`)
          .send(updateData)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Not Found');
        expect(response.body.message).toBe('Todo not found');
      });
    });

    describe('Response Format Validation', () => {
      test('should return consistent success response format', async () => {
        const updateData = {
          title: 'Format Test Title'
        };

        const response = await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message', 'Todo updated successfully');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('title');
        expect(response.body.data).toHaveProperty('createdAt');
        expect(response.body.data).toHaveProperty('updatedAt');

        // Ensure dates are properly formatted as ISO strings
        expect(typeof response.body.data.createdAt).toBe('string');
        expect(typeof response.body.data.updatedAt).toBe('string');
        expect(response.body.data.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        expect(response.body.data.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });

      test('should update the updatedAt timestamp', async () => {
        const originalUpdatedAt = testTodo.updatedAt;
        
        // Wait a small amount to ensure timestamp difference
        await new Promise(resolve => setTimeout(resolve, 10));

        const updateData = {
          title: 'Timestamp Test Title'
        };

        const response = await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send(updateData)
          .expect(200);

        const newUpdatedAt = new Date(response.body.data.updatedAt);
        expect(newUpdatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

        // Verify in database
        const updatedTodo = await prisma.todo.findUnique({
          where: { id: testTodo.id }
        });
        expect(updatedTodo!.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      });
    });

    describe('Business Logic Validation', () => {
      test('should preserve createdAt timestamp during update', async () => {
        const originalCreatedAt = testTodo.createdAt;

        const updateData = {
          title: 'CreatedAt Preservation Test'
        };

        const response = await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.createdAt).toBe(originalCreatedAt.toISOString());

        // Verify in database
        const updatedTodo = await prisma.todo.findUnique({
          where: { id: testTodo.id }
        });
        expect(updatedTodo!.createdAt.getTime()).toBe(originalCreatedAt.getTime());
      });

      test('should handle due date updates correctly', async () => {
        const newDueDate = new Date();
        newDueDate.setDate(newDueDate.getDate() + 14);

        const updateData = {
          dueDate: newDueDate.toISOString()
        };

        const response = await request(app)
          .put(`/api/todos/${testTodo.id}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.dueDate).toBe(newDueDate.toISOString());

        // Verify in database
        const updatedTodo = await prisma.todo.findUnique({
          where: { id: testTodo.id }
        });
        expect(updatedTodo!.dueDate!.toISOString()).toBe(newDueDate.toISOString());
      });
    });
  });
});