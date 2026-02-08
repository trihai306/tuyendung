import type { DesignTemplate } from '../types';
import { designTemplates, blankTemplate } from '../templates/templateData';

interface TemplateGalleryProps {
    activeTemplateId: string | null;
    onSelect: (template: DesignTemplate) => void;
}

export function TemplateGallery({ activeTemplateId, onSelect }: TemplateGalleryProps) {
    const allTemplates = [blankTemplate, ...designTemplates];

    return (
        <div className="space-y-2 p-3">
            {allTemplates.map(template => {
                const isActive = template.id === activeTemplateId;
                const isBlank = template.id === 'blank';

                return (
                    <button
                        key={template.id}
                        onClick={() => onSelect(template)}
                        className={`w-full rounded-xl overflow-hidden transition-all text-left group ${isActive
                            ? 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-white shadow-lg shadow-emerald-500/10'
                            : 'ring-1 ring-slate-200 hover:ring-slate-300 hover:shadow-md'
                            }`}
                    >
                        {/* Mini preview */}
                        <div
                            className="h-[72px] relative overflow-hidden group-hover:brightness-105 transition-all"
                            style={{
                                background: isBlank
                                    ? 'linear-gradient(135deg, #f1f5f9 25%, #e2e8f0 75%)'
                                    : template.bgGradient || template.bgColor,
                            }}
                        >
                            {isBlank ? (
                                <div className="flex items-center justify-center h-full gap-2">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                                </div>
                            ) : (
                                <>
                                    {template.elements.filter(el => el.type === 'shape').slice(0, 2).map(el => {
                                        const s = el as typeof el & { fill: string };
                                        return (
                                            <div
                                                key={el.id}
                                                className="absolute"
                                                style={{
                                                    left: (el.x / 440) * 100 + '%',
                                                    top: (el.y / 620) * 100 + '%',
                                                    width: (el.width / 440) * 100 + '%',
                                                    height: (el.height / 620) * 100 + '%',
                                                    background: s.fill,
                                                    opacity: el.opacity * 0.7,
                                                    borderRadius: 4,
                                                }}
                                            />
                                        );
                                    })}
                                    <div className="absolute bottom-2 left-2 right-2 space-y-1">
                                        <div className="h-1 w-6 bg-white/20 rounded-full" />
                                        <div className="h-2 w-16 bg-white/40 rounded-full" />
                                        <div className="h-1 w-12 bg-white/15 rounded-full" />
                                    </div>
                                </>
                            )}

                            {isActive && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                        </div>

                        <div className="px-2.5 py-2 bg-white border-t border-slate-100">
                            <div className="text-[10px] font-semibold text-slate-700 truncate">{template.name}</div>
                            <div className="text-[9px] text-slate-400 truncate">{template.description}</div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

export default TemplateGallery;
