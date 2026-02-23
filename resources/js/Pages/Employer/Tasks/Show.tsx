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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { formatDate } from '@/lib/utils';
import TaskService from '@/services/TaskService';
import { useState } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    FileText,
    Clock,
    CheckCircle2,
    Zap,
    XCircle,
    AlertTriangle,
    Flag,
    Timer,
    ClipboardList,
    UserCheck,
    UserPlus,
    Target,
    Layers,
    Hash,
    Users,
    Briefcase,
    Save,
    Plus,
    Trash2,
    Phone,
    Mail,
    FileCheck,
    UserCircle,
    Search,
} from 'lucide-react';
import type { RecruitmentTask, TaskCandidate } from '@/types';

interface ApplicationItem {
    id: number;
    candidate_name: string;
    candidate_phone?: string;
    candidate_email?: string;
    source: string;
    status: string;
}

interface Props {
    task: RecruitmentTask;
    canAssign: boolean;
    hiredCount: number;
    applications: ApplicationItem[];
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; description: string }> = {
    chinh_thuc: {
        label: 'Chinh thuc',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800',
        description: 'Nhan vien co dinh, hop dong dai han',
    },
    thoi_vu: {
        label: 'Thoi vu',
        color: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-50 border-violet-200 dark:bg-violet-950 dark:border-violet-800',
        description: 'Nhan vien tam thoi, hop dong ngan han',
    },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; ring: string; icon: typeof Flag }> = {
    low: { label: 'Thap', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', ring: 'ring-slate-200 dark:ring-slate-700', icon: Flag },
    medium: { label: 'Trung binh', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950', ring: 'ring-blue-200 dark:ring-blue-800', icon: Flag },
    high: { label: 'Cao', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950', ring: 'ring-orange-200 dark:ring-orange-800', icon: AlertTriangle },
    urgent: { label: 'Khan cap', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950', ring: 'ring-red-200 dark:ring-red-800', icon: AlertTriangle },
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string; bg: string; progressColor: string; progress: number }> = {
    pending: { label: 'Cho xu ly', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-500/10 border-yellow-500/20', progressColor: 'bg-yellow-500', progress: 10 },
    in_progress: { label: 'Dang thuc hien', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/20', progressColor: 'bg-blue-500', progress: 50 },
    completed: { label: 'Hoan thanh', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20', progressColor: 'bg-emerald-500', progress: 100 },
    cancelled: { label: 'Da huy', icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-500/10 border-gray-500/20', progressColor: 'bg-gray-400', progress: 0 },
};

const CANDIDATE_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    hired: { label: 'Da tuyen', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    trial: { label: 'Thu viec', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/20' },
    rejected: { label: 'Khong dat', color: 'text-red-600', bg: 'bg-red-500/10 border-red-500/20' },
};

export default function Show({ task, canAssign, hiredCount, applications }: Props) {
    const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
    const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
    const typeCfg = TYPE_CONFIG[task.type] || TYPE_CONFIG.chinh_thuc;
    const StatusIcon = statusCfg.icon;
    const PriorityIcon = priorityCfg.icon;
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

    // Completion report state
    const [report, setReport] = useState(task.completion_report || '');
    const [reportSaving, setReportSaving] = useState(false);

    // Add candidate dialog state
    const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApplication, setSelectedApplication] = useState<ApplicationItem | null>(null);
    const [candidateStatus, setCandidateStatus] = useState<'hired' | 'trial' | 'rejected'>('hired');
    const [candidateNotes, setCandidateNotes] = useState('');
    const [hiredDate, setHiredDate] = useState('');

    // Filter applications by search query
    const filteredApplications = applications.filter((app) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            app.candidate_name?.toLowerCase().includes(q) ||
            app.candidate_phone?.toLowerCase().includes(q) ||
            app.candidate_email?.toLowerCase().includes(q)
        );
    });

    const SOURCE_LABELS: Record<string, string> = {
        system: 'He thong',
        facebook: 'Facebook',
        zalo: 'Zalo',
        tiktok: 'TikTok',
        linkedin: 'LinkedIn',
        referral: 'Gioi thieu',
        other: 'Khac',
    };

    const handleStatusChange = (newStatus: string) => {
        TaskService.updateTask(task.id, { status: newStatus });
    };

    const handleSubmitReport = () => {
        setReportSaving(true);
        TaskService.submitReport(task.id, report);
        setTimeout(() => setReportSaving(false), 1000);
    };

    const handleAddCandidate = () => {
        if (!selectedApplication) return;
        TaskService.addCandidate(task.id, {
            application_id: selectedApplication.id,
            status: candidateStatus,
            notes: candidateNotes,
            hired_date: hiredDate,
        });
        setSelectedApplication(null);
        setSearchQuery('');
        setCandidateStatus('hired');
        setCandidateNotes('');
        setHiredDate('');
        setCandidateDialogOpen(false);
    };

    const handleRemoveCandidate = (candidateId: number) => {
        if (confirm('Ban co chac chan muon xoa ung vien nay?')) {
            TaskService.removeCandidate(task.id, candidateId);
        }
    };

    const getDaysInfo = () => {
        if (!task.due_date) return null;
        const now = new Date();
        const due = new Date(task.due_date);
        const diffMs = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (task.status === 'completed') return { text: 'Da hoan thanh', type: 'success' as const };
        if (diffDays < 0) return { text: `Qua han ${Math.abs(diffDays)} ngay`, type: 'danger' as const };
        if (diffDays === 0) return { text: 'Het han hom nay', type: 'warning' as const };
        if (diffDays <= 3) return { text: `Con ${diffDays} ngay`, type: 'warning' as const };
        return { text: `Con ${diffDays} ngay`, type: 'normal' as const };
    };

    const daysInfo = getDaysInfo();
    const candidates = task.candidates || [];

    return (
        <AuthenticatedLayout title="Chi tiet nhiem vu" header="Chi tiet nhiem vu">
            <Head title={`Nhiem vu: ${task.title}`} />

            <PermissionGate permission="tasks.view_all">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Back */}
                    <Link href={route('employer.tasks.index')}>
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                            Quay lai danh sach
                        </Button>
                    </Link>

                    {/* Hero Header Card */}
                    <Card className="border-none shadow-sm overflow-hidden">
                        <div className={`h-1.5 ${statusCfg.progressColor}`} style={{ width: `${statusCfg.progress}%`, transition: 'width 0.5s ease' }} />
                        <CardContent className="pt-6 pb-6">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${statusCfg.bg} shrink-0 mt-0.5`}>
                                            <StatusIcon className={`h-5 w-5 ${statusCfg.color}`} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <h1 className="text-xl font-bold tracking-tight">{task.title}</h1>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 gap-1 font-semibold border ${statusCfg.bg} ${statusCfg.color}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusCfg.label}
                                                </Badge>
                                                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 gap-1 font-semibold ring-1 ${priorityCfg.bg} ${priorityCfg.color} ${priorityCfg.ring}`}>
                                                    <PriorityIcon className="h-3 w-3" />
                                                    {priorityCfg.label}
                                                </Badge>
                                                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 gap-1 font-semibold border ${typeCfg.bg} ${typeCfg.color}`}>
                                                    <Briefcase className="h-3 w-3" />
                                                    {typeCfg.label}
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 gap-1 font-semibold bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800">
                                                    <Users className="h-3 w-3" />
                                                    {task.target_quantity} nguoi
                                                </Badge>
                                                {daysInfo && (
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${daysInfo.type === 'danger' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                                                        daysInfo.type === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                                                            daysInfo.type === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                                                                'bg-muted text-muted-foreground'
                                                        }`}>
                                                        {daysInfo.text}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 ml-[52px] text-[11px] text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <CalendarDays className="h-3 w-3" />
                                            Tao: {formatDate(task.created_at)}
                                        </span>
                                        {task.due_date && (
                                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-semibold' : ''}`}>
                                                <Timer className="h-3 w-3" />
                                                Han: {formatDate(task.due_date)}
                                            </span>
                                        )}
                                        {task.completed_at && (
                                            <span className="flex items-center gap-1 text-emerald-600">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Xong: {formatDate(task.completed_at)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    <Select value={task.status} onValueChange={handleStatusChange}>
                                        <SelectTrigger className="w-[170px] h-10 text-xs font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-yellow-600" />
                                                    Cho xu ly
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="in_progress">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="h-3.5 w-3.5 text-blue-600" />
                                                    Dang thuc hien
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="completed">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                    Hoan thanh
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                <div className="flex items-center gap-2">
                                                    <XCircle className="h-3.5 w-3.5 text-gray-500" />
                                                    Da huy
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Description */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                            <ClipboardList className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold">Mo ta nhiem vu</h3>
                                            <p className="text-[11px] text-muted-foreground">Noi dung chi tiet can thuc hien</p>
                                        </div>
                                    </div>

                                    {task.description ? (
                                        <div className="ml-10 p-4 rounded-lg bg-muted/30 border border-border/30">
                                            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                                                {task.description}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="ml-10 p-6 rounded-lg border border-dashed border-border/50 text-center">
                                            <FileText className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                                            <p className="text-xs text-muted-foreground/50">Chua co mo ta chi tiet cho nhiem vu nay</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {task.notes && (
                                <Card className="border-none shadow-sm">
                                    <CardContent className="pt-5 pb-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                                <FileText className="h-4 w-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold">Ghi chu</h3>
                                                <p className="text-[11px] text-muted-foreground">Thong tin bo sung</p>
                                            </div>
                                        </div>
                                        <div className="ml-10 p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{task.notes}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Candidates Section */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10">
                                                <UserCircle className="h-4 w-4 text-teal-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold">Ung vien da tuyen</h3>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {hiredCount}/{task.target_quantity} nguoi
                                                </p>
                                            </div>
                                        </div>

                                        <Dialog open={candidateDialogOpen} onOpenChange={setCandidateDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="gap-1.5 text-xs h-8">
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Them ung vien
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-lg">
                                                <DialogHeader>
                                                    <DialogTitle className="text-base">Chon ung vien tu danh sach</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-3">
                                                    {/* Search input */}
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Tim theo ten, SDT, email..."
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            className="pl-9"
                                                        />
                                                    </div>

                                                    {/* Application list */}
                                                    <div className="max-h-[240px] overflow-y-auto space-y-1.5 border rounded-lg p-2">
                                                        {filteredApplications.length > 0 ? (
                                                            filteredApplications.map((app) => (
                                                                <button
                                                                    key={app.id}
                                                                    type="button"
                                                                    onClick={() => setSelectedApplication(app)}
                                                                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${selectedApplication?.id === app.id
                                                                            ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20'
                                                                            : 'hover:bg-muted/50 border border-transparent'
                                                                        }`}
                                                                >
                                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 shrink-0">
                                                                        <UserCircle className="h-4 w-4 text-teal-600" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-semibold truncate">{app.candidate_name}</p>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            {app.candidate_phone && (
                                                                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                                                    <Phone className="h-2.5 w-2.5" />
                                                                                    {app.candidate_phone}
                                                                                </span>
                                                                            )}
                                                                            {app.candidate_email && (
                                                                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
                                                                                    <Mail className="h-2.5 w-2.5" />
                                                                                    {app.candidate_email}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0">
                                                                        {SOURCE_LABELS[app.source] || app.source}
                                                                    </Badge>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="p-4 text-center">
                                                                <UserCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                                                                <p className="text-xs text-muted-foreground/50">
                                                                    {searchQuery ? 'Khong tim thay ung vien phu hop' : 'Chua co ung vien nao'}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Selected info */}
                                                    {selectedApplication && (
                                                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                                                            <p className="text-[11px] font-medium text-primary mb-1">Da chon:</p>
                                                            <p className="text-xs font-semibold">{selectedApplication.candidate_name}</p>
                                                            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                                                                {selectedApplication.candidate_phone && <span>{selectedApplication.candidate_phone}</span>}
                                                                {selectedApplication.candidate_email && <span>{selectedApplication.candidate_email}</span>}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Status, date, notes */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="candidate_status" className="text-xs font-medium">
                                                                Trang thai
                                                            </Label>
                                                            <Select
                                                                value={candidateStatus}
                                                                onValueChange={(v) => setCandidateStatus(v as 'hired' | 'trial' | 'rejected')}
                                                            >
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="hired">Da tuyen</SelectItem>
                                                                    <SelectItem value="trial">Thu viec</SelectItem>
                                                                    <SelectItem value="rejected">Khong dat</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="hired_date" className="text-xs font-medium">
                                                                Ngay vao lam
                                                            </Label>
                                                            <Input
                                                                id="hired_date"
                                                                type="date"
                                                                value={hiredDate}
                                                                onChange={(e) => setHiredDate(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="candidate_notes" className="text-xs font-medium">
                                                            Ghi chu
                                                        </Label>
                                                        <Textarea
                                                            id="candidate_notes"
                                                            placeholder="Ghi chu ve ung vien..."
                                                            rows={2}
                                                            value={candidateNotes}
                                                            onChange={(e) => setCandidateNotes(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter className="gap-2">
                                                    <DialogClose asChild>
                                                        <Button variant="outline" size="sm">Huy</Button>
                                                    </DialogClose>
                                                    <Button
                                                        size="sm"
                                                        onClick={handleAddCandidate}
                                                        disabled={!selectedApplication}
                                                    >
                                                        Them ung vien
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="ml-10 mb-4">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[11px] font-medium text-muted-foreground">Tien do tuyen dung</span>
                                            <span className="text-[11px] font-bold text-teal-600">{hiredCount}/{task.target_quantity}</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${Math.min((hiredCount / task.target_quantity) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Candidate list */}
                                    {candidates.length > 0 ? (
                                        <div className="ml-10 space-y-2">
                                            {candidates.map((c: TaskCandidate) => {
                                                const cStatus = CANDIDATE_STATUS_CONFIG[c.status] || CANDIDATE_STATUS_CONFIG.hired;
                                                return (
                                                    <div
                                                        key={c.id}
                                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/40 transition-colors group"
                                                    >
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 shrink-0">
                                                            <UserCircle className="h-4 w-4 text-teal-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-semibold truncate">{c.candidate_name}</p>
                                                                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 gap-0.5 font-semibold ${cStatus.bg} ${cStatus.color}`}>
                                                                    {cStatus.label}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-0.5">
                                                                {c.candidate_phone && (
                                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                        <Phone className="h-2.5 w-2.5" />
                                                                        {c.candidate_phone}
                                                                    </span>
                                                                )}
                                                                {c.candidate_email && (
                                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                        <Mail className="h-2.5 w-2.5" />
                                                                        {c.candidate_email}
                                                                    </span>
                                                                )}
                                                                {c.hired_date && (
                                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                        <CalendarDays className="h-2.5 w-2.5" />
                                                                        {formatDate(c.hired_date)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {c.notes && (
                                                                <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{c.notes}</p>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive/60 hover:text-destructive"
                                                            onClick={() => handleRemoveCandidate(c.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="ml-10 p-6 rounded-lg border border-dashed border-border/50 text-center">
                                            <UserCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                                            <p className="text-xs text-muted-foreground/50">Chua co ung vien nao. An "Them ung vien" de bat dau.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Completion Report Section */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                            <FileCheck className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold">Bao cao hoan thanh</h3>
                                            <p className="text-[11px] text-muted-foreground">Tom tat ket qua thuc hien nhiem vu</p>
                                        </div>
                                    </div>

                                    <div className="ml-10 space-y-3">
                                        <Textarea
                                            placeholder="Nhap bao cao ket qua nhiem vu: so luong ung vien da tuyen, tien do, ghi chu..."
                                            rows={5}
                                            value={report}
                                            onChange={(e) => setReport(e.target.value)}
                                            className="text-sm resize-none"
                                        />
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-muted-foreground">
                                                {report.length}/10000 ky tu
                                            </p>
                                            <Button
                                                size="sm"
                                                className="gap-1.5 text-xs h-8"
                                                onClick={handleSubmitReport}
                                                disabled={reportSaving}
                                            >
                                                <Save className="h-3.5 w-3.5" />
                                                {reportSaving ? 'Dang luu...' : 'Luu bao cao'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Activity Timeline */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                                            <Layers className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold">Lich su hoat dong</h3>
                                            <p className="text-[11px] text-muted-foreground">Cac moc thoi gian quan trong</p>
                                        </div>
                                    </div>

                                    <div className="ml-10 space-y-0">
                                        {/* Created */}
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-900 z-10">
                                                    <UserPlus className="h-3.5 w-3.5 text-slate-500" />
                                                </div>
                                                <div className="w-px flex-1 bg-border/50" />
                                            </div>
                                            <div className="pb-6">
                                                <p className="text-xs font-medium">Nhiem vu duoc tao</p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {task.assigner?.name || 'He thong'} da tao nhiem vu {typeCfg.label.toLowerCase()} - Can tuyen {task.target_quantity} nguoi
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(task.created_at)}</p>
                                            </div>
                                        </div>

                                        {/* Assigned */}
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900 ring-2 ring-white dark:ring-slate-900 z-10">
                                                    <UserCheck className="h-3.5 w-3.5 text-violet-600" />
                                                </div>
                                                <div className="w-px flex-1 bg-border/50" />
                                            </div>
                                            <div className="pb-6">
                                                <p className="text-xs font-medium">Phan cong cho {task.assignee?.name}</p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    Nguoi phu trach chinh cua nhiem vu
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(task.created_at)}</p>
                                            </div>
                                        </div>

                                        {/* Current status */}
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-900 z-10 ${statusCfg.bg}`}>
                                                    <StatusIcon className={`h-3.5 w-3.5 ${statusCfg.color}`} />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium">Trang thai: {statusCfg.label}</p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {task.status === 'completed' ? 'Nhiem vu da duoc hoan thanh' :
                                                        task.status === 'cancelled' ? 'Nhiem vu da bi huy' :
                                                            task.status === 'in_progress' ? 'Nhiem vu dang duoc thuc hien' :
                                                                'Nhiem vu dang cho xu ly'}
                                                </p>
                                                {task.completed_at && (
                                                    <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(task.completed_at)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            {/* Recruitment Type Card */}
                            <Card className={`border shadow-sm ${typeCfg.bg}`}>
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loai tuyen dung</h3>
                                        <Briefcase className={`h-4 w-4 ${typeCfg.color} opacity-50`} />
                                    </div>
                                    <p className={`text-lg font-bold ${typeCfg.color}`}>{typeCfg.label}</p>
                                    <p className="text-[11px] text-muted-foreground mt-1">{typeCfg.description}</p>
                                </CardContent>
                            </Card>

                            {/* Target Quantity with hired progress */}
                            <Card className="border-none shadow-sm bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border-teal-500/10">
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Da tuyen / Muc tieu</h3>
                                        <UserCircle className="h-4 w-4 text-teal-500/50" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-teal-600 dark:text-teal-400 tabular-nums">{hiredCount}</span>
                                        <span className="text-lg text-muted-foreground">/</span>
                                        <span className="text-2xl font-bold text-muted-foreground tabular-nums">{task.target_quantity}</span>
                                    </div>
                                    <div className="h-1.5 bg-teal-200/50 dark:bg-teal-900/50 rounded-full overflow-hidden mt-3">
                                        <div
                                            className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${Math.min((hiredCount / task.target_quantity) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-2">
                                        {hiredCount >= task.target_quantity ? 'Da dat muc tieu tuyen dung!' : `Con ${task.target_quantity - hiredCount} ung vien nua`}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* People */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-5">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Thanh vien</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                                            <Avatar className="h-9 w-9 ring-2 ring-violet-500/20">
                                                <AvatarImage src={task.assignee?.avatar} />
                                                <AvatarFallback className="text-xs bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                                                    {task.assignee?.name?.charAt(0)?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold truncate">{task.assignee?.name || 'N/A'}</p>
                                                <p className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">Nguoi phu trach</p>
                                            </div>
                                            <UserCheck className="h-4 w-4 text-violet-500/50 shrink-0" />
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                                            <Avatar className="h-9 w-9 ring-2 ring-border/50">
                                                <AvatarImage src={task.assigner?.avatar} />
                                                <AvatarFallback className="text-xs bg-gradient-to-br from-slate-500 to-gray-600 text-white font-bold">
                                                    {task.assigner?.name?.charAt(0)?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold truncate">{task.assigner?.name || 'N/A'}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium">Nguoi giao viec</p>
                                            </div>
                                            <UserPlus className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Details */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-5">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Chi tiet</h3>

                                    <div className="space-y-3.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                <Target className="h-3 w-3" />
                                                Trang thai
                                            </span>
                                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 gap-1 font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {statusCfg.label}
                                            </Badge>
                                        </div>

                                        <div className="border-t border-border/30" />

                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                <Briefcase className="h-3 w-3" />
                                                Loai
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeCfg.bg} ${typeCfg.color}`}>
                                                {typeCfg.label}
                                            </span>
                                        </div>

                                        <div className="border-t border-border/30" />

                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                <Flag className="h-3 w-3" />
                                                Muc do
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${priorityCfg.bg} ${priorityCfg.color}`}>
                                                {priorityCfg.label}
                                            </span>
                                        </div>

                                        <div className="border-t border-border/30" />

                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                <Hash className="h-3 w-3" />
                                                So luong
                                            </span>
                                            <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">{hiredCount}/{task.target_quantity} nguoi</span>
                                        </div>

                                        <div className="border-t border-border/30" />

                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                <CalendarDays className="h-3 w-3" />
                                                Han
                                            </span>
                                            <span className={`text-[11px] font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                                                {task.due_date ? formatDate(task.due_date) : 'Khong gioi han'}
                                            </span>
                                        </div>

                                        <div className="border-t border-border/30" />

                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                <Clock className="h-3 w-3" />
                                                Ngay tao
                                            </span>
                                            <span className="text-[11px] font-medium">{formatDate(task.created_at)}</span>
                                        </div>

                                        {task.completed_at && (
                                            <>
                                                <div className="border-t border-border/30" />
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Hoan thanh
                                                    </span>
                                                    <span className="text-[11px] font-medium text-emerald-600">{formatDate(task.completed_at)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Progress */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-5">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tien do</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium">{statusCfg.label}</span>
                                            <span className="text-[11px] font-bold text-muted-foreground">{statusCfg.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${statusCfg.progressColor} rounded-full transition-all duration-500 ease-out`}
                                                style={{ width: `${statusCfg.progress}%` }}
                                            />
                                        </div>
                                        {isOverdue && (
                                            <p className="text-[10px] text-destructive font-medium flex items-center gap-1 mt-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                Nhiem vu da qua han hoan thanh
                                            </p>
                                        )}
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
