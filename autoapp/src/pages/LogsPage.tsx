import { useState, useEffect, useCallback } from 'react';
import {
    ScrollText,
    CheckCircle2,
    XCircle,
    Loader2,
    Trash2,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
} from 'lucide-react';
import type { AutomationLog } from '../types';
import { getApi } from '../api';

const api = getApi();

export default function LogsPage() {
    const [logs, setLogs] = useState<AutomationLog[]>([]);

    const load = useCallback(async () => {
        const data = await api.getLogs(100);
        setLogs(data);
    }, []);

    useEffect(() => {
        load();
        const cleanup = api.onLogEvent(() => load());
        return cleanup;
    }, [load]);

    const handleClear = async () => { await api.clearLogs(); setLogs([]); };

    const successCount = logs.filter(l => l.status === 'success').length;
    const failedCount = logs.filter(l => l.status === 'failed').length;
    const runningCount = logs.filter(l => l.status === 'running').length;
    const successRate = logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 0;

    const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string; border: string }> = {
        success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Thanh cong', border: 'border-emerald-500/20' },
        failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'That bai', border: 'border-red-500/20' },
        running: { icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Dang chay', border: 'border-amber-500/20' },
    };

    const formatTime = (isoDate: string) => {
        const d = new Date(isoDate);
        return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    };

    const formatDuration = (start: string, end?: string) => {
        if (!end) return '--';
        const ms = new Date(end).getTime() - new Date(start).getTime();
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    return (
        <div className="p-6 space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Nhat ky</h2>
                    <p className="text-sm text-gray-500 mt-1">{logs.length} lan chay</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={load}
                        className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-2.5 text-sm text-gray-400 hover:bg-white/[0.06] hover:text-gray-200 transition-all">
                        <RefreshCw className="h-3.5 w-3.5" /> Lam moi
                    </button>
                    {logs.length > 0 && (
                        <button onClick={handleClear}
                            className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition-all">
                            <Trash2 className="h-3.5 w-3.5" /> Xoa tat ca
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="glass-card p-4 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-emerald-500/5 blur-xl" />
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{successCount}</p>
                    <p className="text-[11px] text-emerald-400 mt-0.5 font-medium flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Thanh cong
                    </p>
                </div>

                <div className="glass-card p-4 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-red-500/5 blur-xl" />
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                            <XCircle className="h-4 w-4 text-red-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{failedCount}</p>
                    <p className="text-[11px] text-red-400 mt-0.5 font-medium flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" /> That bai
                    </p>
                </div>

                <div className="glass-card p-4 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-amber-500/5 blur-xl" />
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                            <Activity className="h-4 w-4 text-amber-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{runningCount}</p>
                    <p className="text-[11px] text-amber-400 mt-0.5 font-medium">Dang chay</p>
                </div>

                <div className="glass-card p-4 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-indigo-500/5 blur-xl" />
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                            <BarChart3 className="h-4 w-4 text-indigo-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{successRate}%</p>
                    <p className="text-[11px] text-indigo-400 mt-0.5 font-medium">Ti le thanh cong</p>
                </div>
            </div>

            {/* Logs list */}
            {logs.length === 0 ? (
                <div className="flex flex-col items-center py-24 text-center animate-fadeIn">
                    <div className="relative mb-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl glass-card">
                            <ScrollText className="h-9 w-9 text-gray-600" />
                        </div>
                        <div className="absolute -inset-4 rounded-3xl bg-indigo-500/5 blur-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-200">Chua co nhat ky nao</h3>
                    <p className="text-sm text-gray-500 mt-1.5 max-w-xs">Chay automation de bat dau ghi nhat ky thuc thi</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {logs.map((log, i) => {
                        const cfg = STATUS_CONFIG[log.status];
                        const StatusIcon = cfg.icon;
                        const progress = log.totalSteps > 0 ? (log.stepsCompleted / log.totalSteps) * 100 : 0;
                        return (
                            <div key={log.id} className="glass-card p-0 overflow-hidden hover:border-white/[0.12] transition-all duration-300 animate-fadeIn" style={{ animationDelay: `${i * 40}ms` }}>
                                {/* Progress bar */}
                                <div className="h-0.5 w-full bg-white/[0.03]">
                                    <div className={`h-full transition-all duration-500 ${log.status === 'success' ? 'bg-emerald-500' :
                                            log.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                                        }`} style={{ width: `${progress}%` }} />
                                </div>

                                <div className="p-4 flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${cfg.bg} border ${cfg.border}`}>
                                        <StatusIcon className={`h-4.5 w-4.5 ${cfg.color} ${log.status === 'running' ? 'animate-spin' : ''}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-white">{log.automationName}</span>
                                            <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[11px] text-gray-500">Profile: <span className="text-gray-400">{log.profileName}</span></span>
                                            <span className="text-[11px] text-gray-600">{log.stepsCompleted}/{log.totalSteps} buoc</span>
                                            <span className="text-[11px] text-gray-600">{formatDuration(log.startedAt, log.completedAt)}</span>
                                        </div>
                                        {log.error && (
                                            <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 bg-red-500/5 rounded-md px-2 py-1 w-fit">
                                                <XCircle className="h-3 w-3 shrink-0" /> {log.error}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-gray-600 shrink-0 font-mono">{formatTime(log.startedAt)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
