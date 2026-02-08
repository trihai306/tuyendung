import { useState, createContext, useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { useTheme, ThemeToggle } from '../../contexts/ThemeContext';
import { NotificationDropdown } from '../../features/notifications';
import { Input, Button } from '../../components/ui';

// ==================== SIDEBAR CONTEXT ====================
interface SidebarContextType {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
    collapsed: false,
    setCollapsed: () => { },
});

export const useSidebar = () => useContext(SidebarContext);

// ==================== ICONS ====================
const Icons = {
    dashboard: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
    ),
    inbox: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    ),
    briefcase: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
    ),
    users: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    calendar: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    building: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
    ),
    zalo: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.8 14.4c-.47.47-1.17.6-1.8.4l-2.4-.8c-.3.2-.6.3-1 .4-.5.1-1 .1-1.5 0-.5-.1-.9-.3-1.3-.6s-.7-.6-.9-1c-.2-.4-.4-.9-.4-1.4 0-.3.1-.7.2-1 .1-.3.3-.6.5-.8.2-.2.5-.4.8-.5.3-.1.6-.2 1-.2h.5l1.2-3.6c.1-.3.3-.5.5-.7.2-.2.5-.3.8-.3h2c.3 0 .5.1.7.3.2.2.3.4.3.7v2h1c.3 0 .6.1.8.3.2.2.3.5.3.8v2c0 .3-.1.6-.3.8z" />
        </svg>
    ),
    facebook: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    ),
    shield: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
    settings: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    globe: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
    ),
    logout: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
    ),
    clock: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    userGroup: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    ),
    sparkles: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
    ),
};

// ==================== NAVIGATION STRUCTURE ====================
interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
    badge?: number;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const navigationSections: NavSection[] = [
    {
        title: 'TỔNG QUAN',
        items: [
            { name: 'Dashboard', path: '/employer/dashboard', icon: Icons.dashboard },
            { name: 'Hộp thư', path: '/employer/inbox', icon: Icons.inbox, badge: 12 },
        ],
    },
    {
        title: 'TUYỂN DỤNG',
        items: [
            { name: 'Quản lý tin', path: '/employer/jobs', icon: Icons.briefcase },
            { name: 'Ứng viên', path: '/employer/candidates', icon: Icons.users },
            { name: 'Lịch', path: '/employer/calendar', icon: Icons.calendar },
        ],
    },
    {
        title: 'KÊNH ĐĂNG TIN',
        items: [
            { name: 'Zalo', path: '/employer/zalo', icon: Icons.zalo },
            { name: 'Nhóm Zalo', path: '/employer/zalo-groups', icon: Icons.userGroup },
            { name: 'Facebook', path: '/employer/facebook', icon: Icons.facebook },
            { name: 'Nhóm Facebook', path: '/employer/facebook-groups', icon: Icons.facebook },
            { name: 'Tạo Poster', path: '/employer/poster', icon: Icons.sparkles },
        ],
    },
    {
        title: 'QUẢN LÝ',
        items: [
            { name: 'Doanh nghiệp', path: '/employer/company', icon: Icons.building },
            { name: 'Phân quyền', path: '/employer/permissions', icon: Icons.shield },
        ],
    },
];

const bottomItems: NavItem[] = [
    { name: 'Cài đặt', path: '/employer/settings', icon: Icons.settings },
    { name: 'Trang công khai', path: '/jobs', icon: Icons.globe },
];

// Page name mapping for breadcrumbs
const pageNameMap: Record<string, string> = {
    '/employer/dashboard': 'Dashboard',
    '/employer/inbox': 'Hộp thư',
    '/employer/jobs': 'Quản lý tin tuyển dụng',
    '/employer/candidates': 'Ứng viên',
    '/employer/calendar': 'Lịch',
    '/employer/company': 'Doanh nghiệp',
    '/employer/permissions': 'Phân quyền',
    '/employer/zalo': 'Zalo',
    '/employer/zalo-groups': 'Nhóm Zalo',
    '/employer/facebook': 'Facebook',
    '/employer/facebook-groups': 'Nhóm Facebook',
    '/employer/poster': 'Tạo Poster',
    '/employer/settings': 'Cài đặt',
    '/employer/notifications': 'Thông báo',
    '/employer/scheduled-posts': 'Lịch đăng tin',
};

