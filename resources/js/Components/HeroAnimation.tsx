import { motion } from 'framer-motion';
import { Briefcase, Home, Users, TrendingUp, MapPin, Star, Zap, Shield, CheckCircle2 } from 'lucide-react';

function FloatingParticle({ delay, duration, x, y, size }: {
    delay: number;
    duration: number;
    x: number;
    y: number;
    size: number;
}) {
    return (
        <motion.div
            className="absolute rounded-full bg-amber-400/20"
            style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
            animate={{
                y: [0, -30, 0],
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.5],
            }}
            transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: 'easeInOut',
            }}
        />
    );
}

export default function HeroAnimation() {
    return (
        <div className="relative w-full max-w-xl mx-auto h-[380px] md:h-[440px]">
            {/* Ambient glow */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/[0.08] rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute left-1/3 top-1/3 w-48 h-48 bg-blue-500/[0.05] rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute right-1/4 bottom-1/4 w-40 h-40 bg-emerald-500/[0.05] rounded-full blur-[60px] pointer-events-none" />

            {/* Floating particles */}
            <FloatingParticle delay={0} duration={4} x={15} y={20} size={4} />
            <FloatingParticle delay={1} duration={5} x={75} y={15} size={3} />
            <FloatingParticle delay={2} duration={4.5} x={85} y={60} size={5} />
            <FloatingParticle delay={0.5} duration={3.5} x={10} y={70} size={3} />
            <FloatingParticle delay={1.5} duration={4} x={50} y={5} size={4} />
            <FloatingParticle delay={3} duration={5} x={90} y={40} size={3} />

            {/* Orbital ring */}
            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[360px] md:h-[360px] rounded-full border border-amber-500/[0.08]"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400/60" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400/40" />
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400/40" />
            </motion.div>

            {/* Inner orbital ring */}
            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[240px] md:h-[240px] rounded-full border border-white/[0.04]"
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400/40" />
            </motion.div>

            {/* Central dashboard mockup */}
            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="w-[200px] md:w-[240px] rounded-2xl border border-white/[0.1] bg-stone-900/80 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
                    {/* Dashboard header */}
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-400/60" />
                            <div className="w-2 h-2 rounded-full bg-amber-400/60" />
                            <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
                        </div>
                        <span className="text-[9px] font-medium text-stone-500 ml-1">TuyenDung.vn</span>
                    </div>

                    {/* Stats mini grid */}
                    <div className="p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <motion.div
                                className="rounded-lg bg-amber-500/[0.08] border border-amber-500/10 p-2"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <Briefcase className="h-3.5 w-3.5 text-amber-400 mb-1" />
                                <motion.p
                                    className="text-[11px] font-bold text-white"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                >
                                    1,234
                                </motion.p>
                                <p className="text-[8px] text-stone-500">Việc làm</p>
                            </motion.div>
                            <motion.div
                                className="rounded-lg bg-emerald-500/[0.08] border border-emerald-500/10 p-2"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                            >
                                <Home className="h-3.5 w-3.5 text-emerald-400 mb-1" />
                                <motion.p
                                    className="text-[11px] font-bold text-white"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                >
                                    856
                                </motion.p>
                                <p className="text-[8px] text-stone-500">Phòng trọ</p>
                            </motion.div>
                        </div>

                        {/* Mini chart bars */}
                        <motion.div
                            className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[8px] text-stone-500">Xu hướng</span>
                                <TrendingUp className="h-3 w-3 text-emerald-400" />
                            </div>
                            <div className="flex items-end gap-1 h-8">
                                {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex-1 rounded-sm bg-gradient-to-t from-amber-500/40 to-amber-400/20"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: 1.2 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Floating notification - Job match (top right) */}
            <motion.div
                className="absolute z-30"
                style={{ right: '2%', top: '8%' }}
                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    y: [0, -6, 0],
                }}
                transition={{
                    opacity: { duration: 0.6, delay: 1.4 },
                    x: { duration: 0.6, delay: 1.4 },
                    scale: { duration: 0.6, delay: 1.4 },
                    y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 },
                }}
            >
                <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-stone-900/90 backdrop-blur-lg px-3 py-2.5 shadow-lg shadow-emerald-900/20">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-white">Trúng tuyển!</p>
                        <p className="text-[8px] text-stone-400">Bạn đã được chọn</p>
                    </div>
                </div>
            </motion.div>

            {/* Floating notification - New room (bottom left) */}
            <motion.div
                className="absolute z-30"
                style={{ left: '0%', bottom: '12%' }}
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    y: [0, -8, 0],
                }}
                transition={{
                    opacity: { duration: 0.6, delay: 1.8 },
                    x: { duration: 0.6, delay: 1.8 },
                    scale: { duration: 0.6, delay: 1.8 },
                    y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2.5 },
                }}
            >
                <div className="flex items-center gap-2.5 rounded-xl border border-blue-500/20 bg-stone-900/90 backdrop-blur-lg px-3 py-2.5 shadow-lg shadow-blue-900/20">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-white">Phòng mới</p>
                        <p className="text-[8px] text-stone-400">2.5tr/thang - Q.7</p>
                    </div>
                </div>
            </motion.div>

            {/* Floating badge - Rating (top left) */}
            <motion.div
                className="absolute z-30"
                style={{ left: '5%', top: '5%' }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -5, 0],
                }}
                transition={{
                    opacity: { duration: 0.5, delay: 2.2 },
                    scale: { duration: 0.5, delay: 2.2 },
                    y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 3 },
                }}
            >
                <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-stone-900/90 backdrop-blur-lg px-3 py-1.5 shadow-lg">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-bold text-white">4.9</span>
                </div>
            </motion.div>

            {/* Floating badge - Verified (right middle) */}
            <motion.div
                className="absolute z-30"
                style={{ right: '0%', top: '55%' }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -6, 0],
                }}
                transition={{
                    opacity: { duration: 0.5, delay: 2.5 },
                    scale: { duration: 0.5, delay: 2.5 },
                    y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 3.5 },
                }}
            >
                <div className="flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-stone-900/90 backdrop-blur-lg px-3 py-1.5 shadow-lg">
                    <Shield className="h-3 w-3 text-blue-400" />
                    <span className="text-[10px] font-semibold text-white">Xác thực</span>
                </div>
            </motion.div>

            {/* Floating badge - Quick apply (bottom right) */}
            <motion.div
                className="absolute z-30"
                style={{ right: '10%', bottom: '5%' }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -4, 0],
                }}
                transition={{
                    opacity: { duration: 0.5, delay: 2.8 },
                    scale: { duration: 0.5, delay: 2.8 },
                    y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 4 },
                }}
            >
                <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-amber-600/5 backdrop-blur-lg px-3 py-1.5 shadow-lg">
                    <Zap className="h-3 w-3 text-amber-400" />
                    <span className="text-[10px] font-semibold text-amber-300">Ứng tuyển nhanh</span>
                </div>
            </motion.div>

            {/* Floating users count */}
            <motion.div
                className="absolute z-30"
                style={{ left: '8%', top: '42%' }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -7, 0],
                }}
                transition={{
                    opacity: { duration: 0.5, delay: 3 },
                    scale: { duration: 0.5, delay: 3 },
                    y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 4.5 },
                }}
            >
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-stone-900/90 backdrop-blur-lg px-3 py-1.5 shadow-lg">
                    <Users className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] font-semibold text-white">2.4K+</span>
                    <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </div>
            </motion.div>
        </div>
    );
}
