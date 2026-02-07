import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import apiClient from '../../services/apiClient';
import {
    ChartBarIcon,
    UsersIcon,
    BriefcaseIcon,
    ClockIcon,
    PlusIcon,
    UserPlusIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CalendarIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    ChevronRightIcon,
    SparklesIcon,
} from '../../components/ui/icons';
import { JobAlertsWidget } from './components/JobAlertsWidget';
import { useAppSelector } from '../../app/hooks';

interface CompanyStats {
    active_jobs: number;
    total_candidates: number;
    avg_time_to_hire: number;
    total_members: number;
}

interface QuickMetrics {
    hired_this_month: number;
    hired_change: number;
    response_rate: number;
    interviews_this_week: number;
}

interface Activity {
    id: number;
    type: string;
    title: string;
    description: string;
    time_formatted: string;
}

interface TeamMember {
    id: number;
    name: string;
    email: string;
    company_role: string;
    stats?: {
        candidates_handled: number;
        interviews_scheduled: number;
        hired_count: number;
    };
}

// Pipeline data for funnel chart
interface PipelineData {
    stage: string;
    count: number;
    color: string;
}

export function AdminDashboard() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const user = useAppSelector((state) => state.auth.user);

    const [stats, setStats] = useState<CompanyStats | null>(null);
    const [metrics, setMetrics] = useState<QuickMetrics | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mock pipeline data
    const pipelineData: PipelineData[] = [
        { stage: 'Mới ứng tuyển', count: 45, color: '#6B7280' },
        { stage: 'Đang xem xét', count: 28, color: '#3B82F6' },
        { stage: 'Phỏng vấn', count: 12, color: '#8B5CF6' },
        { stage: 'Gửi offer', count: 5, color: '#F59E0B' },
        { stage: 'Đã tuyển', count: 3, color: '#10B981' },
    ];

    useEffect(() => {
        Promise.all([
            apiClient.get('/company/stats'),
            apiClient.get('/company/activities?limit=8'),
            apiClient.get('/company/members'),
        ]).then(([statsRes, activitiesRes, membersRes]) => {
            setStats(statsRes.data.data.stats);
            setMetrics(statsRes.data.data.metrics);
            setActivities(activitiesRes.data.data);
            setMembers(membersRes.data.data);
        }).catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long' });
    const greeting = getGreeting();

    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    }

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/30'}`}>
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500/30 border-t-emerald-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-emerald-500 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`pb-8 ${isDark ? '' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/30'}`}>
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-200/40'}`} />
                <div className={`absolute top-1/2 -left-20 w-60 h-60 rounded-full blur-3xl ${isDark ? 'bg-blue-900/10' : 'bg-blue-200/30'}`} />
            </div>

            {/* Premium Header */}
            <div className="relative px-6 pt-8 pb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-3 ${isDark ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            <SparklesIcon className="w-3.5 h-3.5" />
                            Dashboard
                        </div>
                        <h1 className={`text-2xl md:text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {greeting}, <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{user?.name?.split(' ').pop() || 'bạn'}</span>! 👋
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {today} • Hãy có một ngày làm việc hiệu quả!
                        </p>
                    </div>
                    <Link
                        to="/recruiting"
                        className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Đăng tin mới
                    </Link>
                </div>
            </div>

            <div className="relative px-6 pb-8 space-y-6">
                {/* Premium Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <PremiumStatCard
                        icon={<BriefcaseIcon className="w-5 h-5" />}
                        value={stats?.active_jobs ?? 0}
                        label="Tin đang tuyển"
                        trend="+2 tuần này"
                        color="emerald"
                        isDark={isDark}
                    />
                    <PremiumStatCard
                        icon={<UsersIcon className="w-5 h-5" />}
                        value={stats?.total_candidates ?? 0}
                        label="Ứng viên"
                        trend="+15%"
                        trendUp={true}
                        color="blue"
                        isDark={isDark}
                    />
                    <PremiumStatCard
                        icon={<CheckCircleIcon className="w-5 h-5" />}
                        value={metrics?.hired_this_month ?? 0}
                        label="Đã tuyển tháng này"
                        trend={metrics?.hired_change ? `${metrics.hired_change >= 0 ? '+' : ''}${metrics.hired_change}%` : undefined}
                        trendUp={metrics?.hired_change !== undefined ? metrics.hired_change >= 0 : undefined}
                        color="teal"
                        isDark={isDark}
                    />
                    <PremiumStatCard
                        icon={<ClockIcon className="w-5 h-5" />}
                        value={`${Math.abs(stats?.avg_time_to_hire ?? 0)} ngày`}
                        label="Thời gian tuyển TB"
                        trend="Nhanh hơn 2 ngày"
                        trendUp={true}
                        color="purple"
                        isDark={isDark}
                    />
                </div>

                {/* Job Alerts */}
                <JobAlertsWidget />

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Hiring Pipeline Funnel */}
                    <div className={`lg:col-span-5 rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/50 border-slate-800 backdrop-blur-sm' : 'bg-white/70 border-slate-200/80 backdrop-blur-sm shadow-xl shadow-slate-200/50'}`}>
                        <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                                        <ChartBarIcon className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    </div>
                                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                        Hiring Pipeline
                                    </h2>
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                                    {pipelineData.reduce((sum, d) => sum + d.count, 0)} tổng
                                </span>
                            </div>
                        </div>
                        <div className="p-5 space-y-3">
                            {pipelineData.map((stage, index) => (
                                <PipelineBar
                                    key={stage.stage}
                                    stage={stage.stage}
                                    count={stage.count}
                                    color={stage.color}
                                    max={pipelineData[0].count}
                                    index={index}
                                    isDark={isDark}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Team Performance */}
                    <div className={`lg:col-span-4 rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/50 border-slate-800 backdrop-blur-sm' : 'bg-white/70 border-slate-200/80 backdrop-blur-sm shadow-xl shadow-slate-200/50'}`}>
                        <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                                        <UsersIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                                    </div>
                                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                        Top Performers
                                    </h2>
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                                    {members.length} thành viên
                                </span>
                            </div>
                        </div>
                        <div className="p-3">
                            {members.slice(0, 5).map((member, index) => (
                                <MemberCard
                                    key={member.id}
                                    member={member}
                                    rank={index + 1}
                                    isDark={isDark}
                                />
                            ))}
                            {members.length === 0 && (
                                <div className={`py-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <UsersIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Chưa có thành viên</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={`lg:col-span-3 rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/50 border-slate-800 backdrop-blur-sm' : 'bg-white/70 border-slate-200/80 backdrop-blur-sm shadow-xl shadow-slate-200/50'}`}>
                        <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                    <SparklesIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                </div>
                                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    Thao tác nhanh
                                </h2>
                            </div>
                        </div>
                        <div className="p-3 space-y-2">
                            <QuickActionCard
                                icon={<PlusIcon className="w-5 h-5" />}
                                label="Đăng tin tuyển dụng"
                                description="Tạo tin mới"
                                href="/recruiting"
                                color="emerald"
                                isDark={isDark}
                            />
                            <QuickActionCard
                                icon={<UserPlusIcon className="w-5 h-5" />}
                                label="Mời thành viên"
                                description="Mở rộng team"
                                href="/company"
                                color="blue"
                                isDark={isDark}
                            />
                            <QuickActionCard
                                icon={<CalendarIcon className="w-5 h-5" />}
                                label="Lịch phỏng vấn"
                                description={`${metrics?.interviews_this_week ?? 0} cuộc tuần này`}
                                href="/calendar"
                                color="purple"
                                isDark={isDark}
                            />
                            <QuickActionCard
                                icon={<DocumentTextIcon className="w-5 h-5" />}
                                label="Báo cáo"
                                description="Xem analytics"
                                href="/reports"
                                color="amber"
                                isDark={isDark}
                            />
                        </div>
                    </div>
                </div>

                {/* Recent Activity Timeline */}
                <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/50 border-slate-800 backdrop-blur-sm' : 'bg-white/70 border-slate-200/80 backdrop-blur-sm shadow-xl shadow-slate-200/50'}`}>
                    <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                                <ClockIcon className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            </div>
                            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Hoạt động gần đây
                            </h2>
                        </div>
                        <Link
                            to="/company"
                            className={`text-sm font-medium transition-colors ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
                        >
                            Xem tất cả →
                        </Link>
                    </div>
                    <div className="p-5">
                        <div className="relative">
                            {/* Timeline line */}
                            <div className={`absolute left-2 top-3 bottom-3 w-0.5 ${isDark ? 'bg-gradient-to-b from-emerald-500 via-slate-700 to-transparent' : 'bg-gradient-to-b from-emerald-500 via-slate-200 to-transparent'}`} />

                            <div className="space-y-4">
                                {activities.slice(0, 5).map((activity, index) => (
                                    <ActivityItem
                                        key={activity.id}
                                        activity={activity}
                                        isFirst={index === 0}
                                        isDark={isDark}
                                    />
                                ))}
                                {activities.length === 0 && (
                                    <p className={`text-sm text-center py-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Chưa có hoạt động nào gần đây
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Premium Stat Card with Glassmorphism
function PremiumStatCard({ icon, value, label, trend, trendUp, color, isDark }: {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    trend?: string;
    trendUp?: boolean;
    color: 'emerald' | 'blue' | 'teal' | 'purple';
    isDark: boolean;
}) {
    const colorClasses = {
        emerald: {
            iconBg: isDark ? 'from-emerald-600 to-teal-600' : 'from-emerald-500 to-teal-500',
            glow: 'shadow-emerald-500/20',
        },
        blue: {
            iconBg: isDark ? 'from-blue-600 to-indigo-600' : 'from-blue-500 to-indigo-500',
            glow: 'shadow-blue-500/20',
        },
        teal: {
            iconBg: isDark ? 'from-teal-600 to-cyan-600' : 'from-teal-500 to-cyan-500',
            glow: 'shadow-teal-500/20',
        },
        purple: {
            iconBg: isDark ? 'from-purple-600 to-pink-600' : 'from-purple-500 to-pink-500',
            glow: 'shadow-purple-500/20',
        },
    };

    const classes = colorClasses[color];

    return (
        <div className={`relative group rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 ${isDark
            ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700 backdrop-blur-sm'
            : `bg-white/70 border-slate-200/80 hover:border-slate-300 backdrop-blur-sm shadow-xl ${classes.glow}`
            }`}>
            {/* Gradient glow on hover */}
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${classes.iconBg} blur-xl -z-10`} style={{ opacity: 0.1 }} />

            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${classes.iconBg} text-white shadow-lg ${classes.glow}`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${trendUp !== undefined
                        ? trendUp
                            ? (isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                            : (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600')
                        : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600')
                        }`}>
                        {trendUp !== undefined && (
                            trendUp ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />
                        )}
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className={`text-2xl font-bold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
            </div>
        </div>
    );
}

// Pipeline Bar Component
function PipelineBar({ stage, count, color, max, index, isDark }: {
    stage: string;
    count: number;
    color: string;
    max: number;
    index: number;
    isDark: boolean;
}) {
    const width = (count / max) * 100;

    return (
        <div className="group">
            <div className="flex items-center justify-between mb-1.5">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{stage}</span>
                <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{count}</span>
            </div>
            <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div
                    className="h-full rounded-full transition-all duration-500 ease-out group-hover:opacity-80"
                    style={{
                        width: `${width}%`,
                        backgroundColor: color,
                        animationDelay: `${index * 100}ms`
                    }}
                />
            </div>
        </div>
    );
}

// Member Card Component
function MemberCard({ member, rank, isDark }: {
    member: TeamMember;
    rank: number;
    isDark: boolean;
}) {
    const getMedalColor = (rank: number) => {
        if (rank === 1) return 'from-amber-400 to-yellow-500';
        if (rank === 2) return 'from-slate-300 to-slate-400';
        if (rank === 3) return 'from-amber-600 to-amber-700';
        return 'from-emerald-500 to-teal-500';
    };

    const initials = member.name.split(' ').map(n => n[0]).slice(-2).join('');

    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
            <div className="relative">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getMedalColor(rank)} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                    {rank <= 3 ? rank : initials}
                </div>
                {rank <= 3 && (
                    <div className="absolute -bottom-0.5 -right-0.5 text-sm">
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {member.name}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {member.company_role === 'owner' ? 'Chủ DN' : member.company_role === 'admin' ? 'Admin' : 'Nhân viên'}
                </p>
            </div>
            <div className="text-right">
                <p className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {member.stats?.hired_count ?? 0}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>đã tuyển</p>
            </div>
        </div>
    );
}

// Quick Action Card Component
function QuickActionCard({ icon, label, description, href, color, isDark }: {
    icon: React.ReactNode;
    label: string;
    description: string;
    href: string;
    color: 'emerald' | 'blue' | 'purple' | 'amber';
    isDark: boolean;
}) {
    const colorClasses = {
        emerald: isDark ? 'bg-emerald-900/30 text-emerald-400 group-hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
        blue: isDark ? 'bg-blue-900/30 text-blue-400 group-hover:bg-blue-900/50' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
        purple: isDark ? 'bg-purple-900/30 text-purple-400 group-hover:bg-purple-900/50' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
        amber: isDark ? 'bg-amber-900/30 text-amber-400 group-hover:bg-amber-900/50' : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
    };

    return (
        <Link
            to={href}
            className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
        >
            <div className={`p-2.5 rounded-xl transition-colors ${colorClasses[color]}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{label}</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{description}</p>
            </div>
            <ChevronRightIcon className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
        </Link>
    );
}

// Activity Item Component
function ActivityItem({ activity, isFirst, isDark }: {
    activity: Activity;
    isFirst: boolean;
    isDark: boolean;
}) {
    return (
        <div className="flex gap-4 relative pl-6">
            <div className={`absolute left-0 w-4 h-4 rounded-full border-2 ${isFirst
                ? 'bg-emerald-500 border-emerald-500'
                : isDark
                    ? 'bg-slate-900 border-slate-600'
                    : 'bg-white border-slate-300'
                } z-10`} />
            <div className="flex-1 min-w-0">
                <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {activity.title}
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {activity.time_formatted}
                </p>
            </div>
        </div>
    );
}
