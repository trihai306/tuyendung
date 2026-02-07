import { Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCompanyRole } from '../../dashboard/useCompanyRole';
import {
    MapPinIcon,
    UsersIcon,
    CalendarIcon,
    EllipsisVerticalIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    PauseIcon,
    PlayIcon,
    ArrowPathIcon,
    ClockIcon,
} from '../../../components/ui/icons';
import { useState } from 'react';
import { JobProgressCard } from './JobProgressCard';

interface Job {
    id: number;
    title: string;
    department?: string;
    location?: string;
    job_type?: string;
    status: 'open' | 'draft' | 'closed' | 'paused';
    applications_count?: number;
    created_at?: string;
    salary_range?: string;
    target_count?: number;
    hired_count?: number;
    expires_at?: string;
}

interface JobCardProps {
    job: Job;
    onEdit?: (job: Job) => void;
    onDelete?: (job: Job) => void;
    onToggleStatus?: (job: Job) => void;
    onAssign?: (job: Job) => void;
    onRepost?: (job: Job) => void;
}

export function JobCard({ job, onEdit, onDelete, onToggleStatus, onRepost }: JobCardProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { isOwner, isAdmin } = useCompanyRole();
    const isManager = isOwner || isAdmin;
    const [showMenu, setShowMenu] = useState(false);

    const statusConfig = {
        open: {
            label: 'Đang tuyển',
            className: isDark
                ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
            dot: isDark ? 'bg-emerald-400' : 'bg-emerald-500',
        },
        draft: {
            label: 'Bản nháp',
            className: isDark
                ? 'bg-slate-700/50 text-slate-300 ring-1 ring-slate-600'
                : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
            dot: isDark ? 'bg-slate-400' : 'bg-slate-400',
        },
        closed: {
            label: 'Đã đóng',
            className: isDark
                ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30'
                : 'bg-red-50 text-red-700 ring-1 ring-red-200',
            dot: isDark ? 'bg-red-400' : 'bg-red-500',
        },
        paused: {
            label: 'Tạm dừng',
            className: isDark
                ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30'
                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
            dot: isDark ? 'bg-amber-400' : 'bg-amber-500',
        },
    };

    const jobTypeLabels: Record<string, string> = {
        full_time: 'Toàn thời gian',
        part_time: 'Bán thời gian',
        contract: 'Hợp đồng',
        internship: 'Thực tập',
        remote: 'Remote',
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const getDaysUntilExpiry = (expiresAt?: string) => {
        if (!expiresAt) return null;
        const now = new Date();
        const expiry = new Date(expiresAt);
        const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const expiryDays = getDaysUntilExpiry(job.expires_at);

    return (
        <div
            className={`
                group relative rounded-2xl border transition-all duration-300
                ${isDark
                    ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900'
                    : 'bg-white border-slate-200 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5'
                }
            `}
        >
            {/* Gradient accent top */}
            <div className={`h-1 rounded-t-2xl ${job.status === 'open'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : job.status === 'paused'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : job.status === 'closed'
                            ? 'bg-gradient-to-r from-red-500 to-rose-500'
                            : 'bg-gradient-to-r from-slate-400 to-slate-500'
                }`} />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <Link
                            to={`/recruiting/${job.id}`}
                            className={`
                                font-semibold text-base hover:text-emerald-500 transition-colors line-clamp-2
                                ${isDark ? 'text-white' : 'text-slate-900'}
                            `}
                        >
                            {job.title}
                        </Link>
                        <div className={`flex items-center gap-2 mt-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {job.department && (
                                <span className={`px-2 py-0.5 rounded-md text-xs ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    {job.department}
                                </span>
                            )}
                            {job.location && (
                                <span className="flex items-center gap-1">
                                    <MapPinIcon className="w-3.5 h-3.5" />
                                    {job.location}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${statusConfig[job.status].className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[job.status].dot}`} />
                        {statusConfig[job.status].label}
                    </span>
                </div>

                {/* Job Type & Salary */}
                <div className={`flex flex-wrap items-center gap-2 mb-4`}>
                    {job.job_type && (
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                            }`}>
                            <ClockIcon className="w-3 h-3" />
                            {jobTypeLabels[job.job_type] || job.job_type}
                        </span>
                    )}
                    {job.salary_range && (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                            💰 {job.salary_range}
                        </span>
                    )}
                    {expiryDays !== null && expiryDays > 0 && expiryDays <= 7 && (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${expiryDays <= 3
                                ? isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                                : isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'
                            }`}>
                            ⏰ Còn {expiryDays} ngày
                        </span>
                    )}
                </div>

                {/* Stats Row */}
                <div className={`flex items-center gap-4 py-3 border-y ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                            <UsersIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                        </div>
                        <div>
                            <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {job.applications_count || 0}
                            </span>
                            <span className={`text-xs ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                ứng viên
                            </span>
                        </div>
                    </div>
                    {job.created_at && (
                        <div className={`flex items-center gap-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <CalendarIcon className="w-4 h-4" />
                            {formatDate(job.created_at)}
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {job.target_count && (
                    <div className="mt-3">
                        <JobProgressCard
                            jobId={job.id}
                            targetCount={job.target_count}
                            hiredCount={job.hired_count}
                            compact
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                    <Link
                        to={`/recruiting/${job.id}`}
                        className={`
                            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all
                            ${isDark
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                            }
                        `}
                    >
                        <EyeIcon className="w-4 h-4" />
                        Chi tiết
                    </Link>

                    {/* Manager Actions Menu */}
                    {isManager && (
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className={`
                                    p-2.5 rounded-xl transition-colors
                                    ${isDark
                                        ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                    }
                                `}
                            >
                                <EllipsisVerticalIcon className="w-5 h-5" />
                            </button>

                            {showMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowMenu(false)}
                                    />
                                    <div className={`
                                        absolute right-0 top-full mt-2 w-48 py-2 rounded-xl shadow-xl z-20
                                        ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}
                                    `}>
                                        <button
                                            onClick={() => { onEdit?.(job); setShowMenu(false); }}
                                            className={`
                                                w-full px-4 py-2.5 text-sm text-left flex items-center gap-3
                                                ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}
                                            `}
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            onClick={() => { onToggleStatus?.(job); setShowMenu(false); }}
                                            className={`
                                                w-full px-4 py-2.5 text-sm text-left flex items-center gap-3
                                                ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}
                                            `}
                                        >
                                            {job.status === 'open' ? (
                                                <>
                                                    <PauseIcon className="w-4 h-4" />
                                                    Tạm dừng
                                                </>
                                            ) : job.status === 'closed' ? (
                                                <>
                                                    <ArrowPathIcon className="w-4 h-4" />
                                                    Mở lại
                                                </>
                                            ) : (
                                                <>
                                                    <PlayIcon className="w-4 h-4" />
                                                    Kích hoạt
                                                </>
                                            )}
                                        </button>
                                        {job.status === 'closed' && onRepost && (
                                            <button
                                                onClick={() => { onRepost(job); setShowMenu(false); }}
                                                className={`
                                                    w-full px-4 py-2.5 text-sm text-left flex items-center gap-3
                                                    ${isDark ? 'text-emerald-400 hover:bg-slate-700' : 'text-emerald-600 hover:bg-emerald-50'}
                                                `}
                                            >
                                                <ArrowPathIcon className="w-4 h-4" />
                                                Tạo tin mới từ đây
                                            </button>
                                        )}
                                        <div className={`my-1 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`} />
                                        <button
                                            onClick={() => { onDelete?.(job); setShowMenu(false); }}
                                            className={`
                                                w-full px-4 py-2.5 text-sm text-left flex items-center gap-3
                                                ${isDark ? 'text-red-400 hover:bg-slate-700' : 'text-red-600 hover:bg-red-50'}
                                            `}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                            Xóa tin
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
