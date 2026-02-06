import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export function CandidateDashboard() {
    const { user } = useAppSelector((state) => state.auth);

    const quickStats = [
        { label: 'Đơn ứng tuyển', value: 5, icon: 'document', color: 'emerald' },
        { label: 'Việc đã lưu', value: 12, icon: 'heart', color: 'rose' },
        { label: 'Đang chờ phản hồi', value: 3, icon: 'clock', color: 'amber' },
        { label: 'Được mời phỏng vấn', value: 1, icon: 'calendar', color: 'blue' },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-xl shadow-emerald-500/20">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    Xin chào, {user?.name || 'Ứng viên'}! 👋
                </h1>
                <p className="text-emerald-100 mb-6">
                    Chúc bạn tìm được công việc phù hợp nhất
                </p>
                <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Tìm việc ngay
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickStats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center mb-3`}>
                            {stat.icon === 'document' && (
                                <svg className={`w-5 h-5 text-${stat.color}-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            )}
                            {stat.icon === 'heart' && (
                                <svg className={`w-5 h-5 text-${stat.color}-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            )}
                            {stat.icon === 'clock' && (
                                <svg className={`w-5 h-5 text-${stat.color}-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            {stat.icon === 'calendar' && (
                                <svg className={`w-5 h-5 text-${stat.color}-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                        <p className="text-sm text-slate-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Applications */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800">Đơn ứng tuyển gần đây</h2>
                        <Link to="/candidate/applications" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                            <p className="font-medium text-slate-800 mb-1">Nhân viên kho Shopee</p>
                            <p className="text-sm text-slate-500">Đã ứng tuyển 2 ngày trước</p>
                            <span className="inline-block mt-2 px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-medium rounded-full">
                                Đang xem xét
                            </span>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                            <p className="font-medium text-slate-800 mb-1">PG activation siêu thị</p>
                            <p className="text-sm text-slate-500">Đã ứng tuyển 5 ngày trước</p>
                            <span className="inline-block mt-2 px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                                Được mời phỏng vấn
                            </span>
                        </div>
                    </div>
                </div>

                {/* Profile Completion */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Hoàn thiện hồ sơ</h2>
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">Tiến độ hoàn thiện</span>
                            <span className="text-sm font-semibold text-emerald-600">60%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: '60%' }} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-slate-600">Thông tin cơ bản</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-slate-600">Thông tin liên hệ</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-slate-400">Kinh nghiệm làm việc</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-slate-400">CV / Hồ sơ</span>
                        </div>
                    </div>
                    <Link
                        to="/candidate/profile"
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                        Cập nhật hồ sơ
                    </Link>
                </div>
            </div>
        </div>
    );
}
