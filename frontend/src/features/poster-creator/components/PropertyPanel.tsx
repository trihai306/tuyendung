import type { CanvasElement, TextElement, ShapeElement, ImageElement, TextAlign } from '../types';

interface PropertyPanelProps {
    selectedElement: CanvasElement | null;
    bgColor: string;
    bgGradient: string;
    onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
    onDeleteElement: (id: string) => void;
    onDuplicateElement: (id: string) => void;
    onBringForward: (id: string) => void;
    onSendBackward: (id: string) => void;
    onUpdateBackground: (color: string, gradient?: string) => void;
}

const inputClass = 'w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-400 transition-colors placeholder-slate-400';
const labelClass = 'block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-[0.1em]';
const colorInputClass = 'w-7 h-7 rounded-lg border border-slate-200 cursor-pointer appearance-none p-0 overflow-hidden bg-transparent';

export function PropertyPanel({
    selectedElement,
    bgColor,
    bgGradient,
    onUpdateElement,
    onDeleteElement,
    onDuplicateElement,
    onBringForward,
    onSendBackward,
    onUpdateBackground,
}: PropertyPanelProps) {
    const el = selectedElement;

    if (!el) {
        return (
            <div className="w-60 bg-white border-l border-slate-200/80 p-4 overflow-y-auto flex-shrink-0">
                <SectionHeader icon="🎨" label="Nền poster" />
                <div className="space-y-3 mt-3">
                    <div>
                        <label className={labelClass}>Màu nền</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={bgColor} onChange={e => onUpdateBackground(e.target.value, bgGradient)} className={colorInputClass} />
                            <input type="text" value={bgColor} onChange={e => onUpdateBackground(e.target.value, bgGradient)} className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Gradient</label>
                        <input type="text" value={bgGradient} onChange={e => onUpdateBackground(bgColor, e.target.value)} placeholder="linear-gradient(...)" className={inputClass} />
                    </div>
                    <div className="mt-4 p-3 bg-emerald-50/60 rounded-xl text-[10px] text-slate-500 leading-relaxed border border-emerald-100">
                        <span className="text-emerald-500">💡</span> Chọn element trên canvas để chỉnh sửa, hoặc dùng tab <strong className="text-violet-500">✨ AI Nền</strong> để tạo nền.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-60 bg-white border-l border-slate-200/80 overflow-y-auto flex-shrink-0">
            <div className="p-3 space-y-3">
                {/* Element type + actions */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        {el.type === 'text' ? '📝 Văn bản' : el.type === 'shape' ? '🔷 Hình' : '🖼 Ảnh'}
                    </span>
                    <div className="flex items-center gap-px">
                        <ActionBtn icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>} tip="Lên trước" onClick={() => onBringForward(el.id)} />
                        <ActionBtn icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>} tip="Xuống dưới" onClick={() => onSendBackward(el.id)} />
                        <ActionBtn icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="2" width="8" height="8" rx="1" strokeWidth={2} /><rect x="14" y="14" width="8" height="8" rx="1" strokeWidth={2} /></svg>} tip="Nhân bản" onClick={() => onDuplicateElement(el.id)} />
                        <ActionBtn icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} tip="Xóa" onClick={() => onDeleteElement(el.id)} danger />
                    </div>
                </div>

                {/* Position & Size */}
                <SectionHeader icon="📐" label="Vị trí" />
                <div className="grid grid-cols-2 gap-1.5">
                    <NumField label="X" value={el.x} onChange={v => onUpdateElement(el.id, { x: v })} />
                    <NumField label="Y" value={el.y} onChange={v => onUpdateElement(el.id, { y: v })} />
                    <NumField label="W" value={el.width} onChange={v => onUpdateElement(el.id, { width: v })} />
                    <NumField label="H" value={el.height} onChange={v => onUpdateElement(el.id, { height: v })} />
                </div>
                <NumField label="Opacity %" value={Math.round(el.opacity * 100)} onChange={v => onUpdateElement(el.id, { opacity: v / 100 })} min={0} max={100} />

                {el.type === 'text' && <TextProps el={el as TextElement} onUpdate={u => onUpdateElement(el.id, u)} />}
                {el.type === 'shape' && <ShapeProps el={el as ShapeElement} onUpdate={u => onUpdateElement(el.id, u)} />}
                {el.type === 'image' && <ImageProps el={el as ImageElement} onUpdate={u => onUpdateElement(el.id, u)} />}
            </div>
        </div>
    );
}

