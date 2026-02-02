import { useState, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionApi } from '../../services/packageApi';
import type { Subscription } from '../../services/packageApi';
import { seatApi, type CompanySeats } from '../../services/seatApi';
import { LinkIcon, CreditCardIcon, TeamIcon, AIIcon, NotificationIcon } from '../../components/ui/icons';

interface PlatformAccount {
    id: number;
    platform: 'zalo' | 'facebook';
    account_name: string;
    status: 'active' | 'inactive' | 'expired';
    channels?: Channel[];
}

interface Channel {
    id: number;
    channel_name: string;
    channel_type: string;
    avatar_url?: string;
}

export function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'accounts' | 'team' | 'ai' | 'notifications' | 'subscription'>('accounts');
    const [accounts] = useState<PlatformAccount[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loadingSub, setLoadingSub] = useState(false);
    const [seats, setSeats] = useState<CompanySeats | null>(null);
    const [loadingSeats, setLoadingSeats] = useState(false);
    const [assignLoading, setAssignLoading] = useState<number | null>(null);

    useEffect(() => {
        if (activeTab === 'subscription') {
            loadSubscription();
            loadSeats();
        }
    }, [activeTab]);

    const loadSubscription = async () => {
        setLoadingSub(true);
        try {
            const data = await subscriptionApi.getCurrentSubscription();
            setSubscription(data);
        } catch (err) {
            console.error('Failed to load subscription', err);
        } finally {
            setLoadingSub(false);
        }
    };

    const loadSeats = async () => {
        setLoadingSeats(true);
        try {
            const data = await seatApi.getCompanySeats();
            setSeats(data);
        } catch (err) {
            console.error('Failed to load seats', err);
        } finally {
            setLoadingSeats(false);
        }
    };

    const handleAssign = async (userId: number) => {
        setAssignLoading(userId);
        try {
            await seatApi.assignSeat(userId);
            await loadSeats();
        } catch (err) {
            console.error('Failed to assign seat', err);
        } finally {
            setAssignLoading(null);
        }
    };

    const handleUnassign = async (userId: number) => {
        setAssignLoading(userId);
        try {
            await seatApi.unassignSeat(userId);
            await loadSeats();
        } catch (err) {
            console.error('Failed to unassign seat', err);
        } finally {
            setAssignLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h1>

                <div className="flex gap-6">
                    {/* Sidebar */}
                    <div className="w-64 flex-shrink-0">
                        <nav className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {[
                                { key: 'accounts', label: 'Kết nối tài khoản', icon: <LinkIcon className="w-5 h-5" /> },
                                { key: 'subscription', label: 'Gói dịch vụ', icon: <CreditCardIcon className="w-5 h-5" /> },
                                { key: 'team', label: 'Thành viên', icon: <TeamIcon className="w-5 h-5" /> },
                                { key: 'ai', label: 'AI Agent', icon: <AIIcon className="w-5 h-5" /> },
                                { key: 'notifications', label: 'Thông báo', icon: <NotificationIcon className="w-5 h-5" /> },
                            ].map((item: { key: string; label: string; icon: ReactNode }) => (
                                <button
                                    key={item.key}
                                    onClick={() => setActiveTab(item.key as typeof activeTab)}
                                    className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${activeTab === item.key ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700'
                                        }`}
                                >
                                    <span className={activeTab === item.key ? 'text-emerald-600' : 'text-gray-400'}>{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {activeTab === 'accounts' && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="font-semibold text-gray-900">Kết nối tài khoản</h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Kết nối Zalo OA hoặc Facebook Page để nhận tin nhắn
                                        </p>
                                    </div>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Thêm tài khoản
                                    </button>
                                </div>

                                {/* Platform Buttons */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <button className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                            <span className="text-2xl text-white font-bold">Z</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-gray-900">Zalo OA</div>
                                            <div className="text-sm text-gray-500">Kết nối Official Account</div>
                                        </div>
                                    </button>

                                    <button className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                            <span className="text-2xl text-white font-bold">f</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-gray-900">Facebook</div>
                                            <div className="text-sm text-gray-500">Kết nối Pages & Messenger</div>
                                        </div>
                                    </button>
                                </div>

                                {/* Connected Accounts */}
                                {accounts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <p>Chưa có tài khoản nào được kết nối</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {accounts.map((account) => (
                                            <div
                                                key={account.id}
                                                className="border border-gray-200 rounded-xl p-4 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${account.platform === 'zalo' ? 'bg-blue-600' : 'bg-blue-500'
                                                        }`}>
                                                        <span className="text-white font-bold">
                                                            {account.platform === 'zalo' ? 'Z' : 'f'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{account.account_name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {account.channels?.length || 0} kênh
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${account.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : account.status === 'expired'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {account.status === 'active' ? 'Hoạt động' : account.status === 'expired' ? 'Hết hạn' : 'Tạm dừng'}
                                                    </span>
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Cấu hình AI Agent</h2>

                                <div className="space-y-6">
                                    {/* Enable Toggle */}
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                                        <div>
                                            <div className="font-medium text-gray-900">Tự động trả lời</div>
                                            <div className="text-sm text-gray-500">AI tự động phản hồi tin nhắn từ ứng viên</div>
                                        </div>
                                        <button className="w-12 h-6 bg-gray-200 rounded-full relative">
                                            <span className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow"></span>
                                        </button>
                                    </div>

                                    {/* Confidence Threshold */}
                                    <div className="p-4 border border-gray-200 rounded-xl">
                                        <div className="font-medium text-gray-900 mb-2">Ngưỡng tự tin</div>
                                        <div className="text-sm text-gray-500 mb-4">
                                            AI chỉ gửi tự động khi độ tin cậy ≥ giá trị này
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                defaultValue="90"
                                                className="flex-1"
                                            />
                                            <span className="font-medium text-blue-600 w-12">90%</span>
                                        </div>
                                    </div>

                                    {/* Response Style */}
                                    <div className="p-4 border border-gray-200 rounded-xl">
                                        <div className="font-medium text-gray-900 mb-2">Phong cách trả lời</div>
                                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                                            <option value="professional">Chuyên nghiệp</option>
                                            <option value="friendly">Thân thiện</option>
                                            <option value="formal">Trang trọng</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'subscription' && (
                            <div className="space-y-6">
                                {/* Current Plan Card */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2 className="font-semibold text-gray-900 mb-4">Gói dịch vụ hiện tại</h2>

                                    {loadingSub ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                        </div>
                                    ) : subscription ? (
                                        <div className="border border-gray-200 rounded-xl p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {subscription.package?.name || 'Starter'}
                                                    </div>
                                                    <div className="text-gray-500 text-sm">
                                                        {subscription.status === 'active' ? (
                                                            <span className="text-emerald-600">✓ Đang hoạt động</span>
                                                        ) : subscription.status === 'pending' ? (
                                                            <span className="text-yellow-600">⏳ Chờ thanh toán</span>
                                                        ) : (
                                                            <span className="text-gray-500">⏸ {subscription.status}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-emerald-600">
                                                        {subscription.package?.formatted_price || 'Miễn phí'}
                                                    </div>
                                                    <div className="text-gray-500 text-sm">/tháng</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-100">
                                                <div className="text-center">
                                                    <div className="text-xl font-bold text-gray-900">
                                                        {subscription.package?.max_jobs === -1 ? '∞' : subscription.package?.max_jobs || 3}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Tin tuyển dụng</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xl font-bold text-gray-900">
                                                        {subscription.package?.max_candidates === -1 ? '∞' : subscription.package?.max_candidates || 50}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Ứng viên</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xl font-bold text-gray-900">
                                                        {subscription.package?.max_users || 2}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Thành viên</div>
                                                </div>
                                            </div>

                                            {subscription.expires_at && (
                                                <div className="text-sm text-gray-500 pt-4 border-t border-gray-100">
                                                    Hết hạn: {new Date(subscription.expires_at).toLocaleDateString('vi-VN')}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Chưa có gói dịch vụ. <Link to="/pricing" className="text-emerald-600 hover:underline">Chọn gói ngay</Link>
                                        </div>
                                    )}
                                </div>

                                {/* Seats Management */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2 className="font-semibold text-gray-900 mb-4">Quản lý Seats</h2>

                                    {loadingSeats ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                        </div>
                                    ) : seats?.has_seats ? (
                                        <div className="space-y-4">
                                            {/* Seat Overview */}
                                            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-900">{seats.total_seats}</div>
                                                    <div className="text-xs text-gray-500">Tổng seats</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-emerald-600">{seats.used_seats}</div>
                                                    <div className="text-xs text-gray-500">Đang dùng</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-teal-600">{seats.available_seats}</div>
                                                    <div className="text-xs text-gray-500">Còn trống</div>
                                                </div>
                                            </div>

                                            {seats.expires_at && (
                                                <div className="text-sm text-gray-500">
                                                    Hết hạn: {new Date(seats.expires_at).toLocaleDateString('vi-VN')}
                                                </div>
                                            )}

                                            {/* Assigned Users */}
                                            {seats.assigned_users.length > 0 && (
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Đã gán ({seats.assigned_users.length})</h3>
                                                    <div className="space-y-2">
                                                        {seats.assigned_users.map((user) => (
                                                            <div key={user.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleUnassign(user.id)}
                                                                    disabled={assignLoading === user.id}
                                                                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded-lg"
                                                                >
                                                                    {assignLoading === user.id ? '...' : 'Bỏ gán'}
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Available to Assign */}
                                            {seats.available_seats > 0 && seats.company_users.filter(u => !seats.assigned_users.find(a => a.id === u.id)).length > 0 && (
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Chưa gán</h3>
                                                    <div className="space-y-2">
                                                        {seats.company_users
                                                            .filter(u => !seats.assigned_users.find(a => a.id === u.id))
                                                            .map((user) => (
                                                                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                    <div>
                                                                        <div className="font-medium text-gray-900">{user.name}</div>
                                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleAssign(user.id)}
                                                                        disabled={assignLoading === user.id}
                                                                        className="px-3 py-1 text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg"
                                                                    >
                                                                        {assignLoading === user.id ? '...' : 'Gán seat'}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}

                                            <Link
                                                to="/pricing"
                                                className="block text-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                            >
                                                + Mua thêm seats
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="text-4xl mb-4">💼</div>
                                            <p className="text-gray-500 mb-4">Chưa có seats nào.</p>
                                            <Link
                                                to="/pricing"
                                                className="inline-block px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                            >
                                                Mua seats ngay
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Upgrade Card */}
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-sm p-6 text-white">
                                    <h3 className="font-semibold text-lg mb-2">Giá: 500.000₫ / nhân viên / tháng</h3>
                                    <ul className="text-emerald-100 mb-4 text-sm space-y-1">
                                        <li>✓ Tin nhắn không giới hạn</li>
                                        <li>✓ Đăng bài tự động Facebook/Zalo</li>
                                        <li>✓ AI tự động trả lời</li>
                                    </ul>
                                    <Link
                                        to="/pricing"
                                        className="inline-block bg-white text-emerald-600 px-6 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                                    >
                                        Xem chi tiết →
                                    </Link>
                                </div>
                            </div>
                        )}

                        {activeTab === 'team' && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Quản lý thành viên</h2>
                                <p className="text-gray-500">Tính năng đang phát triển...</p>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Cài đặt thông báo</h2>
                                <p className="text-gray-500">Tính năng đang phát triển...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
