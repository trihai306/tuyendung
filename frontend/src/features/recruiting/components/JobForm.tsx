import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { ShiftPicker } from './ShiftPicker';
import { InterviewScheduler } from './InterviewScheduler';
import { BenefitsPicker } from './BenefitsPicker';
import type { Benefit } from './BenefitsPicker';
import {
    BriefcaseIcon, CalendarIcon, ClockIcon, DocumentTextIcon,
    PencilIcon, ClipboardDocumentListIcon, DocumentIcon, RocketLaunchIcon
} from '../../../components/ui/icons';
import { Input, Select, Textarea } from '../../../components/ui';

interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
}

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
}

interface InterviewSchedule {
    type: 'onsite' | 'online' | 'phone';
    location: string;
    timeSlots: TimeSlot[];
}

interface JobFormData {
    // Tab 1: Thông tin công việc
    title: string;
    category: string;
    location: string;
    headcount: number;
    cvRequired: boolean;
    salaryType: 'per_shift' | 'per_hour';
    salaryAmount: string;
    description: string;
    requirements: string;
    benefits: Benefit[];

    // Tab 2: Ca làm & Lịch hẹn
    workDays: string[];
    shifts: Shift[];
    startDate: string;
    endDate: string;
    interviewSchedule: InterviewSchedule;
}

