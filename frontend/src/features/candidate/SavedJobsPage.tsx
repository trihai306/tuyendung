import { useState } from 'react';
import { Link } from 'react-router-dom';

interface SavedJob {
    id: number;
    title: string;
    company: string;
    location: string;
    salary: string;
    jobType: string;
    savedAt: string;
}

const mockSavedJobs: SavedJob[] = [
    {
        id: 1,
        title: 'Nhân viên phục vụ quán cafe',
        company: 'The Coffee House',
        location: 'Quận 1, TP.HCM',
        salary: '4 - 5 triệu',
        jobType: 'Bán thời gian',
        savedAt: '2026-02-05',
    },
    {
        id: 2,
        title: 'Shipper nội thành',
        company: 'Giao Hàng Nhanh',
        location: 'TP.HCM',
        salary: '300.000 - 500.000/ngày',
        jobType: 'Toàn thời gian',
        savedAt: '2026-02-04',
    },
    {
        id: 3,
        title: 'Nhân viên bán hàng',
        company: 'FPT Shop',
        location: 'Quận Tân Bình',
        salary: '6 - 10 triệu',
        jobType: 'Toàn thời gian',
        savedAt: '2026-02-03',
    },
];

export function SavedJobsPage() {
    const [savedJobs, setSavedJobs] = useState(mockSavedJobs);

    const handleRemoveJob = (jobId: number) => {
        setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Việc làm đã lưu</h1>
                <p className="text-slate-500">
                    Bạn đã lưu <span className="font-semibold text-emerald-600">{savedJobs.length}</span> việc làm
                </p>
            </div>

            {/* Saved Jobs List */}
            {savedJobs.length > 0 ? (
                <div className="space-y-4">
                    {savedJobs.map((job) => (
                        <div
                            key={job.id}
                            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-white font-bold">
                                            {job.company.slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <Link
                                            to={`/jobs/${job.id}`}
                                            className="font-semibold text-slate-800 hover:text-emerald-600 transition-colors mb-1 block"
                                        >
                                            {job.title}
                                        </Link>
                                        <p className="text-sm text-slate-500 mb-2">{job.company}</p>
                                        <div className="flex flex-wrap items-center gap-3 text-sm">
                                            <span className="flex items-center gap-1 text-slate-500">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                {job.location}
                                            </span>
                                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                                                {job.jobType}
                                            </span>
                                            <span className="text-emerald-600 font-medium">{job.salary}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400">
                                        Đã lưu {formatDate(job.savedAt)}
                                    </span>
                                    <Link
                                        to={`/jobs/${job.id}`}
                                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                                    >
                                        Ứng tuyển
                                    </Link>
                                    <button
                                        onClick={() => handleRemoveJob(job.id)}
                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Bỏ lưu"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Chưa có việc làm đã lưu</h3>
                    <p className="text-slate-500 mb-6">Lưu các việc làm yêu thích để xem lại sau</p>
                    <Link
                        to="/jobs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Tìm việc ngay
                    </Link>
                </div>
            )}
        </div>
    );
}
