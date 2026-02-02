import { useState } from 'react';
import { usePipeline } from '../hooks/useRecruiting';

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
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [draggingFromStage, setDraggingFromStage] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, applicationId: number, stageId: number) => {
        setDraggingId(applicationId);
        setDraggingFromStage(stageId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', applicationId.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, toStageId: number) => {
        e.preventDefault();
        const applicationId = parseInt(e.dataTransfer.getData('text/plain'));

        if (applicationId && draggingId && draggingFromStage !== null) {
            moveApplicationToStage(applicationId, draggingFromStage, toStageId);
        }
        setDraggingId(null);
        setDraggingFromStage(null);
    };

    const handleDragEnd = () => {
        setDraggingId(null);
        setDraggingFromStage(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Build stages with applications
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

    return (
        <div className="h-full overflow-x-auto">
            <div className="inline-flex gap-4 p-4 min-w-full">
                {stages.map((stage) => (
                    <div
                        key={stage.id}
                        className="w-72 flex-shrink-0 bg-gray-100 rounded-xl"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        {/* Stage Header */}
                        <div className="p-3 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: stage.color || '#6b7280' }}
                                />
                                <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                                <span className="ml-auto bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {stage.applications?.length || 0}
                                </span>
                            </div>
                        </div>

                        {/* Applications List */}
                        <div className="p-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {stage.applications?.map((app) => (
                                <div
                                    key={app.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, app.id, stage.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${draggingId === app.id ? 'opacity-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                                            {app.candidate.avatar_url ? (
                                                <img
                                                    src={app.candidate.avatar_url}
                                                    alt=""
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                app.candidate.full_name?.[0]?.toUpperCase() || '?'
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {app.candidate.full_name}
                                            </h4>
                                            <p className="text-sm text-gray-500 truncate">
                                                {app.candidate.email || app.candidate.phone}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    {app.rating && (
                                        <div className="mt-2 flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= app.rating! ? 'text-yellow-400' : 'text-gray-200'
                                                        }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    )}

                                    {/* Applied Date */}
                                    <div className="mt-2 text-xs text-gray-400">
                                        {new Date(app.applied_at).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            ))}

                            {/* Empty State */}
                            {(!stage.applications || stage.applications.length === 0) && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    Kéo thả ứng viên vào đây
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
