import PublicLayout from '@/Layouts/PublicLayout';
import { Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import StatusBadge from '@/Components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    MapPin,
    Clock,
    DollarSign,
    Eye,
    Briefcase,
    Calendar,
    Users,
    BookmarkPlus,
    BookmarkCheck,
    Send,
    Building2,
    GraduationCap,
    ChevronRight,
    Share2,
    ArrowRight,
    CheckCircle2,
    FileText,
    Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { JobPost, PageProps } from '@/types';

interface JobShowProps {
    jobPost: JobPost;
    relatedJobs: JobPost[];
    hasApplied: boolean;
    isSaved: boolean;
}

const jobTypeLabels: Record<string, string> = {
    seasonal: 'Thoi vu',
    office: 'Van phong',
};

const jobTypeColors: Record<string, string> = {
    seasonal: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    office: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

export default function JobShow({ jobPost, relatedJobs, hasApplied, isSaved }: JobShowProps) {
    const { auth } = usePage<PageProps>().props;
    const isCandidate = auth.user?.roles?.includes('candidate');

    const handleApply = () => {
        router.post(`/viec-lam/${jobPost.slug}/apply`);
    };

    const handleToggleSave = () => {
        router.post(`/viec-lam/${jobPost.slug}/save`);
    };

    const salaryText = (() => {
        if (jobPost.salary_min && jobPost.salary_max) {
            return `${formatCurrency(jobPost.salary_min)} - ${formatCurrency(jobPost.salary_max)}`;
        }
        if (jobPost.salary_min) return `Tu ${formatCurrency(jobPost.salary_min)}`;
        if (jobPost.salary_max) return `Den ${formatCurrency(jobPost.salary_max)}`;
        return 'Thuong luong';
    })();

    const locationText = [jobPost.location, jobPost.district, jobPost.city]
        .filter(Boolean)
        .join(', ') || 'Chua cap nhat';

    const infoItems = [
        { icon: DollarSign, label: 'Muc luong', value: salaryText, color: 'emerald' },
        { icon: MapPin, label: 'Dia diem', value: locationText, color: 'blue' },
        { icon: Briefcase, label: 'Loai hinh', value: jobTypeLabels[jobPost.job_type] || jobPost.job_type, color: 'purple' },
        jobPost.work_schedule ? { icon: Calendar, label: 'Lich lam viec', value: jobPost.work_schedule, color: 'orange' } : null,
        jobPost.experience_level ? { icon: GraduationCap, label: 'Kinh nghiem', value: jobPost.experience_level, color: 'teal' } : null,
        jobPost.deadline ? { icon: Clock, label: 'Han nop', value: formatDate(jobPost.deadline), color: 'red' } : null,
        jobPost.slots ? { icon: Users, label: 'So luong tuyen', value: `${jobPost.slots} nguoi`, color: 'indigo' } : null,
        { icon: Eye, label: 'Luot xem', value: `${jobPost.views_count}`, color: 'stone' },
    ].filter(Boolean) as { icon: typeof DollarSign; label: string; value: string; color: string }[];

    const colorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', darkBg: 'dark:bg-emerald-500/10', darkText: 'dark:text-emerald-400' },
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', darkBg: 'dark:bg-blue-500/10', darkText: 'dark:text-blue-400' },
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-600', darkBg: 'dark:bg-purple-500/10', darkText: 'dark:text-purple-400' },
        orange: { bg: 'bg-orange-500/10', text: 'text-orange-600', darkBg: 'dark:bg-orange-500/10', darkText: 'dark:text-orange-400' },
        teal: { bg: 'bg-teal-500/10', text: 'text-teal-600', darkBg: 'dark:bg-teal-500/10', darkText: 'dark:text-teal-400' },
        red: { bg: 'bg-red-500/10', text: 'text-red-600', darkBg: 'dark:bg-red-500/10', darkText: 'dark:text-red-400' },
        indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', darkBg: 'dark:bg-indigo-500/10', darkText: 'dark:text-indigo-400' },
        stone: { bg: 'bg-stone-500/10', text: 'text-stone-600', darkBg: 'dark:bg-stone-500/10', darkText: 'dark:text-stone-400' },
    };

    return (
        <PublicLayout title={jobPost.title}>
            {/* Hero Banner */}
            <section className="relative overflow-hidden bg-stone-950 pt-24 pb-14 md:pt-28 md:pb-20">
                {/* Ambient glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/[0.06] rounded-full blur-[140px]" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/[0.03] rounded-full blur-[160px]" />
                </div>

                <div className="container relative z-10">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center gap-1.5 text-xs text-stone-500 mb-6"
                    >
                        <Link href="/" className="hover:text-stone-300 transition-colors">Trang chu</Link>
                        <ChevronRight className="h-3 w-3" />
                        <Link href="/viec-lam" className="hover:text-stone-300 transition-colors">Viec lam</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-stone-400 truncate max-w-[200px]">{jobPost.title}</span>
                    </motion.div>

                    {/* Header content */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.05 }}
                            className="flex-1 max-w-3xl"
                        >
                            {/* Company info */}
                            {jobPost.employer && (
                                <div className="flex items-center gap-3 mb-4">
                                    {jobPost.employer.avatar ? (
                                        <img
                                            src={jobPost.employer.avatar}
                                            alt={jobPost.employer.name}
                                            className="h-12 w-12 rounded-xl object-cover border border-white/10"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-stone-700 to-stone-800 border border-white/10 flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-stone-400" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {jobPost.employer.employer_profile?.company_name || jobPost.employer.name}
                                        </p>
                                        {jobPost.employer.employer_profile?.industry && (
                                            <p className="text-xs text-stone-500">
                                                {jobPost.employer.employer_profile.industry}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Job title */}
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
                                {jobPost.title}
                            </h1>

                            {/* Quick meta badges */}
                            <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={jobPost.status} />
                                <Badge
                                    variant="outline"
                                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${jobTypeColors[jobPost.job_type] || ''}`}
                                >
                                    {jobTypeLabels[jobPost.job_type] || jobPost.job_type}
                                </Badge>
                                {jobPost.category && (
                                    <Badge variant="outline" className="text-xs font-medium px-2.5 py-0.5 rounded-md border-stone-700 text-stone-400">
                                        {jobPost.category.name}
                                    </Badge>
                                )}
                            </div>
                        </motion.div>

                        {/* Hero action buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="flex items-center gap-2 shrink-0"
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleSave}
                                className="rounded-xl border-white/10 bg-white/[0.06] text-stone-300 hover:bg-white/[0.1] hover:text-white transition-all"
                            >
                                {isSaved ? (
                                    <><BookmarkCheck className="mr-2 h-4 w-4 text-amber-400" /> Da luu</>
                                ) : (
                                    <><BookmarkPlus className="mr-2 h-4 w-4" /> Luu tin</>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-white/10 bg-white/[0.06] text-stone-300 hover:bg-white/[0.1] hover:text-white transition-all"
                                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                            >
                                <Share2 className="mr-2 h-4 w-4" />
                                Chia se
                            </Button>
                        </motion.div>
                    </div>

                    {/* Glassmorphism Stats Strip */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3"
                    >
                        <div className="rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/[0.08] px-4 py-3">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="h-4 w-4 text-emerald-400" />
                                <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">Luong</span>
                            </div>
                            <p className="text-sm font-bold text-emerald-400 truncate">{salaryText}</p>
                        </div>
                        <div className="rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/[0.08] px-4 py-3">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-blue-400" />
                                <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">Dia diem</span>
                            </div>
                            <p className="text-sm font-bold text-white truncate">{jobPost.city || 'Chua cap nhat'}</p>
                        </div>
                        <div className="rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/[0.08] px-4 py-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-amber-400" />
                                <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">Han nop</span>
                            </div>
                            <p className="text-sm font-bold text-white">{jobPost.deadline ? formatDate(jobPost.deadline) : 'Khong gioi han'}</p>
                        </div>
                        <div className="rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/[0.08] px-4 py-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="h-4 w-4 text-purple-400" />
                                <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">Can tuyen</span>
                            </div>
                            <p className="text-sm font-bold text-white">{jobPost.slots ? `${jobPost.slots} nguoi` : 'Khong gioi han'}</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main content area */}
            <section className="bg-stone-50 dark:bg-stone-950 min-h-[50vh]">
                <div className="container py-8 lg:py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Content */}
                        <motion.div
                            className="lg:col-span-2 space-y-6"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Job Details Grid */}
                            <motion.div variants={staggerItem}>
                                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
                                    <div className="px-6 py-5 border-b border-stone-100 dark:border-stone-800">
                                        <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                            <div className="w-1 h-5 rounded-full bg-amber-500" />
                                            Thong tin chung
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {infoItems.map((item, index) => {
                                                const colors = colorMap[item.color] || colorMap.stone;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800/60"
                                                    >
                                                        <div className={`h-10 w-10 rounded-xl ${colors.bg} ${colors.darkBg} flex items-center justify-center shrink-0`}>
                                                            <item.icon className={`h-5 w-5 ${colors.text} ${colors.darkText}`} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                                                                {item.label}
                                                            </p>
                                                            <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">
                                                                {item.value}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Job Description */}
                            <motion.div variants={staggerItem}>
                                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
                                    <div className="px-6 py-5 border-b border-stone-100 dark:border-stone-800">
                                        <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                            <div className="w-1 h-5 rounded-full bg-blue-500" />
                                            Mo ta cong viec
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <div
                                            className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-stone-900 dark:prose-headings:text-white prose-p:text-stone-600 dark:prose-p:text-stone-400 prose-li:text-stone-600 dark:prose-li:text-stone-400 prose-strong:text-stone-800 dark:prose-strong:text-stone-200"
                                            dangerouslySetInnerHTML={{ __html: jobPost.description }}
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Requirements */}
                            {jobPost.requirements && (
                                <motion.div variants={staggerItem}>
                                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
                                        <div className="px-6 py-5 border-b border-stone-100 dark:border-stone-800">
                                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                                <div className="w-1 h-5 rounded-full bg-purple-500" />
                                                Yeu cau ung vien
                                            </h2>
                                        </div>
                                        <div className="p-6">
                                            <div
                                                className="prose prose-sm dark:prose-invert max-w-none prose-p:text-stone-600 dark:prose-p:text-stone-400 prose-li:text-stone-600 dark:prose-li:text-stone-400"
                                                dangerouslySetInnerHTML={{ __html: jobPost.requirements }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Benefits */}
                            {jobPost.benefits && (
                                <motion.div variants={staggerItem}>
                                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
                                        <div className="px-6 py-5 border-b border-stone-100 dark:border-stone-800">
                                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                                <div className="w-1 h-5 rounded-full bg-emerald-500" />
                                                Quyen loi
                                            </h2>
                                        </div>
                                        <div className="p-6">
                                            <div
                                                className="prose prose-sm dark:prose-invert max-w-none prose-p:text-stone-600 dark:prose-p:text-stone-400 prose-li:text-stone-600 dark:prose-li:text-stone-400"
                                                dangerouslySetInnerHTML={{ __html: jobPost.benefits }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Apply Card - Sticky */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="lg:sticky lg:top-28"
                            >
                                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm">
                                    {/* Gradient accent bar */}
                                    <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />

                                    <div className="p-6">
                                        {auth.user && isCandidate ? (
                                            <div className="space-y-4">
                                                {hasApplied ? (
                                                    <>
                                                        <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                                                Da ung tuyen thanh cong
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-center text-stone-500">
                                                            Ho so cua ban da duoc gui den nha tuyen dung. Theo doi trang thai tai muc "Don ung tuyen".
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02]"
                                                            onClick={handleApply}
                                                        >
                                                            <Send className="mr-2 h-4.5 w-4.5" />
                                                            Ung tuyen ngay
                                                        </Button>
                                                        <p className="text-xs text-center text-stone-500">
                                                            Nhan nut de gui ho so ung tuyen cua ban
                                                        </p>
                                                    </>
                                                )}

                                                <Separator className="my-2" />

                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 rounded-lg"
                                                        onClick={handleToggleSave}
                                                    >
                                                        {isSaved
                                                            ? <><BookmarkCheck className="mr-1.5 h-3.5 w-3.5 text-amber-500" /> Da luu</>
                                                            : <><BookmarkPlus className="mr-1.5 h-3.5 w-3.5" /> Luu tin</>
                                                        }
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 rounded-lg"
                                                        onClick={() => navigator.clipboard?.writeText(window.location.href)}
                                                    >
                                                        <Share2 className="mr-1.5 h-3.5 w-3.5" />
                                                        Chia se
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : auth.user ? (
                                            <div className="text-center space-y-3 py-2">
                                                <div className="h-14 w-14 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3">
                                                    <FileText className="h-7 w-7 text-stone-400" />
                                                </div>
                                                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                                                    Chi tai khoan ung vien moi co the ung tuyen.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-4 py-2">
                                                <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                                                    <Send className="h-7 w-7 text-amber-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1">
                                                        Ung tuyen ngay hom nay
                                                    </p>
                                                    <p className="text-xs text-stone-500">
                                                        Dang nhap de gui ho so ung tuyen
                                                    </p>
                                                </div>
                                                <Button
                                                    className="w-full h-11 font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg shadow-amber-500/20"
                                                    asChild
                                                >
                                                    <Link href="/login">Dang nhap</Link>
                                                </Button>
                                                <p className="text-xs text-stone-500">
                                                    Chua co tai khoan?{' '}
                                                    <Link href="/register" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">
                                                        Dang ky mien phi
                                                    </Link>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Company Info Card */}
                                {jobPost.employer && (
                                    <div className="mt-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
                                        <div className="px-6 py-5 border-b border-stone-100 dark:border-stone-800">
                                            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                                <div className="w-1 h-4 rounded-full bg-amber-500" />
                                                Thong tin cong ty
                                            </h3>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-center gap-3 mb-4">
                                                {jobPost.employer.avatar ? (
                                                    <img
                                                        src={jobPost.employer.avatar}
                                                        alt={jobPost.employer.name}
                                                        className="h-12 w-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-800/50 border border-stone-200/50 dark:border-stone-700/50 flex items-center justify-center">
                                                        <Building2 className="h-6 w-6 text-stone-400" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-stone-900 dark:text-white truncate">
                                                        {jobPost.employer.employer_profile?.company_name || jobPost.employer.name}
                                                    </p>
                                                    {jobPost.employer.employer_profile?.industry && (
                                                        <p className="text-xs text-stone-500 truncate">
                                                            {jobPost.employer.employer_profile.industry}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {jobPost.employer.employer_profile?.company_size && (
                                                <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span>Quy mo: {jobPost.employer.employer_profile.company_size}</span>
                                                </div>
                                            )}
                                            {jobPost.employer.employer_profile?.address && (
                                                <div className="flex items-center gap-2 text-xs text-stone-500">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    <span className="truncate">{jobPost.employer.employer_profile.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Related Jobs */}
                                {(relatedJobs ?? []).length > 0 && (
                                    <div className="mt-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
                                        <div className="px-6 py-5 border-b border-stone-100 dark:border-stone-800">
                                            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                                <div className="w-1 h-4 rounded-full bg-blue-500" />
                                                Viec lam lien quan
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-stone-100 dark:divide-stone-800">
                                            {(relatedJobs ?? []).map((job) => (
                                                <Link
                                                    key={job.id}
                                                    href={`/viec-lam/${job.slug}`}
                                                    className="block px-5 py-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group"
                                                >
                                                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-1.5">
                                                        {job.title}
                                                    </p>
                                                    {job.employer?.employer_profile?.company_name && (
                                                        <p className="text-xs text-stone-500 mb-2 truncate">
                                                            {job.employer.employer_profile.company_name}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-3 text-[11px] text-stone-400">
                                                        {job.city && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {job.city}
                                                            </span>
                                                        )}
                                                        {(job.salary_min || job.salary_max) && (
                                                            <span className="flex items-center gap-1 text-emerald-500">
                                                                <DollarSign className="h-3 w-3" />
                                                                {job.salary_min
                                                                    ? formatCurrency(job.salary_min)
                                                                    : formatCurrency(job.salary_max!)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="px-5 py-3 border-t border-stone-100 dark:border-stone-800">
                                            <Link
                                                href="/viec-lam"
                                                className="flex items-center justify-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                                            >
                                                Xem tat ca viec lam
                                                <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
