/// Seat model for employee management
class Seat {
  final int userId;
  final String userName;
  final String userEmail;
  final String? avatar;
  final String role;
  final DateTime? assignedAt;

  Seat({
    required this.userId,
    required this.userName,
    required this.userEmail,
    this.avatar,
    required this.role,
    this.assignedAt,
  });

  factory Seat.fromJson(Map<String, dynamic> json) {
    return Seat(
      userId: json['user_id'] as int,
      userName: json['user_name'] as String? ?? json['name'] as String? ?? 'Unknown',
      userEmail: json['user_email'] as String? ?? json['email'] as String? ?? '',
      avatar: json['avatar'] as String?,
      role: json['role'] as String? ?? 'member',
      assignedAt: json['assigned_at'] != null
          ? DateTime.parse(json['assigned_at'] as String)
          : null,
    );
  }

  String get roleDisplay {
    switch (role) {
      case 'owner':
        return 'Chủ sở hữu';
      case 'admin':
        return 'Quản trị viên';
      case 'member':
        return 'Nhân viên';
      default:
        return role;
    }
  }

  String get roleColor {
    switch (role) {
      case 'owner':
        return 'primary';
      case 'admin':
        return 'warning';
      case 'member':
        return 'info';
      default:
        return 'default';
    }
  }

  bool get isManager => role == 'owner' || role == 'admin';
}

/// Company seats info
class CompanySeats {
  final int totalSeats;
  final int usedSeats;
  final int availableSeats;
  final List<Seat> members;

  CompanySeats({
    required this.totalSeats,
    required this.usedSeats,
    required this.availableSeats,
    required this.members,
  });

  factory CompanySeats.fromJson(Map<String, dynamic> json) {
    final membersJson = json['members'] as List? ?? [];
    return CompanySeats(
      totalSeats: json['total_seats'] as int? ?? 0,
      usedSeats: json['used_seats'] as int? ?? 0,
      availableSeats: json['available_seats'] as int? ?? 0,
      members: membersJson.map((m) => Seat.fromJson(m as Map<String, dynamic>)).toList(),
    );
  }

  factory CompanySeats.empty() {
    return CompanySeats(
      totalSeats: 0,
      usedSeats: 0,
      availableSeats: 0,
      members: [],
    );
  }
}
