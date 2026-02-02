import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Toast types
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    toast: {
        success: (title: string, message?: string) => void;
        error: (title: string, message?: string) => void;
        warning: (title: string, message?: string) => void;
        info: (title: string, message?: string) => void;
    };
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * useToast Hook - Access toast functionality
 * 
 * Usage:
 * ```tsx
 * const { toast } = useToast();
 * toast.success('Thành công', 'Đã lưu dữ liệu');
 * toast.error('Lỗi', 'Không thể kết nối');
 * ```
 */
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

/**
 * ToastProvider - Wrap your app to enable toast notifications
 */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: Toast = { id, type, title, message, duration };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (title: string, message?: string) => addToast('success', title, message),
        error: (title: string, message?: string) => addToast('error', title, message, 6000),
        warning: (title: string, message?: string) => addToast('warning', title, message),
        info: (title: string, message?: string) => addToast('info', title, message),
    };

    return (
        <ToastContext.Provider value={{ toasts, toast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

// Toast Container - Renders all toasts
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} isDark={isDark} />
            ))}
        </div>
    );
}

// Individual Toast Item
function ToastItem({ toast, onRemove, isDark }: { toast: Toast; onRemove: (id: string) => void; isDark: boolean }) {
    const icons = {
        success: (
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
        ),
    };

    const borderColors = {
        success: 'border-l-emerald-500',
        error: 'border-l-red-500',
        warning: 'border-l-amber-500',
        info: 'border-l-blue-500',
    };

    return (
        <div
            className={`pointer-events-auto w-full rounded-lg shadow-lg border-l-4 p-4 animate-in slide-in-from-right fade-in duration-300 ${borderColors[toast.type]
                } ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {toast.title}
                    </p>
                    {toast.message && (
                        <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {toast.message}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => onRemove(toast.id)}
                    className={`flex-shrink-0 p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default ToastProvider;
