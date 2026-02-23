import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
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
            <Head title="Đăng nhập" />

            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    custom={0}
                    className="space-y-2"
                >
                    <h2 className="text-2xl font-bold tracking-tight">Đăng nhập</h2>
                    <p className="text-sm text-muted-foreground">
                        Nhập thông tin tài khoản để tiếp tục
                    </p>
                </motion.div>

                {status && (
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={0.5}
                        className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
                    >
                        {status}
                    </motion.div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    {/* Email */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={1}
                        className="space-y-2"
                    >
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
                                autoFocus
                                className="pl-10 h-11"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                    </motion.div>

                    {/* Password */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={2}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Mật khẩu</Label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    Quên mật khẩu?
                                </Link>
                            )}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                placeholder="Nhập mật khẩu"
                                autoComplete="current-password"
                                className="pl-10 pr-10 h-11"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password}</p>
                        )}
                    </motion.div>

                    {/* Remember */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={3}
                        className="flex items-center gap-2"
                    >
                        <input
                            id="remember"
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', (e.target.checked || false) as false)
                            }
                            className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20 transition-colors cursor-pointer"
                        />
                        <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                            Ghi nhớ đăng nhập
                        </Label>
                    </motion.div>

                    {/* Submit */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={4}
                    >
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold shadow-md shadow-amber-600/20 transition-all"
                        >
                            {processing ? 'Đang xử lý...' : 'Đăng nhập'}
                        </Button>
                    </motion.div>

                    {/* Divider */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={5}
                        className="relative"
                    >
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-background px-3 text-muted-foreground">
                                hoặc
                            </span>
                        </div>
                    </motion.div>

                    {/* Register Link */}
                    <motion.p
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={6}
                        className="text-center text-sm text-muted-foreground"
                    >
                        Chưa có tài khoản?{' '}
                        <Link
                            href={route('register')}
                            className="font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Đăng ký ngay
                        </Link>
                    </motion.p>
                </form>
            </div>
        </GuestLayout>
    );
}
