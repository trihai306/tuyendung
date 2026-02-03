/// Task Provider
/// State management for tasks using Riverpod 3.x

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../tasks.dart';
import 'package:flutter/foundation.dart';

// Repository provider
final taskRepositoryProvider = Provider<TaskRepository>((ref) {
  return TaskRepositoryImpl();
});

// Tasks list provider with optional status filter
final tasksProvider = FutureProvider<List<Task>>((ref) async {
  final status = ref.watch(selectedStatusFilterProvider);
  final repository = ref.watch(taskRepositoryProvider);
  return repository.getTasks(status: status);
});

// Single task provider
final taskByIdProvider = FutureProvider.family<Task?, String>((ref, id) async {
  final repository = ref.watch(taskRepositoryProvider);
  return repository.getTaskById(id);
});

// Task stats provider
final taskStatsProvider = FutureProvider<TaskStats>((ref) async {
  final repository = ref.watch(taskRepositoryProvider);
  return repository.getStats();
});

// Employees provider
final employeeListProvider = FutureProvider<List<TaskUser>>((ref) async {
  final repository = ref.watch(taskRepositoryProvider);
  return repository.getEmployees();
});

// Filtered tasks provider (by status)
final filteredTasksProvider = FutureProvider.family<List<Task>, TaskStatus>((ref, status) async {
  final repository = ref.watch(taskRepositoryProvider);
  return repository.getTasks(status: status);
});

// Employee stats provider - returns stats per employee
final employeeStatsProvider = FutureProvider<Map<TaskUser, TaskStats>>((ref) async {
  // For now, return empty map - backend can add this endpoint later
  return {};
});


// Selected filter state
class SelectedStatusFilterNotifier extends Notifier<TaskStatus?> {
  @override
  TaskStatus? build() => null;

  void setFilter(TaskStatus? status) {
    state = status;
  }
}

final selectedStatusFilterProvider = NotifierProvider<SelectedStatusFilterNotifier, TaskStatus?>(() {
  return SelectedStatusFilterNotifier();
});

// Task actions state
class TaskActionsState {
  final bool isLoading;
  final String? error;

  const TaskActionsState({
    this.isLoading = false,
    this.error,
  });

  TaskActionsState copyWith({
    bool? isLoading,
    String? error,
  }) {
    return TaskActionsState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Task actions notifier
class TaskActionsNotifier extends Notifier<TaskActionsState> {
  @override
  TaskActionsState build() => const TaskActionsState();

  TaskRepository get _repository => ref.read(taskRepositoryProvider);

  Future<Task?> createTask({
    required String title,
    String? description,
    required TaskUser assignedTo,
    required TaskPriority priority,
    required DateTime dueDate,
  }) async {
    state = state.copyWith(isLoading: true);
    try {
      // Create task with placeholder assignedBy - backend will set it from auth
      final task = Task(
        id: '',
        title: title,
        description: description,
        assignedBy: assignedTo, // Will be replaced by backend with auth user
        assignedTo: assignedTo,
        priority: priority,
        status: TaskStatus.pending,
        dueDate: dueDate,
        progress: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      
      final created = await _repository.createTask(task);
      ref.invalidate(tasksProvider);
      ref.invalidate(taskStatsProvider);
      state = state.copyWith(isLoading: false);
      return created;
    } catch (e) {
      debugPrint('Error creating task: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return null;
    }
  }

  Future<bool> updateProgress(String taskId, int progress) async {
    state = state.copyWith(isLoading: true);
    try {
      await _repository.updateProgress(taskId, progress);
      ref.invalidate(tasksProvider);
      ref.invalidate(taskStatsProvider);
      ref.invalidate(taskByIdProvider(taskId));
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      debugPrint('Error updating progress: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> addComment(String taskId, String content) async {
    state = state.copyWith(isLoading: true);
    try {
      await _repository.addComment(taskId, content);
      ref.invalidate(taskByIdProvider(taskId));
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      debugPrint('Error adding comment: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> updateStatus(String taskId, TaskStatus status) async {
    state = state.copyWith(isLoading: true);
    try {
      final task = await _repository.getTaskById(taskId);
      if (task == null) {
        throw Exception('Task not found');
      }
      
      await _repository.updateTask(task.copyWith(status: status));
      ref.invalidate(tasksProvider);
      ref.invalidate(taskStatsProvider);
      ref.invalidate(taskByIdProvider(taskId));
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      debugPrint('Error updating status: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> deleteTask(String taskId) async {
    state = state.copyWith(isLoading: true);
    try {
      final success = await _repository.deleteTask(taskId);
      if (success) {
        ref.invalidate(tasksProvider);
        ref.invalidate(taskStatsProvider);
      }
      state = state.copyWith(isLoading: false);
      return success;
    } catch (e) {
      debugPrint('Error deleting task: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
}

final taskActionsProvider = NotifierProvider<TaskActionsNotifier, TaskActionsState>(() {
  return TaskActionsNotifier();
});
