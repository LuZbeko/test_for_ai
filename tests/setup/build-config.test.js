const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Build Configuration', () => {
  const projectRoot = path.resolve(__dirname, '../..');

  describe('Package.json Configuration', () => {
    let packageJson;

    beforeAll(() => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      }
    });

    test('package.json should exist', () => {
      expect(fs.existsSync(path.join(projectRoot, 'package.json'))).toBe(true);
    });

    test('should have required fields', () => {
      expect(packageJson).toBeDefined();
      expect(packageJson.name).toBeDefined();
      expect(packageJson.version).toBeDefined();
      expect(packageJson.scripts).toBeDefined();
    });

    test('should have TypeScript as dependency', () => {
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      expect(deps.typescript).toBeDefined();
    });

    test('should have essential npm scripts', () => {
      const requiredScripts = ['dev', 'build', 'start', 'lint', 'format', 'test'];
      requiredScripts.forEach(script => {
        expect(packageJson.scripts[script]).toBeDefined();
      });
    });

    test('should have correct Node.js engine version', () => {
      if (packageJson.engines) {
        expect(packageJson.engines.node).toMatch(/20\.\d+\.\d+|>=20/);
      }
    });
  });

  describe('TypeScript Configuration', () => {
    let tsConfig;

    beforeAll(() => {
      const tsConfigPath = path.join(projectRoot, 'tsconfig.json');
      if (fs.existsSync(tsConfigPath)) {
        tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
      }
    });

    test('tsconfig.json should exist', () => {
      expect(fs.existsSync(path.join(projectRoot, 'tsconfig.json'))).toBe(true);
    });

    test('should have correct compiler options', () => {
      expect(tsConfig).toBeDefined();
      expect(tsConfig.compilerOptions).toBeDefined();
      expect(tsConfig.compilerOptions.target).toMatch(/ES2022|ESNext/i);
      expect(tsConfig.compilerOptions.module).toMatch(/node|commonjs/i);
      expect(tsConfig.compilerOptions.strict).toBe(true);
      expect(tsConfig.compilerOptions.outDir).toBe('./dist');
      expect(tsConfig.compilerOptions.sourceMap).toBe(true);
    });

    test('should include src directory', () => {
      expect(tsConfig.include).toContain('src/**/*');
    });

    test('should exclude node_modules and dist', () => {
      expect(tsConfig.exclude).toContain('node_modules');
      expect(tsConfig.exclude).toContain('dist');
    });
  });

  describe('Project Structure', () => {
    const requiredDirs = ['src', 'tests', 'prisma'];
    const requiredSrcSubDirs = [
      'controllers',
      'routes',
      'models',
      'middleware',
      'services',
      'utils',
      'config'
    ];

    requiredDirs.forEach(dir => {
      test(`${dir} directory should exist`, () => {
        expect(fs.existsSync(path.join(projectRoot, dir))).toBe(true);
      });
    });

    requiredSrcSubDirs.forEach(dir => {
      test(`src/${dir} directory should exist`, () => {
        expect(fs.existsSync(path.join(projectRoot, 'src', dir))).toBe(true);
      });
    });

    test('app.ts should exist in src', () => {
      expect(fs.existsSync(path.join(projectRoot, 'src', 'app.ts'))).toBe(true);
    });

    test('server.ts should exist in src', () => {
      expect(fs.existsSync(path.join(projectRoot, 'src', 'server.ts'))).toBe(true);
    });
  });

  describe('TypeScript Compilation', () => {
    test('should compile without errors', () => {
      try {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
        expect(true).toBe(true);
      } catch (error) {
        fail(`TypeScript compilation failed: ${error.message}`);
      }
    });

    test('should generate dist folder after build', () => {
      expect(fs.existsSync(path.join(projectRoot, 'dist'))).toBe(true);
    });

    test('should generate source maps', () => {
      const distFiles = fs.readdirSync(path.join(projectRoot, 'dist'));
      const hasSourceMaps = distFiles.some(file => file.endsWith('.js.map'));
      expect(hasSourceMaps).toBe(true);
    });
  });

  describe('Development Dependencies', () => {
    let packageJson;

    beforeAll(() => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      }
    });

    test('should have type definitions', () => {
      const devDeps = packageJson.devDependencies || {};
      expect(devDeps['@types/node']).toBeDefined();
      expect(devDeps['@types/express']).toBeDefined();
    });

    test('should have development tools', () => {
      const devDeps = packageJson.devDependencies || {};
      expect(devDeps['nodemon']).toBeDefined();
      expect(devDeps['ts-node']).toBeDefined();
    });

    test('should have testing framework', () => {
      const devDeps = packageJson.devDependencies || {};
      expect(devDeps['jest'] || devDeps['@types/jest']).toBeDefined();
    });
  });
});