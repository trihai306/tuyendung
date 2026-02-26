import { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Globe,
    Play,
    Square,
    Trash2,
    Edit3,
    X,
    Save,
    Clock,
    Tag,
    Shield,
    Monitor,
    MapPin,
    Fingerprint,
    ChevronRight,
    Cpu,
    Layers,
} from 'lucide-react';
import type { BrowserProfile } from '../types';
import { getApi } from '../api';

const api = getApi();

const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#a855f7',
];

const WEBGL_PRESETS = [
    { label: 'Auto (tu dong)', vendor: '', renderer: '' },
    { label: 'NVIDIA GTX 1660', vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { label: 'NVIDIA RTX 3060', vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { label: 'NVIDIA RTX 4070', vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { label: 'AMD RX 580', vendor: 'Google Inc. (AMD)', renderer: 'ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { label: 'AMD RX 6700 XT', vendor: 'Google Inc. (AMD)', renderer: 'ANGLE (AMD, AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { label: 'Intel UHD 630', vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { label: 'Intel Iris Xe', vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { label: 'Apple M1 Pro', vendor: 'Google Inc. (Apple)', renderer: 'ANGLE (Apple, Apple M1 Pro, OpenGL 4.1)' },
    { label: 'Apple M2', vendor: 'Google Inc. (Apple)', renderer: 'ANGLE (Apple, Apple M2, OpenGL 4.1)' },
];

export default function ProfilesPage() {
    const [profiles, setProfiles] = useState<BrowserProfile[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showFingerprint, setShowFingerprint] = useState(false);
    const [form, setForm] = useState({
        name: '', color: COLORS[0],
        proxyServer: '', proxyUser: '', proxyPass: '',
        userAgent: '', width: '1280', height: '720',
        locale: 'vi-VN', timezone: 'Asia/Ho_Chi_Minh',
        notes: '', tags: '',
        // Fingerprint fields
        webglPreset: '0',
        hardwareConcurrency: '8',
        deviceMemory: '8',
    });

    const loadProfiles = useCallback(async () => {
        const data = await api.getProfiles();
        setProfiles(data);
    }, []);

    useEffect(() => {
        loadProfiles();
        const cleanup = api.onBrowserEvent(() => loadProfiles());
        return cleanup;
    }, [loadProfiles]);

    const resetForm = () => {
        setForm({
            name: '', color: COLORS[Math.floor(Math.random() * COLORS.length)],
            proxyServer: '', proxyUser: '', proxyPass: '',
            userAgent: '', width: '1280', height: '720',
            locale: 'vi-VN', timezone: 'Asia/Ho_Chi_Minh', notes: '', tags: '',
            webglPreset: '0', hardwareConcurrency: '8', deviceMemory: '8',
        });
        setShowFingerprint(false);
    };

    const handleCreate = async () => {
        const webgl = WEBGL_PRESETS[parseInt(form.webglPreset) || 0];
        await api.createProfile({
            name: form.name || `Profile ${profiles.length + 1}`,
            color: form.color,
            proxy: form.proxyServer ? { server: form.proxyServer, username: form.proxyUser, password: form.proxyPass } : undefined,
            userAgent: form.userAgent || undefined,
            viewport: { width: parseInt(form.width) || 1280, height: parseInt(form.height) || 720 },
            locale: form.locale, timezone: form.timezone,
            notes: form.notes || undefined,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
            webglVendor: webgl.vendor || undefined,
            webglRenderer: webgl.renderer || undefined,
            hardwareConcurrency: parseInt(form.hardwareConcurrency) || undefined,
            deviceMemory: parseInt(form.deviceMemory) || undefined,
        });
        resetForm(); setShowCreate(false); loadProfiles();
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        const webgl = WEBGL_PRESETS[parseInt(form.webglPreset) || 0];
        await api.updateProfile(editingId, {
            name: form.name, color: form.color,
            proxy: form.proxyServer ? { server: form.proxyServer, username: form.proxyUser, password: form.proxyPass } : undefined,
            userAgent: form.userAgent || undefined,
            viewport: { width: parseInt(form.width) || 1280, height: parseInt(form.height) || 720 },
            locale: form.locale, timezone: form.timezone,
            notes: form.notes || undefined,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
            webglVendor: webgl.vendor || undefined,
            webglRenderer: webgl.renderer || undefined,
            hardwareConcurrency: parseInt(form.hardwareConcurrency) || undefined,
            deviceMemory: parseInt(form.deviceMemory) || undefined,
        });
        setEditingId(null); resetForm(); loadProfiles();
    };

    const handleDelete = async (id: string) => { await api.deleteProfile(id); loadProfiles(); };
    const handleLaunch = async (id: string) => { await api.launchBrowser(id); loadProfiles(); };
    const handleClose = async (id: string) => { await api.closeBrowser(id); loadProfiles(); };

    const startEdit = (profile: BrowserProfile) => {
        setEditingId(profile.id); setShowCreate(false);

        // Find matching WebGL preset index
        let webglIdx = 0;
        if (profile.webglVendor) {
            const matchIdx = WEBGL_PRESETS.findIndex(p => p.vendor === profile.webglVendor);
            if (matchIdx > 0) webglIdx = matchIdx;
        }

        setForm({
            name: profile.name, color: profile.color,
            proxyServer: profile.proxy?.server || '', proxyUser: profile.proxy?.username || '', proxyPass: profile.proxy?.password || '',
            userAgent: profile.userAgent || '',
            width: String(profile.viewport?.width || 1280), height: String(profile.viewport?.height || 720),
            locale: profile.locale || 'vi-VN', timezone: profile.timezone || 'Asia/Ho_Chi_Minh',
            notes: profile.notes || '', tags: profile.tags?.join(', ') || '',
            webglPreset: String(webglIdx),
            hardwareConcurrency: String(profile.hardwareConcurrency || 8),
            deviceMemory: String(profile.deviceMemory || 8),
        });
        setShowFingerprint(true);
    };

    const isFormOpen = showCreate || editingId !== null;

    const Input = ({ label, value, onChange, placeholder, type = 'text', icon: Icon }: {
        label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; icon?: typeof Globe;
    }) => (
        <div>
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-wider">
                {Icon && <Icon className="h-3 w-3" />} {label}
            </label>
            <input
                type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600/80 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
        </div>
    );

    return (
        <div className="p-6 space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Browser Profiles</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {profiles.length} profile{profiles.length !== 1 ? 's' : ''} -
                        {profiles.filter(p => p.status === 'running').length} dang chay
                    </p>
                </div>
                <button
                    onClick={() => { setShowCreate(true); setEditingId(null); resetForm(); }}
                    className="flex items-center gap-2 rounded-xl gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                    <Plus className="h-4 w-4" /> Tao Profile
                </button>
            </div>

            {/* Form */}
            {isFormOpen && (
                <div className="glass-card p-6 animate-scaleIn">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-[15px] font-semibold">{editingId ? 'Chinh sua Profile' : 'Tao Profile moi'}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Cau hinh thong tin trinh duyet</p>
                        </div>
                        <button onClick={() => { setShowCreate(false); setEditingId(null); resetForm(); }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/[0.06] transition-all">
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        {/* Row 1: Name + Color */}
                        <div className="grid grid-cols-2 gap-5">
                            <Input label="Ten profile" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="My Profile" icon={Fingerprint} />
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-wider">Mau sac</label>
                                <div className="flex gap-2 flex-wrap p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                    {COLORS.map(c => (
                                        <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                                            className={`h-7 w-7 rounded-full transition-all duration-200 ${form.color === c ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-[#0a0a0f] scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                            style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Proxy */}
                        <div>
                            <p className="text-[11px] font-semibold text-gray-500/80 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Shield className="h-3 w-3" /> Proxy (tuy chon)
                            </p>
                            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                <Input label="Server" value={form.proxyServer} onChange={v => setForm(f => ({ ...f, proxyServer: v }))} placeholder="http://proxy:port" />
                                <Input label="Username" value={form.proxyUser} onChange={v => setForm(f => ({ ...f, proxyUser: v }))} />
                                <Input label="Password" value={form.proxyPass} onChange={v => setForm(f => ({ ...f, proxyPass: v }))} type="password" />
                            </div>
                        </div>

                        {/* Row 3: Viewport & Region */}
                        <div className="grid grid-cols-4 gap-4">
                            <Input label="Width" value={form.width} onChange={v => setForm(f => ({ ...f, width: v }))} icon={Monitor} />
                            <Input label="Height" value={form.height} onChange={v => setForm(f => ({ ...f, height: v }))} />
                            <Input label="Locale" value={form.locale} onChange={v => setForm(f => ({ ...f, locale: v }))} icon={MapPin} />
                            <Input label="Timezone" value={form.timezone} onChange={v => setForm(f => ({ ...f, timezone: v }))} />
                        </div>

                        {/* Row 4: User Agent */}
                        <Input label="User Agent" value={form.userAgent} onChange={v => setForm(f => ({ ...f, userAgent: v }))} placeholder="De trong = mac dinh" icon={Globe} />

                        {/* Row 5: Tags & Notes */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Tags" value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} placeholder="facebook, zalo, work" icon={Tag} />
                            <Input label="Ghi chu" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} />
                        </div>

                        {/* Row 6: Fingerprint Configuration */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowFingerprint(v => !v)}
                                className="flex items-center gap-2 text-[11px] font-semibold text-indigo-400/80 uppercase tracking-wider hover:text-indigo-400 transition-colors"
                            >
                                <Fingerprint className="h-3 w-3" />
                                Anti-Detection Fingerprint
                                <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${showFingerprint ? 'rotate-90' : ''}`} />
                            </button>

                            {showFingerprint && (
                                <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-indigo-500/10 space-y-4 animate-fadeIn">
                                    <p className="text-[10px] text-gray-500">
                                        Tuy chinh fingerprint de moi profile co dau van tay rieng biet, tranh bi phat hien bot.
                                        De trong = tu dong tao dua tren seed.
                                    </p>

                                    {/* WebGL Preset */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-wider">
                                            <Layers className="h-3 w-3" /> WebGL Card ao
                                        </label>
                                        <select
                                            value={form.webglPreset}
                                            onChange={e => setForm(f => ({ ...f, webglPreset: e.target.value }))}
                                            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                                        >
                                            {WEBGL_PRESETS.map((preset, idx) => (
                                                <option key={idx} value={String(idx)} className="bg-[#1a1a2e] text-white">
                                                    {preset.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Hardware */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-wider">
                                                <Cpu className="h-3 w-3" /> CPU Cores
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="range"
                                                    min="2" max="32" step="2"
                                                    value={form.hardwareConcurrency}
                                                    onChange={e => setForm(f => ({ ...f, hardwareConcurrency: e.target.value }))}
                                                    className="flex-1 h-1.5 rounded-full appearance-none bg-white/10 accent-indigo-500 cursor-pointer"
                                                />
                                                <span className="text-xs text-indigo-400 font-mono w-8 text-right">{form.hardwareConcurrency}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-wider">
                                                RAM (GB)
                                            </label>
                                            <div className="flex gap-2">
                                                {['4', '8', '16', '32'].map(mem => (
                                                    <button
                                                        key={mem}
                                                        type="button"
                                                        onClick={() => setForm(f => ({ ...f, deviceMemory: mem }))}
                                                        className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all ${form.deviceMemory === mem
                                                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                                            : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:bg-white/[0.06] hover:text-gray-300'
                                                            }`}
                                                    >
                                                        {mem} GB
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-white/[0.06]">
                        <button onClick={() => { setShowCreate(false); setEditingId(null); resetForm(); }}
                            className="rounded-xl px-5 py-2.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all">
                            Huy
                        </button>
                        <button onClick={editingId ? handleUpdate : handleCreate}
                            className="flex items-center gap-2 rounded-xl gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all">
                            <Save className="h-3.5 w-3.5" /> {editingId ? 'Cap nhat' : 'Tao Profile'}
                        </button>
                    </div>
                </div>
            )}

            {/* Profile Grid */}
            {profiles.length === 0 && !isFormOpen ? (
                <div className="flex flex-col items-center py-24 text-center animate-fadeIn">
                    <div className="relative mb-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl glass-card">
                            <Globe className="h-9 w-9 text-gray-600" />
                        </div>
                        <div className="absolute -inset-4 rounded-3xl bg-indigo-500/5 blur-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-200">Chua co profile nao</h3>
                    <p className="text-sm text-gray-500 mt-1.5 max-w-xs">Tao profile dau tien de quan ly trinh duyet voi cookie, proxy va cau hinh rieng</p>
                    <button
                        onClick={() => { setShowCreate(true); resetForm(); }}
                        className="mt-6 flex items-center gap-2 rounded-xl gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Bat dau
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {profiles.map((profile, i) => (
                        <div
                            key={profile.id}
                            className="group glass-card p-0 overflow-hidden hover:border-white/[0.12] transition-all duration-300 animate-fadeIn"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            {/* Gradient top bar */}
                            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${profile.color}, ${profile.color}80, transparent)` }} />

                            <div className="p-4">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div
                                                className="flex h-11 w-11 items-center justify-center rounded-xl text-white font-bold text-sm transition-transform duration-300 group-hover:scale-105"
                                                style={{ background: `linear-gradient(135deg, ${profile.color}30, ${profile.color}10)`, color: profile.color }}
                                            >
                                                {profile.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0a0f] ${profile.status === 'running' ? 'bg-emerald-400 animate-pulse' :
                                                profile.status === 'error' ? 'bg-red-400' : 'bg-gray-600'
                                                }`} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-white">{profile.name}</h4>
                                            <span className={`text-[11px] font-medium ${profile.status === 'running' ? 'text-emerald-400' :
                                                profile.status === 'error' ? 'text-red-400' : 'text-gray-500'
                                                }`}>
                                                {profile.status === 'running' ? 'Dang chay' : profile.status === 'error' ? 'Loi' : 'San sang'}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-700 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                                </div>

                                {/* Info pills */}
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2 py-1 text-[10px] text-gray-400">
                                        <Monitor className="h-2.5 w-2.5" /> {profile.viewport?.width}x{profile.viewport?.height}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 px-2 py-1 text-[10px] text-indigo-400">
                                        <Fingerprint className="h-2.5 w-2.5" /> Stealth
                                    </span>
                                    {profile.proxy && (
                                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-400">
                                            <Shield className="h-2.5 w-2.5" /> Proxy
                                        </span>
                                    )}
                                    {profile.lastUsedAt && (
                                        <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2 py-1 text-[10px] text-gray-500">
                                            <Clock className="h-2.5 w-2.5" /> {new Date(profile.lastUsedAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    )}
                                </div>

                                {/* Tags */}
                                {profile.tags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap mb-4">
                                        {profile.tags.map(tag => (
                                            <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-400 font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                                    {profile.status === 'running' ? (
                                        <button onClick={() => handleClose(profile.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all">
                                            <Square className="h-3 w-3" /> Dung lai
                                        </button>
                                    ) : (
                                        <button onClick={() => handleLaunch(profile.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600/15 border border-indigo-500/20 px-3 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-600/25 hover:border-indigo-500/30 transition-all">
                                            <Play className="h-3 w-3" /> Khoi chay
                                        </button>
                                    )}
                                    <button onClick={() => startEdit(profile)}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300 transition-all">
                                        <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(profile.id)}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-gray-500 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
