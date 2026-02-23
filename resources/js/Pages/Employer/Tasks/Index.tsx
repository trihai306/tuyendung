import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PermissionGate from '@/Components/PermissionGate';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Input } from '@/Components/ui/input';
import Pagination from '@/Components/Pagination';
import { formatDate } from '@/lib/utils';
import TaskService from '@/services/TaskService';
import {
    Plus,
    ListChecks,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Filter,
    Search,
    Zap,
    CalendarDays,
    XCircle,
    Hash,
    Briefcase,
    Users,
    ChevronRight,
    TrendingUp,
    Target,
    ArrowUpRight,
    LayoutGrid,
    List,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RecruitmentTask, CompanyMember, PaginatedData } from '@/types';
import { useState } from 'react';

interface Props {
    tasks: PaginatedData<RecruitmentTask>;
    members: CompanyMember[];
    filters: Record<string, string>;
    canAssign: boolean;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string; ring: string }> = {
    low: { label: 'Thấp', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-400', ring: 'ring-slate-400/30' },
    medium: { label: 'Trung bình', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300', dot: 'bg-blue-500', ring: 'ring-blue-500/30' },
    high: { label: 'Cao', color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/60 dark:text-orange-300', dot: 'bg-orange-500', ring: 'ring-orange-500/30' },
    urgent: { label: 'Khẩn cấp', color: 'bg-red-50 text-red-600 dark:bg-red-900/60 dark:text-red-300', dot: 'bg-red-500', ring: 'ring-red-500/30' },
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string; border: string; bg: string; gradient: string }> = {
    pending: {
        label: 'Chờ xử lý', icon: Clock,
        color: 'text-amber-600 dark:text-amber-400',
        border: 'border-l-amber-400',
        bg: 'bg-amber-500/10',
        gradient: 'from-amber-500/5 to-orange-500/5',
    },
    in_progress: {
        label: 'Đang thực hiện', icon: Zap,
        color: 'text-blue-600 dark:text-blue-400',
        border: 'border-l-blue-500',
        bg: 'bg-blue-500/10',
        gradient: 'from-blue-500/5 to-indigo-500/5',
    },
    completed: {
        label: 'Hoàn thành', icon: CheckCircle2,
        color: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-l-emerald-500',
        bg: 'bg-emerald-500/10',
        gradient: 'from-emerald-500/5 to-teal-500/5',
    },
    cancelled: {
        label: 'Đã hủy', icon: XCircle,
        color: 'text-gray-500 dark:text-gray-400',
        border: 'border-l-gray-400',
        bg: 'bg-gray-500/10',
        gradient: 'from-gray-500/5 to-slate-500/5',
    },
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
    chinh_thuc: { label: 'Chính thức', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
    thoi_vu: { label: 'Thời vụ', color: 'bg-violet-50 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' },
};

// Animation
const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const fadeSlide = (delay = 0) => ({
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } },
});

const scaleIn = (i: number) => ({
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] } },
});

const slideRow = (i: number) => ({
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.15 + i * 0.05, ease: [0.22, 1, 0.36, 1] } },
});

// Progress ring component
function ProgressRing({ percentage, color, size = 36 }: { percentage: number; color: string; size?: number }) {
    const radius = (size - 4) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="none" strokeWidth="3"
                className="stroke-muted/20"
            />
            <motion.circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="none" strokeWidth="3" strokeLinecap="round"
                stroke={color}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
        </svg>
    );
}

