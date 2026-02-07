import { useState, useEffect, useCallback } from 'react';
import { facebookGroupsApi } from './facebookGroupsApi';
import type { FacebookGroup } from './facebookGroupsApi';
import apiClient from '../../services/apiClient';

interface PlatformAccount {
    id: number;
    name: string | null;
    platform: string;
    status: string;
}

// Group card component
function GroupCard({ group }: { group: FacebookGroup }) {
    const [showPostModal, setShowPostModal] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [posting, setPosting] = useState(false);

    const handlePost = async () => {
        if (!postContent.trim()) return;
        setPosting(true);
        try {
            const result = await facebookGroupsApi.postToGroup(group.id, postContent);
            if (result.success) {
                alert('Đã đăng bài thành công!');
                setShowPostModal(false);
                setPostContent('');
            } else {
                alert(result.error?.message || 'Có lỗi xảy ra');
            }
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra');
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
                {/* Group Avatar */}
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
                        {group.is_admin && (
                            <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                                Admin
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {group.member_count?.toLocaleString() || '?'} thành viên
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="capitalize">{group.privacy || 'Công khai'}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                    onClick={() => setShowPostModal(true)}
                    className="flex-1 text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                    Đăng bài
                </button>
                <a
                    href={group.group_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    Mở nhóm
                </a>
            </div>

            {/* Post Modal */}
            {showPostModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl p-4 max-w-md w-full">
                        <h3 className="font-semibold text-gray-900 mb-3">Đăng bài đến {group.name}</h3>
                        <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            rows={4}
                            placeholder="Nhập nội dung bài đăng..."
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                        />
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={handlePost}
                                disabled={posting || !postContent.trim()}
                                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                            >
                                {posting ? 'Đang đăng...' : 'Đăng bài'}
                            </button>
                            <button
                                onClick={() => setShowPostModal(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Main page component
export function FacebookGroupsPage() {
    const [groups, setGroups] = useState<FacebookGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [facebookAccounts, setFacebookAccounts] = useState<PlatformAccount[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

    // Fetch Facebook accounts
    useEffect(() => {
        apiClient.get('/platform-accounts', { params: { platform: 'facebook' } })
            .then(res => {
                if (res.data.success) {
                    setFacebookAccounts(res.data.data);
                    if (res.data.data.length > 0) {
                        setSelectedAccountId(res.data.data[0].id);
                    }
                }
            })
            .catch(console.error);
    }, []);

    // Fetch groups
    const fetchGroups = useCallback(async () => {
        setLoading(true);
        try {
            const response = await facebookGroupsApi.getGroups(selectedAccountId || undefined);
            if (response.success) {
                setGroups(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch groups:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedAccountId]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    // Sync groups
    const handleSync = async () => {
        if (!selectedAccountId) return;
        setSyncing(true);
        try {
            const result = await facebookGroupsApi.syncGroups(selectedAccountId);
            if (result.success) {
                alert(`Đã đồng bộ ${result.synced_count} nhóm!`);
                fetchGroups();
            } else {
                alert(result.error?.message || 'Có lỗi xảy ra khi đồng bộ');
            }
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nhóm Facebook</h1>
                    <p className="text-gray-500 mt-1">Quản lý và đăng bài đến các nhóm Facebook</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Account selector */}
                    {facebookAccounts.length > 1 && (
                        <select
                            value={selectedAccountId || ''}
                            onChange={(e) => setSelectedAccountId(Number(e.target.value) || null)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                            {facebookAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.name || `Facebook #${acc.id}`}
                                </option>
                            ))}
                        </select>
                    )}
                    <button
                        onClick={handleSync}
                        disabled={syncing || !selectedAccountId}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {syncing ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                        Đồng bộ nhóm
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-blue-500">{groups.length}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Tổng nhóm</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/10">
                            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-emerald-500">
                                {groups.filter(g => g.is_admin).length}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Nhóm Admin</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10">
                            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-purple-500">
                                {groups.reduce((sum, g) => sum + (g.member_count || 0), 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Tổng thành viên</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-500/10">
                            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{facebookAccounts.length}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Tài khoản</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có nhóm nào</h3>
                    <p className="text-gray-500 mb-4">
                        {facebookAccounts.length === 0
                            ? 'Vui lòng thêm tài khoản Facebook trước'
                            : 'Nhấn "Đồng bộ nhóm" để lấy danh sách nhóm từ tài khoản Facebook'}
                    </p>
                    {selectedAccountId && (
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            Đồng bộ nhóm
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map(group => (
                        <GroupCard key={group.id} group={group} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default FacebookGroupsPage;
