import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { PlusIcon, TrashIcon, ClockIcon } from '../../../components/ui/icons';

interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
}

interface ShiftPickerProps {
    shifts: Shift[];
    onChange: (shifts: Shift[]) => void;
}

const defaultShifts: Omit<Shift, 'id'>[] = [
    { name: 'Ca sáng', startTime: '06:00', endTime: '12:00' },
    { name: 'Ca chiều', startTime: '12:00', endTime: '18:00' },
    { name: 'Ca tối', startTime: '18:00', endTime: '23:00' },
    { name: 'Ca 12 tiếng', startTime: '06:00', endTime: '18:00' },
    { name: 'Ca đêm', startTime: '22:00', endTime: '06:00' },
];

export function ShiftPicker({ shifts, onChange }: ShiftPickerProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const addShift = (template?: Omit<Shift, 'id'>) => {
        const newShift: Shift = {
            id: Date.now().toString(),
            name: template?.name || 'Ca mới',
            startTime: template?.startTime || '08:00',
            endTime: template?.endTime || '17:00',
        };
        onChange([...shifts, newShift]);
    };

    const updateShift = (id: string, field: keyof Shift, value: string) => {
        onChange(shifts.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const removeShift = (id: string) => {
        onChange(shifts.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <ClockIcon className="w-4 h-4 inline mr-2" />
                    Ca làm việc
                </label>
            </div>

            {/* Quick Add Templates */}
            <div className="flex flex-wrap gap-2">
                {defaultShifts.map((template, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => addShift(template)}
                        className={`
                            px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                            ${isDark
                                ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                            }
                        `}
                    >
                        + {template.name} ({template.startTime}-{template.endTime})
                    </button>
                ))}
            </div>

            {/* Current Shifts */}
            <div className="space-y-3">
                {shifts.map((shift) => (
                    <div
                        key={shift.id}
                        className={`
                            flex items-center gap-3 p-3 rounded-lg border
                            ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}
                        `}
                    >
                        <input
                            type="text"
                            value={shift.name}
                            onChange={(e) => updateShift(shift.id, 'name', e.target.value)}
                            placeholder="Tên ca"
                            className={`
                                flex-1 px-3 py-2 rounded-lg text-sm
                                ${isDark
                                    ? 'bg-slate-900 border-slate-700 text-white'
                                    : 'bg-white border-slate-200 text-slate-800'
                                }
                                border focus:ring-2 focus:ring-emerald-500/30 focus:outline-none
                            `}
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="time"
                                value={shift.startTime}
                                onChange={(e) => updateShift(shift.id, 'startTime', e.target.value)}
                                className={`
                                    px-3 py-2 rounded-lg text-sm w-28
                                    ${isDark
                                        ? 'bg-slate-900 border-slate-700 text-white'
                                        : 'bg-white border-slate-200 text-slate-800'
                                    }
                                    border focus:ring-2 focus:ring-emerald-500/30 focus:outline-none
                                `}
                            />
                            <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>đến</span>
                            <input
                                type="time"
                                value={shift.endTime}
                                onChange={(e) => updateShift(shift.id, 'endTime', e.target.value)}
                                className={`
                                    px-3 py-2 rounded-lg text-sm w-28
                                    ${isDark
                                        ? 'bg-slate-900 border-slate-700 text-white'
                                        : 'bg-white border-slate-200 text-slate-800'
                                    }
                                    border focus:ring-2 focus:ring-emerald-500/30 focus:outline-none
                                `}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeShift(shift.id)}
                            className={`
                                p-2 rounded-lg transition-colors
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

                {shifts.length === 0 && (
                    <div className={`text-center py-6 rounded-lg border-2 border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                        Chưa có ca làm việc. Nhấn nút bên trên để thêm.
                    </div>
                )}
            </div>

            {/* Custom Add Button */}
            <button
                type="button"
                onClick={() => addShift()}
                className={`
                    w-full py-2.5 rounded-lg border-2 border-dashed text-sm font-medium transition-colors
                    flex items-center justify-center gap-2
                    ${isDark
                        ? 'border-slate-700 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400'
                        : 'border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-600'
                    }
                `}
            >
                <PlusIcon className="w-4 h-4" />
                Thêm ca tùy chỉnh
            </button>
        </div>
    );
}
