import { PropsWithChildren, useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Separator } from '@/Components/ui/separator';

import FlashToast from '@/Components/FlashToast';
import {
    Briefcase,
    Bell,
    BellOff,
    Search,
    FileText,
    Heart,
    UserCircle,
    LayoutDashboard,
    LogOut,
    Settings,
    Menu,
    X,
    ChevronRight,

} from 'lucide-react';
import type { PageProps } from '@/types';

interface CandidateLayoutProps extends PropsWithChildren {
    title?: string;
}

const NAV_ITEMS = [
    { title: 'Tong quan', href: '/dashboard', icon: LayoutDashboard, routeName: 'dashboard' },
    { title: 'Tim viec', href: '/viec-lam', icon: Search, routeName: 'jobs.index' },
    { title: 'Don ung tuyen', href: '/candidate/applications', icon: FileText, routeName: 'candidate.applications.*' },
    { title: 'Viec da luu', href: '/candidate/saved-jobs', icon: Heart, routeName: 'candidate.saved-jobs.*' },
    { title: 'Ho so', href: '/candidate/profile', icon: UserCircle, routeName: 'candidate.profile.*' },
];

export default function CandidateLayout({ title, children }: CandidateLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


    const isActive = (routeName: string) => {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    };


    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            {title && <Head title={title} />}

            {/* Top Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex h-16 items-center justify-between gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20 transition-all group-hover:shadow-emerald-500/30 group-hover:scale-105">
                                <Briefcase className="h-4.5 w-4.5 text-white" />
                            </div>
                            <span className="text-[15px] font-bold tracking-tight text-foreground hidden sm:block">
                                Tuyen<span className="text-emerald-500">Dung</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {NAV_ITEMS.map((item) => {
                                const active = isActive(item.routeName);
                                return (
                                    <Link
                                        key={item.routeName}
                                        href={item.href}
                                        className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${active
                                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.title}
                                        {active && (
                                            <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-emerald-500" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="hidden lg:flex">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                    <input
                                        type="text"
                                        placeholder="Tim kiem..."
                                        className="h-9 w-48 rounded-lg bg-muted/50 border border-border/50 pl-8 pr-3 text-[12px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all focus:w-64"
                                    />
                                </div>
                            </div>

                            {/* Notification Dropdown */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                                        <Bell className="h-4 w-4" />
                                        <span className="absolute top-1 right-1 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                        </span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="end" sideOffset={8} className="w-80 rounded-xl p-0 shadow-xl">
                                    <div className="px-4 py-3 border-b border-border/50">
                                        <h3 className="text-sm font-semibold">Thong bao</h3>
                                    </div>

                                    {/* Empty state */}
                                    <div className="flex flex-col items-center justify-center py-8 px-4">
                                        <BellOff className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-xs text-muted-foreground">Chua co thong bao moi</p>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2.5 rounded-lg p-1.5 pr-3 hover:bg-muted/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={user?.avatar} className="rounded-lg" />
                                            <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[11px] font-bold">
                                                {user?.name?.charAt(0)?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden sm:block text-[13px] font-medium text-foreground">{user?.name}</span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-xl p-1.5 shadow-xl">
                                    <div className="px-2 py-2.5 mb-1">
                                        <p className="text-[13px] font-semibold">{user?.name}</p>
                                        <p className="text-[11px] text-muted-foreground">{user?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="h-9 rounded-lg cursor-pointer gap-2.5">
                                        <Link href="/candidate/profile">
                                            <UserCircle className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-[13px]">Hồ sơ cá nhân</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="h-9 rounded-lg cursor-pointer gap-2.5">
                                        <Link href="/profile">
                                            <Settings className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-[13px]">Cài đặt</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => router.post('/logout')}
                                        className="h-9 rounded-lg text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer gap-2.5"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span className="text-[13px]">Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 transition-colors"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border/40 bg-white dark:bg-slate-900 px-4 py-2 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(item.routeName);
                            return (
                                <Link
                                    key={item.routeName}
                                    href={item.href}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${active
                                        ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <item.icon className="h-4 w-4" />
                                        {item.title}
                                    </div>
                                    <ChevronRight className="h-4 w-4 opacity-40" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </header>

            {/* Content */}
            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/40 bg-white dark:bg-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                                <Briefcase className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-sm font-bold text-foreground">
                                Tuyen<span className="text-emerald-500">Dung</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-[12px] text-muted-foreground">
                            <Link href="/viec-lam" className="hover:text-foreground transition-colors">Việc làm</Link>
                            <Link href="/phong-tro" className="hover:text-foreground transition-colors">Phòng trọ</Link>
                            <span>2025 TuyenDung</span>
                        </div>
                    </div>
                </div>
            </footer>

            <FlashToast />
        </div>
    );
}
