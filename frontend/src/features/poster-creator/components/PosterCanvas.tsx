import type { PosterTemplate, PosterContent } from '../templates/templateData';

interface PosterCanvasProps {
    template: PosterTemplate;
    content: PosterContent;
    scale?: number;
}

export function PosterCanvas({ template, content, scale = 1 }: PosterCanvasProps) {
    const { colors } = template;

    return (
        <div
            id="poster-canvas"
            className="relative overflow-hidden shadow-2xl"
            style={{
                width: 400 * scale,
                height: 600 * scale,
                backgroundColor: colors.background,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
            }}
        >
            {/* Header with gradient */}
            <div
                className="absolute top-0 left-0 right-0 h-1/3"
                style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                }}
            >
                {/* Decorative shapes */}
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20 bg-white" />
                <div className="absolute -left-5 bottom-0 w-24 h-24 rounded-full opacity-10 bg-white" />

                {/* Company Logo */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                    {content.logoUrl ? (
                        <img
                            src={content.logoUrl}
                            alt="Logo"
                            className="h-12 w-auto object-contain bg-white rounded-lg p-1"
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                            {content.companyName.charAt(0)}
                        </div>
                    )}
                    <span className="text-white/90 text-sm font-medium">{content.companyName}</span>
                </div>

                {/* Title */}
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="text-white/80 text-sm font-medium mb-1">{content.title}</div>
                    <h1 className="text-white text-2xl font-bold leading-tight">{content.subtitle}</h1>
                </div>
            </div>

            {/* Body content */}
            <div
                className="absolute top-1/3 left-0 right-0 bottom-0 p-6"
                style={{ color: colors.text }}
            >
                {/* Salary & Location */}
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                        <div className="text-xs opacity-70 mb-1">💰 Mức lương</div>
                        <div className="font-semibold text-sm" style={{ color: colors.primary }}>
                            {content.salary}
                        </div>
                    </div>
                    <div className="flex-1 p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                        <div className="text-xs opacity-70 mb-1">📍 Địa điểm</div>
                        <div className="font-semibold text-sm" style={{ color: colors.primary }}>
                            {content.location}
                        </div>
                    </div>
                </div>

                {/* Requirements */}
                <div className="mb-4">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span style={{ color: colors.primary }}>✓</span> Yêu cầu
                    </h3>
                    <ul className="space-y-1">
                        {content.requirements.slice(0, 4).map((req, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: colors.primary }} />
                                {req}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Benefits */}
                <div className="mb-4">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span style={{ color: colors.primary }}>⭐</span> Quyền lợi
                    </h3>
                    <ul className="space-y-1">
                        {content.benefits.slice(0, 3).map((benefit, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: colors.primary }} />
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer */}
                <div
                    className="absolute bottom-4 left-6 right-6 pt-3 border-t"
                    style={{ borderColor: `${colors.primary}30` }}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-xs opacity-70">{content.contactInfo}</div>
                        {content.deadline && (
                            <div
                                className="text-xs px-2 py-1 rounded-full"
                                style={{ backgroundColor: colors.primary, color: '#fff' }}
                            >
                                Hạn: {content.deadline}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PosterCanvas;
