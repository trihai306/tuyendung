import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import StatusBadge from '@/Components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    ArrowLeft,
    Home,
    User,
    Calendar,
    Banknote,
    FileText,
    Mail,
    Phone,
} from 'lucide-react';
import type { TenantContract } from '@/types';

interface Props {
    contract: TenantContract;
}

export default function Show({ contract }: Props) {
    const room = contract.room;
    const tenant = contract.tenant;

    return (
        <AuthenticatedLayout title="Chi tiết hợp đồng" header="Chi tiết hợp đồng">
            <Head title="Chi tiết hợp đồng" />

            <div className="max-w-3xl mx-auto space-y-6">
                <Button variant="ghost" asChild>
                    <Link href={route('landlord.contracts.index')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại danh sách
                    </Link>
                </Button>

                {/* Contract Status Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-xl">
                                    Hợp đồng #{contract.id}
                                </CardTitle>
                                <CardDescription>
                                    {room?.title || 'N/A'}
                                </CardDescription>
                            </div>
                            <StatusBadge status={contract.status} />
                        </div>
                    </CardHeader>
                </Card>

                {/* Room Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="h-5 w-5" />
                            Thông tin phong
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Tên phòng</p>
                                <p className="font-medium">{room?.title || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Loại phòng</p>
                                <p className="font-medium">
                                    {room?.room_type === 'single' && 'Phòng đơn'}
                                    {room?.room_type === 'shared' && 'Phòng ghép'}
                                    {room?.room_type === 'apartment' && 'Căn hộ'}
                                    {room?.room_type === 'mini_apartment' && 'Căn hộ mini'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                                <p className="font-medium">
                                    {[room?.address, room?.district, room?.city]
                                        .filter(Boolean)
                                        .join(', ') || 'N/A'}
                                </p>
                            </div>
                            {room?.area_sqm && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Diện tích</p>
                                    <p className="font-medium">{room.area_sqm} m2</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tenant Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Thông tin nguoi thue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Họ tên</p>
                                <p className="font-medium">{tenant?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {tenant?.email || 'N/A'}
                                </p>
                            </div>
                            {tenant?.phone && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                                    <p className="font-medium flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {tenant.phone}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Contract Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Chi tiết hợp đồng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Ngày bắt đầu</p>
                                    <p className="font-medium">{formatDate(contract.start_date)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Ngày kết thúc</p>
                                    <p className="font-medium">
                                        {contract.end_date
                                            ? formatDate(contract.end_date)
                                            : 'Không xác định'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Banknote className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Tiền thuê hàng tháng</p>
                                    <p className="font-medium text-primary">
                                        {formatCurrency(contract.monthly_rent)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Banknote className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Tien coc</p>
                                    <p className="font-medium">
                                        {formatCurrency(contract.deposit)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {contract.notes && (
                            <>
                                <Separator className="my-4" />
                                <div>
                                    <p className="text-sm font-medium mb-2">Ghi chu</p>
                                    <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-4 rounded-md">
                                        {contract.notes}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
