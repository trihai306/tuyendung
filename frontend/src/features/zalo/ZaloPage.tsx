import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ConfirmModal, useToast } from '../../components/ui';
import zaloApi, { type ZaloAccount as ApiZaloAccount, type ZaloGroup } from '../../services/zaloApi';

// UI-specific type (maps from API type)
interface ZaloAccountUI {
    id: string;
    ownId: string;
    name: string;
    phone: string;
    avatar?: string;
    status: 'connected' | 'disconnected' | 'connecting';
    groups: ZaloGroup[];
    created_at: string;
    last_active?: string;
}

// QR Login Modal Component - Uses Laravel API + Soketi for real-time updates
function QRLoginModal({ isOpen, onClose, isDark }: { isOpen: boolean; onClose: () => void; isDark: boolean }) {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'waiting' | 'success' | 'error' | 'expired'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [countdown, setCountdown] = useState<number>(60);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const channelRef = useRef<any>(null);

    const initiateLogin = useCallback(async () => {
        // Clear existing intervals and channels
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (channelRef.current) {
            window.Echo?.leave(`zalo-login.${sessionId}`);
            channelRef.current = null;
        }

        setStatus('loading');
        setQrCode(null);
        setErrorMessage('');
        setCountdown(60);

        try {
            // Call Laravel API to initiate login (dispatches job)
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const token = localStorage.getItem('token');

            const response = await fetch(`${apiUrl}/zalo/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success && data.session_id) {
                setSessionId(data.session_id);

                // Listen to Soketi channel for QR updates
                if (window.Echo) {
                    channelRef.current = window.Echo.channel(`zalo-login.${data.session_id}`)
                        .listen('.login.progress', (event: any) => {
                            console.log('Zalo login progress:', event);

                            switch (event.stage) {
                                case 'starting':
                                    setStatus('loading');
                                    break;

                                case 'qr_generated':
                                    setQrCode(event.qr_code);
                                    setStatus('waiting');
                                    setCountdown(60);

                                    // Start countdown
                                    countdownRef.current = setInterval(() => {
                                        setCountdown(prev => {
                                            if (prev <= 1) {
                                                if (countdownRef.current) clearInterval(countdownRef.current);
                                                setStatus('expired');
                                                return 0;
                                            }
                                            return prev - 1;
                                        });
                                    }, 1000);
                                    break;

                                case 'login_success':
                                    setStatus('success');
                                    if (countdownRef.current) clearInterval(countdownRef.current);
                                    setTimeout(() => {
                                        onClose();
                                        window.location.reload();
                                    }, 1500);
                                    break;

                                case 'login_failed':
                                    setErrorMessage(event.error || 'Đăng nhập thất bại');
                                    setStatus('error');
                                    if (countdownRef.current) clearInterval(countdownRef.current);
                                    break;
                            }
                        });
                } else {
                    console.error('Echo not initialized');
                    setErrorMessage('Không thể kết nối real-time. Vui lòng tải lại trang.');
                    setStatus('error');
                }
            } else {
                setErrorMessage(data.error || 'Không thể khởi tạo đăng nhập');
                setStatus('error');
            }
        } catch (err) {
            console.error('QR login error:', err);
            setErrorMessage('Không thể kết nối đến server');
            setStatus('error');
        }
    }, [onClose, sessionId]);

    useEffect(() => {
        if (isOpen) {
            initiateLogin();
        }

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
            if (channelRef.current && sessionId) {
                window.Echo?.leave(`zalo-login.${sessionId}`);
            }
        };
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className={`relative w-full max-w-md mx-4 rounded-2xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
                }`}>
                {/* Header */}
                <div className={`p-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Đăng nhập Zalo
                                </h2>
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Quét mã QR bằng ứng dụng Zalo
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* QR Code Area */}
                    <div className={`w-64 h-64 mx-auto rounded-2xl flex items-center justify-center ${isDark ? 'bg-white' : 'bg-slate-50'
                        }`}>
                        {status === 'loading' ? (
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
                                <p className="text-sm text-slate-500">Đang tạo mã QR...</p>
                            </div>
                        ) : status === 'waiting' && qrCode ? (
                            <div className="text-center p-2">
                                <img
                                    src={qrCode}
                                    alt="QR Code"
                                    className="w-56 h-56 object-contain"
                                />
                            </div>
                        ) : status === 'success' ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-emerald-600 font-medium">Đăng nhập thành công!</p>
                            </div>
                        ) : status === 'expired' ? (
                            <div className="text-center p-4">
                                <svg className="w-12 h-12 mx-auto mb-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-amber-600 font-medium mb-3">Mã QR đã hết hạn</p>
                                <button
                                    onClick={initiateLogin}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    Tạo mã mới
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-red-500 p-4">
                                <svg className="w-12 h-12 mx-auto mb-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-sm">{errorMessage || 'Có lỗi xảy ra. Vui lòng thử lại.'}</p>
                                <button
                                    onClick={initiateLogin}
                                    className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    Thử lại
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Countdown Timer */}
                    {status === 'waiting' && (
                        <div className="mt-4 text-center">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${countdown <= 10
                                ? 'bg-red-100 text-red-600'
                                : countdown <= 30
                                    ? 'bg-amber-100 text-amber-600'
                                    : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                                }`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">
                                    {countdown <= 10 ? `Còn ${countdown}s - Quét nhanh!` : `Hết hạn sau ${countdown}s`}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className={`mt-6 space-y-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <div className="flex items-start gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                                }`}>1</span>
                            <span>Mở ứng dụng Zalo trên điện thoại</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                                }`}>2</span>
                            <span>Vào Cài đặt → Quét mã QR</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                                }`}>3</span>
                            <span>Quét mã QR trên màn hình này</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Account Card Component with Groups
function AccountCard({ account, isDark, onRefresh, onDelete, onDisconnect }: {
    account: ZaloAccountUI;
    isDark: boolean;
    onRefresh: () => void;
    onDelete: () => void;
    onDisconnect: () => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}>
            {/* Account Header */}
            <div className={`p-4 ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} transition-colors`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {account.name[0]}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${isDark ? 'border-slate-900' : 'border-white'
                                } ${account.status === 'connected' ? 'bg-emerald-500' :
                                    account.status === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                                }`} />
                        </div>

                        {/* Info */}
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {account.name}
                                </h3>
                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${account.status === 'connected'
                                    ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                    : account.status === 'connecting'
                                        ? isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700'
                                        : isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {account.status === 'connected' ? 'Đã kết nối' :
                                        account.status === 'connecting' ? 'Đang kết nối...' : 'Mất kết nối'}
                                </span>
                            </div>
                            <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                <span>{account.phone}</span>
                                <span>•</span>
                                <span>{account.groups.length} nhóm</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                                }`}
                            title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                        >
                            <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                        <button
                            onClick={onRefresh}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                                }`}
                            title="Đồng bộ"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        </button>
                        {/* Logout Button */}
                        {account.status === 'connected' && (
                            <button
                                onClick={onDisconnect}
                                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-amber-500/10 text-slate-400 hover:text-amber-400' : 'hover:bg-amber-50 text-slate-500 hover:text-amber-600'
                                    }`}
                                title="Đăng xuất Zalo"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={onDelete}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'
                                }`}
                            title="Xóa tài khoản"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Groups List */}
            {isExpanded && account.groups.length > 0 && (
                <div className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className={`px-4 py-2 ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                        <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Nhóm đã tham gia
                        </span>
                    </div>
                    <div className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-50'}`}>
                        {account.groups.map((group: ZaloGroup) => (
                            <div
                                key={group.id}
                                className={`px-4 py-3 flex items-center justify-between transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'
                                        }`}>
                                        <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {group.name}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <code className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {group.id}
                                            </code>
                                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {group.member_count} thành viên
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-500 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                                        }`} title="Gửi tin nhắn">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty Groups State */}
            {isExpanded && account.groups.length === 0 && (
                <div className={`border-t p-6 text-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Chưa có nhóm nào. Đồng bộ để cập nhật danh sách nhóm.
                    </p>
                </div>
            )}
        </div>
    );
}

