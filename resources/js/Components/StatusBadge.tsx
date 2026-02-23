import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const statusConfig: Record<string, { label: string; variant: StatusVariant }> = {
    // Job statuses
    draft: { label: 'Nháp', variant: 'secondary' },
    active: { label: 'Đang tuyển', variant: 'default' },
    closed: { label: 'Đã đóng', variant: 'outline' },
    expired: { label: 'Hết hạn', variant: 'destructive' },
    // Application statuses
    pending: { label: 'Chờ xử lý', variant: 'secondary' },
    reviewing: { label: 'Đang xem xét', variant: 'default' },
    shortlisted: { label: 'Vào danh sách ngắn', variant: 'default' },
    accepted: { label: 'Đã chấp nhận', variant: 'default' },
    rejected: { label: 'Đã từ chối', variant: 'destructive' },
    // Interview statuses
    scheduled: { label: 'Đã lên lịch', variant: 'default' },
    completed: { label: 'Hoàn thành', variant: 'default' },
    cancelled: { label: 'Đã hủy', variant: 'destructive' },
    // Room statuses
    available: { label: 'Còn trống', variant: 'default' },
    rented: { label: 'Đã cho thuê', variant: 'secondary' },
    maintenance: { label: 'Bảo trì', variant: 'outline' },
    // Contract statuses
    terminated: { label: 'Đã chấm dứt', variant: 'destructive' },
};

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status] || { label: status, variant: 'outline' as StatusVariant };

    return (
        <Badge variant={config.variant} className={cn(className)}>
            {config.label}
        </Badge>
    );
}
