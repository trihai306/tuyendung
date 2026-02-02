import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppSelector } from '../app/hooks';
import apiClient from '../services/apiClient';

// Types
export type CompanyRole = 'owner' | 'admin' | 'member';

export interface PermissionUser {
    id: number;
    name: string;
    email: string;
    company_id: number | null;
    company_role: CompanyRole | null;
    permissions: string[];
}

export interface CompanyInfo {
    id: number;
    name: string;
}

// Permission keys - sync với PermissionsPage
export const PERMISSION_KEYS = {
    // Tuyển dụng
    JOBS_VIEW: 'jobs.view',
    JOBS_CREATE: 'jobs.create',
    JOBS_EDIT: 'jobs.edit',
    JOBS_DELETE: 'jobs.delete',

    // Ứng viên
    CANDIDATES_VIEW: 'candidates.view',
    CANDIDATES_MANAGE: 'candidates.manage',
    CANDIDATES_NOTES: 'candidates.notes',

    // Inbox
    INBOX_VIEW: 'inbox.view',
    INBOX_REPLY: 'inbox.reply',

    // Báo cáo
    REPORTS_VIEW: 'reports.view',
    REPORTS_EXPORT: 'reports.export',

    // Team
    TEAM_VIEW: 'team.view',
    TEAM_INVITE: 'team.invite',
} as const;

export type PermissionKey = typeof PERMISSION_KEYS[keyof typeof PERMISSION_KEYS];

// Default permissions by role
const DEFAULT_PERMISSIONS: Record<CompanyRole, PermissionKey[]> = {
    owner: Object.values(PERMISSION_KEYS),
    admin: Object.values(PERMISSION_KEYS),
    member: [
        PERMISSION_KEYS.JOBS_VIEW,
        PERMISSION_KEYS.CANDIDATES_VIEW,
        PERMISSION_KEYS.INBOX_VIEW,
        PERMISSION_KEYS.INBOX_REPLY,
        PERMISSION_KEYS.REPORTS_VIEW,
        PERMISSION_KEYS.TEAM_VIEW,
    ],
};

/**
 * Hook để check quyền của user trong company
 * 
 * @example
 * ```tsx
 * const { isOwner, isAdmin, can, isManager } = usePermission();
 * 
 * // Check role
 * if (isOwner) { ... }
 * if (isManager) { ... } // owner hoặc admin
 * 
 * // Check permission cụ thể
 * if (can('jobs.create')) { ... }
 * if (can(PERMISSION_KEYS.CANDIDATES_MANAGE)) { ... }
 * ```
 */
export function usePermission() {
    const authUser = useAppSelector((state) => state.auth.user);
    const [user, setUser] = useState<PermissionUser | null>(null);
    const [company, setCompany] = useState<CompanyInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user data with company role and permissions
    const fetchUserData = useCallback(async () => {
        if (!authUser) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Fetch current user với company info
            const response = await apiClient.get('/user');
            const userData = response.data.data || response.data;

            setUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                company_id: userData.company_id || null,
                company_role: userData.company_role || null,
                permissions: userData.permissions || [],
            });

            // Nếu có company, lấy thông tin company
            if (userData.company) {
                setCompany({
                    id: userData.company.id,
                    name: userData.company.name,
                });
            } else if (userData.company_id) {
                // Fetch company info nếu chưa có
                try {
                    const companyRes = await apiClient.get('/company');
                    if (companyRes.data.data) {
                        setCompany({
                            id: companyRes.data.data.id,
                            name: companyRes.data.data.name,
                        });
                    }
                } catch {
                    // Ignore company fetch error
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch user data');
            console.error('usePermission: Failed to fetch user data', err);
        } finally {
            setIsLoading(false);
        }
    }, [authUser]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Role checks
    const role = user?.company_role || null;
    const isOwner = role === 'owner';
    const isAdmin = role === 'admin';
    const isMember = role === 'member';
    const isManager = isOwner || isAdmin;

    // Get effective permissions (from user or default by role)
    const effectivePermissions = useMemo(() => {
        if (!user || !role) return [];

        // Owner và Admin always có full permissions
        if (isOwner || isAdmin) {
            return DEFAULT_PERMISSIONS.owner;
        }

        // Member: dùng permissions từ DB hoặc default
        if (user.permissions && user.permissions.length > 0) {
            return user.permissions;
        }

        return DEFAULT_PERMISSIONS.member;
    }, [user, role, isOwner, isAdmin]);

    /**
     * Check if user has a specific permission
     */
    const can = useCallback((permission: PermissionKey | string): boolean => {
        // Owner và Admin luôn có tất cả quyền
        if (isOwner || isAdmin) return true;

        // Check permission trong danh sách
        return effectivePermissions.includes(permission);
    }, [effectivePermissions, isOwner, isAdmin]);

    /**
     * Check if user has ALL of the specified permissions
     */
    const canAll = useCallback((permissions: (PermissionKey | string)[]): boolean => {
        return permissions.every(p => can(p));
    }, [can]);

    /**
     * Check if user has ANY of the specified permissions
     */
    const canAny = useCallback((permissions: (PermissionKey | string)[]): boolean => {
        return permissions.some(p => can(p));
    }, [can]);

    // Company checks
    const hasCompany = Boolean(user?.company_id && company);
    const companyId = company?.id || null;
    const companyName = company?.name || null;

    return {
        // Loading state
        isLoading,
        error,

        // User info
        user,

        // Role checks
        role,
        isOwner,
        isAdmin,
        isMember,
        isManager, // owner hoặc admin

        // Company info
        hasCompany,
        companyId,
        companyName,
        company,

        // Permission checks
        permissions: effectivePermissions,
        can,
        canAll,
        canAny,

        // Refresh
        refresh: fetchUserData,
    };
}

// Alias for backwards compatibility
export const useCompanyRole = usePermission;

export default usePermission;
