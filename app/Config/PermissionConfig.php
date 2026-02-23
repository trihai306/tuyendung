<?php

declare(strict_types=1);

namespace App\Config;

final class PermissionConfig
{
    /**
     * Permission matrix: role => [permission_key => bool]
     *
     * Roles hierarchy: owner > manager > member
     */
    private const PERMISSIONS = [
        'owner' => [
            // Team
            'team.view' => true,
            'team.invite' => true,
            'team.change_role' => true,
            'team.remove' => true,
            'team.regenerate_code' => true,

            // Jobs
            'jobs.view' => true,
            'jobs.create' => true,
            'jobs.edit' => true,
            'jobs.delete' => true,

            // Applications
            'applications.view' => true,
            'applications.update' => true,
            'applications.add_external' => true,

            // Interviews
            'interviews.create' => true,
            'interviews.update' => true,

            // Tasks
            'tasks.view_all' => true,
            'tasks.create' => true,
            'tasks.assign' => true,
            'tasks.update_any' => true,

            // Company profile
            'company.view' => true,
            'company.edit' => true,

            // Reports
            'reports.view' => true,
        ],

        'manager' => [
            // Team
            'team.view' => true,
            'team.invite' => true,
            'team.change_role' => false,
            'team.remove' => true,
            'team.regenerate_code' => false,

            // Jobs
            'jobs.view' => true,
            'jobs.create' => true,
            'jobs.edit' => true,
            'jobs.delete' => false,

            // Applications
            'applications.view' => true,
            'applications.update' => true,
            'applications.add_external' => true,

            // Interviews
            'interviews.create' => true,
            'interviews.update' => true,

            // Tasks
            'tasks.view_all' => true,
            'tasks.create' => true,
            'tasks.assign' => true,
            'tasks.update_any' => true,

            // Company profile
            'company.view' => true,
            'company.edit' => false,

            // Reports
            'reports.view' => true,
        ],

        'member' => [
            // Team
            'team.view' => true,
            'team.invite' => false,
            'team.change_role' => false,
            'team.remove' => false,
            'team.regenerate_code' => false,

            // Jobs
            'jobs.view' => true,
            'jobs.create' => false,
            'jobs.edit' => false,
            'jobs.delete' => false,

            // Applications
            'applications.view' => true,
            'applications.update' => false,
            'applications.add_external' => false,

            // Interviews
            'interviews.create' => false,
            'interviews.update' => false,

            // Tasks
            'tasks.view_all' => false,
            'tasks.create' => false,
            'tasks.assign' => false,
            'tasks.update_any' => false,

            // Company profile
            'company.view' => false,
            'company.edit' => false,

            // Reports
            'reports.view' => false,
        ],
    ];

    /**
     * Check if a role has a specific permission.
     */
    public static function can(string $role, string $permission): bool
    {
        return self::PERMISSIONS[$role][$permission] ?? false;
    }

    /**
     * Get all permissions for a given role (only truthy keys).
     */
    public static function getPermissions(string $role): array
    {
        $perms = self::PERMISSIONS[$role] ?? [];

        return array_keys(array_filter($perms));
    }

    /**
     * Get the full permission map for a role (key => bool).
     */
    public static function getAllPermissionsFor(string $role): array
    {
        return self::PERMISSIONS[$role] ?? [];
    }

    /**
     * Get all valid roles.
     */
    public static function roles(): array
    {
        return array_keys(self::PERMISSIONS);
    }
}
