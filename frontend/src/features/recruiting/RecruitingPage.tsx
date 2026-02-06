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
    HelpIcon,
} from '../../components/ui/icons';

type JobStatus = 'all' | 'open' | 'draft' | 'closed' | 'paused';

export function RecruitingPage() {
    const { jobs, isLoading, createJob, refetch } = useJobs();
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

    // Filter jobs based on role
    // TODO: Backend should filter jobs for members, for now show all
    const roleFilteredJobs = useMemo(() => {
        // When backend supports filtering, member will only see assigned jobs
        return jobs;
    }, [jobs]);

    // Filter jobs by status and search
    const filteredJobs = useMemo(() => {
        let result = roleFilteredJobs;

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

    // Stats - Only show to managers
    const stats = useMemo(() => {
        const totalApplicants = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0);
        return {
            totalJobs: jobs.length,
            activeJobs: jobs.filter((j) => j.status === 'open').length,
            totalApplicants,
            interviewsToday: 0,
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
            console.log('Delete job:', job.id);
            refetch();
        }
    };

    const handleToggleJobStatus = async (job: any) => {
        console.log('Toggle status:', job.id);
        refetch();
    };

    // Repost closed job - open form with pre-filled data
    const handleRepostJob = (job: any) => {
        // Create a new job object with data from the old job but reset status
        const repostData = {
            ...job,
            id: undefined,  // Remove ID to create new
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
                {/* Member Header */}
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
                    {/* Info Banner for Members */}
                    <div className={`flex items-start gap-3 p-4 rounded-xl border ${isDark ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-50 border-blue-200'}`}>
                        <HelpIcon className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div>
                            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                                Bạn đang xem các tin tuyển dụng được phân công. Liên hệ quản lý để được thêm tin mới.
                            </p>
                        </div>
                    </div>

                    {/* Simple Search */}
                    <div className={`rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="p-4">
                            <input
                                type="text"
                                placeholder="Tìm kiếm tin tuyển dụng..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full px-4 py-2.5 text-sm rounded-lg border transition-colors ${isDark
                                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500'
                                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500'
                                    } focus:outline-none`}
                            />
                        </div>
                    </div>

                    {/* Compact Stats for Member */}
                    <div className={`flex items-center gap-6 px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                <span className="font-medium">{jobCounts.open}</span> tin đang mở
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`} />
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                <span className="font-medium">{jobCounts.all}</span> tổng tin
                            </span>
                        </div>
                    </div>

                    {/* Jobs Grid - Member View */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <JobCardSkeleton key={i} isDark={isDark} />
                            ))}
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className={`rounded-xl border p-12 text-center ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <BriefcaseIcon className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
                            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Chưa có tin nào được phân công
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Liên hệ quản lý để được phân công tin tuyển dụng
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredJobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                // No edit/delete/toggle handlers for members
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Manager View - Full featured
    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-10 backdrop-blur-md ${isDark ? 'bg-slate-950/80' : 'bg-slate-50/80'}`}>
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Quản lý tuyển dụng
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Quản lý tin tuyển dụng và theo dõi ứng viên
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingJob(null);
                                setShowJobForm(true);
                            }}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Tạo tin mới
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-6 space-y-5">
                {/* Stats Cards - Manager only */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <CompactStatCard
                        icon={<BriefcaseIcon className="w-4 h-4" />}
                        value={stats.activeJobs}
                        label="Tin đang mở"
                        color="emerald"
                        isDark={isDark}
                    />
                    <CompactStatCard
                        icon={<UsersIcon className="w-4 h-4" />}
                        value={stats.totalApplicants}
                        label="Tổng ứng viên"
                        color="blue"
                        isDark={isDark}
                    />
                    <CompactStatCard
                        icon={<CalendarIcon className="w-4 h-4" />}
                        value={stats.interviewsToday}
                        label="Phỏng vấn hôm nay"
                        color="amber"
                        isDark={isDark}
                    />
                    <CompactStatCard
                        icon={<CheckCircleIcon className="w-4 h-4" />}
                        value={stats.totalJobs}
                        label="Tổng tin"
                        color="slate"
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
                    <EmptyState
                        activeTab={activeTab}
                        isDark={isDark}
                        onCreateClick={() => setShowJobForm(true)}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

// Compact Stat Card Component - Consistent with Dashboard
function CompactStatCard({ icon, value, label, color, isDark }: {
    icon: React.ReactNode;
    value: number;
    label: string;
    color: string;
    isDark: boolean;
}) {
    const iconColors: Record<string, string> = {
        emerald: isDark ? 'text-emerald-400' : 'text-emerald-600',
        blue: isDark ? 'text-blue-400' : 'text-blue-600',
        amber: isDark ? 'text-amber-400' : 'text-amber-600',
        slate: isDark ? 'text-slate-400' : 'text-slate-500',
    };

    return (
        <div className={`rounded-xl border px-4 py-3 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3">
                <div className={iconColors[color]}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {value}
                    </span>
                    <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
                </div>
            </div>
        </div>
    );
}

// Skeleton Loader
function JobCardSkeleton({ isDark }: { isDark: boolean }) {
    return (
        <div className={`rounded-xl border p-5 animate-pulse ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <div className={`h-5 rounded w-3/4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    <div className={`h-4 rounded w-1/2 mt-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
                <div className={`h-6 w-16 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            </div>
            <div className={`h-4 rounded w-1/3 mt-4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        </div>
    );
}

// Empty State - Manager only
function EmptyState({ activeTab, isDark, onCreateClick }: {
    activeTab: JobStatus;
    isDark: boolean;
    onCreateClick: () => void;
}) {
    const messages = {
        all: 'Chưa có tin tuyển dụng nào',
        open: 'Không có tin đang mở',
        draft: 'Không có tin nháp',
        paused: 'Không có tin tạm dừng',
        closed: 'Không có tin đã đóng',
    };

    return (
        <div className={`rounded-xl border p-12 text-center ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <BriefcaseIcon className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {messages[activeTab]}
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeTab === 'all'
                    ? 'Tạo tin tuyển dụng đầu tiên để bắt đầu thu hút ứng viên'
                    : 'Thử chuyển sang tab khác để xem các tin tuyển dụng'}
            </p>
            {activeTab === 'all' && (
                <button
                    onClick={onCreateClick}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    Tạo tin tuyển dụng
                </button>
            )}
        </div>
    );
}
