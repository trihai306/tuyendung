import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import apiClient from '../../services/apiClient';
import {
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    BriefcaseIcon,
    ClockIcon,
    UserGroupIcon,
    CheckCircleIcon,
    SparklesIcon,
} from '../../components/ui/icons';

// Event types with colors
const EVENT_TYPES = {
    interview: { label: 'Phỏng vấn', color: '#8B5CF6', bgLight: 'bg-purple-100', bgDark: 'bg-purple-900/30', textLight: 'text-purple-700', textDark: 'text-purple-400', dotBg: 'bg-purple-500' },
    task: { label: 'Task', color: '#F59E0B', bgLight: 'bg-amber-100', bgDark: 'bg-amber-900/30', textLight: 'text-amber-700', textDark: 'text-amber-400', dotBg: 'bg-amber-500' },
    job_expiration: { label: 'Hết hạn tin', color: '#EF4444', bgLight: 'bg-red-100', bgDark: 'bg-red-900/30', textLight: 'text-red-700', textDark: 'text-red-400', dotBg: 'bg-red-500' },
    scheduled_post: { label: 'Đăng bài', color: '#3B82F6', bgLight: 'bg-blue-100', bgDark: 'bg-blue-900/30', textLight: 'text-blue-700', textDark: 'text-blue-400', dotBg: 'bg-blue-500' },
} as const;

type EventType = keyof typeof EVENT_TYPES;

interface CalendarEvent {
    id: number;
    type: EventType;
    title: string;
    subtitle?: string;
    date: string;
    color: string;
    meta?: Record<string, unknown>;
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: CalendarEvent[];
}

interface CalendarEventsResponse {
    success: boolean;
    data: {
        interviews: CalendarEvent[];
        tasks: CalendarEvent[];
        job_expirations: CalendarEvent[];
        scheduled_posts: CalendarEvent[];
    };
}