export default function Index({ tasks, members, filters, canAssign }: Props) {
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
    const [assigneeFilter, setAssigneeFilter] = useState(filters.assigned_to || 'all');
    const [searchTerm, setSearchTerm] = useState('');

    const applyFilter = (key: string, value: string) => {
        const newFilters: Record<string, string> = {
            ...filters,
            [key]: value === 'all' ? '' : value,
        };
        Object.keys(newFilters).forEach(k => {
            if (!newFilters[k]) delete newFilters[k];
        });
        TaskService.filterTasks(newFilters);
    };

    const handleStatusChange = (taskId: number, newStatus: string) => {
        TaskService.updateTask(taskId, { status: newStatus });
    };

    // Stats
    const total = tasks.data.length;
    const pendingCount = tasks.data.filter(t => t.status === 'pending').length;
    const inProgressCount = tasks.data.filter(t => t.status === 'in_progress').length;
    const completedCount = tasks.data.filter(t => t.status === 'completed').length;
    const urgentCount = tasks.data.filter(t => t.priority === 'urgent' || t.priority === 'high').length;
    const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    const totalTarget = tasks.data.reduce((sum, t) => sum + (t.target_quantity || 0), 0);

    // Local search filter
    const filteredTasks = searchTerm
        ? tasks.data.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
        : tasks.data;

    return (
        <AuthenticatedLayout title="Nhiệm vụ" header="Nhiệm vụ tuyển dụng">
            <Head title="Nhiệm vụ tuyển dụng" />

            <PermissionGate permission="tasks.view_all">
                <motion.div className="space-y-5" initial="hidden" animate="visible" variants={stagger}>

                    {/* Premium Stats Dashboard */}
                    <motion.div variants={fadeSlide(0)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Completion Rate - hero stat */}
                        <motion.div
                            variants={scaleIn(0)}
                            whileHover={{ y: -2, transition: { duration: 0.2 } }}
                            className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-violet-500/5 via-card to-indigo-500/5 p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Tiến độ</p>
                                    <motion.p
                                        className="text-2xl font-bold mt-1 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        {completionRate}%
                                    </motion.p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{completedCount}/{total} hoàn thành</p>
                                </div>
                                <ProgressRing percentage={completionRate} color="#8b5cf6" size={40} />
                            </div>
                            <div className="absolute -right-3 -bottom-3 w-20 h-20 bg-violet-500/[0.03] rounded-full blur-xl" />
                        </motion.div>

                        {/* Pending */}
                        <motion.div
                            variants={scaleIn(1)}
                            whileHover={{ y: -2, transition: { duration: 0.2 } }}
                            className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-amber-500/5 via-card to-orange-500/5 p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Chờ xử lý</p>
                                    <motion.p
                                        className="text-2xl font-bold mt-1"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7, duration: 0.5 }}
                                    >
                                        {pendingCount}
                                    </motion.p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">nhiệm vụ đang chờ</p>
                                </div>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                </div>
                            </div>
                            <div className="absolute -right-3 -bottom-3 w-20 h-20 bg-amber-500/[0.03] rounded-full blur-xl" />
                        </motion.div>

                        {/* In Progress */}
                        <motion.div
                            variants={scaleIn(2)}
                            whileHover={{ y: -2, transition: { duration: 0.2 } }}
                            className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-blue-500/5 via-card to-indigo-500/5 p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Đang thực hiện</p>
                                    <motion.p
                                        className="text-2xl font-bold mt-1"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.8, duration: 0.5 }}
                                    >
                                        {inProgressCount}
                                    </motion.p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">đang triển khai</p>
                                </div>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                                    <Zap className="h-4 w-4 text-blue-500" />
                                </div>
                            </div>
                            <div className="absolute -right-3 -bottom-3 w-20 h-20 bg-blue-500/[0.03] rounded-full blur-xl" />
                        </motion.div>

                        {/* Target */}
                        <motion.div
                            variants={scaleIn(3)}
                            whileHover={{ y: -2, transition: { duration: 0.2 } }}
                            className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-emerald-500/5 via-card to-teal-500/5 p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Mục tiêu</p>
                                    <motion.p
                                        className="text-2xl font-bold mt-1"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.9, duration: 0.5 }}
                                    >
                                        {totalTarget}
                                    </motion.p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">người cần tuyển</p>
                                </div>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                                    <Target className="h-4 w-4 text-emerald-500" />
                                </div>
                            </div>
                            <div className="absolute -right-3 -bottom-3 w-20 h-20 bg-emerald-500/[0.03] rounded-full blur-xl" />
                        </motion.div>
                    </motion.div>

                    {/* Actions + filter toolbar */}
                    <motion.div variants={fadeSlide(0.2)}>
                        <Card className="border-border/50 shadow-sm">
                            <CardContent className="py-3 px-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Search */}
                                    <div className="relative flex-1 min-w-[140px] max-w-[260px]">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                                        <Input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Tìm nhiệm vụ..."
                                            className="pl-8 h-8 text-xs border-border/50 bg-muted/30 focus:bg-background transition-colors"
                                        />
                                    </div>

                                    <div className="h-5 w-px bg-border/50 hidden sm:block" />

                                    {/* Status filter */}
                                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); applyFilter('status', v); }}>
                                        <SelectTrigger className="h-8 w-[128px] text-xs border-border/50">
                                            <Filter className="h-3 w-3 mr-1 text-muted-foreground/60" />
                                            <SelectValue placeholder="Trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                                            <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                                            <SelectItem value="completed">Hoàn thành</SelectItem>
                                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Priority filter */}
                                    <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); applyFilter('priority', v); }}>
                                        <SelectTrigger className="h-8 w-[120px] text-xs border-border/50">
                                            <AlertTriangle className="h-3 w-3 mr-1 text-muted-foreground/60" />
                                            <SelectValue placeholder="Mức độ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả mức độ</SelectItem>
                                            <SelectItem value="low">Thấp</SelectItem>
                                            <SelectItem value="medium">Trung bình</SelectItem>
                                            <SelectItem value="high">Cao</SelectItem>
                                            <SelectItem value="urgent">Khẩn cấp</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Assignee filter */}
                                    {canAssign && (
                                        <Select value={assigneeFilter} onValueChange={(v) => { setAssigneeFilter(v); applyFilter('assigned_to', v); }}>
                                            <SelectTrigger className="h-8 w-[140px] text-xs border-border/50">
                                                <Users className="h-3 w-3 mr-1 text-muted-foreground/60" />
                                                <SelectValue placeholder="Người phụ trách" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tất cả thành viên</SelectItem>
                                                {members.map(m => (
                                                    <SelectItem key={m.user_id} value={String(m.user_id)}>
                                                        {m.user?.name || 'N/A'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {/* Spacer */}
                                    <div className="flex-1" />

                                    {/* Task count */}
                                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                                        {filteredTasks.length} nhiệm vụ
                                    </span>

                                    {/* Create button */}
                                    {canAssign && (
                                        <Link href={route('employer.tasks.create')}>
                                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                                <Button size="sm" className="h-8 gap-1.5 text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm shadow-violet-500/20 border-0">
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Tạo nhiệm vụ
                                                </Button>
                                            </motion.div>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Task List */}
                    <AnimatePresence mode="wait">
                        {filteredTasks.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="border-border/50 shadow-sm">
                                    <CardContent className="py-16">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <motion.div
                                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 mb-4"
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                            >
                                                <ListChecks className="h-7 w-7 text-violet-500/50" />
                                            </motion.div>
                                            <h3 className="text-sm font-semibold mb-1">Chưa có nhiệm vụ nào</h3>
                                            <p className="text-xs text-muted-foreground max-w-sm mb-5">
                                                Tạo nhiệm vụ để phân công và theo dõi tiến độ tuyển dụng của đội ngũ.
                                            </p>
                                            {canAssign && (
                                                <Link href={route('employer.tasks.create')}>
                                                    <Button size="sm" className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0">
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Tạo nhiệm vụ đầu tiên
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div key="list" initial="hidden" animate="visible" exit={{ opacity: 0 }}>
                                <Card className="border-border/50 shadow-sm overflow-hidden">
                                    {/* Table header */}
                                    <div className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 bg-muted/30">
                                        <div className="w-3" />
                                        <div className="flex-1">Nhiệm vụ</div>
                                        <div className="w-[100px] text-center hidden md:block">Loại</div>
                                        <div className="w-[70px] text-center hidden md:block">Số lượng</div>
                                        <div className="w-[100px] text-center hidden lg:block">Hạn</div>
                                        <div className="w-[100px] text-center">Phụ trách</div>
                                        <div className="w-[120px] text-center">Trạng thái</div>
                                        <div className="w-7" />
                                    </div>

                                    {/* Task rows */}
                                    <div className="divide-y divide-border/30">
                                        {filteredTasks.map((task, i) => {
                                            const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                                            const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                                            const StatusIcon = statusCfg.icon;
                                            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

                                            return (
                                                <motion.div
                                                    key={task.id}
                                                    custom={i}
                                                    variants={slideRow(i)}
                                                    whileHover={{
                                                        backgroundColor: 'rgba(139, 92, 246, 0.02)',
                                                        transition: { duration: 0.15 },
                                                    }}
                                                    className={`flex items-center gap-3 px-4 py-3 border-l-[3px] ${statusCfg.border} group cursor-pointer transition-colors`}
                                                    onClick={() => {
                                                        window.location.href = route('employer.tasks.show', task.id);
                                                    }}
                                                >
                                                    {/* Priority indicator */}
                                                    <motion.div
                                                        className={`w-2.5 h-2.5 rounded-full shrink-0 ring-2 ${priorityCfg.dot} ${priorityCfg.ring}`}
                                                        title={priorityCfg.label}
                                                        animate={task.priority === 'urgent' || task.priority === 'high' ? {
                                                            scale: [1, 1.3, 1],
                                                            opacity: [1, 0.7, 1],
                                                        } : {}}
                                                        transition={task.priority === 'urgent' || task.priority === 'high' ? {
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: 'easeInOut',
                                                        } : {}}
                                                    />

                                                    {/* Task title + status badge */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[13px] font-medium truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                                                {task.title}
                                                            </span>
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.7 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: 0.3 + i * 0.04 }}
                                                            >
                                                                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-[18px] gap-0.5 shrink-0 border-0 font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                                                                    <StatusIcon className="h-2.5 w-2.5" />
                                                                    {statusCfg.label}
                                                                </Badge>
                                                            </motion.div>
                                                        </div>
                                                    </div>

                                                    {/* Type */}
                                                    <div className="w-[100px] hidden md:flex justify-center">
                                                        {TYPE_CONFIG[task.type] && (
                                                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-semibold ${TYPE_CONFIG[task.type].color}`}>
                                                                <Briefcase className="h-2.5 w-2.5" />
                                                                {TYPE_CONFIG[task.type].label}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Target quantity */}
                                                    <div className="w-[70px] hidden md:flex justify-center">
                                                        <span className="flex items-center gap-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                                                            <Hash className="h-2.5 w-2.5" />
                                                            {task.target_quantity}
                                                        </span>
                                                    </div>

                                                    {/* Due date */}
                                                    <div className="w-[100px] hidden lg:flex justify-center">
                                                        {task.due_date ? (
                                                            <span className={`flex items-center gap-0.5 text-[10px] ${isOverdue ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                                                <CalendarDays className="h-2.5 w-2.5 shrink-0" />
                                                                {formatDate(task.due_date)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-muted-foreground/40">--</span>
                                                        )}
                                                    </div>

                                                    {/* Assignee */}
                                                    <div className="w-[100px] flex justify-center">
                                                        <div className="flex items-center gap-1.5">
                                                            <Avatar className="h-6 w-6 ring-2 ring-background shadow-sm">
                                                                <AvatarImage src={task.assignee?.avatar} />
                                                                <AvatarFallback className="text-[8px] bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                                                                    {task.assignee?.name?.charAt(0)?.toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-[10px] text-muted-foreground hidden xl:inline max-w-[60px] truncate">
                                                                {task.assignee?.name}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Status dropdown */}
                                                    <div className="w-[120px] flex justify-center" onClick={(e) => e.stopPropagation()}>
                                                        <Select
                                                            value={task.status}
                                                            onValueChange={(v) => handleStatusChange(task.id, v)}
                                                        >
                                                            <SelectTrigger className="h-7 w-full text-[10px] border-border/40">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">Chờ xử lý</SelectItem>
                                                                <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                                                                <SelectItem value="completed">Hoàn thành</SelectItem>
                                                                <SelectItem value="cancelled">Đã hủy</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Arrow */}
                                                    <motion.div
                                                        className="w-7 flex justify-center"
                                                        initial={{ opacity: 0 }}
                                                        whileHover={{ x: 3 }}
                                                    >
                                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-violet-500 transition-colors" />
                                                    </motion.div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pagination */}
                    {tasks.data.length > 0 && (
                        <motion.div variants={fadeSlide(0.4)}>
                            <Pagination meta={tasks.meta} />
                        </motion.div>
                    )}
                </motion.div>
            </PermissionGate>
        </AuthenticatedLayout>
    );
}
