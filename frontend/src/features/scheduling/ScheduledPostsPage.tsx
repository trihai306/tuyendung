import { useState, useEffect } from 'react';
import { useScheduling, useZaloGroups } from './useScheduling';
import type { ScheduledGroupPost, CreateScheduledPostData } from './schedulingApi';
import apiClient from '../../services/apiClient';
import { useToast, ConfirmModal } from '../../components/ui';

// Status badge component
function StatusBadge({ status }: { status: string }) {
    const statusStyles: Record<string, string> = {
        pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
        approved: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
        processing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
        completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
        failed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
        cancelled: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    };

    const statusLabels: Record<string, string> = {
        pending: 'Chờ duyệt',
        approved: 'Đã duyệt',
        processing: 'Đang xử lý',
        completed: 'Hoàn thành',
        failed: 'Thất bại',
        cancelled: 'Đã hủy',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
            {statusLabels[status] || status}
        </span>
    );
}

// Modal for creating/editing scheduled posts
function CreatePostModal({
    isOpen,
    onClose,
    onSubmit,
    zaloAccounts,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateScheduledPostData) => Promise<{ success: boolean; error?: string }>;
    zaloAccounts: { id: number; name: string; phone?: string }[];
}) {
    const [formData, setFormData] = useState<{
        zalo_account_id: number;
        content: string;
        scheduled_at: string;
        repeat_type: 'once' | 'daily' | 'weekly' | 'custom';
        target_groups: string[];
        select_all_groups: boolean;
    }>({
        zalo_account_id: 0,
        content: '',
        scheduled_at: '',
        repeat_type: 'once',
        target_groups: [],
        select_all_groups: true,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { groups, loading: groupsLoading } = useZaloGroups(formData.zalo_account_id || null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        const submitData: CreateScheduledPostData = {
            zalo_account_id: formData.zalo_account_id,
            content: formData.content,
            scheduled_at: formData.scheduled_at,
            repeat_type: formData.repeat_type,
            target_groups: formData.select_all_groups ? ['all'] : formData.target_groups,
        };

        const result = await onSubmit(submitData);
        setSubmitting(false);

        if (result.success) {
            onClose();
            setFormData({
                zalo_account_id: 0,
                content: '',
                scheduled_at: '',
                repeat_type: 'once',
                target_groups: [],
                select_all_groups: true,
            });
        } else {
            setError(result.error || 'Có lỗi xảy ra');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

                <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white dark:bg-slate-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">
                                Lên lịch đăng bài Zalo Group
                            </h3>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Zalo Account Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tài khoản Zalo
                                    </label>
                                    <select
                                        required
                                        value={formData.zalo_account_id}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            zalo_account_id: Number(e.target.value),
                                            target_groups: [],
                                        }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value={0}>-- Chọn tài khoản --</option>
                                        {zaloAccounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.name} {acc.phone && `(${acc.phone})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Target Groups */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nhóm đích
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.select_all_groups}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    select_all_groups: e.target.checked,
                                                    target_groups: [],
                                                }))}
                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Tất cả các nhóm</span>
                                        </label>

                                        {!formData.select_all_groups && (
                                            <div className="max-h-40 overflow-y-auto border dark:border-slate-600 rounded-lg p-2">
                                                {groupsLoading ? (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">Đang tải...</p>
                                                ) : groups.length === 0 ? (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">Chưa có nhóm nào</p>
                                                ) : (
                                                    groups.map(group => (
                                                        <label key={group.group_id} className="flex items-center py-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.target_groups.includes(group.group_id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            target_groups: [...prev.target_groups, group.group_id],
                                                                        }));
                                                                    } else {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            target_groups: prev.target_groups.filter(id => id !== group.group_id),
                                                                        }));
                                                                    }
                                                                }}
                                                                className="rounded border-gray-300 text-emerald-600"
                                                            />
                                                            <span className="ml-2 text-sm">{group.name}</span>
                                                            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{group.member_count} thành viên</span>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nội dung bài đăng
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.content}
                                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Nhập nội dung bài đăng..."
                                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                {/* Schedule Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Thời gian đăng
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.scheduled_at}
                                        onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                {/* Repeat Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Lặp lại
                                    </label>
                                    <select
                                        value={formData.repeat_type}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            repeat_type: e.target.value as 'once' | 'daily' | 'weekly' | 'custom',
                                        }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="once">Một lần</option>
                                        <option value="daily">Hàng ngày</option>
                                        <option value="weekly">Hàng tuần</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                            <button
                                type="submit"
                                disabled={submitting || !formData.zalo_account_id || !formData.content || !formData.scheduled_at}
                                className="inline-flex w-full justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                            >
                                {submitting ? 'Đang tạo...' : 'Tạo lịch đăng'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-slate-600 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-500 hover:bg-gray-50 dark:hover:bg-slate-500 sm:mt-0 sm:w-auto"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Post card component
function PostCard({
    post,
    onApprove,
    onExecute,
    onCancel,
}: {
    post: ScheduledGroupPost;
    onApprove: () => void;
    onExecute: () => void;
    onCancel: () => void;
}) {
    const scheduledDate = new Date(post.scheduled_at);
    const isOverdue = scheduledDate < new Date() && post.status === 'approved';

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl border ${isOverdue ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-slate-700'} p-4 hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <StatusBadge status={post.status} />
                    {isOverdue && (
                        <span className="text-xs text-amber-600 font-medium">Quá hạn</span>
                    )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {scheduledDate.toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            </div>

            {/* Content Preview */}
            <p className="text-gray-800 dark:text-gray-200 text-sm mb-3 line-clamp-3">
                {post.content}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {Array.isArray(post.target_groups) && post.target_groups[0] === 'all'
                        ? 'Tất cả nhóm'
                        : `${post.target_groups?.length || 0} nhóm`}
                </span>
                {post.zalo_account && (
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {post.zalo_account.name}
                    </span>
                )}
                {post.repeat_type !== 'once' && (
                    <span className="flex items-center gap-1 text-blue-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {post.repeat_type === 'daily' ? 'Hàng ngày' : post.repeat_type === 'weekly' ? 'Hàng tuần' : 'Tùy chỉnh'}
                    </span>
                )}
            </div>

            {/* Results for completed/failed */}
            {post.status === 'completed' && (
                <div className="flex gap-3 text-xs mb-3">
                    <span className="text-emerald-600">✓ {post.success_count} thành công</span>
                    {post.failed_count > 0 && (
                        <span className="text-red-600">✗ {post.failed_count} thất bại</span>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                {post.status === 'pending' && (
                    <>
                        <button
                            onClick={onApprove}
                            className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            Duyệt
                        </button>
                        <button
                            onClick={onCancel}
                            className="text-xs px-3 py-1.5 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                        >
                            Hủy
                        </button>
                    </>
                )}
                {post.status === 'approved' && (
                    <>
                        <button
                            onClick={onExecute}
                            className="text-xs px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                            Thực thi ngay
                        </button>
                        <button
                            onClick={onCancel}
                            className="text-xs px-3 py-1.5 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                        >
                            Hủy
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// Main page component
export function ScheduledPostsPage() {
    const { posts, loading, error, createPost, approvePost, executeNow, cancelPost } = useScheduling();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [zaloAccounts, setZaloAccounts] = useState<{ id: number; name: string; phone?: string }[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const { toast } = useToast();
    const [confirmAction, setConfirmAction] = useState<{ show: boolean; id: number; type: 'execute' | 'cancel'; title: string; message: string }>({ show: false, id: 0, type: 'execute', title: '', message: '' });

    // Fetch Zalo accounts
    useEffect(() => {
        apiClient.get('/zalo')
            .then(res => {
                if (res.data.success) {
                    setZaloAccounts(res.data.data.map((acc: any) => ({
                        id: acc.id,
                        name: acc.name || acc.phone || 'Zalo Account',
                        phone: acc.phone,
                    })));
                }
            })
            .catch(console.error);
    }, []);

    // Filter posts
    const filteredPosts = statusFilter
        ? posts.filter(p => p.status === statusFilter)
        : posts;

    // Group posts by status for stats
    const stats = {
        pending: posts.filter(p => p.status === 'pending').length,
        approved: posts.filter(p => p.status === 'approved').length,
        completed: posts.filter(p => p.status === 'completed').length,
        failed: posts.filter(p => p.status === 'failed').length,
    };

    const handleApprove = async (id: number) => {
        const result = await approvePost(id);
        if (!result.success) {
            toast.error('Không thể duyệt bài đăng', result.error || '');
        } else {
            toast.success('Đã duyệt bài đăng');
        }
    };

    const handleExecute = (id: number) => {
        setConfirmAction({ show: true, id, type: 'execute', title: 'Thực thi bài đăng', message: 'Bạn có chắc muốn thực thi bài đăng này ngay bây giờ?' });
    };

    const handleCancel = (id: number) => {
        setConfirmAction({ show: true, id, type: 'cancel', title: 'Hủy bài đăng', message: 'Bạn có chắc muốn hủy bài đăng này?' });
    };

    const handleConfirmAction = async () => {
        const { id, type } = confirmAction;
        setConfirmAction(prev => ({ ...prev, show: false }));
        if (type === 'execute') {
            const result = await executeNow(id);
            if (!result.success) {
                toast.error('Không thể thực thi bài đăng', result.error || '');
            } else {
                toast.success('Đã gửi bài đăng thành công!');
            }
        } else {
            const result = await cancelPost(id);
            if (!result.success) {
                toast.error('Không thể hủy bài đăng', result.error || '');
            } else {
                toast.success('Đã hủy bài đăng');
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lịch đăng bài Zalo Group</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Lên lịch và quản lý bài đăng tự động đến các nhóm Zalo</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={zaloAccounts.length === 0}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo lịch đăng
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Chờ duyệt</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-500/10">
                            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-blue-500">{stats.approved}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Đã duyệt</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/10">
                            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-emerald-500">{stats.completed}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Hoàn thành</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10">
                            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Thất bại</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-500/10">
                            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setStatusFilter('')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === '' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                >
                    Tất cả
                </button>
                <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                >
                    Chờ duyệt
                </button>
                <button
                    onClick={() => setStatusFilter('approved')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                >
                    Đã duyệt
                </button>
                <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'completed' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                >
                    Hoàn thành
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-xl text-center">
                    {error}
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-slate-800 rounded-xl">
                    <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Chưa có bài đăng lịch nào</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Bắt đầu lên lịch đăng bài đến các nhóm Zalo của bạn</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        disabled={zaloAccounts.length === 0}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                        Tạo lịch đăng đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onApprove={() => handleApprove(post.id)}
                            onExecute={() => handleExecute(post.id)}
                            onCancel={() => handleCancel(post.id)}
                        />
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <CreatePostModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={createPost}
                zaloAccounts={zaloAccounts}
            />

            {/* Confirm Action Modal */}
            <ConfirmModal
                isOpen={confirmAction.show}
                onClose={() => setConfirmAction(prev => ({ ...prev, show: false }))}
                onConfirm={handleConfirmAction}
                title={confirmAction.title}
                message={confirmAction.message}
                variant={confirmAction.type === 'cancel' ? 'danger' : 'warning'}
                confirmText={confirmAction.type === 'execute' ? 'Thực thi' : 'Hủy bài'}
            />
        </div>
    );
}

export default ScheduledPostsPage;