export default function CalendarPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);


    // Filter states
    const [filters, setFilters] = useState<Record<EventType, boolean>>({
        interview: true,
        task: true,
        job_expiration: true,
        scheduled_post: true,
    });

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            startDate.setDate(startDate.getDate() - 7);
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            endDate.setDate(endDate.getDate() + 7);

            const response = await apiClient.get<CalendarEventsResponse>('/calendar/events', {
                params: {
                    start: startDate.toISOString().split('T')[0],
                    end: endDate.toISOString().split('T')[0],
                },
            });

            if (response.data?.success) {
                const allEvents: CalendarEvent[] = [
                    ...response.data.data.interviews,
                    ...response.data.data.tasks,
                    ...response.data.data.job_expirations,
                    ...response.data.data.scheduled_posts,
                ];
                setEvents(allEvents);
            } else {
                setEvents([]);
            }
        } catch {
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const filteredEvents = useMemo(() => {
        return events.filter(event => filters[event.type]);
    }, [events, filters]);

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
            date.setHours(0, 0, 0, 0);

            const dayEvents = filteredEvents.filter((event) => {
                const eventDate = new Date(event.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() === date.getTime();
            });

            days.push({
                date,
                isCurrentMonth: date.getMonth() === month,
                isToday: date.getTime() === today.getTime(),
                events: dayEvents,
            });
        }
        return days;
    }, [currentDate, filteredEvents]);

    const monthYear = currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    const goToToday = () => setCurrentDate(new Date());
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const toggleFilter = (type: EventType) => {
        setFilters(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const upcomingEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return filteredEvents
            .filter(e => new Date(e.date) >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 6);
    }, [filteredEvents]);

    // Statistics
    const stats = useMemo(() => {
        const thisMonth = filteredEvents;
        return {
            total: thisMonth.length,
            interviews: thisMonth.filter(e => e.type === 'interview').length,
            tasks: thisMonth.filter(e => e.type === 'task').length,
            posts: thisMonth.filter(e => e.type === 'scheduled_post').length,
        };
    }, [filteredEvents]);

    const getEventTypeIcon = (type: EventType) => {
        switch (type) {
            case 'interview': return <UserGroupIcon className="w-3.5 h-3.5" />;
            case 'task': return <CheckCircleIcon className="w-3.5 h-3.5" />;
            case 'job_expiration': return <BriefcaseIcon className="w-3.5 h-3.5" />;
            case 'scheduled_post': return <CalendarIcon className="w-3.5 h-3.5" />;
        }
    };

    const formatEventDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(d);
        eventDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Ngày mai';
        if (diffDays === -1) return 'Hôm qua';
        return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <div className={`relative overflow-hidden rounded-2xl ${isDark
                ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900'
                : 'bg-gradient-to-br from-white via-slate-50 to-purple-50/30'
                } border ${isDark ? 'border-slate-700/50' : 'border-slate-200/80'} p-6 lg:p-8`}>
                {/* Decorative orbs */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                            <CalendarIcon className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <h1 className={`text-xl lg:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Lịch tuyển dụng
                            </h1>
                            <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Phỏng vấn, tasks, hết hạn tin, và lịch đăng bài
                            </p>
                        </div>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={goToToday}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isDark
                                ? 'text-slate-300 hover:bg-slate-700 border border-slate-700'
                                : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            Hôm nay
                        </button>
                        <div className={`flex items-center rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-slate-100/80'}`}>
                            <button
                                onClick={prevMonth}
                                className={`p-2 rounded-l-xl transition-colors ${isDark
                                    ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                                    }`}
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                            <span className={`px-4 py-2 text-sm font-semibold min-w-[160px] text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
                            </span>
                            <button
                                onClick={nextMonth}
                                className={`p-2 rounded-r-xl transition-colors ${isDark
                                    ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                                    }`}
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-6">
                    {[
                        { label: 'Tổng sự kiện', value: stats.total, icon: <CalendarIcon className="w-5 h-5" />, iconBg: isDark ? 'bg-purple-500/20' : 'bg-purple-100', iconColor: 'text-purple-500' },
                        { label: 'Phỏng vấn', value: stats.interviews, icon: <UserGroupIcon className="w-5 h-5" />, iconBg: isDark ? 'bg-violet-500/20' : 'bg-violet-100', iconColor: 'text-violet-500' },
                        { label: 'Tasks', value: stats.tasks, icon: <CheckCircleIcon className="w-5 h-5" />, iconBg: isDark ? 'bg-amber-500/20' : 'bg-amber-100', iconColor: 'text-amber-500' },
                        { label: 'Đăng bài', value: stats.posts, icon: <SparklesIcon className="w-5 h-5" />, iconBg: isDark ? 'bg-blue-500/20' : 'bg-blue-100', iconColor: 'text-blue-500' },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className={`group relative p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${isDark
                                ? 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600'
                                : 'bg-white/80 border-slate-200/60 hover:border-slate-300 hover:shadow-slate-200/50'
                                }`}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${stat.iconBg} ${stat.iconColor}`}>
                                {stat.icon}
                            </div>
                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>



            {/* Event Type Filters */}
            <div className={`rounded-xl border p-4 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium uppercase tracking-wider mr-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Lọc:</span>
                    {(Object.entries(EVENT_TYPES) as [EventType, typeof EVENT_TYPES[EventType]][]).map(([type, config]) => (
                        <button
                            key={type}
                            onClick={() => toggleFilter(type)}
                            className={`
                                flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200
                                ${filters[type]
                                    ? isDark
                                        ? `${config.bgDark} ${config.textDark} ring-1 ring-inset ring-current/20`
                                        : `${config.bgLight} ${config.textLight} ring-1 ring-inset ring-current/20`
                                    : isDark
                                        ? 'bg-slate-800/50 text-slate-500 hover:text-slate-400'
                                        : 'bg-slate-100 text-slate-400 hover:text-slate-500'
                                }
                            `}
                        >
                            <span
                                className={`w-2 h-2 rounded-full transition-colors`}
                                style={{ backgroundColor: filters[type] ? config.color : (isDark ? '#475569' : '#94a3b8') }}
                            />
                            {config.label}
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${filters[type]
                                ? isDark ? 'bg-white/10' : 'bg-black/5'
                                : isDark ? 'bg-slate-700' : 'bg-slate-200'
                                }`}>
                                {filteredEvents.filter(e => e.type === type).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-5">
                {/* Calendar Grid */}
                <div className={`flex-1 rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                    {/* Week Days Header */}
                    <div className={`grid grid-cols-7 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                        {weekDays.map((day, idx) => (
                            <div
                                key={day}
                                className={`py-3 text-center text-xs font-semibold uppercase tracking-wider ${idx === 0
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
                        <div className={`h-[520px] flex items-center justify-center`}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Đang tải lịch...</span>
                            </div>
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
                                            min-h-[88px] p-2 text-left transition-all duration-150 relative group
                                            ${idx % 7 !== 6 ? (isDark ? 'border-r border-slate-700/30' : 'border-r border-slate-100') : ''}
                                            ${idx < 35 ? (isDark ? 'border-b border-slate-700/30' : 'border-b border-slate-100') : ''}
                                            ${!day.isCurrentMonth
                                                ? (isDark ? 'bg-slate-900/20' : 'bg-slate-50/50')
                                                : isSelected
                                                    ? (isDark ? 'bg-purple-500/10' : 'bg-purple-50/60')
                                                    : (isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50')
                                            }
                                        `}
                                    >
                                        {/* Date Number */}
                                        <div className="flex items-start justify-between mb-1">
                                            <span className={`
                                                inline-flex items-center justify-center w-7 h-7 text-xs rounded-lg font-medium transition-all
                                                ${day.isToday
                                                    ? 'bg-purple-500 text-white font-bold shadow-sm shadow-purple-500/30'
                                                    : day.isCurrentMonth
                                                        ? (isDark ? 'text-slate-300' : 'text-slate-700')
                                                        : (isDark ? 'text-slate-600' : 'text-slate-350')
                                                }
                                            `}>
                                                {day.date.getDate()}
                                            </span>
                                            {day.events.length > 0 && (
                                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${isDark ? 'bg-slate-700/60 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                                    {day.events.length}
                                                </span>
                                            )}
                                        </div>

                                        {/* Event Indicators */}
                                        {day.events.length > 0 && (
                                            <div className="space-y-0.5">
                                                {day.events.slice(0, 2).map((event) => {
                                                    const config = EVENT_TYPES[event.type];
                                                    return (
                                                        <div
                                                            key={`${event.type}-${event.id}`}
                                                            className={`
                                                                text-[10px] px-1.5 py-0.5 rounded truncate font-medium
                                                                ${isDark ? config.bgDark : config.bgLight}
                                                                ${isDark ? config.textDark : config.textLight}
                                                            `}
                                                        >
                                                            {event.title}
                                                        </div>
                                                    );
                                                })}
                                                {day.events.length > 2 && (
                                                    <div className={`text-[10px] px-1.5 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        +{day.events.length - 2} khác
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Selected Indicator */}
                                        {isSelected && (
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-purple-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="hidden lg:block w-80 space-y-5 flex-shrink-0">
                    {/* Selected Day Details */}
                    <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                        <div className={`px-5 py-3.5 border-b ${isDark ? 'border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-800/50' : 'border-slate-100 bg-gradient-to-r from-slate-50 to-white'}`}>
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {selectedDay
                                    ? selectedDay.date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })
                                    : 'Chi tiết ngày'
                                }
                            </h3>
                        </div>
                        <div className="p-4 max-h-[320px] overflow-y-auto">
                            {selectedDay ? (
                                selectedDay.events.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {selectedDay.events.map((event) => {
                                            const config = EVENT_TYPES[event.type];
                                            return (
                                                <div
                                                    key={`${event.type}-${event.id}`}
                                                    className={`p-3 rounded-xl transition-colors ${isDark ? 'bg-slate-900/40 hover:bg-slate-900/60' : 'bg-slate-50 hover:bg-slate-100'}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className={`p-2 rounded-lg ${isDark ? config.bgDark : config.bgLight}`}
                                                            style={{ color: config.color }}
                                                        >
                                                            {getEventTypeIcon(event.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                                {event.title}
                                                            </h5>
                                                            {event.subtitle && (
                                                                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                    {event.subtitle}
                                                                </p>
                                                            )}
                                                            <span className={`
                                                                inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full mt-1.5 font-medium
                                                                ${isDark ? config.bgDark : config.bgLight}
                                                                ${isDark ? config.textDark : config.textLight}
                                                            `}>
                                                                <span
                                                                    className="w-1.5 h-1.5 rounded-full"
                                                                    style={{ backgroundColor: config.color }}
                                                                />
                                                                {config.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center py-8">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                                            <CalendarIcon className={`w-6 h-6 ${isDark ? 'text-slate-500' : 'text-slate-300'}`} />
                                        </div>
                                        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Không có sự kiện</p>
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col items-center py-8">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                                        <CalendarIcon className={`w-6 h-6 ${isDark ? 'text-slate-500' : 'text-slate-300'}`} />
                                    </div>
                                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Chọn ngày để xem chi tiết</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                        <div className={`px-5 py-3.5 border-b flex items-center gap-2 ${isDark ? 'border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-800/50' : 'border-slate-100 bg-gradient-to-r from-slate-50 to-white'}`}>
                            <ClockIcon className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                Sắp tới
                            </h3>
                            {upcomingEvents.length > 0 && (
                                <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                                    {upcomingEvents.length}
                                </span>
                            )}
                        </div>
                        <div className="p-3">
                            {loading ? (
                                <div className="animate-pulse space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className={`h-12 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-100'}`} />
                                    ))}
                                </div>
                            ) : upcomingEvents.length > 0 ? (
                                <div className="space-y-1">
                                    {upcomingEvents.map((event) => {
                                        const config = EVENT_TYPES[event.type];
                                        return (
                                            <div
                                                key={`upcoming-${event.type}-${event.id}`}
                                                className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}
                                            >
                                                <div
                                                    className="w-1 h-10 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: config.color }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <span className={`text-sm font-medium truncate block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                        {event.title}
                                                    </span>
                                                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        {formatEventDate(event.date)}
                                                    </span>
                                                </div>
                                                <span className={`
                                                    text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0
                                                    ${isDark ? config.bgDark : config.bgLight}
                                                    ${isDark ? config.textDark : config.textLight}
                                                `}>
                                                    {config.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-6">
                                    <ClockIcon className={`w-8 h-8 mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Không có sự kiện sắp tới</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
