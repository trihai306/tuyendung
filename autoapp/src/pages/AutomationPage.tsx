import { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Play,
    Trash2,
    X,
    Save,
    Zap,
    ArrowUp,
    ArrowDown,
    Globe,
    MousePointer,
    Type,
    Clock,
    Camera,
    ArrowDownCircle,
    Code2,
    Layers,
    ChevronDown,
} from 'lucide-react';
import type { AutomationTask, AutomationStep, BrowserProfile } from '../types';
import { getApi } from '../api';

const api = getApi();

const ACTION_CONFIG: Record<AutomationStep['action'], { label: string; icon: typeof Globe; color: string }> = {
    goto: { label: 'Mo URL', icon: Globe, color: '#3b82f6' },
    click: { label: 'Click', icon: MousePointer, color: '#8b5cf6' },
    type: { label: 'Nhap text', icon: Type, color: '#22c55e' },
    wait: { label: 'Doi', icon: Clock, color: '#f59e0b' },
    screenshot: { label: 'Chup hinh', icon: Camera, color: '#ec4899' },
    scroll: { label: 'Cuon trang', icon: ArrowDownCircle, color: '#06b6d4' },
    evaluate: { label: 'Chay JS', icon: Code2, color: '#f97316' },
};

function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

export default function AutomationPage() {
    const [automations, setAutomations] = useState<AutomationTask[]>([]);
    const [profiles, setProfiles] = useState<BrowserProfile[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [steps, setSteps] = useState<AutomationStep[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<string>('');
    const [running, setRunning] = useState<string | null>(null);
    const [showActions, setShowActions] = useState(false);

    const load = useCallback(async () => {
        const [autos, profs] = await Promise.all([api.getAutomations(), api.getProfiles()]);
        setAutomations(autos);
        setProfiles(profs);
        if (profs.length > 0 && !selectedProfile) setSelectedProfile(profs[0].id);
    }, [selectedProfile]);

    useEffect(() => { load(); }, [load]);

    const addStep = (action: AutomationStep['action']) => {
        setSteps(prev => [...prev, { id: generateId(), action, value: '', selector: '', delay: 500 }]);
        setShowActions(false);
    };

    const updateStep = (id: string, data: Partial<AutomationStep>) => setSteps(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    const removeStep = (id: string) => setSteps(prev => prev.filter(s => s.id !== id));
    const moveStep = (idx: number, dir: -1 | 1) => {
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= steps.length) return;
        const arr = [...steps];
        [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
        setSteps(arr);
    };

    const handleSave = async () => {
        if (editingId) {
            await api.updateAutomation(editingId, { name: form.name, description: form.description, steps });
        } else {
            await api.createAutomation({ name: form.name, description: form.description, type: 'sequence', steps });
        }
        setShowCreate(false); setEditingId(null); setForm({ name: '', description: '' }); setSteps([]); load();
    };

    const handleRun = async (id: string) => {
        if (!selectedProfile) return;
        setRunning(id);
        try { await api.runAutomation(id, selectedProfile); } catch { }
        setRunning(null);
    };

    const handleDelete = async (id: string) => { await api.deleteAutomation(id); load(); };

    const startEdit = (task: AutomationTask) => {
        setEditingId(task.id); setShowCreate(true);
        setForm({ name: task.name, description: task.description || '' });
        setSteps(task.steps);
    };

    const isFormOpen = showCreate || editingId !== null;

    return (
        <div className="p-6 space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Automation</h2>
                    <p className="text-sm text-gray-500 mt-1">{automations.length} automation tasks</p>
                </div>
                <div className="flex items-center gap-3">
                    {profiles.length > 0 && (
                        <div className="relative">
                            <select value={selectedProfile} onChange={e => setSelectedProfile(e.target.value)}
                                className="appearance-none rounded-xl bg-white/[0.04] border border-white/[0.08] pl-3.5 pr-8 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none cursor-pointer">
                                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
                        </div>
                    )}
                    <button
                        onClick={() => { setShowCreate(true); setEditingId(null); setForm({ name: '', description: '' }); setSteps([]); }}
                        className="flex items-center gap-2 rounded-xl gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        <Plus className="h-4 w-4" /> Tao moi
                    </button>
                </div>
            </div>

            {/* Form */}
            {isFormOpen && (
                <div className="glass-card p-6 animate-scaleIn">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-semibold">{editingId ? 'Chinh sua' : 'Tao Automation'}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Thiet ke quy trinh tu dong</p>
                            </div>
                        </div>
                        <button onClick={() => { setShowCreate(false); setEditingId(null); }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/[0.06] transition-all">
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 mb-2 block uppercase tracking-wider">Ten</label>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Login Facebook"
                                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600/80 focus:border-indigo-500/50 focus:outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 mb-2 block uppercase tracking-wider">Mo ta</label>
                            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Mo ta ngan gon..."
                                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600/80 focus:border-indigo-500/50 focus:outline-none transition-all" />
                        </div>
                    </div>

                    {/* Step builder */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Layers className="h-3 w-3" /> Cac buoc ({steps.length})
                            </label>
                            <div className="relative">
                                <button onClick={() => setShowActions(!showActions)}
                                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600/15 px-3 py-1.5 text-[11px] font-semibold text-indigo-400 hover:bg-indigo-600/25 transition-all">
                                    <Plus className="h-3 w-3" /> Them buoc
                                </button>
                                {showActions && (
                                    <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl glass-card p-1.5 shadow-xl shadow-black/50 animate-scaleIn">
                                        {(Object.entries(ACTION_CONFIG) as [AutomationStep['action'], typeof ACTION_CONFIG['goto']][]).map(([action, cfg]) => (
                                            <button key={action} onClick={() => addStep(action)}
                                                className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-gray-300 hover:bg-white/[0.06] transition-all">
                                                <cfg.icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                                                {cfg.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {steps.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-white/[0.08] py-10 text-center">
                                <Layers className="h-6 w-6 text-gray-700 mx-auto mb-2" />
                                <p className="text-xs text-gray-600">Chua co buoc nao. Click "Them buoc" de bat dau.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {steps.map((step, idx) => {
                                    const cfg = ACTION_CONFIG[step.action];
                                    const StepIcon = cfg.icon;
                                    return (
                                        <div key={step.id} className="flex items-center gap-2.5 glass-card p-3 animate-slideIn" style={{ animationDelay: `${idx * 30}ms` }}>
                                            {/* Number */}
                                            <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold shrink-0"
                                                style={{ background: `${cfg.color}15`, color: cfg.color }}>
                                                {idx + 1}
                                            </span>
                                            {/* Icon */}
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                                                style={{ background: `${cfg.color}10` }}>
                                                <StepIcon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                                            </div>

                                            {/* Inputs */}
                                            <div className="flex-1 flex items-center gap-2">
                                                {(step.action === 'goto' || step.action === 'evaluate') && (
                                                    <input value={step.value || ''} onChange={e => updateStep(step.id, { value: e.target.value })}
                                                        placeholder={step.action === 'goto' ? 'https://...' : 'document.title'}
                                                        className="flex-1 rounded-lg bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 text-xs text-white placeholder:text-gray-600 focus:border-indigo-500/40 focus:outline-none" />
                                                )}
                                                {(step.action === 'click' || step.action === 'type') && (
                                                    <>
                                                        <input value={step.selector || ''} onChange={e => updateStep(step.id, { selector: e.target.value })}
                                                            placeholder="CSS selector" className="flex-1 rounded-lg bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 text-xs text-white placeholder:text-gray-600 focus:border-indigo-500/40 focus:outline-none" />
                                                        {step.action === 'type' && (
                                                            <input value={step.value || ''} onChange={e => updateStep(step.id, { value: e.target.value })}
                                                                placeholder="Noi dung" className="w-36 rounded-lg bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 text-xs text-white placeholder:text-gray-600 focus:border-indigo-500/40 focus:outline-none" />
                                                        )}
                                                    </>
                                                )}
                                                {step.action === 'wait' && (
                                                    <div className="flex items-center gap-1.5">
                                                        <input type="number" value={step.delay || 1000} onChange={e => updateStep(step.id, { delay: parseInt(e.target.value) || 1000 })}
                                                            className="w-24 rounded-lg bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 text-xs text-white focus:border-indigo-500/40 focus:outline-none" />
                                                        <span className="text-[10px] text-gray-600">ms</span>
                                                    </div>
                                                )}
                                                {step.action === 'screenshot' && <span className="text-[11px] text-gray-500 italic">Chup toan man hinh</span>}
                                                {step.action === 'scroll' && <span className="text-[11px] text-gray-500 italic">Cuon xuong 500px</span>}
                                            </div>

                                            {/* Controls */}
                                            <div className="flex items-center gap-0.5 shrink-0">
                                                <button onClick={() => moveStep(idx, -1)} className="p-1.5 rounded-md text-gray-600 hover:text-gray-300 hover:bg-white/[0.06] transition-all"><ArrowUp className="h-3 w-3" /></button>
                                                <button onClick={() => moveStep(idx, 1)} className="p-1.5 rounded-md text-gray-600 hover:text-gray-300 hover:bg-white/[0.06] transition-all"><ArrowDown className="h-3 w-3" /></button>
                                                <button onClick={() => removeStep(step.id)} className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="h-3 w-3" /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Save */}
                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-white/[0.06]">
                        <button onClick={() => { setShowCreate(false); setEditingId(null); }}
                            className="rounded-xl px-5 py-2.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all">
                            Huy
                        </button>
                        <button onClick={handleSave}
                            className="flex items-center gap-2 rounded-xl gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all">
                            <Save className="h-3.5 w-3.5" /> Luu
                        </button>
                    </div>
                </div>
            )}

            {/* Task list */}
            {automations.length === 0 && !isFormOpen ? (
                <div className="flex flex-col items-center py-24 text-center animate-fadeIn">
                    <div className="relative mb-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl glass-card">
                            <Zap className="h-9 w-9 text-gray-600" />
                        </div>
                        <div className="absolute -inset-4 rounded-3xl bg-violet-500/5 blur-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-200">Chua co automation nao</h3>
                    <p className="text-sm text-gray-500 mt-1.5 max-w-xs">Tao automation voi cac buoc tu dong hoa trinh duyet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {automations.map((task, i) => (
                        <div key={task.id} className="glass-card p-0 overflow-hidden hover:border-white/[0.12] transition-all duration-300 animate-fadeIn" style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/15">
                                        <Zap className="h-5 w-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-white">{task.name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[11px] text-gray-500">{task.steps.length} buoc</span>
                                            {task.description && (
                                                <>
                                                    <span className="text-gray-700">-</span>
                                                    <span className="text-[11px] text-gray-500">{task.description}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleRun(task.id)} disabled={running === task.id || !selectedProfile}
                                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-40">
                                        <Play className="h-3 w-3" /> {running === task.id ? 'Dang chay...' : 'Chay'}
                                    </button>
                                    <button onClick={() => startEdit(task)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300 transition-all">
                                        <Zap className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(task.id)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-gray-500 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all">
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
