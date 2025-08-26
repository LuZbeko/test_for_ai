# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-26-project-setup-typescript/spec.md

## Initial Schema Definition

### Prisma Schema Configuration

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Todo {
  id          String   @id @default(uuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  priority    String   @default("medium") // low, medium, high
  dueDate     DateTime?
  tags        String?  // JSON string for SQLite (will be array in future PostgreSQL)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([completed])
  @@index([priority])
  @@index([createdAt])
}
```

## Database Configuration

### Environment Variables
```
DATABASE_URL="file:./dev.db"
```

### Migration Commands
```bash
# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

## Schema Rationale

### Field Decisions

**id (UUID)**: Using UUID instead of auto-incrementing integer for better distributed system compatibility and to prevent ID enumeration attacks.

**title (Required String)**: Core field for todo item identification, required to ensure todos always have meaningful content.

**description (Optional String)**: Additional details are optional as many todos only need a title.

**completed (Boolean with default false)**: Essential for todo tracking, defaults to incomplete state.

**priority (String with default "medium")**: Enables task prioritization, using string enum for flexibility and readability.

**dueDate (Optional DateTime)**: Optional to support both deadline-driven and open-ended todos.

**tags (String)**: Stored as JSON string in SQLite for simplicity, will migrate to proper array type when moving to PostgreSQL.

**createdAt/updatedAt**: Automatic timestamps for audit trail and sorting capabilities.

### Index Strategy

- **completed index**: Optimizes filtering between completed and active todos
- **priority index**: Speeds up priority-based sorting and filtering
- **createdAt index**: Improves performance for chronological queries

### SQLite Limitations and Future Migration Path

Current SQLite implementation provides:
- Lightweight development database
- Zero configuration requirements
- File-based storage for easy version control exclusion
- Sufficient features for initial development

Future PostgreSQL migration will enable:
- Native JSON/JSONB support for tags array
- Better concurrent write performance
- Full-text search capabilities
- Advanced indexing options
- Production-grade reliability

## Data Integrity Rules

1. **Title Validation**: Minimum 1 character, maximum 255 characters
2. **Priority Validation**: Must be one of: "low", "medium", "high"
3. **Due Date Validation**: If provided, must be future date (enforced at API level)
4. **Tags Format**: JSON array string format validated at API level
5. **Soft Deletes**: Not implemented initially, todos are hard deleted