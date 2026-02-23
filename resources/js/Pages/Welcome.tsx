import PublicLayout from '@/Layouts/PublicLayout';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    Search,
    MapPin,
    Briefcase,
    Clock,
    Eye,
    Home,
    Users,
    ArrowRight,
    DollarSign,
    Maximize2,
    Building2,
    TrendingUp,
    Star,
    Zap,
    UserPlus,
    SearchCheck,
    Send,
    ChevronRight,
    Sparkles,
    Shield,
    CheckCircle2,
    Factory,
    Code2,
    Truck,
    Utensils,
    Stethoscope,
    GraduationCap,
    Paintbrush,
    Wrench,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import HeroAnimation from '@/Components/HeroAnimation';
import type { JobPost, Room, JobCategory } from '@/types';

interface WelcomeProps {
    featuredJobs: JobPost[];
    featuredRooms: Room[];
    categories: JobCategory[];
    stats: {
        jobs: number;
        rooms: number;
        users: number;
    };
}

const jobTypeLabels: Record<string, string> = {
    seasonal: 'Thời vụ',
    office: 'Văn phòng',
};

const roomTypeLabels: Record<string, string> = {
    single: 'Phòng đơn',
    shared: 'Phòng ghép',
    apartment: 'Căn hộ',
    mini_apartment: 'Chung cư mini',
};

