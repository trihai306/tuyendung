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
}

interface JobCardProps {
    job: Job;
    onEdit?: (job: Job) => void;
    onDelete?: (job: Job) => void;
    onToggleStatus?: (job: Job) => void;
    onAssign?: (job: Job) => void;
}

export function JobCard({ job, onEdit, onDelete, onToggleStatus, onAssign }: JobCardProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { isOwner, isAdmin } = useCompanyRole();
    const isManager = isOwner || isAdmin;
    const [showMenu, setShowMenu] = useState(false);

    const statusConfig = {
        open: {
            label: 'Đang mở',
            className: isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700',
        },
        draft: {
            label: 'Nháp',
            className: isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600',
        },
        closed: {
            label: 'Đã đóng',
            className: isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-100 text-red-700',
        },
        paused: {
            label: 'Tạm dừng',
            className: isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700',
        },
    };

    const jobTypeLabels: Record<string, string> = {
        full_time: 'Full-time',
        part_time: 'Part-time',
        contract: 'Hợp đồng',
        internship: 'Thực tập',
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div
            className={`
                group relative p-5 rounded-xl border transition-all duration-200
                ${isDark
                    ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/30'
                    : 'bg-white border-slate-200 hover:border-emerald-500/40'
                }
                hover:shadow-lg hover:shadow-emerald-500/5
            `}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <Link
                        to={`/recruiting/${job.id}`}
                        className={`
                            font-semibold text-base hover:text-emerald-500 transition-colors
                            ${isDark ? 'text-white' : 'text-slate-900'}
                        `}
                    >
                        {job.title}
                    </Link>
                    <div className={`flex items-center gap-2 mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {job.department && <span>{job.department}</span>}
                        {job.department && job.location && <span>•</span>}
                        {job.location && (
                            <span className="flex items-center gap-1">
                                <MapPinIcon className="w-3.5 h-3.5" />
                                {job.location}
                            </span>
                        )}
                    </div>
                </div>

                {/* Status Badge */}
                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusConfig[job.status].className}`}>
                    {statusConfig[job.status].label}
                </span>
            </div>

            {/* Job Type & Salary */}
            <div className={`flex items-center gap-3 mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {job.job_type && (
                    <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        {jobTypeLabels[job.job_type] || job.job_type}
                    </span>
                )}
                {job.salary_range && (
                    <span className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        💰 {job.salary_range}
                    </span>
                )}
            </div>

            {/* Stats */}
            <div className={`flex items-center gap-4 mt-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="flex items-center gap-1.5">
                    <UsersIcon className="w-4 h-4" />
                    {job.applications_count || 0} ứng viên
                </span>
                {job.created_at && (
                    <span className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4" />
                        {formatDate(job.created_at)}
                    </span>
                )}
            </div>

            {/* Progress Bar (if target_count exists) */}
            {job.target_count && (
                <JobProgressCard
                    jobId={job.id}
                    targetCount={job.target_count}
                    hiredCount={job.hired_count}
                    compact
                />
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                    to={`/recruiting/${job.id}`}
                    className={`
                        flex-1 px-3 py-2 text-sm font-medium rounded-lg text-center transition-colors
                        ${isDark
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                        }
                    `}
                >
                    <EyeIcon className="w-4 h-4 inline mr-1.5" />
                    Xem chi tiết
                </Link>

                {/* Manager Actions Menu */}
                {isManager && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className={`
                                p-2 rounded-lg transition-colors
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
                                    absolute right-0 top-full mt-1 w-40 py-1 rounded-lg shadow-lg z-20
                                    ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}
                                `}>
                                    <button
                                        onClick={() => { onEdit?.(job); setShowMenu(false); }}
                                        className={`
                                            w-full px-3 py-2 text-sm text-left flex items-center gap-2
                                            ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}
                                        `}
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        onClick={() => { onToggleStatus?.(job); setShowMenu(false); }}
                                        className={`
                                            w-full px-3 py-2 text-sm text-left flex items-center gap-2
                                            ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}
                                        `}
                                    >
                                        {job.status === 'open' ? (
                                            <>
                                                <PauseIcon className="w-4 h-4" />
                                                Tạm dừng
                                            </>
                                        ) : (
                                            <>
                                                <PlayIcon className="w-4 h-4" />
                                                Mở lại
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => { onDelete?.(job); setShowMenu(false); }}
                                        className={`
                                            w-full px-3 py-2 text-sm text-left flex items-center gap-2
                                            ${isDark ? 'text-red-400 hover:bg-slate-700' : 'text-red-600 hover:bg-red-50'}
                                        `}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Xóa
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
