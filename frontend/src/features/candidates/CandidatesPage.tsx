import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useGetCandidatesQuery, useUpdateCandidateMutation, useCreateCandidateMutation, useDeleteCandidateMutation } from './candidatesApi';
import type { Candidate, CandidateFilters, CreateCandidateData, UpdateCandidateData } from './candidatesApi';
import {
    MagnifyingGlassIcon,
    UsersIcon,
    UserPlusIcon,
    StarIcon,
    XMarkIcon,
    PhoneIcon,
    EnvelopeIcon,
    DocumentTextIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PencilIcon,
    TrashIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
    CalendarIcon,
    SparklesIcon,
    FunnelIcon,
    CheckCircleIcon,
} from '../../components/ui/icons';
import { CandidateModal } from './CandidateModal';
import { ConfirmDialog } from './ConfirmDialog';


const SOURCE_OPTIONS = [
    { value: '', label: 'Tất cả nguồn' },
    { value: 'chat', label: 'Zalo' },
    { value: 'manual', label: 'Thủ công' },
    { value: 'import', label: 'Import' },
    { value: 'referral', label: 'Giới thiệu' },
];

const STATUS_OPTIONS: { value: string; label: string; icon: React.ReactNode }[] = [
    { value: '', label: 'Tất cả', icon: <FunnelIcon className="w-3.5 h-3.5" /> },
    { value: 'active', label: 'Hoạt động', icon: <CheckCircleIcon className="w-3.5 h-3.5" /> },
    { value: 'archived', label: 'Lưu trữ', icon: <ClockIcon className="w-3.5 h-3.5" /> },
    { value: 'blacklisted', label: 'Chặn', icon: <XMarkIcon className="w-3.5 h-3.5" /> },
];

