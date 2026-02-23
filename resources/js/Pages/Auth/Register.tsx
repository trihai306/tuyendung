import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Building2, Search, ArrowRight, ArrowLeft, Check } from 'lucide-react';

type AccountType = 'employer' | 'candidate' | null;

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        account_type: '' as string,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedType, setSelectedType] = useState<AccountType>(null);

    const handleSelectType = (type: AccountType) => {
        setSelectedType(type);
        setData('account_type', type || '');
    };

    const goToStep2 = () => {
        if (selectedType) {
            setStep(2);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const stagger = {
        hidden: { opacity: 0, y: 12 },
        show: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, delay: i * 0.08 },
        }),
    };

    return (
        <GuestLayout>
            <Head title="Dang ky" />

            <div className="space-y-6">
                {/* Step 1: Role Selection */}
                {step === 1 && (
                    <>
                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            animate="show"
                            custom={0}
                            className="space-y-2"
                        >
                            <h2 className="text-2xl font-bold tracking-tight">Ban la ai?</h2>
                            <p className="text-sm text-muted-foreground">
                                Chon loai tai khoan phu hop voi ban
                            </p>
                        </motion.div>

                        <div className="space-y-3">
                            {/* Employer Card */}
                            <motion.button
                                type="button"
                                variants={stagger}
                                initial="hidden"
                                animate="show"
                                custom={1}
                                onClick={() => handleSelectType('employer')}
                                className={`w-full group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-300 ${selectedType === 'employer'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-lg shadow-blue-500/10'
                                        : 'border-border/50 bg-card hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-blue-500/5'
                                    }`}
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full" />
                                <div className="relative flex items-center gap-4">
                                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-all ${selectedType === 'employer'
                                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                                            : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        <Building2 className="h-7 w-7" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[15px] font-bold">Nha tuyen dung</h3>
                                        <p className="text-[12px] text-muted-foreground mt-0.5">
                                            Dang tin tuyen dung, quan ly ung vien, to chuc phong van
                                        </p>
                                    </div>
                                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${selectedType === 'employer'
                                            ? 'border-blue-500 bg-blue-500 text-white'
                                            : 'border-border'
                                        }`}>
                                        {selectedType === 'employer' && <Check className="h-3.5 w-3.5" />}
                                    </div>
                                </div>
                            </motion.button>

                            {/* Candidate Card */}
                            <motion.button
                                type="button"
                                variants={stagger}
                                initial="hidden"
                                animate="show"
                                custom={2}
                                onClick={() => handleSelectType('candidate')}
                                className={`w-full group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-300 ${selectedType === 'candidate'
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                                        : 'border-border/50 bg-card hover:border-emerald-500/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5'
                                    }`}
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full" />
                                <div className="relative flex items-center gap-4">
                                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-all ${selectedType === 'candidate'
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                                            : 'bg-emerald-500/10 text-emerald-500'
                                        }`}>
                                        <Search className="h-7 w-7" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[15px] font-bold">Nguoi tim viec</h3>
                                        <p className="text-[12px] text-muted-foreground mt-0.5">
                                            Tim viec lam, ung tuyen, quan ly ho so ca nhan
                                        </p>
                                    </div>
                                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${selectedType === 'candidate'
                                            ? 'border-emerald-500 bg-emerald-500 text-white'
                                            : 'border-border'
                                        }`}>
                                        {selectedType === 'candidate' && <Check className="h-3.5 w-3.5" />}
                                    </div>
                                </div>
                            </motion.button>
                        </div>

                        {/* Continue Button */}
                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            animate="show"
                            custom={3}
                            className="pt-1"
                        >
                            <Button
                                type="button"
                                onClick={goToStep2}
                                disabled={!selectedType}
                                className={`w-full h-11 font-semibold shadow-md transition-all ${selectedType === 'employer'
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-600/20'
                                        : selectedType === 'candidate'
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-600/20'
                                            : 'bg-muted text-muted-foreground'
                                    } text-white`}
                            >
                                Tiep tuc
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </motion.div>

                        {/* Login Link */}
                        <motion.p
                            variants={stagger}
                            initial="hidden"
                            animate="show"
                            custom={4}
                            className="text-center text-sm text-muted-foreground"
                        >
                            Da co tai khoan?{' '}
                            <Link
                                href={route('login')}
                                className="font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                Dang nhap
                            </Link>
                        </motion.p>
                    </>
                )}

                {/* Step 2: Registration Form */}
                {step === 2 && (
                    <>
                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            animate="show"
                            custom={0}
                            className="space-y-2"
                        >
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Quay lai
                            </button>
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${selectedType === 'employer'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-emerald-500 text-white'
                                    }`}>
                                    {selectedType === 'employer' ? (
                                        <Building2 className="h-5 w-5" />
                                    ) : (
                                        <Search className="h-5 w-5" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">
                                        {selectedType === 'employer' ? 'Dang ky nha tuyen dung' : 'Dang ky nguoi tim viec'}
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedType === 'employer'
                                            ? 'Tao tai khoan de dang tin va quan ly tuyen dung'
                                            : 'Tao tai khoan de tim viec va ung tuyen'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Name */}
                            <motion.div variants={stagger} initial="hidden" animate="show" custom={1} className="space-y-2">
                                <Label htmlFor="name">Ho va ten</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        placeholder="Nguyen Van A"
                                        autoComplete="name"
                                        autoFocus
                                        className="pl-10 h-11"
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </motion.div>

                            {/* Email */}
                            <motion.div variants={stagger} initial="hidden" animate="show" custom={2} className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        placeholder="name@example.com"
                                        autoComplete="username"
                                        className="pl-10 h-11"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </motion.div>

                            {/* Password */}
                            <motion.div variants={stagger} initial="hidden" animate="show" custom={3} className="space-y-2">
                                <Label htmlFor="password">Mat khau</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        placeholder="Toi thieu 8 ky tu"
                                        autoComplete="new-password"
                                        className="pl-10 pr-10 h-11"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </motion.div>

                            {/* Confirm Password */}
                            <motion.div variants={stagger} initial="hidden" animate="show" custom={4} className="space-y-2">
                                <Label htmlFor="password_confirmation">Xac nhan mat khau</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        placeholder="Nhap lai mat khau"
                                        autoComplete="new-password"
                                        className="pl-10 pr-10 h-11"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                                )}
                            </motion.div>

                            {/* Submit */}
                            <motion.div variants={stagger} initial="hidden" animate="show" custom={5} className="pt-1">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full h-11 font-semibold shadow-md transition-all text-white ${selectedType === 'employer'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-600/20'
                                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-600/20'
                                        }`}
                                >
                                    {processing ? 'Dang xu ly...' : 'Tao tai khoan'}
                                </Button>
                            </motion.div>

                            {/* Divider */}
                            <motion.div variants={stagger} initial="hidden" animate="show" custom={6} className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-background px-3 text-muted-foreground">hoac</span>
                                </div>
                            </motion.div>

                            {/* Login Link */}
                            <motion.p
                                variants={stagger}
                                initial="hidden"
                                animate="show"
                                custom={7}
                                className="text-center text-sm text-muted-foreground"
                            >
                                Da co tai khoan?{' '}
                                <Link
                                    href={route('login')}
                                    className="font-semibold text-primary hover:text-primary/80 transition-colors"
                                >
                                    Dang nhap
                                </Link>
                            </motion.p>
                        </form>
                    </>
                )}
            </div>
        </GuestLayout>
    );
}
