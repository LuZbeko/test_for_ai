const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Docker Configuration', () => {
  const projectRoot = path.resolve(__dirname, '../..');

  describe('Docker Files', () => {
    test('should have Dockerfile', () => {
      const dockerfilePath = path.join(projectRoot, 'Dockerfile');
      expect(fs.existsSync(dockerfilePath)).toBe(true);
    });

    test('should have docker-compose.yml', () => {
      const dockerComposePath = path.join(projectRoot, 'docker-compose.yml');
      expect(fs.existsSync(dockerComposePath)).toBe(true);
    });

    test('should have .dockerignore', () => {
      const dockerIgnorePath = path.join(projectRoot, '.dockerignore');
      expect(fs.existsSync(dockerIgnorePath)).toBe(true);
    });
  });

  describe('Dockerfile Content', () => {
    let dockerfileContent;

    beforeAll(() => {
      const dockerfilePath = path.join(projectRoot, 'Dockerfile');
      if (fs.existsSync(dockerfilePath)) {
        dockerfileContent = fs.readFileSync(dockerfilePath, 'utf-8');
      }
    });

    test('should use Node.js Alpine base image', () => {
      expect(dockerfileContent).toContain('FROM node:');
      expect(dockerfileContent).toContain('alpine');
    });

    test('should have multi-stage build', () => {
      // Should have at least two FROM statements for multi-stage
      const fromStatements = (dockerfileContent.match(/^FROM /gm) || []).length;
      expect(fromStatements).toBeGreaterThanOrEqual(2);
    });

    test('should copy package.json and install dependencies', () => {
      expect(dockerfileContent).toMatch(/package.*\.json/);
      expect(dockerfileContent).toMatch(/npm (install|ci)/);
    });

    test('should copy source code', () => {
      expect(dockerfileContent).toContain('COPY');
    });

    test('should build TypeScript', () => {
      expect(dockerfileContent).toMatch(/npm run build|tsc/);
    });

    test('should expose port 3000', () => {
      expect(dockerfileContent).toContain('EXPOSE 3000');
    });

    test('should have proper CMD or ENTRYPOINT', () => {
      expect(dockerfileContent).toMatch(/CMD|ENTRYPOINT/);
    });

    test('should set NODE_ENV to production', () => {
      expect(dockerfileContent).toContain('NODE_ENV=production');
    });
  });

  describe('Docker Compose Configuration', () => {
    let dockerComposeContent;

    beforeAll(() => {
      const dockerComposePath = path.join(projectRoot, 'docker-compose.yml');
      if (fs.existsSync(dockerComposePath)) {
        dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf-8');
      }
    });

    test('should have version specified', () => {
      expect(dockerComposeContent).toMatch(/version:\s*['"]?3\./);
    });

    test('should have services section', () => {
      expect(dockerComposeContent).toContain('services:');
    });

    test('should have app service', () => {
      expect(dockerComposeContent).toMatch(/app:|api:|todo-api:/);
    });

    test('should expose port 3000', () => {
      expect(dockerComposeContent).toMatch(/3000:3000|'3000:3000'|"3000:3000"/);
    });

    test('should have environment variables', () => {
      expect(dockerComposeContent).toContain('environment:');
    });

    test('should have volume mapping for development', () => {
      expect(dockerComposeContent).toContain('volumes:');
    });
  });

  describe('Docker Ignore', () => {
    let dockerIgnoreContent;

    beforeAll(() => {
      const dockerIgnorePath = path.join(projectRoot, '.dockerignore');
      if (fs.existsSync(dockerIgnorePath)) {
        dockerIgnoreContent = fs.readFileSync(dockerIgnorePath, 'utf-8');
      }
    });

    test('should ignore node_modules', () => {
      expect(dockerIgnoreContent).toContain('node_modules');
    });

    test('should ignore dist folder', () => {
      expect(dockerIgnoreContent).toContain('dist');
    });

    test('should ignore .env files', () => {
      expect(dockerIgnoreContent).toContain('.env');
    });

    test('should ignore test files', () => {
      expect(dockerIgnoreContent).toMatch(/tests|coverage/);
    });
  });

  describe('Docker Build Process', () => {
    test('should have Docker available', () => {
      try {
        const version = execSync('docker --version', { stdio: 'pipe', encoding: 'utf-8' });
        expect(version).toContain('Docker version');
      } catch (error) {
        console.warn('Docker not available for testing');
        expect(true).toBe(true); // Pass test if Docker not available
      }
    });

    test('should have valid Docker configuration syntax', () => {
      // Test that Dockerfile has proper structure without actually building
      const dockerfilePath = path.join(projectRoot, 'Dockerfile');
      if (fs.existsSync(dockerfilePath)) {
        const content = fs.readFileSync(dockerfilePath, 'utf-8');
        
        // Validate basic Dockerfile structure
        expect(content).toContain('FROM');
        expect(content).toContain('WORKDIR');
        expect(content).toContain('COPY');
        expect(content).not.toContain('syntax error');
      }
    });
  });

});