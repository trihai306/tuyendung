import CandidateLayout from '@/Layouts/CandidateLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import StatusBadge from '@/Components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Briefcase, Building2, Calendar, MapPin, Video, Clock } from 'lucide-react';
import type { Application } from '@/types';

interface Props {
    application: Application;
}

export default function Show({ application }: Props) {
    const jobPost = application.job_post;
    const interviews = application.interviews || [];

    return (
        <CandidateLayout title="Chi tiết đơn ứng tuyển">
            <Head title="Chi tiết đơn ứng tuyển" />

            <div className="max-w-3xl mx-auto space-y-6">
                <Button variant="ghost" asChild>
                    <Link href={route('candidate.applications.index')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại danh sách
                    </Link>
                </Button>

                {/* Job Info Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-xl">
                                    {jobPost?.title || 'N/A'}
                                </CardTitle>
                                <CardDescription className="mt-1 flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    {jobPost?.employer?.employer_profile?.company_name ||
                                        jobPost?.employer?.name ||
                                        'N/A'}
                                </CardDescription>
                            </div>
                            <StatusBadge status={application.status} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {jobPost?.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {[jobPost.location, jobPost.district, jobPost.city]
                                        .filter(Boolean)
                                        .join(', ')}
                                </span>
                            )}
                            {jobPost?.job_type && (
                                <span className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4" />
                                    {jobPost.job_type === 'seasonal' ? 'Thời vụ' : 'Văn phòng'}
                                </span>
                            )}
                        </div>

                        {(jobPost?.salary_min || jobPost?.salary_max) && (
                            <div className="text-sm">
                                <span className="font-medium">Mức lương: </span>
                                {jobPost.salary_min && jobPost.salary_max
                                    ? `${formatCurrency(jobPost.salary_min)} - ${formatCurrency(jobPost.salary_max)}`
                                    : jobPost.salary_min
                                        ? `Tu ${formatCurrency(jobPost.salary_min)}`
                                        : `Den ${formatCurrency(jobPost.salary_max!)}`}
                                {jobPost.salary_type && ` / ${jobPost.salary_type}`}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Application Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin ứng tuyển</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Ngày ứng tuyển:</span>
                            <span>{formatDate(application.applied_at)}</span>
                        </div>

                        {application.reviewed_at && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Ngay xem xet:</span>
                                <span>{formatDate(application.reviewed_at)}</span>
                            </div>
                        )}

                        {application.cover_letter && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-medium mb-2">Thu xin viec</h4>
                                    <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-4 rounded-md">
                                        {application.cover_letter}
                                    </div>
                                </div>
                            </>
                        )}

                        {application.resume_url && (
                            <div className="text-sm">
                                <span className="font-medium">CV/Resume: </span>
                                <a
                                    href={application.resume_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Xem CV
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Interview Schedule */}
                {interviews.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Lịch phỏng vấn</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {interviews.map((interview) => (
                                <div
                                    key={interview.id}
                                    className="flex items-start justify-between rounded-lg border p-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                {formatDate(interview.scheduled_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {interview.type === 'online' ? (
                                                <>
                                                    <Video className="h-4 w-4" />
                                                    <span>Phỏng vấn online</span>
                                                </>
                                            ) : (
                                                <>
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{interview.location || 'Phỏng vấn trực tiếp'}</span>
                                                </>
                                            )}
                                        </div>
                                        {interview.meeting_url && (
                                            <a
                                                href={interview.meeting_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Link phong van
                                            </a>
                                        )}
                                        {interview.notes && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {interview.notes}
                                            </p>
                                        )}
                                    </div>
                                    <StatusBadge status={interview.status} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </CandidateLayout>
    );
}
