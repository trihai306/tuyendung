import PublicLayout from '@/Layouts/PublicLayout';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import StatusBadge from '@/Components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    MapPin,
    DollarSign,
    Maximize2,
    Home,
    Users,
    Zap,
    Droplets,
    Phone,
    ArrowLeft,
    Star,
    MessageCircle,
    User,
} from 'lucide-react';
import type { Room, RoomReview, PageProps } from '@/types';

interface RoomShowProps {
    room: Room;
    reviews: RoomReview[];
}

const roomTypeLabels: Record<string, string> = {
    single: 'Phòng đơn',
    shared: 'Phòng ghép',
    apartment: 'Căn hộ',
    mini_apartment: 'Chung cu mini',
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${
                        i < rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                    }`}
                />
            ))}
        </div>
    );
}

export default function RoomShow({ room, reviews }: RoomShowProps) {
    const { auth } = usePage<PageProps>().props;

    return (
        <PublicLayout title={room.title}>
            <div className="container py-8">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/phong-tro">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại danh sách
                        </Link>
                    </Button>
                </div>

                {/* Image Gallery */}
                {room.images && room.images.length > 0 && (
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 rounded-lg overflow-hidden">
                            {room.images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`overflow-hidden ${
                                        index === 0
                                            ? 'md:col-span-2 md:row-span-2 aspect-[4/3]'
                                            : 'aspect-video'
                                    }`}
                                >
                                    <img
                                        src={image}
                                        alt={`${room.title} - Anh ${index + 1}`}
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-2xl font-bold">{room.title}</h1>
                                            <StatusBadge status={room.status} />
                                        </div>
                                        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                                            <DollarSign className="h-6 w-6" />
                                            {formatCurrency(room.price)}/tháng
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-sm">
                                        {roomTypeLabels[room.room_type] || room.room_type}
                                    </Badge>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin chi tiet</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Home className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Loại phòng</p>
                                            <p className="font-medium">
                                                {roomTypeLabels[room.room_type] || room.room_type}
                                            </p>
                                        </div>
                                    </div>
                                    {room.area_sqm && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <Maximize2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Diện tích</p>
                                                <p className="font-medium">{room.area_sqm} m²</p>
                                            </div>
                                        </div>
                                    )}
                                    {(room.address || room.city) && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                                                <p className="font-medium">
                                                    {[room.address, room.district, room.city]
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {room.max_tenants && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Số người tối đa</p>
                                                <p className="font-medium">{room.max_tenants} nguoi</p>
                                            </div>
                                        </div>
                                    )}
                                    {room.electricity_price && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                                <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Gia dien</p>
                                                <p className="font-medium">
                                                    {formatCurrency(room.electricity_price)}/kWh
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {room.water_price && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                                                <Droplets className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Gia nuoc</p>
                                                <p className="font-medium">
                                                    {formatCurrency(room.water_price)}/m³
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Amenities */}
                        {room.amenities && room.amenities.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tiện ích</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {room.amenities.map((amenity, index) => (
                                            <Badge key={index} variant="secondary">
                                                {amenity}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Description */}
                        {room.description && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Mô tả</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="prose prose-sm dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: room.description }}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Reviews Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageCircle className="h-5 w-5" />
                                        Đánh giá ({reviews.length})
                                    </CardTitle>
                                    {room.average_rating && (
                                        <div className="flex items-center gap-2">
                                            <StarRating rating={Math.round(room.average_rating)} />
                                            <span className="text-sm font-medium">
                                                {room.average_rating.toFixed(1)}/5
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map((review) => (
                                            <div key={review.id}>
                                                <div className="flex items-start gap-3">
                                                    {review.user?.avatar ? (
                                                        <img
                                                            src={review.user.avatar}
                                                            alt={review.user.name}
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-medium text-sm">
                                                                {review.user?.name || 'Người dùng'}
                                                            </p>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDate(review.created_at)}
                                                            </span>
                                                        </div>
                                                        <StarRating rating={review.rating} />
                                                        {review.comment && (
                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                {review.comment}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <Separator className="mt-4" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Chưa có danh gia nao.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Landlord Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Thông tin chu nha</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {room.landlord ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            {room.landlord.avatar ? (
                                                <img
                                                    src={room.landlord.avatar}
                                                    alt={room.landlord.name}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-primary" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">{room.landlord.name}</p>
                                                {room.landlord.phone && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {room.landlord.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Separator />
                                        {auth.user ? (
                                            <Button className="w-full">
                                                <Phone className="mr-2 h-4 w-4" />
                                                Liên hệ
                                            </Button>
                                        ) : (
                                            <div className="text-center space-y-3">
                                                <p className="text-sm text-muted-foreground">
                                                    Đăng nhập de liên hệ voi chu nha.
                                                </p>
                                                <Button className="w-full" asChild>
                                                    <Link href="/login">Đăng nhập</Link>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Thông tin chu nha khong kha dung.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Thông tin nhanh</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Giá thuê</span>
                                    <span className="font-medium">{formatCurrency(room.price)}/tháng</span>
                                </div>
                                {room.area_sqm && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Diện tích</span>
                                        <span className="font-medium">{room.area_sqm} m²</span>
                                    </div>
                                )}
                                {room.max_tenants && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Toi da</span>
                                        <span className="font-medium">{room.max_tenants} nguoi</span>
                                    </div>
                                )}
                                {room.electricity_price && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Dien</span>
                                        <span className="font-medium">
                                            {formatCurrency(room.electricity_price)}/kWh
                                        </span>
                                    </div>
                                )}
                                {room.water_price && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Nuoc</span>
                                        <span className="font-medium">
                                            {formatCurrency(room.water_price)}/m³
                                        </span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Lượt xem</span>
                                    <span className="font-medium">{room.views_count}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Dang ngay</span>
                                    <span className="font-medium">{formatDate(room.created_at)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
