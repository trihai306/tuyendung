import { Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { useGetJobAlertsSummaryQuery } from '../jobAlertsApi';
import { ChevronRightIcon } from '../../../components/ui/icons';

export function JobAlertsWidget() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { data, isLoading } = useGetJobAlertsSummaryQuery();

    const summary = data?.data;
    const hasAlerts = summary && summary.total_alerts > 0;

    if (isLoading) {
        return (
            <div className={`rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="px-5 py-4 animate-pulse">
                    <div className={`h-4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded w-32 mb-2`} />
                    <div className={`h-3 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded w-48`} />
                </div>
            </div>
        );
    }

    if (!hasAlerts) {
        return (
            <div className={`rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-3 px-5 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                        <svg className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Mọi thứ đang ổn
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Tất cả tin tuyển dụng đang đúng tiến độ
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-amber-400' : 'bg-amber-500'}`} />
                    <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Cần chú ý
                    </h3>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        {summary.total_alerts}
                    </span>
                </div>
                <Link
                    to="/recruiting"
                    className={`text-xs font-medium flex items-center gap-1 ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
                >
                    Xem tất cả
                    <ChevronRightIcon className="w-3 h-3" />
                </Link>
            </div>

            {/* Inline Stats */}
            <div className={`flex items-center gap-6 px-5 py-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                {summary.expiring_count > 0 && (
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-orange-400' : 'bg-orange-500'}`} />
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span className="font-medium">{summary.expiring_count}</span> sắp hết hạn
                        </span>
                    </div>
                )}
                {summary.insufficient_count > 0 && (
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-slate-400' : 'bg-slate-400'}`} />
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span className="font-medium">{summary.insufficient_count}</span> cần thêm ứng viên
                        </span>
                    </div>
                )}
            </div>

            {/* Jobs List - Compact */}
            {summary.critical_jobs.length > 0 && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {summary.critical_jobs.slice(0, 5).map((job) => (
                        <Link
                            key={job.id}
                            to={`/recruiting/${job.id}`}
                            className={`flex items-center justify-between px-5 py-2.5 transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${job.type === 'expiring'
                                        ? (isDark ? 'bg-orange-400' : 'bg-orange-500')
                                        : (isDark ? 'bg-slate-400' : 'bg-slate-400')
                                    }`} />
                                <span className={`text-sm truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                    {job.title}
                                </span>
                            </div>
                            <span className={`text-xs flex-shrink-0 ml-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {job.message}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default JobAlertsWidget;
