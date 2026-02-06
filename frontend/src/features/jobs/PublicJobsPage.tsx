import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicJobCard } from './components/PublicJobCard';
import { publicJobsApi } from './services/publicJobsApi';
import type { PublicJob, PublicJobsParams } from './services/publicJobsApi';

export function PublicJobsPage() {
    const [jobs, setJobs] = useState<PublicJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState<PublicJobsParams>({
        search: '',
        job_type: '',
        location: '',
    });

    const [searchInput, setSearchInput] = useState('');

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
        setFilters({ ...filters, search: searchInput });
        setCurrentPage(1);
    };

    const handleFilterChange = (key: keyof PublicJobsParams, value: string) => {
        setFilters({ ...filters, [key]: value });
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({ search: '', job_type: '', location: '' });
        setSearchInput('');
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header with Navigation */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">TD</span>
                            </div>
                            <span className="font-bold text-slate-800 text-lg hidden sm:block">
                                Tuyển dụng thời vụ
                            </span>
                        </Link>

                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-emerald-500/20"
                            >
                                Đăng tuyển
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-12 sm:py-16 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-8">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                            Tìm việc làm thời vụ
                            <span className="block text-emerald-600 mt-2">Cơ hội nghề nghiệp cho bạn</span>
                        </h1>
                        <p className="text-lg text-slate-600">
                            Khám phá {total} việc làm đang tuyển dụng
                        </p>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Tìm kiếm theo vị trí, địa điểm, phòng ban..."
                                    className="
                    w-full px-4 py-3 pl-12
                    rounded-xl border border-slate-200
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                    text-slate-900 placeholder-slate-400
                  "
                                />
                                <svg
                                    className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button
                                type="submit"
                                className="
                  px-6 py-3 bg-emerald-600 hover:bg-emerald-700
                  text-white font-semibold rounded-xl
                  transition-colors shadow-lg shadow-emerald-500/30
                "
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar */}
                        <aside className="w-full lg:w-64 lg:shrink-0">
                            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-slate-900">Bộ lọc</h3>
                                    {(filters.search || filters.job_type || filters.location) && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-xs text-emerald-600 hover:text-emerald-700"
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {/* Job Type Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Loại hình
                                        </label>
                                        <select
                                            value={filters.job_type || ''}
                                            onChange={(e) => handleFilterChange('job_type', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="full_time">Toàn thời gian</option>
                                            <option value="part_time">Bán thời gian</option>
                                            <option value="contract">Hợp đồng</option>
                                            <option value="intern">Thực tập</option>
                                        </select>
                                    </div>

                                    {/* Location Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Địa điểm
                                        </label>
                                        <input
                                            type="text"
                                            value={filters.location || ''}
                                            onChange={(e) => handleFilterChange('location', e.target.value)}
                                            placeholder="VD: Hà Nội, TP.HCM"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Jobs Grid */}
                        <main className="flex-1">
                            {/* Results Header */}
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm text-slate-600">
                                    Hiển thị <span className="font-semibold">{jobs.length}</span> trong tổng số{' '}
                                    <span className="font-semibold">{total}</span> việc làm
                                </p>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                                            <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                                            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                                            <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
                                            <div className="flex gap-2 mb-4">
                                                <div className="h-6 bg-slate-200 rounded w-20"></div>
                                                <div className="h-6 bg-slate-200 rounded w-24"></div>
                                            </div>
                                            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                                            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Jobs Grid */}
                            {!loading && jobs.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {jobs.map((job) => (
                                        <PublicJobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && jobs.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        Không tìm thấy việc làm
                                    </h3>
                                    <p className="text-slate-600 mb-4">
                                        Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
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
                                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
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
                            w-10 h-10 rounded-lg font-medium transition-colors
                            ${currentPage === pageNum
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'text-slate-700 hover:bg-slate-100'
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
                                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Sau
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
