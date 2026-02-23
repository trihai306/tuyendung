import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Separator } from '@/Components/ui/separator';
import {
    User,
    Shield,
    AlertTriangle,
    Mail,
    CalendarDays,
    BadgeCheck,
    Settings,
    Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const fadeSlide = (delay = 0) => ({
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } },
});

const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
    employer: {
        label: 'Nha tuyen dung',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    candidate: {
        label: 'Ung vien',
        color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    landlord: {
        label: 'Chu nha',
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
};

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const primaryRole = user.roles?.[0] || 'candidate';
    const roleConfig = ROLE_CONFIG[primaryRole] || ROLE_CONFIG.candidate;

    const memberSince = user.email_verified_at
        ? new Date(user.email_verified_at).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
        })
        : '';

    return (
        <AuthenticatedLayout title="Ho so" header="Ho so ca nhan">
            <Head title="Ho so ca nhan" />

            <motion.div
                className="space-y-6"
                initial="hidden"
                animate="visible"
                variants={stagger}
            >
                {/* Profile Hero Banner */}
                <motion.div variants={fadeSlide(0)}>
                    <Card className="overflow-hidden border-border/50 shadow-sm">
                        {/* Gradient Banner */}
                        <div className="relative h-32 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 dark:from-violet-700 dark:via-indigo-700 dark:to-blue-700">
                            {/* Decorative Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-4 right-8 w-24 h-24 rounded-full border-2 border-white/30" />
                                <div className="absolute top-12 right-20 w-16 h-16 rounded-full border border-white/20" />
                                <div className="absolute bottom-2 left-12 w-20 h-20 rounded-full border border-white/15" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
                        </div>

                        <CardContent className="relative pb-6 -mt-12">
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                                {/* Avatar */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
                                        <AvatarImage src={user.avatar} className="object-cover" />
                                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </motion.div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h1 className="text-xl font-bold truncate">{user.name}</h1>
                                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold ${roleConfig.color}`}>
                                            {roleConfig.label}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1.5 text-muted-foreground">
                                        <span className="flex items-center gap-1.5 text-xs">
                                            <Mail className="h-3 w-3" />
                                            {user.email}
                                        </span>
                                        {memberSince && (
                                            <span className="flex items-center gap-1.5 text-xs hidden sm:flex">
                                                <CalendarDays className="h-3 w-3" />
                                                Tham gia {memberSince}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Verified Badge */}
                                {user.email_verified_at && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6, duration: 0.4 }}
                                        className="hidden sm:flex"
                                    >
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                            <BadgeCheck className="h-3.5 w-3.5" />
                                            Da xac minh
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Tabbed Content */}
                <motion.div variants={fadeSlide(0.15)}>
                    <Tabs defaultValue="profile" className="space-y-4">
                        <TabsList className="h-10 bg-muted/50 p-1 rounded-lg">
                            <TabsTrigger
                                value="profile"
                                className="gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <User className="h-3.5 w-3.5" />
                                Thong tin ca nhan
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <Shield className="h-3.5 w-3.5" />
                                Bao mat
                            </TabsTrigger>
                            <TabsTrigger
                                value="danger"
                                className="gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Nguy hiem
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <Card className="border-border/50 shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
                                                <Sparkles className="h-4 w-4 text-violet-500" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-semibold">Thong tin ho so</h2>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Cap nhat ten va dia chi email cua ban
                                                </p>
                                            </div>
                                        </div>
                                        <Separator className="mb-6" />
                                        <UpdateProfileInformationForm
                                            mustVerifyEmail={mustVerifyEmail}
                                            status={status}
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="security">
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <Card className="border-border/50 shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                                                <Shield className="h-4 w-4 text-blue-500" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-semibold">Bao mat tai khoan</h2>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Su dung mat khau manh de bao ve tai khoan cua ban
                                                </p>
                                            </div>
                                        </div>
                                        <Separator className="mb-6" />
                                        <UpdatePasswordForm />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="danger">
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <Card className="border-red-500/20 dark:border-red-500/10 shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Vung nguy hiem</h2>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Hanh dong khong the hoan tac. Vui long can than.
                                                </p>
                                            </div>
                                        </div>
                                        <Separator className="mb-6" />
                                        <DeleteUserForm />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </motion.div>
        </AuthenticatedLayout>
    );
}
