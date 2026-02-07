import React from 'react';

export interface BrowserProfile {
    id: string;
    name: string;
    viewport: { width: number; height: number };
    userAgent: string;
    locale: string;
    timezone: string;
    colorScheme: string;
    proxy: {
        enabled: boolean;
        server?: string;
        username?: string;
        password?: string;
    };
    notes: string;
    createdAt: string;
    updatedAt: string;
}

interface ProfileCardProps {
    profile: BrowserProfile;
    isActive?: boolean;
    isRunning?: boolean;
    onSelect: (profile: BrowserProfile) => void;
    onLaunch: (profileId: string) => void;
    onEdit: (profile: BrowserProfile) => void;
    onDelete: (profileId: string) => void;
    onDuplicate: (profileId: string) => void;
}

export function ProfileCard({
    profile,
    isActive = false,
    isRunning = false,
    onSelect,
    onLaunch,
    onEdit,
    onDelete,
    onDuplicate,
}: ProfileCardProps) {
    const statusColor = isRunning ? 'var(--accent-success)' : isActive ? 'var(--accent-primary)' : 'var(--text-ghost)';
    const statusText = isRunning ? 'Running' : isActive ? 'Selected' : 'Ready';

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${isRunning
                ? 'bg-[var(--bg-card)] border-[var(--accent-success)] shadow-[0_0_20px_-4px_rgba(16,185,129,0.25)]'
                : isActive
                    ? 'bg-[var(--bg-card)] border-[var(--accent-primary)] shadow-[0_0_20px_-4px_rgba(99,102,241,0.2)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:shadow-[var(--shadow-elevated)]'
                }`}
            onClick={() => onSelect(profile)}
        >
            {/* Top accent line */}
            {isRunning && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
            )}
            {isActive && !isRunning && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            )}

            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{profile.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: statusColor }}
                            />
                            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: statusColor }}>
                                {statusText}
                            </span>
                        </div>
                    </div>

                    {isRunning && (
                        <span className="badge badge-live text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)] animate-pulse-dot" />
                            LIVE
                        </span>
                    )}
                </div>

                {/* Metadata */}
                <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12" />
                        </svg>
                        <span>{profile.viewport.width}×{profile.viewport.height}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                        </svg>
                        <span>{profile.locale}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <span className={profile.proxy?.enabled ? 'text-[var(--accent-success)]' : 'text-[var(--text-ghost)]'}>
                            Proxy {profile.proxy?.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                </div>

                {/* Actions - Shown on hover */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={(e) => { e.stopPropagation(); onLaunch(profile.id); }}
                        disabled={isRunning}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-success-dim)] text-[var(--accent-success)] hover:bg-[rgba(16,185,129,0.25)] transition-colors disabled:opacity-30"
                        title="Launch"
                    >
                        ▶ Launch
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(profile); }}
                        className="p-1.5 rounded-lg text-[var(--text-ghost)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
                        title="Edit"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDuplicate(profile.id); }}
                        className="p-1.5 rounded-lg text-[var(--text-ghost)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
                        title="Duplicate"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
                        className="p-1.5 rounded-lg text-[var(--text-ghost)] hover:text-[var(--accent-danger)] hover:bg-[var(--accent-danger-dim)] transition-all"
                        title="Delete"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
