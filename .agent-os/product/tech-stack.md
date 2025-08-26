# Technical Stack

## Application Framework
- **Node.js** v20.x with Express.js v4.x

## Database System
- **PostgreSQL** 15.x (primary)
- **SQLite** (development/testing)

## JavaScript Framework
- **TypeScript** 5.x for type safety

## Import Strategy
- **node** - Using npm/yarn package management

## API Documentation
- **OpenAPI/Swagger** 3.0 for API documentation

## Testing Framework
- **Jest** 29.x for unit testing
- **Supertest** for API endpoint testing

## Validation Library
- **Joi** or **express-validator** for input validation

## ORM/Database Access
- **Prisma** 5.x or **TypeORM** for database operations

## Application Hosting
- **AWS EC2** or **Heroku** for production
- **Docker** containerization supported

## Database Hosting
- **AWS RDS** for PostgreSQL (production)
- **Local PostgreSQL** for development

## Asset Hosting
- **AWS S3** for static assets (if needed)
- **CDN** via CloudFront (optional)

## Deployment Solution
- **GitHub Actions** for CI/CD
- **Docker** + **Docker Compose** for containerization
- **PM2** for process management

## Code Repository URL
- **GitHub** repository (to be created)

## Additional Tools
- **ESLint** + **Prettier** for code formatting
- **Nodemon** for development hot-reload
- **dotenv** for environment configuration
- **Winston** or **Pino** for logging
- **Helmet** for security headers
- **CORS** middleware for cross-origin support
- **Rate Limiting** with express-rate-limit