import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { useTheme } from '../../contexts/ThemeContext';
import { CompanyIcon, TeamIcon, BriefcaseIcon, CheckIcon } from '../../components/ui/icons';

// Types
interface Company {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    industry: string | null;
    size: string;
    website: string | null;
    address: string | null;
    phone: string | null;
}

interface Member {
    id: number;
    name: string;
    email: string;
    company_role: 'owner' | 'admin' | 'member';
    created_at: string;
}

interface CompanyData {
    company: Company | null;
    role: string;
    is_owner: boolean;
    is_admin: boolean;
}

interface CompanyStats {
    active_jobs: number;
    total_candidates: number;
    team_members: number;
    response_rate: number;
    avg_time_to_hire: number;
}

interface QuickMetrics {
    hired_this_month: number;
    hired_change: number;
    response_rate: number;
    avg_time_to_hire: number;
}

interface Activity {
    id: string;
    type: 'candidate_applied' | 'interview_scheduled' | 'offer_sent' | 'member_added' | 'job_created';
    title: string;
    description: string;
    time_formatted: string;
}

type TabType = 'overview' | 'team' | 'analytics' | 'settings';

const SIZE_OPTIONS = [
    { value: '1-10', label: '1-10 nhân viên' },
    { value: '11-50', label: '11-50 nhân viên' },
    { value: '51-200', label: '51-200 nhân viên' },
    { value: '201-500', label: '201-500 nhân viên' },
    { value: '500+', label: 'Trên 500 nhân viên' },
];

const INDUSTRY_OPTIONS = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
    'Manufacturing', 'Real Estate', 'Media', 'Consulting', 'Other'
];

export function CompanyPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [stats, setStats] = useState<CompanyStats | null>(null);
    const [metrics, setMetrics] = useState<QuickMetrics | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [formData, setFormData] = useState<Partial<Company>>({});

    useEffect(() => { fetchCompany(); }, []);
    useEffect(() => {
        if (companyData?.company) {
            fetchStats();
            fetchActivities();
        }
    }, [companyData]);
    useEffect(() => {
        if (activeTab === 'team' && companyData?.company) fetchMembers();
    }, [activeTab, companyData]);

    const fetchCompany = async () => {
        try {
            const res = await apiClient.get('/company');
            setCompanyData(res.data.data);
            if (res.data.data?.company) setFormData(res.data.data.company);
        } catch (err) { console.error('Failed to fetch company:', err); }
        finally { setIsLoading(false); }
    };

    const fetchStats = async () => {
        setIsLoadingStats(true);
        try {
            const res = await apiClient.get('/company/stats');
            setStats(res.data.data.stats);
            setMetrics(res.data.data.metrics);
        } catch (err) { console.error('Failed to fetch stats:', err); }
        finally { setIsLoadingStats(false); }
    };

    const fetchActivities = async () => {
        try {
            const res = await apiClient.get('/company/activities?limit=10');
            setActivities(res.data.data);
        } catch (err) { console.error('Failed to fetch activities:', err); }
    };

    const fetchMembers = async () => {
        try {
            const res = await apiClient.get('/company/members');
            setMembers(res.data.data);
        } catch (err) { console.error('Failed to fetch members:', err); }
    };

    const handleSave = async () => {
        try {
            if (companyData?.company) await apiClient.put('/company', formData);
            else await apiClient.post('/company', formData);
            await fetchCompany();
            setIsEditing(false);
        } catch (err) { console.error('Failed to save company:', err); }
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!confirm('Bạn có chắc muốn xóa thành viên này?')) return;
        try {
            await apiClient.delete(`/company/members/${memberId}`);
            await fetchMembers();
        } catch (err) { console.error('Failed to remove member:', err); }
    };

    const handleUpdateRole = async (memberId: number, newRole: string) => {
        try {
            await apiClient.put(`/company/members/${memberId}`, { role: newRole });
            await fetchMembers();
        } catch (err) { console.error('Failed to update role:', err); }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    if (!companyData?.company && !isEditing) {
        return <NoCompanyState onCreateClick={() => {
            setIsEditing(true);
            setActiveTab('settings');
        }} />;
    }

    const company = companyData?.company;
    const canManage = companyData?.is_admin || companyData?.is_owner;

    const tabs = [
        { id: 'overview' as const, label: 'Tổng quan', icon: <OverviewIcon /> },
        { id: 'team' as const, label: 'Thành viên', icon: <TeamIcon className="w-4 h-4" /> },
        { id: 'analytics' as const, label: 'Báo cáo', icon: <ChartIcon /> },
        { id: 'settings' as const, label: 'Cài đặt', icon: <SettingsIcon /> },
    ];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
            {/* Header */}
            <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b sticky top-0 z-10`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
                                {company?.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{company?.name}</h1>
                                    <span className={`flex items-center gap-1 px-2 py-0.5 ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'} text-xs font-medium rounded-full`}>
                                        <CheckIcon className="w-3 h-3" /> Đã xác minh
                                    </span>
                                </div>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{company?.industry} • {SIZE_OPTIONS.find(o => o.value === company?.size)?.label}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {canManage && (
                                <>
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className={`hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'} rounded-lg transition-colors`}
                                    >
                                        <PlusIcon /> Thêm thành viên
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                                        <BriefcaseIcon className="w-4 h-4" /> Đăng tin
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? `border-emerald-600 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`
                                    : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-300 hover:border-slate-600' : 'text-slate-500 hover:text-slate-700 hover:border-slate-300'}`
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === 'overview' && (
                    <OverviewTab
                        stats={stats}
                        metrics={metrics}
                        activities={activities}
                        members={members.slice(0, 5)}
                        isLoading={isLoadingStats}
                        onInviteClick={() => setShowInviteModal(true)}
                        canManage={canManage}
                        isDark={isDark}
                    />
                )}
                {activeTab === 'team' && (
                    <TeamTab
                        members={members}
                        canManage={canManage}
                        onInviteClick={() => setShowInviteModal(true)}
                        onRemove={handleRemoveMember}
                        onUpdateRole={handleUpdateRole}
                        isDark={isDark}
                    />
                )}
                {activeTab === 'analytics' && <AnalyticsTab stats={stats} isDark={isDark} />}
                {activeTab === 'settings' && (
                    <SettingsTab
                        company={company}
                        formData={formData}
                        setFormData={setFormData}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onSave={handleSave}
                        canManage={canManage}
                        isDark={isDark}
                    />
                )}
            </div>

            {/* Modals */}
            {showInviteModal && (
                <InviteMemberModal
                    onClose={() => setShowInviteModal(false)}
                    onSuccess={() => { setShowInviteModal(false); fetchMembers(); }}
                    isDark={isDark}
                />
            )}
        </div>
    );
}

