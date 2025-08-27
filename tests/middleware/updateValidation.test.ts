import request from 'supertest';
import express, { Request, Response } from 'express';
import { validateTodoUpdate, validateUuidParam } from '../../src/middleware/validation';
import { handleValidationErrors } from '../../src/middleware/errorHandler';

const app = express();
app.use(express.json());

// Test endpoint that uses update validation middleware
app.put(
  '/test-update-validation/:id',
  validateUuidParam,
  validateTodoUpdate,
  handleValidationErrors,
  (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Validation passed' });
  }
);

describe('Todo Update Validation Middleware', () => {
  describe('Valid Partial Update Cases', () => {
    test('should pass when updating only title', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should pass when updating only description', async () => {
      const updateData = {
        description: 'Updated description'
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should pass when updating only completed status', async () => {
      const updateData = {
        completed: true
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should pass when updating only priority', async () => {
      const updateData = {
        priority: 'high'
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should pass when updating only due date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const updateData = {
        dueDate: futureDate.toISOString()
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should pass when updating only tags', async () => {
      const updateData = {
        tags: '["updated", "tags"]'
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should pass when updating multiple fields', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);

      const updateData = {
        title: 'Updated Title',
        description: 'Updated comprehensive description',
        completed: true,
        priority: 'low',
        dueDate: futureDate.toISOString(),
        tags: '["work", "updated"]'
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should pass when setting nullable fields to null', async () => {
      const updateData = {
        description: null,
        dueDate: null,
        tags: null
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should pass with all valid priority values', async () => {
      const priorities = ['low', 'medium', 'high'];
      
      for (const priority of priorities) {
        const updateData = {
          priority
        };

        const response = await request(app)
          .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Invalid Update Cases - Empty Request', () => {
    test('should fail when request body is empty', async () => {
      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
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

    test('should fail when request body contains only unknown fields', async () => {
      const updateData = {
        unknownField: 'value',
        anotherUnknown: 123
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('Invalid Update Cases - Field Validation', () => {
    test('should fail when title is empty string', async () => {
      const updateData = {
        title: ''
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'title',
          message: expect.stringContaining('between 1 and 255 characters')
        })
      );
    });

    test('should fail when title is only whitespace', async () => {
      const updateData = {
        title: '   '
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'title',
          message: expect.stringContaining('whitespace')
        })
      );
    });

    test('should fail when title exceeds 255 characters', async () => {
      const updateData = {
        title: 'a'.repeat(256)
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
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
      const updateData = {
        description: 'a'.repeat(1001)
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'description',
          message: expect.stringContaining('1000 characters')
        })
      );
    });

    test('should fail when completed is not a boolean', async () => {
      const updateData = {
        completed: 'true'
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'completed',
          message: expect.stringContaining('boolean')
        })
      );
    });

    test('should fail when priority is invalid', async () => {
      const updateData = {
        priority: 'urgent'
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'priority',
          message: expect.stringContaining('low, medium, high')
        })
      );
    });

    test('should fail when due date is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const updateData = {
        dueDate: pastDate.toISOString()
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'dueDate',
          message: expect.stringContaining('future date')
        })
      );
    });

    test('should fail when due date is invalid format', async () => {
      const updateData = {
        dueDate: 'not-a-date'
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'dueDate',
          message: expect.stringContaining('valid date')
        })
      );
    });

    test('should fail when due date is more than 10 years in the future', async () => {
      const farFutureDate = new Date();
      farFutureDate.setFullYear(farFutureDate.getFullYear() + 11);

      const updateData = {
        dueDate: farFutureDate.toISOString()
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'dueDate',
          message: expect.stringContaining('10 years')
        })
      );
    });

    test('should fail when tags is not valid JSON', async () => {
      const updateData = {
        tags: 'not-json'
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'tags',
          message: expect.stringContaining('valid JSON')
        })
      );
    });

    test('should fail when tags has more than 10 items', async () => {
      const tooManyTags = Array(11).fill(0).map((_, i) => `tag${i}`);
      const updateData = {
        tags: JSON.stringify(tooManyTags)
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'tags',
          message: expect.stringContaining('Maximum 10 tags')
        })
      );
    });

    test('should fail when a tag exceeds 50 characters', async () => {
      const updateData = {
        tags: JSON.stringify(['valid', 'a'.repeat(51)])
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'tags',
          message: expect.stringContaining('50 characters')
        })
      );
    });

    test('should fail when tags contains non-string values', async () => {
      const updateData = {
        tags: JSON.stringify(['valid', 123, true])
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'tags',
          message: expect.stringContaining('must be a string')
        })
      );
    });
  });

  describe('UUID Parameter Validation', () => {
    test('should fail when ID is not a valid UUID', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put('/test-update-validation/not-a-uuid')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'id',
          message: expect.stringContaining('valid UUID')
        })
      );
    });

    test('should fail when ID parameter is missing', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      await request(app)
        .put('/test-update-validation/')
        .send(updateData)
        .expect(404); // Express returns 404 for missing route
    });

    test('should pass with valid UUID formats', async () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      ];

      for (const uuid of validUuids) {
        const updateData = {
          title: 'Updated Title'
        };

        const response = await request(app)
          .put(`/test-update-validation/${uuid}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Multiple Validation Errors', () => {
    test('should return all validation errors when multiple fields are invalid', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const updateData = {
        title: '',
        description: 'a'.repeat(1001),
        completed: 'not-boolean',
        priority: 'invalid',
        dueDate: pastDate.toISOString(),
        tags: 'not-json'
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
      expect(response.body.details.length).toBeGreaterThanOrEqual(6);
      
      const fields = response.body.details.map((detail: any) => detail.field);
      expect(fields).toContain('title');
      expect(fields).toContain('description');
      expect(fields).toContain('completed');
      expect(fields).toContain('priority');
      expect(fields).toContain('dueDate');
      expect(fields).toContain('tags');
    });
  });

  describe('Edge Cases', () => {
    test('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      // Express will return a JSON parsing error
      expect(response.status).toBe(400);
    });

    test('should trim string fields before validation', async () => {
      const updateData = {
        title: '  Trimmed Title  ',
        description: '  Trimmed description  '
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should handle different data types for boolean field', async () => {
      const invalidBooleans = [1, 0, 'yes', 'no', null, [], {}];

      for (const value of invalidBooleans) {
        const updateData = {
          completed: value
        };

        const response = await request(app)
          .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
          .send(updateData);

        if (value === null) {
          // null is allowed for nullable fields
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(400);
          expect(response.body.success).toBe(false);
        }
      }
    });
  });

  describe('Response Format Consistency', () => {
    test('should return consistent error response format', async () => {
      const updateData = {
        title: ''
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
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
      const updateData = {
        title: ''
      };

      const response = await request(app)
        .put('/test-update-validation/123e4567-e89b-12d3-a456-426614174000')
        .send(updateData)
        .expect(400);

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});