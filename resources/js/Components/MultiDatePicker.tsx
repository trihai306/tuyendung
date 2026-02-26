import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface MultiDatePickerProps {
    selectedDates: string[];
    onChange: (dates: string[]) => void;
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export default function MultiDatePicker({ selectedDates, onChange }: MultiDatePickerProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const selectedSet = useMemo(() => new Set(selectedDates), [selectedDates]);

    const calendarDays = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startWeekday = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const days: Array<{ date: Date; key: string; isCurrentMonth: boolean; isToday: boolean }> = [];

        // Previous month padding
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = startWeekday - 1; i >= 0; i--) {
            const d = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
            days.push({ date: d, key: formatDateKey(d), isCurrentMonth: false, isToday: false });
        }

        // Current month
        for (let i = 1; i <= totalDays; i++) {
            const d = new Date(currentYear, currentMonth, i);
            const key = formatDateKey(d);
            const isToday = key === formatDateKey(today);
            days.push({ date: d, key, isCurrentMonth: true, isToday });
        }

        // Next month padding
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            const d = new Date(currentYear, currentMonth + 1, i);
            days.push({ date: d, key: formatDateKey(d), isCurrentMonth: false, isToday: false });
        }

        return days;
    }, [currentMonth, currentYear]);

    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(y => y - 1);
        } else {
            setCurrentMonth(m => m - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(y => y + 1);
        } else {
            setCurrentMonth(m => m + 1);
        }
    };

    const toggleDate = (key: string) => {
        if (selectedSet.has(key)) {
            onChange(selectedDates.filter(d => d !== key));
        } else {
            onChange([...selectedDates, key].sort());
        }
    };

    const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString('vi-VN', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="rounded-xl border border-border/60 bg-background shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/40">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={goToPrevMonth}
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs font-semibold capitalize">{monthLabel}</span>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={goToNextMonth}
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-border/30">
                {WEEKDAYS.map(day => (
                    <div
                        key={day}
                        className="flex items-center justify-center h-7 text-[10px] font-semibold text-muted-foreground/70 uppercase"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-px p-1">
                {calendarDays.map(day => {
                    const isSelected = selectedSet.has(day.key);
                    return (
                        <button
                            key={day.key}
                            type="button"
                            onClick={() => day.isCurrentMonth && toggleDate(day.key)}
                            disabled={!day.isCurrentMonth}
                            className={`
                                relative flex items-center justify-center h-8 w-full rounded-md text-[11px] font-medium
                                transition-all duration-150 cursor-pointer
                                ${!day.isCurrentMonth
                                    ? 'text-muted-foreground/20 cursor-default'
                                    : isSelected
                                        ? 'bg-violet-500 text-white shadow-sm shadow-violet-500/30 ring-1 ring-violet-400/50'
                                        : day.isToday
                                            ? 'bg-primary/10 text-primary font-bold ring-1 ring-primary/30'
                                            : 'text-foreground hover:bg-muted/60'
                                }
                            `}
                        >
                            {day.date.getDate()}
                        </button>
                    );
                })}
            </div>

            {/* Selected count + Quick actions */}
            <div className="px-3 py-2 border-t border-border/30 bg-muted/20 space-y-2">
                {selectedDates.length > 0 && (
                    <p className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">
                        Da chon {selectedDates.length} ngay
                    </p>
                )}
                <div className="flex flex-wrap gap-1">
                    {[
                        {
                            label: 'Cuoi tuan',
                            fn: () => {
                                const dates: string[] = [...selectedDates];
                                const d = new Date();
                                const day = d.getDay();
                                const sat = new Date(d);
                                sat.setDate(d.getDate() + (6 - day));
                                const sun = new Date(sat);
                                sun.setDate(sat.getDate() + 1);
                                [sat, sun].forEach(dt => {
                                    const k = formatDateKey(dt);
                                    if (!dates.includes(k)) dates.push(k);
                                });
                                onChange(dates.sort());
                            },
                        },
                        {
                            label: 'Tuan sau',
                            fn: () => {
                                const dates: string[] = [...selectedDates];
                                const d = new Date();
                                const day = d.getDay();
                                const nextMon = new Date(d);
                                nextMon.setDate(d.getDate() + (8 - day));
                                for (let i = 0; i < 7; i++) {
                                    const dt = new Date(nextMon);
                                    dt.setDate(nextMon.getDate() + i);
                                    const k = formatDateKey(dt);
                                    if (!dates.includes(k)) dates.push(k);
                                }
                                onChange(dates.sort());
                            },
                        },
                        {
                            label: '3 ngay toi',
                            fn: () => {
                                const dates: string[] = [...selectedDates];
                                for (let i = 1; i <= 3; i++) {
                                    const dt = new Date();
                                    dt.setDate(dt.getDate() + i);
                                    const k = formatDateKey(dt);
                                    if (!dates.includes(k)) dates.push(k);
                                }
                                onChange(dates.sort());
                            },
                        },
                    ].map(shortcut => (
                        <button
                            key={shortcut.label}
                            type="button"
                            onClick={shortcut.fn}
                            className="px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-[9px] font-semibold hover:bg-violet-200 dark:hover:bg-violet-800/60 transition-colors"
                        >
                            {shortcut.label}
                        </button>
                    ))}
                    {selectedDates.length > 0 && (
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 text-[9px] font-semibold hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                        >
                            Xoa tat ca
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