interface JobFormProps {
    job?: Partial<JobFormData>;
    onSubmit: (data: JobFormData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const jobCategories = [
    { value: 'fnb', label: 'F&B (Nhà hàng, Quán cafe)' },
    { value: 'hotel', label: 'Khách sạn, Resort' },
    { value: 'event', label: 'Sự kiện, Activation' },
    { value: 'retail', label: 'Bán lẻ, Siêu thị' },
    { value: 'warehouse', label: 'Kho vận, Logistics' },
    { value: 'pgpb', label: 'PG/PB, MC' },
    { value: 'office', label: 'Văn phòng, Hành chính' },
    { value: 'other', label: 'Khác' },
];

const weekDays = [
    { value: 'mon', label: 'T2' },
    { value: 'tue', label: 'T3' },
    { value: 'wed', label: 'T4' },
    { value: 'thu', label: 'T5' },
    { value: 'fri', label: 'T6' },
    { value: 'sat', label: 'T7' },
    { value: 'sun', label: 'CN' },
];

export function JobForm({ job, onSubmit, onCancel, isLoading }: JobFormProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [activeTab, setActiveTab] = useState<'info' | 'schedule'>('info');

    const [formData, setFormData] = useState<JobFormData>({
        title: job?.title || '',
        category: job?.category || 'fnb',
        location: job?.location || '',
        headcount: job?.headcount || 1,
        salaryType: job?.salaryType || 'per_shift',
        salaryAmount: job?.salaryAmount || '',
        description: job?.description || '',
        requirements: job?.requirements || '',
        benefits: job?.benefits || [],
        cvRequired: job?.cvRequired ?? false,
        workDays: job?.workDays || ['mon', 'tue', 'wed', 'thu', 'fri'],
        shifts: job?.shifts || [],
        startDate: job?.startDate || '',
        endDate: job?.endDate || '',
        interviewSchedule: job?.interviewSchedule || {
            type: 'onsite',
            location: '',
            timeSlots: [],
        },
    });

    const updateField = <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleWorkDay = (day: string) => {
        const days = formData.workDays.includes(day)
            ? formData.workDays.filter(d => d !== day)
            : [...formData.workDays, day];
        updateField('workDays', days);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Map frontend fields to backend API fields
        const apiData = {
            title: formData.title,
            location: formData.location,
            description: formData.description,
            requirements: formData.requirements,
            target_count: formData.headcount,
            department: formData.category,
            benefits: formData.benefits.map(b => b.label).join(', '),
            // Parse salary
            salary_min: formData.salaryAmount ? parseInt(formData.salaryAmount.replace(/[,.\s]/g, '')) : null,
            // Tạo tin luôn với status open (không cần nháp)
            status: 'open',
        };
        onSubmit(apiData as any);
    };

    const tabs = [
        { id: 'info' as const, label: 'Thông tin công việc', icon: <BriefcaseIcon className="w-4 h-4" /> },
        { id: 'schedule' as const, label: 'Ca làm & Lịch hẹn', icon: <CalendarIcon className="w-4 h-4" /> },
    ];

    const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
            <div className={`
                w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden
                ${isDark ? 'bg-slate-900' : 'bg-white'}
            `}>
                {/* Header */}
                <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {job ? <PencilIcon className="w-5 h-5 text-emerald-500" /> : <ClipboardDocumentListIcon className="w-5 h-5 text-emerald-500" />}
                        {job ? 'Chỉnh sửa tin tuyển dụng' : 'Tạo tin tuyển dụng'}
                    </h2>
                </div>

                {/* Tabs */}
                <div className={`flex border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors
                                ${activeTab === tab.id
                                    ? isDark
                                        ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5'
                                        : 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50'
                                    : isDark
                                        ? 'text-slate-400 hover:text-slate-300'
                                        : 'text-slate-500 hover:text-slate-700'
                                }
                            `}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {activeTab === 'info' && (
                        <>
                            {/* Tên công việc */}
                            <div>
                                <label className={labelClass}>
                                    Tên công việc <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    placeholder="VD: Nhân viên phục vụ, PG/PB, Nhân viên kho..."
                                    required
                                />
                            </div>

                            {/* Ngành nghề & Địa điểm */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Ngành nghề</label>
                                    <Select
                                        value={formData.category}
                                        onChange={(e) => updateField('category', e.target.value)}
                                        options={jobCategories.map(cat => ({ value: cat.value, label: cat.label }))}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Địa chỉ làm việc <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => updateField('location', e.target.value)}
                                        placeholder="VD: 123 Nguyễn Huệ, Q.1, TP.HCM"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Số lượng & Mức lương */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>
                                        Số lượng cần tuyển <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            value={formData.headcount}
                                            onChange={(e) => updateField('headcount', parseInt(e.target.value) || 1)}
                                        />
                                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>người</span>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Mức lương</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 min-w-0">
                                            <Input
                                                type="text"
                                                value={formData.salaryAmount}
                                                onChange={(e) => updateField('salaryAmount', e.target.value)}
                                                placeholder="VD: 200,000"
                                            />
                                        </div>
                                        <Select
                                            value={formData.salaryType}
                                            onChange={(e) => updateField('salaryType', e.target.value as 'per_shift' | 'per_hour')}
                                            className="!w-auto shrink-0"
                                            options={[
                                                { value: 'per_shift', label: '/ca' },
                                                { value: 'per_hour', label: '/giờ' },
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Yêu cầu CV */}
                            <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <span className={`font-medium flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                            <DocumentIcon className="w-4 h-4 text-emerald-500" />
                                            Yêu cầu CV/Hồ sơ
                                        </span>
                                        <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Ứng viên cần gửi CV/hồ sơ khi ứng tuyển
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateField('cvRequired', !formData.cvRequired)}
                                        className={`
                                            relative w-12 h-6 rounded-full transition-colors
                                            ${formData.cvRequired
                                                ? 'bg-emerald-500'
                                                : isDark ? 'bg-slate-600' : 'bg-slate-300'
                                            }
                                        `}
                                    >
                                        <span className={`
                                            absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform
                                            ${formData.cvRequired ? 'translate-x-7' : 'translate-x-1'}
                                        `} />
                                    </button>
                                </label>
                            </div>

                            {/* Mô tả công việc */}
                            <div>
                                <label className={labelClass}>Mô tả công việc</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    rows={3}
                                    placeholder="Mô tả chi tiết về công việc, nhiệm vụ..."
                                />
                            </div>

                            {/* Yêu cầu */}
                            <div>
                                <label className={labelClass}>Yêu cầu ứng viên</label>
                                <Textarea
                                    value={formData.requirements}
                                    onChange={(e) => updateField('requirements', e.target.value)}
                                    rows={3}
                                    placeholder="VD: Ngoại hình khá, giao tiếp tốt, có kinh nghiệm ưu tiên..."
                                />
                            </div>

                            {/* Phúc lợi */}
                            <BenefitsPicker
                                benefits={formData.benefits}
                                onChange={(benefits) => updateField('benefits', benefits)}
                            />
                        </>
                    )}

                    {activeTab === 'schedule' && (
                        <>
                            <div>
                                <label className={`${labelClass} flex items-center gap-1.5`}>
                                    <CalendarIcon className="w-4 h-4 text-emerald-500" />
                                    Ngày làm việc trong tuần
                                </label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {weekDays.map(day => (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => toggleWorkDay(day.value)}
                                            className={`
                                                px-4 py-2 rounded-lg text-sm font-medium transition-all
                                                ${formData.workDays.includes(day.value)
                                                    ? isDark
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-emerald-500 text-white'
                                                    : isDark
                                                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }
                                            `}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ca làm việc */}
                            <ShiftPicker
                                shifts={formData.shifts}
                                onChange={(shifts) => updateField('shifts', shifts)}
                            />

                            {/* Thời gian tuyển */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`${labelClass} flex items-center gap-1.5`}>
                                        <ClockIcon className="w-4 h-4 text-emerald-500" />
                                        Ngày bắt đầu
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => updateField('startDate', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className={`${labelClass} flex items-center gap-1.5`}>
                                        <ClockIcon className="w-4 h-4 text-emerald-500" />
                                        Ngày kết thúc
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => updateField('endDate', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Lịch phỏng vấn */}
                            <div className={`pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                                <h3 className={`text-sm font-semibold mb-4 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    <DocumentTextIcon className="w-4 h-4 text-emerald-500" />
                                    Thiết lập lịch phỏng vấn
                                </h3>
                                <InterviewScheduler
                                    schedule={formData.interviewSchedule}
                                    onChange={(schedule) => updateField('interviewSchedule', schedule)}
                                />
                            </div>
                        </>
                    )}
                </form>

                {/* Footer */}
                <div className={`
                    px-6 py-4 border-t flex items-center justify-between gap-3
                    ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50'}
                `}>
                    <button
                        type="button"
                        onClick={onCancel}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${isDark
                                ? 'text-slate-400 hover:bg-slate-800'
                                : 'text-slate-600 hover:bg-slate-100'
                            }
                        `}
                    >
                        Hủy
                    </button>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                                ${isDark
                                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }
                            `}
                        >
                            Lưu nháp
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-5 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Đang lưu...' : job ? 'Cập nhật' : (
                                <span className="flex items-center gap-1.5">
                                    <RocketLaunchIcon className="w-4 h-4" />
                                    Đăng tin
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
