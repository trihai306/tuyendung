import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import DataTable, { Column } from '@/Components/DataTable';
import Pagination from '@/Components/Pagination';
import StatusBadge from '@/Components/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Filter } from 'lucide-react';
import type { Application, PaginatedData } from '@/types';
import { useState } from 'react';

interface Props {
    applications: PaginatedData<Application>;
    filters: Record<string, string>;
}

export default function Index({ applications, filters }: Props) {
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        router.get(
            route('employer.applications.index'),
            { status: value === 'all' ? '' : value },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleUpdateStatus = (applicationId: number, newStatus: string) => {
        router.patch(
            route('employer.applications.update', applicationId),
            { status: newStatus },
            { preserveState: true, preserveScroll: true }
        );
    };

    const columns: Column<Application>[] = [
        {
            key: 'candidate_name',
            label: 'Ứng viên',
            render: (item) => (
                <div>
                    <p className="font-medium">{item.candidate?.name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{item.candidate?.email}</p>
                </div>
            ),
        },
        {
            key: 'job_title',
            label: 'Vị trí',
            render: (item) => (
                <span className="text-sm">{item.job_post?.title || 'N/A'}</span>
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item) => <StatusBadge status={item.status} />,
        },
        {
            key: 'applied_at',
            label: 'Ngày ứng tuyển',
            render: (item) => (
                <span className="text-sm">{formatDate(item.applied_at)}</span>
            ),
        },
        {
            key: 'actions',
            label: 'Hành động',
            className: 'w-[180px]',
            render: (item) => (
                <Select
                    value={item.status}
                    onValueChange={(value) => handleUpdateStatus(item.id, value)}
                >
                    <SelectTrigger className="h-8 w-[160px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="reviewing">Đang xem xét</SelectItem>
                        <SelectItem value="shortlisted">Danh sách ngắn</SelectItem>
                        <SelectItem value="accepted">Chap nhan</SelectItem>
                        <SelectItem value="rejected">Từ chối</SelectItem>
                    </SelectContent>
                </Select>
            ),
        },
    ];

    return (
        <AuthenticatedLayout title="Quản lý don ung tuyen" header="Quản lý don ung tuyen">
            <Head title="Quản lý don ung tuyen" />

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Danh sách đơn ứng tuyển</CardTitle>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={handleStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Loc theo trang thai" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                                    <SelectItem value="reviewing">Đang xem xét</SelectItem>
                                    <SelectItem value="shortlisted">Danh sách ngắn</SelectItem>
                                    <SelectItem value="accepted">Chap nhan</SelectItem>
                                    <SelectItem value="rejected">Từ chối</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={applications.data}
                        emptyMessage="Chưa có don ung tuyen nao"
                        emptyDescription="Cac don ung tuyen se hien thi tai day khi ung vien nop don"
                    />
                    <Pagination meta={applications.meta} />
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
