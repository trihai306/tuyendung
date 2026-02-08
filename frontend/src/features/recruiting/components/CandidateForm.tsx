import { useState } from 'react';
import { Input, Textarea, Button } from '../../../components/ui';

interface Candidate {
    id?: number;
    full_name: string;
    email?: string;
    phone?: string;
    current_position?: string;
    experience_years?: number;
    resume_url?: string;
    notes?: string;
}

interface CandidateFormProps {
    candidate?: Candidate;
    onSubmit: (data: Partial<Candidate>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function CandidateForm({ candidate, onSubmit, onCancel, isLoading }: CandidateFormProps) {
    const [formData, setFormData] = useState<Partial<Candidate>>({
        full_name: candidate?.full_name || '',
        email: candidate?.email || '',
        phone: candidate?.phone || '',
        current_position: candidate?.current_position || '',
        experience_years: candidate?.experience_years || undefined,
        notes: candidate?.notes || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? (value ? parseInt(value) : undefined) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {candidate ? 'Chỉnh sửa ứng viên' : 'Thêm ứng viên mới'}
                    </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                            required
                        />
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="email@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Số điện thoại
                            </label>
                            <Input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0912345678"
                            />
                        </div>
                    </div>

                    {/* Current Position & Experience */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Vị trí hiện tại
                            </label>
                            <Input
                                type="text"
                                name="current_position"
                                value={formData.current_position}
                                onChange={handleChange}
                                placeholder="Software Engineer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kinh nghiệm (năm)
                            </label>
                            <Input
                                type="number"
                                name="experience_years"
                                value={formData.experience_years || ''}
                                onChange={handleChange}
                                min="0"
                                max="50"
                                placeholder="3"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Ghi chú
                        </label>
                        <Textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Ghi chú về ứng viên..."
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        loading={isLoading}
                    >
                        {isLoading ? 'Đang lưu...' : candidate ? 'Cập nhật' : 'Thêm ứng viên'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
