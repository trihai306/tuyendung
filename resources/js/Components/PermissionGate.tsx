import { Link } from '@inertiajs/react';
import { usePermission } from '@/hooks/usePermission';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import type { PermissionKey } from '@/types';

interface PermissionGateProps {
    /** Required permission key to access this content */
    permission?: PermissionKey;
    /** Required minimum role: 'owner' or 'manager' */
    role?: 'owner' | 'manager';
    /** Content to render when authorized */
    children: React.ReactNode;
    /** Optional fallback UI. If not provided, shows default Access Denied page */
    fallback?: React.ReactNode;
}

/**
 * Gate component that checks permissions before rendering children.
 * If the user lacks the required permission/role, shows an Access Denied screen.
 */
export default function PermissionGate({ permission, role, children, fallback }: PermissionGateProps) {
    const { can, isOwner, isManager } = usePermission();

    let hasAccess = true;

    if (permission) {
        hasAccess = can(permission);
    }

    if (role === 'owner') {
        hasAccess = hasAccess && isOwner;
    } else if (role === 'manager') {
        hasAccess = hasAccess && isManager;
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 mb-6">
                <ShieldX className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">
                Khong co quyen truy cap
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
                Ban khong co quyen de truy cap chuc nang nay.
                Vui long lien he quan tri vien de duoc cap quyen.
            </p>
            <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lai tong quan
                </Link>
            </Button>
        </div>
    );
}
