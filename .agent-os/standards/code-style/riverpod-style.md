# Riverpod Provider Style Guide

## Provider Declaration Rules

### Critical Error Prevention
```dart
// ✅ GOOD - Use generic Ref (ALWAYS)
@riverpod
Future<List<ServicePoint>> getServicePoints(Ref ref) async {
  final repository = ref.read(servicePointRepositoryProvider);
  return repository.getServicePoints();
}

// ✅ GOOD - Avoid parameter name conflicts
@riverpod
Future<ServicePoint> createServicePoint(Ref ref, CreateServicePoint data) async {
  final repository = ref.read(servicePointRepositoryProvider);
  return repository.createServicePoint(data);
}

// ❌ BAD - Parameter name conflicts cause code generation errors!
@riverpod
Future<ServicePoint> createServicePoint(Ref ref, CreateServicePoint createServicePoint) async {
  // This will fail code generation!
}

// ❌ BAD - Using specific ref types (deprecated in Riverpod 3.0)
@riverpod
Future<List<ServicePoint>> getServicePoints(GetServicePointsRef ref) {
  // Will be removed in future versions
}
```

## Provider Patterns

### CRUD Operations
```dart
// Read operations
@riverpod
Future<List<Entity>> getEntities(Ref ref) async {
  final repository = ref.read(entityRepositoryProvider);
  return repository.getEntities();
}

// Create operations
@riverpod
Future<Entity> createEntity(Ref ref, CreateEntity data) async {
  final repository = ref.read(entityRepositoryProvider);
  return repository.createEntity(data);
}

// Update operations  
@riverpod
Future<Entity> updateEntity(Ref ref, UpdateEntity data) async {
  final repository = ref.read(entityRepositoryProvider);
  return repository.updateEntity(data);
}

// Delete operations
@riverpod
Future<void> deleteEntity(Ref ref, String id) async {
  final repository = ref.read(entityRepositoryProvider);
  return repository.deleteEntity(id);
}
```

### Controller Pattern
```dart
@riverpod
class EntityController extends _$EntityController {
  @override
  FutureOr<EntityState> build() async {
    final entities = await ref.read(getEntitiesProvider.future);
    return EntityState(entities: entities);
  }
  
  Future<void> createEntity(CreateEntity data) async {
    state = const AsyncValue.loading();
    
    try {
      await ref.read(createEntityProvider(data).future);
      ref.invalidateSelf(); // Refresh the list
      
      state = AsyncValue.data(
        state.value!.copyWith(
          successMessage: 'Entity created successfully',
        ),
      );
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}
```

## Provider Organization
- One provider per file when complex
- Group related CRUD providers in same file
- Use descriptive provider names
- Always add provider to exports