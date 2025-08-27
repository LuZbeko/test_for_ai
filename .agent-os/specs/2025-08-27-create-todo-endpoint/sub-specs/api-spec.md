# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-27-create-todo-endpoint/spec.md

## Endpoints

### POST /api/todos

**Purpose:** Create a new todo item with validation and database persistence

**URL:** `/api/todos`
**Method:** POST
**Content-Type:** application/json

**Request Body:**
```json
{
  "title": "string (required, 1-255 chars)",
  "description": "string (optional, max 1000 chars)",
  "completed": "boolean (optional, defaults to false)",
  "priority": "string (optional, enum: ['low', 'medium', 'high'], defaults to 'medium')",
  "dueDate": "string (optional, ISO 8601 format, must be future date)",
  "tags": "string (optional, JSON array as string, max 10 tags)"
}
```

**Example Request:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation for the todo management system",
  "priority": "high",
  "dueDate": "2025-09-01T10:00:00.000Z",
  "tags": "[\"work\", \"documentation\", \"urgent\"]"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation for the todo management system",
    "completed": false,
    "priority": "high",
    "dueDate": "2025-09-01T10:00:00.000Z",
    "tags": "[\"work\", \"documentation\", \"urgent\"]",
    "createdAt": "2025-08-27T14:30:00.000Z",
    "updatedAt": "2025-08-27T14:30:00.000Z"
  },
  "message": "Todo created successfully"
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "field": "title",
      "message": "Title is required and must be between 1 and 255 characters",
      "value": ""
    },
    {
      "field": "priority",
      "message": "Priority must be one of: low, medium, high",
      "value": "urgent"
    }
  ],
  "timestamp": "2025-08-27T14:30:00.000Z"
}
```

**400 Bad Request - Invalid Date:**
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "field": "dueDate",
      "message": "Due date must be a future date",
      "value": "2025-01-01T10:00:00.000Z"
    }
  ],
  "timestamp": "2025-08-27T14:30:00.000Z"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Unable to create todo. Please try again later.",
  "timestamp": "2025-08-27T14:30:00.000Z"
}
```

## Controller Logic

### TodoController.create()

**Purpose:** Handle POST /api/todos requests with validation and database operations

**Flow:**
1. **Input Validation**: Validate request body against schema rules
2. **Business Logic Validation**: Check due date is in future, validate tags format
3. **Database Operation**: Create todo using Prisma with generated UUID
4. **Response Formation**: Format success response with created todo data
5. **Error Handling**: Catch and format validation/database errors appropriately

**Error Handling:**
- Input validation errors → 400 Bad Request with detailed field errors
- Database connection errors → 500 Internal Server Error with generic message
- Duplicate key errors → 400 Bad Request with conflict message
- System errors → 500 Internal Server Error with generic message

**Logging Requirements:**
- Log all incoming requests with method, URL, and request ID
- Log validation errors with field details (no sensitive data)
- Log database errors with full error details for debugging
- Log response times and status codes for monitoring

## Route Registration

**File:** `src/routes/todos.ts`
```typescript
import { Router } from 'express';
import { TodoController } from '../controllers/TodoController';
import { validateTodoCreation } from '../middleware/validation';

const router = Router();

router.post('/todos', validateTodoCreation, TodoController.create);

export default router;
```

**Integration with Express App:**
```typescript
// src/app.ts
import todoRoutes from './routes/todos';

app.use('/api', todoRoutes);
```

## Middleware Components

### Validation Middleware
- **Purpose**: Pre-validate request body before controller execution
- **Implementation**: Express-validator or Joi-based validation
- **Error Format**: Consistent with API specification error responses
- **Fail Fast**: Return 400 immediately on validation failure