// ==================== SIDEBAR COMPONENT ====================
function Sidebar() {
    const location = useLocation();
    const { collapsed, setCollapsed } = useSidebar();
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const { resolvedTheme } = useTheme();

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
    const isDark = resolvedTheme === 'dark';

    return (
        <aside
            className={`fixed top-0 left-0 h-full z-40 flex flex-col
                ${collapsed ? 'w-[68px]' : 'w-[264px]'}
                ${isDark
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/80'
                    : 'bg-gradient-to-b from-white via-white to-slate-50/50 border-r border-slate-200/80'
                }`}
            style={{ transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
            {/* Logo Header */}
            <div className={`h-16 flex items-center justify-between px-4 border-b ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow duration-300">
                            <span className="text-white font-bold text-lg">V</span>
                        </div>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300" />
                    </div>
                    {!collapsed && (
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                            Viecly
                        </span>
                    )}
                </Link>
                {!collapsed && (
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`p-2 rounded-lg transition-all duration-200 ${isDark
                            ? 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'
                            : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto">
                {navigationSections.map((section, sectionIdx) => (
                    <div key={section.title} className={sectionIdx > 0 ? 'mt-5' : ''}>
                        {/* Section Title */}
                        {!collapsed && (
                            <div className={`flex items-center gap-2 px-3 mb-2`}>
                                <span className={`text-[10px] font-bold tracking-[0.12em] uppercase ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {section.title}
                                </span>
                                <div className={`flex-1 h-px ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`} />
                            </div>
                        )}

                        {/* Section Items */}
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                                            ${collapsed ? 'justify-center' : ''}
                                            ${active
                                                ? isDark
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-emerald-50 text-emerald-700'
                                                : isDark
                                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                                            }`}
                                        title={collapsed ? item.name : undefined}
                                    >
                                        {/* Active Accent Bar */}
                                        {active && (
                                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full nav-accent-bar
                                                ${collapsed ? 'h-5' : 'h-6'}
                                                bg-gradient-to-b from-emerald-400 to-teal-500`}
                                                style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)' }}
                                            />
                                        )}

                                        <span className={`flex-shrink-0 transition-all duration-200
                                            ${active
                                                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                                : `group-hover:text-emerald-500 ${isDark ? '' : 'group-hover:scale-105'}`
                                            }`}
                                        >
                                            {item.icon}
                                        </span>
                                        {!collapsed && (
                                            <>
                                                <span className={`text-[13px] font-medium tracking-tight ${active ? 'font-semibold' : ''}`}>{item.name}</span>
                                                {item.badge && (
                                                    <span className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full tabular-nums
                                                        ${active
                                                            ? isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                                                            : isDark ? 'bg-slate-700/60 text-slate-400' : 'bg-slate-200/80 text-slate-500'
                                                        }`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Divider */}
                <div className={`my-5 mx-2 relative`}>
                    <div className={`h-px ${isDark ? 'bg-slate-800/60' : 'bg-slate-200/60'}`} />
                    <div className={`absolute inset-0 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-slate-700/30' : 'via-slate-300/30'} to-transparent`} />
                </div>

                {/* Bottom Navigation */}
                <div className="space-y-0.5">
                    {bottomItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                                    ${collapsed ? 'justify-center' : ''}
                                    ${active
                                        ? isDark
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-emerald-50 text-emerald-700'
                                        : isDark
                                            ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                                    }`}
                                title={collapsed ? item.name : undefined}
                            >
                                {active && (
                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full nav-accent-bar
                                        ${collapsed ? 'h-5' : 'h-6'}
                                        bg-gradient-to-b from-emerald-400 to-teal-500`}
                                        style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)' }}
                                    />
                                )}
                                <span className={`flex-shrink-0 transition-all duration-200
                                    ${active
                                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                        : 'group-hover:text-emerald-500'
                                    }`}
                                >
                                    {item.icon}
                                </span>
                                {!collapsed && <span className={`text-[13px] font-medium tracking-tight ${active ? 'font-semibold' : ''}`}>{item.name}</span>}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* User Profile Card */}
            <div className={`p-3 border-t ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
                <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 cursor-pointer
                    ${collapsed ? 'justify-center' : ''}
                    ${isDark
                        ? 'hover:bg-slate-800/60 bg-slate-800/30'
                        : 'hover:bg-slate-100/80 bg-slate-50/80'
                    }`}
                    style={{ backdropFilter: 'blur(8px)' }}
                >
                    <div className="relative flex-shrink-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold shadow-md
                            bg-gradient-to-br from-emerald-400 to-teal-500
                            ${isDark ? 'shadow-emerald-500/15' : 'shadow-emerald-500/25'}`}
                        >
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 rounded-full animate-pulse-glow
                            ${isDark ? 'border-slate-900' : 'border-white'}`}
                        />
                    </div>
                    {!collapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {user?.name || 'User'}
                                </p>
                                <p className={`text-[11px] truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {user?.email || 'user@email.com'}
                                </p>
                            </div>
                            <button
                                onClick={() => dispatch(logout())}
                                className={`p-2 rounded-lg transition-all duration-200 ${isDark
                                    ? 'hover:bg-red-500/10 text-slate-500 hover:text-red-400'
                                    : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                                    }`}
                                title="Đăng xuất"
                            >
                                {Icons.logout}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Expand button when collapsed */}
            {collapsed && (
                <button
                    onClick={() => setCollapsed(false)}
                    className={`absolute top-16 -right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110
                        ${isDark
                            ? 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                            : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200 shadow-md'
                        }`}
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            )}
        </aside>
    );
}

// ==================== HEADER COMPONENT ====================
function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { collapsed } = useSidebar();
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Get current page name for breadcrumb
    const currentPageName = pageNameMap[location.pathname] || 'Trang';

    return (
        <header
            className={`fixed top-0 right-0 h-16 z-30 flex items-center justify-between px-6 lg:px-8 transition-all duration-300
                ${collapsed ? 'left-[68px]' : 'left-[264px]'}
                ${isDark
                    ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50'
                    : 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60'
                }`}
            style={{ WebkitBackdropFilter: 'blur(20px)' }}
        >
            {/* Left: Breadcrumb + Page Title */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Quản lý
                    </span>
                    <svg className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {currentPageName}
                    </span>
                </div>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-md mx-8 hidden md:block">
                <div className="relative group">
                    <svg className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isDark ? 'text-slate-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <Input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="pl-10 pr-10"
                    />
                    <kbd className={`absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex text-[10px] px-1.5 py-0.5 rounded-md font-mono
                        ${isDark ? 'bg-slate-700/60 text-slate-400' : 'bg-slate-200/80 text-slate-500'}`}>
                        /
                    </kbd>
                </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-1.5">
                {/* Create New Button */}
                <Button
                    size="sm"
                    icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    }
                    className="hover:-translate-y-0.5"
                >
                    <span className="hidden sm:inline">Tạo mới</span>
                </Button>

                {/* Divider */}
                <div className={`w-px h-7 mx-1.5 ${isDark ? 'bg-slate-700/50' : 'bg-slate-200/80'}`} />

                {/* Theme Toggle */}
                <ThemeToggle className={`!p-2 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100'}`} />

                {/* Notifications */}
                <NotificationDropdown />

                {/* Messages */}
                <button className={`p-2 rounded-xl transition-all duration-200 relative
                    ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                </button>

                {/* Divider */}
                <div className={`w-px h-7 mx-1.5 ${isDark ? 'bg-slate-700/50' : 'bg-slate-200/80'}`} />

                {/* User Avatar */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className={`flex items-center gap-2 p-1 pr-2.5 rounded-xl transition-all duration-200
                        ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100'}`}
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-emerald-500/20">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>

                    {showUserMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                            <div
                                className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl z-50 overflow-hidden
                                    ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}
                                style={{ animation: 'dropdownIn 0.15s ease-out' }}
                            >
                                {/* User Info */}
                                <div className={`px-4 py-3.5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                {user?.name || 'User'}
                                            </p>
                                            <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {user?.email || ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-1.5">
                                    <Link
                                        to="/employer/settings"
                                        onClick={() => setShowUserMenu(false)}
                                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                                            ${isDark ? 'text-slate-300 hover:bg-slate-700/60' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                        Hồ sơ cá nhân
                                    </Link>
                                    <Link
                                        to="/employer/settings"
                                        onClick={() => setShowUserMenu(false)}
                                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                                            ${isDark ? 'text-slate-300 hover:bg-slate-700/60' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Cài đặt
                                    </Link>
                                </div>

                                {/* Logout */}
                                <div className={`border-t py-1.5 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            dispatch(logout());
                                            navigate('/login');
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                                            ${isDark ? 'text-red-400 hover:bg-slate-700/60' : 'text-red-600 hover:bg-red-50'}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                        </svg>
                                        Đăng xuất
                                    </button>
                                </div>

                                <style>{`@keyframes dropdownIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

// ==================== MAIN LAYOUT COMPONENT ====================
interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const { resolvedTheme } = useTheme();
    const location = useLocation();
    const isDark = resolvedTheme === 'dark';

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
            <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                {/* Subtle Background Gradient Orbs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl
                        ${isDark ? 'bg-emerald-500/[0.03]' : 'bg-emerald-500/[0.04]'}`} />
                    <div className={`absolute top-1/2 -left-20 w-60 h-60 rounded-full blur-3xl
                        ${isDark ? 'bg-teal-500/[0.02]' : 'bg-teal-500/[0.03]'}`} />
                    <div className={`absolute bottom-0 right-1/3 w-72 h-72 rounded-full blur-3xl
                        ${isDark ? 'bg-violet-500/[0.02]' : 'bg-violet-500/[0.02]'}`} />
                </div>

                <Sidebar />
                <Header />

                <main
                    className={`relative pt-16 min-h-screen transition-all duration-300 ${collapsed ? 'pl-[68px]' : 'pl-[264px]'}`}
                >
                    <div key={location.pathname} className="p-6 lg:p-8 animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarContext.Provider>
    );
}
