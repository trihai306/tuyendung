import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { useTheme } from '../../contexts/ThemeContext';

// Types
interface Member {
    id: number;
    name: string;
    email: string;
    company_role: 'owner' | 'admin' | 'member';
    permissions?: string[];
}

interface PermissionGroup {
    id: string;
    name: string;
    icon: React.ReactNode;
    permissions: Permission[];
}

interface Permission {
    key: string;
    label: string;
    description: string;
}

// Icons - defined before PERMISSION_GROUPS to avoid 'used before declaration' errors
const ShieldIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const BriefcaseIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
);

const UsersIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);

const InboxIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-17.5 0a2.25 2.25 0 00-2.25 2.25v3.75a2.25 2.25 0 002.25 2.25h19.5a2.25 2.25 0 002.25-2.25v-3.75a2.25 2.25 0 00-2.25-2.25" />
    </svg>
);

const ChartIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

const TeamIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
);

const ChevronIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const SaveIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
);

// Permission definitions
const PERMISSION_GROUPS: PermissionGroup[] = [
    {
        id: 'recruiting',
        name: 'Tuyển dụng',
        icon: <BriefcaseIcon />,
        permissions: [
            { key: 'jobs.view', label: 'Xem tin tuyển dụng', description: 'Xem danh sách các tin tuyển dụng' },
            { key: 'jobs.create', label: 'Tạo tin mới', description: 'Tạo và đăng tin tuyển dụng mới' },
            { key: 'jobs.edit', label: 'Chỉnh sửa tin', description: 'Sửa nội dung tin tuyển dụng' },
            { key: 'jobs.delete', label: 'Xóa tin', description: 'Xóa tin tuyển dụng' },
        ],
    },
    {
        id: 'candidates',
        name: 'Ứng viên',
        icon: <UsersIcon />,
        permissions: [
            { key: 'candidates.view', label: 'Xem hồ sơ', description: 'Xem thông tin ứng viên' },
            { key: 'candidates.manage', label: 'Quản lý pipeline', description: 'Di chuyển ứng viên giữa các giai đoạn' },
            { key: 'candidates.notes', label: 'Thêm ghi chú', description: 'Thêm ghi chú về ứng viên' },
        ],
    },
    {
        id: 'inbox',
        name: 'Inbox',
        icon: <InboxIcon />,
        permissions: [
            { key: 'inbox.view', label: 'Xem tin nhắn', description: 'Xem cuộc trò chuyện' },
            { key: 'inbox.reply', label: 'Trả lời tin nhắn', description: 'Gửi tin nhắn cho ứng viên' },
        ],
    },
    {
        id: 'reports',
        name: 'Báo cáo',
        icon: <ChartIcon />,
        permissions: [
            { key: 'reports.view', label: 'Xem báo cáo', description: 'Xem thống kê và báo cáo' },
            { key: 'reports.export', label: 'Xuất báo cáo', description: 'Xuất báo cáo ra file' },
        ],
    },
    {
        id: 'team',
        name: 'Team',
        icon: <TeamIcon />,
        permissions: [
            { key: 'team.view', label: 'Xem thành viên', description: 'Xem danh sách thành viên' },
            { key: 'team.invite', label: 'Mời thành viên', description: 'Mời người mới vào team' },
        ],
    },
];

// Default permissions by role
const DEFAULT_PERMISSIONS: Record<string, string[]> = {
    owner: PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key)),
    admin: PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key)),
    member: ['jobs.view', 'candidates.view', 'inbox.view', 'inbox.reply', 'reports.view', 'team.view'],
};

