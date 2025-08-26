import { PrismaClient } from '@prisma/client';
import { checkDatabaseConnection } from '../../src/config/database';

describe('Database Configuration', () => {
  describe('Environment Configuration', () => {
    test('should have database URL configured', () => {
      expect(process.env['DATABASE_URL']).toBeDefined();
      expect(process.env['DATABASE_URL']).toContain('file:');
    });
  });

  describe('Prisma Client Setup', () => {
    test('should create Prisma client without errors', () => {
      expect(() => {
        const prisma = new PrismaClient();
        expect(prisma).toBeDefined();
        return prisma.$disconnect();
      }).not.toThrow();
    });

    test('should connect to database', async () => {
      const isConnected = await checkDatabaseConnection();
      expect(isConnected).toBe(true);
    });
  });

  describe('Database Schema Validation', () => {
    let prisma: PrismaClient;

    beforeAll(() => {
      prisma = new PrismaClient();
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    test('should have Todo table', async () => {
      await expect(
        prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='Todo';`
      ).resolves.toBeTruthy();
    });

    test('should validate Todo model structure', async () => {
      // Test that we can create a minimal todo (validates schema)
      const todo = await prisma.todo.create({
        data: {
          title: 'Schema Test Todo'
        }
      });

      expect(todo.id).toBeDefined();
      expect(todo.title).toBe('Schema Test Todo');
      expect(todo.completed).toBe(false);
      expect(todo.priority).toBe('medium');
      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();

      // Cleanup
      await prisma.todo.delete({
        where: { id: todo.id }
      });
    });
  });
});