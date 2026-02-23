import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PermissionGate from '@/Components/PermissionGate';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';
import StatusBadge from '@/Components/StatusBadge';
import TeamService from '@/services/TeamService';
import {
    UserPlus,
    Shield,
    Crown,
    Users,
    Trash2,
    Copy,
    RefreshCw,
    CheckCircle2,
    Key,
    Search,
    MoreHorizontal,
    Mail,
    Calendar,
    Building2,
    XCircle,
    UserCircle,
    Loader2,
    Send,
} from 'lucide-react';
import type { CompanyMember, EmployerProfile, PageProps } from '@/types';
import { useState, useMemo } from 'react';
import { usePermission } from '@/hooks/usePermission';

interface Props {
    members: CompanyMember[];
    company: EmployerProfile;
    currentUserRole: string | null;
    inviteCode: string;
}

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Crown; color: string; bg: string }> = {
    owner: {
        label: 'Chu cong ty',
        icon: Crown,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20',
    },
    manager: {
        label: 'Quan ly',
        icon: Shield,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20',
    },
    member: {
        label: 'Nhan vien',
        icon: Users,
        color: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-500/10 border-slate-500/20',
    },
};

const STAT_CARDS = [
    {
        key: 'total',
        label: 'Tong thanh vien',
        icon: Users,
        gradient: 'from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40',
        iconBg: 'bg-indigo-500/10',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        valueColor: 'text-indigo-700 dark:text-indigo-300',
        borderColor: 'border-indigo-500/10 dark:border-indigo-500/20',
    },
    {
        key: 'managers',
        label: 'Quan ly',
        icon: Shield,
        gradient: 'from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40',
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-600 dark:text-amber-400',
        valueColor: 'text-amber-700 dark:text-amber-300',
        borderColor: 'border-amber-500/10 dark:border-amber-500/20',
    },
    {
        key: 'pending',
        label: 'Cho duyet',
        icon: UserPlus,
        gradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40',
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        valueColor: 'text-emerald-700 dark:text-emerald-300',
        borderColor: 'border-emerald-500/10 dark:border-emerald-500/20',
    },
];

type TabKey = 'active' | 'pending';

