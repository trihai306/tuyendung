import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonProps {
    className?: string;
}

/**
 * Skeleton - Shimmer loading placeholder
 *
 * Usage:
 * ```tsx
 * <Skeleton className="h-5 w-3/4" />
 * <Skeleton.Circle size="md" />
 * <Skeleton.Card />
 * ```
 */
export function Skeleton({ className = '' }: SkeletonProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <div
            className={`rounded-lg animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'} ${className}`}
        />
    );
}

// ─── Circle ─────────────────────────────────────────────────

interface SkeletonCircleProps {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
}

function SkeletonCircle({ size = 'md', className = '' }: SkeletonCircleProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const sizes: Record<string, string> = {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
    };

    return (
        <div className={`rounded-full animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'} ${sizes[size]} ${className}`} />
    );
}

// ─── Card ───────────────────────────────────────────────────

interface SkeletonCardProps {
    lines?: number;
    className?: string;
}

function SkeletonCard({ lines = 3, className = '' }: SkeletonCardProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <div className={`rounded-2xl border p-5 space-y-3 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} ${className}`}>
            <div className={`h-5 rounded-lg w-3/4 animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            {Array.from({ length: lines - 1 }).map((_, i) => (
                <div
                    key={i}
                    className={`h-4 rounded-lg animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
                    style={{ width: `${60 + Math.random() * 30}%` }}
                />
            ))}
        </div>
    );
}

// ─── List ───────────────────────────────────────────────────

interface SkeletonListProps {
    count?: number;
    className?: string;
}

function SkeletonList({ count = 3, className = '' }: SkeletonListProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    <div className="flex-1 space-y-2">
                        <div className={`h-4 rounded-lg w-2/3 animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                        <div className={`h-3 rounded-lg w-1/3 animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Attach sub-components
Skeleton.Circle = SkeletonCircle;
Skeleton.Card = SkeletonCard;
Skeleton.List = SkeletonList;
