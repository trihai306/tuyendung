import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
    content: string;
    position?: TooltipPosition;
    delay?: number;
    children: React.ReactNode;
    className?: string;
}

/**
 * Tooltip - Hover tooltip with arrow
 *
 * Usage:
 * ```tsx
 * <Tooltip content="Thêm mới" position="top">
 *     <button><PlusIcon /></button>
 * </Tooltip>
 * ```
 */
export function Tooltip({ content, position = 'top', delay = 200, children, className = '' }: TooltipProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    const handleEnter = () => {
        timerRef.current = setTimeout(() => setVisible(true), delay);
    };

    const handleLeave = () => {
        clearTimeout(timerRef.current);
        setVisible(false);
    };

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    const positionClasses: Record<TooltipPosition, string> = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses: Record<TooltipPosition, string> = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-current border-x-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-current border-x-transparent border-t-transparent',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-current border-y-transparent border-r-transparent',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-current border-y-transparent border-l-transparent',
    };

    return (
        <div className={`relative inline-flex ${className}`} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            {children}
            {visible && (
                <div
                    className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
                    style={{ animation: 'tooltipIn 0.15s ease-out' }}
                >
                    <div className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shadow-lg ${isDark
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'bg-slate-900 text-white'
                        }`}>
                        {content}
                        <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]} ${isDark ? 'text-slate-700' : 'text-slate-900'}`} />
                    </div>
                </div>
            )}
            {visible && (
                <style>{`@keyframes tooltipIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
            )}
        </div>
    );
}
