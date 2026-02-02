import { useJobs, useCandidates } from './hooks/useRecruiting';
import { useTheme } from '../../contexts/ThemeContext';

export function RecruitingPage() {
    const { jobs, isLoading: jobsLoading } = useJobs();
    const { candidates, isLoading: candidatesLoading } = useCandidates();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <div>
            {/* Header */}
            <header className={`rounded-xl mb-6 ${isDark ? 'bg-slate-900' : 'bg-white'} border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="px-6 py-4 flex items-center justify-between">
                    <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Tuyển dụng</h1>
                    <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Tạo tin tuyển dụng
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={`rounded-xl p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}>
                    <div className="text-2xl font-bold text-emerald-500">{jobs.length}</div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tin tuyển dụng</div>
                </div>
                <div className={`rounded-xl p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}>
                    <div className="text-2xl font-bold text-teal-500">{candidates.length}</div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ứng viên</div>
                </div>
                <div className={`rounded-xl p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}>
                    <div className="text-2xl font-bold text-amber-500">0</div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Phỏng vấn hôm nay</div>
                </div>
                <div className={`rounded-xl p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}>
                    <div className="text-2xl font-bold text-rose-500">0</div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Đã tuyển tháng này</div>
                </div>
            </div>

            {/* Jobs List */}
            <div className={`rounded-xl mb-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}>
                <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} flex items-center justify-between`}>
                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Tin tuyển dụng</h2>
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className={`px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/30 focus:outline-none ${isDark
                                ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
                            } border`}
                    />
                </div>

                {jobsLoading ? (
                    <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Đang tải...</div>
                ) : jobs.length === 0 ? (
                    <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <p>Chưa có tin tuyển dụng nào</p>
                        <button className="mt-2 text-emerald-500 hover:underline">Tạo tin mới</button>
                    </div>
                ) : (
                    <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                        {jobs.map((job) => (
                            <div key={job.id} className={`p-4 transition-colors cursor-pointer ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{job.title}</h3>
                                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{job.department} • {job.location}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${job.status === 'open'
                                                ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                                : job.status === 'draft'
                                                    ? isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                                                    : isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {job.status === 'open' ? 'Đang mở' : job.status === 'draft' ? 'Nháp' : 'Tạm dừng'}
                                        </span>
                                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{job.applications_count || 0} ứng viên</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Candidates */}
            <div className={`rounded-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border`}>
                <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Ứng viên gần đây</h2>
                </div>

                {candidatesLoading ? (
                    <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Đang tải...</div>
                ) : candidates.length === 0 ? (
                    <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Chưa có ứng viên nào
                    </div>
                ) : (
                    <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                        {candidates.slice(0, 5).map((candidate) => (
                            <div key={candidate.id} className={`p-4 transition-colors cursor-pointer ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                        {candidate.full_name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{candidate.full_name}</h3>
                                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{candidate.email || candidate.phone}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${candidate.source === 'chat'
                                            ? isDark ? 'bg-sky-500/15 text-sky-400' : 'bg-sky-100 text-sky-700'
                                            : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {candidate.source === 'chat' ? 'Chat' : 'Thủ công'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
