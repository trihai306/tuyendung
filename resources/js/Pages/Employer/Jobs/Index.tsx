import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PermissionGate from '@/Components/PermissionGate';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import Pagination from '@/Components/Pagination';
import { formatDate } from '@/lib/utils';
import {
    Plus,
    Search,
    Briefcase,
    Eye,
    Users,
    FileText,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Pencil,
    Trash2,
    MapPin,
    Calendar,
    ListChecks,
    ArrowRight,
    Filter,
    Zap,
} from 'lucide-react';
import type { JobPost, RecruitmentTask, PaginatedData } from '@/types';
import { useState, FormEventHandler } from 'react';
import { usePermission } from '@/hooks/usePermission';

interface Stats {
    total: number;
    active: number;
    draft: number;
    expired: number;
    totalApplications: number;
}

interface Props {
    jobPosts: PaginatedData<JobPost>;
    filters: Record<string, string>;
    stats: Stats;
    recentTasks: RecruitmentTask[];
}

const JOB_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    active: { label: 'Dang tuyen', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    draft: { label: 'Ban nhap', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
    expired: { label: 'Het han', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
    closed: { label: 'Da dong', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
};

const TASK_PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const TASK_STATUS_ICONS: Record<string, typeof Clock> = {
    pending: Clock,
    in_progress: Zap,
    completed: CheckCircle2,
};

export default function Index({ jobPosts, filters, stats, recentTasks }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const { can } = usePermission();

    const handleFilter = (key: string, value: string) => {
        router.get(
            route('employer.jobs.index'),
            { ...filters, [key]: value === 'all' ? '' : value },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearch: FormEventHandler = (e) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const handleDelete = (jobId: number) => {
        if (confirm('Ban co chac muon xoa tin nay?')) {
            router.delete(route('employer.jobs.destroy', jobId));
        }
    };

    const STAT_CARDS = [
        { label: 'Tong tin dang', value: stats.total, icon: Briefcase, gradient: 'from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50', iconBg: 'bg-slate-500/10', iconColor: 'text-slate-600' },
        { label: 'Dang tuyen', value: stats.active, icon: Zap, gradient: 'from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
        { label: 'Ban nhap', value: stats.draft, icon: FileText, gradient: 'from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-amber-900/30', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-600' },
        { label: 'Tong don nhan', value: stats.totalApplications, icon: Users, gradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600' },
    ];

    return (
        <AuthenticatedLayout title="Dang tin moi" header="Dang tin moi">
            <Head title="Tin tuyen dung" />

            <PermissionGate permission="jobs.view">
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {STAT_CARDS.map((stat) => (
                            <Card key={stat.label} className={`border-none shadow-sm bg-gradient-to-br ${stat.gradient}`}>
                                <CardContent className="pt-5 pb-4 px-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                                            <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                        </div>
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
                                            <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Job Listings - 2 columns */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Filters */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-4 pb-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                            <Input
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Tim tin tuyen dung..."
                                                className="pl-9 h-9 text-xs"
                                            />
                                        </form>
                                        <Select value={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v)}>
                                            <SelectTrigger className="w-[140px] h-9 text-xs">
                                                <Filter className="h-3 w-3 mr-1.5 text-muted-foreground" />
                                                <SelectValue placeholder="Trang thai" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tat ca</SelectItem>
                                                <SelectItem value="active">Dang tuyen</SelectItem>
                                                <SelectItem value="draft">Ban nhap</SelectItem>
                                                <SelectItem value="expired">Het han</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {can('jobs.create') && (
                                            <Link href={route('employer.jobs.create')}>
                                                <Button size="sm" className="h-9 text-xs gap-1.5">
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Tao tin moi
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Job Cards */}
                            {jobPosts.data.length === 0 ? (
                                <Card className="border-none shadow-sm">
                                    <CardContent className="py-16">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                                                <Briefcase className="h-7 w-7 text-muted-foreground/40" />
                                            </div>
                                            <h3 className="text-sm font-semibold mb-1">Chua co tin tuyen dung</h3>
                                            <p className="text-xs text-muted-foreground max-w-sm mb-4">
                                                Tao tin tuyen dung dau tien de bat dau tim ung vien phu hop.
                                            </p>
                                            <Link href={route('employer.jobs.create')}>
                                                <Button size="sm" className="gap-1.5">
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Tao tin tuyen dung
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {jobPosts.data.map((job) => {
                                        const statusCfg = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.draft;
                                        return (
                                            <Card key={job.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
                                                <CardContent className="py-4 px-5">
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        {/* Job Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                <h3 className="text-sm font-semibold truncate">{job.title}</h3>
                                                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${statusCfg.color}`}>
                                                                    {statusCfg.label}
                                                                </Badge>
                                                                {job.job_type && (
                                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                                                        {job.job_type === 'seasonal' ? 'Thoi vu' : 'Van phong'}
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                                {job.city && (
                                                                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                                        <MapPin className="h-3 w-3" />
                                                                        {job.district ? `${job.district}, ${job.city}` : job.city}
                                                                    </span>
                                                                )}
                                                                {job.category && (
                                                                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                                        <FileText className="h-3 w-3" />
                                                                        {job.category.name}
                                                                    </span>
                                                                )}
                                                                {job.deadline && (
                                                                    <span className={`flex items-center gap-1 text-[11px] ${new Date(job.deadline) < new Date() ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                                        <Calendar className="h-3 w-3" />
                                                                        Han: {formatDate(job.deadline)}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Salary */}
                                                            {(job.salary_min || job.salary_max) && (
                                                                <p className="text-[11px] text-emerald-600 font-medium mt-1.5">
                                                                    {job.salary_min && job.salary_max
                                                                        ? `${Number(job.salary_min).toLocaleString()}d - ${Number(job.salary_max).toLocaleString()}d`
                                                                        : job.salary_min
                                                                            ? `Tu ${Number(job.salary_min).toLocaleString()}d`
                                                                            : `Den ${Number(job.salary_max).toLocaleString()}d`}
                                                                    {job.salary_type && ` / ${job.salary_type === 'monthly' ? 'thang' : job.salary_type === 'hourly' ? 'gio' : job.salary_type === 'daily' ? 'ngay' : 'du an'}`}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Right: Stats + Actions */}
                                                        <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                                                            {/* Application count */}
                                                            <div className="flex items-center gap-1.5 text-xs">
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                                                    <Users className="h-3.5 w-3.5 text-blue-600" />
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-bold">{job.applications_count ?? 0}</p>
                                                                    <p className="text-[10px] text-muted-foreground">don</p>
                                                                </div>
                                                            </div>

                                                            {/* View count */}
                                                            {job.views_count !== undefined && (
                                                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                                    <Eye className="h-3 w-3" />
                                                                    {job.views_count} luot xem
                                                                </div>
                                                            )}

                                                            {/* Actions */}
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {can('jobs.edit') && (
                                                                    <Link href={route('employer.jobs.edit', job.id)}>
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                            <Pencil className="h-3 w-3" />
                                                                        </Button>
                                                                    </Link>
                                                                )}
                                                                {can('jobs.delete') && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                                        onClick={() => handleDelete(job.id)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {jobPosts.data.length > 0 && (
                                <Pagination meta={jobPosts.meta} />
                            )}
                        </div>

                        {/* Sidebar - Recent Tasks */}
                        <div className="space-y-4">
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            <ListChecks className="h-4 w-4 text-muted-foreground" />
                                            Nhiem vu gan day
                                        </h3>
                                        <Link href={route('employer.tasks.index')}>
                                            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1">
                                                Xem tat ca
                                                <ArrowRight className="h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>

                                    {recentTasks.length === 0 ? (
                                        <div className="text-center py-8">
                                            <ListChecks className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                                            <p className="text-xs text-muted-foreground">Chua co nhiem vu</p>
                                            <Link href={route('employer.tasks.create')} className="mt-2 inline-block">
                                                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 mt-2">
                                                    <Plus className="h-3 w-3" />
                                                    Tao nhiem vu
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {recentTasks.map((task) => {
                                                const TaskStatusIcon = TASK_STATUS_ICONS[task.status] || Clock;
                                                return (
                                                    <Link
                                                        key={task.id}
                                                        href={route('employer.tasks.show', task.id)}
                                                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group/task"
                                                    >
                                                        {/* Priority dot */}
                                                        <div className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${TASK_PRIORITY_COLORS[task.priority]}`}>
                                                            {task.priority === 'urgent' ? 'KC' : task.priority === 'high' ? 'CAO' : task.priority === 'medium' ? 'TB' : 'TH'}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium truncate group-hover/task:text-foreground">{task.title}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <TaskStatusIcon className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-[10px] text-muted-foreground truncate">
                                                                    {task.job_post?.title || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Assignee */}
                                                        {task.assignee && (
                                                            <Avatar className="h-6 w-6 shrink-0">
                                                                <AvatarImage src={task.assignee.avatar} />
                                                                <AvatarFallback className="text-[9px] bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                                                                    {task.assignee.name?.charAt(0)?.toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-4">
                                    <h3 className="text-sm font-semibold mb-3">Thao tac nhanh</h3>
                                    <div className="space-y-2">
                                        {can('jobs.create') && (
                                            <Link href={route('employer.jobs.create')} className="block">
                                                <Button variant="outline" className="w-full justify-start h-9 text-xs gap-2">
                                                    <Plus className="h-3.5 w-3.5 text-emerald-500" />
                                                    Tao tin tuyen dung
                                                </Button>
                                            </Link>
                                        )}
                                        {can('tasks.create') && (
                                            <Link href={route('employer.tasks.create')} className="block">
                                                <Button variant="outline" className="w-full justify-start h-9 text-xs gap-2">
                                                    <ListChecks className="h-3.5 w-3.5 text-blue-500" />
                                                    Giao nhiem vu moi
                                                </Button>
                                            </Link>
                                        )}
                                        <Link href={route('employer.applications.index')} className="block">
                                            <Button variant="outline" className="w-full justify-start h-9 text-xs gap-2">
                                                <Users className="h-3.5 w-3.5 text-violet-500" />
                                                Quan ly ung vien
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </PermissionGate>
        </AuthenticatedLayout>
    );
}
