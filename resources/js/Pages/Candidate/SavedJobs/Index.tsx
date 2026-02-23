import CandidateLayout from '@/Layouts/CandidateLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { useConfirm } from '@/hooks/use-confirm';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Bookmark, BookmarkX, Briefcase, MapPin, Clock } from 'lucide-react';
import type { SavedJob, PaginatedData } from '@/types';

interface Props {
    savedJobs: PaginatedData<SavedJob>;
}

export default function Index({ savedJobs }: Props) {
    const { isOpen, title, description, confirm, handleConfirm, handleCancel } = useConfirm();

    const handleUnsave = (savedJob: SavedJob) => {
        confirm(
            'Bỏ lưu việc làm',
            'Bạn có chắc chắn muốn bỏ lưu việc làm này?',
            () => {
                router.delete(route('candidate.saved-jobs.destroy', savedJob.id));
            }
        );
    };

    return (
        <CandidateLayout title="Việc làm đã lưu">
            <Head title="Việc làm da luu" />

            {savedJobs.data.length === 0 ? (
                <EmptyState
                    icon={<Bookmark className="h-12 w-12" />}
                    title="Chưa lưu việc làm nào"
                    description="Hay tìm kiếm và lưu những việc làm phù hợp với bạn"
                    action={
                        <Button asChild>
                            <Link href="/jobs">Tìm việc làm</Link>
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {savedJobs.data.map((savedJob) => {
                            const job = savedJob.job_post;
                            if (!job) return null;

                            return (
                                <Card key={savedJob.id} className="flex flex-col">
                                    <CardHeader className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-base truncate">
                                                    <Link
                                                        href={`/jobs/${job.slug}`}
                                                        className="hover:text-primary"
                                                    >
                                                        {job.title}
                                                    </Link>
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {job.employer?.employer_profile?.company_name ||
                                                        job.employer?.name}
                                                </CardDescription>
                                            </div>
                                            <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                                                {job.job_type === 'seasonal' ? 'Thời vụ' : 'Văn phòng'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {(job.salary_min || job.salary_max) && (
                                            <p className="text-sm font-medium text-primary">
                                                {job.salary_min && job.salary_max
                                                    ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                                                    : job.salary_min
                                                        ? `Tu ${formatCurrency(job.salary_min)}`
                                                        : `Den ${formatCurrency(job.salary_max!)}`}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                            {job.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {[job.district, job.city].filter(Boolean).join(', ') || job.location}
                                                </span>
                                            )}
                                            {job.deadline && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Han: {formatDate(job.deadline)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button asChild size="sm" className="flex-1">
                                                <Link href={`/jobs/${job.slug}`}>
                                                    <Briefcase className="mr-1 h-3 w-3" />Xem chi tiết</Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUnsave(savedJob)}
                                            >
                                                <BookmarkX className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <Pagination meta={savedJobs.meta} />
                </div>
            )}

            <ConfirmDialog
                isOpen={isOpen}
                title={title}
                description={description}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                confirmLabel="Bỏ lưu"
                destructive
            />
        </CandidateLayout>
    );
}
