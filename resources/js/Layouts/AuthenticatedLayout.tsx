import { PropsWithChildren } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/Components/ui/sidebar';
import { Separator } from '@/Components/ui/separator';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from '@/Components/ui/breadcrumb';
import { Bell, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import AppSidebar from '@/Components/AppSidebar';
import FlashToast from '@/Components/FlashToast';
import type { PageProps } from '@/types';

interface AuthenticatedLayoutProps extends PropsWithChildren {
    title?: string;
    header?: string;
}

export default function AuthenticatedLayout({ title, header, children }: AuthenticatedLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <SidebarProvider>
            {title && <Head title={title} />}
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
                    {/* Left: Trigger + Breadcrumb */}
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1 h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" />
                        <Separator orientation="vertical" className="h-4 bg-border/60" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-sm font-semibold">
                                        {header || title || 'Dashboard'}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    {/* Center: Search */}
                    <div className="hidden md:flex flex-1 max-w-md mx-auto">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                            <input
                                type="text"
                                placeholder="Tim kiem..."
                                className="w-full h-9 rounded-lg bg-muted/50 border border-border/50 pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-border transition-all"
                            />
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="ml-auto flex items-center gap-2">
                        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                            </span>
                        </button>
                        <Separator orientation="vertical" className="h-4 bg-border/60 hidden sm:block" />
                        <div className="hidden sm:flex items-center gap-2.5 pl-1">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user?.avatar} className="rounded-lg" />
                                <AvatarFallback className="rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-[11px] font-bold">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden lg:block">
                                <p className="text-[12px] font-semibold leading-tight">{user?.name}</p>
                                <p className="text-[10px] text-muted-foreground leading-tight">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6">{children}</main>
            </SidebarInset>
            <FlashToast />
        </SidebarProvider>
    );
}
