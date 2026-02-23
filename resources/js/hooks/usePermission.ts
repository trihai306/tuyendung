import { usePage } from '@inertiajs/react';
import type { PageProps, PermissionKey, CompanyRole } from '@/types';

interface UsePermissionReturn {
    /** Current company role or null if not in a company */
    role: CompanyRole | null;

    /** Check if user has a specific permission */
    can: (permission: PermissionKey) => boolean;

    /** Check if user has at least manager role */
    isManager: boolean;

    /** Check if user is company owner */
    isOwner: boolean;

    /** Check if user is a member (lowest role) */
    isMember: boolean;
}

export function usePermission(): UsePermissionReturn {
    const { auth } = usePage<PageProps>().props;
    const role = auth.companyRole ?? null;
    const permissions = auth.permissions ?? {};

    const can = (permission: PermissionKey): boolean => {
        return permissions[permission] === true;
    };

    return {
        role,
        can,
        isOwner: role === 'owner',
        isManager: role === 'manager' || role === 'owner',
        isMember: role === 'member',
    };
}
