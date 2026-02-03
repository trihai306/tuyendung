/// Permission types and enums for Viecly app

/// Company roles hierarchy
enum CompanyRole {
  owner,  // Full access
  admin,  // Management access
  member, // Limited access
  none,   // No company
}

/// Extension methods for CompanyRole
extension CompanyRoleExtension on CompanyRole {
  String get displayName {
    switch (this) {
      case CompanyRole.owner:
        return 'Chủ sở hữu';
      case CompanyRole.admin:
        return 'Quản trị viên';
      case CompanyRole.member:
        return 'Nhân viên';
      case CompanyRole.none:
        return 'Chưa có công ty';
    }
  }

  bool get isManager => this == CompanyRole.owner || this == CompanyRole.admin;
  bool get isOwner => this == CompanyRole.owner;
  bool get isAdmin => this == CompanyRole.admin;
  bool get isMember => this == CompanyRole.member;
  bool get hasCompany => this != CompanyRole.none;

  /// Parse from string
  static CompanyRole fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'owner':
        return CompanyRole.owner;
      case 'admin':
        return CompanyRole.admin;
      case 'member':
        return CompanyRole.member;
      default:
        return CompanyRole.none;
    }
  }
}

/// Granular permissions for app features
enum Permission {
  // Dashboard
  viewDashboard,
  viewAdminDashboard,
  viewMemberDashboard,

  // Jobs Management
  viewJobs,
  viewAllJobs,        // View all company jobs
  viewAssignedJobs,   // View only assigned jobs
  createJob,
  editJob,
  deleteJob,
  publishJob,
  closeJob,

  // Candidates
  viewCandidates,
  viewAllCandidates,
  viewAssignedCandidates,
  editCandidate,
  moveCandidateStage,
  scheduleInterview,
  makeOffer,
  rejectCandidate,

  // Employees Management
  viewEmployees,
  inviteEmployee,
  changeEmployeeRole,
  removeEmployee,

  // Company Settings
  viewCompany,
  editCompany,
  manageSubscription,

  // Messages/Inbox
  viewMessages,
  viewAllMessages,
  viewAssignedMessages,
  sendMessage,

  // Zalo Accounts
  viewZaloAccounts,
  manageZaloAccounts,
  assignZaloAccount,
}

/// Access matrix mapping roles to permissions
class PermissionMatrix {
  static const Map<CompanyRole, Set<Permission>> _matrix = {
    CompanyRole.owner: {
      // Full access
      Permission.viewDashboard,
      Permission.viewAdminDashboard,
      Permission.viewJobs,
      Permission.viewAllJobs,
      Permission.createJob,
      Permission.editJob,
      Permission.deleteJob,
      Permission.publishJob,
      Permission.closeJob,
      Permission.viewCandidates,
      Permission.viewAllCandidates,
      Permission.editCandidate,
      Permission.moveCandidateStage,
      Permission.scheduleInterview,
      Permission.makeOffer,
      Permission.rejectCandidate,
      Permission.viewEmployees,
      Permission.inviteEmployee,
      Permission.changeEmployeeRole,
      Permission.removeEmployee,
      Permission.viewCompany,
      Permission.editCompany,
      Permission.manageSubscription,
      Permission.viewMessages,
      Permission.viewAllMessages,
      Permission.sendMessage,
      Permission.viewZaloAccounts,
      Permission.manageZaloAccounts,
      Permission.assignZaloAccount,
    },
    CompanyRole.admin: {
      // Management access (no company edit, no changeEmployeeRole)
      Permission.viewDashboard,
      Permission.viewAdminDashboard,
      Permission.viewJobs,
      Permission.viewAllJobs,
      Permission.createJob,
      Permission.editJob,
      Permission.deleteJob,
      Permission.publishJob,
      Permission.closeJob,
      Permission.viewCandidates,
      Permission.viewAllCandidates,
      Permission.editCandidate,
      Permission.moveCandidateStage,
      Permission.scheduleInterview,
      Permission.makeOffer,
      Permission.rejectCandidate,
      Permission.viewEmployees,
      Permission.inviteEmployee,
      Permission.removeEmployee,
      Permission.viewCompany,
      Permission.viewMessages,
      Permission.viewAllMessages,
      Permission.sendMessage,
      Permission.viewZaloAccounts,
      Permission.manageZaloAccounts,
      Permission.assignZaloAccount,
    },
    CompanyRole.member: {
      // Limited access (only assigned content)
      Permission.viewDashboard,
      Permission.viewMemberDashboard,
      Permission.viewJobs,
      Permission.viewAssignedJobs,
      Permission.viewCandidates,
      Permission.viewAssignedCandidates,
      Permission.editCandidate,
      Permission.moveCandidateStage,
      Permission.scheduleInterview,
      Permission.viewCompany,
      Permission.viewMessages,
      Permission.viewAssignedMessages,
      Permission.sendMessage,
      Permission.viewZaloAccounts,
    },
    CompanyRole.none: <Permission>{},
  };

  /// Check if role has permission
  static bool hasPermission(CompanyRole role, Permission permission) {
    return _matrix[role]?.contains(permission) ?? false;
  }

  /// Get all permissions for role
  static Set<Permission> getPermissions(CompanyRole role) {
    return _matrix[role] ?? {};
  }
}
