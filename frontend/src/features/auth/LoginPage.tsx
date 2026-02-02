import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function LoginPage() {
    const { login, isLoading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex">
            {/* Left Panel - Branding & Illustration */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50/50">
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />

                {/* Decorative circles */}
                <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl" />
                <div className="absolute bottom-32 right-16 w-48 h-48 bg-teal-100/40 rounded-full blur-2xl" />
                <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-emerald-200/30 rounded-full blur-xl" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 py-12">
                    {/* Logo */}
                    <div className="mb-16">
                        <div className="inline-flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-slate-800 tracking-tight">
                                Recruit<span className="text-emerald-600">AI</span>
                            </span>
                        </div>
                    </div>

                    {/* Illustration - Abstract connected people */}
                    <div className="mb-12 flex justify-center">
                        <svg className="w-80 h-64" viewBox="0 0 400 300" fill="none">
                            {/* Connection lines */}
                            <path d="M100 150 Q200 80 300 150" stroke="url(#line-gradient)" strokeWidth="2" fill="none" opacity="0.3" />
                            <path d="M120 200 Q200 130 280 200" stroke="url(#line-gradient)" strokeWidth="2" fill="none" opacity="0.2" />
                            <path d="M150 100 Q200 160 250 100" stroke="url(#line-gradient)" strokeWidth="2" fill="none" opacity="0.25" />

                            {/* Person 1 - Left */}
                            <circle cx="100" cy="130" r="25" fill="url(#person-gradient-1)" />
                            <circle cx="100" cy="105" r="15" fill="url(#person-gradient-1)" />

                            {/* Person 2 - Center */}
                            <circle cx="200" cy="110" r="30" fill="url(#person-gradient-2)" />
                            <circle cx="200" cy="80" r="18" fill="url(#person-gradient-2)" />

                            {/* Person 3 - Right */}
                            <circle cx="300" cy="130" r="25" fill="url(#person-gradient-1)" />
                            <circle cx="300" cy="105" r="15" fill="url(#person-gradient-1)" />

                            {/* Small dots */}
                            <circle cx="150" cy="180" r="8" fill="#10b981" opacity="0.4" />
                            <circle cx="250" cy="180" r="8" fill="#14b8a6" opacity="0.4" />
                            <circle cx="130" cy="220" r="6" fill="#34d399" opacity="0.3" />
                            <circle cx="270" cy="220" r="6" fill="#2dd4bf" opacity="0.3" />
                            <circle cx="200" cy="200" r="10" fill="#10b981" opacity="0.5" />

                            {/* Neural network nodes */}
                            <circle cx="80" cy="200" r="4" fill="#6ee7b7" />
                            <circle cx="120" cy="170" r="3" fill="#a7f3d0" />
                            <circle cx="280" cy="170" r="3" fill="#a7f3d0" />
                            <circle cx="320" cy="200" r="4" fill="#6ee7b7" />

                            <defs>
                                <linearGradient id="person-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                                <linearGradient id="person-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#14b8a6" />
                                    <stop offset="100%" stopColor="#0d9488" />
                                </linearGradient>
                                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#14b8a6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Tagline */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-slate-800 mb-3">
                            Tuyển dụng thông minh
                        </h1>
                        <p className="text-lg text-slate-500 max-w-md">
                            Nền tảng AI quản lý ứng viên, tự động hóa quy trình tuyển dụng của doanh nghiệp.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="mt-12 flex gap-12">
                        <div>
                            <div className="text-3xl font-bold text-emerald-600">10K+</div>
                            <div className="text-sm text-slate-400">Doanh nghiệp</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-emerald-600">500K+</div>
                            <div className="text-sm text-slate-400">Ứng viên</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-emerald-600">99%</div>
                            <div className="text-sm text-slate-400">Hài lòng</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className={`w-full max-w-md transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-slate-800">Recruit<span className="text-emerald-600">AI</span></span>
                    </div>

                    {/* Form Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Đăng nhập</h2>
                        <p className="text-slate-500">Nhập thông tin để truy cập tài khoản của bạn</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-red-600 text-sm">{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email công việc</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    placeholder="you@company.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                                <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                                    Quên mật khẩu?
                                </a>
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Đang xử lý...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-gradient-to-br from-slate-50 to-white text-slate-400 text-sm">hoặc</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                            </svg>
                            Facebook
                        </button>
                    </div>

                    {/* Sign up */}
                    <p className="mt-8 text-center text-slate-500">
                        Chưa có tài khoản?{' '}
                        <a href="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                            Đăng ký miễn phí
                        </a>
                    </p>

                    {/* Footer */}
                    <p className="mt-8 text-center text-slate-400 text-xs">
                        Bằng việc đăng nhập, bạn đồng ý với{' '}
                        <a href="#" className="text-slate-500 hover:text-emerald-600">Điều khoản</a>
                        {' '}và{' '}
                        <a href="#" className="text-slate-500 hover:text-emerald-600">Chính sách bảo mật</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
