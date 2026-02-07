import type { PosterContent } from '../templates/templateData';

interface PropertyPanelProps {
    content: PosterContent;
    onChange: (content: PosterContent) => void;
    onLogoUpload: (file: File) => void;
}

export function PropertyPanel({ content, onChange, onLogoUpload }: PropertyPanelProps) {
    const updateField = <K extends keyof PosterContent>(key: K, value: PosterContent[K]) => {
        onChange({ ...content, [key]: value });
    };

    const updateArrayField = (key: 'requirements' | 'benefits', index: number, value: string) => {
        const arr = [...content[key]];
        arr[index] = value;
        onChange({ ...content, [key]: arr });
    };

    const addArrayItem = (key: 'requirements' | 'benefits') => {
        onChange({ ...content, [key]: [...content[key], ''] });
    };

    const removeArrayItem = (key: 'requirements' | 'benefits', index: number) => {
        onChange({ ...content, [key]: content[key].filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-700">Nội dung poster</h3>

            {/* Title */}
            <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tiêu đề</label>
                <input
                    type="text"
                    value={content.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
            </div>

            {/* Subtitle (Job title) */}
            <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Vị trí tuyển dụng</label>
                <input
                    type="text"
                    value={content.subtitle}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
            </div>

            {/* Company Name */}
            <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tên công ty</label>
                <input
                    type="text"
                    value={content.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
            </div>

            {/* Salary & Location row */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Mức lương</label>
                    <input
                        type="text"
                        value={content.salary}
                        onChange={(e) => updateField('salary', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Địa điểm</label>
                    <input
                        type="text"
                        value={content.location}
                        onChange={(e) => updateField('location', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Requirements */}
            <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Yêu cầu</label>
                <div className="space-y-2">
                    {content.requirements.map((req, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                type="text"
                                value={req}
                                onChange={(e) => updateArrayField('requirements', idx, e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder={`Yêu cầu ${idx + 1}`}
                            />
                            <button
                                onClick={() => removeArrayItem('requirements', idx)}
                                className="px-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => addArrayItem('requirements')}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                        + Thêm yêu cầu
                    </button>
                </div>
            </div>

            {/* Benefits */}
            <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Quyền lợi</label>
                <div className="space-y-2">
                    {content.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                type="text"
                                value={benefit}
                                onChange={(e) => updateArrayField('benefits', idx, e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder={`Quyền lợi ${idx + 1}`}
                            />
                            <button
                                onClick={() => removeArrayItem('benefits', idx)}
                                className="px-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => addArrayItem('benefits')}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                        + Thêm quyền lợi
                    </button>
                </div>
            </div>

            {/* Contact */}
            <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Thông tin liên hệ</label>
                <input
                    type="text"
                    value={content.contactInfo}
                    onChange={(e) => updateField('contactInfo', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
            </div>

            {/* Deadline */}
            <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Hạn nộp hồ sơ</label>
                <input
                    type="text"
                    value={content.deadline || ''}
                    onChange={(e) => updateField('deadline', e.target.value)}
                    placeholder="VD: 30/12/2026"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
            </div>

            {/* Logo Upload */}
            <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Logo công ty</label>
                <div className="flex items-center gap-3">
                    {content.logoUrl && (
                        <img src={content.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg border" />
                    )}
                    <label className="flex-1 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-center text-sm text-slate-500 cursor-pointer hover:border-blue-400 hover:text-blue-600">
                        {content.logoUrl ? 'Thay đổi logo' : 'Tải lên logo'}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onLogoUpload(file);
                            }}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}

export default PropertyPanel;
