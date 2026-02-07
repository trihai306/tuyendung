import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from './hooks/useRecruiting';
import { useTheme } from '../../contexts/ThemeContext';
import { useCompanyRole } from '../dashboard/useCompanyRole';
import { JobCard } from './components/JobCard';
import { JobForm } from './components/JobForm';
import {
    PlusIcon,
    BriefcaseIcon,
    UsersIcon,
    CalendarIcon,
    CheckCircleIcon,
    HelpIcon,
    MagnifyingGlassIcon,
    ChartBarIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    SparklesIcon,
} from '../../components/ui/icons';

type JobStatus = 'all' | 'open' | 'draft' | 'closed' | 'paused';

export function RecruitingPage() {
    const { jobs, isLoading, createJob, updateJob, deleteJob, refetch } = useJobs();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { isOwner, isAdmin, isMember, isLoading: roleLoading } = useCompanyRole();
    const isManager = isOwner || isAdmin;

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<JobStatus>('all');
    const [showJobForm, setShowJobForm] = useState(false);
    const [editingJob, setEditingJob] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filter jobs based on role
    const roleFilteredJobs = useMemo(() => {
        return jobs;
    }, [jobs]);

    // Filter jobs by status and search
    const filteredJobs = useMemo(() => {
        let result = roleFilteredJobs;

        if (activeTab !== 'all') {
            result = result.filter((job) => job.status === activeTab);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (job) =>
                    job.title?.toLowerCase().includes(query) ||
                    job.department?.toLowerCase().includes(query) ||
                    job.location?.toLowerCase().includes(query)
            );
        }

        return result;
    }, [roleFilteredJobs, activeTab, searchQuery]);

    // Calculate job counts
    const jobCounts = useMemo(
        () => ({
            all: roleFilteredJobs.length,
            open: roleFilteredJobs.filter((j) => j.status === 'open').length,
            draft: roleFilteredJobs.filter((j) => j.status === 'draft').length,
            paused: roleFilteredJobs.filter((j) => j.status === 'paused').length,
            closed: roleFilteredJobs.filter((j) => j.status === 'closed').length,
        }),
        [roleFilteredJobs]
    );

    // Stats
    const stats = useMemo(() => {
        const totalApplicants = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0);
        const avgApplicantsPerJob = jobs.length > 0 ? Math.round(totalApplicants / jobs.length) : 0;
        return {
            totalJobs: jobs.length,
            activeJobs: jobs.filter((j) => j.status === 'open').length,
            totalApplicants,
            avgApplicantsPerJob,
            interviewsToday: 0,
        };
    }, [jobs]);

    // Recent jobs
    const recentJobs = useMemo(() => {
        return [...jobs]
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
            .slice(0, 3);
    }, [jobs]);

    // Top performing jobs
    const topJobs = useMemo(() => {
        return [...jobs]
            .filter(j => j.status === 'open')
            .sort((a, b) => (b.applications_count || 0) - (a.applications_count || 0))
            .slice(0, 3);
    }, [jobs]);

    // Handlers
    const handleCreateJob = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingJob?.id) {
                // Update existing job
                await updateJob(editingJob.id, data);
            } else {
                // Create new job
                await createJob(data);
            }
            setShowJobForm(false);
            setEditingJob(null);
            refetch();
        } catch (error) {
            console.error('Failed to save job:', error);
            alert('Lỗi khi lưu tin tuyển dụng. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditJob = (job: any) => {
        setEditingJob(job);
        setShowJobForm(true);
    };

    const handleDeleteJob = async (job: any) => {
        if (window.confirm(`Bạn có chắc muốn xóa tin "${job.title}"?`)) {
            try {
                await deleteJob(job.id);
                refetch();
            } catch (error) {
                console.error('Failed to delete job:', error);
                alert('Lỗi khi xóa tin. Vui lòng thử lại.');
            }
        }
    };

    const handleToggleJobStatus = async (job: any) => {
        try {
            const newStatus = job.status === 'open' ? 'paused' : job.status === 'paused' ? 'open' : job.status === 'draft' ? 'open' : 'open';
            await updateJob(job.id, { status: newStatus });
            refetch();
        } catch (error) {
            console.error('Failed to toggle status:', error);
            alert('Lỗi khi thay đổi trạng thái. Vui lòng thử lại.');
        }
    };

    const handleRepostJob = (job: any) => {
        const repostData = {
            ...job,
            id: undefined,
            status: 'draft',
            created_at: undefined,
            applications_count: 0,
        };
        setEditingJob(repostData);
        setShowJobForm(true);
    };

    if (roleLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    // Member View - Simplified
    if (isMember) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
                <div className={`sticky top-0 z-10 backdrop-blur-md ${isDark ? 'bg-slate-950/80' : 'bg-slate-50/80'}`}>
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    Tin tuyển dụng
                                </h1>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Danh sách tin đang được phân công
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 space-y-5">
                    <div className={`flex items-start gap-3 p-4 rounded-xl border ${isDark ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-50 border-blue-200'}`}>
                        <HelpIcon className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            Bạn đang xem các tin tuyển dụng được phân công.
                        </p>
                    </div>

                    <div className={`rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="p-4">
                            <input
                                type="text"
                                placeholder="Tìm kiếm tin tuyển dụng..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full px-4 py-2.5 text-sm rounded-lg border transition-colors ${isDark
                                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
                                    } focus:outline-none focus:border-emerald-500`}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <JobCardSkeleton key={i} isDark={isDark} />
                            ))}
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <EmptyState activeTab={activeTab} isDark={isDark} onCreateClick={() => { }} isMember />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredJobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Manager View - Full featured with new layout
    const tabs: { key: JobStatus; label: string; icon: React.ReactNode }[] = [
        { key: 'all', label: 'Tất cả', icon: <BriefcaseIcon className="w-4 h-4" /> },
        { key: 'open', label: 'Đang tuyển', icon: <CheckCircleIcon className="w-4 h-4" /> },
        { key: 'draft', label: 'Bản nháp', icon: <ClockIcon className="w-4 h-4" /> },
        { key: 'paused', label: 'Tạm dừng', icon: <ClockIcon className="w-4 h-4" /> },
        { key: 'closed', label: 'Đã đóng', icon: <ClockIcon className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <div className={`relative overflow-hidden rounded-2xl ${isDark
                ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800'
                : 'bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 border border-slate-200/80'
                }`}
            >
                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl ${isDark ? 'bg-emerald-500/8' : 'bg-emerald-300/20'}`} />
                    <div className={`absolute top-1/2 -left-16 w-32 h-32 rounded-full blur-2xl ${isDark ? 'bg-teal-500/5' : 'bg-teal-200/20'}`} />
                    <div className={`absolute -bottom-8 right-1/4 w-40 h-40 rounded-full blur-3xl ${isDark ? 'bg-blue-500/5' : 'bg-blue-200/15'}`} />
                </div>

                <div className="relative px-6 py-6">
                    {/* Title Row */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${isDark
                                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/20'
                                : 'bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-200/50'
                                }`}>
                                <BriefcaseIcon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    Quản lý tuyển dụng
                                </h1>
                                <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Theo dõi và quản lý tất cả tin tuyển dụng của công ty
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setEditingJob(null);
                                setShowJobForm(true);
                            }}
                            className="group flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                        >
                            <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                            Tạo tin mới
                        </button>
                    </div>

                    {/* Stats Grid - Redesigned */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={<BriefcaseIcon className="w-5 h-5" />}
                            value={stats.activeJobs}
                            label="Tin đang mở"
                            trend="+12%"
                            trendUp
                            color="emerald"
                            isDark={isDark}
                        />
                        <StatCard
                            icon={<UsersIcon className="w-5 h-5" />}
                            value={stats.totalApplicants}
                            label="Tổng ứng viên"
                            trend="+8%"
                            trendUp
                            color="blue"
                            isDark={isDark}
                        />
                        <StatCard
                            icon={<ChartBarIcon className="w-5 h-5" />}
                            value={stats.avgApplicantsPerJob}
                            label="TB ứng viên/tin"
                            color="violet"
                            isDark={isDark}
                        />
                        <StatCard
                            icon={<CalendarIcon className="w-5 h-5" />}
                            value={stats.interviewsToday}
                            label="Phỏng vấn hôm nay"
                            color="amber"
                            isDark={isDark}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex gap-6">
                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-5">
                    {/* Filter & Search Bar */}
                    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                        {/* Tabs */}
                        <div className={`flex items-center gap-1 p-1.5 ${isDark ? 'bg-slate-900/80' : 'bg-slate-50/80'}`}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`
                                        relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap
                                        ${activeTab === tab.key
                                            ? isDark
                                                ? 'bg-slate-800 text-white shadow-sm'
                                                : 'bg-white text-slate-800 shadow-sm'
                                            : isDark
                                                ? 'text-slate-400 hover:text-slate-200'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }
                                    `}
                                >
                                    <span className={`transition-colors ${activeTab === tab.key
                                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                        : ''
                                        }`}>
                                        {tab.icon}
                                    </span>
                                    {tab.label}
                                    <span className={`
                                        px-1.5 py-0.5 text-[11px] rounded-md font-semibold tabular-nums
                                        ${activeTab === tab.key
                                            ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                            : isDark ? 'bg-slate-700/50 text-slate-500' : 'bg-slate-200/80 text-slate-400'
                                        }
                                    `}>
                                        {jobCounts[tab.key]}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search & Controls */}
                        <div className={`flex items-center gap-3 p-3 border-t ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
                            <div className="relative flex-1 group">
                                <MagnifyingGlassIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm kiếm theo tên, phòng ban, địa điểm..."
                                    className={`
                                        w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 focus:outline-none
                                        ${isDark
                                            ? 'bg-slate-800/40 border border-slate-700/40 text-white placeholder:text-slate-500 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10'
                                            : 'bg-slate-50/80 border border-slate-200/60 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10'
                                        }
                                    `}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md transition-colors ${isDark ? 'text-slate-500 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* View Toggle */}
                            <div className={`flex items-center rounded-xl ${isDark ? 'bg-slate-800/40 ring-1 ring-slate-700/40' : 'bg-slate-50 ring-1 ring-slate-200/60'}`}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2.5 rounded-l-xl transition-all duration-200 ${viewMode === 'grid'
                                        ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                                        : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    title="Lưới"
                                >
                                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2.5 rounded-r-xl transition-all duration-200 ${viewMode === 'list'
                                        ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                                        : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    title="Danh sách"
                                >
                                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Count */}
                    {!isLoading && filteredJobs.length > 0 && (
                        <div className="flex items-center justify-between">
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Hiển thị <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>{filteredJobs.length}</span> tin tuyển dụng
                                {activeTab !== 'all' && <span> ({tabs.find(t => t.key === activeTab)?.label})</span>}
                            </p>
                        </div>
                    )}

                    {/* Jobs Grid/List */}
                    {isLoading ? (
                        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <JobCardSkeleton key={i} isDark={isDark} />
                            ))}
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <EmptyState
                            activeTab={activeTab}
                            isDark={isDark}
                            onCreateClick={() => setShowJobForm(true)}
                        />
                    ) : (
                        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                            {filteredJobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    onEdit={handleEditJob}
                                    onDelete={handleDeleteJob}
                                    onToggleStatus={handleToggleJobStatus}
                                    onRepost={handleRepostJob}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Sidebar Panel */}
                <div className="hidden xl:block w-80 space-y-5 flex-shrink-0">
                    {/* Quick Actions */}
                    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                        <div className={`flex items-center gap-2.5 px-5 py-3.5 border-b ${isDark ? 'border-slate-800/60 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'}`}>
                            <SparklesIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Hành động nhanh
                            </h3>
                        </div>
                        <div className="p-3 space-y-1.5">
                            <button
                                onClick={() => setShowJobForm(true)}
                                className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isDark
                                    ? 'bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15 ring-1 ring-emerald-500/10 hover:ring-emerald-500/25'
                                    : 'bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200/50 hover:ring-emerald-300/50'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg transition-colors ${isDark ? 'bg-emerald-500/15 group-hover:bg-emerald-500/25' : 'bg-emerald-100 group-hover:bg-emerald-200'}`}>
                                    <PlusIcon className="w-3.5 h-3.5" />
                                </div>
                                Tạo tin tuyển dụng mới
                            </button>
                            <Link
                                to="/employer/candidates"
                                className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isDark
                                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg transition-colors ${isDark ? 'bg-slate-800 group-hover:bg-slate-700' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                                    <UsersIcon className="w-3.5 h-3.5" />
                                </div>
                                Xem tất cả ứng viên
                            </Link>
                            <Link
                                to="/employer/calendar"
                                className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isDark
                                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg transition-colors ${isDark ? 'bg-slate-800 group-hover:bg-slate-700' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                </div>
                                Lịch tuyển dụng
                            </Link>
                        </div>
                    </div>

                    {/* Top Performing Jobs */}
                    {topJobs.length > 0 && (
                        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                            <div className={`flex items-center gap-2.5 px-5 py-3.5 border-b ${isDark ? 'border-slate-800/60 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'}`}>
                                <ArrowTrendingUpIcon className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    Tin nổi bật
                                </h3>
                            </div>
                            <div className="p-3 space-y-1">
                                {topJobs.map((job, idx) => (
                                    <Link
                                        key={job.id}
                                        to={`/recruiting/${job.id}`}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${idx === 0
                                            ? isDark ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20' : 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                                            : idx === 1
                                                ? isDark ? 'bg-slate-700/60 text-slate-300 ring-1 ring-slate-600' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                                                : isDark ? 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/20' : 'bg-orange-50 text-orange-500 ring-1 ring-orange-200'
                                            }`}>
                                            #{idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                {job.title}
                                            </p>
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {job.applications_count || 0} ứng viên
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Jobs */}
                    {recentJobs.length > 0 && (
                        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                            <div className={`flex items-center gap-2.5 px-5 py-3.5 border-b ${isDark ? 'border-slate-800/60 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'}`}>
                                <ClockIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    Tin mới nhất
                                </h3>
                            </div>
                            <div className="p-3 space-y-1">
                                {recentJobs.map((job) => (
                                    <Link
                                        key={job.id}
                                        to={`/recruiting/${job.id}`}
                                        className={`block p-3 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                            {job.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${job.status === 'open'
                                                ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                                : job.status === 'draft'
                                                    ? isDark ? 'bg-slate-700/60 text-slate-400' : 'bg-slate-100 text-slate-500'
                                                    : isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-100 text-red-600'
                                                }`}>
                                                {job.status === 'open' ? 'Đang mở' : job.status === 'draft' ? 'Nháp' : job.status === 'paused' ? 'Tạm dừng' : 'Đã đóng'}
                                            </span>
                                            <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {job.created_at && new Date(job.created_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tips Card */}
                    <div className={`rounded-2xl overflow-hidden ${isDark
                        ? 'bg-gradient-to-br from-emerald-950/50 to-teal-950/30 border border-emerald-900/30'
                        : 'bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/50'
                        }`}
                    >
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-100'}`}>
                                    <svg className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                                    </svg>
                                </div>
                                <h4 className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                                    Mẹo tuyển dụng
                                </h4>
                            </div>
                            <p className={`text-xs leading-relaxed ${isDark ? 'text-emerald-300/70' : 'text-emerald-700/70'}`}>
                                Tin tuyển dụng có mô tả chi tiết và mức lương rõ ràng thu hút gấp 3x ứng viên so với tin thông thường.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Form Modal */}
            {showJobForm && (
                <JobForm
                    job={editingJob}
                    onSubmit={handleCreateJob}
                    onCancel={() => {
                        setShowJobForm(false);
                        setEditingJob(null);
                    }}
                    isLoading={isSubmitting}
                />
            )}
        </div>
    );
}

// Enhanced Stat Card
function StatCard({ icon, value, label, trend, trendUp, color, isDark }: {
    icon: React.ReactNode;
    value: number;
    label: string;
    trend?: string;
    trendUp?: boolean;
    color: string;
    isDark: boolean;
}) {
    const colorClasses: Record<string, { iconBg: string; iconText: string; ring: string }> = {
        emerald: {
            iconBg: isDark ? 'bg-emerald-500/12' : 'bg-emerald-50',
            iconText: isDark ? 'text-emerald-400' : 'text-emerald-600',
            ring: isDark ? 'ring-emerald-500/15' : 'ring-emerald-200/50',
        },
        blue: {
            iconBg: isDark ? 'bg-blue-500/12' : 'bg-blue-50',
            iconText: isDark ? 'text-blue-400' : 'text-blue-600',
            ring: isDark ? 'ring-blue-500/15' : 'ring-blue-200/50',
        },
        violet: {
            iconBg: isDark ? 'bg-violet-500/12' : 'bg-violet-50',
            iconText: isDark ? 'text-violet-400' : 'text-violet-600',
            ring: isDark ? 'ring-violet-500/15' : 'ring-violet-200/50',
        },
        amber: {
            iconBg: isDark ? 'bg-amber-500/12' : 'bg-amber-50',
            iconText: isDark ? 'text-amber-400' : 'text-amber-600',
            ring: isDark ? 'ring-amber-500/15' : 'ring-amber-200/50',
        },
    };

    const classes = colorClasses[color];

    return (
        <div className={`group relative rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5
            ${isDark
                ? 'bg-slate-800/40 hover:bg-slate-800/60 ring-1 ring-slate-700/40 hover:ring-slate-600/60'
                : 'bg-white/80 hover:bg-white ring-1 ring-slate-200/60 hover:ring-slate-300/60 hover:shadow-md'
            }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl ${classes.iconBg} ring-1 ${classes.ring}`}>
                    <div className={classes.iconText}>{icon}</div>
                </div>
                {trend && (
                    <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-md
                        ${trendUp
                            ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                            : isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                        }`}
                    >
                        <svg className={`w-3 h-3 ${trendUp ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <span className={`text-2xl font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {value}
                </span>
                <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
            </div>
        </div>
    );
}

// Skeleton Loader
function JobCardSkeleton({ isDark }: { isDark: boolean }) {
    return (
        <div className={`rounded-2xl border p-5 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`h-1 rounded-t-2xl -mt-5 -mx-5 mb-4 animate-shimmer ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <div className={`h-5 rounded-lg w-3/4 animate-shimmer ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    <div className={`h-4 rounded-lg w-1/2 mt-2 animate-shimmer ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
                <div className={`h-6 w-16 rounded-full animate-shimmer ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            </div>
            <div className={`h-4 rounded-lg w-1/3 mt-4 animate-shimmer ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-10 rounded-lg w-full mt-4 animate-shimmer ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        </div>
    );
}

// Empty State
function EmptyState({ activeTab, isDark, onCreateClick, isMember = false }: {
    activeTab: JobStatus;
    isDark: boolean;
    onCreateClick: () => void;
    isMember?: boolean;
}) {
    const messages = {
        all: 'Chưa có tin tuyển dụng nào',
        open: 'Không có tin đang mở',
        draft: 'Không có tin nháp',
        paused: 'Không có tin tạm dừng',
        closed: 'Không có tin đã đóng',
    };

    return (
        <div className={`rounded-2xl border p-16 text-center ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
            {/* Animated Icon */}
            <div className="relative mx-auto mb-8 w-24 h-24">
                <div className={`absolute inset-0 rounded-2xl rotate-6 ${isDark ? 'bg-emerald-500/8' : 'bg-emerald-100/60'}`} />
                <div className={`absolute inset-0 rounded-2xl -rotate-3 ${isDark ? 'bg-teal-500/8' : 'bg-teal-100/60'}`} />
                <div className={`relative w-full h-full rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <BriefcaseIcon className={`w-10 h-10 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                </div>
            </div>

            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {isMember ? 'Chưa có tin nào được phân công' : messages[activeTab]}
            </h3>
            <p className={`text-sm mb-8 max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isMember
                    ? 'Liên hệ quản lý để được phân công tin tuyển dụng'
                    : activeTab === 'all'
                        ? 'Tạo tin tuyển dụng đầu tiên để bắt đầu thu hút ứng viên tiềm năng cho công ty của bạn'
                        : 'Thử chuyển sang tab khác để xem các tin tuyển dụng'
                }
            </p>
            {!isMember && activeTab === 'all' && (
                <button
                    onClick={onCreateClick}
                    className="group inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                >
                    <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                    Tạo tin tuyển dụng
                </button>
            )}
        </div>
    );
}
