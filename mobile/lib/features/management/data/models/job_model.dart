/// Job model for recruitment management
class Job {
  final int id;
  final String title;
  final String? department;
  final String? location;
  final String jobType;
  final double? salaryMin;
  final double? salaryMax;
  final String status;
  final String? description;
  final String? requirements;
  final String? benefits;
  final int? targetCount;
  final int applicationsCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  Job({
    required this.id,
    required this.title,
    this.department,
    this.location,
    required this.jobType,
    this.salaryMin,
    this.salaryMax,
    required this.status,
    this.description,
    this.requirements,
    this.benefits,
    this.targetCount,
    this.applicationsCount = 0,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'] as int,
      title: json['title'] as String,
      department: json['department'] as String?,
      location: json['location'] as String?,
      jobType: json['job_type'] as String? ?? 'full_time',
      salaryMin: (json['salary_min'] as num?)?.toDouble(),
      salaryMax: (json['salary_max'] as num?)?.toDouble(),
      status: json['status'] as String? ?? 'draft',
      description: json['description'] as String?,
      requirements: json['requirements'] as String?,
      benefits: json['benefits'] as String?,
      targetCount: json['target_count'] as int?,
      applicationsCount: json['applications_count'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'department': department,
      'location': location,
      'job_type': jobType,
      'salary_min': salaryMin,
      'salary_max': salaryMax,
      'status': status,
      'description': description,
      'requirements': requirements,
      'benefits': benefits,
      'target_count': targetCount,
    };
  }

  String get jobTypeDisplay {
    switch (jobType) {
      case 'full_time':
        return 'Toàn thời gian';
      case 'part_time':
        return 'Bán thời gian';
      case 'contract':
        return 'Hợp đồng';
      case 'intern':
        return 'Thực tập';
      default:
        return jobType;
    }
  }

  String get statusDisplay {
    switch (status) {
      case 'draft':
        return 'Nháp';
      case 'open':
        return 'Đang tuyển';
      case 'closed':
        return 'Đã đóng';
      default:
        return status;
    }
  }

  String get salaryDisplay {
    if (salaryMin == null && salaryMax == null) {
      return 'Thỏa thuận';
    }
    if (salaryMin != null && salaryMax != null) {
      return '${_formatSalary(salaryMin!)} - ${_formatSalary(salaryMax!)}';
    }
    if (salaryMin != null) {
      return 'Từ ${_formatSalary(salaryMin!)}';
    }
    return 'Đến ${_formatSalary(salaryMax!)}';
  }

  String _formatSalary(double amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(0)}tr';
    }
    return '${(amount / 1000).toStringAsFixed(0)}k';
  }
}