export function PermissionsPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [memberPermissions, setMemberPermissions] = useState<Record<number, string[]>>({});
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['recruiting', 'candidates', 'inbox']);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await apiClient.get('/company/members');
            const membersData = res.data.data.map((m: Member) => ({
                ...m,
                permissions: m.permissions || DEFAULT_PERMISSIONS[m.company_role] || [],
            }));
            setMembers(membersData);

            // Initialize permissions map
            const permMap: Record<number, string[]> = {};
            membersData.forEach((m: Member) => {
                permMap[m.id] = m.permissions || DEFAULT_PERMISSIONS[m.company_role] || [];
            });
            setMemberPermissions(permMap);

            if (membersData.length > 0) {
                setSelectedMember(membersData[0]);
            }
        } catch (err) {
            console.error('Failed to fetch members:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePermission = (permKey: string) => {
        if (!selectedMember || selectedMember.company_role === 'owner') return;

        const currentPerms = memberPermissions[selectedMember.id] || [];
        const newPerms = currentPerms.includes(permKey)
            ? currentPerms.filter(p => p !== permKey)
            : [...currentPerms, permKey];

        setMemberPermissions({ ...memberPermissions, [selectedMember.id]: newPerms });
        setHasChanges(true);
    };

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
        );
    };

    const handleSave = async () => {
        if (!selectedMember) return;
        setIsSaving(true);
        try {
            await apiClient.put(`/company/members/${selectedMember.id}/permissions`, {
                permissions: memberPermissions[selectedMember.id],
            });
            setHasChanges(false);
        } catch (err) {
            console.error('Failed to save permissions:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (selectedMember) {
            const original = members.find(m => m.id === selectedMember.id);
            if (original) {
                setMemberPermissions({
                    ...memberPermissions,
                    [selectedMember.id]: original.permissions || DEFAULT_PERMISSIONS[original.company_role] || [],
                });
            }
        }
        setHasChanges(false);
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    const roleLabels: Record<string, { label: string; color: string }> = {
        owner: { label: 'Chủ DN', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
        admin: { label: 'Admin', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
        member: { label: 'Nhân viên', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
            {/* Header */}
            <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <ShieldIcon />
                        </div>
                        <div>
                            <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Quản lý quyền
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Cấp quyền truy cập cho nhân viên trong công ty
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className={`grid lg:grid-cols-5 gap-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {/* Left Panel - Member List */}
                    <div className={`lg:col-span-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm thành viên..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${isDark
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                                        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                                        }`}
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[calc(100vh-300px)] overflow-y-auto">
                            {filteredMembers.map((member) => {
                                const role = roleLabels[member.company_role] || roleLabels.member;
                                const isSelected = selectedMember?.id === member.id;
                                return (
                                    <button
                                        key={member.id}
                                        onClick={() => setSelectedMember(member)}
                                        className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${isSelected
                                            ? isDark
                                                ? 'bg-emerald-900/20 border-l-4 border-emerald-500'
                                                : 'bg-emerald-50 border-l-4 border-emerald-500'
                                            : isDark
                                                ? 'hover:bg-slate-800'
                                                : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                {member.name}
                                            </p>
                                            <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {member.email}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                                            {role.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Panel - Permissions */}
                    <div className={`lg:col-span-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        {selectedMember ? (
                            <>
                                {/* Selected Member Header */}
                                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                            {selectedMember.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                {selectedMember.name}
                                            </h3>
                                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {roleLabels[selectedMember.company_role]?.label} • Quản lý quyền truy cập
                                            </p>
                                        </div>
                                    </div>
                                    {selectedMember.company_role === 'owner' && (
                                        <div className={`mt-3 px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
                                            <strong>Lưu ý:</strong> Chủ doanh nghiệp có toàn quyền và không thể thay đổi.
                                        </div>
                                    )}
                                </div>

                                {/* Permission Groups */}
                                <div className="p-4 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                                    {PERMISSION_GROUPS.map((group) => {
                                        const isExpanded = expandedGroups.includes(group.id);
                                        const currentPerms = memberPermissions[selectedMember.id] || [];
                                        const enabledCount = group.permissions.filter(p => currentPerms.includes(p.key)).length;

                                        return (
                                            <div
                                                key={group.id}
                                                className={`rounded-lg border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
                                            >
                                                <button
                                                    onClick={() => toggleGroup(group.id)}
                                                    className={`w-full flex items-center justify-between p-4 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                                                        } transition-colors rounded-t-lg`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                                                            }`}>
                                                            {group.icon}
                                                        </div>
                                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                            {group.name}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {enabledCount}/{group.permissions.length}
                                                        </span>
                                                    </div>
                                                    <ChevronIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                                                </button>

                                                {isExpanded && (
                                                    <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                                        {group.permissions.map((perm) => {
                                                            const isEnabled = currentPerms.includes(perm.key);
                                                            const isOwner = selectedMember.company_role === 'owner';
                                                            return (
                                                                <div
                                                                    key={perm.key}
                                                                    className={`flex items-center justify-between p-4 ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-5 h-5 rounded flex items-center justify-center ${isEnabled
                                                                            ? 'bg-emerald-500 text-white'
                                                                            : isDark ? 'bg-slate-700' : 'bg-slate-200'
                                                                            }`}>
                                                                            {isEnabled && <CheckIcon className="w-3 h-3" />}
                                                                        </div>
                                                                        <div>
                                                                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                                                {perm.label}
                                                                            </p>
                                                                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                                {perm.description}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => togglePermission(perm.key)}
                                                                        disabled={isOwner}
                                                                        className={`relative w-11 h-6 rounded-full transition-colors ${isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                                                            } ${isEnabled ? 'bg-emerald-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'}`}
                                                                    >
                                                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'
                                                                            }`} />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer Actions */}
                                {selectedMember.company_role !== 'owner' && (
                                    <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} flex justify-end gap-3`}>
                                        <button
                                            onClick={handleCancel}
                                            disabled={!hasChanges}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${isDark
                                                ? 'text-slate-300 hover:bg-slate-800'
                                                : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={!hasChanges || isSaving}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <SaveIcon />
                                                    Lưu thay đổi
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <ShieldIcon className={`w-12 h-12 mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                                    Chọn thành viên để quản lý quyền
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
