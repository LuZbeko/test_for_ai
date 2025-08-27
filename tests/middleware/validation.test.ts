import request from 'supertest';
import express, { Request, Response } from 'express';
import { validateTodoCreation } from '../../src/middleware/validation';
import { handleValidationErrors } from '../../src/middleware/errorHandler';

const app = express();
app.use(express.json());

// Test endpoint that uses validation middleware
app.post('/test-validation', validateTodoCreation, handleValidationErrors, (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Validation passed' });
});

describe('Todo Creation Validation Middleware', () => {
  describe('Valid Input Cases', () => {
    test('should pass with minimal valid data (title only)', async () => {
      const validTodo = {
        title: 'Test Todo'
      };

      const response = await request(app)
        .post('/test-validation')
        .send(validTodo)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should pass with complete valid data', async () => {
      const validTodo = {
        title: 'Complete project documentation',
        description: 'Write comprehensive API documentation for the todo management system',
        completed: false,
        priority: 'high',
        dueDate: '2025-09-01T10:00:00.000Z',
        tags: '["work", "documentation", "urgent"]'
      };

      const response = await request(app)
        .post('/test-validation')
        .send(validTodo)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should pass with valid priority values', async () => {
      const priorities = ['low', 'medium', 'high'];
      
      for (const priority of priorities) {
        const validTodo = {
          title: 'Test Todo',
          priority
        };

        const response = await request(app)
          .post('/test-validation')
          .send(validTodo)
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });

    test('should pass with future due date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const validTodo = {
        title: 'Future task',
        dueDate: futureDate.toISOString()
      };

      const response = await request(app)
        .post('/test-validation')
        .send(validTodo)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Invalid Input Cases - Required Fields', () => {
    test('should fail when title is missing', async () => {
      const invalidTodo = {
        description: 'A todo without a title'
      };

      const response = await request(app)
        .post('/test-validation')
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

    test('should fail when title is empty string', async () => {
      const invalidTodo = {
        title: ''
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidTodo)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'title',
          message: expect.stringContaining('required')
        })
      );
    });

    test('should fail when title is only whitespace', async () => {
      const invalidTodo = {
        title: '   '
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidTodo)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Invalid Input Cases - Field Validation', () => {
    test('should fail when title exceeds 255 characters', async () => {
      const invalidTodo = {
        title: 'a'.repeat(256)
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidTodo)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'title',
          message: expect.stringContaining('255 characters')
        })
      );
    });

    test('should fail when description exceeds 1000 characters', async () => {
      const invalidTodo = {
        title: 'Valid title',
        description: 'a'.repeat(1001)
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidTodo)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'description',
          message: expect.stringContaining('1000 characters')
        })
      );
    });

    test('should fail when priority is invalid', async () => {
      const invalidTodo = {
        title: 'Valid title',
        priority: 'urgent'
      };

      const response = await request(app)
        .post('/test-validation')
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

    test('should fail when completed is not a boolean', async () => {
      const invalidTodo = {
        title: 'Valid title',
        completed: 'false'
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidTodo)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'completed',
          message: expect.stringContaining('boolean')
        })
      );
    });

    test('should fail when dueDate is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const invalidTodo = {
        title: 'Valid title',
        dueDate: pastDate.toISOString()
      };

      const response = await request(app)
        .post('/test-validation')
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

    test('should fail when dueDate is invalid format', async () => {
      const invalidTodo = {
        title: 'Valid title',
        dueDate: 'not-a-date'
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidTodo)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'dueDate',
          message: expect.stringContaining('valid date')
        })
      );
    });

    test('should fail when tags is not valid JSON', async () => {
      const invalidTodo = {
        title: 'Valid title',
        tags: 'not-json'
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidTodo)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'tags',
          message: expect.stringContaining('valid JSON')
        })
      );
    });
  });

  describe('Multiple Validation Errors', () => {
    test('should return all validation errors when multiple fields are invalid', async () => {
      const invalidTodo = {
        title: '',
        description: 'a'.repeat(1001),
        priority: 'invalid',
        completed: 'not-boolean',
        dueDate: 'invalid-date',
        tags: 'not-json'
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidTodo)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
      expect(response.body.details.length).toBeGreaterThanOrEqual(6);
      
      const fields = response.body.details.map((detail: any) => detail.field);
      expect(fields).toContain('title');
      expect(fields).toContain('description');
      expect(fields).toContain('priority');
      expect(fields).toContain('completed');
      expect(fields).toContain('dueDate');
      expect(fields).toContain('tags');
    });
  });

  describe('Response Format', () => {
    test('should return consistent error response format', async () => {
      const invalidTodo = {
        title: ''
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidTodo)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body).toHaveProperty('details');
      expect(response.body).toHaveProperty('timestamp');
      
      expect(Array.isArray(response.body.details)).toBe(true);
      expect(response.body.details[0]).toHaveProperty('field');
      expect(response.body.details[0]).toHaveProperty('message');
      expect(response.body.details[0]).toHaveProperty('value');
    });

    test('should include timestamp in error response', async () => {
      const invalidTodo = {
        title: ''
      };

      const response = await request(app)
        .post('/test-validation')
        .send(invalidTodo)
        .expect(400);

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});