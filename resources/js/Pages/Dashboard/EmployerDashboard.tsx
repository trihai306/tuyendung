import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import StatusBadge from '@/Components/StatusBadge';
import { formatDate } from '@/lib/utils';
import {
    Briefcase,
    Eye,
    ClipboardList,
    CalendarCheck,
    PlusCircle,
    Users,
    TrendingUp,
    ArrowRight,
    Building2,
} from 'lucide-react';
import type { User, Application, JobPost } from '@/types';

interface ApplicationStats {
    pending: number;
    reviewing: number;
    shortlisted: number;
    accepted: number;
    rejected: number;
}

interface EmployerData {
    totalJobPosts: number;
    activeJobs: number;
    totalApplications: number;
    interviewsThisWeek: number;
    applicationStats: ApplicationStats;
    recentApplications: Application[];
    recentJobPosts: (JobPost & { applications_count: number })[];
    companyName: string;
}

interface EmployerDashboardProps {
    data: EmployerData;
    user: User;
}

const STAT_CARDS = [
    {
        key: 'totalJobPosts',
        label: 'Tong tin tuyen dung',
        description: 'Bai dang da tao',
        icon: Briefcase,
        gradient: 'from-blue-500 to-blue-600',
        bgLight: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
        key: 'activeJobs',
        label: 'Dang tuyen dung',
        description: 'Tin dang hoat dong',
        icon: Eye,
        gradient: 'from-indigo-500 to-indigo-600',
        bgLight: 'bg-indigo-50 dark:bg-indigo-950/30',
    },
    {
        key: 'totalApplications',
        label: 'Đơn ứng tuyển',
        description: 'Ung vien da nop don',
        icon: ClipboardList,
        gradient: 'from-violet-500 to-violet-600',
        bgLight: 'bg-violet-50 dark:bg-violet-950/30',
    },
    {
        key: 'interviewsThisWeek',
        label: 'Phỏng vấn tuần này',
        description: 'Lịch phỏng vấn sắp tới',
        icon: CalendarCheck,
        gradient: 'from-purple-500 to-purple-600',
        bgLight: 'bg-purple-50 dark:bg-purple-950/30',
    },
] as const;

const PIPELINE_STAGES: { key: keyof ApplicationStats; label: string; color: string; bgColor: string }[] = [
    { key: 'pending', label: 'Chờ xử lý', color: 'bg-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' },
    { key: 'reviewing', label: 'Đang xem xét', color: 'bg-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300' },
    { key: 'shortlisted', label: 'Danh sách ngắn', color: 'bg-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300' },
    { key: 'accepted', label: 'Da chap nhan', color: 'bg-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' },
    { key: 'rejected', label: 'Da tu choi', color: 'bg-rose-500', bgColor: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300' },
];

export default function EmployerDashboard({ data, user }: EmployerDashboardProps) {
    const totalPipeline = Object.values(data.applicationStats).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 md:p-8 text-white animate-fade-in-up">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                Nhà tuyển dụng
                            </Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Xin chào, {data.companyName}
                        </h1>
                        <p className="text-blue-100 mt-1 text-sm md:text-base">
                            Quản lý tuyển dụng hiệu quả - Tìm ứng viên phù hợp nhanh chóng
                        </p>
                    </div>
                    <Link href="/employer/jobs/create">
                        <Button size="lg" className="bg-white text-indigo-700 hover:bg-blue-50 shadow-lg shadow-indigo-900/20 font-semibold">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Đăng tin tuyển dụng
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {STAT_CARDS.map((stat, index) => {
                    const value = data[stat.key as keyof EmployerData] as number;
                    return (
                        <Card
                            key={stat.key}
                            className={`opacity-0 animate-fade-in-up stagger-${index + 1} border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
                        >
                            <CardContent className="p-4 md:p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs md:text-sm font-medium text-muted-foreground">
                                            {stat.label}
                                        </p>
                                        <p className="text-2xl md:text-3xl font-bold tracking-tight">
                                            {value}
                                        </p>
                                        <p className="text-[11px] md:text-xs text-muted-foreground">
                                            {stat.description}
                                        </p>
                                    </div>
                                    <div className={`flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                                        <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Application Pipeline */}
            <Card className="opacity-0 animate-fade-in-up stagger-3 border-0 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base md:text-lg">Quy trinh tuyen dung</CardTitle>
                            <CardDescription>Tổng quan trang thai don ung tuyen</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {totalPipeline} don
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Progress Bar */}
                    {totalPipeline > 0 && (
                        <div className="flex h-3 rounded-full overflow-hidden mb-5 bg-muted">
                            {PIPELINE_STAGES.map((stage) => {
                                const count = data.applicationStats[stage.key];
                                const percentage = (count / totalPipeline) * 100;
                                if (percentage === 0) return null;
                                return (
                                    <div
                                        key={stage.key}
                                        className={`${stage.color} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                                        style={{ width: `${percentage}%` }}
                                        title={`${stage.label}: ${count}`}
                                    />
                                );
                            })}
                        </div>
                    )}
                    {/* Stage Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {PIPELINE_STAGES.map((stage) => (
                            <div
                                key={stage.key}
                                className={`rounded-xl p-3 text-center ${stage.bgColor} transition-all duration-200 hover:scale-[1.02]`}
                            >
                                <p className="text-2xl font-bold">{data.applicationStats[stage.key]}</p>
                                <p className="text-xs font-medium mt-1">{stage.label}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Two Column: Recent Applications + Recent Jobs */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Applications */}
                <Card className="opacity-0 animate-fade-in-up stagger-4 border-0 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                    <Users className="h-4 w-4 text-indigo-500" />
                                    Ung vien moi nhat
                                </CardTitle>
                                <CardDescription>Đơn ứng tuyển vừa nhận</CardDescription>
                            </div>
                            <Link href="/employer/applications">
                                <Button variant="ghost" size="sm" className="text-xs">
                                    Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {data.recentApplications.length > 0 ? (
                            <div className="space-y-3">
                                {data.recentApplications.map((app) => (
                                    <div
                                        key={app.id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors duration-200"
                                    >
                                        <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                            <AvatarImage src={app.candidate?.avatar} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs">
                                                {app.candidate?.name?.charAt(0)?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {app.candidate?.name || 'Ung vien'}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {app.job_post?.title || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <StatusBadge status={app.status} className="text-[10px]" />
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatDate(app.applied_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Chưa có đơn ứng tuyển nào</p>
                                <p className="text-xs mt-1">Đăng tin tuyển dụng để nhận đơn</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Job Posts */}
                <Card className="opacity-0 animate-fade-in-up stagger-5 border-0 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-blue-500" />
                                    Tin tuyen dung gan day
                                </CardTitle>
                                <CardDescription>Cac bai dang moi nhat</CardDescription>
                            </div>
                            <Link href="/employer/jobs/create">
                                <Button variant="ghost" size="sm" className="text-xs">
                                    Tạo mới <PlusCircle className="ml-1 h-3 w-3" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {data.recentJobPosts.length > 0 ? (
                            <div className="space-y-3">
                                {data.recentJobPosts.map((job) => (
                                    <div
                                        key={job.id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors duration-200"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20">
                                            <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{job.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {job.applications_count} don
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {job.views_count} luot xem
                                                </span>
                                            </div>
                                        </div>
                                        <StatusBadge status={job.status} className="text-[10px]" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Chưa có tin tuyển dụng nào</p>
                                <Link href="/employer/jobs/create">
                                    <Button variant="outline" size="sm" className="mt-3">
                                        <PlusCircle className="mr-2 h-3 w-3" />
                                        Đăng tin đầu tiên
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
