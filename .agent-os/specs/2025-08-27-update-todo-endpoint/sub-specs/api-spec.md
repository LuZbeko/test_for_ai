# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-27-update-todo-endpoint/spec.md

> Created: 2025-08-27
> Version: 1.0.0

## Endpoints

### PUT /api/todos/:id

**Purpose:** Update an existing todo with partial field support

**Parameters:**
- `id` (path parameter): UUID of the todo to update

**Request Headers:**
- Content-Type: application/json

**Request Body (All fields optional):**
```json
{
  "title": "Updated todo title",
  "description": "Updated description or null",
  "completed": true,
  "priority": "high",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "tags": "[\"updated\", \"tag\"]"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated todo title",
    "description": "Updated description or null",
    "completed": true,
    "priority": "high", 
    "dueDate": "2025-12-31T23:59:59.000Z",
    "tags": "[\"updated\", \"tag\"]",
    "createdAt": "2025-08-27T10:00:00.000Z",
    "updatedAt": "2025-08-27T12:00:00.000Z"
  },
  "message": "Todo updated successfully"
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "field": "title",
      "message": "Title must be between 1 and 255 characters",
      "value": "",
      "location": "body"
    }
  ],
  "timestamp": "ISO 8601 string"
}
```

**Invalid ID Response (400):**
```json
{
  "success": false,
  "error": "Validation Error", 
  "message": "Invalid todo ID format",
  "details": [
    {
      "field": "id",
      "message": "Must be a valid UUID",
      "value": "invalid-id"
    }
  ],
  "timestamp": "ISO 8601 string"
}
```

**No Fields Response (400):**
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "At least one field must be provided for update",
  "timestamp": "ISO 8601 string"
}
```

**Not Found Response (404):**
```json
{
  "success": false,
  "error": "Not Found", 
  "message": "Todo with ID {id} not found",
  "timestamp": "ISO 8601 string"
}
```

**Server Error Response (500):**
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Unable to update todo",
  "timestamp": "ISO 8601 string"
}
```

## Controllers

### TodoController.update

**Business Logic:**
1. Validate ID parameter is valid UUID format
2. Check if at least one field is provided for update
3. Validate all provided fields according to business rules  
4. Query database to verify todo exists
5. Update todo with only provided fields
6. Format successful response with updated todo data
7. Handle validation, not found, and database errors appropriately

**Error Handling:**
- Invalid UUID format → 400 validation error with field details
- No fields provided → 400 validation error
- Field validation failures → 400 validation error with field-specific details
- Todo not found → 404 not found error  
- Database errors → 500 server error with generic message
- Unexpected errors → 500 with logging

**Validation Rules:**
- **title**: If provided, 1-255 characters after trimming, cannot be empty
- **description**: If provided, max 1000 characters after trimming, null allowed
- **completed**: If provided, must be boolean type
- **priority**: If provided, must be one of: "low", "medium", "high"  
- **dueDate**: If provided, must be valid ISO 8601 format and future date, null allowed
- **tags**: If provided, must be valid JSON array with max 10 string elements (each max 50 chars), null allowed

## Route Integration

**Route Definition:**
```javascript
// In todoRoutes.ts
todoRouter.put('/:id', validateTodoUpdate, handleValidationErrors, TodoController.update);
```

**Middleware Chain:**
1. Express JSON parser (already configured)
2. validateTodoUpdate - Express-validator rules for optional fields
3. handleValidationErrors - Process and format validation errors
4. TodoController.update - Handle the update request
5. Error handler middleware (catches any thrown errors)

**Validation Middleware:**
```javascript
// validateTodoUpdate in validation.ts
export const validateTodoUpdate: ValidationChain[] = [
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('completed').optional().isBoolean(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601().custom(validateFutureDate),
  body('tags').optional().custom(validateTagsJSON),
  // Custom validator to ensure at least one field is provided
  body().custom((value, { req }) => {
    const updatableFields = ['title', 'description', 'completed', 'priority', 'dueDate', 'tags'];
    const hasAtLeastOneField = updatableFields.some(field => field in req.body);
    if (!hasAtLeastOneField) {
      throw new Error('At least one field must be provided for update');
    }
    return true;
  })
];
```