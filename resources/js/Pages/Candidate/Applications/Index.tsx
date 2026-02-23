import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import DataTable, { Column } from '@/Components/DataTable';
import Pagination from '@/Components/Pagination';
import StatusBadge from '@/Components/StatusBadge';
import { formatDate } from '@/lib/utils';
import type { Application, PaginatedData } from '@/types';

interface Props {
    applications: PaginatedData<Application>;
}

export default function Index({ applications }: Props) {
    const columns: Column<Application>[] = [
        {
            key: 'job_title',
            label: 'Vị trí ung tuyen',
            render: (item) => (
                <Link
                    href={`/jobs/${item.job_post?.slug || item.job_post_id}`}
                    className="font-medium text-primary hover:underline"
                >
                    {item.job_post?.title || 'N/A'}
                </Link>
            ),
        },
        {
            key: 'company',
            label: 'Công ty',
            render: (item) =>
                item.job_post?.employer?.employer_profile?.company_name ||
                item.job_post?.employer?.name ||
                'N/A',
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item) => <StatusBadge status={item.status} />,
        },
        {
            key: 'applied_at',
            label: 'Ngày ứng tuyển',
            render: (item) => formatDate(item.applied_at),
        },
    ];

    return (
        <AuthenticatedLayout title="Đơn ứng tuyển" header="Đơn ứng tuyển của tôi">
            <Head title="Đơn ứng tuyển" />

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách đơn ứng tuyển</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={applications.data}
                        emptyMessage="Chưa có don ung tuyen nao"
                        emptyDescription="Hay tim viec va ung tuyen ngay"
                    />
                    <Pagination meta={applications.meta} />
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
