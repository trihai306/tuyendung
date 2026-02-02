import { useState, useMemo } from 'react';
import { useJobs } from './hooks/useRecruiting';
import { useTheme } from '../../contexts/ThemeContext';
import { useCompanyRole } from '../dashboard/useCompanyRole';
import { JobCard } from './components/JobCard';
import { JobFilters } from './components/JobFilters';
import { JobForm } from './components/JobForm';
import {
    PlusIcon,
    BriefcaseIcon,
    UsersIcon,
    CalendarIcon,
    CheckCircleIcon,
} from '../../components/ui/icons';

type JobStatus = 'all' | 'open' | 'draft' | 'closed' | 'paused';

export function RecruitingPage() {
    const { jobs, isLoading, createJob, refetch } = useJobs();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { isOwner, isAdmin, isLoading: roleLoading } = useCompanyRole();
    const isManager = isOwner || isAdmin;

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<JobStatus>('all');
    const [showJobForm, setShowJobForm] = useState(false);
    const [editingJob, setEditingJob] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter jobs
    const filteredJobs = useMemo(() => {
        let result = jobs;

        // Filter by status
        if (activeTab !== 'all') {
            result = result.filter((job) => job.status === activeTab);
        }

        // Filter by search query
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
    }, [jobs, activeTab, searchQuery]);

    // Calculate job counts
    const jobCounts = useMemo(
        () => ({
            all: jobs.length,
            open: jobs.filter((j) => j.status === 'open').length,
            draft: jobs.filter((j) => j.status === 'draft').length,
            paused: jobs.filter((j) => j.status === 'paused').length,
            closed: jobs.filter((j) => j.status === 'closed').length,
        }),
        [jobs]
    );

    // Stats
    const stats = useMemo(() => {
        const totalApplicants = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0);
        return {
            totalJobs: jobs.length,
            activeJobs: jobs.filter((j) => j.status === 'open').length,
            totalApplicants,
            interviewsToday: 0, // TODO: Calculate from backend
        };
    }, [jobs]);

    // Handlers
    const handleCreateJob = async (data: any) => {
        setIsSubmitting(true);
        try {
            await createJob(data);
            setShowJobForm(false);
            refetch();
        } catch (error) {
            console.error('Failed to create job:', error);
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
            // TODO: Call delete API
            console.log('Delete job:', job.id);
            refetch();
        }
    };

    const handleToggleJobStatus = async (job: any) => {
        // TODO: Call toggle status API
        console.log('Toggle status:', job.id);
        refetch();
    };

    if (roleLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
            {/* Header */}
            <header
                className={`rounded-xl mb-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    } border`}
            >
                <div className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1
                            className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'
                                }`}
                        >
                            Tuyển dụng
                        </h1>
                        <p
                            className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'
                                }`}
                        >
                            Quản lý tin tuyển dụng và theo dõi ứng viên
                        </p>
                    </div>

                    {isManager && (
                        <button
                            onClick={() => {
                                setEditingJob(null);
                                setShowJobForm(true);
                            }}
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shrink-0"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Tạo tin tuyển dụng
                        </button>
                    )}
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    icon={<BriefcaseIcon className="w-5 h-5" />}
                    value={stats.activeJobs}
                    label="Tin đang mở"
                    color="emerald"
                    isDark={isDark}
                />
                <StatCard
                    icon={<UsersIcon className="w-5 h-5" />}
                    value={stats.totalApplicants}
                    label="Tổng ứng viên"
                    color="blue"
                    isDark={isDark}
                />
                <StatCard
                    icon={<CalendarIcon className="w-5 h-5" />}
                    value={stats.interviewsToday}
                    label="Phỏng vấn hôm nay"
                    color="amber"
                    isDark={isDark}
                />
                <StatCard
                    icon={<CheckCircleIcon className="w-5 h-5" />}
                    value={stats.totalJobs}
                    label="Tổng tin tuyển dụng"
                    color="teal"
                    isDark={isDark}
                />
            </div>

            {/* Filters */}
            <JobFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                jobCounts={jobCounts}
            />

            {/* Jobs Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <JobCardSkeleton key={i} isDark={isDark} />
                    ))}
                </div>
            ) : filteredJobs.length === 0 ? (
                <EmptyState activeTab={activeTab} isDark={isDark} onCreateClick={() => setShowJobForm(true)} isManager={isManager} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredJobs.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onEdit={handleEditJob}
                            onDelete={handleDeleteJob}
                            onToggleStatus={handleToggleJobStatus}
                        />
                    ))}
                </div>
            )}

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

// Stat Card Component
function StatCard({
    icon,
    value,
    label,
    color,
    isDark,
}: {
    icon: React.ReactNode;
    value: number;
    label: string;
    color: string;
    isDark: boolean;
}) {
    const colors: Record<string, string> = {
        emerald: isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
        blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600',
        teal: isDark ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-600',
        amber: isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600',
    };

    return (
        <div
            className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
        >
            <div
                className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}
            >
                {icon}
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {value}
            </div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
        </div>
    );
}

// Skeleton Loader
function JobCardSkeleton({ isDark }: { isDark: boolean }) {
    return (
        <div
            className={`rounded-xl border p-5 animate-pulse ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <div
                        className={`h-5 rounded w-3/4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
                    />
                    <div
                        className={`h-4 rounded w-1/2 mt-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
                    />
                </div>
                <div className={`h-6 w-16 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            </div>
            <div className={`h-4 rounded w-1/3 mt-4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className={`h-9 rounded-lg flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className={`h-9 w-9 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            </div>
        </div>
    );
}

// Empty State
function EmptyState({
    activeTab,
    isDark,
    onCreateClick,
    isManager,
}: {
    activeTab: JobStatus;
    isDark: boolean;
    onCreateClick: () => void;
    isManager: boolean;
}) {
    const messages = {
        all: 'Chưa có tin tuyển dụng nào',
        open: 'Không có tin đang mở',
        draft: 'Không có tin nháp',
        paused: 'Không có tin tạm dừng',
        closed: 'Không có tin đã đóng',
    };

    return (
        <div
            className={`rounded-xl border p-12 text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
        >
            <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}
            >
                <BriefcaseIcon className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {messages[activeTab]}
            </h3>
            <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeTab === 'all'
                    ? 'Tạo tin tuyển dụng đầu tiên để bắt đầu thu hút ứng viên'
                    : 'Thử chuyển sang tab khác để xem các tin tuyển dụng'}
            </p>
            {isManager && activeTab === 'all' && (
                <button
                    onClick={onCreateClick}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    Tạo tin tuyển dụng
                </button>
            )}
        </div>
    );
}
