import { useState } from 'react';

interface Job {
    id: number;
    title: string;
    department?: string;
    location?: string;
    job_type?: string;
    salary_range?: string;
    description?: string;
    requirements?: string;
    benefits?: string;
}

interface JobFormProps {
    job?: Job;
    onSubmit: (data: Partial<Job>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function JobForm({ job, onSubmit, onCancel, isLoading }: JobFormProps) {
    const [formData, setFormData] = useState<Partial<Job>>({
        title: job?.title || '',
        department: job?.department || '',
        location: job?.location || '',
        job_type: job?.job_type || 'full_time',
        salary_range: job?.salary_range || '',
        description: job?.description || '',
        requirements: job?.requirements || '',
        benefits: job?.benefits || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {job ? 'Chỉnh sửa tin tuyển dụng' : 'Tạo tin tuyển dụng mới'}
                    </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tiêu đề vị trí <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="VD: Frontend Developer"
                            required
                        />
                    </div>

                    {/* Department & Location */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phòng ban
                            </label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="VD: Engineering"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Địa điểm
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="VD: Hà Nội"
                            />
                        </div>
                    </div>

                    {/* Job Type & Salary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loại hình
                            </label>
                            <select
                                name="job_type"
                                value={formData.job_type}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="full_time">Full-time</option>
                                <option value="part_time">Part-time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mức lương
                            </label>
                            <input
                                type="text"
                                name="salary_range"
                                value={formData.salary_range}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="VD: 15-25 triệu"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả công việc
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Mô tả chi tiết về công việc..."
                        />
                    </div>

                    {/* Requirements */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Yêu cầu ứng viên
                        </label>
                        <textarea
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Các yêu cầu về kỹ năng, kinh nghiệm..."
                        />
                    </div>

                    {/* Benefits */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quyền lợi
                        </label>
                        <textarea
                            name="benefits"
                            value={formData.benefits}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Các quyền lợi dành cho ứng viên..."
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Đang lưu...' : job ? 'Cập nhật' : 'Tạo tin'}
                    </button>
                </div>
            </div>
        </div>
    );
}
