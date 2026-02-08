import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

interface FacebookAccount {
    id: number;
    name: string;
    account_name: string;
    account_id?: string;
    status: string;
    is_active: boolean;
    is_default: boolean;
    metadata?: {
        profile_url?: string;
        avatar_url?: string;
        groups_count?: number;
    };
    created_at: string;
    updated_at: string;
}

// Icons
const Icons = {
    facebook: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    ),
    plus: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    sync: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    trash: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
    groups: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    ),
    check: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

// Account Card Component
function FacebookAccountCard({
    account,
    onSync,
    onDelete,
    onSetDefault,
}: {
    account: FacebookAccount;
    onSync: (id: number) => void;
    onDelete: (account: FacebookAccount) => void;
    onSetDefault: (id: number) => void;
}) {
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        await onSync(account.id);
        setSyncing(false);
    };

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${account.is_default
            ? 'border-blue-500 shadow-lg shadow-blue-500/10'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
            }`}>
            {/* Header with gradient */}
            <div className="h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

                {account.is_default && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1">
                        {Icons.check}
                        Mặc định
                    </div>
                )}

                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${account.status === 'connected'
                        ? 'bg-green-500/20 text-green-100'
                        : account.status === 'expired'
                            ? 'bg-amber-500/20 text-amber-100'
                            : 'bg-red-500/20 text-red-100'
                        }`}>
                        {account.status === 'connected' ? '● Online' : account.status === 'expired' ? '● Hết hạn' : '● Offline'}
                    </span>
                </div>
            </div>

            {/* Avatar */}
            <div className="relative -mt-12 px-5">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                    {account.metadata?.avatar_url ? (
                        <img src={account.metadata.avatar_url} alt={account.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600">
                            {Icons.facebook}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 pt-3">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
                    {account.name || account.account_name}
                </h3>
                {account.account_name && account.name !== account.account_name && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">@{account.account_name}</p>
                )}

                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                        {Icons.groups}
                        <span className="font-medium">{account.metadata?.groups_count || 0}</span> nhóm
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-5">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                    >
                        <span className={syncing ? 'animate-spin' : ''}>{Icons.sync}</span>
                        {syncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
                    </button>
                    {!account.is_default && (
                        <button
                            onClick={() => onSetDefault(account.id)}
                            className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            title="Đặt làm mặc định"
                        >
                            {Icons.check}
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(account)}
                        className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-red-500 dark:text-red-400 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-colors"
                        title="Xóa tài khoản"
                    >
                        {Icons.trash}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main Page Component
export function FacebookPage() {
    const [accounts, setAccounts] = useState<FacebookAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<FacebookAccount | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch accounts
    const fetchAccounts = async () => {
        try {
            const response = await apiClient.get('/platform-accounts', {
                params: { platform: 'facebook' }
            });
            setAccounts(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch Facebook accounts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    // Sync account groups
    const handleSync = async (accountId: number) => {
        try {
            await apiClient.post('/facebook-groups/sync', {
                platform_account_id: accountId
            });
            await fetchAccounts();
        } catch (err) {
            console.error('Failed to sync:', err);
        }
    };

    // Set default account
    const handleSetDefault = async (accountId: number) => {
        try {
            await apiClient.put(`/platform-accounts/${accountId}/set-default`);
            setAccounts(prev => prev.map(acc => ({
                ...acc,
                is_default: acc.id === accountId
            })));
        } catch (err) {
            console.error('Failed to set default:', err);
        }
    };

    // Delete account
    const handleOpenDelete = (account: FacebookAccount) => {
        setAccountToDelete(account);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!accountToDelete) return;
        setDeleting(true);
        try {
            await apiClient.delete(`/platform-accounts/${accountToDelete.id}`);
            setAccounts(prev => prev.filter(acc => acc.id !== accountToDelete.id));
            setShowDeleteModal(false);
            setAccountToDelete(null);
        } catch (err) {
            console.error('Failed to delete:', err);
        } finally {
            setDeleting(false);
        }
    };

    const connectedCount = accounts.filter(a => a.status === 'connected').length;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                {Icons.facebook}
                            </span>
                            Quản lý Facebook
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Kết nối và quản lý tài khoản Facebook để đăng bài tự động</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                        {Icons.plus}
                        Thêm tài khoản
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                {Icons.facebook}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{accounts.length}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tài khoản</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{connectedCount}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Đang kết nối</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                {Icons.groups}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {accounts.reduce((sum, a) => sum + (a.metadata?.groups_count || 0), 0)}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Nhóm</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {accounts.filter(a => a.status === 'expired').length}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Cần gia hạn</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : accounts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                        {Icons.facebook}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Chưa có tài khoản Facebook</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                        Thêm tài khoản Facebook để bắt đầu quản lý nhóm và đăng bài tự động
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                    >
                        {Icons.plus}
                        Thêm tài khoản
                    </button>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {accounts.map(account => (
                        <FacebookAccountCard
                            key={account.id}
                            account={account}
                            onSync={handleSync}
                            onDelete={handleOpenDelete}
                            onSetDefault={handleSetDefault}
                        />
                    ))}
                </div>
            )}

            {/* Add Account Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Thêm tài khoản Facebook</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {Icons.close}
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                                    {Icons.facebook}
                                </div>
                                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Đăng nhập với Facebook</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    Chúng tôi sẽ sử dụng cookies để đăng bài tự động. Dữ liệu được mã hóa và bảo mật.
                                </p>
                                <button
                                    onClick={() => {
                                        // Open Facebook login flow
                                        window.open('/api/auth/facebook/redirect', '_blank', 'width=600,height=700');
                                        setShowAddModal(false);
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                                >
                                    {Icons.facebook}
                                    Tiếp tục với Facebook
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && accountToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                            {Icons.trash}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-center mb-2">
                            Xóa tài khoản?
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                            Bạn có chắc muốn xóa tài khoản <span className="font-medium text-slate-700 dark:text-slate-300">"{accountToDelete.name}"</span>? Tất cả nhóm liên kết sẽ bị xóa.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setAccountToDelete(null); }}
                                className="flex-1 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium text-sm disabled:opacity-50 hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : null}
                                {deleting ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FacebookPage;
