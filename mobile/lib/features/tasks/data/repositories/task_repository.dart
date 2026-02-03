/// Task Repository
/// Handles data operations for tasks using real API

import '../../tasks.dart';
import '../../../../services/api_service.dart';

abstract class TaskRepository {
  Future<List<Task>> getTasks({TaskStatus? status});
  Future<Task?> getTaskById(String id);
  Future<Task> createTask(Task task);
  Future<Task> updateTask(Task task);
  Future<bool> deleteTask(String id);
  Future<Task> updateProgress(String taskId, int progress);
  Future<Task> addComment(String taskId, String content);
  Future<List<TaskUser>> getEmployees();
  Future<TaskStats> getStats();
}

class TaskRepositoryImpl implements TaskRepository {
  final ApiService _api;

  TaskRepositoryImpl({ApiService? api}) : _api = api ?? ApiService();

  @override
  Future<List<Task>> getTasks({TaskStatus? status}) async {
    final statusStr = status != null ? _statusToString(status) : null;
    final data = await _api.getTasks(status: statusStr);
    return data.map((json) => Task.fromJson(json as Map<String, dynamic>)).toList();
  }

  @override
  Future<Task?> getTaskById(String id) async {
    try {
      final data = await _api.getTask(int.parse(id));
      return Task.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  @override
  Future<Task> createTask(Task task) async {
    final data = await _api.createTask({
      'title': task.title,
      'description': task.description,
      'assigned_to': int.parse(task.assignedTo.id),
      'priority': task.priority.name,
      'due_date': task.dueDate.toIso8601String(),
    });
    return Task.fromJson(data);
  }

  @override
  Future<Task> updateTask(Task task) async {
    final data = await _api.updateTask(int.parse(task.id), {
      'title': task.title,
      'description': task.description,
      'assigned_to': int.parse(task.assignedTo.id),
      'priority': task.priority.name,
      'status': _statusToString(task.status),
      'due_date': task.dueDate.toIso8601String(),
    });
    return Task.fromJson(data);
  }

  @override
  Future<bool> deleteTask(String id) async {
    try {
      await _api.deleteTask(int.parse(id));
      return true;
    } catch (e) {
      return false;
    }
  }

  @override
  Future<Task> updateProgress(String taskId, int progress) async {
    final data = await _api.updateTaskProgress(int.parse(taskId), progress);
    return Task.fromJson(data);
  }

  @override
  Future<Task> addComment(String taskId, String content) async {
    final data = await _api.addTaskComment(int.parse(taskId), content);
    return Task.fromJson(data);
  }

  @override
  Future<List<TaskUser>> getEmployees() async {
    final data = await _api.getTaskEmployees();
    return data.map((json) => TaskUser.fromJson(json as Map<String, dynamic>)).toList();
  }

  @override
  Future<TaskStats> getStats() async {
    final data = await _api.getTaskStats();
    return TaskStats(
      total: data['total'] as int,
      pending: data['pending'] as int,
      inProgress: data['in_progress'] as int,
      completed: data['completed'] as int,
      overdue: data['overdue'] as int,
      completionRate: (data['completion_rate'] as num).toDouble(),
    );
  }

  String _statusToString(TaskStatus status) {
    switch (status) {
      case TaskStatus.pending:
        return 'pending';
      case TaskStatus.inProgress:
        return 'in_progress';
      case TaskStatus.completed:
        return 'completed';
      case TaskStatus.overdue:
        return 'overdue';
    }
  }
}
