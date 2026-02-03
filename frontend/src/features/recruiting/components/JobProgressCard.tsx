import { useTheme } from '../../../contexts/ThemeContext';
import { useGetJobAssignmentsQuery } from '../recruitingApi';

interface JobProgressCardProps {
    jobId: number;
    targetCount?: number;
    hiredCount?: number;
    compact?: boolean;
}

export function JobProgressCard({ jobId, targetCount, hiredCount = 0, compact = false }: JobProgressCardProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { data: assignmentsData } = useGetJobAssignmentsQuery(jobId);

    const assignments = assignmentsData?.data || [];
    const summary = assignmentsData?.summary || {};

    const totalFound = summary.total_found || 0;
    const totalConfirmed = summary.total_confirmed || hiredCount;
    const progress = targetCount ? Math.min(100, (totalConfirmed / targetCount) * 100) : 0;

    if (compact) {
        // Compact version for job cards
        return (
            <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Tiến độ</span>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        {totalConfirmed}/{targetCount || '∞'} người
                    </span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div
                        className={`h-full transition-all duration-300 ${progress >= 100 ? 'bg-green-500' :
                                progress >= 50 ? 'bg-teal-500' :
                                    progress >= 25 ? 'bg-amber-500' : 'bg-red-400'
                            }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    // Full version with assignments breakdown
    return (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Tiến độ tuyển dụng</h4>
                <span className={`text-sm font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                    {Math.round(progress)}%
                </span>
            </div>

            <div className={`h-2.5 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                <div
                    className={`h-full transition-all duration-300 ${progress >= 100 ? 'bg-green-500' : 'bg-teal-500'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className={`p-2 rounded ${isDark ? 'bg-slate-600' : 'bg-white'}`}>
                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalFound}</div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Đã tìm</div>
                </div>
                <div className={`p-2 rounded ${isDark ? 'bg-slate-600' : 'bg-white'}`}>
                    <div className={`text-lg font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{totalConfirmed}</div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Xác nhận</div>
                </div>
                <div className={`p-2 rounded ${isDark ? 'bg-slate-600' : 'bg-white'}`}>
                    <div className={`text-lg font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{targetCount || '∞'}</div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Chỉ tiêu</div>
                </div>
            </div>

            {assignments.length > 0 && (
                <div>
                    <h5 className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Nhân viên được giao ({assignments.length})
                    </h5>
                    <div className="space-y-1.5">
                        {assignments.map((a: any) => (
                            <div
                                key={a.id}
                                className={`flex items-center justify-between text-xs p-1.5 rounded ${isDark ? 'bg-slate-600' : 'bg-white'}`}
                            >
                                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                                    {a.user?.name}
                                </span>
                                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                                    {a.confirmed_count}/{a.target_assigned || '∞'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
