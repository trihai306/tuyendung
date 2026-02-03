import 'package:flutter/foundation.dart';
import '../../features/auth/data/models/user_model.dart';
import '../../features/auth/data/repositories/auth_repository.dart';
import 'permission_types.dart';

/// Provider for managing user permissions throughout the app
class PermissionProvider extends ChangeNotifier {
  final AuthRepository _authRepository;
  
  PermissionProvider(this._authRepository) {
    // Listen to auth changes
    _authRepository.addListener(_onAuthChanged);
  }

  void _onAuthChanged() {
    notifyListeners();
  }

  @override
  void dispose() {
    _authRepository.removeListener(_onAuthChanged);
    super.dispose();
  }

  /// Current user
  User? get user => _authRepository.user;

  /// Current company role
  CompanyRole get role {
    final roleString = user?.companyRole;
    return CompanyRoleExtension.fromString(roleString);
  }

  /// Role helpers
  bool get isOwner => role == CompanyRole.owner;
  bool get isAdmin => role == CompanyRole.admin;
  bool get isMember => role == CompanyRole.member;
  bool get isManager => role.isManager;
  bool get hasCompany => role.hasCompany;
  bool get isLoggedIn => _authRepository.isLoggedIn;

  /// Check single permission
  bool can(Permission permission) {
    return PermissionMatrix.hasPermission(role, permission);
  }

  /// Check if user has ANY of the permissions
  bool canAny(List<Permission> permissions) {
    return permissions.any((p) => can(p));
  }

  /// Check if user has ALL permissions
  bool canAll(List<Permission> permissions) {
    return permissions.every((p) => can(p));
  }

  /// Check role requirement
  bool hasRole(CompanyRole requiredRole) {
    if (requiredRole == CompanyRole.none) return true;
    if (role == CompanyRole.owner) return true; // Owner has all roles
    if (role == CompanyRole.admin && requiredRole != CompanyRole.owner) return true;
    return role == requiredRole;
  }

  /// Check if current user can manage another user
  bool canManageUser(String? targetRole) {
    final target = CompanyRoleExtension.fromString(targetRole);
    
    // Owner can manage anyone
    if (isOwner) return target != CompanyRole.owner;
    
    // Admin can manage members only
    if (isAdmin) return target == CompanyRole.member;
    
    return false;
  }

  /// Get display text for current role
  String get roleDisplayName => role.displayName;

  /// Debug info
  @override
  String toString() {
    return 'PermissionProvider(user: ${user?.email}, role: $role)';
  }
}
