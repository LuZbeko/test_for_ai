# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-27-read-todo-endpoints/spec.md

## Endpoints

### GET /api/todos

**Purpose:** Retrieve all todos from the database

**Parameters:** None

**Request Headers:**
- Content-Type: application/json

**Response:** 
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string | null",
      "completed": "boolean",
      "priority": "low | medium | high",
      "dueDate": "ISO 8601 string | null",
      "tags": "JSON string | null",
      "createdAt": "ISO 8601 string",
      "updatedAt": "ISO 8601 string"
    }
  ],
  "message": "Todos retrieved successfully"
}
```

**Success Response (200):**
- Returns array of all todos
- Empty array if no todos exist

**Error Response (500):**
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Unable to retrieve todos",
  "timestamp": "ISO 8601 string"
}
```

### GET /api/todos/:id

**Purpose:** Retrieve a specific todo by its ID

**Parameters:**
- `id` (path parameter): UUID of the todo to retrieve

**Request Headers:**
- Content-Type: application/json

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string | null",
    "completed": "boolean",
    "priority": "low | medium | high",
    "dueDate": "ISO 8601 string | null",
    "tags": "JSON string | null",
    "createdAt": "ISO 8601 string",
    "updatedAt": "ISO 8601 string"
  },
  "message": "Todo retrieved successfully"
}
```

**Success Response (200):**
- Returns the requested todo object

**Not Found Response (404):**
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Todo with ID {id} not found",
  "timestamp": "ISO 8601 string"
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid todo ID format",
  "details": [
    {
      "field": "id",
      "message": "Must be a valid UUID"
    }
  ],
  "timestamp": "ISO 8601 string"
}
```

**Server Error Response (500):**
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Unable to retrieve todo",
  "timestamp": "ISO 8601 string"
}
```

## Controller Actions

### TodoController.getAll

**Business Logic:**
1. Query database for all todos using Prisma
2. Format response with success wrapper
3. Handle any database errors with appropriate error response
4. Return empty array for no results (not an error)

**Error Handling:**
- Database connection errors → 500 response
- Unexpected errors → 500 response with logging

### TodoController.getById

**Business Logic:**
1. Validate ID parameter is valid UUID format
2. Query database for specific todo by ID
3. Return 404 if todo not found
4. Format successful response with todo data
5. Handle validation and database errors appropriately

**Error Handling:**
- Invalid UUID format → 400 validation error
- Todo not found → 404 not found error
- Database errors → 500 server error
- Unexpected errors → 500 with logging

## Route Integration

**Route Definition:**
```javascript
// In todoRoutes.ts
todoRouter.get('/', TodoController.getAll);
todoRouter.get('/:id', validateTodoId, TodoController.getById);
```

**Middleware Chain:**
1. Express JSON parser (already configured)
2. ID validation middleware (for :id route)
3. Controller method
4. Error handler middleware (catches any thrown errors)