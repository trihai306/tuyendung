import type { PosterTemplate } from '../templates/templateData';
import { posterTemplates } from '../templates/templateData';

interface TemplateGalleryProps {
    selectedId: string;
    onSelect: (template: PosterTemplate) => void;
}

export function TemplateGallery({ selectedId, onSelect }: TemplateGalleryProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Chọn mẫu</h3>
            <div className="space-y-2">
                {posterTemplates.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onSelect(template)}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left ${selectedId === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                    >
                        {/* Preview colors */}
                        <div className="flex gap-1 mb-2">
                            <div
                                className="w-6 h-6 rounded-lg"
                                style={{ backgroundColor: template.colors.primary }}
                            />
                            <div
                                className="w-6 h-6 rounded-lg"
                                style={{ backgroundColor: template.colors.secondary }}
                            />
                            <div
                                className="w-6 h-6 rounded-lg border"
                                style={{ backgroundColor: template.colors.background }}
                            />
                        </div>
                        <div className="font-medium text-sm text-slate-900">{template.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{template.description}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default TemplateGallery;