// =============== TAB COMPONENTS ===============

function OverviewTab({ stats, metrics, activities, members, isLoading, onInviteClick, canManage, isDark }: {
    stats: CompanyStats | null;
    metrics: QuickMetrics | null;
    activities: Activity[];
    members: Member[];
    isLoading: boolean;
    onInviteClick: () => void;
    canManage?: boolean;
    isDark: boolean;
}) {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => <div key={i} className={`h-28 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-white'}`} />)
                ) : (
                    <>
                        <StatCard icon={<BriefcaseIcon className="w-5 h-5" />} value={stats?.active_jobs ?? 0} label="Tin đang tuyển" sublabel="vị trí mở" color="emerald" />
                        <StatCard icon={<UsersIcon />} value={stats?.total_candidates ?? 0} label="Ứng viên" sublabel="trong pipeline" color="blue" />
                        <StatCard icon={<CheckCircleIcon />} value={metrics?.hired_this_month ?? 0} label="Tuyển tháng này" change={metrics?.hired_change} color="teal" />
                        <StatCard icon={<ClockIcon />} value={stats?.avg_time_to_hire ?? 0} label="Thời gian TB" sublabel="ngày" color="amber" />
                    </>
                )}
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Activity Feed */}
                <div className={`lg:col-span-2 rounded-xl border p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Hoạt động gần đây</h3>
                        <button className={`text-sm hover:underline ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Xem tất cả</button>
                    </div>
                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <p className={`text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Chưa có hoạt động nào</p>
                        ) : (
                            activities.slice(0, 6).map((activity) => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))
                        )}
                    </div>
                </div>

                {/* Team Overview */}
                <div className={`rounded-xl border p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Team</h3>
                        {canManage && (
                            <button onClick={onInviteClick} className={`text-sm hover:underline ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Quản lý</button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {members.map((member) => (
                            <div key={member.id} className="group relative">
                                <div className={`w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium text-sm ring-2 ${isDark ? 'ring-slate-900' : 'ring-white'}`}>
                                    {member.name.charAt(0)}
                                </div>
                                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none ${isDark ? 'bg-slate-700' : 'bg-slate-800'}`}>
                                    {member.name}
                                </div>
                            </div>
                        ))}
                        {canManage && (
                            <button
                                onClick={onInviteClick}
                                className={`w-10 h-10 border-2 border-dashed rounded-full flex items-center justify-center hover:border-emerald-400 hover:text-emerald-500 transition-colors ${isDark ? 'border-slate-600 text-slate-500' : 'border-slate-300 text-slate-400'}`}
                            >
                                <PlusIcon />
                            </button>
                        )}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {members.length} thành viên đang hoạt động
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickMetricCard title="Tỷ lệ phản hồi" value={`${metrics?.response_rate ?? 0}%`} sublabel="Trả lời < 24h" />
                <QuickMetricCard title="Ứng viên mới" value="--" sublabel="Hôm nay" />
                <QuickMetricCard title="Phỏng vấn tuần này" value="--" sublabel="Đã lên lịch" />
                <QuickMetricCard title="Offer chờ phản hồi" value="--" sublabel="Đang chờ" />
            </div>
        </div>
    );
}

