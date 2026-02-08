import { forwardRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// ─── Input ──────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
}

/**
 * Input - Reusable text input with dark mode
 *
 * Usage:
 * ```tsx
 * <Input label="Email" icon={<MailIcon />} placeholder="you@example.com" required />
 * <Input error="Trường này bắt buộc" />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
        const { resolvedTheme } = useTheme();
        const isDark = resolvedTheme === 'dark';
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={`
                            w-full rounded-xl text-sm transition-all duration-200 focus:outline-none
                            ${icon ? 'pl-10 pr-4' : 'px-4'} py-2.5
                            ${error
                                ? isDark
                                    ? 'border-red-500/50 bg-red-500/5 text-white focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                                    : 'border-red-300 bg-red-50/50 text-slate-800 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                                : isDark
                                    ? 'border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15'
                                    : 'border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10'
                            }
                            border
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && <p className={`mt-1.5 text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
                {helperText && !error && (
                    <p className={`mt-1.5 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// ─── Textarea ───────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

/**
 * Textarea - Multiline text input with dark mode
 *
 * Usage:
 * ```tsx
 * <Textarea label="Mô tả" rows={4} placeholder="Nhập mô tả..." />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helperText, className = '', id, ...props }, ref) => {
        const { resolvedTheme } = useTheme();
        const isDark = resolvedTheme === 'dark';
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    rows={props.rows || 3}
                    className={`
                        w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 focus:outline-none resize-y
                        ${error
                            ? isDark
                                ? 'border-red-500/50 bg-red-500/5 text-white focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                                : 'border-red-300 bg-red-50/50 text-slate-800 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                            : isDark
                                ? 'border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15'
                                : 'border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10'
                        }
                        border
                        ${className}
                    `}
                    {...props}
                />
                {error && <p className={`mt-1.5 text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
                {helperText && !error && (
                    <p className={`mt-1.5 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{helperText}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

// ─── Select ─────────────────────────────────────────────────

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
}

/**
 * Select - Dropdown select with dark mode
 *
 * Usage:
 * ```tsx
 * <Select
 *     label="Ngành nghề"
 *     options={[{ value: 'fnb', label: 'F&B' }, { value: 'tech', label: 'Tech' }]}
 *     placeholder="Chọn ngành nghề"
 * />
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, helperText, options, placeholder, className = '', id, ...props }, ref) => {
        const { resolvedTheme } = useTheme();
        const isDark = resolvedTheme === 'dark';
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    id={inputId}
                    className={`
                        w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 focus:outline-none appearance-none
                        bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat
                        ${isDark
                            ? `bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")]`
                            : `bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")]`
                        }
                        ${error
                            ? isDark
                                ? 'border-red-500/50 bg-red-500/5 text-white'
                                : 'border-red-300 text-slate-800'
                            : isDark
                                ? 'border-slate-700 bg-slate-800 text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15'
                                : 'border-slate-200 bg-white text-slate-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10'
                        }
                        border pr-10
                        ${className}
                    `}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className={`mt-1.5 text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
                {helperText && !error && (
                    <p className={`mt-1.5 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{helperText}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
