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
} from '../../components/ui/icons';
import { JobAlertsWidget } from './components/JobAlertsWidget';

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

export function AdminDashboard() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [stats, setStats] = useState<CompanyStats | null>(null);
    const [metrics, setMetrics] = useState<QuickMetrics | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
            {/* Compact Header */}
            <div className={`sticky top-0 z-10 backdrop-blur-md ${isDark ? 'bg-slate-950/80' : 'bg-slate-50/80'}`}>
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Tổng quan
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {today}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                to="/recruiting"
                                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                            >
                                <PlusIcon className="w-4 h-4" />
                                Đăng tin
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-6 space-y-5">
                {/* Compact Stats Bar */}
                <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3`}>
                    <CompactStatCard
                        icon={<BriefcaseIcon className="w-4 h-4" />}
                        value={stats?.active_jobs ?? 0}
                        label="Tin đang tuyển"
                        color="emerald"
                        isDark={isDark}
                    />
                    <CompactStatCard
                        icon={<UsersIcon className="w-4 h-4" />}
                        value={stats?.total_candidates ?? 0}
                        label="Ứng viên"
                        color="blue"
                        isDark={isDark}
                    />
                    <CompactStatCard
                        icon={<CheckCircleIcon className="w-4 h-4" />}
                        value={metrics?.hired_this_month ?? 0}
                        label="Đã tuyển tháng này"
                        change={metrics?.hired_change}
                        color="teal"
                        isDark={isDark}
                    />
                    <CompactStatCard
                        icon={<ClockIcon className="w-4 h-4" />}
                        value={`${stats?.avg_time_to_hire ?? 0} ngày`}
                        label="Thời gian tuyển TB"
                        color="slate"
                        isDark={isDark}
                    />
                </div>

                {/* Job Alerts - Compact */}
                <JobAlertsWidget />

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-5 gap-5">
                    {/* Team Performance - Wider */}
                    <div className={`lg:col-span-3 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-2">
                                <ChartBarIcon className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                                <h2 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    Hiệu suất team
                                </h2>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                {members.length} thành viên
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {members.slice(0, 5).map((member, index) => (
                                <div key={member.id} className={`flex items-center gap-4 px-5 py-3 transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${index === 0 ? 'bg-amber-500' :
                                            index === 1 ? 'bg-slate-400' :
                                                index === 2 ? 'bg-amber-700' :
                                                    'bg-emerald-500'
                                        }`}>
                                        {index < 3 ? index + 1 : member.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                            {member.name}
                                        </p>
                                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {member.company_role === 'owner' ? 'Chủ DN' : member.company_role === 'admin' ? 'Admin' : 'Nhân viên'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-right">
                                        <div>
                                            <p className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                {member.stats?.hired_count ?? 0}
                                            </p>
                                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>đã tuyển</p>
                                        </div>
                                        <div className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {members.length === 0 && (
                                <div className={`px-5 py-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Chưa có thành viên nào</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions - Narrower */}
                    <div className={`lg:col-span-2 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h2 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Thao tác nhanh
                            </h2>
                        </div>
                        <div className="p-3 space-y-1">
                            <QuickActionItem
                                icon={<PlusIcon className="w-4 h-4" />}
                                label="Đăng tin tuyển dụng"
                                href="/recruiting"
                                isDark={isDark}
                            />
                            <QuickActionItem
                                icon={<UserPlusIcon className="w-4 h-4" />}
                                label="Mời thành viên"
                                href="/company"
                                isDark={isDark}
                            />
                            <QuickActionItem
                                icon={<CalendarIcon className="w-4 h-4" />}
                                label="Xem lịch phỏng vấn"
                                href="/calendar"
                                isDark={isDark}
                            />
                            <QuickActionItem
                                icon={<DocumentTextIcon className="w-4 h-4" />}
                                label="Báo cáo tuyển dụng"
                                href="/reports"
                                isDark={isDark}
                            />
                        </div>
                    </div>
                </div>

                {/* Recent Activities - Timeline Style */}
                <div className={`rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h2 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Hoạt động gần đây
                        </h2>
                        <Link to="/company" className={`text-xs font-medium hover:underline ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="px-5 py-4">
                        <div className="relative">
                            {/* Timeline line */}
                            <div className={`absolute left-[7px] top-2 bottom-2 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

                            <div className="space-y-4">
                                {activities.slice(0, 5).map((activity) => (
                                    <div key={activity.id} className="flex gap-4 relative">
                                        <div className={`w-3.5 h-3.5 rounded-full border-2 ${isDark ? 'bg-slate-900 border-emerald-500' : 'bg-white border-emerald-500'} z-10 mt-1`} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                                {activity.title}
                                            </p>
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {activity.time_formatted}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {activities.length === 0 && (
                                    <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Chưa có hoạt động nào
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

// Compact Stat Card Component
function CompactStatCard({ icon, value, label, change, color, isDark }: {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    change?: number;
    color: string;
    isDark: boolean;
}) {
    const iconColors: Record<string, string> = {
        emerald: isDark ? 'text-emerald-400' : 'text-emerald-600',
        blue: isDark ? 'text-blue-400' : 'text-blue-600',
        teal: isDark ? 'text-teal-400' : 'text-teal-600',
        slate: isDark ? 'text-slate-400' : 'text-slate-500',
    };

    return (
        <div className={`rounded-xl border px-4 py-3 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3">
                <div className={iconColors[color]}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                        <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {value}
                        </span>
                        {change !== undefined && (
                            <span className={`text-xs font-medium flex items-center gap-0.5 ${change >= 0
                                    ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                    : (isDark ? 'text-red-400' : 'text-red-500')
                                }`}>
                                {change >= 0 ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
                                {change >= 0 ? '+' : ''}{change}%
                            </span>
                        )}
                    </div>
                    <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
                </div>
            </div>
        </div>
    );
}

// Quick Action Item Component
function QuickActionItem({ icon, label, href, isDark }: {
    icon: React.ReactNode;
    label: string;
    href: string;
    isDark: boolean;
}) {
    return (
        <Link
            to={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDark
                ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                }`}
        >
            <span className={`${isDark ? 'text-emerald-400' : 'text-emerald-500'}`}>{icon}</span>
            <span className="text-sm">{label}</span>
            <ChevronRightIcon className={`w-4 h-4 ml-auto ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
        </Link>
    );
}
