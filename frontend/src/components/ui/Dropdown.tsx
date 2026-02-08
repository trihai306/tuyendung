import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface DropdownItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
}

interface DropdownDivider {
    divider: true;
}

type DropdownItemType = DropdownItem | DropdownDivider;

interface DropdownProps {
    trigger: React.ReactNode;
    items: DropdownItemType[];
    align?: 'left' | 'right';
    className?: string;
}

function isDivider(item: DropdownItemType): item is DropdownDivider {
    return 'divider' in item;
}

/**
 * Dropdown - Action menu dropdown
 *
 * Usage:
 * ```tsx
 * <Dropdown
 *     trigger={<button><EllipsisIcon /></button>}
 *     items={[
 *         { label: 'Sửa', icon: <PencilIcon />, onClick: handleEdit },
 *         { divider: true },
 *         { label: 'Xóa', icon: <TrashIcon />, onClick: handleDelete, danger: true },
 *     ]}
 * />
 * ```
 */
export function Dropdown({ trigger, items, align = 'right', className = '' }: DropdownProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Update position when opening
    useEffect(() => {
        if (open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 4,
                left: align === 'right' ? rect.right : rect.left,
            });
        }
    }, [open, align]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;

        const handleClick = (e: MouseEvent) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
                menuRef.current && !menuRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    return (
        <>
            <div ref={triggerRef} className={`inline-flex ${className}`} onClick={() => setOpen(!open)}>
                {trigger}
            </div>

            {open && createPortal(
                <div
                    ref={menuRef}
                    className={`
                        fixed z-[200] min-w-[180px] rounded-xl shadow-xl overflow-hidden
                        ${isDark ? 'bg-slate-900 border border-slate-800 shadow-black/40' : 'bg-white border border-slate-200 shadow-slate-200/60'}
                    `}
                    style={{
                        top: position.top,
                        ...(align === 'right' ? { right: window.innerWidth - position.left } : { left: position.left }),
                        animation: 'dropdownIn 0.15s ease-out',
                    }}
                >
                    <div className="py-1.5">
                        {items.map((item, idx) => {
                            if (isDivider(item)) {
                                return <div key={idx} className={`my-1.5 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />;
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (!item.disabled) {
                                            item.onClick();
                                            setOpen(false);
                                        }
                                    }}
                                    disabled={item.disabled}
                                    className={`
                                        w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors text-left
                                        ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}
                                        ${item.danger
                                            ? isDark
                                                ? 'text-red-400 hover:bg-red-500/10'
                                                : 'text-red-600 hover:bg-red-50'
                                            : isDark
                                                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                        }
                                    `}
                                >
                                    {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    <style>{`@keyframes dropdownIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                </div>,
                document.body
            )}
        </>
    );
}
