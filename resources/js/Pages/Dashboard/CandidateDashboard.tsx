import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import StatusBadge from '@/Components/StatusBadge';
import { formatDate } from '@/lib/utils';
import {
    FileText,
    Bookmark,
    CalendarCheck,
    Search,
    UserCircle,
    Heart,
    ArrowRight,
    Briefcase,
    Building2,
    TrendingUp,
    CheckCircle2,
    Clock,
    XCircle,
} from 'lucide-react';
import type { User, Application, SavedJob } from '@/types';

interface ApplicationStats {
    pending: number;
    reviewing: number;
    shortlisted: number;
    accepted: number;
    rejected: number;
}

interface CandidateData {
    totalApplications: number;
    savedJobsCount: number;
    interviewCount: number;
    profileCompletion: number;
    applicationStats: ApplicationStats;
    recentApplications: Application[];
    recentSavedJobs: SavedJob[];
}

interface CandidateDashboardProps {
    data: CandidateData;
    user: User;
}

const STAT_CARDS = [
    {
        key: 'totalApplications',
        label: 'Đơn ứng tuyển',
        description: 'Tổng số đơn đã gửi',
        icon: FileText,
        gradient: 'from-emerald-500 to-emerald-600',
        bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
        key: 'savedJobsCount',
        label: 'Việc đã lưu',
        description: 'Công việc yêu thích',
        icon: Bookmark,
        gradient: 'from-teal-500 to-teal-600',
        bgLight: 'bg-teal-50 dark:bg-teal-950/30',
    },
    {
        key: 'interviewCount',
        label: 'Phỏng vấn',
        description: 'Lịch phỏng vấn sắp tới',
        icon: CalendarCheck,
        gradient: 'from-cyan-500 to-cyan-600',
        bgLight: 'bg-cyan-50 dark:bg-cyan-950/30',
    },
] as const;

const STATUS_CARDS: { key: keyof ApplicationStats; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }[] = [
    { key: 'pending', label: 'Chờ xử lý', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
    { key: 'reviewing', label: 'Đang xem xét', icon: Search, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
    { key: 'shortlisted', label: 'Vào vòng ngắn', icon: TrendingUp, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { key: 'accepted', label: 'Đã được nhận', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { key: 'rejected', label: 'Không đạt', icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-950/30' },
];

export default function CandidateDashboard({ data, user }: CandidateDashboardProps) {
    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white animate-fade-in-up">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <UserCircle className="h-5 w-5" />
                            </div>
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                Ứng viên
                            </Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Xin chào, {user.name}
                        </h1>
                        <p className="text-emerald-100 mt-1 text-sm md:text-base">
                            Tìm kiếm cơ hội việc làm phù hợp - Phát triển sự nghiệp của bạn
                        </p>

                        {/* Profile completion */}
                        <div className="mt-4 max-w-xs">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-emerald-100">Hồ sơ hoàn thành</span>
                                <span className="font-semibold">{data.profileCompletion}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-white transition-all duration-1000 ease-out"
                                    style={{ width: `${data.profileCompletion}%` }}
                                />
                            </div>
                            {data.profileCompletion < 80 && (
                                <Link href="/candidate/profile" className="text-xs text-emerald-200 hover:text-white mt-1.5 inline-flex items-center gap-1 transition-colors">
                                    Cập nhật hồ sơ để tăng cơ hội <ArrowRight className="h-3 w-3" />
                                </Link>
                            )}
                        </div>
                    </div>
                    <Link href="/viec-lam">
                        <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg shadow-emerald-900/20 font-semibold">
                            <Search className="mr-2 h-4 w-4" />
                            Tìm việc ngay
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-3">
                {STAT_CARDS.map((stat, index) => {
                    const value = data[stat.key as keyof CandidateData] as number;
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

            {/* Application Status Overview */}
            <Card className="opacity-0 animate-fade-in-up stagger-3 border-0 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base md:text-lg">Trạng thái đơn ứng tuyển</CardTitle>
                    <CardDescription>Tổng quan quy trình ứng tuyển của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {STATUS_CARDS.map((status) => {
                            const StatusIcon = status.icon;
                            return (
                                <div
                                    key={status.key}
                                    className={`rounded-xl p-3 md:p-4 text-center ${status.bgColor} transition-all duration-200 hover:scale-[1.02]`}
                                >
                                    <StatusIcon className={`h-5 w-5 mx-auto mb-1.5 ${status.color}`} />
                                    <p className="text-xl md:text-2xl font-bold">
                                        {data.applicationStats[status.key]}
                                    </p>
                                    <p className="text-[11px] md:text-xs font-medium mt-1 text-muted-foreground">
                                        {status.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Two Column: Recent Applications + Quick Actions/Saved Jobs */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Applications - 2 cols */}
                <Card className="lg:col-span-2 opacity-0 animate-fade-in-up stagger-4 border-0 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-emerald-500" />
                                    Đơn ứng tuyển gần đây
                                </CardTitle>
                                <CardDescription>Các đơn đã nộp gần đây nhất</CardDescription>
                            </div>
                            <Link href="/candidate/applications">
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
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20">
                                            <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/viec-lam/${app.job_post?.slug || app.job_post_id}`}
                                                className="text-sm font-medium hover:text-primary truncate block"
                                            >
                                                {app.job_post?.title || 'N/A'}
                                            </Link>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {app.job_post?.employer?.employer_profile?.company_name
                                                    || app.job_post?.employer?.name
                                                    || 'Công ty'}
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
                                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Chưa có đơn ứng tuyển nào</p>
                                <Link href="/viec-lam">
                                    <Button variant="outline" size="sm" className="mt-3">
                                        <Search className="mr-2 h-3 w-3" />
                                        Tìm việc ngay
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions + Saved Jobs */}
                <div className="space-y-6 opacity-0 animate-fade-in-up stagger-5">
                    {/* Quick Actions */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base md:text-lg">Thao tác nhanh</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/viec-lam" className="block">
                                <Button variant="outline" className="w-full justify-start h-10 text-sm hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300 transition-colors">
                                    <Search className="mr-2.5 h-4 w-4" />
                                    Tìm việc mới
                                </Button>
                            </Link>
                            <Link href="/candidate/profile" className="block">
                                <Button variant="outline" className="w-full justify-start h-10 text-sm hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 dark:hover:bg-teal-950/30 dark:hover:text-teal-300 transition-colors">
                                    <UserCircle className="mr-2.5 h-4 w-4" />
                                    Cập nhật hồ sơ
                                </Button>
                            </Link>
                            <Link href="/candidate/saved-jobs" className="block">
                                <Button variant="outline" className="w-full justify-start h-10 text-sm hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 dark:hover:bg-cyan-950/30 dark:hover:text-cyan-300 transition-colors">
                                    <Heart className="mr-2.5 h-4 w-4" />
                                    Việc đã lưu ({data.savedJobsCount})
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Recent Saved Jobs */}
                    {data.recentSavedJobs.length > 0 && (
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-rose-500" />
                                    Việc đã lưu
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2.5">
                                    {data.recentSavedJobs.map((saved) => (
                                        <Link
                                            key={saved.id}
                                            href={`/viec-lam/${saved.job_post?.slug || saved.job_post_id}`}
                                            className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted transition-colors duration-200 group"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-rose-50 dark:bg-rose-950/30">
                                                <Briefcase className="h-3.5 w-3.5 text-rose-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                                    {saved.job_post?.title || 'N/A'}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {saved.job_post?.employer?.employer_profile?.company_name || ''}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
