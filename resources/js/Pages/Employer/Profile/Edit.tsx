import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
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
import { Separator } from '@/Components/ui/separator';
import type { EmployerProfile } from '@/types';
import { FormEventHandler } from 'react';

interface Props {
    profile: EmployerProfile;
}

export default function Edit({ profile }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        company_name: profile.company_name || '',
        company_logo: profile.company_logo || '',
        industry: profile.industry || '',
        company_size: profile.company_size || '',
        address: profile.address || '',
        district: profile.district || '',
        city: profile.city || '',
        description: profile.description || '',
        tax_code: profile.tax_code || '',
        website: profile.website || '',
        contact_phone: profile.contact_phone || '',
        contact_email: profile.contact_email || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('employer.profile.update'));
    };

    return (
        <AuthenticatedLayout title="Hồ sơ nhà tuyển dụng" header="Chỉnh sửa hồ sơ nhà tuyển dụng">
            <Head title="Hồ sơ nhà tuyển dụng" />

            <div className="max-w-3xl mx-auto">
                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cong ty</CardTitle>
                            <CardDescription>
                                Cập nhật thong tin cong ty de ung vien biet them ve doanh nghiep cua ban
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Company Name */}
                            <div className="space-y-2">
                                <Label htmlFor="company_name">Ten cong ty</Label>
                                <Input
                                    id="company_name"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    placeholder="VD: Công ty TNHH ABC"
                                />
                                {errors.company_name && (
                                    <p className="text-sm text-destructive">{errors.company_name}</p>
                                )}
                            </div>

                            {/* Company Logo */}
                            <div className="space-y-2">
                                <Label htmlFor="company_logo">Logo cong ty (URL)</Label>
                                <Input
                                    id="company_logo"
                                    value={data.company_logo}
                                    onChange={(e) => setData('company_logo', e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                />
                                {errors.company_logo && (
                                    <p className="text-sm text-destructive">{errors.company_logo}</p>
                                )}
                            </div>

                            {/* Industry & Size */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="industry">Ngành nghề</Label>
                                    <Input
                                        id="industry"
                                        value={data.industry}
                                        onChange={(e) => setData('industry', e.target.value)}
                                        placeholder="VD: Cong nghe thong tin"
                                    />
                                    {errors.industry && (
                                        <p className="text-sm text-destructive">{errors.industry}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_size">Quy mo cong ty</Label>
                                    <Select
                                        value={data.company_size}
                                        onValueChange={(value) => setData('company_size', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn quy mô" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1-10">1 - 10 nhan vien</SelectItem>
                                            <SelectItem value="11-50">11 - 50 nhan vien</SelectItem>
                                            <SelectItem value="51-200">51 - 200 nhan vien</SelectItem>
                                            <SelectItem value="201-500">201 - 500 nhan vien</SelectItem>
                                            <SelectItem value="500+">Tren 500 nhan vien</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.company_size && (
                                        <p className="text-sm text-destructive">{errors.company_size}</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả cong ty</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    placeholder="Giới thiệu về công ty của bạn..."
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            <Separator />

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ</Label>
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

                            <Separator />

                            {/* Tax & Website */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="tax_code">Ma so thue</Label>
                                    <Input
                                        id="tax_code"
                                        value={data.tax_code}
                                        onChange={(e) => setData('tax_code', e.target.value)}
                                        placeholder="VD: 0123456789"
                                    />
                                    {errors.tax_code && (
                                        <p className="text-sm text-destructive">{errors.tax_code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                    {errors.website && (
                                        <p className="text-sm text-destructive">{errors.website}</p>
                                    )}
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone">Số điện thoại lien he</Label>
                                    <Input
                                        id="contact_phone"
                                        value={data.contact_phone}
                                        onChange={(e) => setData('contact_phone', e.target.value)}
                                        placeholder="VD: 0901234567"
                                    />
                                    {errors.contact_phone && (
                                        <p className="text-sm text-destructive">{errors.contact_phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_email">Email lien he</Label>
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        value={data.contact_email}
                                        onChange={(e) => setData('contact_email', e.target.value)}
                                        placeholder="hr@example.com"
                                    />
                                    {errors.contact_email && (
                                        <p className="text-sm text-destructive">{errors.contact_email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
