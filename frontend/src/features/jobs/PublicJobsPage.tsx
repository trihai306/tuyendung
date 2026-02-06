import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicJobCard } from './components/PublicJobCard';
import { publicJobsApi } from './services/publicJobsApi';
import type { PublicJob, PublicJobsParams } from './services/publicJobsApi';
import { SEOHead } from '../../components/SEOHead';

const JOB_CATEGORIES = [
    { value: '', label: 'Tất cả ngành nghề' },
    { value: 'sales', label: 'Kinh doanh / Bán hàng' },
    { value: 'marketing', label: 'Marketing / Truyền thông' },
    { value: 'accounting', label: 'Kế toán / Tài chính' },
    { value: 'hr', label: 'Nhân sự' },
    { value: 'it', label: 'IT / Phần mềm' },
    { value: 'customer_service', label: 'Chăm sóc khách hàng' },
    { value: 'admin', label: 'Hành chính / Văn phòng' },
];

const LOCATIONS = [
    { value: '', label: 'Tất cả địa điểm' },
    { value: 'Hà Nội', label: 'Hà Nội' },
    { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
    { value: 'Hải Phòng', label: 'Hải Phòng' },
    { value: 'Cần Thơ', label: 'Cần Thơ' },
    { value: 'Bình Dương', label: 'Bình Dương' },
    { value: 'Đồng Nai', label: 'Đồng Nai' },
];

const EXPERIENCE_LEVELS = [
    { value: '', label: 'Tất cả' },
    { value: 'no_exp', label: 'Không yêu cầu' },
    { value: 'under_1', label: 'Dưới 1 năm' },
    { value: '1_year', label: '1 năm' },
    { value: '2_year', label: '2 năm' },
    { value: '3_year', label: '3 năm' },
    { value: '4_year', label: '4 năm' },
    { value: '5_year', label: '5 năm' },
    { value: 'over_5', label: 'Trên 5 năm' },
];

const JOB_LEVELS = [
    { value: '', label: 'Tất cả' },
    { value: 'intern', label: 'Thực tập sinh' },
    { value: 'staff', label: 'Nhân viên' },
    { value: 'team_lead', label: 'Trưởng nhóm' },
    { value: 'deputy_manager', label: 'Trưởng/Phó phòng' },
    { value: 'manager', label: 'Quản lý / Giám sát' },
    { value: 'branch_manager', label: 'Trưởng chi nhánh' },
    { value: 'director', label: 'Phó giám đốc' },
    { value: 'ceo', label: 'Giám đốc' },
];

export function PublicJobsPage() {
    const [jobs, setJobs] = useState<PublicJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [filters, setFilters] = useState<PublicJobsParams>({
        search: '',
        job_type: '',
        location: '',
        category: '',
        experience: '',
        level: '',
    });

    const [searchInput, setSearchInput] = useState('');
    const [categoryInput, setCategoryInput] = useState('');
    const [locationInput, setLocationInput] = useState('');

    useEffect(() => {
        fetchJobs();
    }, [currentPage, filters]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await publicJobsApi.getJobs({
                ...filters,
                page: currentPage,
            });

            setJobs(response.data);
            setTotalPages(response.last_page);
            setTotal(response.total);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setFilters({
            ...filters,
            search: searchInput,
            category: categoryInput,
            location: locationInput,
        });
        setCurrentPage(1);
    };

    const handleFilterChange = (key: keyof PublicJobsParams, value: string) => {
        setFilters({ ...filters, [key]: value });
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({ search: '', job_type: '', location: '', category: '', experience: '', level: '' });
        setSearchInput('');
        setCategoryInput('');
        setLocationInput('');
        setCurrentPage(1);
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    return (
        <div className="bg-slate-50">
            <SEOHead
                title="Tìm việc làm"
                description="Tìm kiếm hàng ngàn việc làm mới nhất. Ứng tuyển nhanh chóng, miễn phí tại Viecly - Nền tảng tuyển dụng thông minh."
                keywords="việc làm, tuyển dụng, tìm việc, cơ hội nghề nghiệp, việc làm mới nhất"
                breadcrumbs={[
                    { name: 'Trang chủ', url: 'https://viecly.vn/' },
                    { name: 'Việc làm', url: 'https://viecly.vn/jobs' },
                ]}
            />
            {/* Hero Search Section - TopCV Style */}
            <section className="bg-gradient-to-r from-[#00b14f] to-[#009643] py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <form onSubmit={handleSearch}>
                        <div className="bg-white rounded-lg p-1.5 flex flex-col md:flex-row gap-2 shadow-xl shadow-black/10">
                            {/* Category Dropdown */}
                            <div className="md:w-52 relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </div>
                                <select
                                    value={categoryInput}
                                    onChange={(e) => setCategoryInput(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 rounded-md border border-slate-200 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white appearance-none cursor-pointer"
                                >
                                    {JOB_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-px bg-slate-200 my-2" />

                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Vị trí tuyển dụng..."
                                    className="w-full h-11 pl-10 pr-4 rounded-md border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-px bg-slate-200 my-2" />

                            {/* Location Dropdown */}
                            <div className="md:w-44 relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <select
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 rounded-md border border-slate-200 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white appearance-none cursor-pointer"
                                >
                                    {LOCATIONS.map(loc => (
                                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Search Button */}
                            <button
                                type="submit"
                                className="h-11 px-8 bg-[#00b14f] hover:bg-[#009643] text-white font-semibold rounded-md transition-all whitespace-nowrap shadow-md hover:shadow-lg"
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Breadcrumb & Quick Info */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <nav className="flex items-center gap-2 text-sm">
                            <Link to="/" className="text-slate-500 hover:text-emerald-600 transition-colors">Trang chủ</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-800 font-medium">Việc làm</span>
                        </nav>
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Tạo thông báo việc làm
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm"
                        >
                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Lọc nâng cao
                            {hasActiveFilters && (
                                <span className="w-5 h-5 flex items-center justify-center bg-emerald-600 text-white text-xs rounded-full font-bold">
                                    {Object.values(filters).filter(v => v !== '').length}
                                </span>
                            )}
                        </button>

                        {/* Filters Sidebar */}
                        <aside className={`w-full lg:w-[280px] lg:shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-24 shadow-sm">
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-slate-800">Lọc nâng cao</h3>
                                    </div>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline"
                                        >
                                            Xóa lọc
                                        </button>
                                    )}
                                </div>

                                {/* Loại hình công việc */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Loại hình</h4>
                                    <div className="space-y-2.5">
                                        {[
                                            { value: '', label: 'Tất cả' },
                                            { value: 'full_time', label: 'Toàn thời gian' },
                                            { value: 'part_time', label: 'Bán thời gian' },
                                            { value: 'contract', label: 'Hợp đồng' },
                                            { value: 'intern', label: 'Thực tập' },
                                        ].map(type => (
                                            <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${filters.job_type === type.value ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                                                    {filters.job_type === type.value && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="job_type"
                                                    checked={filters.job_type === type.value}
                                                    onChange={() => handleFilterChange('job_type', type.value)}
                                                    className="sr-only"
                                                />
                                                <span className={`text-sm transition-colors ${filters.job_type === type.value ? 'text-emerald-600 font-medium' : 'text-slate-600 group-hover:text-slate-800'}`}>{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Kinh nghiệm */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Kinh nghiệm</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {EXPERIENCE_LEVELS.map(exp => (
                                            <label key={exp.value} className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${filters.experience === exp.value ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                                                    {filters.experience === exp.value && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="experience"
                                                    checked={filters.experience === exp.value}
                                                    onChange={() => handleFilterChange('experience', exp.value)}
                                                    className="sr-only"
                                                />
                                                <span className={`text-xs transition-colors ${filters.experience === exp.value ? 'text-emerald-600 font-medium' : 'text-slate-600 group-hover:text-slate-800'}`}>{exp.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Cấp bậc */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Cấp bậc</h4>
                                    <div className="space-y-2.5">
                                        {JOB_LEVELS.slice(0, 6).map(level => (
                                            <label key={level.value} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${filters.level === level.value ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                                                    {filters.level === level.value && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="level"
                                                    checked={filters.level === level.value}
                                                    onChange={() => handleFilterChange('level', level.value)}
                                                    className="sr-only"
                                                />
                                                <span className={`text-sm transition-colors ${filters.level === level.value ? 'text-emerald-600 font-medium' : 'text-slate-600 group-hover:text-slate-800'}`}>{level.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Jobs List */}
                        <main className="flex-1 min-w-0">
                            {/* Results Header */}
                            <div className="flex items-center justify-between mb-4 bg-white rounded-xl px-5 py-4 border border-slate-200 shadow-sm">
                                <p className="text-sm text-slate-600">
                                    Tìm thấy <span className="font-bold text-emerald-600 text-base">{total}</span> việc làm phù hợp
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400 hidden sm:inline">Sắp xếp:</span>
                                    <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white cursor-pointer">
                                        <option>Mới nhất</option>
                                        <option>Lương cao nhất</option>
                                        <option>Phù hợp nhất</option>
                                    </select>
                                </div>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                                            <div className="flex gap-4">
                                                <div className="w-[72px] h-[72px] bg-slate-200 rounded-lg" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-2">
                                                        <div className="h-5 bg-slate-200 rounded w-2/3" />
                                                        <div className="h-5 bg-slate-200 rounded w-20" />
                                                    </div>
                                                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                                                    <div className="flex gap-2">
                                                        <div className="h-6 bg-slate-200 rounded-full w-20" />
                                                        <div className="h-6 bg-slate-200 rounded-full w-24" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Jobs List */}
                            {!loading && jobs.length > 0 && (
                                <div className="space-y-3">
                                    {jobs.map((job) => (
                                        <PublicJobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && jobs.length === 0 && (
                                <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                        <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                        Không tìm thấy việc làm
                                    </h3>
                                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                        Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-medium shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Trước
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`
                                                        w-10 h-10 rounded-lg font-semibold transition-all
                                                        ${currentPage === pageNum
                                                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                                                        }
                                                    `}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-medium shadow-sm"
                                    >
                                        Sau
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </section>
        </div>
    );
}
