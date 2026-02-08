import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../components/ui';
import { useTheme } from '../../contexts/ThemeContext';

interface ZaloGroup {
    id: string;
    group_id: string;
    name: string;
    member_count: number;
    avatar?: string;
    description?: string;
    type?: string;
    created_time?: string;
}

interface ZaloAccount {
    id: number;
    name: string;
    phone?: string;
    status: string;
}

// Icons
const Icons = {
    users: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    ),
    sync: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    post: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
    ),
    leave: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
    ),
    menu: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

// Professional Group Card
function ZaloGroupCard({
    group,
    onPost,
    onLeave,
    isDark,
}: {
    group: ZaloGroup;
    onPost: (groupId: string) => void;
    onLeave: (group: ZaloGroup) => void;
    isDark: boolean;
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300 overflow-hidden">
            {/* Header with gradient */}
            <div className="h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 relative">
                <div className="absolute inset-0 bg-black/5" />

                {/* Menu button */}
                <div className="absolute top-3 right-3">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                        {Icons.menu}
                    </button>

                    {/* Dropdown menu */}
                    {menuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-20">
                                <button
                                    onClick={() => { onPost(group.group_id); setMenuOpen(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    {Icons.post}
                                    Đăng bài
                                </button>
                                <button
                                    onClick={() => { onLeave(group); setMenuOpen(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    {Icons.leave}
                                    Rời nhóm
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Avatar */}
            <div className="relative -mt-10 px-4">
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-md overflow-hidden">
                    {group.avatar ? (
                        <img src={group.avatar} alt={group.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-2xl font-bold text-blue-600">
                                {group.name?.charAt(0) || 'Z'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 pt-3">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate text-base">
                    {group.name}
                </h3>

                <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        <span className="font-medium">{group.member_count?.toLocaleString() || 0}</span>
                    </span>
                    {group.type && (
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-xs capitalize">
                            {group.type}
                        </span>
                    )}
                </div>

                {group.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                        {group.description}
                    </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => onPost(group.group_id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                    >
                        {Icons.post}
                        Đăng bài
                    </button>
                    <button
                        onClick={() => onLeave(group)}
                        className={`px-4 py-2.5 border rounded-xl font-medium text-sm transition-all
                            ${isDark
                                ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-red-500/30 hover:text-red-400'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-red-200 hover:text-red-600'
                            }`}
                    >
                        Rời
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main page component
export function ZaloGroupsPage() {
    const [groups, setGroups] = useState<ZaloGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [zaloAccounts, setZaloAccounts] = useState<ZaloAccount[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

    // Post modal state
    const [showPostModal, setShowPostModal] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [postContent, setPostContent] = useState('');
    const [posting, setPosting] = useState(false);

    // Leave modal state
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [groupToLeave, setGroupToLeave] = useState<ZaloGroup | null>(null);
    const [leaving, setLeaving] = useState(false);
    const { toast } = useToast();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    // Fetch Zalo accounts
    useEffect(() => {
        apiClient.get('/zalo')
            .then(res => {
                const accounts = res.data.data || res.data;
                if (Array.isArray(accounts) && accounts.length > 0) {
                    setZaloAccounts(accounts);
                    setSelectedAccountId(accounts[0].id);
                }
            })
            .catch(console.error);
    }, []);

    // Fetch groups
    const fetchGroups = useCallback(async () => {
        if (!selectedAccountId) return;

        setLoading(true);
        try {
            const response = await apiClient.get('/scheduled-group-posts/available-groups', {
                params: { zalo_account_id: selectedAccountId }
            });
            if (response.data.success) {
                setGroups(response.data.data || []);
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
            await fetchGroups();
        } finally {
            setSyncing(false);
        }
    };

    // Post handlers
    const handleOpenPost = (groupId: string) => {
        setSelectedGroupId(groupId);
        setPostContent('');
        setShowPostModal(true);
    };

    const handlePost = async () => {
        if (!selectedAccountId || !selectedGroupId || !postContent.trim()) return;

        setPosting(true);
        try {
            const response = await apiClient.post('/scheduled-group-posts', {
                zalo_account_id: selectedAccountId,
                target_groups: [selectedGroupId],
                content: postContent,
                scheduled_at: new Date().toISOString(),
                repeat_type: 'once',
            });

            if (response.data.success) {
                setShowPostModal(false);
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setPosting(false);
        }
    };

    // Leave handlers
    const handleOpenLeave = (group: ZaloGroup) => {
        setGroupToLeave(group);
        setShowLeaveModal(true);
    };

    const handleLeave = async () => {
        if (!selectedAccountId || !groupToLeave) return;

        setLeaving(true);
        try {
            await apiClient.post(`/zalo/${selectedAccountId}/leave-group`, {
                group_id: groupToLeave.group_id
            });

            setGroups(prev => prev.filter(g => g.group_id !== groupToLeave.group_id));
            setShowLeaveModal(false);
            setGroupToLeave(null);
        } catch (err: any) {
            console.error('Failed to leave group:', err);
            toast.error('Không thể rời nhóm', err.response?.data?.error?.message || 'Vui lòng thử lại.');
        } finally {
            setLeaving(false);
        }
    };

    const selectedGroup = groups.find(g => g.group_id === selectedGroupId);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nhóm Zalo</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý và đăng bài đến các nhóm Zalo của bạn</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {zaloAccounts.length > 1 && (
                            <select
                                value={selectedAccountId || ''}
                                onChange={(e) => setSelectedAccountId(Number(e.target.value) || null)}
                                className="rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                {zaloAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name || acc.phone || `Zalo #${acc.id}`}
                                    </option>
                                ))}
                            </select>
                        )}
                        <button
                            onClick={handleSync}
                            disabled={syncing || !selectedAccountId}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                        >
                            <span className={syncing ? 'animate-spin' : ''}>
                                {Icons.sync}
                            </span>
                            Đồng bộ
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                {Icons.users}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{groups.length}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Nhóm</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {groups.reduce((sum, g) => sum + (g.member_count || 0), 0).toLocaleString()}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Thành viên</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.8 14.4c-.47.47-1.17.6-1.8.4l-2.4-.8c-.3.2-.6.3-1 .4-.5.1-1 .1-1.5 0-.5-.1-.9-.3-1.3-.6s-.7-.6-.9-1c-.2-.4-.4-.9-.4-1.4 0-.3.1-.7.2-1 .1-.3.3-.6.5-.8.2-.2.5-.4.8-.5.3-.1.6-.2 1-.2h.5l1.2-3.6c.1-.3.3-.5.5-.7.2-.2.5-.3.8-.3h2c.3 0 .5.1.7.3.2.2.3.4.3.7v2h1c.3 0 .6.1.8.3.2.2.3.5.3.8v2c0 .3-.1.6-.3.8z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{zaloAccounts.length}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tài khoản</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {zaloAccounts.filter(a => a.status === 'connected').length}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Đang online</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {!selectedAccountId ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.8 14.4c-.47.47-1.17.6-1.8.4l-2.4-.8c-.3.2-.6.3-1 .4-.5.1-1 .1-1.5 0-.5-.1-.9-.3-1.3-.6s-.7-.6-.9-1c-.2-.4-.4-.9-.4-1.4 0-.3.1-.7.2-1 .1-.3.3-.6.5-.8.2-.2.5-.4.8-.5.3-.1.6-.2 1-.2h.5l1.2-3.6c.1-.3.3-.5.5-.7.2-.2.5-.3.8-.3h2c.3 0 .5.1.7.3.2.2.3.4.3.7v2h1c.3 0 .6.1.8.3.2.2.3.5.3.8v2c0 .3-.1.6-.3.8z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Chưa có tài khoản Zalo</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                        Kết nối tài khoản Zalo để bắt đầu quản lý nhóm
                    </p>
                    <a
                        href="/employer/zalo"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                    >
                        Kết nối Zalo
                    </a>
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                        {Icons.users}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Chưa có nhóm nào</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                        Nhấn "Đồng bộ" để lấy danh sách nhóm từ tài khoản Zalo
                    </p>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50"
                    >
                        {Icons.sync}
                        Đồng bộ nhóm
                    </button>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {groups.map(group => (
                        <ZaloGroupCard
                            key={group.group_id}
                            group={group}
                            onPost={handleOpenPost}
                            onLeave={handleOpenLeave}
                            isDark={isDark}
                        />
                    ))}
                </div>
            )}

            {/* Post Modal */}
            {showPostModal && selectedGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Đăng bài đến nhóm</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{selectedGroup.name}</p>
                            </div>
                            <button
                                onClick={() => setShowPostModal(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {Icons.close}
                            </button>
                        </div>
                        <div className="p-5">
                            <textarea
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                rows={5}
                                placeholder="Nhập nội dung bài đăng..."
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                            />
                            <p className={`text-xs mt-2 flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <span>💡</span> Bài đăng sẽ được lên lịch và xử lý qua hệ thống
                            </p>
                        </div>
                        <div className="flex gap-3 p-5 pt-0">
                            <button
                                onClick={() => setShowPostModal(false)}
                                className={`flex-1 py-3 border rounded-xl font-medium text-sm transition-colors
                                    ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handlePost}
                                disabled={posting || !postContent.trim()}
                                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium text-sm disabled:opacity-50 hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                {posting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    Icons.post
                                )}
                                {posting ? 'Đang xử lý...' : 'Đăng bài'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Leave Confirmation Modal */}
            {showLeaveModal && groupToLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-center mb-2">
                            Rời khỏi nhóm?
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                            Bạn có chắc muốn rời khỏi nhóm <span className="font-medium text-slate-700 dark:text-slate-300">"{groupToLeave.name}"</span>? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowLeaveModal(false); setGroupToLeave(null); }}
                                className={`flex-1 py-3 border rounded-xl font-medium text-sm transition-colors
                                    ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleLeave}
                                disabled={leaving}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium text-sm disabled:opacity-50 hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                {leaving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    Icons.leave
                                )}
                                {leaving ? 'Đang rời...' : 'Rời nhóm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ZaloGroupsPage;
