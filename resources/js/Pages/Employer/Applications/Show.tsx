import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { formatDate } from '@/lib/utils';
import ApplicationService from '@/services/ApplicationService';
import { useState } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    Clock,
    Eye,
    Star,
    CheckCircle2,
    XCircle,
    Mail,
    Phone,
    Globe,
    FileText,
    MessageSquare,
    UserCircle,
    Briefcase,
    Save,
    ExternalLink,
    GraduationCap,
    Wrench,
    MapPin,
    DollarSign,
    User,
    UserPlus,
    Layers,
    Shield,
} from 'lucide-react';
import type { Application } from '@/types';

interface Props {
    application: Application;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string; bg: string; progressColor: string }> = {
    pending: { label: 'Cho xu ly', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-500/10 border-yellow-500/20', progressColor: 'bg-yellow-500' },
    reviewing: { label: 'Dang xem xet', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/20', progressColor: 'bg-blue-500' },
    shortlisted: { label: 'Danh sach ngan', icon: Star, color: 'text-violet-600', bg: 'bg-violet-500/10 border-violet-500/20', progressColor: 'bg-violet-500' },
    accepted: { label: 'Chap nhan', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20', progressColor: 'bg-emerald-500' },
    rejected: { label: 'Tu choi', icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10 border-red-500/20', progressColor: 'bg-red-500' },
};

const SOURCE_LABELS: Record<string, string> = {
    system: 'He thong',
    facebook: 'Facebook',
    zalo: 'Zalo',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    referral: 'Gioi thieu',
    other: 'Khac',
};

const SOURCE_COLORS: Record<string, string> = {
    system: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    facebook: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    zalo: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    tiktok: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    linkedin: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    referral: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

const STATUS_PROGRESS: Record<string, number> = {
    pending: 15,
    reviewing: 40,
    shortlisted: 65,
    accepted: 100,
    rejected: 100,
};

export default function Show({ application }: Props) {
    const statusCfg = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;
    const StatusIcon = statusCfg.icon;
    const isSystemCandidate = application.candidate_id !== null;
    const profile = application.candidate?.candidate_profile;

    const [notes, setNotes] = useState(application.employer_notes || '');
    const [notesSaving, setNotesSaving] = useState(false);

    const candidateName = isSystemCandidate
        ? (application.candidate?.name || 'N/A')
        : (application.candidate_name || 'N/A');

    const candidateEmail = isSystemCandidate
        ? application.candidate?.email
        : application.candidate_email;

    const candidatePhone = isSystemCandidate
        ? application.candidate?.phone
        : application.candidate_phone;

    const handleStatusChange = (newStatus: string) => {
        ApplicationService.updateStatus(application.id, newStatus);
    };

    const handleSaveNotes = () => {
        setNotesSaving(true);
        ApplicationService.updateNotes(application.id, notes);
        setTimeout(() => setNotesSaving(false), 1000);
    };

    return (
        <AuthenticatedLayout title="Chi tiet ung vien" header="Chi tiet ung vien">
            <Head title={`Ung vien: ${candidateName}`} />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back */}
                <Link href={route('employer.applications.index')}>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lai danh sach
                    </Button>
                </Link>

                {/* Hero Header Card */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <div
                        className={`h-1.5 ${statusCfg.progressColor} transition-all duration-500`}
                        style={{ width: `${STATUS_PROGRESS[application.status] || 15}%` }}
                    />
                    <CardContent className="pt-6 pb-6">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                                    <AvatarFallback className={`text-lg font-bold ${isSystemCandidate
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                        : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                                        }`}>
                                        {candidateName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-2">
                                    <h1 className="text-xl font-bold tracking-tight">{candidateName}</h1>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 gap-1 font-semibold border ${statusCfg.bg} ${statusCfg.color}`}>
                                            <StatusIcon className="h-3 w-3" />
                                            {statusCfg.label}
                                        </Badge>
                                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 gap-1 font-semibold ${SOURCE_COLORS[application.source] || SOURCE_COLORS.other}`}>
                                            <Globe className="h-3 w-3" />
                                            {SOURCE_LABELS[application.source] || application.source}
                                        </Badge>
                                        {isSystemCandidate ? (
                                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 gap-1 font-semibold bg-blue-500/5 text-blue-600 border-blue-500/20">
                                                <Shield className="h-3 w-3" />
                                                Tai khoan he thong
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 gap-1 font-semibold bg-violet-500/5 text-violet-600 border-violet-500/20">
                                                <UserPlus className="h-3 w-3" />
                                                Ben ngoai
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                                        {candidateEmail && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {candidateEmail}
                                            </span>
                                        )}
                                        {candidatePhone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {candidatePhone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Status changer */}
                            <div className="shrink-0">
                                <Select value={application.status} onValueChange={handleStatusChange}>
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
                                        <SelectItem value="reviewing">
                                            <div className="flex items-center gap-2">
                                                <Eye className="h-3.5 w-3.5 text-blue-600" />
                                                Dang xem xet
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="shortlisted">
                                            <div className="flex items-center gap-2">
                                                <Star className="h-3.5 w-3.5 text-violet-600" />
                                                Danh sach ngan
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="accepted">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                Chap nhan
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="h-3.5 w-3.5 text-red-600" />
                                                Tu choi
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
                        {/* Contact & Social Links */}
                        {application.social_links && application.social_links.length > 0 && (
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10">
                                            <Globe className="h-4 w-4 text-sky-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold">Mang xa hoi</h3>
                                            <p className="text-[11px] text-muted-foreground">Cac lien ket mang xa hoi cua ung vien</p>
                                        </div>
                                    </div>
                                    <div className="ml-10 flex flex-wrap gap-2">
                                        {application.social_links.map((link, i) => (
                                            <a
                                                key={i}
                                                href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all hover:scale-105 hover:shadow-sm ${SOURCE_COLORS[link.platform] || SOURCE_COLORS.other}`}
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                {SOURCE_LABELS[link.platform] || link.platform}
                                            </a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Cover Letter */}
                        <Card className="border-none shadow-sm">
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                        <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold">Thu gioi thieu</h3>
                                        <p className="text-[11px] text-muted-foreground">Noi dung ung vien gui kem don ung tuyen</p>
                                    </div>
                                </div>
                                {application.cover_letter ? (
                                    <div className="ml-10 p-4 rounded-lg bg-muted/30 border border-border/30">
                                        <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                                            {application.cover_letter}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="ml-10 p-6 rounded-lg border border-dashed border-border/50 text-center">
                                        <FileText className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground/50">Ung vien khong gui thu gioi thieu</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Source Note (external) */}
                        {application.source_note && (
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                            <MessageSquare className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold">Ghi chu nguon</h3>
                                            <p className="text-[11px] text-muted-foreground">Thong tin ve cach ung vien duoc tim thay</p>
                                        </div>
                                    </div>
                                    <div className="ml-10 p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                        <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{application.source_note}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Employer Notes (editable) */}
                        <Card className="border-none shadow-sm">
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <MessageSquare className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold">Ghi chu nha tuyen dung</h3>
                                        <p className="text-[11px] text-muted-foreground">Ghi chu rieng cua ban ve ung vien nay</p>
                                    </div>
                                </div>
                                <div className="ml-10 space-y-3">
                                    <Textarea
                                        placeholder="Nhap ghi chu cua ban ve ung vien..."
                                        rows={4}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="text-sm resize-none"
                                    />
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-muted-foreground">
                                            {notes.length} ky tu
                                        </p>
                                        <Button
                                            size="sm"
                                            className="gap-1.5 text-xs h-8"
                                            onClick={handleSaveNotes}
                                            disabled={notesSaving}
                                        >
                                            <Save className="h-3.5 w-3.5" />
                                            {notesSaving ? 'Dang luu...' : 'Luu ghi chu'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Interviews */}
                        <Card className="border-none shadow-sm">
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                                        <CalendarDays className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold">Lich phong van</h3>
                                        <p className="text-[11px] text-muted-foreground">
                                            {application.interviews && application.interviews.length > 0
                                                ? `${application.interviews.length} buoi phong van`
                                                : 'Chua co lich phong van'}
                                        </p>
                                    </div>
                                </div>
                                {application.interviews && application.interviews.length > 0 ? (
                                    <div className="ml-10 space-y-2">
                                        {application.interviews.map((interview) => {
                                            const interviewStatusCfg: Record<string, { label: string; color: string; bg: string }> = {
                                                scheduled: { label: 'Da len lich', color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/20' },
                                                completed: { label: 'Da hoan thanh', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                                                cancelled: { label: 'Da huy', color: 'text-gray-500', bg: 'bg-gray-500/10 border-gray-500/20' },
                                            };
                                            const iCfg = interviewStatusCfg[interview.status] || interviewStatusCfg.scheduled;
                                            return (
                                                <div
                                                    key={interview.id}
                                                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30"
                                                >
                                                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${iCfg.bg} shrink-0`}>
                                                        <CalendarDays className={`h-4 w-4 ${iCfg.color}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-semibold">
                                                                {formatDate(interview.scheduled_at)}
                                                            </p>
                                                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${iCfg.bg} ${iCfg.color}`}>
                                                                {iCfg.label}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                                                {interview.type === 'online' ? 'Online' : 'Truc tiep'}
                                                            </Badge>
                                                        </div>
                                                        {interview.location && (
                                                            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                                                <MapPin className="h-2.5 w-2.5" />
                                                                {interview.location}
                                                            </p>
                                                        )}
                                                        {interview.notes && (
                                                            <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{interview.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="ml-10 p-6 rounded-lg border border-dashed border-border/50 text-center">
                                        <CalendarDays className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground/50">Chua co lich phong van nao duoc tao</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Activity Timeline */}
                        <Card className="border-none shadow-sm">
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/10">
                                        <Layers className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold">Lich su hoat dong</h3>
                                        <p className="text-[11px] text-muted-foreground">Cac moc thoi gian quan trong</p>
                                    </div>
                                </div>
                                <div className="ml-10 space-y-0">
                                    {/* Applied */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-900 z-10">
                                                <UserCircle className="h-3.5 w-3.5 text-slate-500" />
                                            </div>
                                            <div className="w-px flex-1 bg-border/50" />
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-xs font-medium">
                                                {isSystemCandidate ? 'Ung vien nop don qua he thong' : 'Ung vien duoc them thu cong'}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {isSystemCandidate
                                                    ? `${candidateName} da ung tuyen qua website`
                                                    : `Nguon: ${SOURCE_LABELS[application.source] || application.source}${application.added_by_user ? ` - Them boi ${application.added_by_user.name}` : ''}`
                                                }
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(application.applied_at)}</p>
                                        </div>
                                    </div>

                                    {/* Reviewed */}
                                    {application.reviewed_at && (
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 ring-2 ring-white dark:ring-slate-900 z-10">
                                                    <Eye className="h-3.5 w-3.5 text-blue-600" />
                                                </div>
                                                <div className="w-px flex-1 bg-border/50" />
                                            </div>
                                            <div className="pb-6">
                                                <p className="text-xs font-medium">Don da duoc xem xet</p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    Don ung tuyen da duoc nha tuyen dung xem xet
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(application.reviewed_at)}</p>
                                            </div>
                                        </div>
                                    )}

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
                                                {application.status === 'accepted' ? 'Ung vien da duoc chap nhan' :
                                                    application.status === 'rejected' ? 'Ung vien da bi tu choi' :
                                                        application.status === 'shortlisted' ? 'Ung vien trong danh sach ngan' :
                                                            application.status === 'reviewing' ? 'Don dang duoc xem xet' :
                                                                'Don dang cho xu ly'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Job Post Card */}
                        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vi tri ung tuyen</h3>
                                    <Briefcase className="h-4 w-4 text-blue-500/50" />
                                </div>
                                {application.job_post && (
                                    <>
                                        <p className="text-sm font-bold text-foreground leading-snug">{application.job_post.title}</p>
                                        {application.job_post.category && (
                                            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                                <Briefcase className="h-3 w-3" />
                                                {application.job_post.category.name}
                                            </p>
                                        )}
                                        {application.job_post.location && (
                                            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {application.job_post.location}{application.job_post.city ? `, ${application.job_post.city}` : ''}
                                            </p>
                                        )}
                                        {(application.job_post.salary_min || application.job_post.salary_max) && (
                                            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                {application.job_post.salary_min
                                                    ? `${(application.job_post.salary_min / 1000000).toFixed(0)}tr`
                                                    : ''}
                                                {application.job_post.salary_min && application.job_post.salary_max ? ' - ' : ''}
                                                {application.job_post.salary_max
                                                    ? `${(application.job_post.salary_max / 1000000).toFixed(0)}tr`
                                                    : ''}
                                            </p>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Candidate Type Card */}
                        <Card className={`border shadow-sm ${isSystemCandidate
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                            : 'bg-violet-50 border-violet-200 dark:bg-violet-950 dark:border-violet-800'
                            }`}>
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loai ung vien</h3>
                                    <User className={`h-4 w-4 opacity-50 ${isSystemCandidate ? 'text-blue-600' : 'text-violet-600'}`} />
                                </div>
                                <p className={`text-lg font-bold ${isSystemCandidate ? 'text-blue-600 dark:text-blue-400' : 'text-violet-600 dark:text-violet-400'}`}>
                                    {isSystemCandidate ? 'He thong' : 'Ben ngoai'}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    {isSystemCandidate
                                        ? 'Ung vien da co tai khoan tren he thong'
                                        : 'Ung vien chua dang ky tai khoan'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* System Candidate Profile */}
                        {isSystemCandidate && profile && (
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-5">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Ho so ung vien</h3>
                                    <div className="space-y-3.5">
                                        {profile.bio && (
                                            <div>
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Gioi thieu</p>
                                                <p className="text-xs text-foreground/80 leading-relaxed">{profile.bio}</p>
                                            </div>
                                        )}

                                        {profile.skills && profile.skills.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                                    <Wrench className="h-2.5 w-2.5" />
                                                    Ky nang
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {profile.skills.map((skill, i) => (
                                                        <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5 bg-primary/5 font-medium">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {profile.experience_years !== undefined && profile.experience_years !== null && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                    <Briefcase className="h-3 w-3" />
                                                    Kinh nghiem
                                                </span>
                                                <span className="text-xs font-semibold">{profile.experience_years} nam</span>
                                            </div>
                                        )}

                                        {profile.education && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                    <GraduationCap className="h-3 w-3" />
                                                    Hoc van
                                                </span>
                                                <span className="text-xs font-semibold text-right max-w-[60%] truncate">{profile.education}</span>
                                            </div>
                                        )}

                                        {profile.desired_salary && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                    <DollarSign className="h-3 w-3" />
                                                    Mong muon
                                                </span>
                                                <span className="text-xs font-semibold">
                                                    {(profile.desired_salary / 1000000).toFixed(0)}tr/thang
                                                </span>
                                            </div>
                                        )}

                                        {profile.city && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                    <MapPin className="h-3 w-3" />
                                                    Dia diem
                                                </span>
                                                <span className="text-xs font-semibold">{profile.city}</span>
                                            </div>
                                        )}

                                        {profile.gender && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                    <User className="h-3 w-3" />
                                                    Gioi tinh
                                                </span>
                                                <span className="text-xs font-semibold">
                                                    {profile.gender === 'male' ? 'Nam' : profile.gender === 'female' ? 'Nu' : 'Khac'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Details Card */}
                        <Card className="border-none shadow-sm">
                            <CardContent className="pt-5 pb-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Chi tiet</h3>
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                            <CalendarDays className="h-3 w-3" />
                                            Ngay ung tuyen
                                        </span>
                                        <span className="text-xs font-semibold">{formatDate(application.applied_at)}</span>
                                    </div>
                                    {application.reviewed_at && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                <Eye className="h-3 w-3" />
                                                Ngay xem xet
                                            </span>
                                            <span className="text-xs font-semibold">{formatDate(application.reviewed_at)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                            <Globe className="h-3 w-3" />
                                            Nguon
                                        </span>
                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${SOURCE_COLORS[application.source] || SOURCE_COLORS.other}`}>
                                            {SOURCE_LABELS[application.source] || application.source}
                                        </Badge>
                                    </div>
                                    {application.resume_url && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                <FileText className="h-3 w-3" />
                                                CV / Resume
                                            </span>
                                            <a
                                                href={application.resume_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                Xem CV
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Added By (for external) */}
                        {application.added_by_user && (
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-5 pb-5">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Nguoi them</h3>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                                        <Avatar className="h-9 w-9 ring-2 ring-border/50">
                                            <AvatarFallback className="text-xs bg-gradient-to-br from-slate-500 to-gray-600 text-white font-bold">
                                                {application.added_by_user.name?.charAt(0)?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold truncate">{application.added_by_user.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">{application.added_by_user.email}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
