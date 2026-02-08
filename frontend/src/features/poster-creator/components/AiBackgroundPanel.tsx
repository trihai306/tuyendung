import { useState, useCallback, useRef } from 'react';

// ===== Professional Poster Background Library =====
interface BgTemplate {
    id: string;
    name: string;
    src: string;
    category: string;
    tags: string[];
}

const bgTemplates: BgTemplate[] = [
    // Doanh nghiệp / Corporate
    { id: 'corp-blue', name: 'Corporate Blue', src: '/poster-bg/corporate-blue.png', category: 'corporate', tags: ['tech', 'corporate', 'IT'] },
    { id: 'minimal-white', name: 'Minimal Clean', src: '/poster-bg/minimal-white.png', category: 'corporate', tags: ['clean', 'minimal', 'professional'] },
    { id: 'office', name: 'Office Modern', src: '/poster-bg/office.png', category: 'corporate', tags: ['office', 'tech', 'corporate'] },
    // Công nghệ / Sáng tạo
    { id: 'purple-creative', name: 'Creative Bokeh', src: '/poster-bg/purple-creative.png', category: 'creative', tags: ['design', 'creative', 'marketing'] },
    { id: 'emerald-pro', name: 'Emerald Flow', src: '/poster-bg/emerald-pro.png', category: 'creative', tags: ['tech', 'startup', 'modern'] },
    // Năng lượng / Sản xuất
    { id: 'orange-energy', name: 'Energy Orange', src: '/poster-bg/orange-energy.png', category: 'industrial', tags: ['construction', 'manufacturing', 'logistics'] },
    { id: 'red-bold', name: 'Bold Red', src: '/poster-bg/red-bold.png', category: 'industrial', tags: ['urgent', 'retail', 'sales'] },
    { id: 'factory', name: 'Factory Floor', src: '/poster-bg/factory.png', category: 'industrial', tags: ['factory', 'manufacturing'] },
    { id: 'construction', name: 'Construction', src: '/poster-bg/construction.png', category: 'industrial', tags: ['construction', 'engineering'] },
    { id: 'warehouse', name: 'Warehouse', src: '/poster-bg/warehouse.png', category: 'industrial', tags: ['logistics', 'warehouse'] },
    // Dịch vụ / Cao cấp
    { id: 'gold-luxury', name: 'Gold Luxury', src: '/poster-bg/gold-luxury.png', category: 'service', tags: ['hotel', 'luxury', 'hospitality'] },
    { id: 'restaurant', name: 'Restaurant', src: '/poster-bg/restaurant.png', category: 'service', tags: ['restaurant', 'food', 'hospitality'] },
    { id: 'retail', name: 'Retail Shop', src: '/poster-bg/retail.png', category: 'service', tags: ['retail', 'sales', 'shop'] },
    // Chuyên môn / Y tế
    { id: 'teal-medical', name: 'Medical Teal', src: '/poster-bg/teal-medical.png', category: 'professional', tags: ['healthcare', 'hospital', 'medical'] },
    { id: 'healthcare', name: 'Hospital', src: '/poster-bg/healthcare.png', category: 'professional', tags: ['healthcare', 'hospital'] },
    { id: 'education', name: 'Classroom', src: '/poster-bg/education.png', category: 'professional', tags: ['education', 'school', 'training'] },
];

const bgCategories = [
    { id: 'all', icon: '🏷️', label: 'Tất cả' },
    { id: 'corporate', icon: '🏢', label: 'Doanh nghiệp' },
    { id: 'creative', icon: '✨', label: 'Sáng tạo' },
    { id: 'industrial', icon: '🏗️', label: 'Sản xuất' },
    { id: 'service', icon: '⭐', label: 'Dịch vụ' },
    { id: 'professional', icon: '🏥', label: 'Chuyên môn' },
    { id: 'custom', icon: '📁', label: 'Tải lên' },
];

// ===== Gradient Presets =====
interface GradientPreset {
    id: string;
    name: string;
    gradient: string;
    category: string;
}

