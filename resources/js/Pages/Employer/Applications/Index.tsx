import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import Pagination from '@/Components/Pagination';
import { formatDate } from '@/lib/utils';
import {
    Users,
    Clock,
    Eye,
    Star,
    CheckCircle2,
    XCircle,
    Plus,
    Search,
    Filter,
    Globe,
    UserPlus,
    Phone,
    Mail,
    Loader2,
    FileText,
    MessageSquare,
    Trash2,
    ExternalLink,
    Calendar,
    Briefcase,
    GraduationCap,
    MapPin,
    User as UserIcon,
    Award,
    ScrollText,
} from 'lucide-react';
import type { Application, SocialLink, PaginatedData, JobPost } from '@/types';
import { useState, FormEventHandler } from 'react';
import { usePermission } from '@/hooks/usePermission';

interface Stats {
    total: number;
    pending: number;
    reviewing: number;
    shortlisted: number;
    accepted: number;
    rejected: number;
    system: number;
    external: number;
}

interface Props {
    applications: PaginatedData<Application>;
    filters: Record<string, string>;
    jobPosts: Pick<JobPost, 'id' | 'title'>[];
    stats: Stats;
}

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

const PLATFORM_OPTIONS = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'zalo', label: 'Zalo' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'other', label: 'Khac' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: 'Cho xu ly', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Clock },
    reviewing: { label: 'Dang xem xet', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Eye },
    shortlisted: { label: 'Danh sach ngan', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20', icon: Star },
    accepted: { label: 'Chap nhan', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    rejected: { label: 'Tu choi', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
};

export default function Index({ applications, filters, jobPosts, stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [detailApp, setDetailApp] = useState<Application | null>(null);
    const { can } = usePermission();

    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([{ platform: 'facebook', url: '' }]);

    const addForm = useForm({
        job_post_id: '',
        candidate_name: '',
        candidate_email: '',
        candidate_phone: '',
        source: 'facebook',
        source_note: '',
        social_links: [] as SocialLink[],
        cover_letter: '',
    });

    const handleAddSocialLink = () => {
        setSocialLinks([...socialLinks, { platform: 'facebook', url: '' }]);
    };

    const handleRemoveSocialLink = (index: number) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== index));
    };

    const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
        const updated = [...socialLinks];
        updated[index] = { ...updated[index], [field]: value };
        setSocialLinks(updated);
    };

    const handleFilter = (key: string, value: string) => {
        router.get(
            route('employer.applications.index'),
            { ...filters, [key]: value === 'all' ? '' : value },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearch: FormEventHandler = (e) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const handleUpdateStatus = (applicationId: number, newStatus: string) => {
        router.patch(
            route('employer.applications.update', applicationId),
            { status: newStatus },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleAddExternal: FormEventHandler = (e) => {
        e.preventDefault();
        const validLinks = socialLinks.filter(link => link.url.trim() !== '');
        addForm.transform((data) => ({
            ...data,
            social_links: validLinks.length > 0 ? validLinks : undefined,
        }));
        addForm.post(route('employer.applications.store-external'), {
            onSuccess: () => {
                addForm.reset();
                setSocialLinks([{ platform: 'facebook', url: '' }]);
                setAddDialogOpen(false);
            },
        });
    };

    const getCandidateInfo = (app: Application) => {
        if (app.candidate) {
            return {
                name: app.candidate.name || 'N/A',
                email: app.candidate.email || '',
                phone: '',
                isExternal: false,
            };
        }
        return {
            name: app.candidate_name || 'N/A',
            email: app.candidate_email || '',
            phone: app.candidate_phone || '',
            isExternal: true,
        };
    };

    const STAT_CARDS = [
        { label: 'Tong ung vien', value: stats.total, icon: Users, gradient: 'from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50', iconBg: 'bg-slate-500/10', iconColor: 'text-slate-600' },
        { label: 'Cho xu ly', value: stats.pending, icon: Clock, gradient: 'from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30', iconBg: 'bg-yellow-500/10', iconColor: 'text-yellow-600' },
        { label: 'Dang xem xet', value: stats.reviewing, icon: Eye, gradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600' },
        { label: 'Chap nhan', value: stats.accepted, icon: CheckCircle2, gradient: 'from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
    ];

    return (
        <AuthenticatedLayout title="Quan ly ung vien" header="Quan ly ung vien">
            <Head title="Quan ly ung vien" />

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

                {/* Source breakdown */}
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background px-3 py-1.5">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-xs text-muted-foreground">He thong: <span className="font-semibold text-foreground">{stats.system}</span></span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background px-3 py-1.5">
                        <div className="h-2 w-2 rounded-full bg-violet-500" />
                        <span className="text-xs text-muted-foreground">Mang xa hoi / Ben ngoai: <span className="font-semibold text-foreground">{stats.external}</span></span>
                    </div>
                </div>

                {/* Filters & Actions */}
                <Card className="border-none shadow-sm">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2 flex-1">
                                {/* Search */}
                                <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Tim ung vien..."
                                        className="pl-9 h-9 text-xs"
                                    />
                                </form>

                                {/* Status filter */}
                                <Select value={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v)}>
                                    <SelectTrigger className="w-[150px] h-9 text-xs">
                                        <Filter className="h-3 w-3 mr-1.5 text-muted-foreground" />
                                        <SelectValue placeholder="Trang thai" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tat ca trang thai</SelectItem>
                                        <SelectItem value="pending">Cho xu ly</SelectItem>
                                        <SelectItem value="reviewing">Dang xem xet</SelectItem>
                                        <SelectItem value="shortlisted">Danh sach ngan</SelectItem>
                                        <SelectItem value="accepted">Chap nhan</SelectItem>
                                        <SelectItem value="rejected">Tu choi</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Source filter */}
                                <Select value={filters.source || 'all'} onValueChange={(v) => handleFilter('source', v)}>
                                    <SelectTrigger className="w-[140px] h-9 text-xs">
                                        <Globe className="h-3 w-3 mr-1.5 text-muted-foreground" />
                                        <SelectValue placeholder="Nguon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tat ca nguon</SelectItem>
                                        <SelectItem value="system">He thong</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                        <SelectItem value="zalo">Zalo</SelectItem>
                                        <SelectItem value="tiktok">TikTok</SelectItem>
                                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                                        <SelectItem value="referral">Gioi thieu</SelectItem>
                                        <SelectItem value="other">Khac</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Job filter */}
                                {jobPosts.length > 0 && (
                                    <Select value={filters.job_post_id || 'all'} onValueChange={(v) => handleFilter('job_post_id', v)}>
                                        <SelectTrigger className="w-[180px] h-9 text-xs">
                                            <FileText className="h-3 w-3 mr-1.5 text-muted-foreground" />
                                            <SelectValue placeholder="Vi tri" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tat ca vi tri</SelectItem>
                                            {jobPosts.map((job) => (
                                                <SelectItem key={job.id} value={String(job.id)}>
                                                    {job.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Add external candidate */}
                            {can('applications.add_external') && (
                                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="h-9 text-xs gap-1.5 shrink-0">
                                            <UserPlus className="h-3.5 w-3.5" />
                                            Them ung vien
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Them ung vien ben ngoai</DialogTitle>
                                            <DialogDescription>
                                                Them ung vien tu mang xa hoi hoac nguon ben ngoai he thong
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleAddExternal} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="ext-job" className="text-xs">Vi tri ung tuyen *</Label>
                                                <Select value={addForm.data.job_post_id} onValueChange={(v) => addForm.setData('job_post_id', v)}>
                                                    <SelectTrigger id="ext-job" className="h-9 text-xs">
                                                        <SelectValue placeholder="Chon vi tri..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {jobPosts.map((job) => (
                                                            <SelectItem key={job.id} value={String(job.id)}>
                                                                {job.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {addForm.errors.job_post_id && <p className="text-[11px] text-destructive">{addForm.errors.job_post_id}</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2 col-span-2">
                                                    <Label htmlFor="ext-name" className="text-xs">Ho ten *</Label>
                                                    <Input
                                                        id="ext-name"
                                                        value={addForm.data.candidate_name}
                                                        onChange={(e) => addForm.setData('candidate_name', e.target.value)}
                                                        placeholder="Nguyen Van A"
                                                        className="h-9 text-xs"
                                                    />
                                                    {addForm.errors.candidate_name && <p className="text-[11px] text-destructive">{addForm.errors.candidate_name}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="ext-email" className="text-xs">Email</Label>
                                                    <Input
                                                        id="ext-email"
                                                        type="email"
                                                        value={addForm.data.candidate_email}
                                                        onChange={(e) => addForm.setData('candidate_email', e.target.value)}
                                                        placeholder="email@example.com"
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="ext-phone" className="text-xs">So dien thoai</Label>
                                                    <Input
                                                        id="ext-phone"
                                                        value={addForm.data.candidate_phone}
                                                        onChange={(e) => addForm.setData('candidate_phone', e.target.value)}
                                                        placeholder="0912 345 678"
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="ext-source" className="text-xs">Nguon chinh *</Label>
                                                    <Select value={addForm.data.source} onValueChange={(v) => addForm.setData('source', v)}>
                                                        <SelectTrigger id="ext-source" className="h-9 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="facebook">Facebook</SelectItem>
                                                            <SelectItem value="zalo">Zalo</SelectItem>
                                                            <SelectItem value="tiktok">TikTok</SelectItem>
                                                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                                                            <SelectItem value="referral">Gioi thieu</SelectItem>
                                                            <SelectItem value="other">Khac</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="ext-source-note" className="text-xs">Ghi chu nguon</Label>
                                                    <Input
                                                        id="ext-source-note"
                                                        value={addForm.data.source_note}
                                                        onChange={(e) => addForm.setData('source_note', e.target.value)}
                                                        placeholder="Link profile, nhom..."
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            {/* Social links */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs">Mang xa hoi</Label>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleAddSocialLink}
                                                        className="h-6 text-[11px] gap-1 px-2"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        Them
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {socialLinks.map((link, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <Select
                                                                value={link.platform}
                                                                onValueChange={(v) => handleSocialLinkChange(index, 'platform', v)}
                                                            >
                                                                <SelectTrigger className="h-8 w-[110px] text-[11px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {PLATFORM_OPTIONS.map((opt) => (
                                                                        <SelectItem key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Input
                                                                value={link.url}
                                                                onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                                                                placeholder="Link hoac username..."
                                                                className="h-8 text-[11px] flex-1"
                                                            />
                                                            {socialLinks.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveSocialLink(index)}
                                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="ext-note" className="text-xs">Ghi chu / Thu gioi thieu</Label>
                                                <Textarea
                                                    id="ext-note"
                                                    value={addForm.data.cover_letter}
                                                    onChange={(e) => addForm.setData('cover_letter', e.target.value)}
                                                    placeholder="Ghi chu them ve ung vien..."
                                                    rows={3}
                                                    className="text-xs resize-none"
                                                />
                                            </div>

                                            <DialogFooter>
                                                <Button type="button" variant="outline" size="sm" onClick={() => setAddDialogOpen(false)}>
                                                    Huy
                                                </Button>
                                                <Button type="submit" size="sm" disabled={addForm.processing} className="gap-1.5">
                                                    {addForm.processing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                                                    Them ung vien
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Application List */}
                {applications.data.length === 0 ? (
                    <Card className="border-none shadow-sm">
                        <CardContent className="py-16">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                                    <Users className="h-7 w-7 text-muted-foreground/40" />
                                </div>
                                <h3 className="text-sm font-semibold mb-1">Chua co ung vien nao</h3>
                                <p className="text-xs text-muted-foreground max-w-sm">
                                    Ung vien se xuat hien khi ho nop don qua he thong, hoac ban them thu cong tu mang xa hoi.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {applications.data.map((app) => {
                            const info = getCandidateInfo(app);
                            const statusCfg = STATUS_CONFIG[app.status];
                            const StatusIcon = statusCfg?.icon || Clock;
                            return (
                                <Card key={app.id} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDetailApp(app)}>
                                    <CardContent className="py-4 px-5">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            {/* Avatar */}
                                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${info.isExternal ? 'bg-gradient-to-br from-violet-500/10 to-purple-500/10' : 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10'}`}>
                                                <span className="text-sm font-bold text-foreground/70">
                                                    {info.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="text-sm font-semibold truncate">{info.name}</h4>
                                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${SOURCE_COLORS[app.source] || SOURCE_COLORS.other}`}>
                                                        {SOURCE_LABELS[app.source] || app.source}
                                                    </Badge>
                                                    {info.isExternal && (
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-violet-500/5 text-violet-600 border-violet-500/20">
                                                            Ben ngoai
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                    {info.email && (
                                                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            {info.email}
                                                        </span>
                                                    )}
                                                    {info.phone && (
                                                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                            <Phone className="h-3 w-3" />
                                                            {info.phone}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Social links */}
                                                {app.social_links && app.social_links.length > 0 && (
                                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                        {app.social_links.map((link, i) => (
                                                            <a
                                                                key={i}
                                                                href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:opacity-80 ${SOURCE_COLORS[link.platform] || SOURCE_COLORS.other}`}
                                                            >
                                                                <ExternalLink className="h-2.5 w-2.5" />
                                                                {SOURCE_LABELS[link.platform] || link.platform}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                                {app.source_note && (
                                                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground/70 mt-1">
                                                        <MessageSquare className="h-3 w-3" />
                                                        {app.source_note}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Right side */}
                                            <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                {/* Applied date */}
                                                <span className="text-[11px] text-muted-foreground hidden md:block">
                                                    {formatDate(app.applied_at)}
                                                </span>

                                                {/* Status badge */}
                                                <Badge variant="outline" className={`text-[11px] gap-1 ${statusCfg?.color || ''}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusCfg?.label || app.status}
                                                </Badge>

                                                {/* Status action */}
                                                {can('applications.update') && (
                                                    <Select
                                                        value={app.status}
                                                        onValueChange={(v) => handleUpdateStatus(app.id, v)}
                                                    >
                                                        <SelectTrigger className="h-8 w-[130px] text-[11px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Cho xu ly</SelectItem>
                                                            <SelectItem value="reviewing">Dang xem xet</SelectItem>
                                                            <SelectItem value="shortlisted">Danh sach ngan</SelectItem>
                                                            <SelectItem value="accepted">Chap nhan</SelectItem>
                                                            <SelectItem value="rejected">Tu choi</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}

                                                {/* Detail link */}
                                                <Link href={route('employer.applications.show', app.id)}>
                                                    <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        Chi tiet
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

                {/* Pagination */}
                {applications.data.length > 0 && (
                    <Pagination meta={applications.meta} />
                )}

                {/* Candidate Detail Modal */}
                <Dialog open={!!detailApp} onOpenChange={(open) => { if (!open) setDetailApp(null); }}>
                    <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                        {detailApp && (() => {
                            const info = getCandidateInfo(detailApp);
                            const statusCfg = STATUS_CONFIG[detailApp.status];
                            const StatusIcon = statusCfg?.icon || Clock;
                            const profile = detailApp.candidate?.candidate_profile;
                            return (
                                <>
                                    <DialogHeader className="pb-0">
                                        <div className="flex items-start gap-4">
                                            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shrink-0 ${info.isExternal ? 'bg-gradient-to-br from-violet-500/10 to-purple-500/10' : 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10'}`}>
                                                <span className="text-lg font-bold text-foreground/70">
                                                    {info.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <DialogTitle className="text-base">{info.name}</DialogTitle>
                                                <DialogDescription className="mt-1">
                                                    <span className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${SOURCE_COLORS[detailApp.source] || SOURCE_COLORS.other}`}>
                                                            {SOURCE_LABELS[detailApp.source] || detailApp.source}
                                                        </Badge>
                                                        {info.isExternal && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-violet-500/5 text-violet-600 border-violet-500/20">
                                                                Ben ngoai
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className={`text-[10px] gap-1 ${statusCfg?.color || ''}`}>
                                                            <StatusIcon className="h-3 w-3" />
                                                            {statusCfg?.label || detailApp.status}
                                                        </Badge>
                                                    </span>
                                                </DialogDescription>
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <Separator className="my-3" />

                                    {/* Contact info */}
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Thong tin lien he</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {info.email && (
                                                    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                                                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="text-xs truncate">{info.email}</span>
                                                    </div>
                                                )}
                                                {info.phone && (
                                                    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                                                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="text-xs">{info.phone}</span>
                                                    </div>
                                                )}
                                                {detailApp.applied_at && (
                                                    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="text-xs">Nop don: {formatDate(detailApp.applied_at)}</span>
                                                    </div>
                                                )}
                                                {detailApp.job_post && (
                                                    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                                                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="text-xs truncate">{detailApp.job_post.title}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Social links */}
                                        {detailApp.social_links && detailApp.social_links.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mang xa hoi</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {detailApp.social_links.map((link, i) => (
                                                        <a
                                                            key={i}
                                                            href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:shadow-sm hover:scale-[1.02] ${SOURCE_COLORS[link.platform] || SOURCE_COLORS.other}`}
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            {SOURCE_LABELS[link.platform] || link.platform}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Candidate profile */}
                                        {profile && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ho so ung vien</h4>
                                                <div className="space-y-2">
                                                    {profile.bio && (
                                                        <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                                                            <p className="text-xs leading-relaxed text-muted-foreground">{profile.bio}</p>
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {profile.experience_years !== undefined && profile.experience_years > 0 && (
                                                            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                                                                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span className="text-xs">{profile.experience_years} nam kinh nghiem</span>
                                                            </div>
                                                        )}
                                                        {profile.education && (
                                                            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                                                                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span className="text-xs truncate">{profile.education}</span>
                                                            </div>
                                                        )}
                                                        {(profile.current_address || profile.city) && (
                                                            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                                                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span className="text-xs truncate">
                                                                    {[profile.current_address, profile.district, profile.city].filter(Boolean).join(', ')}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {profile.gender && (
                                                            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                                                                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span className="text-xs">
                                                                    {profile.gender === 'male' ? 'Nam' : profile.gender === 'female' ? 'Nu' : 'Khac'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {profile.date_of_birth && (
                                                            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span className="text-xs">Ngay sinh: {profile.date_of_birth}</span>
                                                            </div>
                                                        )}
                                                        {profile.desired_salary && (
                                                            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                                                                <Award className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span className="text-xs">Luong mong muon: {Number(profile.desired_salary).toLocaleString('vi-VN')} VND</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {profile.skills && profile.skills.length > 0 && (
                                                        <div className="pt-1">
                                                            <p className="text-[11px] text-muted-foreground mb-1.5">Ky nang</p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {profile.skills.map((skill, i) => (
                                                                    <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5 bg-blue-500/5 text-blue-600 border-blue-500/20">
                                                                        {skill}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Cover letter / notes */}
                                        {(detailApp.cover_letter || detailApp.source_note) && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                                    {detailApp.cover_letter ? 'Thu gioi thieu / Ghi chu' : 'Ghi chu nguon'}
                                                </h4>
                                                <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 space-y-2">
                                                    {detailApp.cover_letter && (
                                                        <p className="text-xs leading-relaxed whitespace-pre-line">{detailApp.cover_letter}</p>
                                                    )}
                                                    {detailApp.source_note && detailApp.cover_letter && <Separator />}
                                                    {detailApp.source_note && (
                                                        <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                                                            <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                                                            {detailApp.source_note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Status update */}
                                        {can('applications.update') && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cap nhat trang thai</h4>
                                                <Select
                                                    value={detailApp.status}
                                                    onValueChange={(v) => {
                                                        handleUpdateStatus(detailApp.id, v);
                                                        setDetailApp({ ...detailApp, status: v as Application['status'] });
                                                    }}
                                                >
                                                    <SelectTrigger className="h-9 text-xs w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Cho xu ly</SelectItem>
                                                        <SelectItem value="reviewing">Dang xem xet</SelectItem>
                                                        <SelectItem value="shortlisted">Danh sach ngan</SelectItem>
                                                        <SelectItem value="accepted">Chap nhan</SelectItem>
                                                        <SelectItem value="rejected">Tu choi</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>

                                    <DialogFooter className="mt-3">
                                        <Button variant="outline" size="sm" onClick={() => setDetailApp(null)}>
                                            Dong
                                        </Button>
                                        {detailApp.resume_url && (
                                            <a href={detailApp.resume_url} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" className="gap-1.5">
                                                    <ScrollText className="h-3.5 w-3.5" />
                                                    Xem CV
                                                </Button>
                                            </a>
                                        )}
                                    </DialogFooter>
                                </>
                            );
                        })()}
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
