import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function RegisterPage() {
    const { register, isLoading, error } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        company: '',
        companyIndustry: '',
        companyPhone: '',
        agreeTerms: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (formData.password !== formData.confirmPassword) {
            setFormError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (!formData.agreeTerms) {
            setFormError('Vui lòng đồng ý với điều khoản sử dụng');
            return;
        }

        await register(
            formData.name,
            formData.email,
            formData.password,
            formData.confirmPassword,
            formData.company,
            formData.companyIndustry || undefined,
            formData.companyPhone || undefined
        );
    };

    const displayError = formError || error;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50/50">
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />

                {/* Decorative circles */}
                <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl" />
                <div className="absolute bottom-32 right-16 w-48 h-48 bg-teal-100/40 rounded-full blur-2xl" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 py-12">
                    {/* Logo */}
                    <div className="mb-12">
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

                    {/* Illustration */}
                    <div className="mb-10">
                        <svg className="w-72 h-56" viewBox="0 0 350 250" fill="none">
                            {/* Rocket/Growth illustration */}
                            <circle cx="175" cy="125" r="80" fill="url(#reg-gradient-1)" opacity="0.1" />
                            <circle cx="175" cy="125" r="60" fill="url(#reg-gradient-1)" opacity="0.15" />

                            {/* Rocket body */}
                            <path d="M175 60 L195 120 L175 180 L155 120 Z" fill="url(#reg-gradient-2)" />
                            <circle cx="175" cy="110" r="15" fill="white" opacity="0.9" />
                            <circle cx="175" cy="110" r="8" fill="#10b981" />

                            {/* Flames */}
                            <path d="M165 180 Q175 210 185 180" fill="#fbbf24" opacity="0.8" />
                            <path d="M168 180 Q175 200 182 180" fill="#f59e0b" opacity="0.9" />

                            {/* Stars */}
                            <circle cx="100" cy="80" r="3" fill="#10b981" />
                            <circle cx="250" cy="90" r="4" fill="#14b8a6" />
                            <circle cx="120" cy="180" r="2" fill="#6ee7b7" />
                            <circle cx="230" cy="170" r="3" fill="#34d399" />
                            <circle cx="280" cy="140" r="2" fill="#a7f3d0" />

                            <defs>
                                <linearGradient id="reg-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#14b8a6" />
                                </linearGradient>
                                <linearGradient id="reg-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-800 mb-3">
                        Bắt đầu hành trình
                    </h1>
                    <p className="text-lg text-slate-500 max-w-md mb-8">
                        Tham gia cùng 10,000+ doanh nghiệp đã tin tưởng RecruitAI để tối ưu quy trình tuyển dụng.
                    </p>

                    {/* Benefits */}
                    <div className="space-y-4">
                        {[
                            'Dùng thử miễn phí 14 ngày',
                            'Không cần thẻ tín dụng',
                            'Hỗ trợ 24/7'
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-600">
                                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                <div className={`w-full max-w-md transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-slate-800">Recruit<span className="text-emerald-600">AI</span></span>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Tạo tài khoản</h2>
                        <p className="text-slate-500">Điền thông tin để bắt đầu sử dụng</p>
                    </div>

                    {displayError && (
                        <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-600 text-sm">{displayError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email công việc</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        {/* Company */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên công ty *</label>
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                placeholder="Công ty ABC"
                                required
                            />
                        </div>

                        {/* Company Industry & Phone in 2 columns */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngành nghề</label>
                                <input
                                    type="text"
                                    value={formData.companyIndustry}
                                    onChange={(e) => setFormData({ ...formData, companyIndustry: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    placeholder="Công nghệ, Bán lẻ..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={formData.companyPhone}
                                    onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    placeholder="0901234567"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 pr-12 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    placeholder="Tối thiểu 8 ký tự"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                placeholder="Nhập lại mật khẩu"
                                required
                            />
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={formData.agreeTerms}
                                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                                className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <label htmlFor="terms" className="text-sm text-slate-500">
                                Tôi đồng ý với{' '}
                                <a href="#" className="text-emerald-600 hover:underline">Điều khoản sử dụng</a>
                                {' '}và{' '}
                                <a href="#" className="text-emerald-600 hover:underline">Chính sách bảo mật</a>
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                'Tạo tài khoản'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-gradient-to-br from-slate-50 to-white text-slate-400 text-sm">hoặc</span>
                        </div>
                    </div>

                    {/* Social */}
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

                    {/* Login link */}
                    <p className="mt-6 text-center text-slate-500">
                        Đã có tài khoản?{' '}
                        <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                            Đăng nhập
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
