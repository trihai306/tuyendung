import { useTheme } from '../../contexts/ThemeContext';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps {
    src?: string | null;
    name?: string;
    size?: AvatarSize;
    status?: AvatarStatus;
    className?: string;
}

/**
 * Avatar - User avatar with image, initials fallback, & status dot
 *
 * Usage:
 * ```tsx
 * <Avatar src="/avatar.jpg" name="Nguyễn Văn A" size="md" status="online" />
 * <Avatar name="Trần Thị B" size="lg" />
 * ```
 */
export function Avatar({ src, name, size = 'md', status, className = '' }: AvatarProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const sizeClasses: Record<AvatarSize, { container: string; text: string; statusDot: string }> = {
        xs: { container: 'w-6 h-6', text: 'text-[10px]', statusDot: 'w-2 h-2 border' },
        sm: { container: 'w-8 h-8', text: 'text-xs', statusDot: 'w-2.5 h-2.5 border-[1.5px]' },
        md: { container: 'w-10 h-10', text: 'text-sm', statusDot: 'w-3 h-3 border-2' },
        lg: { container: 'w-14 h-14', text: 'text-base', statusDot: 'w-3.5 h-3.5 border-2' },
        xl: { container: 'w-20 h-20', text: 'text-xl', statusDot: 'w-4 h-4 border-2' },
    };

    const statusColors: Record<AvatarStatus, string> = {
        online: 'bg-emerald-500',
        offline: isDark ? 'bg-slate-600' : 'bg-slate-400',
        busy: 'bg-red-500',
        away: 'bg-amber-500',
    };

    const s = sizeClasses[size];

    // Generate initials from name
    const initials = name
        ? name
            .split(' ')
            .filter(Boolean)
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : '?';

    // Generate a deterministic color from name
    const colorPalette = [
        'from-emerald-400 to-teal-500',
        'from-blue-400 to-indigo-500',
        'from-violet-400 to-purple-500',
        'from-amber-400 to-orange-500',
        'from-rose-400 to-pink-500',
        'from-cyan-400 to-sky-500',
    ];
    const colorIdx = name ? name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colorPalette.length : 0;

    return (
        <div className={`relative inline-flex flex-shrink-0 ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={name || 'Avatar'}
                    className={`${s.container} rounded-full object-cover ring-2 ${isDark ? 'ring-slate-800' : 'ring-white'}`}
                />
            ) : (
                <div
                    className={`${s.container} rounded-full flex items-center justify-center bg-gradient-to-br ${colorPalette[colorIdx]} text-white font-semibold ${s.text} ring-2 ${isDark ? 'ring-slate-800' : 'ring-white'}`}
                >
                    {initials}
                </div>
            )}

            {/* Status dot */}
            {status && (
                <span
                    className={`absolute bottom-0 right-0 ${s.statusDot} rounded-full ${statusColors[status]} ${isDark ? 'border-slate-900' : 'border-white'}`}
                />
            )}
        </div>
    );
}

// ─── Avatar Group ───────────────────────────────────────────

interface AvatarGroupProps {
    avatars: AvatarProps[];
    max?: number;
    size?: AvatarSize;
    className?: string;
}

/**
 * AvatarGroup - Stack of overlapping avatars
 *
 * Usage:
 * ```tsx
 * <AvatarGroup
 *     avatars={[{ name: 'A' }, { name: 'B' }, { name: 'C', src: '/c.jpg' }]}
 *     max={3}
 * />
 * ```
 */
export function AvatarGroup({ avatars, max = 4, size = 'sm', className = '' }: AvatarGroupProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const shown = avatars.slice(0, max);
    const remaining = avatars.length - max;

    const sizeClasses: Record<AvatarSize, { container: string; text: string }> = {
        xs: { container: 'w-6 h-6', text: 'text-[9px]' },
        sm: { container: 'w-8 h-8', text: 'text-[10px]' },
        md: { container: 'w-10 h-10', text: 'text-xs' },
        lg: { container: 'w-14 h-14', text: 'text-sm' },
        xl: { container: 'w-20 h-20', text: 'text-base' },
    };

    const s = sizeClasses[size];

    return (
        <div className={`flex -space-x-2 ${className}`}>
            {shown.map((avatar, idx) => (
                <Avatar key={idx} {...avatar} size={size} />
            ))}
            {remaining > 0 && (
                <div
                    className={`${s.container} rounded-full flex items-center justify-center font-semibold ${s.text} ring-2 ${isDark
                        ? 'bg-slate-700 text-slate-300 ring-slate-900'
                        : 'bg-slate-200 text-slate-600 ring-white'
                        }`}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
}
