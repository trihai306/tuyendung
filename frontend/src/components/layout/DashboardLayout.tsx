import { useState, createContext, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { useTheme, ThemeToggle } from '../../contexts/ThemeContext';
import { NotificationDropdown } from '../../features/notifications';

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

// ==================== NAVIGATION ITEMS ====================
const navigationItems = [
    {
        name: 'Tổng quan',
        path: '/employer/dashboard',
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
        ),
    },
    {
        name: 'Hộp thư',
        path: '/employer/inbox',
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
        ),
        badge: 12,
    },
    {
        name: 'Tuyển dụng',
        path: '/employer/jobs',
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
        ),
    },
    {
        name: 'Lịch',
        path: '/employer/calendar',
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
        ),
    },
    {
        name: 'Ứng viên',
        path: '/employer/candidates',
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        ),
    },
    {
        name: 'Doanh nghiệp',
        path: '/employer/company',
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
        ),
    },
    {
        name: 'Zalo',
        path: '/employer/zalo',
        icon: (
            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.8 14.4c-.47.47-1.17.6-1.8.4l-2.4-.8c-.3.2-.6.3-1 .4-.5.1-1 .1-1.5 0-.5-.1-.9-.3-1.3-.6s-.7-.6-.9-1c-.2-.4-.4-.9-.4-1.4 0-.3.1-.7.2-1 .1-.3.3-.6.5-.8.2-.2.5-.4.8-.5.3-.1.6-.2 1-.2h.5l1.2-3.6c.1-.3.3-.5.5-.7.2-.2.5-.3.8-.3h2c.3 0 .5.1.7.3.2.2.3.4.3.7v2h1c.3 0 .6.1.8.3.2.2.3.5.3.8v2c0 .3-.1.6-.3.8z" />
            </svg>
        ),
    },
    {
        name: 'Phân quyền',
        path: '/employer/permissions',
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
    },
];

const bottomNavigationItems = [
    {
        name: 'Cài đặt',
        path: '/employer/settings',
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        name: 'Trang tuyển dụng',
        path: '/jobs',
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
        ),
    },
];

// ==================== SIDEBAR COMPONENT ====================
function Sidebar() {
    const location = useLocation();
    const { collapsed, setCollapsed } = useSidebar();
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const { resolvedTheme } = useTheme();

    const isActive = (path: string) => location.pathname.startsWith(path);
    const isDark = resolvedTheme === 'dark';

    return (
        <aside
            className={`fixed top-0 left-0 h-full z-40 transition-all duration-200 flex flex-col
                ${collapsed ? 'w-16' : 'w-60'}
                ${isDark
                    ? 'bg-slate-900 border-r border-slate-800/80'
                    : 'bg-white border-r border-slate-200'
                }`}
        >
            {/* Logo Header - Compact */}
            <div className={`h-14 flex items-center justify-between px-3 border-b
                ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
                <Link to="/" className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="Viecly" className="w-8 h-8 rounded-lg shadow-md shadow-emerald-500/25" />
                    {!collapsed && (
                        <span className="text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                            Viecly
                        </span>
                    )}
                </Link>
                {!collapsed && (
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`p-1.5 rounded-md transition-colors ${isDark
                            ? 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'
                            : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Main Navigation - Compact */}
            <nav className="flex-1 py-2 px-2 overflow-y-auto">
                <div className="space-y-0.5">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150
                                ${isActive(item.path)
                                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                                    : isDark
                                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            title={collapsed ? item.name : undefined}
                        >
                            <span className={`flex-shrink-0 ${isActive(item.path) ? '' : 'group-hover:text-emerald-500'}`}>
                                {item.icon}
                            </span>
                            {!collapsed && (
                                <>
                                    <span className="text-[13px] font-medium">{item.name}</span>
                                    {item.badge && (
                                        <span className={`ml-auto text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${isActive(item.path)
                                            ? 'bg-white/25 text-white'
                                            : isDark
                                                ? 'bg-emerald-500/15 text-emerald-400'
                                                : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Divider */}
                <div className={`my-3 mx-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />

                {/* Bottom Navigation */}
                <div className="space-y-0.5">
                    {bottomNavigationItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150
                                ${isActive(item.path)
                                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                                    : isDark
                                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            title={collapsed ? item.name : undefined}
                        >
                            <span className={`flex-shrink-0 ${isActive(item.path) ? '' : 'group-hover:text-emerald-500'}`}>
                                {item.icon}
                            </span>
                            {!collapsed && <span className="text-[13px] font-medium">{item.name}</span>}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* User Profile - Minimal */}
            <div className={`p-2 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
                <div className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors cursor-pointer
                    ${collapsed ? 'justify-center' : ''}
                    ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}`}>
                    <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 rounded-full ${isDark ? 'border-slate-900' : 'border-white'}`} />
                    </div>
                    {!collapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className={`text-[13px] font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {user?.name || 'User'}
                                </p>
                            </div>
                            <button
                                onClick={() => dispatch(logout())}
                                className={`p-1.5 rounded-md transition-colors ${isDark
                                    ? 'hover:bg-red-500/10 text-slate-500 hover:text-red-400'
                                    : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                                    }`}
                                title="Đăng xuất"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Expand button when collapsed */}
            {collapsed && (
                <button
                    onClick={() => setCollapsed(false)}
                    className={`absolute top-14 -right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors
                        ${isDark
                            ? 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                            : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'
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
    const { collapsed } = useSidebar();
    const user = useAppSelector((state) => state.auth.user);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <header
            className={`fixed top-0 right-0 h-14 z-30 flex items-center justify-between px-4 transition-all duration-200
                ${collapsed ? 'left-16' : 'left-60'}
                ${isDark
                    ? 'bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/80'
                    : 'bg-white/95 backdrop-blur-sm border-b border-slate-200'
                }`}
        >
            {/* Search Bar - More compact */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30
                            ${isDark
                                ? 'bg-slate-800/60 text-white placeholder:text-slate-500 border border-slate-700/50 focus:border-emerald-500/50'
                                : 'bg-slate-50 text-slate-800 placeholder:text-slate-400 border border-transparent focus:bg-white focus:border-emerald-500/30'
                            }`}
                    />
                    <kbd className={`absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded
                        ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Action Buttons - Tighter spacing */}
            <div className="flex items-center gap-1 ml-4">
                {/* Create New Button */}
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="hidden sm:inline">Tạo mới</span>
                </button>

                {/* Divider */}
                <div className={`w-px h-6 mx-1.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

                {/* Theme Toggle */}
                <ThemeToggle className={`!p-2 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} />

                {/* Notifications */}
                <NotificationDropdown />

                {/* Messages */}
                <button className={`p-2 rounded-lg transition-colors
                    ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                </button>

                {/* Divider */}
                <div className={`w-px h-6 mx-1.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

                {/* User Avatar */}
                <button className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors
                    ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                    <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <svg className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
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

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
            <div className={`min-h-screen transition-colors duration-200 ${resolvedTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
                <Sidebar />
                <Header />
                <main className={`pt-14 h-screen overflow-hidden transition-all duration-200 ${collapsed ? 'pl-16' : 'pl-60'}`}>
                    <div className="p-4 h-full flex flex-col">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarContext.Provider>
    );
}
