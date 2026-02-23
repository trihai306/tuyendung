import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { ArrowLeft } from 'lucide-react';
import type { Room } from '@/types';
import { FormEventHandler } from 'react';

interface Props {
    room: Room;
}

export default function Edit({ room }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        title: room.title || '',
        description: room.description || '',
        room_type: room.room_type || '',
        price: room.price ? String(room.price) : '',
        area_sqm: room.area_sqm ? String(room.area_sqm) : '',
        address: room.address || '',
        district: room.district || '',
        city: room.city || '',
        amenities: room.amenities?.join(', ') || '',
        max_tenants: room.max_tenants ? String(room.max_tenants) : '',
        electricity_price: room.electricity_price ? String(room.electricity_price) : '',
        water_price: room.water_price ? String(room.water_price) : '',
        status: room.status || 'available',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('landlord.rooms.update', room.id));
    };

    return (
        <AuthenticatedLayout title="Chỉnh sửa phòng trọ" header="Chỉnh sửa phòng trọ">
            <Head title="Chỉnh sửa phòng trọ" />

            <div className="max-w-3xl mx-auto">
                <Button variant="ghost" className="mb-4" asChild>
                    <Link href={route('landlord.rooms.index')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại danh sách
                    </Link>
                </Button>

                <form onSubmit={submit}>
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin co ban</CardTitle>
                                <CardDescription>
                                    Cập nhật thong tin phong tro
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Tiêu đề *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="VD: Phòng trọ khep kin gan DH Bach Khoa"
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-destructive">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Mô tả chi tiet</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        placeholder="Mô tả chi tiet ve phong tro..."
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">{errors.description}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="room_type">Loại phòng *</Label>
                                        <Select
                                            value={data.room_type}
                                            onValueChange={(value) =>
                                                setData('room_type', value as 'single' | 'shared' | 'apartment' | 'mini_apartment')
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại phòng" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="single">Phòng đơn</SelectItem>
                                                <SelectItem value="shared">Phòng ghép</SelectItem>
                                                <SelectItem value="apartment">Căn hộ</SelectItem>
                                                <SelectItem value="mini_apartment">Căn hộ mini</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.room_type && (
                                            <p className="text-sm text-destructive">{errors.room_type}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Trạng thái</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) =>
                                                setData('status', value as 'available' | 'rented' | 'maintenance')
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">Con trong</SelectItem>
                                                <SelectItem value="rented">Da cho thue</SelectItem>
                                                <SelectItem value="maintenance">Bao tri</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-destructive">{errors.status}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Gia ca</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Giá thuê / thang (VND) *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min={0}
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="VD: 3000000"
                                        />
                                        {errors.price && (
                                            <p className="text-sm text-destructive">{errors.price}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="electricity_price">Gia dien (VND/kWh)</Label>
                                        <Input
                                            id="electricity_price"
                                            type="number"
                                            min={0}
                                            value={data.electricity_price}
                                            onChange={(e) => setData('electricity_price', e.target.value)}
                                            placeholder="VD: 3500"
                                        />
                                        {errors.electricity_price && (
                                            <p className="text-sm text-destructive">{errors.electricity_price}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="water_price">Gia nuoc (VND/m3)</Label>
                                        <Input
                                            id="water_price"
                                            type="number"
                                            min={0}
                                            value={data.water_price}
                                            onChange={(e) => setData('water_price', e.target.value)}
                                            placeholder="VD: 30000"
                                        />
                                        {errors.water_price && (
                                            <p className="text-sm text-destructive">{errors.water_price}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Chi tiết phòng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="area_sqm">Diện tích (m2)</Label>
                                        <Input
                                            id="area_sqm"
                                            type="number"
                                            min={0}
                                            value={data.area_sqm}
                                            onChange={(e) => setData('area_sqm', e.target.value)}
                                            placeholder="VD: 25"
                                        />
                                        {errors.area_sqm && (
                                            <p className="text-sm text-destructive">{errors.area_sqm}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="max_tenants">Số người ở tối đa</Label>
                                        <Input
                                            id="max_tenants"
                                            type="number"
                                            min={1}
                                            value={data.max_tenants}
                                            onChange={(e) => setData('max_tenants', e.target.value)}
                                            placeholder="VD: 2"
                                        />
                                        {errors.max_tenants && (
                                            <p className="text-sm text-destructive">{errors.max_tenants}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amenities">Tiện ích</Label>
                                    <Input
                                        id="amenities"
                                        value={data.amenities}
                                        onChange={(e) => setData('amenities', e.target.value)}
                                        placeholder="VD: Wifi, Dieu hoa, Tu lanh, May giat (phan cach bang dau phay)"
                                    />
                                    {errors.amenities && (
                                        <p className="text-sm text-destructive">{errors.amenities}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Địa chỉ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Địa chỉ cu the</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Số nhà, tên đường..."
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-destructive">{errors.address}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="district">Quận/Huyện</Label>
                                        <Input
                                            id="district"
                                            value={data.district}
                                            onChange={(e) => setData('district', e.target.value)}
                                            placeholder="VD: Cau Giay"
                                        />
                                        {errors.district && (
                                            <p className="text-sm text-destructive">{errors.district}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">Tinh/Thành phố</Label>
                                        <Input
                                            id="city"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder="VD: Ha Noi"
                                        />
                                        {errors.city && (
                                            <p className="text-sm text-destructive">{errors.city}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('landlord.rooms.index')}>Huy</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Đang lưu...' : 'Cập nhật phòng trọ'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
