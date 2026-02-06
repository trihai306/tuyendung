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

const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'archived', label: 'Lưu trữ' },
    { value: 'blacklisted', label: 'Danh sách đen' },
];

export function CandidatesPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [filters, setFilters] = useState<CandidateFilters>({
        search: '',
        status: '',
        source: '',
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
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handleRatingChange = async (candidate: Candidate, rating: number) => {
        await updateCandidate({ id: candidate.id, data: { rating } });
    };

    // Handle add new candidate
    const handleAddClick = () => {
        setEditingCandidate(null);
        setIsModalOpen(true);
    };

    // Handle edit candidate
    const handleEditClick = (candidate: Candidate) => {
        setEditingCandidate(candidate);
        setIsModalOpen(true);
    };

    // Handle delete click
    const handleDeleteClick = (candidate: Candidate) => {
        setDeleteCandidate(candidate);
    };

    // Handle save (create or update)
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

    // Handle confirm delete
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

    const getSourceBadge = (source: string) => {
        const colors: Record<string, string> = {
            chat: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            manual: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            import: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            referral: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        };
        const labels: Record<string, string> = {
            chat: 'Zalo',
            manual: 'Thủ công',
            import: 'Import',
            referral: 'Giới thiệu',
        };
        return (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${colors[source] ?? 'bg-slate-500/20 text-slate-400'}`}>
                {labels[source] ?? source}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-emerald-500/20 text-emerald-400',
            archived: 'bg-slate-500/20 text-slate-400',
            blacklisted: 'bg-red-500/20 text-red-400',
        };
        const labels: Record<string, string> = {
            active: 'Hoạt động',
            archived: 'Lưu trữ',
            blacklisted: 'Danh sách đen',
        };
        return (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[status] ?? 'bg-slate-500/20 text-slate-400'}`}>
                {labels[status] ?? status}
            </span>
        );
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Helper to safely parse tags (can be string or array from backend)
    const parseTags = (tags: string[] | string | null | undefined): string[] => {
        if (!tags) return [];
        if (Array.isArray(tags)) return tags;
        if (typeof tags === 'string') {
            try {
                const parsed = JSON.parse(tags);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                // If not valid JSON, treat as comma-separated or single tag
                return tags.includes(',') ? tags.split(',').map(t => t.trim()) : [tags];
            }
        }
        return [];
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <div className="flex h-screen overflow-hidden">
                {/* Main Content */}
                <div className={`flex-1 flex flex-col overflow-hidden ${selectedCandidate ? 'lg:mr-96' : ''}`}>
                    {/* Header */}
                    <div className={`p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Ứng viên
                                </h1>
                                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {userRole === 'member'
                                        ? 'Ứng viên được phân công cho bạn'
                                        : 'Quản lý tất cả ứng viên trong hệ thống'
                                    }
                                </p>
                            </div>
                            <button
                                onClick={handleAddClick}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                            >
                                <UserPlusIcon className="w-5 h-5" />
                                Thêm ứng viên
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <StatCard
                                label="Tổng số"
                                value={stats?.total ?? 0}
                                icon={<UsersIcon className="w-5 h-5" />}
                                color="emerald"
                                isDark={isDark}
                            />
                            <StatCard
                                label="Hoạt động"
                                value={stats?.active ?? 0}
                                icon={<UsersIcon className="w-5 h-5" />}
                                color="blue"
                                isDark={isDark}
                            />
                            <StatCard
                                label="Tháng này"
                                value={stats?.this_month ?? 0}
                                icon={<UserPlusIcon className="w-5 h-5" />}
                                color="purple"
                                isDark={isDark}
                            />
                            <StatCard
                                label="Danh sách đen"
                                value={stats?.blacklisted ?? 0}
                                icon={<UsersIcon className="w-5 h-5" />}
                                color="red"
                                isDark={isDark}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px] max-w-md">
                                <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm ứng viên..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                                        } outline-none transition-colors`}
                                />
                            </div>

                            {/* Source Filter */}
                            <select
                                value={filters.source}
                                onChange={(e) => handleFilterChange('source', e.target.value)}
                                className={`px-3 py-2 rounded-lg border ${isDark
                                    ? 'bg-slate-800 border-slate-700 text-white'
                                    : 'bg-white border-slate-200 text-slate-900'
                                    } outline-none`}
                            >
                                {SOURCE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            {/* Status Tabs */}
                            <div className={`flex rounded-lg p-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                {STATUS_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleFilterChange('status', opt.value)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filters.status === opt.value
                                            ? 'bg-emerald-600 text-white'
                                            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                            </div>
                        ) : candidates.length === 0 ? (
                            <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">Không có ứng viên nào</p>
                                <p className="text-sm mt-1">Thêm ứng viên mới hoặc thay đổi bộ lọc</p>
                            </div>
                        ) : (
                            <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                                <table className="w-full">
                                    <thead>
                                        <tr className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Ứng viên
                                            </th>
                                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                SĐT
                                            </th>
                                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Nguồn
                                            </th>
                                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Tags
                                            </th>
                                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Đánh giá
                                            </th>
                                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Trạng thái
                                            </th>
                                            <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Cập nhật
                                            </th>
                                            <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Hành động
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                        {candidates.map((candidate) => (
                                            <tr
                                                key={candidate.id}
                                                onClick={() => setSelectedCandidate(candidate)}
                                                className={`cursor-pointer transition-colors ${selectedCandidate?.id === candidate.id
                                                    ? isDark ? 'bg-emerald-900/20' : 'bg-emerald-50'
                                                    : isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                                                    }`}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                                                            {candidate.avatar_url ? (
                                                                <img src={candidate.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                            ) : (
                                                                candidate.full_name.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                                {candidate.full_name}
                                                            </p>
                                                            {candidate.email && (
                                                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                    {candidate.email}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {candidate.phone || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getSourceBadge(candidate.source)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {parseTags(candidate.tags).slice(0, 2).map((tag, i) => (
                                                            <span key={i} className={`px-2 py-0.5 text-xs rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {parseTags(candidate.tags).length > 2 && (
                                                            <span className={`px-2 py-0.5 text-xs rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                                                +{parseTags(candidate.tags).length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                onClick={(e) => { e.stopPropagation(); handleRatingChange(candidate, star); }}
                                                                className="focus:outline-none"
                                                            >
                                                                <StarIcon
                                                                    className={`w-4 h-4 ${star <= (candidate.rating ?? 0)
                                                                        ? 'text-amber-400 fill-current'
                                                                        : isDark ? 'text-slate-600' : 'text-slate-300'
                                                                        }`}
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(candidate.status)}
                                                </td>
                                                <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {formatDate(candidate.updated_at)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditClick(candidate); }}
                                                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-emerald-400' : 'hover:bg-slate-100 text-slate-500 hover:text-emerald-600'}`}
                                                            title="Sửa"
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(candidate); }}
                                                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/30 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-600'}`}
                                                            title="Xoá"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {meta && meta.last_page > 1 && (
                                    <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Hiển thị {((meta.current_page - 1) * meta.per_page) + 1} - {Math.min(meta.current_page * meta.per_page, meta.total)} của {meta.total}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleFilterChange('page', meta.current_page - 1)}
                                                disabled={meta.current_page === 1 || isFetching}
                                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                                            >
                                                <ChevronLeftIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleFilterChange('page', meta.current_page + 1)}
                                                disabled={meta.current_page === meta.last_page || isFetching}
                                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                                            >
                                                <ChevronRightIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Sidebar */}
                {selectedCandidate && (
                    <div className={`fixed right-0 top-0 h-full w-96 border-l overflow-y-auto ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className={`sticky top-0 p-4 border-b flex items-center justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Chi tiết ứng viên</h3>
                            <button
                                onClick={() => setSelectedCandidate(null)}
                                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Profile */}
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedCandidate.avatar_url ? (
                                        <img src={selectedCandidate.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
                                    ) : (
                                        selectedCandidate.full_name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <h4 className={`mt-3 font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {selectedCandidate.full_name}
                                </h4>
                                <div className="mt-1">{getStatusBadge(selectedCandidate.status)}</div>
                            </div>

                            {/* Contact */}
                            <div className="space-y-3">
                                {selectedCandidate.phone && (
                                    <div className="flex items-center gap-3">
                                        <PhoneIcon className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                                        <span className={isDark ? 'text-white' : 'text-slate-900'}>{selectedCandidate.phone}</span>
                                    </div>
                                )}
                                {selectedCandidate.email && (
                                    <div className="flex items-center gap-3">
                                        <EnvelopeIcon className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                                        <span className={isDark ? 'text-white' : 'text-slate-900'}>{selectedCandidate.email}</span>
                                    </div>
                                )}
                                {selectedCandidate.resume_url && (
                                    <a
                                        href={selectedCandidate.resume_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-emerald-500 hover:text-emerald-400"
                                    >
                                        <DocumentTextIcon className="w-5 h-5" />
                                        <span>Xem CV/Resume</span>
                                    </a>
                                )}
                            </div>

                            {/* Tags */}
                            {parseTags(selectedCandidate.tags).length > 0 && (
                                <div>
                                    <h5 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Tags
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {parseTags(selectedCandidate.tags).map((tag, i) => (
                                            <span key={i} className={`px-3 py-1 text-sm rounded-full ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedCandidate.notes && (
                                <div>
                                    <h5 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Ghi chú
                                    </h5>
                                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {selectedCandidate.notes}
                                    </p>
                                </div>
                            )}

                            {/* Applications */}
                            {selectedCandidate.applications && selectedCandidate.applications.length > 0 && (
                                <div>
                                    <h5 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Đơn ứng tuyển
                                    </h5>
                                    <div className="space-y-2">
                                        {selectedCandidate.applications.map((app) => (
                                            <div key={app.id} className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                                <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    {app.job?.title ?? 'Unknown Job'}
                                                </p>
                                                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {formatDate(app.created_at)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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

// Stats Card Component
function StatCard({ label, value, icon, color, isDark }: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: 'emerald' | 'blue' | 'purple' | 'red';
    isDark: boolean;
}) {
    const colors = {
        emerald: isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
        blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600',
        purple: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600',
        red: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600',
    };

    return (
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        </div>
    );
}

export default CandidatesPage;
