import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';
import {
    ArrowLeft,
    CalendarCheck,
    Wallet,
    UserCircle,
    Save,
    Clock,
    CheckCircle2,
    Zap,
    XCircle,
    DollarSign,
    FileText,
    Plus,
    Trash2,
    CreditCard,
    TrendingUp,
    Users,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Filter,
    Lock,
} from 'lucide-react';
import type { RecruitmentTask, TaskCandidate, AttendanceRecord, Payroll } from '@/types';

interface AttendanceMap {
    [candidateId: string]: {
        [date: string]: AttendanceRecord;
    };
}

interface Props {
    task: RecruitmentTask;
    canAssign: boolean;
    canManagePayroll: boolean;
    attendances: AttendanceMap;
    payrolls: Payroll[];
}

const ATTENDANCE_STATUS_LABELS: Record<string, { label: string; short: string; color: string; bg: string }> = {
    present: { label: 'Co mat', short: 'Co mat', color: 'text-emerald-700', bg: 'bg-emerald-500 text-white' },
    absent: { label: 'Vang mat', short: 'Vang mat', color: 'text-red-700', bg: 'bg-red-400/20 text-red-600' },
    half_day: { label: 'Nua ca', short: 'Nua ca', color: 'text-amber-700', bg: 'bg-amber-400 text-white' },
    late: { label: 'Di tre', short: 'Di tre', color: 'text-blue-700', bg: 'bg-blue-400 text-white' },
};

