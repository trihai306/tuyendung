import { useTheme } from '../../contexts/ThemeContext';
import { XMarkIcon, ExclamationTriangleIcon } from '../../components/ui/icons';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Huỷ',
    isLoading = false,
    variant = 'danger',
}: ConfirmDialogProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    if (!isOpen) return null;

    const variantColors = {
        danger: {
            icon: 'bg-red-500/20 text-red-500',
            button: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            icon: 'bg-amber-500/20 text-amber-500',
            button: 'bg-amber-600 hover:bg-amber-700',
        },
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Dialog */}
            <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
                isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
            }`}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${variantColors[variant].icon}`}>
                        <ExclamationTriangleIcon className="w-8 h-8" />
                    </div>

                    {/* Title */}
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {title}
                    </h3>

                    {/* Message */}
                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                                isDark
                                    ? 'bg-slate-800 text-white hover:bg-slate-700'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variantColors[variant].button}`}
                        >
                            {isLoading && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
