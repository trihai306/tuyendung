import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import EmployerDashboard from '@/Pages/Dashboard/EmployerDashboard';
import CandidateDashboard from '@/Pages/Dashboard/CandidateDashboard';
import { Briefcase, Search, Building2, ArrowRight, Sparkles } from 'lucide-react';

interface DashboardProps {
    candidate?: Record<string, unknown>;
    employer?: Record<string, unknown>;
    landlord?: Record<string, unknown>;
}

export default function Dashboard({ candidate, employer, landlord }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const roles = user.roles || [];

    const isCandidate = roles.includes('candidate');
    const isEmployer = roles.includes('employer');

    return (
        <AuthenticatedLayout title="Dashboard" header="Dashboard">
            <Head title="Dashboard" />

            {isEmployer && employer && (
                <EmployerDashboard data={employer as any} user={user} />
            )}

            {isCandidate && candidate && (
                <CandidateDashboard data={candidate as any} user={user} />
            )}

            {!isEmployer && !isCandidate && (
                <div className="min-h-[75vh] flex items-center justify-center">
                    <div className="w-full max-w-2xl mx-auto text-center space-y-8">
                        {/* Welcome Icon */}
                        <div className="relative inline-flex">
                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-cyan-500/5 border border-indigo-500/10">
                                <Sparkles className="h-9 w-9 text-indigo-500" />
                            </div>
                            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 border-2 border-background">
                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Text */}
                        <div className="space-y-3">
                            <h1 className="text-2xl font-bold tracking-tight">
                                Xin chao, {user.name}!
                            </h1>
                            <p className="text-muted-foreground text-[15px] max-w-md mx-auto leading-relaxed">
                                Chon vai tro cua ban de bat dau su dung nen tang tuyen dung thong minh.
                            </p>
                        </div>

                        {/* Role Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                            <Link
                                href="/dashboard"
                                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-left transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full" />
                                <div className="relative space-y-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                                        <Building2 className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-[15px] font-semibold">Nha tuyen dung</h3>
                                        <p className="text-[12px] text-muted-foreground mt-1">Dang tin, quan ly ung vien</p>
                                    </div>
                                    <div className="flex items-center text-[12px] font-medium text-blue-500 gap-1 group-hover:gap-2 transition-all">
                                        Bat dau
                                        <ArrowRight className="h-3 w-3" />
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/dashboard"
                                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-left transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full" />
                                <div className="relative space-y-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                                        <Search className="h-6 w-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-[15px] font-semibold">Ung vien</h3>
                                        <p className="text-[12px] text-muted-foreground mt-1">Tim viec, ung tuyen nhanh</p>
                                    </div>
                                    <div className="flex items-center text-[12px] font-medium text-emerald-500 gap-1 group-hover:gap-2 transition-all">
                                        Bat dau
                                        <ArrowRight className="h-3 w-3" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