const gradientPresets: GradientPreset[] = [
    { id: 'corp-1', name: 'Ocean Blue', gradient: 'linear-gradient(135deg, #0c1445 0%, #1a237e 40%, #283593 100%)', category: 'corporate' },
    { id: 'corp-2', name: 'Midnight Pro', gradient: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', category: 'corporate' },
    { id: 'corp-3', name: 'Deep Teal', gradient: 'linear-gradient(135deg, #004d40 0%, #00695c 50%, #00897b 100%)', category: 'corporate' },
    { id: 'corp-4', name: 'Royal Navy', gradient: 'linear-gradient(180deg, #141e30 0%, #243b55 100%)', category: 'corporate' },
    { id: 'corp-5', name: 'Slate Pro', gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)', category: 'corporate' },
    { id: 'cre-1', name: 'Vivid Sunset', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 30%, #f0932b 60%, #f6e58d 100%)', category: 'creative' },
    { id: 'cre-2', name: 'Aurora', gradient: 'linear-gradient(135deg, #a855f7 0%, #6366f1 30%, #3b82f6 60%, #06b6d4 100%)', category: 'creative' },
    { id: 'cre-3', name: 'Candy Dream', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ff9a9e 100%)', category: 'creative' },
    { id: 'cre-4', name: 'Tropical', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', category: 'creative' },
    { id: 'cre-5', name: 'Neon Pop', gradient: 'linear-gradient(135deg, #ff00cc 0%, #333399 100%)', category: 'creative' },
    { id: 'tech-1', name: 'Cyber Indigo', gradient: 'linear-gradient(135deg, #0f172a 0%, #312e81 40%, #4f46e5 70%, #818cf8 100%)', category: 'tech' },
    { id: 'tech-2', name: 'Matrix', gradient: 'linear-gradient(180deg, #000000 0%, #0a1628 30%, #0d4f3c 70%, #10b981 100%)', category: 'tech' },
    { id: 'tech-3', name: 'Quantum', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #e94560 100%)', category: 'tech' },
    { id: 'tech-4', name: 'Dark Nebula', gradient: 'radial-gradient(ellipse at 30% 20%, #1a0533 0%, #0d0221 40%, #0d0221 60%, #240046 100%)', category: 'tech' },
    { id: 'nat-1', name: 'Forest Dawn', gradient: 'linear-gradient(180deg, #1b4332 0%, #2d6a4f 30%, #40916c 60%, #95d5b2 100%)', category: 'nature' },
    { id: 'nat-2', name: 'Ocean Depth', gradient: 'linear-gradient(180deg, #023e8a 0%, #0077b6 40%, #0096c7 70%, #48cae4 100%)', category: 'nature' },
    { id: 'nat-3', name: 'Desert Sun', gradient: 'linear-gradient(180deg, #7f5539 0%, #b08968 40%, #ddb892 70%, #ede0d4 100%)', category: 'nature' },
    { id: 'nat-4', name: 'Cherry Blossom', gradient: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 30%, #f48fb1 60%, #ec407a 100%)', category: 'nature' },
];

// ===== Pattern Library =====
interface PatternPreset {
    id: string;
    name: string;
    svg: string;
    bgColor: string;
    patternColor: string;
}

const patternPresets: PatternPreset[] = [
    { id: 'dots', name: 'Dots', bgColor: '#0f172a', patternColor: 'rgba(99,102,241,0.15)', svg: `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="1.5" fill="PATTERNCOLOR"/></svg>` },
    { id: 'grid', name: 'Grid', bgColor: '#1e293b', patternColor: 'rgba(148,163,184,0.1)', svg: `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h40v40H0z" fill="none" stroke="PATTERNCOLOR" stroke-width="1"/></svg>` },
    { id: 'diag', name: 'Diagonal', bgColor: '#0f172a', patternColor: 'rgba(139,92,246,0.12)', svg: `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 16L16 0" stroke="PATTERNCOLOR" stroke-width="1" fill="none"/></svg>` },
    { id: 'wave', name: 'Waves', bgColor: '#0c4a6e', patternColor: 'rgba(56,189,248,0.15)', svg: `<svg width="100" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M0 10 Q25 0 50 10 Q75 20 100 10" fill="none" stroke="PATTERNCOLOR" stroke-width="1.5"/></svg>` },
    { id: 'hex', name: 'Hexagon', bgColor: '#1a1a2e', patternColor: 'rgba(129,140,248,0.12)', svg: `<svg width="56" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66" fill="none" stroke="PATTERNCOLOR" stroke-width="1"/></svg>` },
    { id: 'cross', name: 'Cross', bgColor: '#1e1b4b', patternColor: 'rgba(196,181,253,0.1)', svg: `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0v24M0 12h24" stroke="PATTERNCOLOR" stroke-width="1" fill="none"/></svg>` },
];

// ===== Component =====
interface AiBackgroundPanelProps {
    onApplyGradient: (gradient: string, bgColor: string) => void;
    onApplyImage: (src: string) => void;
}

type TabId = 'gallery' | 'gradient' | 'pattern';

export function AiBackgroundPanel({ onApplyGradient, onApplyImage }: AiBackgroundPanelProps) {
    const [activeTab, setActiveTab] = useState<TabId>('gallery');
    const [bgCategory, setBgCategory] = useState('all');
    const [gradientCategory, setGradientCategory] = useState('corporate');
    const [customImages, setCustomImages] = useState<{ id: string; name: string; src: string }[]>([]);
    const [selectedBg, setSelectedBg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateRandomGradient = useCallback(() => {
        const hue1 = Math.random() * 360;
        const hue2 = (hue1 + 30 + Math.random() * 120) % 360;
        const angle = Math.round(Math.random() * 360);
        const sat1 = 50 + Math.random() * 50;
        const sat2 = 50 + Math.random() * 50;
        const light1 = 15 + Math.random() * 30;
        const light2 = 30 + Math.random() * 40;
        const gradient = `linear-gradient(${angle}deg, hsl(${Math.round(hue1)}, ${Math.round(sat1)}%, ${Math.round(light1)}%) 0%, hsl(${Math.round(hue2)}, ${Math.round(sat2)}%, ${Math.round(light2)}%) 100%)`;
        onApplyGradient(gradient, `hsl(${Math.round(hue1)}, ${Math.round(sat1)}%, ${Math.round(light1)}%)`);
    }, [onApplyGradient]);

    const applyPattern = useCallback((pattern: PatternPreset) => {
        const svg = pattern.svg.replace(/PATTERNCOLOR/g, pattern.patternColor);
        const encoded = btoa(svg);
        const bg = `url("data:image/svg+xml;base64,${encoded}")`;
        onApplyGradient(bg, pattern.bgColor);
    }, [onApplyGradient]);

    const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = () => {
                const src = reader.result as string;
                const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                const name = file.name.replace(/\.[^.]+$/, '');
                setCustomImages(prev => [...prev, { id, name, src }]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    }, []);

    const handleApplyBg = useCallback((src: string) => {
        setSelectedBg(src);
        onApplyImage(src);
    }, [onApplyImage]);

    const handleDeleteCustom = useCallback((id: string) => {
        setCustomImages(prev => prev.filter(img => img.id !== id));
    }, []);

    const filteredTemplates = bgCategory === 'all'
        ? bgTemplates
        : bgCategory === 'custom'
            ? []
            : bgTemplates.filter(t => t.category === bgCategory);

    const filteredGradients = gradientPresets.filter(g => g.category === gradientCategory);
    const gradientCategoryLabels: Record<string, string> = {
        corporate: '💼 Doanh nghiệp',
        creative: '🎨 Sáng tạo',
        tech: '💻 Công nghệ',
        nature: '🌿 Thiên nhiên',
    };

    const tabs: { id: TabId; icon: string; label: string }[] = [
        { id: 'gallery', icon: '🖼️', label: 'Mẫu nền' },
        { id: 'gradient', icon: '🎨', label: 'Gradient' },
        { id: 'pattern', icon: '🔲', label: 'Pattern' },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-slate-200/80 mx-3 mb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${activeTab === tab.id
                            ? 'text-emerald-600 border-b-2 border-emerald-500'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <span className="text-xs">{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
                {/* ======= GALLERY TAB ======= */}
                {activeTab === 'gallery' && (
                    <div className="space-y-3">
                        {/* Category chips */}
                        <div className="flex flex-wrap gap-1">
                            {bgCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setBgCategory(cat.id)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${bgCategory === cat.id
                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                        : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {cat.icon} {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleUpload}
                            className="hidden"
                        />

                        {bgCategory === 'custom' ? (
                            <div className="space-y-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 transition-all text-center cursor-pointer group"
                                >
                                    <div className="text-2xl mb-1 opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-110 transform duration-200">📤</div>
                                    <div className="text-xs font-semibold text-emerald-700">Tải ảnh nền lên</div>
                                    <div className="text-[10px] text-emerald-500 mt-0.5">PNG, JPG, WEBP — Kích thước bất kỳ</div>
                                </button>

                                {customImages.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {customImages.map(img => (
                                            <div key={img.id} className="relative group">
                                                <button
                                                    onClick={() => handleApplyBg(img.src)}
                                                    className={`w-full rounded-xl overflow-hidden aspect-[3/4] border-2 transition-all hover:scale-[1.02] ${selectedBg === img.src
                                                        ? 'border-emerald-500 ring-2 ring-emerald-400/30 shadow-lg'
                                                        : 'border-slate-200 hover:border-emerald-400'
                                                        }`}
                                                >
                                                    <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                                                    {selectedBg === img.src && (
                                                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                                                            <span className="text-white text-[10px]">✓</span>
                                                        </div>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCustom(img.id)}
                                                    className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-red-500/80 text-white text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center"
                                                >
                                                    ✕
                                                </button>
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl px-2 py-1.5 pointer-events-none">
                                                    <span className="text-[9px] font-medium text-white/80 truncate block">{img.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <div className="text-slate-300 text-[10px]">Chưa có ảnh tải lên</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Quick upload button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-medium hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center gap-1.5"
                                >
                                    <span>📤</span> Tải ảnh của bạn
                                </button>
                            </>
                        )}

                        {/* Template Gallery Grid */}
                        {bgCategory !== 'custom' && (
                            <div className="grid grid-cols-2 gap-2">
                                {/* Custom images in all view */}
                                {bgCategory === 'all' && customImages.map(img => (
                                    <div key={img.id} className="relative group">
                                        <button
                                            onClick={() => handleApplyBg(img.src)}
                                            className={`w-full rounded-xl overflow-hidden aspect-[3/4] border-2 transition-all hover:scale-[1.02] ${selectedBg === img.src
                                                ? 'border-emerald-500 ring-2 ring-emerald-400/30 shadow-lg'
                                                : 'border-slate-200 hover:border-emerald-400'
                                                }`}
                                        >
                                            <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                                            {selectedBg === img.src && (
                                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                                                    <span className="text-white text-[10px]">✓</span>
                                                </div>
                                            )}
                                        </button>
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl px-2 py-1.5 pointer-events-none">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[8px] bg-emerald-500/80 text-white px-1.5 py-0.5 rounded-md font-medium">Tải lên</span>
                                                <span className="text-[9px] font-medium text-white/80 truncate">{img.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Built-in templates */}
                                {filteredTemplates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleApplyBg(t.src)}
                                        className={`relative rounded-xl overflow-hidden aspect-[3/4] border-2 transition-all hover:scale-[1.02] group ${selectedBg === t.src
                                            ? 'border-emerald-500 ring-2 ring-emerald-400/30 shadow-lg'
                                            : 'border-slate-200 hover:border-emerald-400'
                                            }`}
                                    >
                                        <img src={t.src} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                                        {selectedBg === t.src && (
                                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                                                <span className="text-white text-[10px]">✓</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2 pointer-events-none">
                                            <span className="text-[10px] font-semibold text-white/90 drop-shadow">{t.name}</span>
                                        </div>
                                        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {filteredTemplates.length === 0 && bgCategory !== 'custom' && (
                            <div className="text-center py-6 text-slate-400 text-xs">
                                Không có mẫu nền cho danh mục này
                            </div>
                        )}
                    </div>
                )}

                {/* ======= GRADIENT TAB ======= */}
                {activeTab === 'gradient' && (
                    <div className="space-y-3">
                        <button
                            onClick={generateRandomGradient}
                            className="w-full py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 group"
                        >
                            <span className="text-sm group-hover:rotate-180 transition-transform duration-500">✦</span>
                            Gradient ngẫu nhiên
                        </button>

                        <div className="flex flex-wrap gap-1">
                            {Object.entries(gradientCategoryLabels).map(([cat, label]) => (
                                <button
                                    key={cat}
                                    onClick={() => setGradientCategory(cat)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${gradientCategory === cat
                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                        : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {filteredGradients.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => onApplyGradient(g.gradient, '#000')}
                                    className="group relative rounded-xl overflow-hidden aspect-[4/3] border border-slate-200 hover:border-emerald-400 transition-all hover:scale-[1.02] hover:shadow-md"
                                >
                                    <div className="w-full h-full" style={{ background: g.gradient }} />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                                        <span className="text-[9px] font-semibold text-white/80">{g.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ======= PATTERN TAB ======= */}
                {activeTab === 'pattern' && (
                    <div className="space-y-3">
                        <div className="text-[10px] text-slate-500 leading-relaxed px-1">
                            Chọn pattern để áp dụng làm nền poster.
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {patternPresets.map(p => {
                                const svg = p.svg.replace(/PATTERNCOLOR/g, p.patternColor);
                                const encoded = btoa(svg);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => applyPattern(p)}
                                        className="relative rounded-xl overflow-hidden aspect-square border border-slate-200 hover:border-emerald-400 transition-all hover:scale-[1.02]"
                                    >
                                        <div
                                            className="w-full h-full"
                                            style={{
                                                backgroundColor: p.bgColor,
                                                backgroundImage: `url("data:image/svg+xml;base64,${encoded}")`,
                                                backgroundRepeat: 'repeat',
                                            }}
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                                            <span className="text-[9px] font-semibold text-white/80">{p.name}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Mesh gradient section */}
                        <div className="pt-2 border-t border-slate-200">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Mesh Gradients</span>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {[
                                    { name: 'Cosmic', bg: 'radial-gradient(at 40% 20%, hsla(262,80%,40%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(225,80%,35%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(343,70%,40%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(200,60%,35%,1) 0px, transparent 50%)', color: '#0a0b1e' },
                                    { name: 'Neon City', bg: 'radial-gradient(at 20% 80%, hsla(320,80%,40%,1) 0px, transparent 50%), radial-gradient(at 80% 20%, hsla(190,80%,40%,1) 0px, transparent 50%), radial-gradient(at 50% 50%, hsla(260,70%,30%,1) 0px, transparent 50%)', color: '#0d0520' },
                                    { name: 'Ocean', bg: 'radial-gradient(at 50% 0%, hsla(210,80%,30%,1) 0px, transparent 60%), radial-gradient(at 0% 100%, hsla(180,60%,25%,1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(230,60%,25%,1) 0px, transparent 50%)', color: '#041026' },
                                    { name: 'Fire', bg: 'radial-gradient(at 30% 20%, hsla(0,80%,40%,1) 0px, transparent 50%), radial-gradient(at 70% 60%, hsla(30,80%,40%,1) 0px, transparent 50%), radial-gradient(at 50% 90%, hsla(350,70%,30%,1) 0px, transparent 50%)', color: '#1a0505' },
                                ].map((mesh, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onApplyGradient(mesh.bg, mesh.color)}
                                        className="relative rounded-xl overflow-hidden aspect-[4/3] border border-slate-200 hover:border-emerald-400 transition-all hover:scale-[1.02]"
                                    >
                                        <div className="w-full h-full" style={{ background: mesh.color }}>
                                            <div className="w-full h-full" style={{ backgroundImage: mesh.bg }} />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                                            <span className="text-[9px] font-semibold text-white/80">{mesh.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AiBackgroundPanel;
