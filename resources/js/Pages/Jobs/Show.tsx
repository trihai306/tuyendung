import PublicLayout from '@/Layouts/PublicLayout';
import { Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import StatusBadge from '@/Components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    MapPin,
    Clock,
    DollarSign,
    Eye,
    Briefcase,
    Calendar,
    Users,
    BookmarkPlus,
    BookmarkCheck,
    Send,
    ArrowLeft,
    Building2,
    GraduationCap,
} from 'lucide-react';
import type { JobPost, PageProps } from '@/types';

interface JobShowProps {
    jobPost: JobPost;
    relatedJobs: JobPost[];
    hasApplied: boolean;
    isSaved: boolean;
}

const jobTypeLabels: Record<string, string> = {
    seasonal: 'Thời vụ',
    office: 'Văn phòng',
};

export default function JobShow({ jobPost, relatedJobs, hasApplied, isSaved }: JobShowProps) {
    const { auth } = usePage<PageProps>().props;
    const isCandidate = auth.user?.roles?.includes('candidate');

    const handleApply = () => {
        router.post(`/viec-lam/${jobPost.slug}/apply`);
    };

    const handleToggleSave = () => {
        router.post(`/viec-lam/${jobPost.slug}/save`);
    };

    return (
        <PublicLayout title={jobPost.title}>
            <div className="container py-8">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/viec-lam">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại danh sách
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-2xl font-bold">{jobPost.title}</h1>
                                            <StatusBadge status={jobPost.status} />
                                        </div>
                                        {jobPost.employer && (
                                            <div className="flex items-center gap-3 mt-3">
                                                {jobPost.employer.avatar ? (
                                                    <img
                                                        src={jobPost.employer.avatar}
                                                        alt={jobPost.employer.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Building2 className="h-5 w-5 text-primary" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">
                                                        {jobPost.employer.employer_profile?.company_name ||
                                                            jobPost.employer.name}
                                                    </p>
                                                    {jobPost.employer.employer_profile?.industry && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {jobPost.employer.employer_profile.industry}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleToggleSave}
                                        >
                                            {isSaved ? (
                                                <>
                                                    <BookmarkCheck className="mr-2 h-4 w-4" />
                                                    Da luu
                                                </>
                                            ) : (
                                                <>
                                                    <BookmarkPlus className="mr-2 h-4 w-4" />
                                                    Luu tin
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Job Details Grid */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin chung</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(jobPost.salary_min || jobPost.salary_max) && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Mức lương</p>
                                                <p className="font-medium">
                                                    {jobPost.salary_min && jobPost.salary_max
                                                        ? `${formatCurrency(jobPost.salary_min)} - ${formatCurrency(jobPost.salary_max)}`
                                                        : jobPost.salary_min
                                                          ? `Tu ${formatCurrency(jobPost.salary_min)}`
                                                          : `Den ${formatCurrency(jobPost.salary_max!)}`}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {(jobPost.city || jobPost.location) && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Địa điểm</p>
                                                <p className="font-medium">
                                                    {[jobPost.location, jobPost.district, jobPost.city]
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Loại hình</p>
                                            <p className="font-medium">
                                                {jobTypeLabels[jobPost.job_type] || jobPost.job_type}
                                            </p>
                                        </div>
                                    </div>
                                    {jobPost.work_schedule && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Lịch làm việc</p>
                                                <p className="font-medium">{jobPost.work_schedule}</p>
                                            </div>
                                        </div>
                                    )}
                                    {jobPost.experience_level && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                                                <GraduationCap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Kinh nghiệm</p>
                                                <p className="font-medium">{jobPost.experience_level}</p>
                                            </div>
                                        </div>
                                    )}
                                    {jobPost.deadline && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                                <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Hạn nộp</p>
                                                <p className="font-medium">{formatDate(jobPost.deadline)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {jobPost.slots && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Số lượng tuyển</p>
                                                <p className="font-medium">{jobPost.slots} nguoi</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                                            <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Lượt xem</p>
                                            <p className="font-medium">{jobPost.views_count}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Mô tả công việc</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="prose prose-sm dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: jobPost.description }}
                                />
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        {jobPost.requirements && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Yêu cầu ứng viên</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="prose prose-sm dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: jobPost.requirements }}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Benefits */}
                        {jobPost.benefits && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quyền lợi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="prose prose-sm dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: jobPost.benefits }}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Apply Card */}
                        <Card>
                            <CardContent className="pt-6">
                                {auth.user && isCandidate ? (
                                    <div className="space-y-3">
                                        {hasApplied ? (
                                            <Button className="w-full" disabled>
                                                <Send className="mr-2 h-4 w-4" />
                                                Da ứng tuyển
                                            </Button>
                                        ) : (
                                            <Button className="w-full" onClick={handleApply}>
                                                <Send className="mr-2 h-4 w-4" />
                                                Ứng tuyển ngay
                                            </Button>
                                        )}
                                        <p className="text-xs text-center text-muted-foreground">
                                            {hasApplied
                                                ? 'Bạn đã ứng tuyển vào vị trí này.'
                                                : 'Nhan nut de gui hồ sơ ứng tuyển.'}
                                        </p>
                                    </div>
                                ) : auth.user ? (
                                    <div className="text-center space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Chi tài khoản ứng viên moi co the ứng tuyển.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            Đăng nhập de ứng tuyển việc làm nay.
                                        </p>
                                        <Button className="w-full" asChild>
                                            <Link href="/login">Đăng nhập</Link>
                                        </Button>
                                        <p className="text-xs text-muted-foreground">
                                            Chưa có tài khoản?{' '}
                                            <Link href="/register" className="text-primary underline">
                                                Đăng ký ngay
                                            </Link>
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Related Jobs */}
                        {relatedJobs.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Việc làm lien quan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {relatedJobs.map((job) => (
                                        <Link
                                            key={job.id}
                                            href={`/viec-lam/${job.slug}`}
                                            className="block group"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                                    {job.title}
                                                </p>
                                                {job.employer?.employer_profile?.company_name && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {job.employer.employer_profile.company_name}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    {job.city && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {job.city}
                                                        </span>
                                                    )}
                                                    {(job.salary_min || job.salary_max) && (
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="h-3 w-3" />
                                                            {job.salary_min
                                                                ? formatCurrency(job.salary_min)
                                                                : formatCurrency(job.salary_max!)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Separator className="mt-4" />
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
