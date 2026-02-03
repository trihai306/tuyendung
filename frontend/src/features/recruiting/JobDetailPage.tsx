import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PipelineKanban } from './components/PipelineKanban';
import { JobProgressCard } from './components/JobProgressCard';
import { useJobs } from './hooks/useRecruiting';
import { useTheme } from '../../contexts/ThemeContext';
import { useCompanyRole } from '../dashboard/useCompanyRole';
import {
    RecruitingIcon,
    DocumentTextIcon,
    ChartBarIcon,
    BriefcaseIcon,
    CheckCircleIcon,
    GiftIcon,
    MagnifyingGlassIcon
} from '../../components/ui/icons';

export function JobDetailPage() {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const { jobs } = useJobs();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { isOwner, isAdmin } = useCompanyRole();
    const isManager = isOwner || isAdmin;
    const [activeTab, setActiveTab] = useState<'pipeline' | 'details' | 'analytics'>('pipeline');

    const job = jobs.find((j) => j.id === Number(jobId));

    const jobTypeLabels: Record<string, string> = {
        full_time: 'Toàn thời gian',
        part_time: 'Bán thời gian',
        contract: 'Hợp đồng',
        internship: 'Thực tập',
    };

    const statusConfig = {
        open: { label: 'Đang tuyển', bg: 'bg-emerald-500', text: 'text-white' },
        draft: { label: 'Nháp', bg: isDark ? 'bg-slate-600' : 'bg-slate-200', text: isDark ? 'text-slate-300' : 'text-slate-600' },
        closed: { label: 'Đã đóng', bg: 'bg-red-500', text: 'text-white' },
        paused: { label: 'Tạm dừng', bg: 'bg-amber-500', text: 'text-white' },
    };

    if (!job) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <div className="text-center">
                    <div className="mb-4"><MagnifyingGlassIcon className="w-16 h-16 mx-auto text-slate-400" /></div>
                    <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Không tìm thấy tin tuyển dụng
                    </h2>
                    <button
                        onClick={() => navigate('/recruiting')}
                        className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        ← Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const status = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.draft;

    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {/* Hero Header */}
            <header className={`relative overflow-hidden ${isDark ? 'bg-gradient-to-r from-slate-800 via-slate-800 to-teal-900/50' : 'bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500'}`}>
                <div className="absolute inset-0 bg-grid-white/5"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
                        <Link to="/recruiting" className="hover:text-white transition-colors">
                            Tuyển dụng
                        </Link>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-white font-medium truncate max-w-xs">{job.title}</span>
                    </div>

                    {/* Title & Meta */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl lg:text-3xl font-bold text-white">{job.title}</h1>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                                    {status.label}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80">
                                {job.location && (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {job.location}
                                    </span>
                                )}
                                {job.job_type && (
                                    <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur rounded-full text-xs font-medium">
                                        {jobTypeLabels[job.job_type] || job.job_type}
                                    </span>
                                )}
                                {job.salary_range && (
                                    <span className="flex items-center gap-1.5 font-medium text-white">
                                        💰 {job.salary_range}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        {isManager && (
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2.5 bg-white/10 backdrop-blur text-white rounded-xl hover:bg-white/20 transition-all font-medium border border-white/20">
                                    ✏️ Chỉnh sửa
                                </button>
                                <button className="px-4 py-2.5 bg-white text-teal-600 rounded-xl hover:bg-white/90 transition-all font-semibold shadow-lg">
                                    🚀 Đăng tuyển
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                            <div className="text-2xl lg:text-3xl font-bold text-white">{job.applications_count || 0}</div>
                            <div className="text-sm text-white/70">Ứng viên</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                            <div className="text-2xl lg:text-3xl font-bold text-white">{job.target_count || 0}</div>
                            <div className="text-sm text-white/70">Chỉ tiêu</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                            <div className="text-2xl lg:text-3xl font-bold text-emerald-300">{job.hired_count || 0}</div>
                            <div className="text-sm text-white/70">Đã tuyển</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                            <div className="text-2xl lg:text-3xl font-bold text-amber-300">
                                {job.target_count ? Math.round((job.hired_count || 0) / job.target_count * 100) : 0}%
                            </div>
                            <div className="text-sm text-white/70">Tiến độ</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className={`sticky top-0 z-10 border-b ${isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'} backdrop-blur`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center gap-1">
                        {[
                            { key: 'pipeline', label: 'Pipeline', Icon: RecruitingIcon },
                            { key: 'details', label: 'Chi tiết', Icon: DocumentTextIcon },
                            { key: 'analytics', label: 'Thống kê', Icon: ChartBarIcon },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                    ? 'border-teal-500 text-teal-600'
                                    : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`
                                    }`}
                            >
                                <tab.Icon className="w-4 h-4 inline-block mr-1.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto">
                {activeTab === 'pipeline' && <PipelineKanban jobId={Number(jobId)} />}

                {activeTab === 'details' && (
                    <div className="p-4 sm:p-6">
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                <section className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        <BriefcaseIcon className="w-5 h-5 text-teal-500" /> Mô tả công việc
                                    </h3>
                                    <p className={`whitespace-pre-line leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {job.description || 'Chưa có mô tả công việc.'}
                                    </p>
                                </section>

                                <section className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        <CheckCircleIcon className="w-5 h-5 text-emerald-500" /> Yêu cầu ứng viên
                                    </h3>
                                    <p className={`whitespace-pre-line leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {job.requirements || 'Chưa có yêu cầu cụ thể.'}
                                    </p>
                                </section>

                                <section className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        <GiftIcon className="w-5 h-5 text-purple-500" /> Quyền lợi
                                    </h3>
                                    <p className={`whitespace-pre-line leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {job.benefits || 'Chưa có thông tin quyền lợi.'}
                                    </p>
                                </section>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Progress Card */}
                                {job.target_count && (
                                    <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                                        <JobProgressCard
                                            jobId={Number(jobId)}
                                            targetCount={job.target_count}
                                            hiredCount={job.hired_count}
                                        />
                                    </div>
                                )}

                                {/* Quick Info */}
                                <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                                    <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Thông tin nhanh</h4>
                                    <div className="space-y-3">
                                        {job.department && (
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ngành nghề</span>
                                                <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{job.department}</span>
                                            </div>
                                        )}
                                        {job.job_type && (
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loại hình</span>
                                                <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{jobTypeLabels[job.job_type]}</span>
                                            </div>
                                        )}
                                        {job.expires_at && (
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Hạn nộp</span>
                                                <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                                    {new Date(job.expires_at).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="p-4 sm:p-6">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                                <div className={`text-3xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{job.applications_count || 0}</div>
                                <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tổng ứng viên</div>
                            </div>
                            <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                                <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>0</div>
                                <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Đang phỏng vấn</div>
                            </div>
                            <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                                <div className={`text-3xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{job.hired_count || 0}</div>
                                <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Đã tuyển</div>
                            </div>
                            <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                                <div className={`text-3xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{job.target_count || '∞'}</div>
                                <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Chỉ tiêu cần tuyển</div>
                            </div>
                        </div>

                        <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                            <div className="text-5xl mb-4">📊</div>
                            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Thống kê chi tiết sẽ sớm có mặt!
                            </h3>
                            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Biểu đồ phân tích nguồn ứng viên, tỷ lệ chuyển đổi và nhiều hơn nữa.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
