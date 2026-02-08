import { useTheme } from '../../../contexts/ThemeContext';
import { MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon } from '../../../components/ui/icons';
import { Select } from '../../../components/ui';
import { useState } from 'react';

type JobStatus = 'all' | 'open' | 'draft' | 'closed' | 'paused';

interface JobFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeTab: JobStatus;
    onTabChange: (tab: JobStatus) => void;
    jobCounts: {
        all: number;
        open: number;
        draft: number;
        closed: number;
        paused: number;
    };
}

export function JobFilters({
    searchQuery,
    onSearchChange,
    activeTab,
    onTabChange,
    jobCounts,
}: JobFiltersProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [showFilters, setShowFilters] = useState(false);

    const tabs: { key: JobStatus; label: string }[] = [
        { key: 'all', label: 'Tất cả' },
        { key: 'open', label: 'Đang mở' },
        { key: 'draft', label: 'Nháp' },
        { key: 'paused', label: 'Tạm dừng' },
        { key: 'closed', label: 'Đã đóng' },
    ];

    return (
        <div className={`rounded-xl border mb-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            {/* Tabs */}
            <div className={`flex items-center gap-1 p-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => onTabChange(tab.key)}
                        className={`
                            px-4 py-2 text-sm font-medium rounded-lg transition-colors
                            ${activeTab === tab.key
                                ? isDark
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-emerald-50 text-emerald-700'
                                : isDark
                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }
                        `}
                    >
                        {tab.label}
                        <span className={`
                            ml-1.5 px-1.5 py-0.5 text-xs rounded-full
                            ${activeTab === tab.key
                                ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                                : isDark ? 'bg-slate-800' : 'bg-slate-100'
                            }
                        `}>
                            {jobCounts[tab.key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search & Filters Bar */}
            <div className="flex items-center gap-3 p-4">
                {/* Search */}
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm kiếm tin tuyển dụng..."
                        className={`
                            w-full pl-10 pr-4 py-2.5 rounded-lg text-sm
                            focus:ring-2 focus:ring-emerald-500/30 focus:outline-none
                            ${isDark
                                ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
                            }
                            border
                        `}
                    />
                </div>

                {/* Filter Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${isDark
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                        }
                    `}
                >
                    <FunnelIcon className="w-4 h-4" />
                    Bộ lọc
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
                <div className={`px-4 pb-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <Select
                        label="Loại hình"
                        placeholder="Tất cả"
                        options={[
                            { value: 'full_time', label: 'Full-time' },
                            { value: 'part_time', label: 'Part-time' },
                            { value: 'contract', label: 'Hợp đồng' },
                            { value: 'internship', label: 'Thực tập' },
                        ]}
                    />
                    <Select
                        label="Địa điểm"
                        placeholder="Tất cả địa điểm"
                        options={[
                            { value: 'hanoi', label: 'Hà Nội' },
                            { value: 'hcm', label: 'TP. Hồ Chí Minh' },
                            { value: 'danang', label: 'Đà Nẵng' },
                        ]}
                    />
                    <Select
                        label="Sắp xếp"
                        options={[
                            { value: 'newest', label: 'Mới nhất' },
                            { value: 'oldest', label: 'Cũ nhất' },
                            { value: 'most_applicants', label: 'Nhiều ứng viên nhất' },
                        ]}
                    />
                </div>
            )}
        </div>
    );
}
