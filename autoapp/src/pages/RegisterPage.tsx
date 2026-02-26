import { useState, FormEvent } from 'react';
import {
    User, Mail, Lock, Eye, EyeOff, Bot, ArrowRight, ArrowLeft,
    Shield, Zap, Check, Sparkles, Globe,
} from 'lucide-react';

type PlanType = 'personal' | 'team' | null;

interface RegisterPageProps {
    onRegister: (data: { name: string; email: string; password: string; plan: string }) => void;
    onGoLogin: () => void;
    error?: string;
}

export default function RegisterPage({ onRegister, onGoLogin, error }: RegisterPageProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) return;
        setIsLoading(true);
        await onRegister({ name, email, password, plan: selectedPlan || 'personal' });
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/[0.07] blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/[0.05] blur-[100px]" />
                <div className="absolute top-0 right-1/3 w-[300px] h-[300px] rounded-full bg-purple-600/[0.04] blur-[80px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <div className="text-center mb-8 animate-fadeIn">
                    <div className="inline-flex items-center justify-center mb-4 relative">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand shadow-xl shadow-indigo-600/30">
                            <Bot className="h-7 w-7 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 border-2 border-[#0a0a0f]">
                            <Sparkles className="h-2.5 w-2.5 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">AutoApp</h1>
                </div>

                {/* Card */}
                <div className="glass-card p-8 animate-scaleIn" style={{ animationDelay: '100ms' }}>
                    {/* Step 1: Plan Selection */}
                    {step === 1 && (
                        <>
                            <div className="mb-6 animate-fadeIn">
                                <h2 className="text-xl font-bold tracking-tight text-white">Chon goi su dung</h2>
                                <p className="text-sm text-gray-500 mt-1">Chon goi phu hop voi nhu cau cua ban</p>
                            </div>

                            <div className="space-y-3 mb-6">
                                {/* Personal plan */}
                                <button type="button" onClick={() => setSelectedPlan('personal')}
                                    className={`w-full group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300 animate-fadeIn ${selectedPlan === 'personal'
                                            ? 'border-indigo-500/60 bg-indigo-500/[0.08] shadow-lg shadow-indigo-500/10'
                                            : 'border-white/[0.06] bg-white/[0.02] hover:border-indigo-500/20 hover:bg-indigo-500/[0.03]'
                                        }`} style={{ animationDelay: '150ms' }}>
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full" />
                                    <div className="relative flex items-center gap-4">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${selectedPlan === 'personal'
                                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                                                : 'bg-indigo-500/10 text-indigo-400'
                                            }`}>
                                            <Zap className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[14px] font-bold text-white">Ca nhan</h3>
                                            <p className="text-[11px] text-gray-500 mt-0.5">Quan ly profile, automation co ban</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-medium"><Globe className="h-3 w-3" /> 10 profiles</span>
                                                <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-medium"><Zap className="h-3 w-3" /> Automation</span>
                                            </div>
                                        </div>
                                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${selectedPlan === 'personal'
                                                ? 'border-indigo-500 bg-indigo-500 text-white'
                                                : 'border-white/20'
                                            }`}>
                                            {selectedPlan === 'personal' && <Check className="h-3.5 w-3.5" />}
                                        </div>
                                    </div>
                                </button>

                                {/* Team plan */}
                                <button type="button" onClick={() => setSelectedPlan('team')}
                                    className={`w-full group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300 animate-fadeIn ${selectedPlan === 'team'
                                            ? 'border-violet-500/60 bg-violet-500/[0.08] shadow-lg shadow-violet-500/10'
                                            : 'border-white/[0.06] bg-white/[0.02] hover:border-violet-500/20 hover:bg-violet-500/[0.03]'
                                        }`} style={{ animationDelay: '200ms' }}>
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-bl-full" />
                                    <div className="relative flex items-center gap-4">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${selectedPlan === 'team'
                                                ? 'bg-violet-500 text-white shadow-md shadow-violet-500/25'
                                                : 'bg-violet-500/10 text-violet-400'
                                            }`}>
                                            <Shield className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[14px] font-bold text-white">Team</h3>
                                            <p className="text-[11px] text-gray-500 mt-0.5">Quan ly nhom, proxy, anti-detection nang cao</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="flex items-center gap-1 text-[10px] text-violet-400 font-medium"><Globe className="h-3 w-3" /> Unlimited</span>
                                                <span className="flex items-center gap-1 text-[10px] text-violet-400 font-medium"><Shield className="h-3 w-3" /> Anti-detect</span>
                                            </div>
                                        </div>
                                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${selectedPlan === 'team'
                                                ? 'border-violet-500 bg-violet-500 text-white'
                                                : 'border-white/20'
                                            }`}>
                                            {selectedPlan === 'team' && <Check className="h-3.5 w-3.5" />}
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Continue */}
                            <button type="button" onClick={() => selectedPlan && setStep(2)} disabled={!selectedPlan}
                                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 disabled:opacity-40 animate-fadeIn ${selectedPlan === 'team'
                                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 shadow-violet-600/25 hover:shadow-violet-600/40'
                                        : 'gradient-brand shadow-indigo-600/25 hover:shadow-indigo-600/40'
                                    }`} style={{ animationDelay: '250ms' }}>
                                Tiep tuc <ArrowRight className="h-4 w-4" />
                            </button>

                            <p className="text-center text-sm text-gray-500 mt-5 animate-fadeIn" style={{ animationDelay: '300ms' }}>
                                Da co tai khoan?{' '}
                                <button type="button" onClick={onGoLogin} className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Dang nhap
                                </button>
                            </p>
                        </>
                    )}

                    {/* Step 2: Registration Form */}
                    {step === 2 && (
                        <>
                            <div className="mb-6 animate-fadeIn">
                                <button type="button" onClick={() => setStep(1)}
                                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-3">
                                    <ArrowLeft className="h-3.5 w-3.5" /> Quay lai
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${selectedPlan === 'team' ? 'bg-violet-500' : 'bg-indigo-500'
                                        }`}>
                                        {selectedPlan === 'team' ? <Shield className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            {selectedPlan === 'team' ? 'Dang ky Team' : 'Dang ky Ca nhan'}
                                        </h2>
                                        <p className="text-[11px] text-gray-500">Tao tai khoan moi</p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-fadeIn">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div className="animate-fadeIn" style={{ animationDelay: '100ms' }}>
                                    <label className="text-[11px] font-medium text-gray-500 mb-2 block uppercase tracking-wider">Ho va ten</label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nguyen Van A" autoFocus required
                                            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600/80 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="animate-fadeIn" style={{ animationDelay: '150ms' }}>
                                    <label className="text-[11px] font-medium text-gray-500 mb-2 block uppercase tracking-wider">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required
                                            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600/80 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
                                    <label className="text-[11px] font-medium text-gray-500 mb-2 block uppercase tracking-wider">Mat khau</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Toi thieu 8 ky tu" required
                                            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-11 py-3 text-sm text-white placeholder:text-gray-600/80 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="animate-fadeIn" style={{ animationDelay: '250ms' }}>
                                    <label className="text-[11px] font-medium text-gray-500 mb-2 block uppercase tracking-wider">Xac nhan mat khau</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                        <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhap lai mat khau" required
                                            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-11 py-3 text-sm text-white placeholder:text-gray-600/80 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {password && confirmPassword && password !== confirmPassword && (
                                        <p className="text-[11px] text-red-400 mt-1.5">Mat khau khong khop</p>
                                    )}
                                </div>

                                {/* Submit */}
                                <button type="submit" disabled={isLoading || !password || password !== confirmPassword}
                                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 disabled:opacity-40 animate-fadeIn ${selectedPlan === 'team'
                                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 shadow-violet-600/25 hover:shadow-violet-600/40'
                                            : 'gradient-brand shadow-indigo-600/25 hover:shadow-indigo-600/40'
                                        }`} style={{ animationDelay: '300ms' }}>
                                    {isLoading ? 'Dang xu ly...' : 'Tao tai khoan'}
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

                                <p className="text-center text-sm text-gray-500 animate-fadeIn" style={{ animationDelay: '400ms' }}>
                                    Da co tai khoan?{' '}
                                    <button type="button" onClick={onGoLogin} className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Dang nhap
                                    </button>
                                </p>
                            </form>
                        </>
                    )}
                </div>

                <p className="text-center text-[11px] text-gray-700 mt-6 animate-fadeIn" style={{ animationDelay: '500ms' }}>
                    Playwright + Electron v1.0.0
                </p>
            </div>
        </div>
    );
}
