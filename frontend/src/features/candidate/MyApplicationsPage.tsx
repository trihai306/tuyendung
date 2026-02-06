import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Application {
    id: number;
    jobTitle: string;
    company: string;
    location: string;
    appliedAt: string;
    status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
    salary: string;
}

const mockApplications: Application[] = [
    {
        id: 1,
        jobTitle: 'Nhân viên kho Shopee',
        company: 'Shopee Việt Nam',
        location: 'KCN Tân Bình',
        appliedAt: '2026-02-04',
        status: 'reviewing',
        salary: '5 - 7 triệu',
    },
    {
        id: 2,
        jobTitle: 'PG activation siêu thị',
        company: 'Công ty TNHH ABC',
        location: 'Quận 7, TP.HCM',
        appliedAt: '2026-02-01',
        status: 'interview',
        salary: '200.000 - 350.000/ngày',
    },
    {
        id: 3,
        jobTitle: 'Shipper Grab',
        company: 'Grab Việt Nam',
        location: 'TP.HCM',
        appliedAt: '2026-01-28',
        status: 'pending',
        salary: '300.000 - 500.000/ngày',
    },
];

const statusConfig = {
    pending: { label: 'Đang chờ', color: 'bg-slate-100 text-slate-600' },
    reviewing: { label: 'Đang xem xét', color: 'bg-amber-50 text-amber-600' },
    interview: { label: 'Được mời phỏng vấn', color: 'bg-blue-50 text-blue-600' },
    rejected: { label: 'Không phù hợp', color: 'bg-rose-50 text-rose-600' },
    accepted: { label: 'Được nhận', color: 'bg-emerald-50 text-emerald-600' },
};

export function MyApplicationsPage() {
    const [filter, setFilter] = useState<'all' | Application['status']>('all');

    const filteredApplications = filter === 'all'
        ? mockApplications
        : mockApplications.filter(app => app.status === filter);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Đơn ứng tuyển của tôi</h1>
                <p className="text-slate-500">Theo dõi trạng thái các đơn ứng tuyển của bạn</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {[
                    { value: 'all', label: 'Tất cả' },
                    { value: 'pending', label: 'Đang chờ' },
                    { value: 'reviewing', label: 'Đang xem xét' },
                    { value: 'interview', label: 'Phỏng vấn' },
                    { value: 'accepted', label: 'Được nhận' },
                    { value: 'rejected', label: 'Từ chối' },
                ].map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value as typeof filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab.value
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Applications List */}
            {filteredApplications.length > 0 ? (
                <div className="space-y-4">
                    {filteredApplications.map((app) => (
                        <div
                            key={app.id}
                            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-white font-bold">
                                            {app.company.slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 mb-1">{app.jobTitle}</h3>
                                        <p className="text-sm text-slate-500 mb-2">{app.company}</p>
                                        <div className="flex flex-wrap items-center gap-3 text-sm">
                                            <span className="flex items-center gap-1 text-slate-500">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                {app.location}
                                            </span>
                                            <span className="text-emerald-600 font-medium">{app.salary}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig[app.status].color}`}>
                                        {statusConfig[app.status].label}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        Ứng tuyển {formatDate(app.appliedAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Chưa có đơn ứng tuyển</h3>
                    <p className="text-slate-500 mb-6">Bắt đầu tìm kiếm và ứng tuyển công việc phù hợp</p>
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