export default function Index({ members, company, currentUserRole, inviteCode }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<TabKey>('active');
    const canManage = currentUserRole === 'owner' || currentUserRole === 'manager';
    const { can, isOwner } = usePermission();

    const inviteForm = useForm({
        email: '',
        name: '',
        role: 'member',
    });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        inviteForm.post(route('employer.team.store'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsInviteOpen(false);
                inviteForm.reset();
            },
        });
    };

    const handleRoleUpdate = (memberId: number, role: string) => {
        TeamService.updateRole(memberId, role);
    };

    const handleRemove = (memberId: number) => {
        TeamService.removeMember(memberId);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerateCode = () => {
        router.post(route('employer.team.regenerate-code'), {}, {
            preserveScroll: true,
        });
    };

    const activeMembers = useMemo(() => members.filter(m => m.status === 'active'), [members]);
    const pendingMembers = useMemo(() => members.filter(m => m.status === 'pending'), [members]);

    const managersCount = useMemo(
        () => activeMembers.filter(m => m.role === 'manager' || m.role === 'owner').length,
        [activeMembers],
    );

    const statValues: Record<string, number> = {
        total: activeMembers.length,
        managers: managersCount,
        pending: pendingMembers.length,
    };

    const displayedMembers = useMemo(() => {
        const source = activeTab === 'active' ? activeMembers : pendingMembers;
        if (!searchQuery.trim()) return source;
        const q = searchQuery.toLowerCase();
        return source.filter(
            (m) =>
                m.user?.name?.toLowerCase().includes(q) ||
                m.user?.email?.toLowerCase().includes(q),
        );
    }, [activeTab, activeMembers, pendingMembers, searchQuery]);

    const TABS: { key: TabKey; label: string; count: number }[] = [
        { key: 'active', label: 'Dang hoat dong', count: activeMembers.length },
        { key: 'pending', label: 'Cho duyet', count: pendingMembers.length },
    ];

    return (
        <AuthenticatedLayout title="Quan ly doi ngu" header="Quan ly doi ngu">
            <Head title="Quan ly doi ngu" />

            <PermissionGate permission="team.view">
                <div className="space-y-6">
                    {/* Success Message */}
                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            {flash.success}
                        </div>
                    )}

                    {/* Hero Header */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8">
                        {/* Decorative elements */}
                        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                                    <Building2 className="h-7 w-7 text-white/90" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">
                                        {company.company_name || 'Doi ngu cua ban'}
                                    </h1>
                                    <p className="mt-0.5 text-sm text-white/60">
                                        Quan ly va to chuc doi ngu tuyen dung hieu qua
                                    </p>
                                </div>
                            </div>

                            {can('team.invite') && (
                                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2 bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-sm">
                                            <UserPlus className="h-4 w-4" />
                                            Moi thanh vien
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
                                        {/* Header */}
                                        <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 px-6 pt-6 pb-5">
                                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtNGgydjRoNHYyaC00djRoLTJ2LTR6bS0yMi0yaC0ydi00aDJ2LTRoMnY0aDR2MmgtNHY0aC0ydi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
                                            <div className="relative flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                                                    <UserPlus className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Moi thanh vien</h3>
                                                    <p className="text-xs text-white/70 mt-0.5">Gui loi moi tham gia doi ngu tuyen dung</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form */}
                                        <form onSubmit={handleInvite} className="p-6 space-y-5">
                                            {/* Email */}
                                            <div className="space-y-2">
                                                <Label htmlFor="invite-email" className="text-sm font-semibold text-foreground/80">
                                                    Dia chi email
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                    <Input
                                                        id="invite-email"
                                                        type="email"
                                                        placeholder="ten@congty.com"
                                                        className="pl-10 h-11 rounded-xl border-border/60 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
                                                        value={inviteForm.data.email}
                                                        onChange={e => inviteForm.setData('email', e.target.value)}
                                                    />
                                                </div>
                                                {inviteForm.errors.email && (
                                                    <p className="text-xs text-destructive flex items-center gap-1">
                                                        <XCircle className="h-3 w-3" />
                                                        {inviteForm.errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor="invite-name" className="text-sm font-semibold text-foreground/80">
                                                    Ho va ten
                                                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">(khong bat buoc)</span>
                                                </Label>
                                                <div className="relative">
                                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                    <Input
                                                        id="invite-name"
                                                        placeholder="Nguyen Van A"
                                                        className="pl-10 h-11 rounded-xl border-border/60 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
                                                        value={inviteForm.data.name}
                                                        onChange={e => inviteForm.setData('name', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Role Selection Cards */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-foreground/80">Vai tro</Label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => inviteForm.setData('role', 'manager')}
                                                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 hover:shadow-md ${inviteForm.data.role === 'manager'
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-sm'
                                                            : 'border-border/60 hover:border-indigo-300 dark:hover:border-indigo-700'
                                                            }`}
                                                    >
                                                        {inviteForm.data.role === 'manager' && (
                                                            <div className="absolute top-2 right-2">
                                                                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                                                            </div>
                                                        )}
                                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${inviteForm.data.role === 'manager'
                                                            ? 'bg-indigo-500/15'
                                                            : 'bg-muted/50'
                                                            }`}>
                                                            <Shield className="h-5 w-5 text-indigo-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold">Quan ly</p>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                                                                Tao tin, quan ly ung vien
                                                            </p>
                                                        </div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => inviteForm.setData('role', 'member')}
                                                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 hover:shadow-md ${inviteForm.data.role === 'member'
                                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm'
                                                            : 'border-border/60 hover:border-emerald-300 dark:hover:border-emerald-700'
                                                            }`}
                                                    >
                                                        {inviteForm.data.role === 'member' && (
                                                            <div className="absolute top-2 right-2">
                                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                            </div>
                                                        )}
                                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${inviteForm.data.role === 'member'
                                                            ? 'bg-emerald-500/15'
                                                            : 'bg-muted/50'
                                                            }`}>
                                                            <UserCircle className="h-5 w-5 text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold">Nhan vien</p>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                                                                Xem tin, ho tro tuyen dung
                                                            </p>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1 h-11 rounded-xl border-border/60"
                                                    onClick={() => setIsInviteOpen(false)}
                                                >
                                                    Huy bo
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={inviteForm.processing || !inviteForm.data.email}
                                                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200"
                                                >
                                                    {inviteForm.processing ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            Dang gui...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="h-4 w-4 mr-2" />
                                                            Gui loi moi
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        {/* Invite Code Strip (inside hero) */}
                        {can('team.invite') && inviteCode && (
                            <div className="relative mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-5 py-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 shrink-0">
                                        <Key className="h-4 w-4 text-indigo-300" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-white/80">Ma tham gia doi ngu</p>
                                        <p className="text-[11px] text-white/40 mt-0.5 truncate">
                                            Chia se ma nay de nhan vien tham gia cong ty
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center rounded-lg bg-white/10 px-4 py-2 border border-white/10">
                                        <span className="font-mono text-lg font-bold tracking-[0.35em] text-white select-all">
                                            {inviteCode}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10"
                                        onClick={handleCopyCode}
                                    >
                                        {copied ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                    {isOwner && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Tao ma moi?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Ma cu se het hieu luc. Nhan vien moi se can dung ma moi de tham gia.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Huy</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleRegenerateCode}>
                                                        Tao ma moi
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {STAT_CARDS.map((stat) => (
                            <Card
                                key={stat.key}
                                className={`border shadow-sm bg-gradient-to-br ${stat.gradient} ${stat.borderColor} hover:-translate-y-0.5 transition-all duration-200`}
                            >
                                <CardContent className="pt-5 pb-4 px-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                                            <p className={`text-2xl font-bold mt-1 tabular-nums ${stat.valueColor}`}>
                                                {statValues[stat.key]}
                                            </p>
                                        </div>
                                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg}`}>
                                            <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Members Section */}
                    <Card className="border-none shadow-sm overflow-hidden">
                        {/* Toolbar */}
                        <div className="border-b border-border/50 px-5 pt-4 pb-0">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-0">
                                {/* Tabs */}
                                <div className="flex items-center gap-1">
                                    {TABS.map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`
                                            relative px-4 py-2.5 text-xs font-medium transition-colors
                                            ${activeTab === tab.key
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground/80'
                                                }
                                        `}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                {tab.label}
                                                <span
                                                    className={`
                                                    inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold
                                                    ${activeTab === tab.key
                                                            ? 'bg-foreground/10 text-foreground'
                                                            : 'bg-muted text-muted-foreground'
                                                        }
                                                `}
                                                >
                                                    {tab.count}
                                                </span>
                                            </span>
                                            {/* Active indicator */}
                                            {activeTab === tab.key && (
                                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Search */}
                                <div className="relative w-full sm:w-64 mb-3 sm:mb-0">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Tim thanh vien..."
                                        className="pl-9 h-9 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Member List */}
                        <CardContent className="p-0">
                            {displayedMembers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 px-6">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                                        <Users className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-sm font-semibold mb-1">
                                        {searchQuery
                                            ? 'Khong tim thay thanh vien'
                                            : activeTab === 'pending'
                                                ? 'Khong co yeu cau cho duyet'
                                                : 'Chua co thanh vien nao'}
                                    </h3>
                                    <p className="text-xs text-muted-foreground text-center max-w-sm">
                                        {searchQuery
                                            ? 'Thu tim kiem voi tu khoa khac'
                                            : activeTab === 'pending'
                                                ? 'Cac yeu cau tham gia se hien thi o day'
                                                : 'Chia se ma tham gia de nhan vien bat dau gia nhap doi ngu'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/40">
                                    {displayedMembers.map((member) => {
                                        const roleConfig = ROLE_CONFIG[member.role];
                                        const RoleIcon = roleConfig?.icon || Users;

                                        return (
                                            <div
                                                key={member.id}
                                                className="group flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
                                            >
                                                {/* Left: Avatar + Info */}
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <Avatar className="h-11 w-11 shrink-0">
                                                        <AvatarImage src={member.user?.avatar} />
                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-bold">
                                                            {member.user?.name?.charAt(0)?.toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="text-sm font-semibold truncate">
                                                                {member.user?.name}
                                                            </p>
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-[10px] gap-1 border ${roleConfig?.bg || ''} ${roleConfig?.color || ''}`}
                                                            >
                                                                <RoleIcon className="h-3 w-3" />
                                                                {roleConfig?.label || member.role}
                                                            </Badge>
                                                            {member.status === 'pending' && (
                                                                <StatusBadge status="pending" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                                                                <Mail className="h-3 w-3 shrink-0" />
                                                                {member.user?.email}
                                                            </span>
                                                            {member.created_at && (
                                                                <span className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground/70 shrink-0">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {new Date(member.created_at).toLocaleDateString('vi-VN')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="flex items-center gap-2 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    {/* Role change - only owner can change */}
                                                    {isOwner && member.role !== 'owner' && member.status === 'active' && (
                                                        <Select
                                                            value={member.role}
                                                            onValueChange={(v) => handleRoleUpdate(member.id, v)}
                                                        >
                                                            <SelectTrigger className="h-8 w-[120px] text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="manager">Quan ly</SelectItem>
                                                                <SelectItem value="member">Nhan vien</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}

                                                    {/* Remove button */}
                                                    {canManage && member.role !== 'owner' && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Xoa thanh vien</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Ban co chac chan muon xoa {member.user?.name} khoi doi ngu?
                                                                        Hanh dong nay khong the hoan tac.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Huy</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleRemove(member.id)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Xoa
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </PermissionGate>
        </AuthenticatedLayout >
    );
}
