import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Home, TrendingUp } from 'lucide-react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen">
            {/* Left Panel - Dark Branded */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] relative overflow-hidden bg-stone-950 flex-col justify-between p-10">
                {/* Ambient Gradients */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-80 h-80 bg-amber-500/[0.06] rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-emerald-500/[0.04] rounded-full blur-[100px]" />
                    <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-500/[0.03] rounded-full blur-[80px]" />
                </div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                    <div
                        className="h-full w-full"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
                            backgroundSize: '32px 32px',
                        }}
                    />
                </div>

                {/* Top - Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10"
                >
                    <Link href="/" className="inline-flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-600/20">
                            <Briefcase className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            TuyenDung
                        </span>
                    </Link>
                </motion.div>

                {/* Center - Tagline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="relative z-10 space-y-6"
                >
                    <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                        Nền tảng{' '}
                        <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                            tuyển dụng
                        </span>
                        {' & '}
                        <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                            phòng trọ
                        </span>
                    </h1>
                    <p className="text-stone-400 text-base leading-relaxed max-w-sm">
                        Kết nối ứng viên với nhà tuyển dụng, giúp bạn tìm phòng trọ giá tốt. Nhanh chóng và hoàn toàn miễn phí.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-stone-300">
                            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                            <span>Việc làm chất lượng</span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-stone-300">
                            <Home className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Phòng trọ giá tốt</span>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom - Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="relative z-10"
                >
                    <p className="text-xs text-stone-600">
                        &copy; {new Date().getFullYear()} TuyenDung. Tất cả quyền được bảo lưu.
                    </p>
                </motion.div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex flex-1 flex-col">
                {/* Mobile Header */}
                <div className="lg:hidden bg-stone-950 px-6 py-6">
                    <Link href="/" className="inline-flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-600/20">
                            <Briefcase className="h-4.5 w-4.5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">
                            TuyenDung
                        </span>
                    </Link>
                </div>

                {/* Form Area */}
                <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 bg-background">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="w-full max-w-[420px]"
                    >
                        {children}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
