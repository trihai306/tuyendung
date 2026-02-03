/// Task Management Models
/// Defines core entities for the task management system

import 'package:flutter/foundation.dart';

/// Priority levels for tasks
enum TaskPriority {
  high,
  medium,
  low;

  String get displayName {
    switch (this) {
      case TaskPriority.high:
        return 'Cao';
      case TaskPriority.medium:
        return 'Trung bình';
      case TaskPriority.low:
        return 'Thấp';
    }
  }

  String get color {
    switch (this) {
      case TaskPriority.high:
        return '#EF4444'; // Red
      case TaskPriority.medium:
        return '#F59E0B'; // Amber
      case TaskPriority.low:
        return '#10B981'; // Green
    }
  }
}

/// Status of a task
enum TaskStatus {
  pending,
  inProgress,
  completed,
  overdue;

  String get displayName {
    switch (this) {
      case TaskStatus.pending:
        return 'Chờ xử lý';
      case TaskStatus.inProgress:
        return 'Đang thực hiện';
      case TaskStatus.completed:
        return 'Hoàn thành';
      case TaskStatus.overdue:
        return 'Quá hạn';
    }
  }

  String get color {
    switch (this) {
      case TaskStatus.pending:
        return '#64748B'; // Gray
      case TaskStatus.inProgress:
        return '#3B82F6'; // Blue
      case TaskStatus.completed:
        return '#10B981'; // Green
      case TaskStatus.overdue:
        return '#EF4444'; // Red
    }
  }
}

/// User model for task assignment
@immutable
class TaskUser {
  final String id;
  final String name;
  final String? avatarUrl;
  final String? email;

  const TaskUser({
    required this.id,
    required this.name,
    this.avatarUrl,
    this.email,
  });

