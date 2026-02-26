import { useState, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, Bot, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPageProps {
    onLogin: (email: string, password: string) => void;
    onGoRegister: () => void;
    error?: string;
}

export default function LoginPage({ onLogin, onGoRegister, error }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onLogin(email, password);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/[0.07] blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/[0.05] blur-[100px]" />
                <div className="absolute top-0 right-1/3 w-[300px] h-[300px] rounded-full bg-purple-600/[0.04] blur-[80px]" />
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <div className="text-center mb-10 animate-fadeIn">
                    <div className="inline-flex items-center justify-center mb-5 relative">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand shadow-xl shadow-indigo-600/30">
                            <Bot className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 border-2 border-[#0a0a0f]">
                            <Sparkles className="h-2.5 w-2.5 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">AutoApp</h1>
                    <p className="text-sm text-gray-500 mt-1.5">Browser Automation Platform</p>
                </div>

                {/* Card */}
                <div className="glass-card p-8 animate-scaleIn" style={{ animationDelay: '100ms' }}>
                    {/* Header */}
                    <div className="mb-7">
                        <h2 className="text-xl font-bold tracking-tight text-white">Dang nhap</h2>
                        <p className="text-sm text-gray-500 mt-1">Nhap thong tin tai khoan de tiep tuc</p>
                    </div>

                    {/* Status message */}
                    {error && (
                        <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-fadeIn">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="animate-fadeIn" style={{ animationDelay: '150ms' }}>
                            <label className="text-[11px] font-medium text-gray-500 mb-2 block uppercase tracking-wider">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="name@example.com" autoFocus required
                                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600/80 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Mat khau</label>
                                <button type="button" className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Quen mat khau?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="Nhap mat khau" required
                                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-11 py-3 text-sm text-white placeholder:text-gray-600/80 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember */}
                        <div className="flex items-center gap-2.5 animate-fadeIn" style={{ animationDelay: '250ms' }}>
                            <input type="checkbox" id="remember"
                                className="h-4 w-4 rounded-md border-white/20 bg-white/[0.04] text-indigo-500 focus:ring-indigo-500/20 cursor-pointer" />
                            <label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer">Ghi nho dang nhap</label>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl gradient-brand py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 animate-fadeIn"
                            style={{ animationDelay: '300ms' }}>
                            {isLoading ? 'Dang xu ly...' : 'Dang nhap'}
                            {!isLoading && <ArrowRight className="h-4 w-4" />}
                        </button>

                        {/* Divider */}
                        <div className="relative animate-fadeIn" style={{ animationDelay: '350ms' }}>
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.06]" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-[#0d0d14] px-3 text-gray-600">hoac</span>
                            </div>
                        </div>

                        {/* Register */}
                        <p className="text-center text-sm text-gray-500 animate-fadeIn" style={{ animationDelay: '400ms' }}>
                            Chua co tai khoan?{' '}
                            <button type="button" onClick={onGoRegister}
                                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                                Dang ky ngay
                            </button>
                        </p>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-gray-700 mt-6 animate-fadeIn" style={{ animationDelay: '500ms' }}>
                    Playwright + Electron v1.0.0
                </p>
            </div>
        </div>
    );
}
