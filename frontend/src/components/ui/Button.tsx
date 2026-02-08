import { forwardRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    children: React.ReactNode;
}

/**
 * Button - Reusable button component with dark mode support
 *
 * Usage:
 * ```tsx
 * <Button variant="primary" icon={<PlusIcon />}>Tạo mới</Button>
 * <Button variant="danger" loading={isDeleting}>Xóa</Button>
 * <Button variant="outline" size="sm">Hủy</Button>
 * <Button variant="ghost" fullWidth>Xem thêm</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', loading = false, icon, fullWidth = false, children, className = '', disabled, ...props }, ref) => {
        const { resolvedTheme } = useTheme();
        const isDark = resolvedTheme === 'dark';

        const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer select-none';

        const variants: Record<string, string> = {
            primary: `bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 focus:ring-emerald-500 ${isDark ? 'focus:ring-offset-slate-900' : 'focus:ring-offset-white'}`,
            secondary: isDark
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 focus:ring-slate-500 focus:ring-offset-slate-900'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 focus:ring-slate-400 focus:ring-offset-white',
            danger: `bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20 focus:ring-red-500 ${isDark ? 'focus:ring-offset-slate-900' : 'focus:ring-offset-white'}`,
            ghost: isDark
                ? 'text-slate-300 hover:bg-slate-800 hover:text-white focus:ring-slate-600 focus:ring-offset-slate-900'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus:ring-slate-400 focus:ring-offset-white',
            outline: isDark
                ? 'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 focus:ring-slate-500 focus:ring-offset-slate-900'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-400 focus:ring-offset-white',
        };

        const sizes: Record<string, string> = {
            xs: 'px-2.5 py-1 text-xs gap-1',
            sm: 'px-3 py-1.5 text-sm gap-1.5',
            md: 'px-4 py-2.5 text-sm gap-2',
            lg: 'px-6 py-3 text-base gap-2.5',
        };

        return (
            <button
                ref={ref}
                className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                ) : icon ? (
                    <span className="flex-shrink-0">{icon}</span>
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
