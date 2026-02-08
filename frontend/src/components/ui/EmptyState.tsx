import { useTheme } from '../../contexts/ThemeContext';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
    compact?: boolean;
}

/**
 * EmptyState - Reusable empty state placeholder
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *     icon={<InboxIcon className="w-10 h-10" />}
 *     title="Chưa có dữ liệu"
 *     description="Bắt đầu bằng cách tạo mục đầu tiên"
 *     action={<Button icon={<PlusIcon />}>Tạo mới</Button>}
 * />
 * ```
 */
export function EmptyState({ icon, title, description, action, className = '', compact = false }: EmptyStateProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-16 px-6'} ${className}`}>
            {icon && (
                <div className={`
                    relative mb-5
                    ${compact ? '' : 'w-20 h-20'}
                `}>
                    {!compact && (
                        <>
                            <div className={`absolute inset-0 rounded-2xl rotate-6 ${isDark ? 'bg-emerald-500/8' : 'bg-emerald-100/60'}`} />
                            <div className={`absolute inset-0 rounded-2xl -rotate-3 ${isDark ? 'bg-teal-500/8' : 'bg-teal-100/60'}`} />
                            <div className={`relative w-full h-full rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <div className={isDark ? 'text-slate-500' : 'text-slate-400'}>{icon}</div>
                            </div>
                        </>
                    )}
                    {compact && <div className={isDark ? 'text-slate-500' : 'text-slate-400'}>{icon}</div>}
                </div>
            )}

            <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {title}
            </h3>

            {description && (
                <p className={`${compact ? 'text-xs' : 'text-sm'} max-w-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {description}
                </p>
            )}

            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
