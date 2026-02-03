import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUpdateAssignmentProgressMutation } from '../recruitingApi';

interface UpdateProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignment: {
        id: number;
        job?: { title: string };
        target_assigned?: number;
        found_count: number;
        confirmed_count: number;
        notes?: string;
    };
}

export function UpdateProgressModal({ isOpen, onClose, assignment }: UpdateProgressModalProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [updateProgress, { isLoading }] = useUpdateAssignmentProgressMutation();

    const [foundCount, setFoundCount] = useState(String(assignment.found_count));
    const [confirmedCount, setConfirmedCount] = useState(String(assignment.confirmed_count));
    const [notes, setNotes] = useState(assignment.notes || '');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await updateProgress({
                assignmentId: assignment.id,
                found_count: parseInt(foundCount) || 0,
                confirmed_count: parseInt(confirmedCount) || 0,
                notes: notes || undefined,
            }).unwrap();

            onClose();
        } catch (err: any) {
            setError(err.data?.error || 'Có lỗi xảy ra');
        }
    };

    const progress = assignment.target_assigned
        ? Math.min(100, (parseInt(foundCount) || 0) / assignment.target_assigned * 100)
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className={`w-full max-w-md rounded-xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-xl`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Cập nhật tiến độ
                </h3>

                {assignment.job?.title && (
                    <p className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Tin: {assignment.job.title}
                    </p>
                )}

                {assignment.target_assigned && (
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Tiến độ</span>
                            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                                {foundCount || 0}/{assignment.target_assigned} ({Math.round(progress)}%)
                            </span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                            <div
                                className="h-full bg-teal-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Đã tìm được
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={foundCount}
                                onChange={(e) => setFoundCount(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Đã xác nhận
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={confirmedCount}
                                onChange={(e) => setConfirmedCount(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Ghi chú
                        </label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="VD: Đã liên hệ 30 người, 15 đồng ý..."
                            className={`w-full px-3 py-2 rounded-lg border resize-none ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 px-4 py-2 rounded-lg ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Đang lưu...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
