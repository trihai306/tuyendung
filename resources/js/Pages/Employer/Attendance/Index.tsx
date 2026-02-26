import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    CalendarCheck,
    Users,
    DollarSign,
    TrendingUp,
    Clock,
    ArrowRight,
    Briefcase,
    CreditCard,
} from 'lucide-react';

interface TaskAttendanceData {
    id: number;
    title: string;
    status: string;
    shift_rate: number | null;
    overtime_rate: number | null;
    work_dates: string[] | null;
    hired_count: number;
    attendance_count: number;
    total_payroll: number;
    paid_payroll: number;
    assigner: { name: string } | null;
    created_at: string;
}

interface Props {
    tasks: TaskAttendanceData[];
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Cho xu ly', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    in_progress: { label: 'Dang thuc hien', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    completed: { label: 'Hoan thanh', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    cancelled: { label: 'Da huy', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
};

function formatMoney(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'd';
}

export default function AttendanceIndex({ tasks }: Props) {
    // Overall stats
    const totalTasks = tasks.length;
    const totalHired = tasks.reduce((sum, t) => sum + t.hired_count, 0);
    const totalAttendance = tasks.reduce((sum, t) => sum + t.attendance_count, 0);
    const totalPayroll = tasks.reduce((sum, t) => sum + t.total_payroll, 0);
    const totalPaid = tasks.reduce((sum, t) => sum + t.paid_payroll, 0);

    return (
        <AuthenticatedLayout>
            <Head title="Quan ly cham cong" />

            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Quan ly cham cong</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Theo doi cham cong va luong cho cac nhiem vu thoi vu
                        </p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Card className="border-none shadow-sm bg-gradient-to-br from-violet-500/5 to-violet-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="h-3.5 w-3.5 text-violet-600" />
                                <span className="text-[10px] text-muted-foreground font-medium">Nhiem vu</span>
                            </div>
                            <p className="text-xl font-bold text-violet-600">{totalTasks}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-teal-500/5 to-teal-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="h-3.5 w-3.5 text-teal-600" />
                                <span className="text-[10px] text-muted-foreground font-medium">Ung vien</span>
                            </div>
                            <p className="text-xl font-bold text-teal-600">{totalHired}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-[10px] text-muted-foreground font-medium">Luot cham cong</span>
                            </div>
                            <p className="text-xl font-bold text-emerald-600">{totalAttendance}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                                <span className="text-[10px] text-muted-foreground font-medium">Tong luong</span>
                            </div>
                            <p className="text-xl font-bold text-blue-600">{formatMoney(totalPayroll)}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <CreditCard className="h-3.5 w-3.5 text-orange-600" />
                                <span className="text-[10px] text-muted-foreground font-medium">Da tra</span>
                            </div>
                            <p className="text-xl font-bold text-orange-600">{formatMoney(totalPaid)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tasks List */}
                {tasks.length === 0 ? (
                    <Card className="border-none shadow-sm">
                        <CardContent className="py-16 text-center">
                            <CalendarCheck className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                            <p className="text-sm font-medium text-muted-foreground">Chua co nhiem vu thoi vu nao</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                Tao nhiem vu thoi vu de bat dau quan ly cham cong
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => {
                            const statusCfg = STATUS_MAP[task.status] || STATUS_MAP.pending;
                            const workDatesCount = task.work_dates?.length || 0;
                            const unpaid = task.total_payroll - task.paid_payroll;

                            return (
                                <Card key={task.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
                                    <CardContent className="p-0">
                                        <div className="flex items-center gap-4 p-4">
                                            {/* Icon */}
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 shrink-0">
                                                <CalendarCheck className="h-5 w-5 text-violet-600" />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-semibold truncate">{task.title}</h3>
                                                    <Badge variant="outline" className={`text-[10px] shrink-0 ${statusCfg.bg} ${statusCfg.color}`}>
                                                        {statusCfg.label}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {task.hired_count} ung vien
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <CalendarCheck className="h-3 w-3" />
                                                        {workDatesCount} ngay lam viec
                                                    </span>
                                                    {task.shift_rate && (
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="h-3 w-3" />
                                                            {formatMoney(task.shift_rate)}/ca
                                                        </span>
                                                    )}
                                                    {task.overtime_rate && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatMoney(task.overtime_rate)}/h OT
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Stats & Action */}
                                            <div className="flex items-center gap-4 shrink-0">
                                                <div className="hidden md:flex items-center gap-3">
                                                    {task.total_payroll > 0 && (
                                                        <div className="text-right">
                                                            <p className="text-xs font-bold text-violet-600">{formatMoney(task.total_payroll)}</p>
                                                            {unpaid > 0 && (
                                                                <p className="text-[10px] text-amber-600">Con no: {formatMoney(unpaid)}</p>
                                                            )}
                                                            {unpaid === 0 && task.total_payroll > 0 && (
                                                                <p className="text-[10px] text-emerald-600">Da tra du</p>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="text-right min-w-[60px]">
                                                        <p className="text-lg font-bold text-emerald-600">{task.attendance_count}</p>
                                                        <p className="text-[10px] text-muted-foreground">luot cham</p>
                                                    </div>
                                                </div>
                                                <Link href={route('employer.tasks.attendance', task.id)}>
                                                    <Button size="sm" className="gap-1.5 text-xs h-9 bg-violet-600 text-white hover:bg-violet-700">
                                                        Cham cong
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
