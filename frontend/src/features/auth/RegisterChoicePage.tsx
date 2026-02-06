import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '../../contexts/ThemeContext';

export function RegisterChoicePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 p-4">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 dark:from-purple-600/5 dark:to-pink-600/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-cyan-400/20 dark:from-emerald-600/10 dark:to-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>

            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                <ThemeToggle className="bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700" />
            </div>

            <div className={`w-full max-w-4xl relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <span className="text-white font-bold text-lg">VL</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">Viecly</span>
                </div>

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-3">
                        Bạn muốn đăng ký để làm gì?
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        Chọn loại tài khoản phù hợp với bạn
                    </p>
                </div>

                {/* Choice Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Employer Card */}
                    <Link
                        to="/register/employer"
                        className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-white dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:scale-[1.02] hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20"
                    >
                        <div className="flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                Tôi là Nhà tuyển dụng
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                Đăng tin tuyển dụng, quản lý ứng viên và xây dựng đội ngũ
                            </p>

                            {/* Features */}
                            <div className="space-y-2 text-left w-full mb-6">
                                {[
                                    'Đăng tin tuyển dụng không giới hạn',
                                    'Quản lý ứng viên với pipeline',
                                    'Tích hợp Zalo, Facebook',
                                    'Mời thành viên vào đội',
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl text-center group-hover:from-emerald-700 group-hover:to-teal-700 transition-all">
                                Đăng ký Nhà tuyển dụng
                            </div>
                        </div>
                    </Link>

                    {/* Candidate Card */}
                    <Link
                        to="/register/candidate"
                        className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-white dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:scale-[1.02] hover:shadow-blue-100 dark:hover:shadow-blue-900/20"
                    >
                        <div className="flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                Tôi là Ứng viên
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                Tìm kiếm việc làm phù hợp và ứng tuyển dễ dàng
                            </p>

                            {/* Features */}
                            <div className="space-y-2 text-left w-full mb-6">
                                {[
                                    'Xem hàng ngàn việc làm mới',
                                    'Ứng tuyển nhanh chóng',
                                    'Nhận thông báo việc làm phù hợp',
                                    'Theo dõi trạng thái ứng tuyển',
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl text-center group-hover:from-blue-700 group-hover:to-indigo-700 transition-all">
                                Đăng ký Ứng viên
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Login link */}
                <p className="mt-8 text-center text-slate-500 dark:text-slate-400">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}
