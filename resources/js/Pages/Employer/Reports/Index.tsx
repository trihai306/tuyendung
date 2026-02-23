import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PermissionGate from '@/Components/PermissionGate';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
    BarChart3,
    Briefcase,
    Users,
    TrendingUp,
    Target,
    CheckCircle2,
    Clock,
    ListChecks,
    Globe,
    MessageCircle,
    Facebook,
    ExternalLink,
    FileText,
} from 'lucide-react';
import { useState } from 'react';

interface JobReport {
    id: number;
    title: string;
    status: string;
    job_type: string;
    publish_channels: string[] | null;
    applications_count: number;
    pending_count: number;
    reviewing_count: number;
    shortlisted_count: number;
    accepted_count: number;
    rejected_count: number;
    system_count: number;
    facebook_count: number;
    zalo_count: number;
    other_source_count: number;
    creator?: { id: number; name: string } | null;
    category?: { id: number; name: string } | null;
    created_at: string;
}

interface MemberPerformance {
    member: {
        id: number;
        role: string;
        user: { id: number; name: string; email: string; avatar?: string } | null;
    };
    jobs_created: number;
    candidates_added: number;
    tasks_assigned: number;
    tasks_completed: number;
}

interface ChannelAnalytics {
    by_source: Record<string, number>;
    by_status: Record<string, number>;
    publish_channels: Record<string, number>;
    total_applications: number;
}

interface Props {
    jobPostReport: JobReport[];
    channelAnalytics: ChannelAnalytics;
    memberPerformance: MemberPerformance[];
}

