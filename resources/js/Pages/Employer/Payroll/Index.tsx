import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PermissionGate from '@/Components/PermissionGate';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { useConfirm } from '@/hooks/use-confirm';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/Components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';
import { useState, FormEventHandler } from 'react';
import {
    Wallet,
    Plus,
    Trash2,
    CheckCircle2,
    Clock,
    FileCheck,
    DollarSign,
    Users,
    CalendarDays,
    Hash,
    Pencil,
    Ban,
} from 'lucide-react';
import type { RecruitmentTask, TaskCandidate, Payroll } from '@/types';

interface Props {
    tasks: (RecruitmentTask & { candidates: (TaskCandidate & { payrolls: Payroll[] })[] })[];
    payrolls: Payroll[];
    stats: {
        totalAmount: number;
        paidAmount: number;
        pendingAmount: number;
        payrollCount: number;
    };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Nhap', color: 'text-yellow-600', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    confirmed: { label: 'Da xac nhan', color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/20' },
    paid: { label: 'Da thanh toan', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

function formatMoney(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'd';
}

interface PayrollFormData {
    task_candidate_id: number;
    recruitment_task_id: number;
    period_start: string;
    period_end: string;
    total_shifts: number;
    overtime_hours: number;
    shift_amount: number;
    overtime_amount: number;
    bonus: number;
    deduction: number;
    notes: string;
    status: string;
}

const INITIAL_FORM: PayrollFormData = {
    task_candidate_id: 0,
    recruitment_task_id: 0,
    period_start: '',
    period_end: '',
    total_shifts: 0,
    overtime_hours: 0,
    shift_amount: 0,
    overtime_amount: 0,
    bonus: 0,
    deduction: 0,
    notes: '',
    status: 'draft',
};

export default function Index({ tasks, payrolls, stats }: Props) {
    const { can } = usePermission();
    const { confirmOpen, confirmTitle, confirmDesc, confirm, handleConfirm, handleCancel } = useConfirm();

    const [showDialog, setShowDialog] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<PayrollFormData>({ ...INITIAL_FORM });
    const [filterTask, setFilterTask] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedTask, setSelectedTask] = useState<RecruitmentTask | null>(null);

    // Get candidates for selected task
    const taskWithCandidates = tasks.find(t => t.id === form.recruitment_task_id);
    const candidates = taskWithCandidates?.candidates?.filter(c => c.status === 'hired') ?? [];

    // Filter payrolls
    const filtered = payrolls.filter(p => {
        if (filterTask !== 'all' && p.recruitment_task_id !== parseInt(filterTask)) return false;
        if (filterStatus !== 'all' && p.status !== filterStatus) return false;
        return true;
    });

    const setField = <K extends keyof PayrollFormData>(key: K, value: PayrollFormData[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSelectTask = (taskId: string) => {
        const id = parseInt(taskId);
        const task = tasks.find(t => t.id === id);
        setField('recruitment_task_id', id);
        setField('task_candidate_id', 0);
        setSelectedTask(task || null);

        // Auto-fill shift/overtime rates
        if (task) {
            setField('shift_amount', (form.total_shifts || 0) * (task.shift_rate || 0));
            setField('overtime_amount', (form.overtime_hours || 0) * (task.overtime_rate || 0));
        }
    };

    const recalcAmounts = (shifts: number, otHours: number) => {
        const task = tasks.find(t => t.id === form.recruitment_task_id);
        if (task) {
            setForm(prev => ({
                ...prev,
                total_shifts: shifts,
                overtime_hours: otHours,
                shift_amount: shifts * (task.shift_rate || 0),
                overtime_amount: otHours * (task.overtime_rate || 0),
            }));
        }
    };

    const totalCalc = form.shift_amount + form.overtime_amount + form.bonus - form.deduction;

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...INITIAL_FORM });
        setSelectedTask(null);
        setShowDialog(true);
    };

    const openEdit = (p: Payroll) => {
        setEditingId(p.id);
        const task = tasks.find(t => t.id === p.recruitment_task_id);
        setSelectedTask(task || null);
        setForm({
            task_candidate_id: p.task_candidate_id,
            recruitment_task_id: p.recruitment_task_id,
            period_start: p.period_start?.split('T')[0] || '',
            period_end: p.period_end?.split('T')[0] || '',
            total_shifts: p.total_shifts,
            overtime_hours: p.overtime_hours,
            shift_amount: p.shift_amount,
            overtime_amount: p.overtime_amount,
            bonus: p.bonus,
            deduction: p.deduction,
            notes: p.notes || '',
            status: p.status,
        });
        setShowDialog(true);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const data = { ...form };
        if (editingId) {
            router.put(route('employer.payroll.update', editingId), data as Record<string, unknown>, {
                preserveScroll: true,
                onSuccess: () => setShowDialog(false),
            });
        } else {
            router.post(route('employer.payroll.store'), data as Record<string, unknown>, {
                preserveScroll: true,
                onSuccess: () => setShowDialog(false),
            });
        }
    };

    const handleDelete = (id: number) => {
        confirm(
            'Xoa bang luong',
            'Ban co chac chan muon xoa bang luong nay? Hanh dong nay khong the hoan tac.',
            () => {
                router.delete(route('employer.payroll.destroy', id), {
                    preserveScroll: true,
                });
            }
        );
    };

    const handleMarkPaid = (id: number) => {
        confirm(
            'Xac nhan thanh toan',
            'Ban co chac chan muon danh dau bang luong nay la da thanh toan?',
            () => {
                router.post(route('employer.payroll.mark-paid', id), {}, {
                    preserveScroll: true,
                });
            }
        );
    };

    const handleConfirmStatus = (id: number) => {
        router.put(route('employer.payroll.update', id), { status: 'confirmed' } as Record<string, unknown>, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout title="Quan ly luong" header="Quan ly luong">
            <Head title="Quan ly luong" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40">
                        <CardContent className="pt-5 pb-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Tong luong</p>
                                    <p className="text-2xl font-bold mt-1">{formatMoney(stats.totalAmount)}</p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                                    <Wallet className="h-5 w-5 text-violet-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40">
                        <CardContent className="pt-5 pb-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Da thanh toan</p>
                                    <p className="text-2xl font-bold mt-1 text-emerald-600">{formatMoney(stats.paidAmount)}</p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40">
                        <CardContent className="pt-5 pb-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Can thanh toan</p>
                                    <p className="text-2xl font-bold mt-1 text-amber-600">{formatMoney(stats.pendingAmount)}</p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
                        <CardContent className="pt-5 pb-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">So bang luong</p>
                                    <p className="text-2xl font-bold mt-1">{stats.payrollCount}</p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                                    <Hash className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Toolbar */}
                <Card className="border-none shadow-sm">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <Select value={filterTask} onValueChange={setFilterTask}>
                                <SelectTrigger className="w-[200px] h-9 text-xs">
                                    <SelectValue placeholder="Tat ca nhiem vu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tat ca nhiem vu</SelectItem>
                                    {tasks.map(t => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[160px] h-9 text-xs">
                                    <SelectValue placeholder="Tat ca trang thai" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tat ca trang thai</SelectItem>
                                    <SelectItem value="draft">Nhap</SelectItem>
                                    <SelectItem value="confirmed">Da xac nhan</SelectItem>
                                    <SelectItem value="paid">Da thanh toan</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="ml-auto">
                                <PermissionGate permission="payroll.manage">
                                    <Button size="sm" className="gap-1.5 h-9 text-xs" onClick={openCreate}>
                                        <Plus className="h-3.5 w-3.5" />
                                        Tao bang luong
                                    </Button>
                                </PermissionGate>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payroll Table */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/50 bg-muted/30">
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nhan vien</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nhiem vu</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ky luong</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Ca</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">OT (h)</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Tong luong</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Trang thai</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Thao tac</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center">
                                            <Wallet className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                                            <p className="text-sm text-muted-foreground/50">Chua co bang luong nao</p>
                                            <p className="text-xs text-muted-foreground/30 mt-1">Tao bang luong moi cho nhan vien thoi vu</p>
                                        </td>
                                    </tr>
                                ) : filtered.map(p => {
                                    const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.draft;
                                    return (
                                        <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="text-xs font-semibold">{p.task_candidate?.candidate_name || '---'}</p>
                                                {p.task_candidate?.candidate_phone && (
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">{p.task_candidate.candidate_phone}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{p.recruitment_task?.title || '---'}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs">{formatDate(p.period_start)} - {formatDate(p.period_end)}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-xs font-semibold">{p.total_shifts}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-xs font-semibold">{p.overtime_hours}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-xs font-bold">{formatMoney(p.total_amount)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant="outline" className={`text-[9px] px-2 py-0.5 ${cfg.bg} ${cfg.color}`}>
                                                    {cfg.label}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {can('payroll.manage') && p.status === 'draft' && (
                                                        <>
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleConfirmStatus(p.id)} title="Xac nhan">
                                                                <FileCheck className="h-3.5 w-3.5 text-blue-600" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(p)} title="Sua">
                                                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDelete(p.id)} title="Xoa">
                                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {can('payroll.manage') && p.status === 'confirmed' && (
                                                        <>
                                                            <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px] text-emerald-600" onClick={() => handleMarkPaid(p.id)}>
                                                                <DollarSign className="h-3.5 w-3.5" />
                                                                Thanh toan
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(p)} title="Sua">
                                                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {p.status === 'paid' && p.paid_at && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {formatDate(p.paid_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">
                            {editingId ? 'Cap nhat bang luong' : 'Tao bang luong moi'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        {/* Task Selection */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Nhiem vu thoi vu *</Label>
                            <Select
                                value={form.recruitment_task_id ? String(form.recruitment_task_id) : ''}
                                onValueChange={handleSelectTask}
                                disabled={!!editingId}
                            >
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Chon nhiem vu..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {tasks.map(t => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.title}
                                            {t.shift_rate ? ` (${formatMoney(t.shift_rate)}/ca)` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Candidate Selection */}
                        {form.recruitment_task_id > 0 && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Nhan vien *</Label>
                                <Select
                                    value={form.task_candidate_id ? String(form.task_candidate_id) : ''}
                                    onValueChange={(v) => setField('task_candidate_id', parseInt(v))}
                                    disabled={!!editingId}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Chon nhan vien..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {candidates.map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.candidate_name}
                                                {c.candidate_phone ? ` - ${c.candidate_phone}` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Period */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Tu ngay *</Label>
                                <Input
                                    type="date"
                                    value={form.period_start}
                                    onChange={(e) => setField('period_start', e.target.value)}
                                    className="h-9 text-xs"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Den ngay *</Label>
                                <Input
                                    type="date"
                                    value={form.period_end}
                                    onChange={(e) => setField('period_end', e.target.value)}
                                    className="h-9 text-xs"
                                    required
                                />
                            </div>
                        </div>

                        {/* Shifts & OT */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">So ca lam *</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.total_shifts}
                                    onChange={(e) => recalcAmounts(parseInt(e.target.value) || 0, form.overtime_hours)}
                                    className="h-9 text-xs"
                                    required
                                />
                                {selectedTask?.shift_rate && (
                                    <p className="text-[10px] text-muted-foreground">Don gia: {formatMoney(selectedTask.shift_rate)}/ca</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Gio lam them (OT)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.overtime_hours}
                                    onChange={(e) => recalcAmounts(form.total_shifts, parseInt(e.target.value) || 0)}
                                    className="h-9 text-xs"
                                />
                                {selectedTask?.overtime_rate && (
                                    <p className="text-[10px] text-muted-foreground">Don gia: {formatMoney(selectedTask.overtime_rate)}/h</p>
                                )}
                            </div>
                        </div>

                        {/* Amounts */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Luong ca</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.shift_amount}
                                    onChange={(e) => setField('shift_amount', parseInt(e.target.value) || 0)}
                                    className="h-9 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Luong OT</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.overtime_amount}
                                    onChange={(e) => setField('overtime_amount', parseInt(e.target.value) || 0)}
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Thuong</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.bonus}
                                    onChange={(e) => setField('bonus', parseInt(e.target.value) || 0)}
                                    className="h-9 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Khau tru</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.deduction}
                                    onChange={(e) => setField('deduction', parseInt(e.target.value) || 0)}
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>

                        {/* Total Preview */}
                        <div className="p-3 rounded-lg bg-gradient-to-r from-violet-500/5 to-blue-500/5 border border-violet-500/10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Tong luong:</span>
                                <span className="text-lg font-bold text-violet-600">{formatMoney(totalCalc)}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                = {formatMoney(form.shift_amount)} (ca) + {formatMoney(form.overtime_amount)} (OT) + {formatMoney(form.bonus)} (thuong) - {formatMoney(form.deduction)} (khau tru)
                            </p>
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Ghi chu</Label>
                            <Textarea
                                value={form.notes}
                                onChange={(e) => setField('notes', e.target.value)}
                                placeholder="Ghi chu them..."
                                rows={2}
                                className="text-xs resize-none"
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" size="sm" className="text-xs">Huy</Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                size="sm"
                                className="text-xs gap-1.5"
                                disabled={!form.recruitment_task_id || !form.task_candidate_id || !form.period_start || !form.period_end}
                            >
                                <Wallet className="h-3.5 w-3.5" />
                                {editingId ? 'Cap nhat' : 'Tao bang luong'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={confirmOpen}
                title={confirmTitle}
                description={confirmDesc}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </AuthenticatedLayout>
    );
}
