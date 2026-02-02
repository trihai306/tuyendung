import { useState, useEffect } from 'react';
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
} from '../../components/ui/icons';

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
        <div className={`min-h-screen p-6 ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
            {/* Header */}
            <div className="mb-6">
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Dashboard Doanh nghiệp
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {today}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    icon={<BriefcaseIcon className="w-5 h-5" />}
                    value={stats?.active_jobs ?? 0}
                    label="Tin đang tuyển"
                    sublabel="vị trí mở"
                    color="emerald"
                    isDark={isDark}
                />
                <StatCard
                    icon={<UsersIcon className="w-5 h-5" />}
                    value={stats?.total_candidates ?? 0}
                    label="Tổng ứng viên"
                    sublabel="trong hệ thống"
                    color="blue"
                    isDark={isDark}
                />
                <StatCard
                    icon={<CheckCircleIcon className="w-5 h-5" />}
                    value={metrics?.hired_this_month ?? 0}
                    label="Tuyển tháng này"
                    change={metrics?.hired_change}
                    color="teal"
                    isDark={isDark}
                />
                <StatCard
                    icon={<ClockIcon className="w-5 h-5" />}
                    value={stats?.avg_time_to_hire ?? 0}
                    label="Thời gian TB"
                    sublabel="ngày"
                    color="amber"
                    isDark={isDark}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
                {/* Team Performance */}
                <div className={`lg:col-span-2 rounded-xl border p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            <ChartBarIcon className="w-5 h-5 inline mr-2" />
                            Hiệu suất Team
                        </h2>
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {members.length} thành viên
                        </span>
                    </div>
                    <div className="space-y-3">
                        {members.slice(0, 5).map((member, index) => (
                            <div key={member.id} className={`flex items-center gap-4 p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-emerald-500'
                                    }`}>
                                    {index < 3 ? index + 1 : member.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                        {member.name}
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {member.company_role === 'owner' ? 'Chủ DN' : member.company_role === 'admin' ? 'Admin' : 'Nhân viên'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        {member.stats?.hired_count ?? 0}
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>đã tuyển</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={`rounded-xl border p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Thao tác nhanh
                    </h2>
                    <div className="space-y-3">
                        <QuickAction
                            icon={<PlusIcon className="w-5 h-5" />}
                            label="Đăng tin mới"
                            href="/recruiting"
                            isDark={isDark}
                        />
                        <QuickAction
                            icon={<UserPlusIcon className="w-5 h-5" />}
                            label="Mời thành viên"
                            href="/company"
                            isDark={isDark}
                        />
                        <QuickAction
                            icon={<DocumentTextIcon className="w-5 h-5" />}
                            label="Xem báo cáo"
                            href="/reports"
                            isDark={isDark}
                        />
                        <QuickAction
                            icon={<CalendarIcon className="w-5 h-5" />}
                            label="Lịch phỏng vấn"
                            href="/candidates"
                            isDark={isDark}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className={`rounded-xl border p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Hoạt động gần đây
                    </h2>
                    <a href="/company" className={`text-sm hover:underline ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        Xem tất cả
                    </a>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                    {activities.slice(0, 6).map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} isDark={isDark} />
                    ))}
                    {activities.length === 0 && (
                        <p className={`col-span-2 text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Chưa có hoạt động nào
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper Components
function StatCard({ icon, value, label, sublabel, change, color, isDark }: {
    icon: React.ReactNode;
    value: number;
    label: string;
    sublabel?: string;
    change?: number;
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
        <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</div>
            <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{label}</div>
            {sublabel && <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sublabel}</div>}
            {change !== undefined && (
                <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${change >= 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-red-400' : 'text-red-500')}`}>
                    {change >= 0 ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
                    {change >= 0 ? '+' : ''}{change}% so tháng trước
                </div>
            )}
        </div>
    );
}

function QuickAction({ icon, label, href, isDark }: { icon: React.ReactNode; label: string; href: string; isDark: boolean }) {
    return (
        <a
            href={href}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isDark
                ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800'
                }`}
        >
            <span className={`${isDark ? 'text-emerald-400' : 'text-emerald-500'}`}>{icon}</span>
            <span className="font-medium">{label}</span>
        </a>
    );
}

function ActivityCard({ activity, isDark }: { activity: Activity; isDark: boolean }) {
    return (
        <div className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                <CheckCircleIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{activity.title}</p>
                <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{activity.description}</p>
            </div>
            <span className={`text-xs flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{activity.time_formatted}</span>
        </div>
    );
}
