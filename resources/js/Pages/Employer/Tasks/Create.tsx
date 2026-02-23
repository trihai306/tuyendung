import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PermissionGate from '@/Components/PermissionGate';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
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

export default function Create({ members }: Props) {
    const form = useForm({
        assigned_to: '',
        title: '',
        type: 'chinh_thuc',
        description: '',
        priority: 'medium',
        target_quantity: '1',
        due_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('employer.tasks.store'));
    };

    const selectedMember = members.find(m => String(m.user_id) === form.data.assigned_to);
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
                                                                    }`}>
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

                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium flex items-center gap-1.5">
                                                <User className="h-3 w-3 text-muted-foreground" />
                                                Giao cho *
                                            </Label>
                                            <Select
                                                value={form.data.assigned_to}
                                                onValueChange={v => form.setData('assigned_to', v)}
                                            >
                                                <SelectTrigger className="h-10 text-xs">
                                                    <SelectValue placeholder="Chon nguoi phu trach" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {members.map(m => (
                                                        <SelectItem key={m.user_id} value={String(m.user_id)}>
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-5 w-5">
                                                                    <AvatarFallback className="text-[8px] bg-violet-500 text-white font-bold">
                                                                        {m.user?.name?.charAt(0)?.toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span>{m.user?.name}</span>
                                                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                                                    {ROLE_LABELS[m.role] || m.role}
                                                                </Badge>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                                {selectedMember ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback className="text-[9px] bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                                                                {selectedMember.user?.name?.charAt(0)?.toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs font-medium">{selectedMember.user?.name}</span>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground/40 italic">Chua chon</p>
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
