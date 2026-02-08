import type { CanvasElement } from '../types';

interface EditorToolbarProps {
    onAddText: () => void;
    onAddHeading: () => void;
    onAddShape: (shape: 'rect' | 'circle' | 'line') => void;
    onAddImage: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onExport: () => void;
    exporting: boolean;
}

const tools = [
    {
        id: 'text', label: 'Văn bản',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8" /></svg>,
    },
    {
        id: 'heading', label: 'Tiêu đề',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h8" /></svg>,
    },
    {
        id: 'rect', label: 'Hộp',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="3" /></svg>,
    },
    {
        id: 'circle', label: 'Tròn',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="9" /></svg>,
    },
    {
        id: 'line', label: 'Đường',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    },
    {
        id: 'image', label: 'Ảnh',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z" /></svg>,
    },
];

export function EditorToolbar({
    onAddText, onAddHeading, onAddShape, onAddImage,
    onUndo, onRedo, onExport, exporting
}: EditorToolbarProps) {
    const handleClick = (id: string) => {
        switch (id) {
            case 'text': onAddText(); break;
            case 'heading': onAddHeading(); break;
            case 'rect': onAddShape('rect'); break;
            case 'circle': onAddShape('circle'); break;
            case 'line': onAddShape('line'); break;
            case 'image': onAddImage(); break;
        }
    };

    return (
        <div className="bg-white border-b border-slate-200/80 px-4 py-1.5 flex items-center gap-1 flex-shrink-0">
            {tools.map(tool => (
                <button
                    key={tool.id}
                    onClick={() => handleClick(tool.id)}
                    className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all active:scale-95"
                    title={tool.label}
                >
                    {tool.icon}
                    <span className="text-[11px] font-medium hidden lg:inline">{tool.label}</span>
                </button>
            ))}
        </div>
    );
}

export default EditorToolbar;