function TeamTab({ members, canManage, onInviteClick, onRemove, onUpdateRole, isDark: _isDark }: {
    members: Member[];
    canManage?: boolean;
    onInviteClick: () => void;
    onRemove: (id: number) => void;
    onUpdateRole: (id: number, role: string) => void;
    isDark: boolean;
}) {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filtered = members.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || m.company_role === roleFilter;
        return matchSearch && matchRole;
    });

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Thành viên ({members.length})</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-48"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="owner">Chủ DN</option>
                            <option value="admin">Admin</option>
                            <option value="member">Nhân viên</option>
                        </select>
                        {canManage && (
                            <button
                                onClick={onInviteClick}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <PlusIcon /> Thêm thành viên
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((member) => (
                    <MemberRow
                        key={member.id}
                        member={member}
                        canManage={Boolean(canManage && member.company_role !== 'owner')}
                        onRemove={() => onRemove(member.id)}
                        onUpdateRole={(role) => onUpdateRole(member.id, role)}
                    />
                ))}
            </div>
        </div>
    );
}

function AnalyticsTab({ stats: _stats, isDark: _isDark }: { stats: CompanyStats | null; isDark: boolean }) {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Báo cáo tuyển dụng</h3>
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Funnel */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">Funnel tuyển dụng</h4>
                        <FunnelBar label="Ứng tuyển" value={156} max={156} color="emerald" />
                        <FunnelBar label="Sàng lọc" value={89} max={156} color="blue" />
                        <FunnelBar label="Phỏng vấn" value={45} max={156} color="amber" />
                        <FunnelBar label="Offer" value={18} max={156} color="teal" />
                        <FunnelBar label="Tuyển" value={12} max={156} color="green" />
                    </div>
                    {/* Sources */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">Nguồn ứng viên</h4>
                        <SourceBar label="LinkedIn" value={45} />
                        <SourceBar label="Facebook" value={32} />
                        <SourceBar label="Website" value={28} />
                        <SourceBar label="Referral" value={15} />
                        <SourceBar label="Khác" value={10} />
                    </div>
                </div>
            </div>
            <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <DownloadIcon /> Xuất Excel
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <DownloadIcon /> Xuất PDF
                </button>
            </div>
        </div>
    );
}

function SettingsTab({ company, formData, setFormData, isEditing, setIsEditing, onSave, canManage, isDark: _isDark }: {
    company: Company | null | undefined;
    formData: Partial<Company>;
    setFormData: (data: Partial<Company>) => void;
    isEditing: boolean;
    setIsEditing: (v: boolean) => void;
    onSave: () => void;
    canManage?: boolean;
    isDark: boolean;
}) {
    if (isEditing) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <EditCompanyForm formData={formData} setFormData={setFormData} onSave={onSave} onCancel={() => { setIsEditing(false); setFormData(company || {}); }} />
            </div>
        );
    }
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Thông tin doanh nghiệp</h2>
                {canManage && (
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                        Chỉnh sửa
                    </button>
                )}
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
                <InfoItem label="Tên doanh nghiệp" value={company?.name} />
                <InfoItem label="Ngành nghề" value={company?.industry} />
                <InfoItem label="Quy mô" value={SIZE_OPTIONS.find(o => o.value === company?.size)?.label} />
                <InfoItem label="Website" value={company?.website} isLink />
                <InfoItem label="Số điện thoại" value={company?.phone} />
                <InfoItem label="Địa chỉ" value={company?.address} />
                <div className="sm:col-span-2">
                    <InfoItem label="Mô tả" value={company?.description} />
                </div>
            </div>
        </div>
    );
}

// =============== SMALL COMPONENTS ===============

function NoCompanyState({ onCreateClick }: { onCreateClick: () => void }) {
    return (
        <div className="max-w-md mx-auto mt-20">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                    <CompanyIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Chưa có doanh nghiệp</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Tạo doanh nghiệp để bắt đầu quản lý team tuyển dụng</p>
                <button onClick={onCreateClick} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors">
                    Tạo doanh nghiệp
                </button>
            </div>
        </div>
    );
}

