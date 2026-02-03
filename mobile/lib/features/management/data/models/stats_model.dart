/// Dashboard stats model for management
class DashboardStats {
  final int myJobs;
  final int pendingCandidates;
  final int interviewsToday;
  final int responseRate;

  DashboardStats({
    required this.myJobs,
    required this.pendingCandidates,
    required this.interviewsToday,
    required this.responseRate,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      myJobs: json['my_jobs'] as int? ?? 0,
      pendingCandidates: json['pending_candidates'] as int? ?? 0,
      interviewsToday: json['interviews_today'] as int? ?? 0,
      responseRate: json['response_rate'] as int? ?? 0,
    );
  }

  factory DashboardStats.empty() {
    return DashboardStats(
      myJobs: 0,
      pendingCandidates: 0,
      interviewsToday: 0,
      responseRate: 0,
    );
  }
}

/// Task model for dashboard
class DashboardTask {
  final String id;
  final String title;
  final String type;
  final String priority;
  final bool completed;
  final String? dueTime;
  final int? applicationId;

  DashboardTask({
    required this.id,
    required this.title,
    required this.type,
    required this.priority,
    required this.completed,
    this.dueTime,
    this.applicationId,
  });

  factory DashboardTask.fromJson(Map<String, dynamic> json) {
    return DashboardTask(
      id: json['id'] as String,
      title: json['title'] as String,
      type: json['type'] as String,
      priority: json['priority'] as String? ?? 'medium',
      completed: json['completed'] as bool? ?? false,
      dueTime: json['due_time'] as String?,
      applicationId: json['application_id'] as int?,
    );
  }

  String get typeIcon {
    switch (type) {
      case 'review':
        return '📋';
      case 'interview':
        return '🎤';
      case 'offer':
        return '💼';
      default:
        return '📌';
    }
  }
}

/// Interview model for dashboard
class Interview {
  final int id;
  final String candidateName;
  final String jobTitle;
  final String time;
  final String date;
  final String type;

  Interview({
    required this.id,
    required this.candidateName,
    required this.jobTitle,
    required this.time,
    required this.date,
    required this.type,
  });

  factory Interview.fromJson(Map<String, dynamic> json) {
    return Interview(
      id: json['id'] as int,
      candidateName: json['candidate_name'] as String,
      jobTitle: json['job_title'] as String,
      time: json['time'] as String,
      date: json['date'] as String,
      type: json['type'] as String? ?? 'online',
    );
  }

  String get typeDisplay {
    switch (type) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Trực tiếp';
      default:
        return type;
    }
  }
}
