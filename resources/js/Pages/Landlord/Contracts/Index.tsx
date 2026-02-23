import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import DataTable, { Column } from '@/Components/DataTable';
import Pagination from '@/Components/Pagination';
import StatusBadge from '@/Components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Eye } from 'lucide-react';
import type { TenantContract, PaginatedData } from '@/types';

interface Props {
    contracts: PaginatedData<TenantContract>;
}

export default function Index({ contracts }: Props) {
    const columns: Column<TenantContract>[] = [
        {
            key: 'room_title',
            label: 'Phong',
            render: (item) => (
                <span className="font-medium">{item.room?.title || 'N/A'}</span>
            ),
        },
        {
            key: 'tenant_name',
            label: 'Người thuê',
            render: (item) => (
                <div>
                    <p className="text-sm">{item.tenant?.name || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{item.tenant?.phone || item.tenant?.email}</p>
                </div>
            ),
        },
        {
            key: 'monthly_rent',
            label: 'Tiền thuê / tháng',
            render: (item) => formatCurrency(item.monthly_rent),
        },
        {
            key: 'start_date',
            label: 'Ngày bắt đầu',
            render: (item) => formatDate(item.start_date),
        },
        {
            key: 'end_date',
            label: 'Ngày kết thúc',
            render: (item) => item.end_date ? formatDate(item.end_date) : 'Không xác định',
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item) => <StatusBadge status={item.status} />,
        },
        {
            key: 'actions',
            label: '',
            className: 'w-[80px]',
            render: (item) => (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={route('landlord.contracts.show', item.id)}>
                        <Eye className="h-4 w-4" />
                    </Link>
                </Button>
            ),
        },
    ];

    return (
        <AuthenticatedLayout title="Hợp đồng thue" header="Quản lý hop dong thue">
            <Head title="Hợp đồng thue" />

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách hợp đồng</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={contracts.data}
                        emptyMessage="Chưa có hop dong nao"
                        emptyDescription="Cac hop dong thue phong se hien thi tai day"
                    />
                    <Pagination meta={contracts.meta} />
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
