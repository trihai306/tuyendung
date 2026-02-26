import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PermissionGate from '@/Components/PermissionGate';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import MultiDatePicker from '@/Components/MultiDatePicker';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    ArrowLeft,
    Loader2,
    ListChecks,
    User,
    AlertTriangle,
    CalendarDays,
    FileText,
    Zap,
    Hash,
    Briefcase,
    CalendarClock,
    Clock,
    X,
    Plus,
    Banknote,
} from 'lucide-react';
import type { CompanyMember } from '@/types';

interface Props {
    members: CompanyMember[];
}


const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Thap', description: 'Khong can gap', color: 'bg-slate-100 text-slate-700' },
    { value: 'medium', label: 'Trung binh', description: 'Can xu ly binh thuong', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: 'Cao', description: 'Can uu tien xu ly', color: 'bg-orange-100 text-orange-700' },
    { value: 'urgent', label: 'Khan cap', description: 'Can xu ly ngay lap tuc', color: 'bg-red-100 text-red-700' },
];

const TYPE_OPTIONS = [
    {
        value: 'chinh_thuc',
        label: 'Tuyen dung chinh thuc',
        description: 'Nhan vien co dinh, hop dong lao dong dai han',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
    },
    {
        value: 'thoi_vu',
        label: 'Tuyen dung thoi vu',
        description: 'Nhan vien tam thoi, hop dong ngan han theo mua vu',
        color: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
        border: 'border-violet-200 dark:border-violet-800',
    },
];

const ROLE_LABELS: Record<string, string> = {
    owner: 'Chu cong ty',
    manager: 'Quan ly',
    member: 'Nhan vien',
};

const SHIFT_LABELS: Record<string, string> = {
    sang: 'Ca sang',
    chieu: 'Ca chieu',
    toi: 'Ca toi',
    ca_ngay: 'Ca ngay',
};