function StatCard({ icon, value, label, sublabel, change, color }: {
    icon: React.ReactNode; value: number; label: string; sublabel?: string; change?: number; color: string;
}) {
    const colors: Record<string, string> = {
        emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        teal: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
        amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    };
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">{label}</div>
            {sublabel && <div className="text-xs text-slate-400 dark:text-slate-500">{sublabel}</div>}
            {change !== undefined && (
                <div className={`text-xs font-medium mt-1 ${change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {change >= 0 ? '+' : ''}{change}% so tháng trước
                </div>
            )}
        </div>
    );
}

function QuickMetricCard({ title, value, sublabel }: { title: string; value: string; sublabel: string }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{title}</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500">{sublabel}</div>
        </div>
    );
}

function ActivityItem({ activity }: { activity: Activity }) {
    const icons: Record<string, { bg: string; icon: React.ReactNode }> = {
        candidate_applied: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: <PlusIcon className="text-emerald-600 dark:text-emerald-400" /> },
        interview_scheduled: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: <CalendarIcon className="text-blue-600 dark:text-blue-400" /> },
        offer_sent: { bg: 'bg-amber-100 dark:bg-amber-900/30', icon: <MailIcon className="text-amber-600 dark:text-amber-400" /> },
        member_added: { bg: 'bg-teal-100 dark:bg-teal-900/30', icon: <UsersIcon className="text-teal-600 dark:text-teal-400" /> },
        job_created: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', icon: <BriefcaseIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> },
    };
    const { bg, icon } = icons[activity.type] || icons.candidate_applied;
    return (
        <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{activity.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{activity.description}</p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">{activity.time_formatted}</span>
        </div>
    );
}

function MemberRow({ member, canManage, onRemove, onUpdateRole }: {
    member: Member; canManage: boolean; onRemove: () => void; onUpdateRole: (role: string) => void;
}) {
    const roleLabels: Record<string, { label: string; color: string }> = {
        owner: { label: 'Chủ DN', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
        admin: { label: 'Admin', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
        member: { label: 'Nhân viên', color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' },
    };
    const role = roleLabels[member.company_role] || roleLabels.member;
    return (
        <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
                {member.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{member.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{member.email}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${role.color}`}>{role.label}</span>
            {canManage && (
                <div className="flex items-center gap-2">
                    <select value={member.company_role} onChange={(e) => onUpdateRole(e.target.value)} className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        <option value="admin">Admin</option>
                        <option value="member">Nhân viên</option>
                    </select>
                    <button onClick={onRemove} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <TrashIcon />
                    </button>
                </div>
            )}
        </div>
    );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const colors: Record<string, string> = { emerald: 'bg-emerald-500', blue: 'bg-blue-500', amber: 'bg-amber-500', teal: 'bg-teal-500', green: 'bg-green-500' };
    const pct = (value / max) * 100;
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-300">{label}</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{value}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${colors[color]} rounded-full`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function SourceBar({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-300 w-20">{label}</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${value}%` }} />
            </div>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100 w-10 text-right">{value}%</span>
        </div>
    );
}

function InfoItem({ label, value, isLink }: { label: string; value?: string | null; isLink?: boolean }) {
    return (
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
            {value ? (
                isLink ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">{value}</a> : <p className="text-slate-800 dark:text-slate-100">{value}</p>
            ) : <p className="text-slate-400 dark:text-slate-500 italic">Chưa cập nhật</p>}
        </div>
    );
}

function EditCompanyForm({ formData, setFormData, onSave, onCancel }: {
    formData: Partial<Company>; setFormData: (d: Partial<Company>) => void; onSave: () => void; onCancel: () => void;
}) {
    return (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Chỉnh sửa thông tin</h2>
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tên doanh nghiệp *</label>
                    <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ngành nghề</label>
                    <select value={formData.industry || ''} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                        <option value="">Chọn ngành nghề</option>
                        {INDUSTRY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mô tả</label>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" placeholder="Giới thiệu về doanh nghiệp..." />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quy mô</label>
                    <select value={formData.size || '1-10'} onChange={(e) => setFormData({ ...formData, size: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                        {SIZE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
                    <input type="url" value={formData.website || ''} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="https://" />
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Số điện thoại</label>
                    <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Địa chỉ</label>
                    <input type="text" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">Lưu thay đổi</button>
            </div>
        </form>
    );
}

function InviteMemberModal({ onClose, onSuccess, isDark: _isDark }: { onClose: () => void; onSuccess: () => void; isDark: boolean }) {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await apiClient.post('/company/members', form);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md shadow-2xl">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Thêm thành viên mới</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Họ tên *</label>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mật khẩu *</label>
                            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Tối thiểu 8 ký tự" required />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Thành viên sẽ dùng mật khẩu này để đăng nhập</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vai trò</label>
                            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                <option value="admin">Quản trị viên</option>
                                <option value="member">Nhân viên</option>
                            </select>
                        </div>
                        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Hủy</button>
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                                {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// =============== ICONS ===============
const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
);
const UsersIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
);
const CheckCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const CalendarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
);
const MailIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
);
const TrashIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
);
const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
);
const DownloadIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
);
const OverviewIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
);
const ChartIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
);
const SettingsIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
