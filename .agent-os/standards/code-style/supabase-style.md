# Supabase Integration Style Guide

## Datasource Pattern

### Abstract Interface First
```dart
// Always create abstract interface
abstract interface class ServicePointDatasource {
  Future<List<ServicePointModel>> getServicePoints();
  Future<ServicePointModel> createServicePoint(CreateServicePointModel model);
  Future<ServicePointModel> updateServicePoint(String id, UpdateServicePointModel model);
  Future<void> deleteServicePoint(String id);
}
```

### Supabase Implementation
```dart
class ServicePointSupabaseDatasource implements ServicePointDatasource {
  ServicePointSupabaseDatasource(this._client);
  final SupabaseClient _client;
  
  @override
  Future<List<ServicePointModel>> getServicePoints() async {
    final response = await _client
        .from('service_point')
        .select()
        .order('created_at');
    
    return response
        .map((json) => ServicePointModel.fromJson(json))
        .toList();
  }
  
  @override
  Future<ServicePointModel> createServicePoint(CreateServicePointModel model) async {
    final response = await _client
        .from('service_point')
        .insert(model.toJson())
        .select()
        .single();
    
    return ServicePointModel.fromJson(response);
  }
  
  @override
  Future<ServicePointModel> updateServicePoint(String id, UpdateServicePointModel model) async {
    final response = await _client
        .from('service_point')
        .update(model.toJson())
        .eq('id', id)
        .select()
        .single();
    
    return ServicePointModel.fromJson(response);
  }
  
  @override
  Future<void> deleteServicePoint(String id) async {
    await _client
        .from('service_point')
        .delete()
        .eq('id', id);
  }
}
```

## Query Best Practices

### Row Level Security (RLS)
```dart
// ✅ GOOD - Trust RLS policies (automatic filtering)
Future<List<ServicePointModel>> getAccessibleServicePoints() async {
  final response = await _client
      .from('service_point')
      .select()
      .order('created_at');
  
  // RLS policies automatically filter based on user permissions
  return response.map((json) => ServicePointModel.fromJson(json)).toList();
}

// ❌ BAD - Manual filtering (can be bypassed)
Future<List<ServicePointModel>> getServicePointsManualFilter() async {
  final response = await _client.from('service_point').select();
  // Manual filtering is security risk and bypasses RLS
  return response.where((item) => /* manual condition */).toList();
}
```

### Error Handling
```dart
@override
Future<ServicePointModel> createServicePoint(CreateServicePointModel model) async {
  try {
    final response = await _client
        .from('service_point')
        .insert(model.toJson())
        .select()
        .single();
    
    return ServicePointModel.fromJson(response);
  } on PostgrestException catch (e) {
    throw ServicePointException('Failed to create service point: ${e.message}');
  } catch (e) {
    throw ServicePointException('Unexpected error: $e');
  }
}
```

## Model Patterns

### Data Models with JSON Serialization
```dart
@freezed
class ServicePointModel with _$ServicePointModel {
  const factory ServicePointModel({
    required String id,
    required String code,
    @JsonKey(name: 'location_id') required String locationId,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  }) = _ServicePointModel;
  
  factory ServicePointModel.fromJson(Map<String, dynamic> json) =>
      _$ServicePointModelFromJson(json);
}
```

### Provider Integration
```dart
@riverpod
ServicePointDatasource servicePointSupabaseDatasource(Ref ref) {
  return ServicePointSupabaseDatasource(ref.read(supabaseClientProvider));
}

@riverpod
SupabaseClient supabaseClient(Ref ref) {
  return Supabase.instance.client;
}
```