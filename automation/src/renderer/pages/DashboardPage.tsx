import React, { useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { ProfileCard, BrowserProfile } from '../components/ProfileCard';
import { MultiBrowserView } from '../components/MultiBrowserView';
import { ProfileFormModal } from '../components/ProfileFormModal';

const API_URL = 'http://localhost:3005';

type Tab = 'dashboard' | 'profiles' | 'browser' | 'automation' | 'proxies' | 'logs';

interface LogEntry {
    id: number;
    time: string;
    message: string;
    type: 'info' | 'success' | 'error';
}

// ─── SVG Icon Components ───
const Icons = {
    Dashboard: () => (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
    ),
    Profiles: () => (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    Browser: () => (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
    ),
    Automation: () => (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
    ),
    Globe: () => (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
    ),
    Logs: () => (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    Plus: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    Logout: () => (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
    ),
    Play: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
        </svg>
    ),
    Search: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
};

export function DashboardPage() {
    const { user, logout } = useAuth();

    // Socket
    const [socket, setSocket] = useState<Socket | null>(null);
    const [serverOnline, setServerOnline] = useState(false);

    // Profiles
    const [profiles, setProfiles] = useState<BrowserProfile[]>([]);
    const [loadingProfiles, setLoadingProfiles] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<BrowserProfile | null>(null);
    const [profileSearch, setProfileSearch] = useState('');

    // Browser state
    const [isBrowserRunning, setIsBrowserRunning] = useState(false);
    const [runningProfileId, setRunningProfileId] = useState<string | null>(null);

    // Multi-browser sessions
    const [browserSessions, setBrowserSessions] = useState<Array<{
        id: string;
        profileId: string;
        profileName: string;
        isStreaming: boolean;
        frame: string | null;
        status: 'launching' | 'running' | 'stopped';
    }>>([]);

    // Proxies
    const [proxyCount, setProxyCount] = useState(0);

    // UI state
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [editingProfile, setEditingProfile] = useState<BrowserProfile | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Initialize socket
    useEffect(() => {
        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => setServerOnline(true));
        newSocket.on('disconnect', () => setServerOnline(false));

        newSocket.on('log', (log: { message: string; type: string; time: string }) => {
            setLogs(prev => [
                { id: Date.now(), ...log } as LogEntry,
                ...prev.slice(0, 199),
            ]);
        });

        return () => {
            newSocket.close();
        };
    }, []);

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
            setLoadingProfiles(false);
        }
    }, []);

    useEffect(() => {
        fetchProfiles();
        fetch(`${API_URL}/api/status`)
            .then(res => res.json())
            .then(data => {
                setIsBrowserRunning(data.browserRunning);
                setServerOnline(true);
            })
            .catch(() => setServerOnline(false));

        // Fetch proxy count
        fetch(`${API_URL}/api/proxy/count`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setProxyCount(data.count || 0);
            })
            .catch(() => { });
    }, [fetchProfiles]);

    // ─── Profile Actions ───
    const handleLaunchProfile = async (profileId: string) => {
        try {
            const profile = profiles.find(p => p.id === profileId);
            const res = await fetch(`${API_URL}/api/sessions/launch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileId }),
            });
            const data = await res.json();
            if (data.success) {
                const newSession = {
                    id: data.sessionId,
                    profileId,
                    profileName: profile?.name || data.profileName || 'Profile',
                    isStreaming: false,
                    frame: null,
                    status: 'running' as const,
                };
                setBrowserSessions(prev => [...prev, newSession]);
                setIsBrowserRunning(true);
                setRunningProfileId(profileId);
                setActiveTab('browser');
            } else {
                console.error('Launch failed:', data.error);
            }
        } catch (error) {
            console.error('Launch failed:', error);
        }
    };

    const handleCloseSession = async (sessionId: string) => {
        try {
            await fetch(`${API_URL}/api/sessions/${sessionId}/close`, { method: 'POST' });
            setBrowserSessions(prev => prev.filter(s => s.id !== sessionId));
            if (browserSessions.length <= 1) {
                setIsBrowserRunning(false);
                setRunningProfileId(null);
            }
        } catch (error) {
            console.error('Close session failed:', error);
        }
    };

    const handleCloseBrowser = async () => {
        try {
            await fetch(`${API_URL}/api/browser/close`, { method: 'POST' });
            setIsBrowserRunning(false);
            setRunningProfileId(null);
        } catch (error) {
            console.error('Close failed:', error);
        }
    };

    const handleDeleteProfile = async (profileId: string) => {
        if (!confirm('Delete this profile?')) return;
        try {
            await fetch(`${API_URL}/api/profiles/${profileId}`, { method: 'DELETE' });
            fetchProfiles();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleDuplicateProfile = async (profileId: string) => {
        try {
            await fetch(`${API_URL}/api/profiles/${profileId}/duplicate`, { method: 'POST' });
            fetchProfiles();
        } catch (error) {
            console.error('Duplicate failed:', error);
        }
    };

    const handleEditProfile = (profile: BrowserProfile) => {
        setEditingProfile(profile);
        setShowProfileForm(true);
    };

    const handleSaveProfile = async (data: any) => {
        try {
            const url = editingProfile
                ? `${API_URL}/api/profiles/${editingProfile.id}`
                : `${API_URL}/api/profiles`;

            await fetch(url, {
                method: editingProfile ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            fetchProfiles();
            setShowProfileForm(false);
            setEditingProfile(null);
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    // Filtered profiles
    const filteredProfiles = profiles.filter(p =>
        p.name.toLowerCase().includes(profileSearch.toLowerCase())
    );

    // ─── Navigation Items ───
    const navSections: Array<{
        label: string;
        items: Array<{ id: Tab; label: string; Icon: () => React.JSX.Element; badge?: string; live?: boolean }>;
    }> = [
            {
                label: 'Overview',
                items: [
                    { id: 'dashboard', label: 'Dashboard', Icon: Icons.Dashboard },
                ]
            },
            {
                label: 'Browsers',
                items: [
                    { id: 'profiles', label: 'Profiles', Icon: Icons.Profiles, badge: profiles.length.toString() },
                    { id: 'browser', label: 'Live Browsers', Icon: Icons.Browser, live: isBrowserRunning },
                ]
            },
            {
                label: 'Tools',
                items: [
                    { id: 'automation', label: 'Automation', Icon: Icons.Automation },
                    { id: 'proxies', label: 'Proxies', Icon: Icons.Globe, badge: proxyCount > 0 ? proxyCount.toString() : undefined },
                    { id: 'logs', label: 'Logs', Icon: Icons.Logs },
                ]
            }
        ];

    return (
        <div className="min-h-screen flex bg-[var(--bg-primary)]">
            {/* ═══ SIDEBAR ═══ */}
            <aside className="sidebar">
                {/* Logo */}
                <div className="px-5 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="font-bold text-[var(--text-primary)] text-sm tracking-tight">Antigravity</h1>
                            <p className="text-[10px] text-[var(--text-ghost)] font-medium tracking-wider uppercase">Auto</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-2 overflow-y-auto">
                    {navSections.map((section, si) => (
                        <div key={si} className="sidebar-section">
                            <div className="sidebar-section-label">{section.label}</div>
                            {section.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                                >
                                    <item.Icon />
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span className="sidebar-badge">{item.badge}</span>
                                    )}
                                    {item.live && (
                                        <span className="ml-auto w-2 h-2 bg-[var(--accent-success)] rounded-full animate-pulse-dot" />
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Browser Running Status */}
                {isBrowserRunning && (
                    <div className="px-4 pb-2">
                        <div className="card-glass p-3">
                            <div className="flex items-center gap-2 text-[var(--accent-success)] text-xs font-semibold mb-2">
                                <span className="w-2 h-2 bg-[var(--accent-success)] rounded-full animate-pulse-dot" />
                                {browserSessions.length} Browser{browserSessions.length !== 1 ? 's' : ''} Active
                            </div>
                            <button
                                onClick={handleCloseBrowser}
                                className="w-full py-1.5 bg-[var(--accent-danger-dim)] text-[var(--accent-danger)] border border-[rgba(239,68,68,0.2)] rounded-lg text-xs hover:bg-[rgba(239,68,68,0.2)] transition-colors font-medium"
                            >
                                Close All
                            </button>
                        </div>
                    </div>
                )}

                {/* User */}
                <div className="p-4 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xs shadow-lg shadow-emerald-500/20">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[var(--text-primary)] truncate">{user?.name}</p>
                            <p className="text-[10px] text-[var(--text-ghost)] truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-1.5 rounded-lg text-[var(--text-ghost)] hover:text-[var(--accent-danger)] hover:bg-[var(--accent-danger-dim)] transition-all"
                            title="Logout"
                        >
                            <Icons.Logout />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="px-8 py-5 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                            {activeTab === 'dashboard' && 'Dashboard'}
                            {activeTab === 'profiles' && 'Browser Profiles'}
                            {activeTab === 'browser' && 'Live Browser Grid'}
                            {activeTab === 'automation' && 'Automation'}
                            {activeTab === 'proxies' && 'Proxy Manager'}
                            {activeTab === 'logs' && 'Activity Logs'}
                        </h2>
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">
                            {activeTab === 'dashboard' && 'System overview and quick actions'}
                            {activeTab === 'profiles' && `${profiles.length} profiles configured`}
                            {activeTab === 'browser' && `${browserSessions.length} active session${browserSessions.length !== 1 ? 's' : ''}`}
                            {activeTab === 'automation' && 'Agent tasks and scheduling'}
                            {activeTab === 'proxies' && `${proxyCount} proxies available`}
                            {activeTab === 'logs' && `${logs.length} entries`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Status badges */}
                        <span className={`badge ${serverOnline ? 'badge-success' : 'badge-danger'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${serverOnline ? 'bg-[var(--accent-success)] animate-pulse-dot' : 'bg-[var(--accent-danger)]'}`} />
                            {serverOnline ? 'Server Online' : 'Offline'}
                        </span>

                        {/* Action button for current tab */}
                        {activeTab === 'profiles' && (
                            <button
                                onClick={() => { setEditingProfile(null); setShowProfileForm(true); }}
                                className="btn btn-primary"
                            >
                                <Icons.Plus />
                                <span>New Profile</span>
                            </button>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* ═══ DASHBOARD ═══ */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6 animate-fade-in-up">
                            {/* Stat Cards */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="stat-card accent-emerald-primary animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="stat-label">Total Profiles</span>
                                        <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary-dim)] flex items-center justify-center">
                                            <Icons.Profiles />
                                        </div>
                                    </div>
                                    <div className="stat-number">{profiles.length}</div>
                                </div>

                                <div className="stat-card accent-emerald animate-fade-in-up delay-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="stat-label">Active Browsers</span>
                                        <div className="w-9 h-9 rounded-lg bg-[var(--accent-success-dim)] flex items-center justify-center">
                                            <Icons.Browser />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="stat-number">{browserSessions.length}</span>
                                        {browserSessions.length > 0 && (
                                            <span className="badge badge-live">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)] animate-pulse-dot" />
                                                Live
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="stat-card accent-blue animate-fade-in-up delay-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="stat-label">Tasks Today</span>
                                        <div className="w-9 h-9 rounded-lg bg-[var(--accent-info-dim)] flex items-center justify-center">
                                            <Icons.Automation />
                                        </div>
                                    </div>
                                    <div className="stat-number">{logs.filter(l => l.type === 'success').length}</div>
                                </div>

                                <div className="stat-card accent-orange animate-fade-in-up delay-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="stat-label">Proxies Available</span>
                                        <div className="w-9 h-9 rounded-lg bg-[var(--accent-orange-dim)] flex items-center justify-center">
                                            <Icons.Globe />
                                        </div>
                                    </div>
                                    <div className="stat-number">{proxyCount}</div>
                                </div>
                            </div>

                            {/* Two-column layout */}
                            <div className="grid grid-cols-5 gap-6">
                                {/* Recent Activity */}
                                <div className="col-span-3 card-glass p-5">
                                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Recent Activity</h3>
                                    {logs.length === 0 ? (
                                        <p className="text-sm text-[var(--text-ghost)] py-8 text-center">No activity yet</p>
                                    ) : (
                                        <div className="space-y-0.5 max-h-[300px] overflow-y-auto pr-2">
                                            {logs.slice(0, 10).map((log, i) => (
                                                <div key={log.id} className="timeline-item animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
                                                    <div className={`timeline-dot ${log.type}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-[var(--text-secondary)] truncate">{log.message}</p>
                                                        <p className="text-[10px] text-[var(--text-ghost)] mt-0.5">{log.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="col-span-2 card-glass p-5">
                                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setActiveTab('browser')}
                                            className="btn btn-success btn-block"
                                        >
                                            <Icons.Play />
                                            Launch Browser
                                        </button>
                                        <button
                                            onClick={() => { setEditingProfile(null); setShowProfileForm(true); }}
                                            className="btn btn-primary btn-block"
                                        >
                                            <Icons.Plus />
                                            New Profile
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('automation')}
                                            className="btn btn-secondary btn-block"
                                        >
                                            <Icons.Automation />
                                            Run Task
                                        </button>
                                    </div>

                                    {/* Server Info */}
                                    <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
                                        <p className="text-[10px] text-[var(--text-ghost)] uppercase tracking-widest mb-2">System</p>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-[var(--text-muted)]">Server</span>
                                                <span className={`font-medium ${serverOnline ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'}`}>
                                                    {serverOnline ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-[var(--text-muted)]">Browsers</span>
                                                <span className="font-medium text-[var(--text-secondary)]">{browserSessions.length} active</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-[var(--text-muted)]">Proxies</span>
                                                <span className="font-medium text-[var(--text-secondary)]">{proxyCount} loaded</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ PROFILES ═══ */}
                    {activeTab === 'profiles' && (
                        <div className="animate-fade-in-up">
                            {/* Search bar */}
                            <div className="mb-6">
                                <div className="relative max-w-md">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-ghost)]">
                                        <Icons.Search />
                                    </div>
                                    <input
                                        type="text"
                                        value={profileSearch}
                                        onChange={(e) => setProfileSearch(e.target.value)}
                                        placeholder="Search profiles..."
                                        className="form-input pl-10"
                                    />
                                </div>
                            </div>

                            {loadingProfiles ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="spinner" />
                                </div>
                            ) : filteredProfiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
                                        <Icons.Profiles />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                                        {profileSearch ? 'No profiles found' : 'No profiles yet'}
                                    </h3>
                                    <p className="text-sm text-[var(--text-muted)] mb-4">
                                        {profileSearch ? 'Try a different search term' : 'Create your first browser profile to get started'}
                                    </p>
                                    {!profileSearch && (
                                        <button
                                            onClick={() => { setEditingProfile(null); setShowProfileForm(true); }}
                                            className="btn btn-primary"
                                        >
                                            <Icons.Plus />
                                            Create Profile
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredProfiles.map((profile, i) => (
                                        <div key={profile.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                                            <ProfileCard
                                                profile={profile}
                                                isActive={selectedProfile?.id === profile.id}
                                                isRunning={runningProfileId === profile.id}
                                                onSelect={setSelectedProfile}
                                                onLaunch={handleLaunchProfile}
                                                onEdit={handleEditProfile}
                                                onDelete={handleDeleteProfile}
                                                onDuplicate={handleDuplicateProfile}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ LIVE BROWSERS ═══ */}
                    {activeTab === 'browser' && (
                        <div className="animate-fade-in-up">
                            <MultiBrowserView
                                socket={socket}
                                sessions={browserSessions}
                                onSessionClose={handleCloseSession}
                            />
                        </div>
                    )}

                    {/* ═══ AUTOMATION ═══ */}
                    {activeTab === 'automation' && (
                        <div className="animate-fade-in-up space-y-6">
                            <div className="card-glass p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
                                        <Icons.Automation />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-[var(--text-primary)]">Agent Bridge</h3>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            Automated task distribution via Soketi
                                        </p>
                                    </div>
                                    <span className={`badge ml-auto ${serverOnline ? 'badge-success' : 'badge-danger'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${serverOnline ? 'bg-[var(--accent-success)]' : 'bg-[var(--accent-danger)]'}`} />
                                        {serverOnline ? 'Connected' : 'Disconnected'}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--text-ghost)]">
                                    Tasks are received automatically from the Viecly backend. Active browser profiles will handle incoming distribution jobs.
                                </p>
                            </div>

                            <div className="card-glass p-6">
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Task History</h3>
                                {logs.filter(l => l.message.includes('task') || l.message.includes('Task')).length === 0 ? (
                                    <p className="text-sm text-[var(--text-ghost)] py-8 text-center">No task history yet</p>
                                ) : (
                                    <div className="space-y-0.5 max-h-[400px] overflow-y-auto">
                                        {logs.filter(l => l.message.toLowerCase().includes('task')).slice(0, 20).map(log => (
                                            <div key={log.id} className="timeline-item">
                                                <div className={`timeline-dot ${log.type}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-[var(--text-secondary)] truncate">{log.message}</p>
                                                    <p className="text-[10px] text-[var(--text-ghost)] mt-0.5">{log.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══ PROXIES ═══ */}
                    {activeTab === 'proxies' && (
                        <div className="animate-fade-in-up space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="stat-card accent-orange">
                                    <span className="stat-label">Total Proxies</span>
                                    <div className="stat-number mt-2">{proxyCount}</div>
                                </div>
                                <div className="stat-card accent-emerald">
                                    <span className="stat-label">Active</span>
                                    <div className="stat-number mt-2">{proxyCount}</div>
                                </div>
                                <div className="stat-card accent-blue">
                                    <span className="stat-label">In Use</span>
                                    <div className="stat-number mt-2">{browserSessions.length}</div>
                                </div>
                            </div>

                            <div className="card-glass p-6">
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Proxy List</h3>
                                {proxyCount === 0 ? (
                                    <div className="py-12 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-3">
                                            <Icons.Globe />
                                        </div>
                                        <p className="text-sm text-[var(--text-muted)] mb-1">No proxies loaded</p>
                                        <p className="text-xs text-[var(--text-ghost)]">Add proxies via the server API or load from a file</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-[var(--text-muted)]">{proxyCount} proxies loaded and available for browser sessions.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══ LOGS ═══ */}
                    {activeTab === 'logs' && (
                        <div className="animate-fade-in-up">
                            <div className="card-glass overflow-hidden">
                                <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                                    <span className="text-xs text-[var(--text-muted)] font-medium">{logs.length} entries</span>
                                    {logs.length > 0 && (
                                        <button
                                            onClick={() => setLogs([])}
                                            className="text-xs text-[var(--text-ghost)] hover:text-[var(--accent-danger)] transition-colors"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[600px] overflow-auto">
                                    {logs.length === 0 ? (
                                        <div className="p-8 text-center text-[var(--text-ghost)] text-sm">
                                            No logs yet
                                        </div>
                                    ) : (
                                        <div>
                                            {logs.map(log => (
                                                <div key={log.id} className="px-5 py-2.5 flex items-start gap-3 hover:bg-[var(--bg-elevated)] transition-colors border-b border-[var(--border-subtle)]">
                                                    <span className="text-[10px] text-[var(--text-ghost)] font-mono whitespace-nowrap mt-0.5">{log.time}</span>
                                                    <div className={`timeline-dot ${log.type} mt-1.5`} />
                                                    <span className={`flex-1 text-sm ${log.type === 'error' ? 'text-[#f87171]' :
                                                        log.type === 'success' ? 'text-[var(--accent-success-light)]' :
                                                            'text-[var(--text-secondary)]'
                                                        }`}>
                                                        {log.message}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ═══ Profile Form Modal ═══ */}
            {showProfileForm && (
                <ProfileFormModal
                    profile={editingProfile}
                    onSave={handleSaveProfile}
                    onClose={() => { setShowProfileForm(false); setEditingProfile(null); }}
                />
            )}
        </div>
    );
}