const CATEGORY_COLORS = [
    { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20', text: 'text-blue-400', hover: 'group-hover:border-blue-500/50', glow: 'group-hover:shadow-blue-500/10' },
    { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20', text: 'text-emerald-400', hover: 'group-hover:border-emerald-500/50', glow: 'group-hover:shadow-emerald-500/10' },
    { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20', text: 'text-amber-400', hover: 'group-hover:border-amber-500/50', glow: 'group-hover:shadow-amber-500/10' },
    { bg: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/20', text: 'text-violet-400', hover: 'group-hover:border-violet-500/50', glow: 'group-hover:shadow-violet-500/10' },
    { bg: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/20', text: 'text-rose-400', hover: 'group-hover:border-rose-500/50', glow: 'group-hover:shadow-rose-500/10' },
    { bg: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/20', text: 'text-cyan-400', hover: 'group-hover:border-cyan-500/50', glow: 'group-hover:shadow-cyan-500/10' },
    { bg: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/20', text: 'text-orange-400', hover: 'group-hover:border-orange-500/50', glow: 'group-hover:shadow-orange-500/10' },
    { bg: 'from-teal-500/20 to-teal-600/10', border: 'border-teal-500/20', text: 'text-teal-400', hover: 'group-hover:border-teal-500/50', glow: 'group-hover:shadow-teal-500/10' },
];

const CATEGORY_ICONS = [Briefcase, Factory, Code2, Truck, Utensils, Stethoscope, GraduationCap, Paintbrush];

export default function Welcome({ featuredJobs = [], featuredRooms = [], categories = [], stats = { jobs: 0, rooms: 0, users: 0 } }: WelcomeProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.get('/viec-lam', { search: searchQuery.trim() });
        } else {
            router.get('/viec-lam');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const useCounter = (end: number, duration: number = 2000) => {
        const [count, setCount] = useState(0);
        const ref = useRef<HTMLDivElement>(null);
        const isInView = useInView(ref, { once: true, margin: '-100px' });
        const hasAnimated = useRef(false);

        useEffect(() => {
            if (!isInView || hasAnimated.current) return;
            hasAnimated.current = true;
            const startTime = Date.now();
            const step = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setCount(Math.floor(eased * end));
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }, [isInView, end, duration]);

        return { count, ref };
    };

    const jobsCounter = useCounter(stats.jobs);
    const roomsCounter = useCounter(stats.rooms);
    const usersCounter = useCounter(stats.users);

    const sectionVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 }
        }
    };

    const staggerItem = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
        }
    };

    return (
        <PublicLayout title="Trang chủ">
            {/* ============================================ */}
            {/* HERO SECTION */}
            {/* ============================================ */}
            <section className="relative overflow-hidden bg-stone-950 pt-24 pb-32 md:pt-32 md:pb-40">
                {/* Ambient gradient orbs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-20 left-1/4 w-[600px] h-[600px] bg-amber-500/[0.08] rounded-full blur-[160px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-emerald-500/[0.06] rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-blue-500/[0.05] rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute bottom-1/4 left-0 w-[350px] h-[350px] bg-violet-500/[0.04] rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
                </div>

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />

                <div className="container relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        {/* Left - Text Content */}
                        <div className="max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2.5 rounded-full border border-amber-500/20 bg-amber-500/[0.08] px-5 py-2 text-xs font-medium text-amber-400 mb-10"
                            >
                                <motion.div
                                    className="w-2 h-2 rounded-full bg-emerald-400"
                                    animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <span>Nền tảng tuyển dụng & phòng trọ hàng đầu</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.08 }}
                                className="text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] font-extrabold tracking-tight mb-7 text-white leading-[1.08]"
                            >
                                Tìm{' '}
                                <span className="relative inline-block">
                                    <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                                        việc làm
                                    </span>
                                    <motion.span
                                        className="absolute -bottom-1.5 left-0 h-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                                    />
                                </span>
                                {' & '}
                                <span className="relative inline-block">
                                    <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                        phòng trọ
                                    </span>
                                    <motion.span
                                        className="absolute -bottom-1.5 left-0 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ delay: 1.0, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                                    />
                                </span>
                                <br />
                                phù hợp với bạn
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.16 }}
                                className="text-base md:text-lg text-stone-400 mb-8 leading-relaxed max-w-xl"
                            >
                                Kết nối ứng viên với nhà tuyển dụng, giúp bạn tìm phòng trọ giá tốt.
                                Nhanh chóng, dễ dàng và hoàn toàn miễn phí.
                            </motion.p>

                            {/* Trust indicators */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="flex items-center gap-5 mb-10"
                            >
                                <div className="flex items-center gap-2.5 text-xs">
                                    <div className="flex -space-x-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-stone-950 flex items-center justify-center text-[9px] font-bold text-white">N</div>
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-stone-950 flex items-center justify-center text-[9px] font-bold text-white">T</div>
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-stone-950 flex items-center justify-center text-[9px] font-bold text-white">H</div>
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 border-2 border-stone-950 flex items-center justify-center text-[9px] font-bold text-white">+</div>
                                    </div>
                                    <span className="text-stone-400 font-medium">2,400+ người dùng</span>
                                </div>
                                <div className="w-px h-5 bg-stone-700" />
                                <div className="flex items-center gap-2 text-xs">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10">
                                        <Shield className="h-3.5 w-3.5 text-emerald-400" />
                                    </div>
                                    <span className="text-stone-400 font-medium">Miễn phí 100%</span>
                                </div>
                                <div className="w-px h-5 bg-stone-700 hidden sm:block" />
                                <div className="hidden sm:flex items-center gap-2 text-xs">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10">
                                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                                    </div>
                                    <span className="text-stone-400 font-medium">Kết nối nhanh</span>
                                </div>
                            </motion.div>

                            {/* Search Bar */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.24 }}
                                className="mb-8"
                            >
                                <div className="flex bg-stone-900/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-2 gap-2 focus-within:border-amber-500/30 transition-all duration-300 focus-within:shadow-[0_0_30px_rgba(245,158,11,0.08)]">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-500" />
                                        <Input
                                            placeholder="Vị trí, công việc, từ khóa..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="pl-12 h-12 border-0 bg-transparent text-white placeholder:text-stone-500 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl"
                                        />
                                    </div>
                                    <Button onClick={handleSearch} className="h-12 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border-0 rounded-xl text-sm font-semibold shadow-lg shadow-amber-600/25 hover:shadow-amber-500/40 transition-all duration-300">
                                        <Search className="mr-2 h-4 w-4" />
                                        Tìm kiếm
                                    </Button>
                                </div>
                            </motion.div>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.32 }}
                                className="flex flex-wrap gap-3"
                            >
                                <Button size="lg" asChild className="rounded-xl px-6 h-11 text-sm font-semibold bg-gradient-to-r from-white/[0.08] to-white/[0.04] hover:from-white/[0.12] hover:to-white/[0.08] border border-white/[0.1] text-white transition-all duration-300 hover:shadow-lg backdrop-blur-sm">
                                    <Link href="/viec-lam">
                                        <Briefcase className="mr-2 h-4 w-4 text-amber-400" />
                                        Tìm việc làm
                                        <ChevronRight className="ml-1 h-3.5 w-3.5 text-stone-500" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild className="rounded-xl px-6 h-11 text-sm font-semibold bg-transparent hover:bg-white/[0.06] border border-white/[0.08] text-stone-300 hover:text-white transition-all duration-300">
                                    <Link href="/phong-tro">
                                        <Home className="mr-2 h-4 w-4 text-emerald-400" />
                                        Tìm phòng trọ
                                        <ChevronRight className="ml-1 h-3.5 w-3.5 text-stone-500" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>

                        {/* Right - Hero Animation */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="hidden lg:block"
                        >
                            <HeroAnimation />
                        </motion.div>
                    </div>
                </div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-950 to-transparent" />
            </section>

            {/* ============================================ */}
            {/* STATS SECTION - Dark theme, floating cards */}
            {/* ============================================ */}
            <section className="relative z-20 bg-stone-950 pb-20 -mt-8">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.97 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="relative bg-stone-900/60 backdrop-blur-xl rounded-3xl border border-white/[0.06] p-10 md:p-12 overflow-hidden shadow-2xl shadow-black/20"
                    >
                        {/* Top gradient line */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 md:divide-x divide-white/[0.06]">
                            {/* Jobs stat */}
                            <div ref={jobsCounter.ref} className="flex items-center justify-center gap-5 md:px-8">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/15 shadow-lg shadow-blue-500/5">
                                    <Briefcase className="h-7 w-7 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-stone-300 bg-clip-text text-transparent">{jobsCounter.count.toLocaleString()}+</p>
                                    <p className="text-sm text-stone-500 font-medium mt-1">Việc làm đang tuyển</p>
                                </div>
                            </div>
                            {/* Rooms stat */}
                            <div ref={roomsCounter.ref} className="flex items-center justify-center gap-5 md:px-8">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/15 shadow-lg shadow-emerald-500/5">
                                    <Home className="h-7 w-7 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-stone-300 bg-clip-text text-transparent">{roomsCounter.count.toLocaleString()}+</p>
                                    <p className="text-sm text-stone-500 font-medium mt-1">Phòng trọ cho thuê</p>
                                </div>
                            </div>
                            {/* Users stat */}
                            <div ref={usersCounter.ref} className="flex items-center justify-center gap-5 md:px-8">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/15 shadow-lg shadow-amber-500/5">
                                    <Users className="h-7 w-7 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-stone-300 bg-clip-text text-transparent">{usersCounter.count.toLocaleString()}+</p>
                                    <p className="text-sm text-stone-500 font-medium mt-1">Người dùng tin tưởng</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============================================ */}
            {/* HOW IT WORKS SECTION */}
            {/* ============================================ */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={sectionVariants}
                className="relative py-20 md:py-28 bg-stone-950 overflow-hidden"
            >
                {/* Subtle gradient orb */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/[0.03] rounded-full blur-[180px]" />

                <div className="container relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 rounded-full border border-amber-500/15 bg-amber-500/[0.06] px-4 py-1.5 text-xs font-medium text-amber-400 mb-5"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Đơn giản & Nhanh chóng</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.08 }}
                            className="text-3xl md:text-4xl font-bold mb-4 text-white"
                        >
                            Bắt đầu chỉ với{' '}
                            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">3 bước</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.12 }}
                            className="text-stone-400 max-w-lg mx-auto"
                        >
                            Quy trình đơn giản để kết nối bạn với cơ hội việc làm và phòng trọ phù hợp
                        </motion.p>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto"
                    >
                        {/* Step 1 */}
                        <motion.div variants={staggerItem} className="relative group">
                            <div className="relative p-8 rounded-2xl border border-white/[0.06] bg-stone-900/40 backdrop-blur-sm hover:bg-stone-900/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/20 h-full">
                                <div className="absolute -top-4 -left-2 md:left-auto md:-right-2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-500/30">1</div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-500/10 mb-5">
                                    <UserPlus className="h-7 w-7 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Đăng ký tài khoản</h3>
                                <p className="text-sm text-stone-400 leading-relaxed">
                                    Tạo tài khoản miễn phí chỉ trong 30 giây. Chọn vai trò ứng viên hoặc nhà tuyển dụng.
                                </p>
                            </div>
                            {/* Connector arrow - hidden on mobile */}
                            <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                                <ChevronRight className="h-5 w-5 text-stone-600" />
                            </div>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div variants={staggerItem} className="relative group">
                            <div className="relative p-8 rounded-2xl border border-white/[0.06] bg-stone-900/40 backdrop-blur-sm hover:bg-stone-900/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/20 h-full">
                                <div className="absolute -top-4 -left-2 md:left-auto md:-right-2 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-emerald-500/30">2</div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/10 mb-5">
                                    <SearchCheck className="h-7 w-7 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Tìm kiếm & Khám phá</h3>
                                <p className="text-sm text-stone-400 leading-relaxed">
                                    Duyệt qua hàng trăm cơ hội việc làm và phòng trọ. Lọc theo khu vực, mức lương và loại hình.
                                </p>
                            </div>
                            {/* Connector arrow */}
                            <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                                <ChevronRight className="h-5 w-5 text-stone-600" />
                            </div>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div variants={staggerItem} className="group">
                            <div className="relative p-8 rounded-2xl border border-white/[0.06] bg-stone-900/40 backdrop-blur-sm hover:bg-stone-900/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-500/20 h-full">
                                <div className="absolute -top-4 -left-2 md:left-auto md:-right-2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-amber-500/30">3</div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/10 mb-5">
                                    <Send className="h-7 w-7 text-amber-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Ứng tuyển & Liên hệ</h3>
                                <p className="text-sm text-stone-400 leading-relaxed">
                                    Ứng tuyển việc làm hoặc liên hệ chủ trọ trực tiếp. Nhận thông báo cập nhật ngay lập tức.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* ============================================ */}
            {/* CATEGORIES SECTION */}
            {/* ============================================ */}
            {categories.length > 0 && (
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={sectionVariants}
                    className="relative py-20 md:py-28 bg-stone-950 overflow-hidden"
                >
                    {/* Gradient orb */}
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.03] rounded-full blur-[160px]" />

                    <div className="container relative z-10">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Danh mục việc làm</h2>
                            <p className="text-stone-400 max-w-lg mx-auto">
                                Khám phá cơ hội việc làm theo lĩnh vực bạn quan tâm
                            </p>
                        </div>
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-50px' }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            {categories.slice(0, 8).map((cat, index) => {
                                const colorSet = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                                const IconComponent = CATEGORY_ICONS[index % CATEGORY_ICONS.length];
                                return (
                                    <motion.div key={cat.id} variants={staggerItem}>
                                        <Link href={`/viec-lam?category_id=${cat.id}`}>
                                            <div className={`group relative cursor-pointer rounded-2xl border ${colorSet.border} ${colorSet.hover} bg-stone-900/40 backdrop-blur-sm p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${colorSet.glow} hover:bg-stone-900/60`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorSet.bg} border ${colorSet.border} transition-all duration-300`}>
                                                        <IconComponent className={`h-5 w-5 ${colorSet.text}`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm text-white truncate group-hover:text-white transition-colors">
                                                            {cat.name}
                                                        </p>
                                                        {cat.job_posts_count !== undefined && (
                                                            <p className="text-xs text-stone-500 mt-0.5">
                                                                {cat.job_posts_count} việc làm
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                        {categories.length > 8 && (
                            <div className="text-center mt-8">
                                <Button variant="outline" asChild className="rounded-xl border-white/10 text-stone-300 hover:text-white hover:bg-white/[0.06] hover:border-white/20">
                                    <Link href="/viec-lam">
                                        Xem tất cả danh mục
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.section>
            )}

            {/* ============================================ */}
            {/* FEATURED JOBS SECTION */}
            {/* ============================================ */}
            {featuredJobs.length > 0 && (
                <section className="relative py-20 md:py-28 bg-stone-950 overflow-hidden">
                    {/* Accent orb */}
                    <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[140px]" />

                    <div className="container relative z-10">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Việc làm nổi bật</h2>
                                <p className="text-stone-400">Những cơ hội tuyển dụng mới nhất dành cho bạn</p>
                            </div>
                            <Button variant="outline" asChild className="hidden md:inline-flex rounded-xl border-white/10 text-stone-300 hover:text-white hover:bg-white/[0.06]">
                                <Link href="/viec-lam">
                                    Xem tất cả
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredJobs.map((job) => (
                                <Link key={job.id} href={`/viec-lam/${job.slug}`} className="group">
                                    <div className={`h-full rounded-2xl border border-white/[0.06] bg-stone-900/40 backdrop-blur-sm p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:bg-stone-900/60 relative overflow-hidden ${job.job_type === 'seasonal'
                                        ? 'hover:border-amber-500/30 hover:shadow-amber-500/5'
                                        : 'hover:border-blue-500/30 hover:shadow-blue-500/5'
                                        }`}>
                                        {/* Type indicator */}
                                        <div className={`absolute top-0 left-0 w-1 h-full rounded-r-full ${job.job_type === 'seasonal'
                                            ? 'bg-gradient-to-b from-amber-500 to-amber-600'
                                            : 'bg-gradient-to-b from-blue-500 to-blue-600'
                                            }`} />

                                        <div className="pl-3">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <h3 className="font-semibold text-white line-clamp-2 group-hover:text-amber-400 transition-colors leading-snug">
                                                    {job.title}
                                                </h3>
                                                <Badge
                                                    variant="secondary"
                                                    className={`shrink-0 text-xs border-0 ${job.job_type === 'seasonal'
                                                        ? 'bg-amber-500/10 text-amber-400'
                                                        : 'bg-blue-500/10 text-blue-400'
                                                        }`}
                                                >
                                                    {jobTypeLabels[job.job_type] || job.job_type}
                                                </Badge>
                                            </div>

                                            {job.employer?.employer_profile?.company_name && (
                                                <div className="flex items-center gap-2.5 mb-4">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/[0.08] text-xs font-bold text-stone-300">
                                                        {job.employer.employer_profile.company_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm text-stone-400 truncate">
                                                        {job.employer.employer_profile.company_name}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="space-y-2.5 mb-4">
                                                {(job.salary_min || job.salary_max) && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-emerald-400 shrink-0" />
                                                        <span className="text-sm font-semibold text-emerald-400">
                                                            {job.salary_min && job.salary_max
                                                                ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                                                                : job.salary_min
                                                                    ? `Từ ${formatCurrency(job.salary_min)}`
                                                                    : `Đến ${formatCurrency(job.salary_max!)}`}
                                                        </span>
                                                    </div>
                                                )}
                                                {job.city && (
                                                    <div className="flex items-center gap-2 text-sm text-stone-400">
                                                        <MapPin className="h-4 w-4 shrink-0 text-stone-500" />
                                                        <span>{job.district ? `${job.district}, ${job.city}` : job.city}</span>
                                                    </div>
                                                )}
                                                {job.deadline && (
                                                    <div className="flex items-center gap-2 text-sm text-stone-400">
                                                        <Clock className="h-4 w-4 shrink-0 text-stone-500" />
                                                        <span>Hạn nộp: {formatDate(job.deadline)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs text-stone-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>{job.views_count} lượt xem</span>
                                                </div>
                                                <span className="text-amber-400 font-medium group-hover:text-amber-300 flex items-center gap-1 transition-colors">
                                                    Xem chi tiết
                                                    <ArrowRight className="h-3 w-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="text-center mt-8 md:hidden">
                            <Button variant="outline" asChild className="rounded-xl border-white/10 text-stone-300">
                                <Link href="/viec-lam">
                                    Xem tất cả việc làm
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================ */}
            {/* FEATURED ROOMS SECTION */}
            {/* ============================================ */}
            {featuredRooms.length > 0 && (
                <section className="relative py-20 md:py-28 bg-stone-950 overflow-hidden">
                    {/* Accent orb */}
                    <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[140px]" />

                    <div className="container relative z-10">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Phòng trọ nổi bật</h2>
                                <p className="text-stone-400">Phòng trọ chất lượng, giá tốt đang cho thuê</p>
                            </div>
                            <Button variant="outline" asChild className="hidden md:inline-flex rounded-xl border-white/10 text-stone-300 hover:text-white hover:bg-white/[0.06]">
                                <Link href="/phong-tro">
                                    Xem tất cả
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredRooms.map((room) => (
                                <Link key={room.id} href={`/phong-tro/${room.slug}`} className="group">
                                    <div className="h-full rounded-2xl border border-white/[0.06] bg-stone-900/40 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/20 hover:bg-stone-900/60">
                                        {/* Image */}
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            {room.images && room.images.length > 0 ? (
                                                <img
                                                    src={room.images[0]}
                                                    alt={room.title}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-emerald-900/30 via-stone-900 to-stone-950 flex items-center justify-center">
                                                    <Home className="h-16 w-16 text-stone-700" />
                                                </div>
                                            )}
                                            {/* Overlay gradient on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                                            {/* Price Badge */}
                                            <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white rounded-xl px-3.5 py-1.5 text-sm font-bold shadow-lg shadow-emerald-500/20">
                                                {formatCurrency(room.price)}/tháng
                                            </div>
                                            {/* Room type badge */}
                                            <div className="absolute bottom-3 left-3">
                                                <Badge variant="secondary" className="bg-stone-900/80 backdrop-blur-sm text-stone-200 border border-white/10">
                                                    {roomTypeLabels[room.room_type] || room.room_type}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="p-5 space-y-3">
                                            <h3 className="font-semibold text-white line-clamp-2 group-hover:text-emerald-400 transition-colors">
                                                {room.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-stone-400">
                                                {room.city && (
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="h-4 w-4 shrink-0 text-stone-500" />
                                                        <span>{room.district ? `${room.district}, ${room.city}` : room.city}</span>
                                                    </div>
                                                )}
                                                {room.area_sqm && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Maximize2 className="h-4 w-4 shrink-0 text-stone-500" />
                                                        <span>{room.area_sqm} m2</span>
                                                    </div>
                                                )}
                                            </div>
                                            {room.average_rating && (
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                    <span className="font-medium text-white">{room.average_rating}</span>
                                                    {room.reviews_count && (
                                                        <span className="text-stone-500">({room.reviews_count} đánh giá)</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="text-center mt-8 md:hidden">
                            <Button variant="outline" asChild className="rounded-xl border-white/10 text-stone-300">
                                <Link href="/phong-tro">
                                    Xem tất cả phòng trọ
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================ */}
            {/* CTA SECTION */}
            {/* ============================================ */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={sectionVariants}
                className="relative py-20 md:py-28 overflow-hidden bg-stone-950"
            >
                {/* Mesh gradient background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-500/[0.06] rounded-full blur-[150px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-emerald-500/[0.05] rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '1.5s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/[0.03] rounded-full blur-[160px]" />
                </div>

                {/* Top separator line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                <div className="container relative z-10">
                    <div className="text-center mb-14">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl md:text-[2.75rem] font-bold mb-5 text-white leading-tight"
                        >
                            Bạn muốn{' '}
                            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">đăng tin</span>?
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-stone-400 max-w-lg mx-auto text-base"
                        >
                            Đăng ký tài khoản miễn phí và bắt đầu đăng tin tuyển dụng hoặc phòng trọ ngay hôm nay
                        </motion.p>
                    </div>
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
                    >
                        {/* Employer card */}
                        <motion.div variants={staggerItem}>
                            <div className="group relative p-8 md:p-10 text-center rounded-3xl border border-blue-500/15 bg-blue-500/[0.03] backdrop-blur-sm hover:border-blue-500/30 hover:bg-blue-500/[0.06] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(59,130,246,0.1)]">
                                <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/15 mx-auto mb-6 h-[72px] w-[72px]">
                                    <Building2 className="h-8 w-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">Bạn là nhà tuyển dụng?</h3>
                                <p className="text-stone-400 mb-8 text-sm leading-relaxed max-w-xs mx-auto">
                                    Đăng tin tuyển dụng, tiếp cận hàng ngàn ứng viên tiềm năng.
                                    Quản lý đơn ứng tuyển dễ dàng và nhanh chóng.
                                </p>
                                <Button asChild className="rounded-xl px-7 h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 transition-all duration-300 text-sm font-semibold">
                                    <Link href="/register">
                                        Đăng tin tuyển dụng
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>

                        {/* Room owner card */}
                        <motion.div variants={staggerItem}>
                            <div className="group relative p-8 md:p-10 text-center rounded-3xl border border-emerald-500/15 bg-emerald-500/[0.03] backdrop-blur-sm hover:border-emerald-500/30 hover:bg-emerald-500/[0.06] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(16,185,129,0.1)]">
                                <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/15 mx-auto mb-6 h-[72px] w-[72px]">
                                    <Home className="h-8 w-8 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">Bạn có phòng trọ?</h3>
                                <p className="text-stone-400 mb-8 text-sm leading-relaxed max-w-xs mx-auto">
                                    Đăng tin cho thuê phòng trọ, tiếp cận người thuê nhanh chóng.
                                    Quản lý hợp đồng và thanh toán tiện lợi.
                                </p>
                                <Button asChild className="rounded-xl px-7 h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40 transition-all duration-300 text-sm font-semibold">
                                    <Link href="/register">
                                        Đăng tin phòng trọ
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>
        </PublicLayout>
    );
}
