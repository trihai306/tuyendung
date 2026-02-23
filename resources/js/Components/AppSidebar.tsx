import { Link, usePage, router } from '@inertiajs/react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/Components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
    LayoutDashboard,
    Search,
    FileText,
    Heart,
    UserCircle,
    PlusCircle,
    Users,
    Home,
    FileSignature,
    Briefcase,
    Building2,
    ChevronsUpDown,
    LogOut,
    Settings,
    Zap,
    BarChart3,
} from 'lucide-react';
import type { PageProps, PermissionKey } from '@/types';
import { usePermission } from '@/hooks/usePermission';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    routeName: string;
    badge?: string;
    permission?: PermissionKey;
}

function getRoleConfig(roles: string[]) {
    if (roles.includes('employer')) {
        return {
            navItems: [
                { title: 'Tong quan', href: '/dashboard', icon: LayoutDashboard, routeName: 'dashboard' },
                { title: 'Tin tuyen dung', href: '/employer/jobs', icon: Briefcase, routeName: 'employer.jobs.index', permission: 'jobs.view' },
                { title: 'Dang tin moi', href: '/employer/jobs/create', icon: PlusCircle, routeName: 'employer.jobs.create', badge: 'Moi', permission: 'jobs.create' },
                { title: 'Ung vien', href: '/employer/applications', icon: Users, routeName: 'employer.applications.index', permission: 'applications.view' },
                { title: 'Doi ngu', href: '/employer/team', icon: Users, routeName: 'employer.team.index', permission: 'team.view' },
                { title: 'Nhiem vu', href: '/employer/tasks', icon: FileText, routeName: 'employer.tasks.index', permission: 'tasks.view_all' },
                { title: 'Bao cao', href: '/employer/reports', icon: BarChart3, routeName: 'employer.reports.index', permission: 'reports.view' },
                { title: 'Ho so cong ty', href: '/employer/profile', icon: Building2, routeName: 'employer.profile.edit', permission: 'company.view' },
            ] as NavItem[],
            roleLabel: 'Quan ly',
            accent: '#3b82f6',
        };
    }
    if (roles.includes('candidate')) {
        return {
            navItems: [
                { title: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard, routeName: 'dashboard' },
                { title: 'Tim viec', href: '/viec-lam', icon: Search, routeName: 'jobs.index' },
                { title: 'Đơn ứng tuyển', href: '/candidate/applications', icon: FileText, routeName: 'candidate.applications.index' },
                { title: 'Viec da luu', href: '/candidate/saved-jobs', icon: Heart, routeName: 'candidate.saved-jobs.index' },
                { title: 'Hồ sơ', href: '/candidate/profile', icon: UserCircle, routeName: 'candidate.profile.edit' },
            ] as NavItem[],
            roleLabel: 'Cá nhân',
            accent: '#10b981',
        };
    }
    if (roles.includes('landlord')) {
        return {
            navItems: [
                { title: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard, routeName: 'dashboard' },
                { title: 'Dang phong moi', href: '/landlord/rooms/create', icon: PlusCircle, routeName: 'landlord.rooms.create' },
                { title: 'Hợp đồng', href: '/landlord/contracts', icon: FileSignature, routeName: 'landlord.contracts.index' },
            ] as NavItem[],
            roleLabel: 'Quản lý',
            accent: '#f59e0b',
        };
    }
    return {
        navItems: [
            { title: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard, routeName: 'dashboard' },
        ] as NavItem[],
        roleLabel: 'Menu',
        accent: '#6366f1',
    };
}

const exploreItems: NavItem[] = [
    { title: 'Việc làm', href: '/viec-lam', icon: Briefcase, routeName: 'jobs.index' },
    { title: 'Phòng trọ', href: '/phong-tro', icon: Home, routeName: 'rooms.index' },
];

