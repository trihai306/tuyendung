import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { motion } from 'framer-motion';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
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
            <Head title="Quên mật khẩu" />

            <div className="space-y-6">
                {/* Icon + Header */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    custom={0}
                    className="space-y-4"
                >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                        <KeyRound className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Quên mật khẩu?</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Nhập địa chỉ email của bạn, chúng tôi sẽ gửi cho bạn liên kết
                            de dat lai mật khẩu.
                        </p>
                    </div>
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
                        <Label htmlFor="email">Địa chỉ email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder="name@example.com"
                                autoFocus
                                className="pl-10 h-11"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                    </motion.div>

                    {/* Submit */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={2}
                    >
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold shadow-md shadow-amber-600/20 transition-all"
                        >
                            {processing ? 'Dang gui...' : 'Gửi lien ket dat lai'}
                        </Button>
                    </motion.div>

                    {/* Back to Login */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        custom={3}
                        className="text-center"
                    >
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại đăng nhập
                        </Link>
                    </motion.div>
                </form>
            </div>
        </GuestLayout>
    );
}
