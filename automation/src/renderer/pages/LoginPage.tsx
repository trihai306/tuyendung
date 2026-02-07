import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await login(email, password);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <div className="min-h-screen flex bg-[var(--bg-void)]">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl" />
            </div>

            {/* Left Panel - Branding (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900">
                    {/* Pattern overlay */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }} />

                    {/* Gradient orbs */}
                    <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-10 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl" />
                </div>

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Antigravity Auto</span>
                    </div>

                    {/* Center content */}
                    <div className="flex-1 flex flex-col justify-center py-12">
                        {/* Floating cards illustration */}
                        <div className="relative mb-12">
                            <div className="flex gap-4 justify-center">
                                {/* Card 1 */}
                                <div className="w-40 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                                    <div className="w-10 h-10 bg-emerald-400/30 rounded-lg mb-3 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="text-white/90 text-sm font-medium">Multi-Profile</div>
                                    <div className="text-white/60 text-xs">Browser Automation</div>
                                </div>

                                {/* Card 2 */}
                                <div className="w-40 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-500 mt-8">
                                    <div className="w-10 h-10 bg-teal-400/30 rounded-lg mb-3 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div className="text-white/90 text-sm font-medium">Stealth Mode</div>
                                    <div className="text-white/60 text-xs">Anti-Detection</div>
                                </div>

                                {/* Card 3 */}
                                <div className="w-40 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <div className="w-10 h-10 bg-cyan-400/30 rounded-lg mb-3 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="text-white/90 text-sm font-medium">Live View</div>
                                    <div className="text-white/60 text-xs">Real-time CDP</div>
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold text-white mb-4 text-center">
                            Automate with Confidence
                        </h1>
                        <p className="text-lg text-white/70 text-center max-w-md mx-auto">
                            Professional browser automation with stealth technology and real-time monitoring.
                        </p>
                    </div>

                    <div className="text-white/50 text-sm">
                        Powered by Viecly
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
                <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-[var(--text-primary)]">Antigravity Auto</span>
                    </div>

                    {/* Glass card */}
                    <div className="bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-2xl border border-[var(--border-default)]">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">Đăng nhập</h2>
                            <p className="text-[var(--text-muted)]">Sử dụng tài khoản Viecly</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-6 p-4 bg-[var(--accent-danger-dim)] border border-[rgba(239,68,68,0.2)] rounded-xl flex items-center gap-3">
                                <div className="w-10 h-10 bg-[rgba(239,68,68,0.15)] rounded-lg flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-[var(--accent-danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-[#f87171] text-sm">{error}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="form-label">Email</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-ghost)] group-focus-within:text-[var(--accent-primary)] transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-ghost)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary-dim)] transition-all"
                                        placeholder="you@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="form-label">Mật khẩu</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-ghost)] group-focus-within:text-[var(--accent-primary)] transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-ghost)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary-dim)] transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-ghost)] hover:text-[var(--text-secondary)] transition-colors"
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
                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="spinner" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        Đăng nhập
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] text-center">
                            <p className="text-[var(--text-ghost)] text-sm">
                                Sử dụng tài khoản Viecly để đăng nhập
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-[var(--text-ghost)] text-sm mt-6">
                        © 2026 Antigravity Auto. Powered by Viecly.
                    </p>
                </div>
            </div>
        </div>
    );
}
