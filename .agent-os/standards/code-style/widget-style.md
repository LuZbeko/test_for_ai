# Flutter Widget Style Guide

## Widget Structure Rules

### Constructor Formatting
```dart
// ✅ GOOD - Vertical alignment of parameters
class ServicePointTile extends StatelessWidget {
  const ServicePointTile({
    super.key,
    required this.servicePoint,
    required this.onEdit,
    required this.onDelete,
  });

  final ServicePoint servicePoint;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
}
```

### Build Method Organization
```dart
@override
Widget build(BuildContext context) {
  // 1. Watch providers at top
  final servicePoints = ref.watch(getServicePointsProvider);
  final controller = ref.watch(servicePointsControllerProvider.notifier);
  
  // 2. Early returns for loading/error states
  if (servicePoints.isLoading) {
    return const CircularLoadingWidget();
  }
  
  // 3. Main widget tree
  return Scaffold(
    appBar: _buildAppBar(context),
    body: _buildBody(context, servicePoints),
  );
}
```

### Widget Composition
```dart
// ✅ GOOD - Extract complex widgets to private methods
Widget _buildAppBar(BuildContext context) {
  return AppBar(
    title: const Text('Service Points'),
    actions: [
      AddButton(
        onPressed: () => _showCreateDialog(context),
      ),
    ],
  );
}

// ✅ GOOD - Use meaningful widget names
Widget _buildServicePointsList(List<ServicePoint> servicePoints) {
  return ListView.builder(
    itemCount: servicePoints.length,
    itemBuilder: (context, index) {
      final servicePoint = servicePoints[index];
      return ServicePointTile(
        key: ValueKey(servicePoint.id), // Important for performance
        servicePoint: servicePoint,
        onEdit: () => _editServicePoint(servicePoint),
        onDelete: () => _deleteServicePoint(servicePoint),
      );
    },
  );
}
```

## Common Widget Usage

### Always Use Common Widgets
```dart
// ✅ GOOD - Use common widgets from common/widgets/
DeleteButton(onPressed: () => onDelete())
AddButton(onPressed: () => showCreateDialog())
SaveButton(onPressed: () => saveData())

// Success/error feedback
showSuccessSnackbar(context, 'Operation completed successfully');
showErrorSnackbar(context, 'Operation failed');

// Loading and error states
const CircularLoadingWidget()
ErrorWithRetryWidget(
  error: error.toString(),
  onRetry: () => controller.retry(),
)

// ❌ BAD - Custom implementations
IconButton(onPressed: onDelete, icon: Icon(Icons.delete))
ElevatedButton(onPressed: showCreate, child: Text('Add'))
```

### Widget Performance Rules
- Always provide keys for dynamic lists: `key: ValueKey(item.id)`
- Use `const` constructors everywhere possible
- Extract stateless widgets when reusable
- Use ListView.builder for long lists
- Avoid deep nesting - extract to methods or separate widgets