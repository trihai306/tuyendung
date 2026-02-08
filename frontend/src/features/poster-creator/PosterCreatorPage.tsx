import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CanvasElement, DesignTemplate } from './types';
import { useCanvasEditor } from './hooks/useCanvasEditor';
import { generatePosterFromJob, layoutVariants } from './hooks/useAiPosterGenerator';
import type { JobData, LayoutVariant } from './hooks/useAiPosterGenerator';
import EditorCanvas from './components/EditorCanvas';
import EditorToolbar from './components/EditorToolbar';
import PropertyPanel from './components/PropertyPanel';
import TemplateGallery from './components/TemplateGallery';
import AiBackgroundPanel from './components/AiBackgroundPanel';
import apiClient from '../../services/apiClient';

interface Job {
    id: number;
    title: string;
    salary_min: number | null;
    salary_max: number | null;
    location: string;
    requirements?: string;
    benefits?: string;
    description?: string;
    employment_type?: string;
    department?: string;
    company_name?: string;
}

type LeftTab = 'templates' | 'ai';

export function PosterCreatorPage() {
    const editor = useCanvasEditor();
    const [activeTemplateId, setActiveTemplateId] = useState('tech-dark');
    const [exporting, setExporting] = useState(false);
    const [showExportSuccess, setShowExportSuccess] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [showJobSelector, setShowJobSelector] = useState(false);
    const [leftTab, setLeftTab] = useState<LeftTab>('templates');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AI Poster Modal state
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiSelectedJob, setAiSelectedJob] = useState<Job | null>(null);
    const [aiSelectedVariant, setAiSelectedVariant] = useState<LayoutVariant>('classic');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiPreview, setAiPreview] = useState<{ elements: CanvasElement[]; bgGradient: string; bgColor: string; bgImage?: string } | null>(null);

    useEffect(() => {
        apiClient.get('/recruiting/jobs')
            .then(res => {
                const data = res.data?.data || res.data;
                if (Array.isArray(data)) setJobs(data);
            })
            .catch(() => { });
    }, []);

    const handleTemplateSelect = useCallback((template: DesignTemplate) => {
        editor.loadTemplate(template);
        setActiveTemplateId(template.id);
    }, [editor]);

    const handleAddText = useCallback(() => {
        editor.addText({ fontSize: 14, fontWeight: 400, text: 'Đoạn văn bản mới', color: '#ffffff' });
    }, [editor]);

    const handleAddHeading = useCallback(() => {
        editor.addText({ fontSize: 28, fontWeight: 800, text: 'TIÊU ĐỀ', width: 380, height: 40, color: '#ffffff' });
    }, [editor]);

    const handleAddShape = useCallback((shape: 'rect' | 'circle' | 'line') => {
        const defaults = { rect: { width: 120, height: 80, borderRadius: 12 }, circle: { width: 80, height: 80 }, line: { width: 200, height: 4 } };
        editor.addShape(shape, defaults[shape]);
    }, [editor]);

    const handleAddImage = useCallback(() => { fileInputRef.current?.click(); }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const src = ev.target?.result as string;
            editor.addImage(src, { width: 200, height: 200, x: 120, y: 200 });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }, [editor]);

    const handleApplyGradient = useCallback((gradient: string, bgColor: string) => {
        editor.updateBackground(bgColor, gradient);
    }, [editor]);

    const handleApplyImage = useCallback((src: string) => {
        editor.addImage(src, {
            x: 0, y: 0,
            width: editor.canvasWidth,
            height: editor.canvasHeight,
            objectFit: 'cover',
            borderRadius: 0,
            zIndex: 0,
        });
    }, [editor]);

    const handleFillJobData = useCallback((job: Job) => {
        const els = editor.elements;
        const titleEl = els.find(el => el.type === 'text' && el.y > 120 && el.y < 200 && el.width > 350);
        if (titleEl) editor.updateElement(titleEl.id, { text: job.title } as Partial<CanvasElement>);
        const salaryEl = els.find(el => el.type === 'text' && el.y > 225 && el.y < 260 && el.x < 180);
        if (salaryEl && job.salary_min && job.salary_max) {
            editor.updateElement(salaryEl.id, { text: `${Math.round(job.salary_min / 1000000)} - ${Math.round(job.salary_max / 1000000)} triệu` } as Partial<CanvasElement>);
        }
        const locEl = els.find(el => el.type === 'text' && el.y > 225 && el.y < 260 && el.x > 150);
        if (locEl && job.location) editor.updateElement(locEl.id, { text: job.location } as Partial<CanvasElement>);
        setShowJobSelector(false);
    }, [editor]);

    // ===== AI POSTER GENERATION =====
    const handleAiGenerate = useCallback(() => {
        if (!aiSelectedJob) return;
        setAiGenerating(true);

        // Simulate AI "thinking" delay for realistic feel
        setTimeout(() => {
            const jobData: JobData = {
                id: aiSelectedJob.id,
                title: aiSelectedJob.title,
                department: aiSelectedJob.department,
                location: aiSelectedJob.location,
                employment_type: aiSelectedJob.employment_type,
                salary_min: aiSelectedJob.salary_min,
                salary_max: aiSelectedJob.salary_max,
                description: aiSelectedJob.description,
                requirements: aiSelectedJob.requirements,
                benefits: aiSelectedJob.benefits,
                company_name: aiSelectedJob.company_name,
            };

            const result = generatePosterFromJob(jobData, aiSelectedVariant);
            setAiPreview(result);
            setAiGenerating(false);
        }, 1200);
    }, [aiSelectedJob, aiSelectedVariant]);

    const handleAiApply = useCallback(() => {
        if (!aiPreview) return;
        // Clear canvas and apply AI-generated elements
        editor.updateBackground(aiPreview.bgColor, aiPreview.bgGradient, aiPreview.bgImage);
        // Clear all existing elements first, then load new ones
        editor.loadElements(aiPreview.elements);
        setShowAiModal(false);
        setAiPreview(null);
        setAiSelectedJob(null);
    }, [aiPreview, editor]);

    // Auto-preview when job or variant changes
    useEffect(() => {
        if (aiSelectedJob && showAiModal) {
            handleAiGenerate();
        }
    }, [aiSelectedVariant]); // Re-generate on variant change

    const handleExport = useCallback(async () => {
        setExporting(true);
        try {
            const { default: html2canvas } = await import('html2canvas');
            const canvas = document.getElementById('poster-canvas');
            if (!canvas) throw new Error('Canvas not found');
            editor.deselectAll();
            await new Promise(r => setTimeout(r, 100));
            const c = await html2canvas(canvas, { scale: 2, useCORS: true, backgroundColor: null, logging: false });
            const link = document.createElement('a');
            link.download = `poster-${Date.now()}.png`;
            link.href = c.toDataURL('image/png');
            link.click();
            setShowExportSuccess(true);
            setTimeout(() => setShowExportSuccess(false), 3000);
        } catch (err) { console.error('Export failed:', err); }
        finally { setExporting(false); }
    }, [editor]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (editor.editingTextId) return;
            if (e.key === 'Delete' || e.key === 'Backspace') { if (editor.selectedId) { e.preventDefault(); editor.deleteSelected(); } }
            if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.shiftKey ? editor.redo() : editor.undo(); }
            if (e.key === 'y' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); editor.redo(); }
            if (e.key === 'd' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (editor.selectedId) editor.duplicateElement(editor.selectedId); }
            if (e.key === 'Escape') editor.deselectAll();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [editor]);

    return (
        <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {/* ===== HEADER — Standalone editor header ===== */}
            <header className="h-14 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    {/* Back to dashboard */}
                    <Link
                        to="/employer/dashboard"
                        className="flex items-center gap-2 px-2.5 py-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span className="text-xs font-medium hidden sm:inline">Quay lại</span>
                    </Link>

                    <div className="w-px h-6 bg-slate-200" />

                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm shadow-emerald-500/20">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-slate-800 font-bold text-sm leading-none">Poster Studio</h1>
                            <p className="text-slate-400 text-[10px] mt-0.5">Kéo thả • AI Nền • Xuất HD</p>
                        </div>
                    </div>
                </div>

                {/* Center actions */}
                <div className="flex items-center gap-2">
                    {/* ✨ AI Tạo Poster — MAIN CTA */}
                    <button
                        onClick={() => setShowAiModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-xs font-bold rounded-lg shadow-md shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                        </svg>
                        <span>AI Tạo Poster</span>
                    </button>

                    {/* Job data filler */}
                    <div className="relative">
                        <button
                            onClick={() => setShowJobSelector(!showJobSelector)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 text-xs transition-all border border-slate-200 hover:border-slate-300"
                        >
                            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span>Điền từ tin TD</span>
                            <svg className={`w-3 h-3 transition-transform ${showJobSelector ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {showJobSelector && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-10 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn tin tuyển dụng</span>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {jobs.length === 0 ? (
                                        <div className="p-4 text-xs text-slate-400 text-center">Chưa có tin tuyển dụng</div>
                                    ) : jobs.map(job => (
                                        <button key={job.id} onClick={() => handleFillJobData(job)} className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 transition-colors border-b border-slate-50 last:border-0">
                                            <div className="text-xs font-medium text-slate-700">{job.title}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                {job.location}{job.salary_min && job.salary_max && ` • ${Math.round(job.salary_min / 1000000)}–${Math.round(job.salary_max / 1000000)}M`}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Export */}
                <div className="flex items-center gap-2">
                    {/* Undo/Redo */}
                    <div className="flex items-center gap-0.5">
                        <button onClick={editor.undo} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all" title="Hoàn tác (Ctrl+Z)">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                        </button>
                        <button onClick={editor.redo} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all" title="Làm lại (Ctrl+Y)">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></svg>
                        </button>
                    </div>
                    <div className="w-px h-6 bg-slate-200" />
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        <span>{exporting ? 'Đang xuất...' : 'Xuất PNG'}</span>
                    </button>
                </div>
            </header>

            {/* ===== TOOLBAR ===== */}
            <EditorToolbar
                onAddText={handleAddText}
                onAddHeading={handleAddHeading}
                onAddShape={handleAddShape}
                onAddImage={handleAddImage}
                onUndo={editor.undo}
                onRedo={editor.redo}
                onExport={handleExport}
                exporting={exporting}
            />

            {/* ===== MAIN EDITOR AREA ===== */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT SIDEBAR — Tabs */}
                <div className="w-72 bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0">
                    {/* Tab switcher */}
                    <div className="flex border-b border-slate-200/80">
                        <button
                            onClick={() => setLeftTab('templates')}
                            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${leftTab === 'templates'
                                ? 'text-emerald-600 bg-emerald-50/50 border-b-2 border-emerald-500'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                            Mẫu
                        </button>
                        <button
                            onClick={() => setLeftTab('ai')}
                            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${leftTab === 'ai'
                                ? 'text-violet-600 bg-violet-50/50 border-b-2 border-violet-500'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            AI Nền
                        </button>
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-y-auto">
                        {leftTab === 'templates' && (
                            <TemplateGallery activeTemplateId={activeTemplateId} onSelect={handleTemplateSelect} />
                        )}
                        {leftTab === 'ai' && (
                            <AiBackgroundPanel onApplyGradient={handleApplyGradient} onApplyImage={handleApplyImage} />
                        )}
                    </div>
                </div>

                {/* CENTER — Canvas */}
                <div className="flex-1 flex items-center justify-center overflow-auto bg-slate-100 p-6"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                    <EditorCanvas
                        elements={editor.elements}
                        selectedId={editor.selectedId}
                        editingTextId={editor.editingTextId}
                        bgColor={editor.bgColor}
                        bgGradient={editor.bgGradient}
                        bgImage={editor.bgImage}
                        canvasWidth={editor.canvasWidth}
                        canvasHeight={editor.canvasHeight}
                        onSelect={editor.selectElement}
                        onDoubleClick={(id) => editor.setEditingTextId(id)}
                        onUpdateElement={editor.updateElement}
                        onUpdateElementWithHistory={editor.updateElementWithHistory}
                        onTextChange={(id, text) => editor.updateElement(id, { text } as Partial<CanvasElement>)}
                        onTextBlur={() => editor.setEditingTextId(null)}
                        onPushHistory={editor.pushHistory}
                    />
                </div>

                {/* RIGHT — Property Panel */}
                <PropertyPanel
                    selectedElement={editor.selectedElement}
                    bgColor={editor.bgColor}
                    bgGradient={editor.bgGradient}
                    onUpdateElement={editor.updateElementWithHistory}
                    onDeleteElement={editor.deleteElement}
                    onDuplicateElement={editor.duplicateElement}
                    onBringForward={editor.bringForward}
                    onSendBackward={editor.sendBackward}
                    onUpdateBackground={editor.updateBackground}
                />
            </div>

            {/* ===== AI POSTER GENERATION MODAL ===== */}
            {showAiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowAiModal(false); setAiPreview(null); }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-[900px] max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-purple-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">AI Tạo Poster Tuyển Dụng</h2>
                                        <p className="text-xs text-slate-500">Chọn tin tuyển dụng → AI tự động thiết kế poster chuyên nghiệp</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setShowAiModal(false); setAiPreview(null); }}
                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Left: Job Selection + Variant */}
                            <div className="w-[340px] border-r border-slate-200 flex flex-col">
                                {/* Job List */}
                                <div className="p-4 border-b border-slate-100">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">1. Chọn tin tuyển dụng</label>
                                </div>
                                <div className="flex-1 overflow-y-auto max-h-[280px]">
                                    {jobs.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <div className="text-3xl mb-2 opacity-30">📋</div>
                                            <p className="text-xs text-slate-400">Chưa có tin tuyển dụng</p>
                                        </div>
                                    ) : jobs.map(job => (
                                        <button
                                            key={job.id}
                                            onClick={() => { setAiSelectedJob(job); setAiPreview(null); }}
                                            className={`w-full text-left px-4 py-3 transition-all border-b border-slate-50 last:border-0 ${aiSelectedJob?.id === job.id
                                                ? 'bg-violet-50 border-l-3 border-l-violet-500'
                                                : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`text-xs font-semibold ${aiSelectedJob?.id === job.id ? 'text-violet-700' : 'text-slate-700'}`}>{job.title}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                                                {job.location && <span>📍 {job.location}</span>}
                                                {job.salary_min && job.salary_max && <span>💰 {Math.round(job.salary_min / 1000000)}–{Math.round(job.salary_max / 1000000)}M</span>}
                                                {job.employment_type && <span>🏢 {job.employment_type}</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Layout Variants */}
                                <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">2. Chọn phong cách</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {layoutVariants.map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => setAiSelectedVariant(v.id)}
                                                className={`p-2.5 rounded-xl text-left transition-all ${aiSelectedVariant === v.id
                                                    ? 'bg-violet-100 border-2 border-violet-400 shadow-sm'
                                                    : 'bg-white border-2 border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="text-base mb-0.5">{v.icon}</div>
                                                <div className={`text-[11px] font-bold ${aiSelectedVariant === v.id ? 'text-violet-700' : 'text-slate-700'}`}>{v.name}</div>
                                                <div className="text-[9px] text-slate-400">{v.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Generate + Apply buttons */}
                                <div className="p-4 border-t border-slate-200 space-y-2">
                                    <button
                                        onClick={handleAiGenerate}
                                        disabled={!aiSelectedJob || aiGenerating}
                                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {aiGenerating ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                AI đang thiết kế...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                                </svg>
                                                Tạo Poster
                                            </>
                                        )}
                                    </button>
                                    {aiPreview && (
                                        <button
                                            onClick={handleAiApply}
                                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Áp dụng vào Canvas
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Right: Preview */}
                            <div className="flex-1 bg-slate-100 flex items-center justify-center p-6"
                                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)', backgroundSize: '20px 20px' }}>
                                {!aiSelectedJob ? (
                                    <div className="text-center">
                                        <div className="text-5xl mb-4 opacity-20">🎨</div>
                                        <p className="text-sm text-slate-400 font-medium">Chọn tin tuyển dụng bên trái</p>
                                        <p className="text-xs text-slate-300 mt-1">AI sẽ thiết kế poster tự động</p>
                                    </div>
                                ) : aiGenerating ? (
                                    <div className="text-center">
                                        <div className="relative w-20 h-20 mx-auto mb-4">
                                            <div className="absolute inset-0 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin" />
                                            <div className="absolute inset-2 rounded-full border-4 border-purple-200 border-b-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                                            <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
                                        </div>
                                        <p className="text-sm font-semibold text-violet-600">AI đang thiết kế poster...</p>
                                        <p className="text-xs text-slate-400 mt-1">Phân tích ngành nghề, lương, vị trí...</p>
                                    </div>
                                ) : aiPreview ? (
                                    <div className="relative shadow-2xl rounded-lg overflow-hidden" style={{ width: 320, height: 452 }}>
                                        <div
                                            className="w-full h-full relative"
                                            style={{ background: aiPreview.bgGradient || aiPreview.bgColor, backgroundColor: aiPreview.bgColor, position: 'relative', overflow: 'hidden' }}
                                        >
                                            {aiPreview.bgImage && (
                                                <img src={aiPreview.bgImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
                                            )}
                                            {aiPreview.elements.map(el => (
                                                <div
                                                    key={el.id}
                                                    style={{
                                                        position: 'absolute',
                                                        left: el.x * (320 / 440),
                                                        top: el.y * (452 / 620),
                                                        width: el.width * (320 / 440),
                                                        height: el.height * (452 / 620),
                                                        opacity: el.opacity,
                                                        zIndex: el.zIndex,
                                                    }}
                                                >
                                                    {el.type === 'text' && (
                                                        <div style={{
                                                            fontSize: (el.fontSize || 14) * (320 / 440),
                                                            fontWeight: el.fontWeight || 400,
                                                            color: el.color || '#fff',
                                                            textAlign: (el.align || 'left') as any,
                                                            lineHeight: el.lineHeight || 1.3,
                                                            letterSpacing: (el.letterSpacing || 0) * (320 / 440),
                                                            padding: (el.padding || 0) * (320 / 440),
                                                            width: '100%',
                                                            height: '100%',
                                                            overflow: 'hidden',
                                                            whiteSpace: 'pre-wrap',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: el.align === 'center' ? 'center' : el.align === 'right' ? 'flex-end' : 'flex-start',
                                                        }}>
                                                            {el.text}
                                                        </div>
                                                    )}
                                                    {el.type === 'shape' && (
                                                        <div style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            backgroundColor: el.fill || 'transparent',
                                                            borderRadius: el.shape === 'circle' ? '50%' : (el.borderRadius || 0) * (320 / 440),
                                                        }} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {/* Preview badge */}
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md">
                                            <span className="text-[8px] font-bold text-white/80 uppercase tracking-wider">Preview</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="text-5xl mb-4 opacity-20">✨</div>
                                        <p className="text-sm text-slate-400 font-medium">Nhấn "Tạo Poster" để bắt đầu</p>
                                        <p className="text-xs text-slate-300 mt-1">Chọn phong cách rồi nhấn nút bên dưới</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Export success toast */}
            {showExportSuccess && (
                <div className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-lg shadow-xl shadow-emerald-500/20 flex items-center gap-2 z-50 animate-[slideUp_0.3s_ease-out]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="font-semibold text-xs">Đã xuất poster!</span>
                </div>
            )}
        </div>
    );
}

export default PosterCreatorPage;
