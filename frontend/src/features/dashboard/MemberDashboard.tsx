import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import apiClient from '../../services/apiClient';
import {
    BriefcaseIcon,
    UsersIcon,
    CalendarIcon,
    ClockIcon,
    CheckIcon,
    ChartBarIcon,
    ArrowRightIcon,
} from '../../components/ui/icons';

interface MyStats {
    my_jobs: number;
    pending_candidates: number;
    interviews_today: number;
    response_rate: number;
}

interface Task {
    id: number;
    title: string;
    type: 'review' | 'interview' | 'offer' | 'follow_up';
    due_time?: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
}

interface Interview {
    id: number;
    candidate_name: string;
    job_title: string;
    time: string;
    type: 'online' | 'onsite';
}

interface Activity {
    id: number;
    title: string;
    description: string;
    time_formatted: string;
}

export function MemberDashboard() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [stats, setStats] = useState<MyStats>({
        my_jobs: 0,
        pending_candidates: 0,
        interviews_today: 0,
        response_rate: 0,
    });
    const [tasks, setTasks] = useState<Task[]>([]);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch member-specific data from real APIs
        Promise.all([
            apiClient.get('/dashboard/my-stats'),
            apiClient.get('/dashboard/tasks'),
            apiClient.get('/dashboard/interviews'),
            apiClient.get('/company/activities?limit=5'),
        ]).then(([statsRes, tasksRes, interviewsRes, activitiesRes]) => {
            setStats(statsRes.data.data);
            setTasks(tasksRes.data.data || []);
            setInterviews(interviewsRes.data.data || []);
            setActivities(activitiesRes.data.data || []);
        }).catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-6 ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
            {/* Header */}
            <div className="mb-6">
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Xin chào! 👋
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {today} • Công việc hôm nay của bạn
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MiniStatCard
                    icon={<BriefcaseIcon className="w-5 h-5" />}
                    value={stats.my_jobs}
                    label="Tin được giao"
                    color="emerald"
                    isDark={isDark}
                />
                <MiniStatCard
                    icon={<UsersIcon className="w-5 h-5" />}
                    value={stats.pending_candidates}
                    label="UV đang xử lý"
                    color="blue"
                    isDark={isDark}
                />
                <MiniStatCard
                    icon={<CalendarIcon className="w-5 h-5" />}
                    value={stats.interviews_today}
                    label="Phỏng vấn hôm nay"
                    color="amber"
                    isDark={isDark}
                />
                <MiniStatCard
                    icon={<ChartBarIcon className="w-5 h-5" />}
                    value={`${stats.response_rate}%`}
                    label="Tỷ lệ phản hồi"
                    color="teal"
                    isDark={isDark}
                />
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Tasks */}
                <div className={`lg:col-span-2 rounded-xl border p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            📋 Công việc hôm nay
                        </h2>
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {tasks.filter(t => !t.completed).length} việc còn lại
                        </span>
                    </div>
                    <div className="space-y-2">
                        {tasks.map((task) => (
                            <TaskItem key={task.id} task={task} isDark={isDark} />
                        ))}
                    </div>
                </div>

                {/* Upcoming Interviews */}
                <div className={`rounded-xl border p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            📅 Lịch phỏng vấn
                        </h2>
                        <a href="/candidates" className={`text-sm hover:underline ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            Xem tất cả
                        </a>
                    </div>
                    <div className="space-y-3">
                        {interviews.map((interview) => (
                            <InterviewCard key={interview.id} interview={interview} isDark={isDark} />
                        ))}
                        {interviews.length === 0 && (
                            <p className={`text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Không có lịch phỏng vấn hôm nay
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className={`mt-6 rounded-xl border p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        🕐 Hoạt động gần đây
                    </h2>
                </div>
                <div className="space-y-2">
                    {activities.slice(0, 4).map((activity) => (
                        <div key={activity.id} className={`flex items-center gap-3 p-2 rounded ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                            <span className={`flex-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                {activity.title}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {activity.time_formatted}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Helper Components
function MiniStatCard({ icon, value, label, color, isDark }: {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    color: string;
    isDark: boolean;
}) {
    const colors: Record<string, string> = {
        emerald: isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
        blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600',
        amber: isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600',
        teal: isDark ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-600',
    };

    return (
        <div className={`rounded-xl border p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}>
                {icon}
            </div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
        </div>
    );
}

function TaskItem({ task, isDark }: { task: Task; isDark: boolean }) {
    const priorityColors: Record<string, string> = {
        high: isDark ? 'border-red-500' : 'border-red-400',
        medium: isDark ? 'border-amber-500' : 'border-amber-400',
        low: isDark ? 'border-slate-500' : 'border-slate-300',
    };

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg border-l-2 ${priorityColors[task.priority]} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'
            } ${task.completed ? 'opacity-50' : ''}`}>
            <button className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.completed
                ? (isDark ? 'bg-emerald-600 border-emerald-600' : 'bg-emerald-500 border-emerald-500')
                : (isDark ? 'border-slate-600 hover:border-emerald-500' : 'border-slate-300 hover:border-emerald-500')
                }`}>
                {task.completed && <CheckIcon className="w-3 h-3 text-white" />}
            </button>
            <span className={`flex-1 text-sm ${task.completed ? 'line-through' : ''} ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {task.title}
            </span>
            {task.due_time && (
                <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                    <ClockIcon className="w-3 h-3 inline mr-1" />
                    {task.due_time}
                </span>
            )}
        </div>
    );
}

function InterviewCard({ interview, isDark }: { interview: Interview; isDark: boolean }) {
    return (
        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between mb-1">
                <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {interview.time}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${interview.type === 'online'
                    ? (isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700')
                    : (isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                    }`}>
                    {interview.type === 'online' ? 'Online' : 'Trực tiếp'}
                </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {interview.candidate_name}
            </p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {interview.job_title}
            </p>
            <button className={`mt-2 text-xs flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'} hover:underline`}>
                Xem chi tiết <ArrowRightIcon className="w-3 h-3" />
            </button>
        </div>
    );
}
