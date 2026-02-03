import { useTheme } from '../../../contexts/ThemeContext';
import {
    CalendarIcon, MapPinIcon, PlusIcon, TrashIcon, ClockIcon,
    BuildingOffice2Icon, ComputerDesktopIcon, PhoneIcon, LightBulbIcon
} from '../../../components/ui/icons';

type InterviewType = 'onsite' | 'online' | 'phone';

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
}

interface InterviewSchedule {
    type: InterviewType;
    location: string;
    timeSlots: TimeSlot[];
}

interface InterviewSchedulerProps {
    schedule: InterviewSchedule;
    onChange: (schedule: InterviewSchedule) => void;
}

export function InterviewScheduler({ schedule, onChange }: InterviewSchedulerProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const interviewTypes: { value: InterviewType; label: string; icon: React.ReactNode }[] = [
        { value: 'onsite', label: 'Trực tiếp', icon: <BuildingOffice2Icon className="w-6 h-6" /> },
        { value: 'online', label: 'Online (Zoom/Meet)', icon: <ComputerDesktopIcon className="w-6 h-6" /> },
        { value: 'phone', label: 'Điện thoại', icon: <PhoneIcon className="w-6 h-6" /> },
    ];

    const updateField = <K extends keyof InterviewSchedule>(field: K, value: InterviewSchedule[K]) => {
        onChange({ ...schedule, [field]: value });
    };

    const addTimeSlot = () => {
        const newSlot: TimeSlot = {
            id: Date.now().toString(),
            startTime: '09:00',
            endTime: '11:00',
        };
        updateField('timeSlots', [...schedule.timeSlots, newSlot]);
    };

    const updateTimeSlot = (id: string, field: keyof TimeSlot, value: string) => {
        updateField(
            'timeSlots',
            schedule.timeSlots.map(s => s.id === id ? { ...s, [field]: value } : s)
        );
    };

    const removeTimeSlot = (id: string) => {
        updateField('timeSlots', schedule.timeSlots.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-5">
            {/* Interview Type */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CalendarIcon className="w-4 h-4 inline mr-2" />
                    Hình thức phỏng vấn
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {interviewTypes.map(({ value, label, icon }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => updateField('type', value)}
                            className={`
                                p-3 rounded-xl border-2 text-center transition-all
                                ${schedule.type === value
                                    ? isDark
                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                        : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : isDark
                                        ? 'border-slate-700 text-slate-400 hover:border-slate-600'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }
                            `}
                        >
                            <div className="mb-1 flex justify-center">{icon}</div>
                            <div className="text-sm font-medium">{label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Location / Link */}
            <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <MapPinIcon className="w-4 h-4 inline mr-2" />
                    {schedule.type === 'onsite'
                        ? 'Địa chỉ phỏng vấn'
                        : schedule.type === 'online'
                            ? 'Link cuộc họp'
                            : 'Số điện thoại liên hệ'
                    }
                </label>
                <input
                    type="text"
                    value={schedule.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder={
                        schedule.type === 'onsite'
                            ? 'VD: 123 Nguyễn Huệ, Q.1, TP.HCM'
                            : schedule.type === 'online'
                                ? 'VD: https://zoom.us/j/123456'
                                : 'VD: 0901234567'
                    }
                    className={`
                        w-full px-4 py-2.5 rounded-lg text-sm
                        ${isDark
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                            : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
                        }
                        border focus:ring-2 focus:ring-emerald-500/30 focus:outline-none
                    `}
                />
            </div>

            {/* Time Slots */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-medium flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <ClockIcon className="w-4 h-4 text-emerald-500" />
                        Khung giờ phỏng vấn
                    </label>
                    <button
                        type="button"
                        onClick={addTimeSlot}
                        className={`
                            px-3 py-1 text-xs font-medium rounded-lg transition-colors
                            ${isDark
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }
                        `}
                    >
                        <PlusIcon className="w-3 h-3 inline mr-1" />
                        Thêm khung giờ
                    </button>
                </div>

                <div className="space-y-2">
                    {schedule.timeSlots.map((slot) => (
                        <div
                            key={slot.id}
                            className={`
                                flex items-center gap-3 p-3 rounded-lg
                                ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}
                            `}
                        >
                            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Từ</span>
                            <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                                className={`
                                    px-3 py-2 rounded-lg text-sm
                                    ${isDark
                                        ? 'bg-slate-900 border-slate-700 text-white'
                                        : 'bg-white border-slate-200 text-slate-800'
                                    }
                                    border focus:ring-2 focus:ring-emerald-500/30 focus:outline-none
                                `}
                            />
                            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>đến</span>
                            <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                                className={`
                                    px-3 py-2 rounded-lg text-sm
                                    ${isDark
                                        ? 'bg-slate-900 border-slate-700 text-white'
                                        : 'bg-white border-slate-200 text-slate-800'
                                    }
                                    border focus:ring-2 focus:ring-emerald-500/30 focus:outline-none
                                `}
                            />
                            <button
                                type="button"
                                onClick={() => removeTimeSlot(slot.id)}
                                className={`
                                    p-2 rounded-lg transition-colors ml-auto
                                    ${isDark
                                        ? 'text-red-400 hover:bg-red-500/20'
                                        : 'text-red-500 hover:bg-red-50'
                                    }
                                `}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {schedule.timeSlots.length === 0 && (
                        <div className={`text-center py-4 rounded-lg border border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                            Chưa có khung giờ. Nhấn "Thêm khung giờ" bên trên.
                        </div>
                    )}
                </div>

                <p className={`text-xs mt-2 flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <LightBulbIcon className="w-3.5 h-3.5" />
                    Ứng viên sẽ chọn 1 trong các khung giờ này khi đặt lịch phỏng vấn
                </p>
            </div>
        </div >
    );
}
