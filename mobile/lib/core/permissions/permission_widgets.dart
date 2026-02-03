import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'permission_types.dart';
import 'permission_provider.dart';

/// Widget to conditionally show/hide children based on permissions
///
/// Example:
/// ```dart
/// PermissionGate(
///   permission: Permission.createJob,
///   child: FloatingActionButton(onPressed: createJob),
/// )
/// ```
class PermissionGate extends StatelessWidget {
  final Permission? permission;
  final List<Permission>? permissions;
  final bool requireAll;
  final CompanyRole? requiredRole;
  final Widget child;
  final Widget? fallback;

  const PermissionGate({
    super.key,
    this.permission,
    this.permissions,
    this.requireAll = false,
    this.requiredRole,
    required this.child,
    this.fallback,
  }) : assert(permission != null || permissions != null || requiredRole != null);

  @override
  Widget build(BuildContext context) {
    return Consumer<PermissionProvider>(
      builder: (context, provider, _) {
        bool hasAccess = true;

        // Check role requirement
        if (requiredRole != null) {
          hasAccess = provider.hasRole(requiredRole!);
        }

        // Check single permission
        if (hasAccess && permission != null) {
          hasAccess = provider.can(permission!);
        }

        // Check multiple permissions
        if (hasAccess && permissions != null && permissions!.isNotEmpty) {
          hasAccess = requireAll
              ? provider.canAll(permissions!)
              : provider.canAny(permissions!);
        }

        if (hasAccess) {
          return child;
        }

        return fallback ?? const SizedBox.shrink();
      },
    );
  }
}

/// Widget to protect entire routes/screens
///
/// Example:
/// ```dart
/// ProtectedRoute(
///   permission: Permission.viewEmployees,
///   child: EmployeeListScreen(),
/// )
/// ```
class ProtectedRoute extends StatelessWidget {
  final Permission? permission;
  final CompanyRole? requiredRole;
  final bool requireAuth;
  final Widget child;
  final Widget? accessDeniedWidget;
  final VoidCallback? onAccessDenied;

  const ProtectedRoute({
    super.key,
    this.permission,
    this.requiredRole,
    this.requireAuth = true,
    required this.child,
    this.accessDeniedWidget,
    this.onAccessDenied,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<PermissionProvider>(
      builder: (context, provider, _) {
        // Check auth
        if (requireAuth && !provider.isLoggedIn) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            onAccessDenied?.call();
          });
          return accessDeniedWidget ?? const _AccessDeniedScreen(
            message: 'Vui lòng đăng nhập để tiếp tục',
          );
        }

        // Check role
        if (requiredRole != null && !provider.hasRole(requiredRole!)) {
          return accessDeniedWidget ?? _AccessDeniedScreen(
            message: 'Bạn cần quyền ${requiredRole!.displayName} để truy cập',
          );
        }

        // Check permission
        if (permission != null && !provider.can(permission!)) {
          return accessDeniedWidget ?? const _AccessDeniedScreen(
            message: 'Bạn không có quyền truy cập trang này',
          );
        }

        return child;
      },
    );
  }
}

/// Widget to build different UI based on user role
///
/// Example:
/// ```dart
/// RoleBasedBuilder(
///   ownerBuilder: () => AdminDashboard(),
///   adminBuilder: () => AdminDashboard(),
///   memberBuilder: () => MemberDashboard(),
/// )
/// ```
class RoleBasedBuilder extends StatelessWidget {
  final Widget Function()? ownerBuilder;
  final Widget Function()? adminBuilder;
  final Widget Function()? memberBuilder;
  final Widget Function()? defaultBuilder;

  const RoleBasedBuilder({
    super.key,
    this.ownerBuilder,
    this.adminBuilder,
    this.memberBuilder,
    this.defaultBuilder,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<PermissionProvider>(
      builder: (context, provider, _) {
        switch (provider.role) {
          case CompanyRole.owner:
            return ownerBuilder?.call() ?? 
                   adminBuilder?.call() ?? 
                   defaultBuilder?.call() ?? 
                   const SizedBox.shrink();
          case CompanyRole.admin:
            return adminBuilder?.call() ?? 
                   defaultBuilder?.call() ?? 
                   const SizedBox.shrink();
          case CompanyRole.member:
            return memberBuilder?.call() ?? 
                   defaultBuilder?.call() ?? 
                   const SizedBox.shrink();
          case CompanyRole.none:
            return defaultBuilder?.call() ?? const SizedBox.shrink();
        }
      },
    );
  }
}

/// Widget to show content only for managers (Owner + Admin)
class ManagerOnly extends StatelessWidget {
  final Widget child;
  final Widget? fallback;

  const ManagerOnly({
    super.key,
    required this.child,
    this.fallback,
  });

  @override
  Widget build(BuildContext context) {
    return PermissionGate(
      requiredRole: CompanyRole.admin,
      fallback: fallback,
      child: child,
    );
  }
}

/// Widget to show content only for owners
class OwnerOnly extends StatelessWidget {
  final Widget child;
  final Widget? fallback;

  const OwnerOnly({
    super.key,
    required this.child,
    this.fallback,
  });

  @override
  Widget build(BuildContext context) {
    return PermissionGate(
      requiredRole: CompanyRole.owner,
      fallback: fallback,
      child: child,
    );
  }
}

/// Default access denied screen
class _AccessDeniedScreen extends StatelessWidget {
  final String message;

  const _AccessDeniedScreen({required this.message});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.lock_outline,
                size: 80,
                color: Colors.grey[400],
              ),
              const SizedBox(height: 24),
              const Text(
                'Không có quyền truy cập',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                message,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Quay lại'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Extension to easily access permissions from BuildContext
extension PermissionContextExtension on BuildContext {
  PermissionProvider get permissions => read<PermissionProvider>();
  
  bool can(Permission permission) => permissions.can(permission);
  bool canAny(List<Permission> permissions) => this.permissions.canAny(permissions);
  bool get isManager => permissions.isManager;
  bool get isOwner => permissions.isOwner;
  CompanyRole get userRole => permissions.role;
}
