import { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Play,
    ScrollText,
    Minus,
    Square,
    X,
    Bot,
    Sparkles,
    Activity,
    LogOut,
    Wifi,
    WifiOff,
    RefreshCw,
    ChevronDown,
    Shield,
    Zap,
    Settings,
    Search,
    Bell,
    LayoutGrid,
} from 'lucide-react';
import ProfilesPage from './pages/ProfilesPage';
import AutomationPage from './pages/AutomationPage';
import LogsPage from './pages/LogsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { getApi } from './api';
import type { AuthUser } from './types';

const api = getApi();

type Page = 'profiles' | 'automation' | 'logs';
type AuthView = 'login' | 'register' | 'app';
type AgentStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const NAV_ITEMS: Array<{ id: Page; label: string; icon: typeof Users; desc: string; badge?: string }> = [
    { id: 'profiles', label: 'Profiles', icon: Users, desc: 'Quan ly trinh duyet' },
    { id: 'automation', label: 'Automation', icon: Play, desc: 'Tu dong hoa' },
    { id: 'logs', label: 'Nhat ky', icon: ScrollText, desc: 'Lich su chay' },
];

const AGENT_STATUS_MAP: Record<AgentStatus, { label: string; color: string; dot: string; bg: string }> = {
    disconnected: { label: 'Offline', color: 'text-gray-400', dot: 'bg-gray-500', bg: 'bg-gray-500/10' },
    connecting: { label: 'Dang ket noi...', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse', bg: 'bg-amber-500/10' },
    connected: { label: 'Online', color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/10' },
    error: { label: 'Loi', color: 'text-red-400', dot: 'bg-red-400', bg: 'bg-red-500/10' },
};

const PAGE_TITLES: Record<Page, { title: string; subtitle: string }> = {
    profiles: { title: 'Browser Profiles', subtitle: 'Quan ly trinh duyet va cau hinh' },
    automation: { title: 'Automation Studio', subtitle: 'Cau hinh va chay tu dong hoa' },
    logs: { title: 'Activity Logs', subtitle: 'Theo doi lich su thao tac' },
};

export default function App() {
    const [authView, setAuthView] = useState<AuthView>('login');
    const [currentPage, setCurrentPage] = useState<Page>('profiles');
    const [activeBrowsers, setActiveBrowsers] = useState(0);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [authError, setAuthError] = useState('');
    const [agentStatus, setAgentStatus] = useState<AgentStatus>('disconnected');
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update clock every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Check existing auth on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const status = await api.getAuthStatus();
                if (status.isAuthenticated && status.user) {
                    setUser(status.user);
                    setAuthView('app');
                    const verified = await api.verifyAuth();
                    if (verified) {
                        setUser(verified);
                    } else {
                        setAuthView('login');
                        setUser(null);
                    }
                }
            } catch {
                // Not authenticated
            }
            setIsCheckingAuth(false);
        };
        checkAuth();
    }, []);

    // Listen for agent status changes
    useEffect(() => {
        if (authView !== 'app') return;
        const cleanup = api.onAgentStatus((data) => {
            setAgentStatus(data.status as AgentStatus);
        });
        api.getAgentStatus().then(data => setAgentStatus(data.status as AgentStatus));
        return cleanup;
    }, [authView]);

    // Listen for auth changes from main process
    useEffect(() => {
        const cleanup = api.onAuthChanged((data) => {
            if (data.isAuthenticated && data.user) {
                setUser(data.user);
                setAuthView('app');
            } else {
                setUser(null);
                setAuthView('login');
            }
        });
        return cleanup;
    }, []);

    // Load active browsers
    useEffect(() => {
        if (authView !== 'app') return;
        const load = async () => {
            const browsers = await api.getActiveBrowsers();
            setActiveBrowsers(browsers.length);
        };
        load();
        const cleanup = api.onBrowserEvent(() => load());
        return cleanup;
    }, [authView]);

    const handleLogin = async (email: string, password: string) => {
        setAuthError('');
        try {
            const result = await api.login(email, password);
            if (result.success && result.user) {
                setUser(result.user);
                setAuthView('app');
            } else {
                setAuthError(result.error || 'Dang nhap that bai');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Dang nhap that bai';
            setAuthError(message);
        }
    };

    const handleRegister = async (data: { name: string; email: string; password: string; plan: string }) => {
        setAuthError('');
        try {
            const result = await api.login(data.email, data.password);
            if (result.success && result.user) {
                setUser(result.user);
                setAuthView('app');
            } else {
                setAuthError(result.error || 'Dang ky that bai');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Dang ky that bai';
            setAuthError(message);
        }
    };

    const handleLogout = async () => {
        setShowUserMenu(false);
        await api.logout();
        setUser(null);
        setAgentStatus('disconnected');
        setAuthView('login');
    };

    const handleReconnect = async () => {
        await api.reconnectAgent();
    };

    // Loading state
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#06060a]">
                <div className="text-center animate-fadeIn">
                    <div className="relative mx-auto mb-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand shadow-2xl shadow-indigo-600/30">
                            <Bot className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute inset-0 rounded-2xl gradient-brand opacity-40 blur-xl animate-glow" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Dang kiem tra phien...</p>
                </div>
            </div>
        );
    }

    // Auth views
    if (authView === 'login') {
        return (
            <LoginPage
                onLogin={handleLogin}
                onGoRegister={() => { setAuthError(''); setAuthView('register'); }}
                error={authError}
            />
        );
    }
    if (authView === 'register') {
        return (
            <RegisterPage
                onRegister={handleRegister}
                onGoLogin={() => { setAuthError(''); setAuthView('login'); }}
                error={authError}
            />
        );
    }

    const statusInfo = AGENT_STATUS_MAP[agentStatus];
    const pageInfo = PAGE_TITLES[currentPage];

    // Main app layout
    return (
        <div className="flex h-screen overflow-hidden bg-[#06060a]">
            {/* === SIDEBAR === */}
            <aside className="w-[260px] flex flex-col bg-[#08080d] border-r border-white/[0.04] relative overflow-hidden select-none">
                {/* Ambient decoration */}
                <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-indigo-600/[0.07] blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-indigo-600/[0.03] to-transparent pointer-events-none" />

                {/* Brand / Titlebar */}
                <div
                    className="h-[52px] flex items-center gap-3 px-5 shrink-0 relative z-10"
                    style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
                >
                    <div className="relative" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] gradient-brand shadow-lg shadow-indigo-600/25">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                        <h1 className="text-[13px] font-bold text-white tracking-tight leading-none">AutoApp</h1>
                        <p className="text-[9px] text-gray-500 mt-0.5 font-medium tracking-wide uppercase">Stealth Browser</p>
                    </div>
                    <div className="flex items-center gap-0.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                        <button onClick={() => api.minimize()} className="flex h-6 w-6 items-center justify-center rounded-md text-gray-600 hover:bg-white/[0.06] hover:text-gray-400 transition-all">
                            <Minus className="h-3 w-3" />
                        </button>
                        <button onClick={() => api.maximize()} className="flex h-6 w-6 items-center justify-center rounded-md text-gray-600 hover:bg-white/[0.06] hover:text-gray-400 transition-all">
                            <Square className="h-2.5 w-2.5" />
                        </button>
                        <button onClick={() => api.close()} className="flex h-6 w-6 items-center justify-center rounded-md text-gray-600 hover:bg-red-500/10 hover:text-red-400 transition-all">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                {/* Status bar */}
                <div className="px-3 pt-2 pb-1 relative z-10">
                    <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                        {/* Agent connection */}
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusInfo.dot}`} />
                            {agentStatus === 'connected' ? (
                                <Wifi className={`h-3 w-3 shrink-0 ${statusInfo.color}`} />
                            ) : (
                                <WifiOff className={`h-3 w-3 shrink-0 ${statusInfo.color}`} />
                            )}
                            <span className={`text-[10px] font-medium truncate ${statusInfo.color}`}>{statusInfo.label}</span>
                        </div>

                        {/* Separator */}
                        <div className="w-px h-3 bg-white/[0.06]" />

                        {/* Active browsers */}
                        <div className="flex items-center gap-1.5">
                            <Activity className={`h-3 w-3 ${activeBrowsers > 0 ? 'text-emerald-400' : 'text-gray-600'}`} />
                            <span className={`text-[10px] font-mono font-medium ${activeBrowsers > 0 ? 'text-emerald-400' : 'text-gray-600'}`}>{activeBrowsers}</span>
                        </div>

                        {/* Reconnect button */}
                        {(agentStatus === 'disconnected' || agentStatus === 'error') && (
                            <>
                                <div className="w-px h-3 bg-white/[0.06]" />
                                <button onClick={handleReconnect}
                                    className="flex h-5 w-5 items-center justify-center rounded-md text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                                    title="Ket noi lai">
                                    <RefreshCw className="h-2.5 w-2.5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 pt-4 pb-2 relative z-10 overflow-y-auto">
                    <p className="text-[9px] font-bold text-gray-600/80 uppercase tracking-[0.15em] px-3 mb-2">Workspace</p>
                    <div className="space-y-0.5">
                        {NAV_ITEMS.map((item) => {
                            const isActive = currentPage === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentPage(item.id)}
                                    className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-200 group relative ${isActive
                                            ? 'bg-indigo-600/[0.08] border border-indigo-500/[0.12]'
                                            : 'border border-transparent hover:bg-white/[0.02] hover:border-white/[0.04]'
                                        }`}
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-4 rounded-r-full gradient-brand shadow-sm shadow-indigo-500/30" />
                                    )}

                                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-indigo-600/20 text-indigo-400'
                                            : 'text-gray-600 group-hover:text-gray-400 group-hover:bg-white/[0.03]'
                                        }`}>
                                        <item.icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <span className={`text-[12px] font-semibold block leading-none ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                                            }`}>
                                            {item.label}
                                        </span>
                                        <span className={`text-[9px] mt-0.5 block ${isActive ? 'text-indigo-400/60' : 'text-gray-700'
                                            }`}>{item.desc}</span>
                                    </div>

                                    {/* Browser count badge for profiles */}
                                    {item.id === 'profiles' && activeBrowsers > 0 && (
                                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500/15 px-1 text-[9px] font-bold text-emerald-400">
                                            {activeBrowsers}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick actions */}
                    <p className="text-[9px] font-bold text-gray-600/80 uppercase tracking-[0.15em] px-3 mt-5 mb-2">Nhanh</p>
                    <div className="grid grid-cols-2 gap-1.5">
                        <button className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.02] border border-white/[0.04] px-2 py-2.5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group">
                            <Zap className="h-3.5 w-3.5 text-amber-500/70 group-hover:text-amber-400 transition-colors" />
                            <span className="text-[9px] text-gray-600 group-hover:text-gray-400 font-medium transition-colors">Quick Run</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.02] border border-white/[0.04] px-2 py-2.5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group">
                            <Shield className="h-3.5 w-3.5 text-indigo-500/70 group-hover:text-indigo-400 transition-colors" />
                            <span className="text-[9px] text-gray-600 group-hover:text-gray-400 font-medium transition-colors">Stealth</span>
                        </button>
                    </div>
                </nav>

                {/* User section */}
                <div className="px-3 pb-3 space-y-2 relative z-10">
                    {/* Version */}
                    <div className="flex items-center gap-2 px-3 py-1.5">
                        <Sparkles className="h-2.5 w-2.5 text-gray-700" />
                        <span className="text-[9px] text-gray-700 font-medium">v1.0.0</span>
                        <span className="text-[9px] text-gray-700/50 font-medium">Playwright</span>
                    </div>

                    {/* User card */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(v => !v)}
                                className="w-full flex items-center gap-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2.5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
                            >
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="" className="h-7 w-7 rounded-lg object-cover" />
                                ) : (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand text-white text-[10px] font-bold shrink-0">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-[11px] font-semibold text-gray-200 leading-none truncate">{user.name}</p>
                                    <p className="text-[9px] text-gray-600 mt-0.5 truncate">{user.email}</p>
                                </div>
                                <ChevronDown className={`h-3 w-3 text-gray-600 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User dropdown menu */}
                            {showUserMenu && (
                                <div className="absolute bottom-full left-0 right-0 mb-1.5 rounded-xl bg-[#0e0e16] border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden animate-scaleIn origin-bottom z-50">
                                    <div className="p-1">
                                        <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-gray-400 hover:bg-white/[0.04] hover:text-gray-200 transition-all">
                                            <Settings className="h-3 w-3" />
                                            Cai dat
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all"
                                        >
                                            <LogOut className="h-3 w-3" />
                                            Dang xuat
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>

            {/* === MAIN CONTENT === */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#06060a]">
                {/* Header */}
                <header
                    className="h-[52px] flex items-center justify-between px-6 border-b border-white/[0.04] shrink-0 bg-[#06060a]/80 backdrop-blur-md"
                    style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
                >
                    {/* Left: Page info */}
                    <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-[14px] font-bold text-white tracking-tight">{pageInfo.title}</h2>
                                {activeBrowsers > 0 && currentPage === 'profiles' && (
                                    <span className="flex h-[18px] items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 text-[9px] font-bold text-emerald-400">
                                        {activeBrowsers} active
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-600 mt-px">{pageInfo.subtitle}</p>
                        </div>
                    </div>

                    {/* Right: Actions + Time */}
                    <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                        {/* Clock */}
                        <span className="text-[10px] text-gray-600 font-mono mr-2 tabular-nums">
                            {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {/* Agent status indicator */}
                        <div className={`flex items-center gap-1.5 rounded-lg ${statusInfo.bg} px-2 py-1`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                            <span className={`text-[10px] font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="flex-1 overflow-y-auto mesh-gradient">
                    {currentPage === 'profiles' && <ProfilesPage />}
                    {currentPage === 'automation' && <AutomationPage />}
                    {currentPage === 'logs' && <LogsPage />}
                </div>
            </main>

            {/* Click-away overlay for user menu */}
            {showUserMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
            )}
        </div>
    );
}