// Main Page Component
export function ZaloPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { toast } = useToast();
    const [showQRModal, setShowQRModal] = useState(false);
    const [accounts, setAccounts] = useState<ZaloAccountUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Disconnect confirmation state
    const [disconnectAccount, setDisconnectAccount] = useState<ZaloAccountUI | null>(null);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // Delete confirmation state
    const [deleteAccountState, setDeleteAccountState] = useState<ZaloAccountUI | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Handle disconnect confirmation
    const handleDisconnectConfirm = async () => {
        if (!disconnectAccount) return;

        setIsDisconnecting(true);
        try {
            // Use secure Laravel API route instead of direct service call
            await zaloApi.disconnectAccount(parseInt(disconnectAccount.id));
            toast.success('Đã đăng xuất', `Tài khoản ${disconnectAccount.name} đã ngắt kết nối`);
            setDisconnectAccount(null);
            fetchAccounts(); // Refresh instead of reload
        } catch (err) {
            console.error('Disconnect error:', err);
            toast.error('Lỗi đăng xuất', 'Không thể đăng xuất. Vui lòng thử lại.');
        } finally {
            setIsDisconnecting(false);
        }
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        if (!deleteAccountState) return;

        setIsDeleting(true);
        try {
            await zaloApi.deleteAccount(parseInt(deleteAccountState.id));
            toast.success('Đã xóa', `Tài khoản ${deleteAccountState.name} đã được xóa`);
            setDeleteAccountState(null);
            // Refetch accounts
            fetchAccounts();
        } catch (err) {
            console.error('Delete error:', err);
            toast.error('Lỗi xóa tài khoản', 'Không thể xóa tài khoản. Vui lòng thử lại.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle sync/refresh groups
    const handleSyncGroups = async (account: ZaloAccountUI) => {
        try {
            toast.info('Đang đồng bộ...', `Đang tải nhóm cho ${account.name}`);
            await zaloApi.syncGroups(parseInt(account.id));
            toast.success('Đồng bộ thành công', `Đã cập nhật nhóm cho ${account.name}`);
            fetchAccounts(); // Refresh list
        } catch (err) {
            console.error('Sync error:', err);
            toast.error('Lỗi đồng bộ', 'Không thể đồng bộ nhóm. Vui lòng thử lại.');
        }
    };

    // Fetch accounts using zaloApi service
    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await zaloApi.getAccounts();
            // Map API response to UI format
            const mapped: ZaloAccountUI[] = data.map((acc: ApiZaloAccount) => ({
                id: acc.id.toString(),
                ownId: acc.own_id,
                name: acc.display_name || 'Unknown',
                phone: acc.phone || '',
                avatar: acc.avatar || undefined,
                status: acc.status,
                groups: acc.groups || [],
                created_at: acc.created_at,
                last_active: acc.last_active_at || undefined,
            }));
            setAccounts(mapped);
        } catch (err) {
            console.error('Failed to fetch Zalo accounts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const filteredAccounts = accounts.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.phone.includes(searchTerm) ||
        a.groups.some(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalGroups = accounts.reduce((sum, acc) => sum + acc.groups.length, 0);
    const connectedAccounts = accounts.filter(a => a.status === 'connected').length;

    return (
        <div>
            {/* Header */}
            <header className={`rounded-xl mb-6 ${isDark ? 'bg-slate-900' : 'bg-white'} border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Quản lý Zalo</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Quản lý tài khoản và tin nhắn Zalo
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowQRModal(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        Đăng nhập Zalo
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`rounded-xl p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-blue-500">{accounts.length}</div>
                            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tài khoản Zalo</div>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className={`rounded-xl p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-emerald-500">{connectedAccounts}</div>
                            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Đang kết nối</div>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className={`rounded-xl p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-amber-500">{totalGroups}</div>
                            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Nhóm đã tham gia</div>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className={`rounded-xl mb-6 p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}>
                <div className="relative">
                    <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tài khoản hoặc nhóm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none ${isDark
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                            : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
                            } border`}
                    />
                </div>
            </div>

            {/* Accounts List */}
            <div className="space-y-4">
                {loading ? (
                    <div className={`rounded-xl p-12 text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}>
                        <div className="animate-spin w-8 h-8 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Đang tải danh sách tài khoản...</p>
                    </div>
                ) : filteredAccounts.length === 0 ? (
                    <div className={`rounded-xl p-12 text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}>
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <svg className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Chưa có tài khoản Zalo
                        </h3>
                        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Quét mã QR để đăng nhập tài khoản Zalo đầu tiên
                        </p>
                        <button
                            onClick={() => setShowQRModal(true)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Đăng nhập Zalo
                        </button>
                    </div>
                ) : (
                    filteredAccounts.map((account) => (
                        <AccountCard
                            key={account.id}
                            account={account}
                            isDark={isDark}
                            onRefresh={() => handleSyncGroups(account)}
                            onDelete={() => setDeleteAccountState(account)}
                            onDisconnect={() => setDisconnectAccount(account)}
                        />
                    ))
                )}
            </div>

            {/* QR Login Modal */}
            <QRLoginModal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                isDark={isDark}
            />

            {/* Disconnect Confirmation Modal */}
            <ConfirmModal
                isOpen={!!disconnectAccount}
                onClose={() => setDisconnectAccount(null)}
                onConfirm={handleDisconnectConfirm}
                title="Đăng xuất Zalo"
                message={`Bạn có chắc muốn đăng xuất tài khoản "${disconnectAccount?.name}"? Bạn sẽ cần quét lại mã QR để kết nối lại.`}
                confirmText="Đăng xuất"
                cancelText="Hủy"
                variant="warning"
                isLoading={isDisconnecting}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteAccountState}
                onClose={() => setDeleteAccountState(null)}
                onConfirm={handleDeleteConfirm}
                title="Xóa tài khoản Zalo"
                message={`Bạn có chắc muốn xóa tài khoản "${deleteAccountState?.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