const PAYROLL_STATUS: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Nhap', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800' },
    confirmed: { label: 'Xac nhan', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900' },
    paid: { label: 'Da tra', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900' },
};

function formatMoney(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'd';
}

export default function Attendance({ task, canAssign, canManagePayroll, attendances, payrolls }: Props) {
    const workDates: string[] = (task.work_dates as string[]) || [];
    const hiredCandidates = (task.candidates || []).filter((c: TaskCandidate) => c.status === 'hired' || c.status === 'trial');

    // Attendance state
    const [localAttendance, setLocalAttendance] = useState<AttendanceMap>(attendances || {});
    const [attendanceSaving, setAttendanceSaving] = useState(false);
    const [selectedAttDate, setSelectedAttDate] = useState<string>(workDates[0] || '');

    // Date pagination (7 per page)
    const DATES_PER_PAGE = 7;
    const [datePage, setDatePage] = useState(0);
    const totalDatePages = Math.ceil(workDates.length / DATES_PER_PAGE);
    const visibleDates = workDates.slice(datePage * DATES_PER_PAGE, (datePage + 1) * DATES_PER_PAGE);

    // Candidate filter
    const [selectedCandidateId, setSelectedCandidateId] = useState<number | 'all'>('all');
    const filteredCandidates = selectedCandidateId === 'all'
        ? hiredCandidates
        : hiredCandidates.filter((c: TaskCandidate) => c.id === selectedCandidateId);

    // Track which dates are locked (already saved)
    const getInitialSavedDates = (): Set<string> => {
        const saved = new Set<string>();
        if (attendances) {
            for (const candidateRecords of Object.values(attendances)) {
                for (const date of Object.keys(candidateRecords)) {
                    saved.add(date);
                }
            }
        }
        return saved;
    };
    const [savedDates, setSavedDates] = useState<Set<string>>(getInitialSavedDates);
    const isDateLocked = (date: string): boolean => savedDates.has(date);

    const cycleStatus = (candidateId: number, date: string) => {
        const statuses: Array<'present' | 'absent' | 'half_day' | 'late'> = ['present', 'absent', 'half_day', 'late'];
        const key = String(candidateId);
        const current = localAttendance[key]?.[date]?.status || 'absent';
        const idx = statuses.indexOf(current);
        const next = statuses[(idx + 1) % statuses.length];

        setLocalAttendance(prev => ({
            ...prev,
            [key]: {
                ...(prev[key] || {}),
                [date]: {
                    ...(prev[key]?.[date] || { shifts_worked: 1, overtime_hours: 0 }),
                    status: next,
                    shifts_worked: next === 'half_day' ? 0 : next === 'absent' ? 0 : 1,
                },
            },
        }));
    };

    const setOvertimeHours = (candidateId: number, date: string, hours: number) => {
        const key = String(candidateId);
        setLocalAttendance(prev => ({
            ...prev,
            [key]: {
                ...(prev[key] || {}),
                [date]: {
                    ...(prev[key]?.[date] || { status: 'present', shifts_worked: 1 }),
                    overtime_hours: hours,
                },
            },
        }));
    };

    const saveAttendanceForDate = (date: string) => {
        setAttendanceSaving(true);
        const records = hiredCandidates.map((c: TaskCandidate) => {
            const rec = localAttendance[String(c.id)]?.[date];
            return {
                task_candidate_id: c.id,
                status: rec?.status || 'absent',
                shifts_worked: rec?.shifts_worked ?? (rec?.status === 'half_day' ? 0 : rec?.status === 'absent' ? 0 : 1),
                overtime_hours: rec?.overtime_hours || 0,
            };
        });
        router.post(route('employer.attendance.bulk-store', task.id), {
            work_date: date,
            records,
        } as unknown as Record<string, unknown>, {
            preserveScroll: true,
            onFinish: () => {
                setAttendanceSaving(false);
                setSavedDates(prev => new Set(prev).add(date));
            },
        });
    };

    // Calculate salary per candidate
    const calcCandidateSalary = (candidateId: number) => {
        const key = String(candidateId);
        const records = localAttendance[key] || {};
        let totalShifts = 0;
        let totalOT = 0;
        for (const date of workDates) {
            const rec = records[date];
            if (rec && rec.status !== 'absent') {
                totalShifts += rec.shifts_worked || 0;
                totalOT += rec.overtime_hours || 0;
            }
        }
        const shiftAmount = totalShifts * (task.shift_rate || 0);
        const otAmount = totalOT * (task.overtime_rate || 0);
        return { totalShifts, totalOT, shiftAmount, otAmount, total: shiftAmount + otAmount };
    };

    // Payroll actions
    const handleGeneratePayroll = () => {
        router.post(route('employer.payroll.generate-from-attendance'), {
            recruitment_task_id: task.id,
        } as unknown as Record<string, unknown>, {
            preserveScroll: true,
        });
    };

    const handleMarkPaid = (payrollId: number) => {
        router.post(route('employer.payroll.mark-paid', payrollId), {}, {
            preserveScroll: true,
        });
    };

    const handleDeletePayroll = (payrollId: number) => {
        router.delete(route('employer.payroll.destroy', payrollId), {
            preserveScroll: true,
        });
    };

    // Stats
    const totalSalary = hiredCandidates.reduce((sum: number, c: TaskCandidate) => sum + calcCandidateSalary(c.id).total, 0);
    const totalPayrollAmount = payrolls.reduce((sum, p) => sum + p.total_amount, 0);
    const paidAmount = payrolls.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.total_amount, 0);
    const attendanceDaysLogged = new Set(
        Object.values(localAttendance).flatMap(dates =>
            Object.entries(dates).filter(([, rec]) => rec.status !== 'absent').map(([d]) => d)
        )
    ).size;

    return (
        <AuthenticatedLayout>
            <Head title={`Cham cong - ${task.title}`} />

            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('employer.tasks.show', task.id)}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold truncate">Cham cong & Luong</h1>
                        <p className="text-xs text-muted-foreground truncate">{task.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {task.shift_rate && (
                            <Badge variant="outline" className="text-xs gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatMoney(task.shift_rate)}/ca
                            </Badge>
                        )}
                        {task.overtime_rate && (
                            <Badge variant="outline" className="text-xs gap-1">
                                <Clock className="h-3 w-3" />
                                {formatMoney(task.overtime_rate)}/h OT
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="border-none shadow-sm bg-gradient-to-br from-violet-500/5 to-violet-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="h-3.5 w-3.5 text-violet-600" />
                                <span className="text-[10px] text-muted-foreground font-medium">Ung vien</span>
                            </div>
                            <p className="text-xl font-bold text-violet-600">{hiredCandidates.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-[10px] text-muted-foreground font-medium">Ngay cham cong</span>
                            </div>
                            <p className="text-xl font-bold text-emerald-600">{attendanceDaysLogged}/{workDates.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                                <span className="text-[10px] text-muted-foreground font-medium">Luong du kien</span>
                            </div>
                            <p className="text-xl font-bold text-blue-600">{formatMoney(totalSalary)}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <CreditCard className="h-3.5 w-3.5 text-orange-600" />
                                <span className="text-[10px] text-muted-foreground font-medium">Da tra</span>
                            </div>
                            <p className="text-xl font-bold text-orange-600">{formatMoney(paidAmount)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content with Tabs */}
                <Tabs defaultValue="attendance" className="space-y-4">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="attendance" className="gap-1.5 text-xs">
                            <CalendarCheck className="h-3.5 w-3.5" />
                            Cham cong
                        </TabsTrigger>
                        <TabsTrigger value="salary" className="gap-1.5 text-xs">
                            <Wallet className="h-3.5 w-3.5" />
                            Tong hop luong
                        </TabsTrigger>
                        <TabsTrigger value="payroll" className="gap-1.5 text-xs">
                            <CreditCard className="h-3.5 w-3.5" />
                            Bang luong ({payrolls.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Attendance */}
                    <TabsContent value="attendance" className="space-y-4">
                        {hiredCandidates.length === 0 ? (
                            <Card className="border-none shadow-sm">
                                <CardContent className="py-12 text-center">
                                    <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">Chua co ung vien nao duoc tuyen.</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">Them ung vien vao nhiem vu de bat dau cham cong.</p>
                                </CardContent>
                            </Card>
                        ) : workDates.length === 0 ? (
                            <Card className="border-none shadow-sm">
                                <CardContent className="py-12 text-center">
                                    <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">Chua co ngay lam viec nao duoc thiet lap.</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">Chinh sua nhiem vu de them ngay lam viec.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-5">
                                    {/* Date selector with pagination */}
                                    <div className="mb-5">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[11px] text-muted-foreground font-medium">Chon ngay cham cong</p>
                                            {totalDatePages > 1 && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-muted-foreground mr-1">
                                                        {datePage + 1}/{totalDatePages}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 rounded"
                                                        disabled={datePage === 0}
                                                        onClick={() => setDatePage(p => p - 1)}
                                                    >
                                                        <ChevronLeft className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 rounded"
                                                        disabled={datePage >= totalDatePages - 1}
                                                        onClick={() => setDatePage(p => p + 1)}
                                                    >
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {visibleDates.map((d: string) => {
                                                const dateObj = new Date(d);
                                                const dayStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                                                const weekDay = dateObj.toLocaleDateString('vi-VN', { weekday: 'short' });
                                                const isActive = selectedAttDate === d;
                                                const locked = isDateLocked(d);
                                                const hasData = hiredCandidates.some((c: TaskCandidate) => localAttendance[String(c.id)]?.[d]?.status && localAttendance[String(c.id)]?.[d]?.status !== 'absent');
                                                return (
                                                    <button
                                                        key={d}
                                                        type="button"
                                                        onClick={() => setSelectedAttDate(d)}
                                                        className={`relative px-3 py-2 rounded-lg text-xs font-medium transition-all border flex flex-col items-center min-w-[52px] ${isActive
                                                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                                                            : locked
                                                                ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                                : hasData
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                                                                    : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50'
                                                            }`}
                                                    >
                                                        <span className="text-[9px] opacity-70">{weekDay}</span>
                                                        <span>{dayStr}</span>
                                                        {locked && (
                                                            <Lock className={`h-2.5 w-2.5 absolute -top-1 -right-1 ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Candidate filter */}
                                    {hiredCandidates.length > 1 && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2">
                                                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-[11px] text-muted-foreground font-medium">Ung vien:</span>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedCandidateId('all')}
                                                        className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all border ${selectedCandidateId === 'all'
                                                            ? 'bg-violet-600 text-white border-violet-600'
                                                            : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50'
                                                            }`}
                                                    >
                                                        Tat ca ({hiredCandidates.length})
                                                    </button>
                                                    {hiredCandidates.map((c: TaskCandidate) => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => setSelectedCandidateId(c.id)}
                                                            className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all border ${selectedCandidateId === c.id
                                                                ? 'bg-teal-600 text-white border-teal-600'
                                                                : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50'
                                                                }`}
                                                        >
                                                            {c.candidate_name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Attendance grid */}
                                    {selectedAttDate && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <p className="text-xs font-semibold text-muted-foreground">
                                                    {new Date(selectedAttDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </p>
                                                {isDateLocked(selectedAttDate) && (
                                                    <Badge variant="outline" className="text-[10px] gap-1 bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400">
                                                        <Lock className="h-2.5 w-2.5" />
                                                        Da luu
                                                    </Badge>
                                                )}
                                            </div>
                                            {filteredCandidates.map((c: TaskCandidate) => {
                                                const rec = localAttendance[String(c.id)]?.[selectedAttDate];
                                                const status = rec?.status || 'absent';
                                                const statusCfg = ATTENDANCE_STATUS_LABELS[status] || ATTENDANCE_STATUS_LABELS.absent;
                                                return (
                                                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 shrink-0">
                                                            <UserCircle className="h-4.5 w-4.5 text-teal-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold truncate">{c.candidate_name}</p>
                                                            {c.candidate_phone && (
                                                                <p className="text-[10px] text-muted-foreground">{c.candidate_phone}</p>
                                                            )}
                                                        </div>
                                                        {canAssign && !isDateLocked(selectedAttDate) ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => cycleStatus(c.id, selectedAttDate)}
                                                                className={`px-4 py-2 rounded-md text-xs font-bold transition-all min-w-[70px] text-center ${statusCfg.bg}`}
                                                                title="Nhan de doi trang thai"
                                                            >
                                                                {statusCfg.short}
                                                            </button>
                                                        ) : (
                                                            <span className={`px-4 py-2 rounded-md text-xs font-bold min-w-[70px] text-center ${statusCfg.bg}`}>
                                                                {statusCfg.short}
                                                            </span>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[10px] text-muted-foreground">OT:</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.5"
                                                                value={rec?.overtime_hours || 0}
                                                                onChange={(e) => setOvertimeHours(c.id, selectedAttDate, parseFloat(e.target.value) || 0)}
                                                                className={`w-16 h-8 text-xs text-center rounded border border-border/50 bg-background ${isDateLocked(selectedAttDate) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                                readOnly={!canAssign || isDateLocked(selectedAttDate)}
                                                            />
                                                            <span className="text-[10px] text-muted-foreground">h</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {canAssign && !isDateLocked(selectedAttDate) && (
                                                <div className="flex justify-end mt-4">
                                                    <Button
                                                        size="sm"
                                                        className="gap-1.5 text-xs h-9"
                                                        onClick={() => saveAttendanceForDate(selectedAttDate)}
                                                        disabled={attendanceSaving}
                                                    >
                                                        <Save className="h-3.5 w-3.5" />
                                                        {attendanceSaving ? 'Dang luu...' : 'Luu cham cong'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Tab 2: Salary Summary */}
                    <TabsContent value="salary" className="space-y-4">
                        <Card className="border-none shadow-sm">
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Wallet className="h-4 w-4 text-violet-600" />
                                    <h3 className="text-sm font-semibold">Tong hop luong tu cham cong</h3>
                                    {task.shift_rate && (
                                        <span className="text-[10px] text-muted-foreground ml-auto">
                                            {formatMoney(task.shift_rate)}/ca
                                            {task.overtime_rate ? ` | ${formatMoney(task.overtime_rate)}/h OT` : ''}
                                        </span>
                                    )}
                                </div>

                                {hiredCandidates.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">Chua co ung vien.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {/* Header */}
                                        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            <div className="col-span-5">Ung vien</div>
                                            <div className="col-span-2 text-center">So ca</div>
                                            <div className="col-span-2 text-center">OT (h)</div>
                                            <div className="col-span-3 text-right">Thanh tien</div>
                                        </div>

                                        {hiredCandidates.map((c: TaskCandidate) => {
                                            const salary = calcCandidateSalary(c.id);
                                            return (
                                                <div key={c.id} className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg bg-gradient-to-r from-violet-500/5 to-blue-500/5 border border-violet-500/10">
                                                    <div className="col-span-5 flex items-center gap-2 min-w-0">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 shrink-0">
                                                            <UserCircle className="h-4 w-4 text-teal-600" />
                                                        </div>
                                                        <p className="text-xs font-medium truncate">{c.candidate_name}</p>
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        <span className="text-sm font-semibold">{salary.totalShifts}</span>
                                                        <span className="text-[10px] text-muted-foreground ml-0.5">ca</span>
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        {salary.totalOT > 0 ? (
                                                            <>
                                                                <span className="text-sm font-semibold">{salary.totalOT}</span>
                                                                <span className="text-[10px] text-muted-foreground ml-0.5">h</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] text-muted-foreground">--</span>
                                                        )}
                                                    </div>
                                                    <div className="col-span-3 text-right">
                                                        <span className="text-sm font-bold text-violet-600">{formatMoney(salary.total)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Grand total */}
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-violet-600/10 border border-violet-500/20 mt-3">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-violet-600" />
                                                <span className="text-sm font-semibold">Tong cong</span>
                                            </div>
                                            <span className="text-lg font-bold text-violet-600">
                                                {formatMoney(totalSalary)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Payroll */}
                    <TabsContent value="payroll" className="space-y-4">
                        {canManagePayroll && (
                            <div className="flex justify-end">
                                <Button size="sm" className="gap-1.5 text-xs h-9" onClick={handleGeneratePayroll}>
                                    <Plus className="h-3.5 w-3.5" />
                                    Tao bang luong tu cham cong
                                </Button>
                            </div>
                        )}

                        {payrolls.length === 0 ? (
                            <Card className="border-none shadow-sm">
                                <CardContent className="py-12 text-center">
                                    <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">Chua co bang luong nao.</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">Tao bang luong tu du lieu cham cong.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-2">
                                {/* Header */}
                                <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    <div className="col-span-3">Ung vien</div>
                                    <div className="col-span-2 text-center">Ky luong</div>
                                    <div className="col-span-2 text-center">Tong tien</div>
                                    <div className="col-span-2 text-center">Trang thai</div>
                                    <div className="col-span-3 text-right">Thao tac</div>
                                </div>

                                {payrolls.map((payroll) => {
                                    const pStatus = PAYROLL_STATUS[payroll.status] || PAYROLL_STATUS.draft;
                                    return (
                                        <Card key={payroll.id} className="border-none shadow-sm">
                                            <CardContent className="p-3">
                                                <div className="grid grid-cols-12 gap-2 items-center">
                                                    <div className="col-span-3 min-w-0">
                                                        <p className="text-xs font-semibold truncate">{payroll.task_candidate?.candidate_name || 'N/A'}</p>
                                                        <p className="text-[10px] text-muted-foreground">{payroll.total_shifts} ca{payroll.overtime_hours > 0 ? ` + ${payroll.overtime_hours}h OT` : ''}</p>
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {formatDate(payroll.period_start)} - {formatDate(payroll.period_end)}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        <span className="text-sm font-bold text-violet-600">{formatMoney(payroll.total_amount)}</span>
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        <Badge variant="outline" className={`text-[10px] ${pStatus.bg} ${pStatus.color}`}>
                                                            {pStatus.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="col-span-3 flex justify-end gap-1">
                                                        {canManagePayroll && payroll.status === 'confirmed' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-[10px] gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                onClick={() => handleMarkPaid(payroll.id)}
                                                            >
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Thanh toan
                                                            </Button>
                                                        )}
                                                        {canManagePayroll && payroll.status !== 'paid' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-destructive/60 hover:text-destructive"
                                                                onClick={() => handleDeletePayroll(payroll.id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                        {payroll.status === 'paid' && payroll.paid_at && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {formatDate(payroll.paid_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}

                                {/* Payroll Total */}
                                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-600/10 border border-blue-500/20 mt-3">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-semibold">Tong bang luong</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-blue-600">{formatMoney(totalPayrollAmount)}</span>
                                        <span className="text-[10px] text-muted-foreground ml-2">(Da tra: {formatMoney(paidAmount)})</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