function TextProps({ el, onUpdate }: { el: TextElement; onUpdate: (u: Partial<TextElement>) => void }) {
    const shadowPresets = [
        { label: 'Không', value: '' },
        { label: 'Nhẹ', value: '0 1px 3px rgba(0,0,0,0.4)' },
        { label: 'Đậm', value: '0 2px 8px rgba(0,0,0,0.7)' },
        { label: 'Nổi bật', value: '0 0 12px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.5)' },
        { label: 'Phát sáng', value: '0 0 10px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.3)' },
    ];

    const fontFamilies = [
        { label: 'Inter', value: 'Inter, sans-serif' },
        { label: 'Roboto', value: 'Roboto, sans-serif' },
        { label: 'Montserrat', value: 'Montserrat, sans-serif' },
        { label: 'Playfair', value: 'Playfair Display, serif' },
        { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
        { label: 'Georgia', value: 'Georgia, serif' },
    ];

    return (
        <>
            <SectionHeader icon="✏️" label="Nội dung" />
            <textarea value={el.text} onChange={e => onUpdate({ text: e.target.value })} rows={2} className={inputClass + ' resize-none'} />

            <SectionHeader icon="🔤" label="Kiểu chữ" />
            <div>
                <label className={labelClass}>Font</label>
                <select value={el.fontFamily} onChange={e => onUpdate({ fontFamily: e.target.value })} className={inputClass}>
                    {fontFamilies.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                <NumField label="Cỡ" value={el.fontSize} onChange={v => onUpdate({ fontSize: v })} min={8} max={120} />
                <div>
                    <label className={labelClass}>Đậm</label>
                    <select value={el.fontWeight} onChange={e => onUpdate({ fontWeight: Number(e.target.value) })} className={inputClass}>
                        <option value={300}>Light</option>
                        <option value={400}>Regular</option>
                        <option value={500}>Medium</option>
                        <option value={600}>SemiBold</option>
                        <option value={700}>Bold</option>
                        <option value={800}>ExtraBold</option>
                        <option value={900}>Black</option>
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClass}>Căn chỉnh</label>
                <div className="flex gap-1">
                    {(['left', 'center', 'right'] as TextAlign[]).map(a => (
                        <button key={a} onClick={() => onUpdate({ align: a })} className={`flex-1 py-1 rounded-md text-[10px] font-medium transition-all ${el.align === a ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                            {a === 'left' ? '◀' : a === 'center' ? '◆' : '▶'}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className={labelClass}>Viết hoa</label>
                <div className="flex gap-1">
                    {[{ l: 'Aa', v: '' }, { l: 'AA', v: 'uppercase' }, { l: 'aa', v: 'lowercase' }].map(opt => (
                        <button key={opt.v} onClick={() => onUpdate({ textTransform: opt.v })} className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all ${(el.textTransform || '') === opt.v ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                            {opt.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
                <NumField label="Line H" value={Math.round(el.lineHeight * 10) / 10} onChange={v => onUpdate({ lineHeight: v })} min={0.5} max={3} step={0.1} />
                <NumField label="Spacing" value={el.letterSpacing} onChange={v => onUpdate({ letterSpacing: v })} min={-5} max={20} step={0.5} />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
                <NumField label="Padding" value={el.padding} onChange={v => onUpdate({ padding: v })} min={0} max={40} />
                <NumField label="Bo góc" value={el.borderRadius} onChange={v => onUpdate({ borderRadius: v })} min={0} max={50} />
            </div>

            <SectionHeader icon="🎨" label="Màu" />
            <ColorField label="Chữ" value={el.color} onChange={v => onUpdate({ color: v })} />
            <ColorField label="Nền" value={el.bgColor === 'transparent' ? '#000000' : el.bgColor} onChange={v => onUpdate({ bgColor: v })} />
            <label className="flex items-center gap-2 text-[10px] text-slate-500 cursor-pointer">
                <input type="checkbox" checked={el.bgColor === 'transparent'} onChange={e => onUpdate({ bgColor: e.target.checked ? 'transparent' : '#00000020' })} className="rounded accent-emerald-500 w-3 h-3" />
                Nền trong suốt
            </label>

            <SectionHeader icon="💫" label="Đổ bóng chữ" />
            <div className="grid grid-cols-3 gap-1">
                {shadowPresets.map(s => (
                    <button key={s.label} onClick={() => onUpdate({ textShadow: s.value || undefined })} className={`py-1.5 rounded-md text-[9px] font-medium transition-all ${(el.textShadow || '') === s.value ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                        {s.label}
                    </button>
                ))}
            </div>
        </>
    );
}

function ShapeProps({ el, onUpdate }: { el: ShapeElement; onUpdate: (u: Partial<ShapeElement>) => void }) {
    return (
        <>
            <SectionHeader icon="🎨" label="Kiểu" />
            <div>
                <label className={labelClass}>Nền / Gradient</label>
                <input type="text" value={el.fill} onChange={e => onUpdate({ fill: e.target.value })} className={inputClass} placeholder="#6366F1 hoặc linear-gradient(...)" />
            </div>
            <ColorField label="Viền" value={el.stroke === 'transparent' ? '#ffffff' : el.stroke} onChange={v => onUpdate({ stroke: v })} />
            <div className="grid grid-cols-2 gap-1.5">
                <NumField label="Viền" value={el.strokeWidth} onChange={v => onUpdate({ strokeWidth: v })} min={0} max={20} />
                <NumField label="Bo góc" value={el.borderRadius} onChange={v => onUpdate({ borderRadius: v })} min={0} max={200} />
            </div>
        </>
    );
}

function ImageProps({ el, onUpdate }: { el: ImageElement; onUpdate: (u: Partial<ImageElement>) => void }) {
    return (
        <>
            <SectionHeader icon="🖼" label="Ảnh" />
            <div>
                <label className={labelClass}>Fit</label>
                <select value={el.objectFit} onChange={e => onUpdate({ objectFit: e.target.value as ImageElement['objectFit'] })} className={inputClass}>
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Fill</option>
                </select>
            </div>
            <NumField label="Bo góc" value={el.borderRadius} onChange={v => onUpdate({ borderRadius: v })} min={0} max={200} />
        </>
    );
}

function SectionHeader({ icon, label }: { icon: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5 pt-1.5">
            <span className="text-xs">{icon}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em]">{label}</span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    );
}

function NumField({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step} className={inputClass + ' text-center'} />
        </div>
    );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            <div className="flex items-center gap-1.5">
                <input type="color" value={value} onChange={e => onChange(e.target.value)} className={colorInputClass} />
                <input type="text" value={value} onChange={e => onChange(e.target.value)} className={inputClass} />
            </div>
        </div>
    );
}

function ActionBtn({ icon, tip, onClick, danger }: { icon: React.ReactNode; tip: string; onClick: () => void; danger?: boolean }) {
    return (
        <button onClick={onClick} title={tip} className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${danger ? 'text-red-400/60 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
            {icon}
        </button>
    );
}

export default PropertyPanel;
