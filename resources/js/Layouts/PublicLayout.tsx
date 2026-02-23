import { PropsWithChildren, useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import FlashToast from '@/Components/FlashToast';
import { Briefcase, ChevronRight, Menu, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PageProps } from '@/types';

interface PublicLayoutProps extends PropsWithChildren {
    title?: string;
}

export default function PublicLayout({ title, children }: PublicLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            {title && <Head title={title} />}

            {/* Header */}
            <motion.header
                className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8"
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className={`transition-all duration-500 mx-auto max-w-7xl mt-3 rounded-2xl ${scrolled
                    ? 'bg-stone-950/85 backdrop-blur-2xl border border-amber-500/15 shadow-[0_8px_40px_rgba(217,119,6,0.08),0_2px_12px_rgba(0,0,0,0.3)]'
                    : 'bg-stone-900/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.2)]'
                    }`}>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-[72px] items-center justify-between">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-all duration-300 group-hover:scale-105">
                                    <Briefcase className="h-5 w-5 text-white" />
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[17px] font-bold text-white tracking-tight leading-tight">
                                        Tuyển<span className="text-amber-400">Dụng</span>
                                    </span>
                                    <span className="text-[10px] font-medium text-stone-500 tracking-wider uppercase leading-tight hidden sm:block">
                                        Việc làm & Phòng trọ
                                    </span>
                                </div>
                            </Link>

                            {/* Desktop Nav */}
                            <nav className="hidden md:flex items-center">
                                <div className="flex items-center gap-0.5 rounded-full bg-white/[0.06] border border-white/[0.06] px-1.5 py-1.5">
                                    <Link
                                        href="/viec-lam"
                                        className="px-4 py-2 text-[13px] font-medium text-stone-300 hover:text-amber-300 hover:bg-amber-500/10 rounded-full transition-all duration-200"
                                    >
                                        Việc làm
                                    </Link>
                                    <Link
                                        href="/phong-tro"
                                        className="px-4 py-2 text-[13px] font-medium text-stone-300 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-full transition-all duration-200"
                                    >
                                        Phòng trọ
                                    </Link>
                                </div>
                            </nav>

                            {/* Desktop Auth */}
                            <div className="hidden md:flex items-center gap-2">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="group inline-flex items-center gap-1.5 h-10 px-5 text-sm font-semibold text-stone-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 rounded-full hover:from-amber-300 hover:via-amber-400 hover:to-yellow-400 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_28px_rgba(245,158,11,0.5)] hover:scale-[1.03]"
                                    >
                                        Dashboard
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="inline-flex items-center h-10 px-5 text-sm font-medium text-amber-300/80 hover:text-amber-200 rounded-full hover:bg-amber-500/10 transition-all duration-200"
                                        >
                                            Đăng nhập
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="group inline-flex items-center gap-1.5 h-10 px-5 text-sm font-semibold text-stone-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 rounded-full hover:from-amber-300 hover:via-amber-400 hover:to-yellow-400 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_28px_rgba(245,158,11,0.5)] hover:scale-[1.03]"
                                        >
                                            Đăng ký miễn phí
                                            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Mobile Hamburger */}
                            <button
                                className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl bg-white/[0.06] text-stone-400 hover:text-white hover:bg-white/[0.1] transition-all"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="mx-4 mt-1 rounded-2xl border border-white/[0.06] bg-stone-950/95 backdrop-blur-2xl p-3 md:hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                        >
                            <Link
                                href="/viec-lam"
                                className="flex items-center justify-between px-4 py-3.5 text-sm font-medium text-stone-300 hover:text-white hover:bg-white/[0.04] rounded-xl transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Việc làm
                                <ChevronRight className="h-4 w-4 text-stone-600" />
                            </Link>
                            <Link
                                href="/phong-tro"
                                className="flex items-center justify-between px-4 py-3.5 text-sm font-medium text-stone-300 hover:text-white hover:bg-white/[0.04] rounded-xl transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Phòng trọ
                                <ChevronRight className="h-4 w-4 text-stone-600" />
                            </Link>
                            <div className="mt-2 pt-2 border-t border-white/[0.04] space-y-1">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="block px-4 py-3.5 text-sm font-semibold text-center text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="flex items-center justify-between px-4 py-3.5 text-sm font-medium text-stone-300 hover:text-white hover:bg-white/[0.04] rounded-xl transition-all"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Đăng nhập
                                            <ChevronRight className="h-4 w-4 text-stone-600" />
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="block px-4 py-3.5 text-sm font-semibold text-center text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Đăng ký miễn phí
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
                <div className="container py-10 md:py-14">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                                    <Briefcase className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-base font-bold text-stone-900 dark:text-white">
                                    Tuyển<span className="text-amber-500 dark:text-amber-400">Dụng</span>
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Nền tảng tuyển dụng và tìm phòng trọ dành cho sinh viên và người lao động.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-stone-500 dark:text-stone-400">Liên kết</h3>
                            <div className="space-y-3">
                                <Link href="/viec-lam" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Tìm việc làm
                                </Link>
                                <Link href="/phong-tro" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Tìm phòng trọ
                                </Link>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-stone-500 dark:text-stone-400">Liên hệ</h3>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <p>Email: contact@tuyendung.vn</p>
                                <p>Điện thoại: 0123 456 789</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 pt-8 border-t text-center text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} TuyểnDụng. Đã đăng ký bản quyền.
                    </div>
                </div>
            </footer>

            <FlashToast />
        </div>
    );
}