export function CandidatesPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [filters, setFilters] = useState<CandidateFilters>({
        search: '',
        status: undefined,
        source: undefined,
        per_page: 15,
        page: 1,
    });
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
    const [deleteCandidate, setDeleteCandidate] = useState<Candidate | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, isLoading, isFetching } = useGetCandidatesQuery(filters);
    const [updateCandidate] = useUpdateCandidateMutation();
    const [createCandidate] = useCreateCandidateMutation();
    const [deleteCandidateMutation] = useDeleteCandidateMutation();

    const candidates = data?.data ?? [];
    const meta = data?.meta;
    const stats = data?.stats;
    const userRole = data?.role;

    const handleFilterChange = (key: keyof CandidateFilters, value: string | number) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === '' ? undefined : value,
            page: key === 'page' ? (value as number) : 1,
        }));
    };

    const handleRatingChange = async (candidate: Candidate, rating: number) => {
        await updateCandidate({ id: candidate.id, data: { rating } });
    };

    const handleAddClick = () => {
        setEditingCandidate(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (candidate: Candidate) => {
        setEditingCandidate(candidate);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (candidate: Candidate) => {
        setDeleteCandidate(candidate);
    };

    const handleSave = async (data: CreateCandidateData | UpdateCandidateData) => {
        setIsSaving(true);
        try {
            if (editingCandidate) {
                await updateCandidate({ id: editingCandidate.id, data }).unwrap();
            } else {
                await createCandidate(data as CreateCandidateData).unwrap();
            }
            setIsModalOpen(false);
            setEditingCandidate(null);
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteCandidate) return;
        setIsDeleting(true);
        try {
            await deleteCandidateMutation(deleteCandidate.id).unwrap();
            setDeleteCandidate(null);
            if (selectedCandidate?.id === deleteCandidate.id) {
                setSelectedCandidate(null);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const getSourceConfig = (source: string) => {
        const config: Record<string, { bg: string; text: string; label: string; dot: string }> = {
            chat: {
                bg: isDark ? 'bg-blue-500/15' : 'bg-blue-50',
                text: isDark ? 'text-blue-400' : 'text-blue-700',
                label: 'Zalo',
                dot: 'bg-blue-500',
            },
            manual: {
                bg: isDark ? 'bg-emerald-500/15' : 'bg-emerald-50',
                text: isDark ? 'text-emerald-400' : 'text-emerald-700',
                label: 'Thủ công',
                dot: 'bg-emerald-500',
            },
            import: {
                bg: isDark ? 'bg-purple-500/15' : 'bg-purple-50',
                text: isDark ? 'text-purple-400' : 'text-purple-700',
                label: 'Import',
                dot: 'bg-purple-500',
            },
            referral: {
                bg: isDark ? 'bg-amber-500/15' : 'bg-amber-50',
                text: isDark ? 'text-amber-400' : 'text-amber-700',
                label: 'Giới thiệu',
                dot: 'bg-amber-500',
            },
        };
        return config[source] ?? { bg: 'bg-slate-100', text: 'text-slate-600', label: source, dot: 'bg-slate-400' };
    };

    const getStatusConfig = (status: string) => {
        const config: Record<string, { bg: string; text: string; label: string; dot: string }> = {
            active: {
                bg: isDark ? 'bg-emerald-500/15' : 'bg-emerald-50',
                text: isDark ? 'text-emerald-400' : 'text-emerald-700',
                label: 'Hoạt động',
                dot: 'bg-emerald-500',
            },
            archived: {
                bg: isDark ? 'bg-slate-500/15' : 'bg-slate-100',
                text: isDark ? 'text-slate-400' : 'text-slate-600',
                label: 'Lưu trữ',
                dot: 'bg-slate-400',
            },
            blacklisted: {
                bg: isDark ? 'bg-red-500/15' : 'bg-red-50',
                text: isDark ? 'text-red-400' : 'text-red-700',
                label: 'Danh sách đen',
                dot: 'bg-red-500',
            },
        };
        return config[status] ?? { bg: 'bg-slate-100', text: 'text-slate-600', label: status, dot: 'bg-slate-400' };
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatRelativeDate = (date: string) => {
        const now = new Date();
        const d = new Date(date);
        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return formatDate(date);
    };

    const parseTags = (tags: string[] | string | null | undefined): string[] => {
        if (!tags) return [];
        if (Array.isArray(tags)) return tags;
        if (typeof tags === 'string') {
            try {
                const parsed = JSON.parse(tags);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return tags.includes(',') ? tags.split(',').map(t => t.trim()) : [tags];
            }
        }
        return [];
    };

    // Stat cards data
    const statCards = [
        {
            label: 'Tổng ứng viên',
            value: stats?.total ?? 0,
            icon: <UsersIcon className="w-5 h-5" />,
            iconBg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-100',
            iconColor: 'text-emerald-500',
            trend: '+12%',
            trendUp: true,
        },
        {
            label: 'Đang hoạt động',
            value: stats?.active ?? 0,
            icon: <SparklesIcon className="w-5 h-5" />,
            iconBg: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
            iconColor: 'text-blue-500',
            trend: '+5%',
            trendUp: true,
        },
        {
            label: 'Mới tháng này',
            value: stats?.this_month ?? 0,
            icon: <CalendarIcon className="w-5 h-5" />,
            iconBg: isDark ? 'bg-purple-500/20' : 'bg-purple-100',
            iconColor: 'text-purple-500',
            trend: null,
            trendUp: false,
        },
        {
            label: 'Danh sách đen',
            value: stats?.blacklisted ?? 0,
            icon: <XMarkIcon className="w-5 h-5" />,
            iconBg: isDark ? 'bg-red-500/20' : 'bg-red-100',
            iconColor: 'text-red-500',
            trend: null,
            trendUp: false,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <div className={`relative overflow-hidden rounded-2xl ${isDark
                ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900'
                : 'bg-gradient-to-br from-white via-slate-50 to-emerald-50/30'
                } border ${isDark ? 'border-slate-700/50' : 'border-slate-200/80'} p-6 lg:p-8`}>
                {/* Decorative orbs */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                            <UsersIcon className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className={`text-xl lg:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Quản lý ứng viên
                            </h1>
                            <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {userRole === 'member'
                                    ? 'Ứng viên được phân công cho bạn'
                                    : 'Theo dõi và quản lý tất cả ứng viên của công ty'
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="group flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-300 font-semibold text-sm"
                    >
                        <UserPlusIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                        Thêm ứng viên
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-6">
                    {statCards.map((stat, i) => (
                        <div
                            key={i}
                            className={`group relative p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${isDark
                                ? 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600'
                                : 'bg-white/80 border-slate-200/60 hover:border-slate-300 hover:shadow-slate-200/50'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2.5">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}>
                                    {stat.icon}
                                </div>
                                {stat.trend && (
                                    <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                                        <ArrowTrendingUpIcon className="w-3 h-3" />
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters Bar */}
            <div className={`rounded-xl border p-4 ${isDark
                ? 'bg-slate-800/50 border-slate-700/50'
                : 'bg-white border-slate-200'
                }`}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="Tìm tên, email, số điện thoại..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all duration-200 ${isDark
                                ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20'
                                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20'
                                } outline-none`}
                        />
                        {filters.search && (
                            <button
                                onClick={() => handleFilterChange('search', '')}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-slate-200 text-slate-400'}`}
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Source Filter */}
                    <select
                        value={filters.source}
                        onChange={(e) => handleFilterChange('source', e.target.value)}
                        className={`px-3 py-2.5 rounded-lg border text-sm ${isDark
                            ? 'bg-slate-900/50 border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                            } outline-none cursor-pointer`}
                    >
                        {SOURCE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    {/* Status Tabs */}
                    <div className={`flex rounded-lg p-1 ${isDark ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
                        {STATUS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handleFilterChange('status', opt.value)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${filters.status === opt.value
                                    ? isDark
                                        ? 'bg-slate-700 text-white shadow-sm'
                                        : 'bg-white text-slate-800 shadow-sm'
                                    : isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {opt.icon}
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-6">
                {/* Table Area */}
                <div className={`flex-1 min-w-0 rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                    {isLoading ? (
                        <LoadingSkeleton isDark={isDark} />
                    ) : candidates.length === 0 ? (
                        <EmptyState isDark={isDark} onAdd={handleAddClick} />
                    ) : (
                        <>
                            {/* Results count */}
                            <div className={`px-5 py-3 border-b flex items-center justify-between ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Hiển thị <span className="font-semibold">{candidates.length}</span> ứng viên
                                    {meta && meta.total > candidates.length && (
                                        <> / <span className="font-semibold">{meta.total}</span> tổng</>
                                    )}
                                </p>
                                {isFetching && (
                                    <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                )}
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className={isDark ? 'bg-slate-900/30' : 'bg-slate-50/80'}>
                                            {['Ứng viên', 'Liên hệ', 'Nguồn', 'Tags', 'Đánh giá', 'Trạng thái', 'Cập nhật', ''].map((header, i) => (
                                                <th key={i} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider ${i === 7 ? 'text-right' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? 'divide-slate-700/30' : 'divide-slate-100'}`}>
                                        {candidates.map((candidate) => {
                                            const sourceConfig = getSourceConfig(candidate.source);
                                            const statusConfig = getStatusConfig(candidate.status);
                                            const tags = parseTags(candidate.tags);
                                            const isSelected = selectedCandidate?.id === candidate.id;

                                            return (
                                                <tr
                                                    key={candidate.id}
                                                    onClick={() => setSelectedCandidate(isSelected ? null : candidate)}
                                                    className={`group cursor-pointer transition-all duration-150 ${isSelected
                                                        ? isDark ? 'bg-emerald-500/10' : 'bg-emerald-50/60'
                                                        : isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50/80'
                                                        }`}
                                                >
                                                    {/* Name + Avatar */}
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white/10">
                                                                    {candidate.avatar_url ? (
                                                                        <img src={candidate.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                                    ) : (
                                                                        candidate.full_name.charAt(0).toUpperCase()
                                                                    )}
                                                                </div>
                                                                {candidate.status === 'active' && (
                                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                                    {candidate.full_name}
                                                                </p>
                                                                {candidate.email && (
                                                                    <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                        {candidate.email}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Phone */}
                                                    <td className="px-5 py-3.5">
                                                        {candidate.phone ? (
                                                            <span className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                                {candidate.phone}
                                                            </span>
                                                        ) : (
                                                            <span className={`text-xs italic ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>—</span>
                                                        )}
                                                    </td>

                                                    {/* Source */}
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${sourceConfig.bg} ${sourceConfig.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${sourceConfig.dot}`} />
                                                            {sourceConfig.label}
                                                        </span>
                                                    </td>

                                                    {/* Tags */}
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex flex-wrap gap-1">
                                                            {tags.slice(0, 2).map((tag, i) => (
                                                                <span key={i} className={`px-2 py-0.5 text-xs rounded-md ${isDark ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {tags.length > 2 && (
                                                                <span className={`px-2 py-0.5 text-xs rounded-md ${isDark ? 'bg-slate-700/40 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                                                                    +{tags.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Rating */}
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    onClick={(e) => { e.stopPropagation(); handleRatingChange(candidate, star); }}
                                                                    className="focus:outline-none hover:scale-110 transition-transform"
                                                                >
                                                                    <StarIcon
                                                                        className={`w-4 h-4 transition-colors ${star <= (candidate.rating ?? 0)
                                                                            ? 'text-amber-400 fill-amber-400'
                                                                            : isDark ? 'text-slate-600 hover:text-amber-400/50' : 'text-slate-200 hover:text-amber-300'
                                                                            }`}
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                                            {statusConfig.label}
                                                        </span>
                                                    </td>

                                                    {/* Updated */}
                                                    <td className="px-5 py-3.5">
                                                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            {formatRelativeDate(candidate.updated_at)}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-5 py-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleEditClick(candidate); }}
                                                                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-600 text-slate-400 hover:text-emerald-400' : 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'}`}
                                                                title="Sửa"
                                                            >
                                                                <PencilIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(candidate); }}
                                                                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/30 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-600'}`}
                                                                title="Xoá"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {meta && meta.last_page > 1 && (
                                <div className={`flex items-center justify-between px-5 py-3 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Trang {meta.current_page} / {meta.last_page}
                                        <span className="mx-2">·</span>
                                        {((meta.current_page - 1) * meta.per_page) + 1}–{Math.min(meta.current_page * meta.per_page, meta.total)} của {meta.total}
                                    </p>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => handleFilterChange('page', meta.current_page - 1)}
                                            disabled={meta.current_page === 1 || isFetching}
                                            className={`p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                                        >
                                            <ChevronLeftIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleFilterChange('page', meta.current_page + 1)}
                                            disabled={meta.current_page === meta.last_page || isFetching}
                                            className={`p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                                        >
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Preview Sidebar */}
                {selectedCandidate && (
                    <div className={`hidden lg:block w-80 xl:w-96 flex-shrink-0 rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                        {/* Sidebar Header */}
                        <div className={`relative p-5 border-b ${isDark ? 'border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-800/50' : 'border-slate-100 bg-gradient-to-br from-slate-50 to-white'}`}>
                            <button
                                onClick={() => setSelectedCandidate(null)}
                                className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/20">
                                        {selectedCandidate.avatar_url ? (
                                            <img src={selectedCandidate.avatar_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                                        ) : (
                                            selectedCandidate.full_name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    {selectedCandidate.status === 'active' && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                        {selectedCandidate.full_name}
                                    </h3>
                                    <div className="mt-1">
                                        {(() => {
                                            const sc = getStatusConfig(selectedCandidate.status);
                                            return (
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${sc.bg} ${sc.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                                    {sc.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="flex gap-0.5 mt-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => handleRatingChange(selectedCandidate, star)}
                                        className="focus:outline-none hover:scale-110 transition-transform"
                                    >
                                        <StarIcon
                                            className={`w-5 h-5 ${star <= (selectedCandidate.rating ?? 0)
                                                ? 'text-amber-400 fill-amber-400'
                                                : isDark ? 'text-slate-600' : 'text-slate-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar Content */}
                        <div className="p-5 space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto">
                            {/* Contact Info */}
                            <div className="space-y-3">
                                <h5 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Thông tin liên hệ
                                </h5>
                                {selectedCandidate.phone && (
                                    <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-slate-900/40' : 'bg-slate-50'}`}>
                                        <PhoneIcon className="w-4 h-4 text-emerald-500" />
                                        <span className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{selectedCandidate.phone}</span>
                                    </div>
                                )}
                                {selectedCandidate.email && (
                                    <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-slate-900/40' : 'bg-slate-50'}`}>
                                        <EnvelopeIcon className="w-4 h-4 text-blue-500" />
                                        <span className={`text-sm truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{selectedCandidate.email}</span>
                                    </div>
                                )}
                                {selectedCandidate.resume_url && (
                                    <a
                                        href={selectedCandidate.resume_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isDark ? 'bg-emerald-500/10 hover:bg-emerald-500/20' : 'bg-emerald-50 hover:bg-emerald-100'}`}
                                    >
                                        <DocumentTextIcon className="w-4 h-4 text-emerald-500" />
                                        <span className="text-sm text-emerald-600 font-medium">Xem CV/Resume</span>
                                    </a>
                                )}
                            </div>

                            {/* Source */}
                            <div>
                                <h5 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Nguồn
                                </h5>
                                {(() => {
                                    const sc = getSourceConfig(selectedCandidate.source);
                                    return (
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${sc.bg} ${sc.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                            {sc.label}
                                        </span>
                                    );
                                })()}
                            </div>

                            {/* Tags */}
                            {parseTags(selectedCandidate.tags).length > 0 && (
                                <div>
                                    <h5 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Tags
                                    </h5>
                                    <div className="flex flex-wrap gap-1.5">
                                        {parseTags(selectedCandidate.tags).map((tag, i) => (
                                            <span key={i} className={`px-2.5 py-1 text-xs rounded-lg font-medium ${isDark ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedCandidate.notes && (
                                <div>
                                    <h5 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Ghi chú
                                    </h5>
                                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {selectedCandidate.notes}
                                    </p>
                                </div>
                            )}

                            {/* Applications */}
                            {selectedCandidate.applications && selectedCandidate.applications.length > 0 && (
                                <div>
                                    <h5 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Đơn ứng tuyển
                                    </h5>
                                    <div className="space-y-2">
                                        {selectedCandidate.applications.map((app) => (
                                            <div key={app.id} className={`p-3 rounded-lg border ${isDark ? 'bg-slate-900/40 border-slate-700/30' : 'bg-slate-50 border-slate-100'}`}>
                                                <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                    {app.job?.title ?? 'Unknown Job'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <ClockIcon className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {formatDate(app.applied_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className={`pt-4 border-t ${isDark ? 'border-slate-700/30' : 'border-slate-100'}`}>
                                <div className="flex justify-between text-xs">
                                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Ngày tạo</span>
                                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{formatDate(selectedCandidate.created_at)}</span>
                                </div>
                                <div className="flex justify-between text-xs mt-1.5">
                                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Cập nhật</span>
                                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{formatRelativeDate(selectedCandidate.updated_at)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEditClick(selectedCandidate)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDark
                                        ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                        }`}
                                >
                                    <PencilIcon className="w-4 h-4" />
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(selectedCandidate)}
                                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDark
                                        ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                                        }`}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <CandidateModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingCandidate(null); }}
                candidate={editingCandidate}
                onSave={handleSave}
                isLoading={isSaving}
            />

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                isOpen={!!deleteCandidate}
                onClose={() => setDeleteCandidate(null)}
                onConfirm={handleConfirmDelete}
                title="Xoá ứng viên"
                message={`Bạn có chắc chắn muốn xoá ứng viên "${deleteCandidate?.full_name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xoá"
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
}

// Empty State
function EmptyState({ isDark, onAdd }: { isDark: boolean; onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="relative mb-6">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                    <UsersIcon className={`w-10 h-10 ${isDark ? 'text-slate-500' : 'text-slate-300'}`} />
                </div>
                <div className={`absolute -top-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center rotate-12 ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                    <UserPlusIcon className="w-5 h-5 text-emerald-500" />
                </div>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Chưa có ứng viên nào
            </h3>
            <p className={`text-sm text-center max-w-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Thêm ứng viên đầu tiên để bắt đầu xây dựng nguồn nhân lực cho công ty bạn
            </p>
            <button
                onClick={onAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all font-semibold text-sm"
            >
                <UserPlusIcon className="w-5 h-5" />
                Thêm ứng viên đầu tiên
            </button>
        </div>
    );
}

// Loading Skeleton
function LoadingSkeleton({ isDark }: { isDark: boolean }) {
    return (
        <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl animate-pulse ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                    <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
                    <div className="flex-1 space-y-2">
                        <div className={`h-4 rounded-lg w-1/3 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
                        <div className={`h-3 rounded-lg w-1/4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />
                    </div>
                    <div className={`h-6 w-16 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => (
                            <div key={j} className={`w-4 h-4 rounded ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default CandidatesPage;
