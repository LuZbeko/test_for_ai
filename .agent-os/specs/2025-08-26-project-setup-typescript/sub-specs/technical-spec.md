# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-26-project-setup-typescript/spec.md

## Technical Requirements

### Core Dependencies Setup
- Node.js v20.x runtime environment
- TypeScript 5.x with strict mode configuration
- Express.js 4.x with TypeScript type definitions
- Prisma 5.x ORM with SQLite3 database driver
- Development dependencies: nodemon, ts-node, @types/node, @types/express

### TypeScript Configuration
- Target ES2022 for modern JavaScript features
- Module resolution set to Node
- Strict type checking enabled
- Source maps enabled for debugging
- Output directory set to ./dist
- Include paths for src directory
- Exclude node_modules and test files from compilation

### Project Structure
```
project-root/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/           # Route definitions
│   ├── models/           # Data models and schemas
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   ├── config/           # Configuration files
│   └── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── tests/               # Test files
├── dist/                # Compiled JavaScript
├── .env.example         # Environment variables template
├── .env                 # Local environment variables
├── .gitignore          # Git ignore rules
├── .eslintrc.json      # ESLint configuration
├── .prettierrc         # Prettier configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Project dependencies
├── Dockerfile          # Docker container definition
└── docker-compose.yml  # Docker services configuration
```

### Development Tools Configuration
- ESLint with TypeScript parser and recommended rules
- Prettier with 2-space indentation and single quotes
- Nodemon configuration for automatic restart on file changes
- Environment variable management with dotenv
- Git ignore configuration for node_modules, dist, .env, and SQLite database files

### Database Configuration
- Prisma schema with SQLite datasource
- Initial Todo model schema with id, title, description, completed, createdAt, updatedAt fields
- Database file location at ./prisma/dev.db
- Migration strategy using Prisma Migrate

### Docker Setup
- Node.js Alpine Linux base image for smaller container size
- Multi-stage build for optimized production image
- Volume mapping for development hot-reload
- Environment variable injection support
- Port 3000 exposed for API access
- Docker Compose with service definition and environment configuration

### NPM Scripts
- `dev`: Start development server with nodemon and ts-node
- `build`: Compile TypeScript to JavaScript
- `start`: Run compiled JavaScript in production
- `lint`: Run ESLint on source files
- `format`: Run Prettier formatting
- `db:migrate`: Run Prisma migrations
- `db:generate`: Generate Prisma client
- `db:seed`: Seed database with initial data (if needed)
- `test`: Run test suite (Jest configuration for future implementation)

## External Dependencies

**@types/node** - TypeScript definitions for Node.js built-in modules
**Justification:** Required for TypeScript to understand Node.js APIs and provide proper type checking

**@types/express** - TypeScript definitions for Express.js framework
**Justification:** Essential for type-safe Express application development with auto-completion and error detection

**dotenv** - Environment variable loader from .env files
**Justification:** Industry standard for managing configuration across different environments without hardcoding sensitive data

**nodemon** - Automatic server restart during development
**Justification:** Improves developer experience by eliminating manual server restarts during code changes

**ts-node** - TypeScript execution engine for Node.js
**Justification:** Enables running TypeScript files directly without manual compilation during development

**eslint** and **@typescript-eslint/parser** - Code quality and consistency tooling
**Justification:** Enforces coding standards and catches potential errors before runtime

**prettier** - Code formatting tool
**Justification:** Maintains consistent code style across the team without manual formatting debates