export default function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const { can } = usePermission();
    const user = auth.user;
    const roles = user?.roles || [];
    const config = getRoleConfig(roles);

    // Filter nav items by permission
    const filteredNavItems = config.navItems.filter(item => {
        if (!item.permission) return true;
        return can(item.permission);
    });

    const isActive = (routeName: string) => {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    };

    return (
        <Sidebar className="border-r border-sidebar-border/50">
            {/* Logo */}
            <SidebarHeader className="p-5 pb-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:shadow-blue-500/50 group-hover:scale-[1.05]">
                        <Briefcase className="h-5 w-5 text-white drop-shadow-sm" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[15px] font-bold tracking-tight text-sidebar-foreground leading-none">TuyenDung</span>
                        <span className="text-[10px] text-sidebar-foreground/35 font-medium leading-none">Tuyển dụng thông minh</span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-3">
                {/* Main Navigation */}
                <SidebarGroup className="py-0">
                    <SidebarGroupLabel className="px-3 mb-2 text-[10px] uppercase tracking-[0.14em] font-bold text-sidebar-foreground/25">
                        {config.roleLabel}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {filteredNavItems.map((item) => {
                                const active = isActive(item.routeName);
                                return (
                                    <SidebarMenuItem key={item.routeName}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            className="relative h-10 rounded-xl px-3 transition-all duration-150 hover:bg-sidebar-foreground/[0.08]"
                                        >
                                            <Link href={item.href} className="flex items-center gap-3">
                                                {active && (
                                                    <div
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                                                        style={{ backgroundColor: config.accent }}
                                                    />
                                                )}
                                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${active
                                                    ? 'bg-sidebar-foreground/[0.12]'
                                                    : 'bg-sidebar-foreground/[0.05]'
                                                    }`}>
                                                    <item.icon className={`h-[16px] w-[16px] transition-colors ${active ? 'text-sidebar-foreground' : 'text-sidebar-foreground/45'
                                                        }`} />
                                                </div>
                                                <span className={`text-[13px] transition-colors ${active
                                                    ? 'font-semibold text-sidebar-foreground'
                                                    : 'font-medium text-sidebar-foreground/60'
                                                    }`}>
                                                    {item.title}
                                                </span>
                                                {item.badge && (
                                                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Divider */}
                <div className="mx-3 my-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-sidebar-foreground/10 to-transparent" />
                </div>

                {/* Explore */}
                <SidebarGroup className="py-0">
                    <SidebarGroupLabel className="px-3 mb-2 text-[10px] uppercase tracking-[0.14em] font-bold text-sidebar-foreground/25">
                        Kham pha
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {exploreItems.map((item) => {
                                const active = isActive(item.routeName);
                                return (
                                    <SidebarMenuItem key={item.routeName}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            className="relative h-10 rounded-xl px-3 transition-all duration-150 hover:bg-sidebar-foreground/[0.08]"
                                        >
                                            <Link href={item.href} className="flex items-center gap-3">
                                                {active && (
                                                    <div
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                                                        style={{ backgroundColor: config.accent }}
                                                    />
                                                )}
                                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${active ? 'bg-sidebar-foreground/[0.12]' : 'bg-sidebar-foreground/[0.05]'
                                                    }`}>
                                                    <item.icon className={`h-[16px] w-[16px] ${active ? 'text-sidebar-foreground' : 'text-sidebar-foreground/45'
                                                        }`} />
                                                </div>
                                                <span className={`text-[13px] ${active ? 'font-semibold text-sidebar-foreground' : 'font-medium text-sidebar-foreground/60'
                                                    }`}>
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Upgrade Card */}
                <div className="mt-auto mx-1 mb-2 pt-4">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/20 via-blue-500/10 to-cyan-500/5 border border-indigo-500/10 p-4">
                        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl" />
                        <div className="relative space-y-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
                                <Zap className="h-4 w-4 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-[12px] font-semibold text-sidebar-foreground/80">Nang cap Pro</p>
                                <p className="text-[11px] text-sidebar-foreground/35 leading-relaxed mt-0.5">
                                    Mo khoa tinh nang nang cao.
                                </p>
                            </div>
                            <button className="w-full h-8 rounded-lg bg-indigo-500/20 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/30 transition-colors">
                                Tim hieu them
                            </button>
                        </div>
                    </div>
                </div>
            </SidebarContent>

            {/* User Footer */}
            <SidebarFooter className="p-3 pt-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-150 hover:bg-sidebar-foreground/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
                            <Avatar className="h-9 w-9 rounded-xl ring-2 ring-sidebar-foreground/10">
                                <AvatarImage src={user?.avatar} className="rounded-xl" />
                                <AvatarFallback className="rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-xs font-bold">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-sidebar-foreground truncate leading-tight">{user?.name}</p>
                                <p className="text-[11px] text-sidebar-foreground/35 truncate leading-tight">{user?.email}</p>
                            </div>
                            <ChevronsUpDown className="h-4 w-4 text-sidebar-foreground/25 shrink-0" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="top"
                        align="start"
                        sideOffset={8}
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1.5 shadow-xl shadow-black/20"
                    >
                        <div className="px-2 py-2.5 mb-1">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 rounded-xl">
                                    <AvatarImage src={user?.avatar} className="rounded-xl" />
                                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-sm font-bold">
                                        {user?.name?.charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-semibold truncate">{user?.name}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                        <DropdownMenuSeparator className="mx-0" />
                        <DropdownMenuItem asChild className="h-9 rounded-lg cursor-pointer gap-2.5">
                            <Link href="/profile">
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
                        <DropdownMenuSeparator className="mx-0" />
                        <DropdownMenuItem
                            onClick={() => router.post('/logout')}
                            className="h-9 rounded-lg text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer gap-2.5"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-[13px]">Đăng xuất</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
