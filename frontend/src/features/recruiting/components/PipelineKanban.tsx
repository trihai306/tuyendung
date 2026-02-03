import { useState } from 'react';
import { usePipeline } from '../hooks/useRecruiting';
import { useTheme } from '../../../contexts/ThemeContext';

interface Stage {
    id: number;
    name: string;
    color: string;
    applications: Application[];
}

interface Application {
    id: number;
    candidate: {
        id: number;
        full_name: string;
        email?: string | null;
        phone?: string | null;
        avatar_url?: string | null;
    };
    applied_at: string;
    rating?: number;
}

interface PipelineKanbanProps {
    jobId: number;
}

export function PipelineKanban({ jobId }: PipelineKanbanProps) {
    const { stages: pipelineStages, applications, moveApplicationToStage, isLoading } = usePipeline(jobId);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [draggingFromStage, setDraggingFromStage] = useState<number | null>(null);
    const [hoveredStage, setHoveredStage] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, applicationId: number, stageId: number) => {
        setDraggingId(applicationId);
        setDraggingFromStage(stageId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', applicationId.toString());
    };

    const handleDragOver = (e: React.DragEvent, stageId: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setHoveredStage(stageId);
    };

    const handleDragLeave = () => {
        setHoveredStage(null);
    };

    const handleDrop = (e: React.DragEvent, toStageId: number) => {
        e.preventDefault();
        const applicationId = parseInt(e.dataTransfer.getData('text/plain'));

        if (applicationId && draggingId && draggingFromStage !== null) {
            moveApplicationToStage(applicationId, draggingFromStage, toStageId);
        }
        setDraggingId(null);
        setDraggingFromStage(null);
        setHoveredStage(null);
    };

    const handleDragEnd = () => {
        setDraggingId(null);
        setDraggingFromStage(null);
        setHoveredStage(null);
    };

    // Stage colors with gradients
    const stageStyles: Record<string, { gradient: string; border: string; badge: string }> = {
        '#6B7280': { gradient: 'from-slate-500 to-slate-600', border: 'border-slate-400', badge: 'bg-slate-500' },
        '#3B82F6': { gradient: 'from-blue-500 to-blue-600', border: 'border-blue-400', badge: 'bg-blue-500' },
        '#8B5CF6': { gradient: 'from-violet-500 to-violet-600', border: 'border-violet-400', badge: 'bg-violet-500' },
        '#F59E0B': { gradient: 'from-amber-500 to-amber-600', border: 'border-amber-400', badge: 'bg-amber-500' },
        '#10B981': { gradient: 'from-emerald-500 to-emerald-600', border: 'border-emerald-400', badge: 'bg-emerald-500' },
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mx-auto mb-3"></div>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Đang tải pipeline...</p>
                </div>
            </div>
        );
    }

    const stages: Stage[] = pipelineStages.map((stage) => ({
        id: stage.id,
        name: stage.name,
        color: stage.color,
        applications: (applications[stage.id] || []).map((app) => ({
            id: app.id,
            candidate: {
                id: app.candidate?.id || 0,
                full_name: app.candidate?.full_name || 'Unknown',
                email: app.candidate?.email,
                phone: app.candidate?.phone,
                avatar_url: app.candidate?.avatar_url,
            },
            applied_at: (app as any).applied_at || new Date().toISOString(),
            rating: (app as any).rating,
        })),
    }));

    const getStageStyle = (color: string) => {
        return stageStyles[color] || stageStyles['#6B7280'];
    };

    return (
        <div className={`h-full overflow-x-auto ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
            <div className="inline-flex gap-4 p-4 min-w-full">
                {stages.map((stage, index) => {
                    const style = getStageStyle(stage.color);
                    const isHovered = hoveredStage === stage.id && draggingId !== null;

                    return (
                        <div
                            key={stage.id}
                            className={`w-80 flex-shrink-0 rounded-2xl transition-all duration-200 ${isDark ? 'bg-slate-800/80' : 'bg-white'
                                } ${isHovered ? 'ring-2 ring-teal-400 ring-offset-2' : ''} ${isDark ? '' : 'shadow-sm'
                                }`}
                            onDragOver={(e) => handleDragOver(e, stage.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, stage.id)}
                        >
                            {/* Stage Header */}
                            <div className={`p-4 rounded-t-2xl border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.gradient}`}></div>
                                    <h3 className={`font-semibold flex-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                        {stage.name}
                                    </h3>
                                    <span className={`${style.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                                        {stage.applications?.length || 0}
                                    </span>
                                </div>
                                {/* Stage indicator line */}
                                <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${style.gradient} opacity-30`}></div>
                            </div>

                            {/* Applications List */}
                            <div className={`p-3 space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin ${isDark ? 'scrollbar-thumb-slate-600' : 'scrollbar-thumb-slate-300'}`}>
                                {stage.applications?.map((app) => (
                                    <div
                                        key={app.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, app.id, stage.id)}
                                        onDragEnd={handleDragEnd}
                                        className={`rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-200 group ${isDark
                                                ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500'
                                                : 'bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md'
                                            } ${draggingId === app.id ? 'opacity-50 scale-95' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-teal-500/20">
                                                {app.candidate.avatar_url ? (
                                                    <img
                                                        src={app.candidate.avatar_url}
                                                        alt=""
                                                        className="w-full h-full rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    app.candidate.full_name?.[0]?.toUpperCase() || '?'
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                    {app.candidate.full_name}
                                                </h4>
                                                <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {app.candidate.email || app.candidate.phone || 'Chưa có thông tin'}
                                                </p>
                                            </div>

                                            {/* Action button (appears on hover) */}
                                            <button
                                                className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                                                    }`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Rating */}
                                        {app.rating && (
                                            <div className="mt-3 flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= app.rating! ? 'text-amber-400' : isDark ? 'text-slate-600' : 'text-slate-200'}`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        )}

                                        {/* Applied Date */}
                                        <div className={`mt-3 flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(app.applied_at).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {/* Empty State */}
                                {(!stage.applications || stage.applications.length === 0) && (
                                    <div className={`text-center py-12 px-4 rounded-xl border-2 border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'
                                        }`}>
                                        <div className="text-3xl mb-2">📋</div>
                                        <p className="text-sm font-medium">Chưa có ứng viên</p>
                                        <p className="text-xs mt-1">Kéo thả ứng viên vào đây</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