const SOURCE_CONFIG: Record<string, { label: string; icon: typeof Globe; color: string; bg: string }> = {
    system: { label: 'He thong', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    facebook: { label: 'Facebook', icon: Facebook, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    zalo: { label: 'Zalo', icon: MessageCircle, color: 'text-blue-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    linkedin: { label: 'LinkedIn', icon: ExternalLink, color: 'text-blue-700', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    referral: { label: 'Gioi thieu', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    other: { label: 'Khac', icon: ExternalLink, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-800' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: 'Cho xu ly', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    reviewing: { label: 'Dang xem', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    shortlisted: { label: 'Phu hop', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
    accepted: { label: 'Trung tuyen', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    rejected: { label: 'Tu choi', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

const ROLE_LABELS: Record<string, string> = {
    owner: 'Chu cong ty',
    manager: 'Quan ly',
    member: 'Thanh vien',
};

type TabKey = 'overview' | 'members' | 'jobs';

export default function Index({ jobPostReport, channelAnalytics, memberPerformance }: Props) {
    const [activeTab, setActiveTab] = useState<TabKey>('overview');

    const totalJobs = jobPostReport.length;
    const totalApps = channelAnalytics.total_applications;
    const acceptedApps = channelAnalytics.by_status?.accepted || 0;
    const conversionRate = totalApps > 0 ? ((acceptedApps / totalApps) * 100).toFixed(1) : '0';

    const tabs: { key: TabKey; label: string; icon: typeof BarChart3 }[] = [
        { key: 'overview', label: 'Tong quan', icon: BarChart3 },
        { key: 'members', label: 'Nhan vien', icon: Users },
        { key: 'jobs', label: 'Theo tin', icon: Briefcase },
    ];

    return (
        <AuthenticatedLayout title="Bao cao" header="Bao cao tuyen dung">
            <Head title="Bao cao tuyen dung" />

            <PermissionGate permission="reports.view">
                <div className="space-y-6">
                    {/* Hero */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                                    <BarChart3 className="h-7 w-7 text-white/90" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">Bao cao tuyen dung</h1>
                                    <p className="mt-0.5 text-sm text-white/60">
                                        Thong ke hieu suat doi ngu va hieu qua tung kenh
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Summary stats */}
                        <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Tong tin dang', value: totalJobs, icon: Briefcase, iconColor: 'text-blue-400' },
                                { label: 'Tong ung vien', value: totalApps, icon: Users, iconColor: 'text-emerald-400' },
                                { label: 'Da tuyen', value: acceptedApps, icon: CheckCircle2, iconColor: 'text-green-400' },
                                { label: 'Ty le chuyen doi', value: `${conversionRate}%`, icon: TrendingUp, iconColor: 'text-violet-400' },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex items-center gap-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3"
                                >
                                    <stat.icon className={`h-5 w-5 ${stat.iconColor} shrink-0`} />
                                    <div>
                                        <p className="text-lg font-bold text-white leading-none">{stat.value}</p>
                                        <p className="text-[10px] text-white/40 mt-0.5">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 w-fit">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    {activeTab === 'overview' && (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Source distribution */}
                            <Card className="border shadow-sm rounded-xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-blue-500" />
                                        Ung vien theo nguon
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.entries(channelAnalytics.by_source).length > 0 ? (
                                            Object.entries(channelAnalytics.by_source).map(([source, count]) => {
                                                const cfg = SOURCE_CONFIG[source] || SOURCE_CONFIG.other;
                                                const pct = totalApps > 0 ? (count / totalApps) * 100 : 0;

                                                return (
                                                    <div key={source} className="space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${cfg.bg}`}>
                                                                    <cfg.icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                                                                </div>
                                                                <span className="text-xs font-medium">{cfg.label}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold">{count}</span>
                                                                <span className="text-[10px] text-muted-foreground">({pct.toFixed(0)}%)</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                                                                style={{ width: `${Math.max(pct, 2)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-6">Chua co du lieu</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status distribution */}
                            <Card className="border shadow-sm rounded-xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <ListChecks className="h-4 w-4 text-emerald-500" />
                                        Trang thai ung vien
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.entries(channelAnalytics.by_status).length > 0 ? (
                                            Object.entries(channelAnalytics.by_status).map(([status, count]) => {
                                                const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
                                                const pct = totalApps > 0 ? (count / totalApps) * 100 : 0;

                                                return (
                                                    <div key={status} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full border-none ${cfg.color}`}>
                                                                {cfg.label}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                                                                    style={{ width: `${Math.max(pct, 2)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-bold w-8 text-right">{count}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-6">Chua co du lieu</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Channel publishing stats */}
                            <Card className="border shadow-sm rounded-xl lg:col-span-2">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Target className="h-4 w-4 text-violet-500" />
                                        Kenh dang tin
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { key: 'system', label: 'He thong', icon: Globe, color: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-900/30 dark:to-indigo-900/30', iconColor: 'text-blue-600' },
                                            { key: 'zalo', label: 'Zalo', icon: MessageCircle, color: 'from-sky-500/10 to-cyan-500/10 dark:from-sky-900/30 dark:to-cyan-900/30', iconColor: 'text-sky-600' },
                                            { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'from-indigo-500/10 to-violet-500/10 dark:from-indigo-900/30 dark:to-violet-900/30', iconColor: 'text-indigo-600' },
                                        ].map((ch) => (
                                            <div key={ch.key} className={`rounded-xl bg-gradient-to-br ${ch.color} p-4 text-center`}>
                                                <ch.icon className={`h-6 w-6 ${ch.iconColor} mx-auto mb-2`} />
                                                <p className="text-2xl font-bold">{channelAnalytics.publish_channels[ch.key] || 0}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{ch.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="space-y-4">
                            {memberPerformance.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {memberPerformance.map((perf) => {
                                        const user = perf.member.user;
                                        const totalActivity = perf.jobs_created + perf.candidates_added + perf.tasks_completed;

                                        return (
                                            <Card key={perf.member.id} className="border shadow-sm rounded-xl hover:shadow-md transition-all">
                                                <CardContent className="p-5">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm">
                                                            <AvatarImage src={user?.avatar} />
                                                            <AvatarFallback className="text-sm bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                                                                {user?.name?.charAt(0)?.toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-semibold truncate">{user?.name || 'N/A'}</p>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-full">
                                                                    {ROLE_LABELS[perf.member.role] || perf.member.role}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-primary">{totalActivity}</p>
                                                            <p className="text-[10px] text-muted-foreground">Hoat dong</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            { label: 'Tin da tao', value: perf.jobs_created, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
                                                            { label: 'UV da them', value: perf.candidates_added, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' },
                                                            { label: 'NV duoc giao', value: perf.tasks_assigned, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' },
                                                            { label: 'NV hoan thanh', value: perf.tasks_completed, color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' },
                                                        ].map((stat) => (
                                                            <div key={stat.label} className={`rounded-lg px-3 py-2 ${stat.color}`}>
                                                                <p className="text-base font-bold">{stat.value}</p>
                                                                <p className="text-[10px]">{stat.label}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Card className="border-none shadow-sm rounded-xl">
                                    <CardContent className="py-16 text-center">
                                        <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">Chua co du lieu nhan vien</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {activeTab === 'jobs' && (
                        <div className="space-y-4">
                            {jobPostReport.length > 0 ? (
                                jobPostReport.map((job) => (
                                    <Card key={job.id} className="border shadow-sm rounded-xl hover:shadow-md transition-all">
                                        <CardContent className="p-5">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                {/* Job info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                        <h3 className="text-sm font-semibold truncate">{job.title}</h3>
                                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 rounded-full ${job.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                            : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                            }`}>
                                                            {job.status === 'active' ? 'Dang tuyen' : job.status === 'draft' ? 'Nhap' : 'Het han'}
                                                        </Badge>
                                                        {job.category && (
                                                            <span className="text-[10px] text-muted-foreground">{job.category.name}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                                        {job.creator && (
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {job.creator.name}
                                                            </span>
                                                        )}
                                                        {job.publish_channels && job.publish_channels.length > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Globe className="h-3 w-3" />
                                                                {job.publish_channels.join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Source breakdown */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {[
                                                        { label: 'He thong', value: job.system_count, bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-700 dark:text-blue-300' },
                                                        { label: 'Facebook', value: job.facebook_count, bg: 'bg-indigo-50 dark:bg-indigo-900/20', color: 'text-indigo-700 dark:text-indigo-300' },
                                                        { label: 'Zalo', value: job.zalo_count, bg: 'bg-sky-50 dark:bg-sky-900/20', color: 'text-sky-700 dark:text-sky-300' },
                                                        { label: 'Khac', value: job.other_source_count, bg: 'bg-gray-50 dark:bg-gray-800', color: 'text-gray-700 dark:text-gray-300' },
                                                    ].map((s) => (
                                                        <div key={s.label} className={`rounded-lg px-2.5 py-1.5 ${s.bg} text-center min-w-[60px]`}>
                                                            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                                                            <p className="text-[9px] text-muted-foreground">{s.label}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Status breakdown */}
                                                <div className="flex items-center gap-2 flex-wrap lg:border-l lg:pl-4 border-border/30">
                                                    {[
                                                        { label: 'Cho', value: job.pending_count, color: 'text-amber-600' },
                                                        { label: 'Xem', value: job.reviewing_count, color: 'text-blue-600' },
                                                        { label: 'Phu hop', value: job.shortlisted_count, color: 'text-violet-600' },
                                                        { label: 'Tuyen', value: job.accepted_count, color: 'text-emerald-600' },
                                                        { label: 'Tu choi', value: job.rejected_count, color: 'text-red-600' },
                                                    ].map((s) => (
                                                        <div key={s.label} className="text-center min-w-[40px]">
                                                            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                                                            <p className="text-[9px] text-muted-foreground">{s.label}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card className="border-none shadow-sm rounded-xl">
                                    <CardContent className="py-16 text-center">
                                        <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">Chua co tin tuyen dung nao</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </PermissionGate>
        </AuthenticatedLayout>
    );
}
