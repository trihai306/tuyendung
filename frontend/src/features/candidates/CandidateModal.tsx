import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { XMarkIcon } from '../../components/ui/icons';
import type { Candidate, CreateCandidateData, UpdateCandidateData } from './candidatesApi';

interface CandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate?: Candidate | null;
    onSave: (data: CreateCandidateData | UpdateCandidateData) => Promise<void>;
    isLoading?: boolean;
}

const SOURCE_OPTIONS = [
    { value: 'manual', label: 'Thủ công' },
    { value: 'chat', label: 'Zalo' },
    { value: 'import', label: 'Import' },
    { value: 'referral', label: 'Giới thiệu' },
];

const STATUS_OPTIONS = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'archived', label: 'Lưu trữ' },
    { value: 'blacklisted', label: 'Danh sách đen' },
];

export function CandidateModal({ isOpen, onClose, candidate, onSave, isLoading }: CandidateModalProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const isEdit = !!candidate;

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        source: 'manual' as 'chat' | 'manual' | 'import' | 'referral',
        status: 'active' as 'active' | 'archived' | 'blacklisted',
        notes: '',
        tags: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (candidate) {
            setFormData({
                full_name: candidate.full_name,
                email: candidate.email ?? '',
                phone: candidate.phone ?? '',
                source: candidate.source,
                status: candidate.status,
                notes: candidate.notes ?? '',
                tags: candidate.tags?.join(', ') ?? '',
            });
        } else {
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                source: 'manual',
                status: 'active',
                notes: '',
                tags: '',
            });
        }
        setErrors({});
    }, [candidate, isOpen]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Vui lòng nhập họ tên';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        if (formData.phone && !/^[0-9+\-\s()]{8,15}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const tags = formData.tags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean);

        const data = {
            full_name: formData.full_name.trim(),
            email: formData.email.trim() || undefined,
            phone: formData.phone.trim() || undefined,
            source: formData.source,
            status: formData.status,
            notes: formData.notes.trim() || undefined,
            tags: tags.length > 0 ? tags : undefined,
        };

        await onSave(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl ${
                isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
            }`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                }`}>
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {isEdit ? 'Sửa ứng viên' : 'Thêm ứng viên mới'}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                        }`}
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Nhập họ và tên"
                            className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${
                                errors.full_name
                                    ? 'border-red-500 focus:border-red-500'
                                    : isDark
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                            }`}
                        />
                        {errors.full_name && (
                            <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                        )}
                    </div>

                    {/* Phone & Email in row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="0912345678"
                                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${
                                    errors.phone
                                        ? 'border-red-500 focus:border-red-500'
                                        : isDark
                                            ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                                }`}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="email@example.com"
                                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${
                                    errors.email
                                        ? 'border-red-500 focus:border-red-500'
                                        : isDark
                                            ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                                }`}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>
                    </div>

                    {/* Source & Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Nguồn
                            </label>
                            <select
                                value={formData.source}
                                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value as typeof formData.source }))}
                                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${
                                    isDark
                                        ? 'bg-slate-800 border-slate-700 text-white'
                                        : 'bg-white border-slate-200 text-slate-900'
                                }`}
                            >
                                {SOURCE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {isEdit && (
                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    Trạng thái
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as typeof formData.status }))}
                                    className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${
                                        isDark
                                            ? 'bg-slate-800 border-slate-700 text-white'
                                            : 'bg-white border-slate-200 text-slate-900'
                                    }`}
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Tags
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                            placeholder="Nhập tags, phân cách bằng dấu phẩy"
                            className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors ${
                                isDark
                                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                            }`}
                        />
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Ví dụ: Phục vụ, Bán hàng, Full-time
                        </p>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Ghi chú
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Ghi chú về ứng viên..."
                            rows={3}
                            className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-colors resize-none ${
                                isDark
                                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                            }`}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
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
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {isEdit ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CandidateModal;
