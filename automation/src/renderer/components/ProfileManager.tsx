import { useState, useEffect, useCallback } from 'react';

// Types
export interface BrowserProfile {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    userAgent?: string;
    viewport?: { width: number; height: number };
    locale?: string;
    timezone?: string;
    proxy?: {
        server: string;
        username?: string;
        password?: string;
    };
    colorScheme?: 'light' | 'dark' | 'no-preference';
    notes?: string;
}

interface ProfileFormData {
    name: string;
    userAgent?: string;
    viewport?: { width: number; height: number };
    locale?: string;
    timezone?: string;
    proxy?: {
        server: string;
        username?: string;
        password?: string;
    };
    colorScheme?: 'light' | 'dark' | 'no-preference';
    notes?: string;
}

interface ProfileManagerProps {
    onLaunchProfile: (profileId: string) => void;
    browserRunning: boolean;
}

const API_URL = 'http://localhost:3005';

const DEFAULT_USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
];

const VIEWPORTS = [
    { label: '1920x1080 (Full HD)', width: 1920, height: 1080 },
    { label: '1366x768 (HD)', width: 1366, height: 768 },
    { label: '1440x900 (MacBook)', width: 1440, height: 900 },
    { label: '1536x864', width: 1536, height: 864 },
];

export function ProfileManager({ onLaunchProfile, browserRunning }: ProfileManagerProps) {
    const [profiles, setProfiles] = useState<BrowserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProfile, setEditingProfile] = useState<BrowserProfile | null>(null);
    const [formData, setFormData] = useState<ProfileFormData>({
        name: '',
        viewport: { width: 1920, height: 1080 },
        locale: 'vi-VN',
        timezone: 'Asia/Ho_Chi_Minh',
        colorScheme: 'light',
    });

    // Fetch profiles
    const fetchProfiles = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/profiles`);
            const data = await res.json();
            if (data.success) {
                setProfiles(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch profiles:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    // Create/Update profile
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingProfile
                ? `${API_URL}/api/profiles/${editingProfile.id}`
                : `${API_URL}/api/profiles`;

            const res = await fetch(url, {
                method: editingProfile ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                fetchProfiles();
                resetForm();
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
        }
    };

    // Delete profile
    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa profile này?')) return;

        try {
            const res = await fetch(`${API_URL}/api/profiles/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                fetchProfiles();
            }
        } catch (error) {
            console.error('Failed to delete profile:', error);
        }
    };

    // Duplicate profile
    const handleDuplicate = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/api/profiles/${id}/duplicate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            if (data.success) {
                fetchProfiles();
            }
        } catch (error) {
            console.error('Failed to duplicate profile:', error);
        }
    };

    // Edit profile
    const handleEdit = (profile: BrowserProfile) => {
        setEditingProfile(profile);
        setFormData({
            name: profile.name,
            userAgent: profile.userAgent,
            viewport: profile.viewport,
            locale: profile.locale,
            timezone: profile.timezone,
            proxy: profile.proxy,
            colorScheme: profile.colorScheme,
            notes: profile.notes,
        });
        setShowForm(true);
    };

    // Reset form
    const resetForm = () => {
        setShowForm(false);
        setEditingProfile(null);
        setFormData({
            name: '',
            viewport: { width: 1920, height: 1080 },
            locale: 'vi-VN',
            timezone: 'Asia/Ho_Chi_Minh',
            colorScheme: 'light',
        });
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>👤</span> Browser Profiles
                </h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary text-sm"
                >
                    + New Profile
                </button>
            </div>

            {/* Profile List */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="spinner"></div>
                </div>
            ) : profiles.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <p>Chưa có profile nào.</p>
                    <p className="text-sm mt-1">Tạo profile mới để lưu cấu hình browser.</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {profiles.map((profile) => (
                        <div
                            key={profile.id}
                            className="flex items-center justify-between p-3 bg-[var(--color-dark-tertiary)] rounded-lg border border-[var(--color-dark-border)] hover:border-[var(--color-primary-500)] transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-white truncate">{profile.name}</h3>
                                <div className="text-xs text-gray-400 mt-0.5 flex gap-2">
                                    {profile.viewport && (
                                        <span>{profile.viewport.width}x{profile.viewport.height}</span>
                                    )}
                                    {profile.proxy && (
                                        <span className="text-blue-400">🔒 Proxy</span>
                                    )}
                                    {profile.locale && (
                                        <span>{profile.locale}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                <button
                                    onClick={() => onLaunchProfile(profile.id)}
                                    disabled={browserRunning}
                                    className="btn btn-success text-xs py-1 px-2"
                                    title="Launch với profile này"
                                >
                                    🚀
                                </button>
                                <button
                                    onClick={() => handleEdit(profile)}
                                    className="btn btn-secondary text-xs py-1 px-2"
                                    title="Chỉnh sửa"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDuplicate(profile.id)}
                                    className="btn btn-secondary text-xs py-1 px-2"
                                    title="Nhân bản"
                                >
                                    📋
                                </button>
                                <button
                                    onClick={() => handleDelete(profile.id)}
                                    className="btn btn-danger text-xs py-1 px-2"
                                    title="Xóa"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Profile Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[var(--color-dark-secondary)] rounded-xl border border-[var(--color-dark-border)] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            {editingProfile ? 'Chỉnh sửa Profile' : 'Tạo Profile Mới'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="form-label">Tên Profile *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="VD: Facebook Account 1"
                                    required
                                />
                            </div>

                            {/* Viewport */}
                            <div>
                                <label className="form-label">Kích thước màn hình</label>
                                <select
                                    className="form-input"
                                    value={`${formData.viewport?.width}x${formData.viewport?.height}`}
                                    onChange={e => {
                                        const [width, height] = e.target.value.split('x').map(Number);
                                        setFormData({ ...formData, viewport: { width, height } });
                                    }}
                                >
                                    {VIEWPORTS.map(v => (
                                        <option key={`${v.width}x${v.height}`} value={`${v.width}x${v.height}`}>
                                            {v.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* User Agent */}
                            <div>
                                <label className="form-label">User Agent</label>
                                <select
                                    className="form-input"
                                    value={formData.userAgent || ''}
                                    onChange={e => setFormData({ ...formData, userAgent: e.target.value || undefined })}
                                >
                                    <option value="">Random (mặc định)</option>
                                    {DEFAULT_USER_AGENTS.map((ua, i) => (
                                        <option key={i} value={ua}>
                                            {ua.includes('Windows') ? '🪟 Windows' : '🍎 Mac'} Chrome
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Locale & Timezone */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="form-label">Ngôn ngữ</label>
                                    <select
                                        className="form-input"
                                        value={formData.locale}
                                        onChange={e => setFormData({ ...formData, locale: e.target.value })}
                                    >
                                        <option value="vi-VN">🇻🇳 Tiếng Việt</option>
                                        <option value="en-US">🇺🇸 English (US)</option>
                                        <option value="en-GB">🇬🇧 English (UK)</option>
                                        <option value="ja-JP">🇯🇵 日本語</option>
                                        <option value="ko-KR">🇰🇷 한국어</option>
                                        <option value="zh-CN">🇨🇳 中文</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Múi giờ</label>
                                    <select
                                        className="form-input"
                                        value={formData.timezone}
                                        onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                    >
                                        <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
                                        <option value="America/New_York">New York (UTC-5)</option>
                                        <option value="America/Los_Angeles">Los Angeles (UTC-8)</option>
                                        <option value="Europe/London">London (UTC+0)</option>
                                        <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                                        <option value="Asia/Singapore">Singapore (UTC+8)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Color Scheme */}
                            <div>
                                <label className="form-label">Giao diện</label>
                                <select
                                    className="form-input"
                                    value={formData.colorScheme}
                                    onChange={e => setFormData({ ...formData, colorScheme: e.target.value as any })}
                                >
                                    <option value="light">☀️ Sáng</option>
                                    <option value="dark">🌙 Tối</option>
                                    <option value="no-preference">⚙️ Hệ thống</option>
                                </select>
                            </div>

                            {/* Proxy */}
                            <div>
                                <label className="form-label">Proxy (tùy chọn)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.proxy?.server || ''}
                                    onChange={e => setFormData({
                                        ...formData,
                                        proxy: e.target.value ? { ...formData.proxy, server: e.target.value } : undefined,
                                    })}
                                    placeholder="http://proxy.example.com:8080"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="form-label">Ghi chú</label>
                                <textarea
                                    className="form-input resize-none"
                                    rows={2}
                                    value={formData.notes || ''}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Ghi chú về profile này..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="btn btn-primary flex-1">
                                    {editingProfile ? 'Lưu thay đổi' : 'Tạo Profile'}
                                </button>
                                <button type="button" onClick={resetForm} className="btn btn-secondary">
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