export default function Create({ members }: Props) {
    const form = useForm<{
        assigned_to: number[];
        title: string;
        type: string;
        description: string;
        priority: string;
        target_quantity: string;
        due_date: string;
        work_dates: string[];
        work_shifts: string[];
        overtime_hours: string;
        shift_rate: string;
        overtime_rate: string;
    }>({
        assigned_to: [],
        title: '',
        type: 'chinh_thuc',
        description: '',
        priority: 'medium',
        target_quantity: '1',
        due_date: '',
        work_dates: [],
        work_shifts: [],
        overtime_hours: '0',
        shift_rate: '',
        overtime_rate: '',
    });

    const isSeasonalType = form.data.type === 'thoi_vu';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('employer.tasks.store'));
    };

    const selectedMembers = members.filter(m => form.data.assigned_to.includes(m.user_id));

    const toggleAssignee = (userId: number) => {
        const current = form.data.assigned_to;
        const updated = current.includes(userId)
            ? current.filter(id => id !== userId)
            : [...current, userId];
        form.setData('assigned_to', updated);
    };
    const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === form.data.priority);
    const selectedType = TYPE_OPTIONS.find(t => t.value === form.data.type);

    return (
        <AuthenticatedLayout title="Tao nhiem vu" header="Tao nhiem vu moi">
            <Head title="Tao nhiem vu moi" />

            <PermissionGate permission="tasks.create">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Back */}
                    <Link href={route('employer.tasks.index')}>
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                            Quay lai danh sach
                        </Button>
                    </Link>


                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main form - 2 columns */}
                            <div className="lg:col-span-2 space-y-5">
                                {/* Title & Type & Quantity */}
                                <Card className="border-none shadow-sm">
                                    <CardContent className="pt-5 pb-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                                <ListChecks className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold">Thong tin nhiem vu</h3>
                                                <p className="text-[11px] text-muted-foreground">Mo ta nhiem vu can giao cho thanh vien</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Title */}
                                            <div className="space-y-2">
                                                <Label htmlFor="title" className="text-xs font-medium">Tieu de nhiem vu *</Label>
                                                <Input
                                                    id="title"
                                                    placeholder="VD: Tuyen 5 nhan vien ban hang, Loc ho so ung vien..."
                                                    value={form.data.title}
                                                    onChange={e => form.setData('title', e.target.value)}
                                                    className="h-10"
                                                />
                                                {form.errors.title && (
                                                    <p className="text-[11px] text-destructive">{form.errors.title}</p>
                                                )}
                                            </div>

                                            {/* Type selector */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-medium flex items-center gap-1.5">
                                                    <Briefcase className="h-3 w-3 text-muted-foreground" />
                                                    Loai tuyen dung *
                                                </Label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {TYPE_OPTIONS.map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => form.setData('type', opt.value)}
                                                            className={`
                                                            relative rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer
                                                            ${form.data.type === opt.value
                                                                    ? `${opt.border} ${opt.color} ring-2 ring-offset-1 ring-current/20 shadow-sm`
                                                                    : 'border-border/50 hover:border-border bg-muted/20 hover:bg-muted/40'
                                                                }
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center shrink-0 ${form.data.type === opt.value
                                                                    ? 'border-current'
                                                                    : 'border-muted-foreground/30'
                                                                    } `}>
                                                                    {form.data.type === opt.value && (
                                                                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                                                    )}
                                                                </div>
                                                                <span className="text-xs font-bold">{opt.label}</span>
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground ml-5 leading-relaxed">{opt.description}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                                {form.errors.type && (
                                                    <p className="text-[11px] text-destructive">{form.errors.type}</p>
                                                )}
                                            </div>

                                            {/* Seasonal Work Fields */}
                                            {isSeasonalType && (
                                                <div className="space-y-4 p-4 rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/30">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 dark:text-violet-300">
                                                        <CalendarClock className="h-3.5 w-3.5" />
                                                        Lich lam viec thoi vu
                                                    </div>

                                                    {/* Work Dates */}
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-medium flex items-center gap-1.5">
                                                            <CalendarDays className="h-3 w-3 text-muted-foreground" />
                                                            Ngay lam viec *
                                                        </Label>
                                                        <MultiDatePicker
                                                            selectedDates={form.data.work_dates}
                                                            onChange={dates => form.setData('work_dates', dates)}
                                                        />
                                                        {form.errors.work_dates && (
                                                            <p className="text-[11px] text-destructive">{form.errors.work_dates}</p>
                                                        )}
                                                    </div>

                                                    {/* Work Shifts */}
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-medium flex items-center gap-1.5">
                                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                                            Ca lam viec *
                                                        </Label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {[
                                                                { value: 'sang', label: 'Ca sang', time: '06:00 - 12:00' },
                                                                { value: 'chieu', label: 'Ca chieu', time: '12:00 - 18:00' },
                                                                { value: 'toi', label: 'Ca toi', time: '18:00 - 22:00' },
                                                                { value: 'ca_ngay', label: 'Ca ngay', time: '08:00 - 17:00' },
                                                            ].map(shift => {
                                                                const isChecked = form.data.work_shifts.includes(shift.value);
                                                                return (
                                                                    <button
                                                                        key={shift.value}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const updated = isChecked
                                                                                ? form.data.work_shifts.filter(s => s !== shift.value)
                                                                                : [...form.data.work_shifts, shift.value];
                                                                            form.setData('work_shifts', updated);
                                                                        }}
                                                                        className={`flex items-center gap-2 p-2.5 rounded-lg border-2 text-left transition-all cursor-pointer ${isChecked
                                                                            ? 'border-violet-400 bg-violet-100 dark:bg-violet-900/50 dark:border-violet-600'
                                                                            : 'border-border/50 hover:border-border bg-background'
                                                                            }`}
                                                                    >
                                                                        <div className={`h-3.5 w-3.5 rounded border-2 flex items-center justify-center shrink-0 ${isChecked ? 'border-violet-500 bg-violet-500' : 'border-muted-foreground/30'
                                                                            }`}>
                                                                            {isChecked && <div className="h-1.5 w-1.5 rounded-sm bg-white" />}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-semibold">{shift.label}</p>
                                                                            <p className="text-[10px] text-muted-foreground">{shift.time}</p>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {form.errors.work_shifts && (
                                                            <p className="text-[11px] text-destructive">{form.errors.work_shifts}</p>
                                                        )}
                                                    </div>

                                                    {/* Overtime Hours */}
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-medium flex items-center gap-1.5">
                                                            <Zap className="h-3 w-3 text-muted-foreground" />
                                                            Tang ca (tuy chon)
                                                        </Label>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {[
                                                                { value: '0', label: 'Khong tang ca' },
                                                                { value: '1', label: '+1 gio' },
                                                                { value: '2', label: '+2 gio' },
                                                                { value: '3', label: '+3 gio' },
                                                                { value: '4', label: '+4 gio' },
                                                            ].map(opt => {
                                                                const isSelected = form.data.overtime_hours === opt.value;
                                                                return (
                                                                    <button
                                                                        key={opt.value}
                                                                        type="button"
                                                                        onClick={() => form.setData('overtime_hours', opt.value)}
                                                                        className={`px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all cursor-pointer ${isSelected
                                                                            ? 'border-amber-400 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:border-amber-600 dark:text-amber-300'
                                                                            : 'border-border/50 hover:border-border bg-background text-muted-foreground'
                                                                            }`}
                                                                    >
                                                                        {opt.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground">So gio lam them sau ca chinh</p>
                                                    </div>

                                                    {/* Salary Fields */}
                                                    <div className="space-y-3 pt-3 border-t border-violet-200/50 dark:border-violet-800/50">
                                                        <Label className="text-xs font-medium flex items-center gap-1.5">
                                                            <Banknote className="h-3 w-3 text-muted-foreground" />
                                                            Luong thoi vu
                                                        </Label>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] text-muted-foreground">Luong / ca (VND)</label>
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    placeholder="VD: 200000"
                                                                    value={form.data.shift_rate}
                                                                    onChange={e => form.setData('shift_rate', e.target.value)}
                                                                    className="h-9 text-xs"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] text-muted-foreground">Luong tang ca / gio (VND)</label>
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    placeholder="VD: 50000"
                                                                    value={form.data.overtime_rate}
                                                                    onChange={e => form.setData('overtime_rate', e.target.value)}
                                                                    className="h-9 text-xs"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* Estimated total */}
                                                        {(Number(form.data.shift_rate) > 0 || Number(form.data.overtime_rate) > 0) && (
                                                            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50">
                                                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mb-1">Uoc tinh chi phi</p>
                                                                <div className="space-y-0.5 text-[10px] text-muted-foreground">
                                                                    {Number(form.data.shift_rate) > 0 && (
                                                                        <p>
                                                                            {form.data.work_shifts.length} ca x {form.data.work_dates.length} ngay x {Number(form.data.target_quantity || 1)} nguoi = {' '}
                                                                            <span className="font-bold text-emerald-700 dark:text-emerald-300">
                                                                                {(Number(form.data.shift_rate) * form.data.work_shifts.length * form.data.work_dates.length * Number(form.data.target_quantity || 1)).toLocaleString('vi-VN')} VND
                                                                            </span>
                                                                        </p>
                                                                    )}
                                                                    {Number(form.data.overtime_rate) > 0 && Number(form.data.overtime_hours) > 0 && (
                                                                        <p>
                                                                            Tang ca: {form.data.overtime_hours}h x {form.data.work_dates.length} ngay x {Number(form.data.target_quantity || 1)} nguoi = {' '}
                                                                            <span className="font-bold text-amber-700 dark:text-amber-300">
                                                                                {(Number(form.data.overtime_rate) * Number(form.data.overtime_hours) * form.data.work_dates.length * Number(form.data.target_quantity || 1)).toLocaleString('vi-VN')} VND
                                                                            </span>
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Target Quantity */}
                                            <div className="space-y-2">
                                                <Label htmlFor="target_quantity" className="text-xs font-medium flex items-center gap-1.5">
                                                    <Hash className="h-3 w-3 text-muted-foreground" />
                                                    So luong yeu cau *
                                                </Label>
                                                <div className="flex items-center gap-3">
                                                    <Input
                                                        id="target_quantity"
                                                        type="number"
                                                        min={1}
                                                        max={1000}
                                                        placeholder="1"
                                                        value={form.data.target_quantity}
                                                        onChange={e => form.setData('target_quantity', e.target.value)}
                                                        className="h-10 w-32"
                                                    />
                                                    <span className="text-xs text-muted-foreground">nguoi / vi tri can tuyen</span>
                                                </div>
                                                {form.errors.target_quantity && (
                                                    <p className="text-[11px] text-destructive">{form.errors.target_quantity}</p>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-2">
                                                <Label htmlFor="description" className="text-xs font-medium">Mo ta chi tiet</Label>
                                                <Textarea
                                                    id="description"
                                                    rows={5}
                                                    placeholder="Mo ta cong viec cu the can lam, tieu chi danh gia, ket qua mong muon..."
                                                    value={form.data.description}
                                                    onChange={e => form.setData('description', e.target.value)}
                                                    className="text-xs resize-none"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Assignment */}
                                <Card className="border-none shadow-sm">
                                    <CardContent className="pt-5 pb-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                                                <User className="h-4 w-4 text-violet-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold">Phan cong</h3>
                                                <p className="text-[11px] text-muted-foreground">Chon nguoi phu trach nhiem vu nay</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-medium flex items-center gap-1.5">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    Giao cho <span className="text-destructive">*</span>
                                                </Label>
                                                {form.data.assigned_to.length > 0 && (
                                                    <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/50 px-2 py-0.5 rounded-full">
                                                        {form.data.assigned_to.length} da chon
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1.5 max-h-[240px] overflow-y-auto rounded-xl border border-border/40 bg-muted/20 p-2">
                                                {members.map(m => {
                                                    const isChecked = form.data.assigned_to.includes(m.user_id);
                                                    return (
                                                        <button
                                                            key={m.user_id}
                                                            type="button"
                                                            onClick={() => toggleAssignee(m.user_id)}
                                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${isChecked
                                                                ? 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30 ring-1 ring-violet-200 dark:ring-violet-800 shadow-sm'
                                                                : 'hover:bg-white dark:hover:bg-white/5 hover:shadow-sm'
                                                                }`}
                                                        >
                                                            <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 shrink-0 transition-all duration-200 ${isChecked
                                                                ? 'bg-violet-600 border-violet-600 text-white scale-110'
                                                                : 'border-muted-foreground/25 group-hover:border-violet-400'
                                                                }`}>
                                                                {isChecked && (
                                                                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                                                                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <Avatar className={`h-7 w-7 transition-all duration-200 ${isChecked ? 'ring-2 ring-violet-400/50' : ''}`}>
                                                                <AvatarFallback className={`text-[9px] font-bold text-white ${isChecked ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-slate-400 dark:bg-slate-600'}`}>
                                                                    {m.user?.name?.charAt(0)?.toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-xs font-semibold truncate transition-colors ${isChecked ? 'text-violet-700 dark:text-violet-300' : 'text-foreground'}`}>
                                                                    {m.user?.name}
                                                                </p>
                                                            </div>
                                                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 shrink-0 transition-colors ${isChecked ? 'border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400' : ''}`}>
                                                                {ROLE_LABELS[m.role] || m.role}
                                                            </Badge>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {form.errors.assigned_to && (
                                                <p className="text-[11px] text-destructive">{form.errors.assigned_to}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Priority & Due Date */}
                                <Card className="border-none shadow-sm">
                                    <CardContent className="pt-5 pb-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                                <Zap className="h-4 w-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold">Uu tien & Thoi han</h3>
                                                <p className="text-[11px] text-muted-foreground">Thiet lap muc do uu tien va thoi gian hoan thanh</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Priority */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-medium flex items-center gap-1.5">
                                                    <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                                                    Muc do uu tien *
                                                </Label>
                                                <Select
                                                    value={form.data.priority}
                                                    onValueChange={v => form.setData('priority', v)}
                                                >
                                                    <SelectTrigger className="h-10 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PRIORITY_OPTIONS.map(opt => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${opt.color}`}>
                                                                        {opt.label}
                                                                    </span>
                                                                    <span className="text-[11px] text-muted-foreground">{opt.description}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Due date */}
                                            <div className="space-y-2">
                                                <Label htmlFor="due_date" className="text-xs font-medium flex items-center gap-1.5">
                                                    <CalendarDays className="h-3 w-3 text-muted-foreground" />
                                                    Han hoan thanh
                                                </Label>
                                                <Input
                                                    id="due_date"
                                                    type="date"
                                                    value={form.data.due_date}
                                                    onChange={e => form.setData('due_date', e.target.value)}
                                                    className="h-10 text-xs"
                                                />
                                                {form.errors.due_date && (
                                                    <p className="text-[11px] text-destructive">{form.errors.due_date}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar - Preview */}
                            <div className="space-y-4">
                                <Card className="border-none shadow-sm sticky top-20">
                                    <CardContent className="pt-5 pb-5">
                                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            Xem truoc
                                        </h3>

                                        <div className="space-y-4">
                                            {/* Task title preview */}
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Tieu de</p>
                                                <p className="text-sm font-medium">
                                                    {form.data.title || <span className="text-muted-foreground/40 italic">Chua co tieu de</span>}
                                                </p>
                                            </div>

                                            {/* Type */}
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Loai</p>
                                                {selectedType && (
                                                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${selectedType.color}`}>
                                                        {selectedType.label}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">So luong</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-primary">{form.data.target_quantity || '1'}</span>
                                                    <span className="text-xs text-muted-foreground">nguoi can tuyen</span>
                                                </div>
                                            </div>

                                            {/* Assignee */}
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Nguoi phu trach</p>
                                                {selectedMembers.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {selectedMembers.map(m => (
                                                            <div key={m.user_id} className="flex items-center gap-1 bg-violet-50 dark:bg-violet-950/30 rounded-md px-2 py-0.5">
                                                                <Avatar className="h-4 w-4">
                                                                    <AvatarFallback className="text-[7px] bg-violet-500 text-white font-bold">
                                                                        {m.user?.name?.charAt(0)?.toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-[10px] font-medium">{m.user?.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Chua chon</span>
                                                )}
                                            </div>

                                            {/* Priority */}
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Muc do</p>
                                                {selectedPriority && (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedPriority.color}`}>
                                                        {selectedPriority.label}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Due date */}
                                            {form.data.due_date && (
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Han</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarDays className="h-3 w-3 text-muted-foreground" />
                                                        <p className="text-xs">{form.data.due_date}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Work Schedule Preview */}
                                            {isSeasonalType && (form.data.work_dates.length > 0 || form.data.work_shifts.length > 0) && (
                                                <div className="pt-3 mt-2 border-t border-violet-200/50 dark:border-violet-800/50">
                                                    <p className="text-[10px] uppercase tracking-wider text-violet-600/70 dark:text-violet-400/70 mb-2 flex items-center gap-1">
                                                        <CalendarClock className="h-3 w-3" />
                                                        Lich lam viec
                                                    </p>
                                                    {form.data.work_dates.length > 0 && (
                                                        <div className="mb-2">
                                                            <p className="text-[9px] text-muted-foreground mb-1">{form.data.work_dates.length} ngay lam viec:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {form.data.work_dates.slice(0, 8).map(d => (
                                                                    <span key={d} className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-[9px] font-medium">
                                                                        {new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                                    </span>
                                                                ))}
                                                                {form.data.work_dates.length > 8 && (
                                                                    <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[9px]">
                                                                        +{form.data.work_dates.length - 8}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {form.data.work_shifts.length > 0 && (
                                                        <div>
                                                            <p className="text-[9px] text-muted-foreground mb-1">Ca lam viec:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {form.data.work_shifts.map(s => (
                                                                    <span key={s} className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-[9px] font-medium">
                                                                        {SHIFT_LABELS[s] || s}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-6 pt-4 border-t border-border/50 space-y-2">
                                            <Button type="submit" className="w-full h-10 text-xs gap-1.5" disabled={form.processing}>
                                                {form.processing ? (
                                                    <>
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        Dang tao...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ListChecks className="h-3.5 w-3.5" />
                                                        Tao nhiem vu
                                                    </>
                                                )}
                                            </Button>
                                            <Link href={route('employer.tasks.index')} className="block">
                                                <Button type="button" variant="outline" className="w-full h-9 text-xs">
                                                    Huy
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </PermissionGate>
        </AuthenticatedLayout>
    );
}