  factory TaskUser.fromJson(Map<String, dynamic> json) {
    return TaskUser(
      id: json['id'] as String,
      name: json['name'] as String,
      avatarUrl: json['avatar_url'] as String?,
      email: json['email'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'avatar_url': avatarUrl,
        'email': email,
      };
}

/// Attachment for a task
@immutable
class TaskAttachment {
  final String id;
  final String fileName;
  final String fileUrl;
  final String fileType;
  final int fileSize;
  final DateTime uploadedAt;

  const TaskAttachment({
    required this.id,
    required this.fileName,
    required this.fileUrl,
    required this.fileType,
    required this.fileSize,
    required this.uploadedAt,
  });

  factory TaskAttachment.fromJson(Map<String, dynamic> json) {
    return TaskAttachment(
      id: json['id'] as String,
      fileName: json['file_name'] as String,
      fileUrl: json['file_url'] as String,
      fileType: json['file_type'] as String,
      fileSize: json['file_size'] as int,
      uploadedAt: DateTime.parse(json['uploaded_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'file_name': fileName,
        'file_url': fileUrl,
        'file_type': fileType,
        'file_size': fileSize,
        'uploaded_at': uploadedAt.toIso8601String(),
      };

  String get fileSizeFormatted {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1024 * 1024) return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
  }
}

/// Comment on a task
@immutable
class TaskComment {
  final String id;
  final String content;
  final TaskUser author;
  final DateTime createdAt;

  const TaskComment({
    required this.id,
    required this.content,
    required this.author,
    required this.createdAt,
  });

  factory TaskComment.fromJson(Map<String, dynamic> json) {
    return TaskComment(
      id: json['id'] as String,
      content: json['content'] as String,
      author: TaskUser.fromJson(json['author'] as Map<String, dynamic>),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'content': content,
        'author': author.toJson(),
        'created_at': createdAt.toIso8601String(),
      };
}

/// Activity log entry for a task
@immutable
class TaskActivity {
  final String id;
  final String type; // 'status_change', 'progress_update', 'comment', 'attachment'
  final String description;
  final TaskUser user;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;

  const TaskActivity({
    required this.id,
    required this.type,
    required this.description,
    required this.user,
    required this.createdAt,
    this.metadata,
  });

  factory TaskActivity.fromJson(Map<String, dynamic> json) {
    return TaskActivity(
      id: json['id'] as String,
      type: json['type'] as String,
      description: json['description'] as String,
      user: TaskUser.fromJson(json['user'] as Map<String, dynamic>),
      createdAt: DateTime.parse(json['created_at'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'description': description,
        'user': user.toJson(),
        'created_at': createdAt.toIso8601String(),
        'metadata': metadata,
      };
}

/// Main Task model
@immutable
class Task {
  final String id;
  final String title;
  final String? description;
  final TaskUser assignedBy;
  final TaskUser assignedTo;
  final TaskPriority priority;
  final TaskStatus status;
  final DateTime dueDate;
  final int progress; // 0-100
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<TaskAttachment> attachments;
  final List<TaskComment> comments;
  final List<TaskActivity> activities;

  const Task({
    required this.id,
    required this.title,
    this.description,
    required this.assignedBy,
    required this.assignedTo,
    required this.priority,
    required this.status,
    required this.dueDate,
    this.progress = 0,
    required this.createdAt,
    required this.updatedAt,
    this.attachments = const [],
    this.comments = const [],
    this.activities = const [],
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      assignedBy: TaskUser.fromJson(json['assigned_by'] as Map<String, dynamic>),
      assignedTo: TaskUser.fromJson(json['assigned_to'] as Map<String, dynamic>),
      priority: TaskPriority.values.firstWhere(
        (e) => e.name == json['priority'],
        orElse: () => TaskPriority.medium,
      ),
      status: TaskStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => TaskStatus.pending,
      ),
      dueDate: DateTime.parse(json['due_date'] as String),
      progress: json['progress'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      attachments: (json['attachments'] as List<dynamic>?)
              ?.map((e) => TaskAttachment.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      comments: (json['comments'] as List<dynamic>?)
              ?.map((e) => TaskComment.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      activities: (json['activities'] as List<dynamic>?)
              ?.map((e) => TaskActivity.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'assigned_by': assignedBy.toJson(),
        'assigned_to': assignedTo.toJson(),
        'priority': priority.name,
        'status': status.name,
        'due_date': dueDate.toIso8601String(),
        'progress': progress,
        'created_at': createdAt.toIso8601String(),
        'updated_at': updatedAt.toIso8601String(),
        'attachments': attachments.map((e) => e.toJson()).toList(),
        'comments': comments.map((e) => e.toJson()).toList(),
        'activities': activities.map((e) => e.toJson()).toList(),
      };

  Task copyWith({
    String? id,
    String? title,
    String? description,
    TaskUser? assignedBy,
    TaskUser? assignedTo,
    TaskPriority? priority,
    TaskStatus? status,
    DateTime? dueDate,
    int? progress,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<TaskAttachment>? attachments,
    List<TaskComment>? comments,
    List<TaskActivity>? activities,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      assignedBy: assignedBy ?? this.assignedBy,
      assignedTo: assignedTo ?? this.assignedTo,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      dueDate: dueDate ?? this.dueDate,
      progress: progress ?? this.progress,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      attachments: attachments ?? this.attachments,
      comments: comments ?? this.comments,
      activities: activities ?? this.activities,
    );
  }

  /// Check if task is overdue
  bool get isOverdue =>
      status != TaskStatus.completed && DateTime.now().isAfter(dueDate);

  /// Get days remaining until due date
  int get daysRemaining => dueDate.difference(DateTime.now()).inDays;
}

/// Statistics for dashboard
@immutable
class TaskStats {
  final int total;
  final int pending;
  final int inProgress;
  final int completed;
  final int overdue;
  final double completionRate;

  const TaskStats({
    required this.total,
    required this.pending,
    required this.inProgress,
    required this.completed,
    required this.overdue,
    required this.completionRate,
  });

  factory TaskStats.fromTasks(List<Task> tasks) {
    final pending = tasks.where((t) => t.status == TaskStatus.pending).length;
    final inProgress = tasks.where((t) => t.status == TaskStatus.inProgress).length;
    final completed = tasks.where((t) => t.status == TaskStatus.completed).length;
    final overdue = tasks.where((t) => t.isOverdue).length;
    
    return TaskStats(
      total: tasks.length,
      pending: pending,
      inProgress: inProgress,
      completed: completed,
      overdue: overdue,
      completionRate: tasks.isEmpty ? 0 : (completed / tasks.length) * 100,
    );
  }

  factory TaskStats.empty() => const TaskStats(
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        completionRate: 0,
      );
}
