import { useTheme } from '../../contexts/ThemeContext';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    children: React.ReactNode;
    className?: string;
}

/**
 * Badge - Status badge with dot indicator
 *
 * Usage:
 * ```tsx
 * <Badge variant="success">Đang mở</Badge>
 * <Badge variant="error" dot>Đã đóng</Badge>
 * <Badge variant="neutral" size="sm">Nháp</Badge>
 * ```
 */
export function Badge({ variant = 'neutral', size = 'md', dot = false, children, className = '' }: BadgeProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const colors: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
        success: {
            bg: isDark ? 'bg-emerald-500/12 ring-1 ring-emerald-500/20' : 'bg-emerald-50 ring-1 ring-emerald-200/60',
            text: isDark ? 'text-emerald-400' : 'text-emerald-700',
            dot: 'bg-emerald-500',
        },
        warning: {
            bg: isDark ? 'bg-amber-500/12 ring-1 ring-amber-500/20' : 'bg-amber-50 ring-1 ring-amber-200/60',
            text: isDark ? 'text-amber-400' : 'text-amber-700',
            dot: 'bg-amber-500',
        },
        error: {
            bg: isDark ? 'bg-red-500/12 ring-1 ring-red-500/20' : 'bg-red-50 ring-1 ring-red-200/60',
            text: isDark ? 'text-red-400' : 'text-red-700',
            dot: 'bg-red-500',
        },
        info: {
            bg: isDark ? 'bg-blue-500/12 ring-1 ring-blue-500/20' : 'bg-blue-50 ring-1 ring-blue-200/60',
            text: isDark ? 'text-blue-400' : 'text-blue-700',
            dot: 'bg-blue-500',
        },
        neutral: {
            bg: isDark ? 'bg-slate-700/50 ring-1 ring-slate-600/30' : 'bg-slate-100 ring-1 ring-slate-200/60',
            text: isDark ? 'text-slate-400' : 'text-slate-600',
            dot: isDark ? 'bg-slate-500' : 'bg-slate-400',
        },
    };

    const sizes: Record<BadgeSize, string> = {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
    };

    const c = colors[variant];

    return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${c.bg} ${c.text} ${sizes[size]} ${className}`}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
            {children}
        </span>
    );
}
