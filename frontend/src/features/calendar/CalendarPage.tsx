import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import apiClient from '../../services/apiClient';
import {
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    BriefcaseIcon,
    ClockIcon,
} from '../../components/ui/icons';

interface Job {
    id: number;
    title: string;
    status: string;
    expires_at: string;
    published_at: string;
    department?: string;
    location?: string;
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    jobs: Job[];
}

export default function CalendarPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [currentDate, setCurrentDate] = useState(new Date());
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/jobs');
                setJobs(response.data?.data || []);
            } catch (error) {
                console.error('Failed to fetch jobs:', error);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: CalendarDay[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dayJobs = jobs.filter((job) => {
                if (!job.expires_at) return false;
                const expiresAt = new Date(job.expires_at);
                expiresAt.setHours(0, 0, 0, 0);
                return expiresAt.getTime() === date.getTime();
            });
            days.push({
                date,
                isCurrentMonth: date.getMonth() === month,
                isToday: date.getTime() === today.getTime(),
                jobs: dayJobs,
            });
        }
        return days;
    }, [currentDate, jobs]);

    const monthYear = currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    const goToToday = () => setCurrentDate(new Date());
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const upcomingExpiring = jobs
        .filter((j) => j.status === 'open' && j.expires_at && new Date(j.expires_at) > new Date())
        .sort((a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime())
        .slice(0, 5);

    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-10 backdrop-blur-md ${isDark ? 'bg-slate-950/80' : 'bg-slate-50/80'}`}>
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Lịch tuyển dụng
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Theo dõi hạn đăng tin và lịch hẹn
                            </p>
                        </div>

                        {/* Month Navigation */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={goToToday}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${isDark
                                    ? 'text-slate-300 hover:bg-slate-800'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                Hôm nay
                            </button>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={prevMonth}
                                    className={`p-1.5 rounded-lg transition-colors ${isDark
                                        ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                        }`}
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                <span className={`px-3 py-1.5 text-sm font-medium min-w-[140px] text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
                                </span>
                                <button
                                    onClick={nextMonth}
                                    className={`p-1.5 rounded-lg transition-colors ${isDark
                                        ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                        }`}
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-6">
                <div className="flex gap-5">
                    {/* Calendar Grid */}
                    <div className={`flex-1 rounded-xl border overflow-hidden ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                        {/* Week Days Header */}
                        <div className={`grid grid-cols-7 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            {weekDays.map((day, idx) => (
                                <div
                                    key={day}
                                    className={`py-3 text-center text-xs font-medium uppercase tracking-wide ${idx === 0
                                            ? (isDark ? 'text-rose-400/70' : 'text-rose-500/70')
                                            : (isDark ? 'text-slate-500' : 'text-slate-400')
                                        }`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Body */}
                        {loading ? (
                            <div className={`h-[500px] flex items-center justify-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-7">
                                {calendarDays.map((day, idx) => {
                                    const isSelected = selectedDay?.date.getTime() === day.date.getTime();

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedDay(day)}
                                            className={`
                                                min-h-[90px] p-2 text-left transition-all relative
                                                ${idx % 7 !== 6 ? (isDark ? 'border-r border-slate-800/50' : 'border-r border-slate-100') : ''}
                                                ${idx < 35 ? (isDark ? 'border-b border-slate-800/50' : 'border-b border-slate-100') : ''}
                                                ${!day.isCurrentMonth
                                                    ? (isDark ? 'bg-slate-900/30' : 'bg-slate-50/50')
                                                    : (isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50')
                                                }
                                                ${isSelected ? (isDark ? 'bg-slate-800/70' : 'bg-emerald-50/50') : ''}
                                            `}
                                        >
                                            {/* Date Number */}
                                            <div className="flex items-start justify-between mb-1">
                                                <span className={`
                                                    inline-flex items-center justify-center w-6 h-6 text-xs rounded-full
                                                    ${day.isToday
                                                        ? 'bg-emerald-500 text-white font-semibold'
                                                        : day.isCurrentMonth
                                                            ? (isDark ? 'text-slate-300' : 'text-slate-700')
                                                            : (isDark ? 'text-slate-600' : 'text-slate-400')
                                                    }
                                                `}>
                                                    {day.date.getDate()}
                                                </span>
                                                {day.jobs.length > 0 && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {day.jobs.length}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Job Indicators */}
                                            {day.jobs.length > 0 && (
                                                <div className="space-y-0.5">
                                                    {day.jobs.slice(0, 2).map((job) => (
                                                        <div
                                                            key={job.id}
                                                            className={`
                                                                text-[10px] px-1.5 py-0.5 rounded truncate
                                                                ${job.status === 'open'
                                                                    ? (isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
                                                                    : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                                                                }
                                                            `}
                                                        >
                                                            {job.title}
                                                        </div>
                                                    ))}
                                                    {day.jobs.length > 2 && (
                                                        <div className={`text-[10px] px-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            +{day.jobs.length - 2}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Selected Indicator */}
                                            {isSelected && (
                                                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${isDark ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-72 space-y-5">
                        {/* Selected Day Details */}
                        <div className={`rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {selectedDay
                                        ? selectedDay.date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })
                                        : 'Chi tiết ngày'
                                    }
                                </h3>
                            </div>
                            <div className="p-4">
                                {selectedDay ? (
                                    selectedDay.jobs.length > 0 ? (
                                        <div className="space-y-2">
                                            <p className={`text-xs font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Tin hết hạn ({selectedDay.jobs.length})
                                            </p>
                                            {selectedDay.jobs.map((job) => (
                                                <div key={job.id} className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                                    <div className="flex items-start gap-2">
                                                        <BriefcaseIcon className={`w-4 h-4 mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                                {job.title}
                                                            </h5>
                                                            {job.department && (
                                                                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                    {job.department}
                                                                </p>
                                                            )}
                                                            <span className={`
                                                                inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded mt-1.5
                                                                ${job.status === 'open'
                                                                    ? (isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                                                                    : (isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500')
                                                                }
                                                            `}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'open' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                                                                {job.status === 'open' ? 'Đang mở' : job.status === 'draft' ? 'Nháp' : 'Đã đóng'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={`text-center py-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            <p className="text-sm">Không có sự kiện</p>
                                        </div>
                                    )
                                ) : (
                                    <div className={`text-center py-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p className="text-sm">Chọn ngày để xem chi tiết</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Expiring */}
                        <div className={`rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className={`px-4 py-3 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <ClockIcon className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                                <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    Sắp hết hạn
                                </h3>
                            </div>
                            <div className="p-3">
                                {loading ? (
                                    <div className="animate-pulse space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className={`h-10 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                                        ))}
                                    </div>
                                ) : upcomingExpiring.length > 0 ? (
                                    <div className="space-y-1">
                                        {upcomingExpiring.map((job) => {
                                            const daysLeft = Math.ceil((new Date(job.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                            return (
                                                <div
                                                    key={job.id}
                                                    className={`flex items-center justify-between p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
                                                >
                                                    <span className={`text-sm truncate max-w-[160px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                        {job.title}
                                                    </span>
                                                    <span className={`
                                                        text-xs px-2 py-0.5 rounded-full font-medium
                                                        ${daysLeft <= 3
                                                            ? (isDark ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-100 text-rose-600')
                                                            : daysLeft <= 7
                                                                ? (isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-600')
                                                                : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                                                        }
                                                    `}>
                                                        {daysLeft}d
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className={`text-center py-4 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Không có tin sắp hết hạn
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
