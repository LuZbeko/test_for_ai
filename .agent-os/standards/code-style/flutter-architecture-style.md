# Flutter Architecture Style Guide

## Feature Structure Rules

### Directory Organization
- Always follow feature-first structure
- Each feature contains: data, domain, presentation, provider folders
- No shared business logic between features in same folder

### File Naming Patterns
```
feature_name/
├── data/
│   ├── datasource/
│   │   ├── {feature}_datasource.dart           # Abstract interface
│   │   └── {feature}_supabase_datasource.dart # Implementation
│   ├── mappers/
│   │   └── {entity}_mapper.dart                # Domain ↔ Model conversion
│   ├── model/
│   │   ├── {entity}_model.dart                 # Data model with JSON
│   │   ├── create_{entity}_model.dart          # Creation DTO
│   │   └── update_{entity}_model.dart          # Update DTO
│   └── repository/
│       └── {feature}_repository.dart           # Repository implementation
├── domain/
│   ├── {entity}.dart                           # Main domain entity
│   ├── create_{entity}.dart                    # Creation entity
│   └── update_{entity}.dart                    # Update entity
├── presentation/
│   ├── controller/
│   │   ├── state/
│   │   │   └── {feature}_state.dart            # State class
│   │   └── {feature}_controller.dart           # Controller logic
│   └── screens/
│       ├── {feature}_page.dart                 # Main page
│       └── widgets/
│           └── {entity}_tile.dart              # List item widget
└── provider/
    ├── get_{entities}_provider.dart            # Read operations
    ├── create_{entity}_provider.dart           # Create operations
    ├── update_{entity}_provider.dart           # Update operations
    └── delete_{entity}_provider.dart           # Delete operations
```

## Layer Responsibilities

### Data Layer
- External API communication only
- JSON serialization/deserialization
- Caching and offline storage
- NO business logic

### Domain Layer
- Pure business entities (no external dependencies)
- Business validation rules
- Use cases (if complex logic needed)
- MUST be framework-agnostic

### Presentation Layer
- UI widgets and state management
- User input validation
- Navigation logic
- Error display and loading states

## Dependency Rules
- Data layer depends on Domain
- Presentation layer depends on Domain
- Domain layer depends on NOTHING
- Use dependency injection for all external dependencies