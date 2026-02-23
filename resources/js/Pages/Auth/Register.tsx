import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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
            <Head title="Đăng ký" />

            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    custom={0}
                    className="space-y-2"
                >
                    <h2 className="text-2xl font-bold tracking-tight">Tao tai khoan</h2>
                    <p className="text-sm text-muted-foreground">
                        Dien thong tin ben duoi de bat dau su dung
                    </p>
                </motion.div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Name */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={1}
                        className="space-y-2"
                    >
                        <Label htmlFor="name">Họ và tên</Label>
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
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </motion.div>

                    {/* Email */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={2}
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
                                className="pl-10 h-11"
                                onChange={(e) => setData('email', e.target.value)}
                                required
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
                        custom={3}
                        className="space-y-2"
                    >
                        <Label htmlFor="password">Mật khẩu</Label>
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

                    {/* Confirm Password */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={4}
                        className="space-y-2"
                    >
                        <Label htmlFor="password_confirmation">Xác nhận mat khau</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password_confirmation"
                                type={showConfirm ? 'text' : 'password'}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                placeholder="Nhập lại mat khau"
                                autoComplete="new-password"
                                className="pl-10 pr-10 h-11"
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showConfirm ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password_confirmation && (
                            <p className="text-sm text-destructive">
                                {errors.password_confirmation}
                            </p>
                        )}
                    </motion.div>

                    {/* Submit */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={5}
                        className="pt-1"
                    >
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold shadow-md shadow-amber-600/20 transition-all"
                        >
                            {processing ? 'Đang xử lý...' : 'Đăng ký tai khoan'}
                        </Button>
                    </motion.div>

                    {/* Divider */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={6}
                        className="relative"
                    >
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-background px-3 text-muted-foreground">
                                hoac
                            </span>
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
                        Đã có tai khoan?{' '}
                        <Link
                            href={route('login')}
                            className="font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Đăng nhập
                        </Link>
                    </motion.p>
                </form>
            </div>
        </GuestLayout>
    );
}
