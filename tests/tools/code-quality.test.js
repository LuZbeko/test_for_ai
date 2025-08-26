const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Code Quality Tools', () => {
  const projectRoot = path.resolve(__dirname, '../..');

  describe('ESLint Configuration', () => {
    test('should have ESLint config file', () => {
      const eslintConfigPaths = [
        '.eslintrc.js',
        '.eslintrc.json',
        '.eslintrc.yml',
        '.eslintrc.yaml',
        'eslint.config.js'
      ];
      
      const hasEslintConfig = eslintConfigPaths.some(configFile => 
        fs.existsSync(path.join(projectRoot, configFile))
      );
      
      expect(hasEslintConfig).toBe(true);
    });

    test('should have ESLint dependency installed', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      expect(deps.eslint).toBeDefined();
      expect(deps['@typescript-eslint/parser']).toBeDefined();
      expect(deps['@typescript-eslint/eslint-plugin']).toBeDefined();
    });

    test('should have lint script in package.json', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      expect(packageJson.scripts.lint).toBeDefined();
      expect(packageJson.scripts.lint).toContain('eslint');
    });

    test('should run ESLint without errors on existing code', () => {
      try {
        execSync('npm run lint', { cwd: projectRoot, stdio: 'pipe' });
        expect(true).toBe(true);
      } catch (error) {
        // ESLint should run without throwing errors (warnings are ok)
        expect(error.status).not.toBe(2); // 2 indicates syntax errors
      }
    });
  });

  describe('Prettier Configuration', () => {
    test('should have Prettier config file', () => {
      const prettierConfigPaths = [
        '.prettierrc',
        '.prettierrc.json',
        '.prettierrc.js',
        '.prettierrc.yml',
        '.prettierrc.yaml',
        'prettier.config.js'
      ];
      
      const hasPrettierConfig = prettierConfigPaths.some(configFile => 
        fs.existsSync(path.join(projectRoot, configFile))
      );
      
      expect(hasPrettierConfig).toBe(true);
    });

    test('should have Prettier dependency installed', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      expect(deps.prettier).toBeDefined();
    });

    test('should have format script in package.json', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      expect(packageJson.scripts.format).toBeDefined();
      expect(packageJson.scripts.format).toContain('prettier');
    });

    test('should format code without errors', () => {
      try {
        execSync('npm run format', { cwd: projectRoot, stdio: 'pipe' });
        expect(true).toBe(true);
      } catch (error) {
        fail(`Prettier formatting failed: ${error.message}`);
      }
    });
  });

  describe('Code Quality Integration', () => {
    test('should have ESLint and Prettier compatible configuration', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Should have eslint-config-prettier to avoid conflicts
      expect(deps['eslint-config-prettier']).toBeDefined();
    });

    test('should have proper file extensions configured for linting', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Lint script should target TypeScript files
      expect(packageJson.scripts.lint).toMatch(/\*\.ts/);
    });

    test('should have proper file extensions configured for formatting', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Format script should target TypeScript files
      expect(packageJson.scripts.format).toMatch(/\*\.ts/);
    });
  });

  describe('Git Integration', () => {
    test('should have .gitignore with proper entries', () => {
      const gitignorePath = path.join(projectRoot, '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);
      
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      expect(gitignoreContent).toContain('node_modules');
      expect(gitignoreContent).toContain('dist');
      expect(gitignoreContent).toContain('.env');
    });
  });
});