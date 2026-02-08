import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    hideCloseButton?: boolean;
}

/**
 * Modal - Reusable modal dialog with dark mode & Portal rendering
 *
 * Usage:
 * ```tsx
 * <Modal isOpen={show} onClose={() => setShow(false)} title="Tiêu đề" size="md"
 *     footer={<><Button variant="ghost" onClick={close}>Hủy</Button><Button>Lưu</Button></>}
 * >
 *     <div className="p-6">Nội dung</div>
 * </Modal>
 * ```
 */
export function Modal({ isOpen, onClose, title, children, footer, size = 'md', hideCloseButton = false }: ModalProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes: Record<string, string> = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
        full: 'max-w-5xl',
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                style={{ animation: 'fadeIn 0.2s ease-out' }}
            />

            {/* Dialog */}
            <div
                className={`
                    relative w-full ${sizes[size]} max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden
                    ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}
                `}
                style={{ animation: 'scaleIn 0.2s ease-out' }}
            >
                {/* Header */}
                {title && (
                    <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
                        {!hideCloseButton && (
                            <button
                                onClick={onClose}
                                className={`p-1.5 rounded-lg transition-colors ${isDark
                                    ? 'text-slate-500 hover:text-white hover:bg-slate-800'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
                        {footer}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>,
        document.body
    );
}
