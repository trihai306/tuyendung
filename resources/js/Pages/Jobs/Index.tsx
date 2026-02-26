import PublicLayout from '@/Layouts/PublicLayout';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import Pagination from '@/Components/Pagination';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    Search,
    MapPin,
    Clock,
    DollarSign,
    Eye,
    Briefcase,
    Building2,
    ArrowRight,
    SlidersHorizontal,
    TrendingUp,
    Users,
    Zap,
    X,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { JobPost, JobCategory, PaginationMeta } from '@/types';

interface LaravelPagination<T> extends PaginationMeta {
    data: T[];
}

interface JobsIndexProps {
    jobs: LaravelPagination<JobPost>;
    filters: Record<string, string> | unknown[];
    categories: JobCategory[];
}

const jobTypeLabels: Record<string, string> = {
    seasonal: 'Thời vụ',
    office: 'Văn phòng',
};

const jobTypeColors: Record<string, string> = {
    seasonal: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    office: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

export default function JobsIndex({ jobs, filters: initialFilters, categories }: JobsIndexProps) {
    const safeInitialFilters = (initialFilters && typeof initialFilters === 'object' && !Array.isArray(initialFilters))
        ? initialFilters
        : {};
    const [filters, setFilters] = useState<Record<string, string>>(safeInitialFilters);
    const [showFilters, setShowFilters] = useState(false);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        const params: Record<string, string> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        router.get('/viec-lam', params, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setFilters({});
        router.get('/viec-lam', {}, { preserveState: true, preserveScroll: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleApply();
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <PublicLayout title="Việc làm">
            {/* Hero Banner */}
            <section className="relative overflow-hidden bg-stone-950 pt-24 pb-12 md:pt-28 md:pb-16">
                {/* Ambient */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-amber-500/[0.06] rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-blue-500/[0.04] rounded-full blur-[100px]" />
                </div>

                <div className="container relative z-10">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center gap-1.5 text-xs text-stone-500 mb-6"
                    >
                        <Link href="/" className="hover:text-stone-300 transition-colors">Trang chủ</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-stone-300">Việc làm</span>
                    </motion.div>

                    <div className="max-w-2xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.05 }}
                            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 leading-[1.1]"
                        >
                            Tìm{' '}
                            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                                việc làm
                            </span>{' '}
                            phù hợp
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-stone-400 text-base md:text-lg leading-relaxed mb-8"
                        >
                            Khám phá hàng nghìn cơ hội việc làm từ các nhà tuyển dụng uy tín trên toàn quốc.
                        </motion.p>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="flex gap-2"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-500" />
                                <Input
                                    placeholder="Tìm theo từ khóa, vị trí, công ty..."
                                    value={filters.search || ''}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="h-12 pl-11 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-stone-500 rounded-xl focus:bg-white/[0.1] focus:border-amber-500/30 transition-all"
                                />
                            </div>
                            <Button
                                onClick={handleApply}
                                className="h-12 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/20"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Tìm kiếm
                            </Button>
                        </motion.div>

                        {/* Quick stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex items-center gap-5 mt-6 text-xs text-stone-500"
                        >
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5 text-amber-400" />
                                <span>{jobs.total} việc làm</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Cập nhật hàng ngày</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Zap className="h-3.5 w-3.5 text-blue-400" />
                                <span>Ứng tuyển nhanh</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="bg-stone-50 dark:bg-stone-950 min-h-[60vh]">
                <div className="container py-8">
                    {/* Filter Toggle + Active Filters */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="rounded-lg gap-2"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Bộ lọc
                                {activeFilterCount > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>

                            {activeFilterCount > 0 && (
                                <button
                                    onClick={handleReset}
                                    className="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-1 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                    Xóa lọc
                                </button>
                            )}
                        </div>

                        <p className="text-sm text-stone-500 hidden sm:block">
                            Hiển thị <span className="font-semibold text-stone-700 dark:text-stone-300">{jobs.data.length}</span> / {jobs.total} kết quả
                        </p>
                    </div>

                    {/* Expandable Filters */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">Thành phố</label>
                                    <Input
                                        placeholder="VD: Hà Nội, HCM..."
                                        value={filters.city || ''}
                                        onChange={(e) => handleFilterChange('city', e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="h-10 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">Loại hình</label>
                                    <Select
                                        value={filters.job_type || ''}
                                        onValueChange={(v) => handleFilterChange('job_type', v === '_all' ? '' : v)}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg">
                                            <SelectValue placeholder="Tất cả" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_all">Tất cả</SelectItem>
                                            <SelectItem value="seasonal">Thời vụ</SelectItem>
                                            <SelectItem value="office">Văn phòng</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">Ngành nghề</label>
                                    <Select
                                        value={filters.category_id || ''}
                                        onValueChange={(v) => handleFilterChange('category_id', v === '_all' ? '' : v)}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg">
                                            <SelectValue placeholder="Tất cả" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_all">Tất cả</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">Kinh nghiệm</label>
                                    <Input
                                        placeholder="VD: 1 năm..."
                                        value={filters.experience_level || ''}
                                        onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="h-10 rounded-lg"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                                <Button variant="ghost" size="sm" onClick={handleReset}>
                                    <X className="h-3.5 w-3.5 mr-1" />
                                    Xóa lọc
                                </Button>
                                <Button size="sm" onClick={handleApply} className="bg-amber-500 hover:bg-amber-600 text-white">
                                    <Search className="h-3.5 w-3.5 mr-1" />
                                    Áp dụng
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Job Cards Grid */}
                    {jobs.data.length > 0 ? (
                        <>
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                            >
                                {jobs.data.map((job) => (
                                    <motion.div key={job.id} variants={staggerItem}>
                                        <Link href={`/viec-lam/${job.slug}`} className="block group">
                                            <div className="relative h-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-stone-900/50 hover:border-amber-500/20 hover:-translate-y-0.5">
                                                {/* Top row: Company + Type badge */}
                                                <div className="flex items-start justify-between gap-3 mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-800/50 border border-stone-200/50 dark:border-stone-700/50 shrink-0">
                                                            <Building2 className="h-5 w-5 text-stone-400 dark:text-stone-500" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 truncate">
                                                                {job.employer?.employer_profile?.company_name || 'Công ty'}
                                                            </p>
                                                            {job.category && (
                                                                <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate">
                                                                    {job.category.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md ${jobTypeColors[job.job_type] || ''}`}
                                                    >
                                                        {jobTypeLabels[job.job_type] || job.job_type}
                                                    </Badge>
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-2 mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                                                    {job.title}
                                                </h3>

                                                {/* Info rows */}
                                                <div className="space-y-2 mb-4">
                                                    {(job.salary_min || job.salary_max) && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
                                                                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                                                            </div>
                                                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                                {job.salary_min && job.salary_max
                                                                    ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                                                                    : job.salary_min
                                                                        ? `Từ ${formatCurrency(job.salary_min)}`
                                                                        : `Đến ${formatCurrency(job.salary_max!)}`}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {job.city && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10">
                                                                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                                            </div>
                                                            <span className="text-sm text-stone-600 dark:text-stone-400">
                                                                {job.district ? `${job.district}, ${job.city}` : job.city}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Bottom row */}
                                                <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                                                    <div className="flex items-center gap-3 text-[11px] text-stone-400">
                                                        {job.deadline && (
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{formatDate(job.deadline)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <Eye className="h-3 w-3" />
                                                            <span>{job.views_count}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span>Xem chi tiết</span>
                                                        <ArrowRight className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Pagination */}
                            <div className="mt-8">
                                <Pagination data={jobs} />
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 mb-5">
                                <Briefcase className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-700 dark:text-stone-300 mb-2">
                                Không tìm thấy việc làm
                            </h3>
                            <p className="text-sm text-stone-500 mb-6 max-w-sm">
                                Thử thay đổi bộ lọc để tìm kiếm kết quả phù hợp hơn.
                            </p>
                            <Button variant="outline" onClick={handleReset} className="rounded-lg">
                                <X className="h-4 w-4 mr-1.5" />
                                Xóa bộ lọc
                            </Button>
                        </motion.div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
