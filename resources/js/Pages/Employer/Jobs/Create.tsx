import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PermissionGate from '@/Components/PermissionGate';
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
import { Separator } from '@/Components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import type { JobCategory } from '@/types';
import { FormEventHandler } from 'react';

interface Props {
    categories: JobCategory[];
}

export default function Create({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        job_type: '' as 'seasonal' | 'office' | '',
        category_id: '',
        salary_min: '',
        salary_max: '',
        salary_type: '',
        location: '',
        district: '',
        city: '',
        requirements: '',
        benefits: '',
        slots: '',
        deadline: '',
        status: 'draft' as 'draft' | 'active',
        work_schedule: '',
        experience_level: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('employer.jobs.store'));
    };

    return (
        <AuthenticatedLayout title="Tạo tin tuyển dụng" header="Tạo tin tuyển dụng moi">
            <Head title="Tạo tin tuyển dụng" />

            <PermissionGate permission="jobs.create">
                <div className="max-w-3xl mx-auto">
                    <Button variant="ghost" className="mb-4" asChild>
                        <Link href={route('employer.jobs.index')}>
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
                                        Nhap thông tin co ban cua tin tuyển dụng
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Tiêu đề *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="VD: Tuyển nhân viên bán hàng"
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-destructive">{errors.title}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Mô tả công việc *</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={6}
                                            placeholder="Mô tả chi tiet công việc..."
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-destructive">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="job_type">Loại công việc *</Label>
                                            <Select
                                                value={data.job_type}
                                                onValueChange={(value) => setData('job_type', value as 'seasonal' | 'office')}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn loại công việc" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="seasonal">Thời vụ</SelectItem>
                                                    <SelectItem value="office">Văn phòng</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.job_type && (
                                                <p className="text-sm text-destructive">{errors.job_type}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category_id">Danh mục</Label>
                                            <Select
                                                value={data.category_id}
                                                onValueChange={(value) => setData('category_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn danh mục" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem
                                                            key={category.id}
                                                            value={String(category.id)}
                                                        >
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category_id && (
                                                <p className="text-sm text-destructive">{errors.category_id}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Salary & Schedule */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lương & Lịch làm việc</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="salary_min">Lương tối thiểu (VND)</Label>
                                            <Input
                                                id="salary_min"
                                                type="number"
                                                min={0}
                                                value={data.salary_min}
                                                onChange={(e) => setData('salary_min', e.target.value)}
                                                placeholder="VD: 5000000"
                                            />
                                            {errors.salary_min && (
                                                <p className="text-sm text-destructive">{errors.salary_min}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="salary_max">Lương tối đa (VND)</Label>
                                            <Input
                                                id="salary_max"
                                                type="number"
                                                min={0}
                                                value={data.salary_max}
                                                onChange={(e) => setData('salary_max', e.target.value)}
                                                placeholder="VD: 15000000"
                                            />
                                            {errors.salary_max && (
                                                <p className="text-sm text-destructive">{errors.salary_max}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="salary_type">Hình thức trả</Label>
                                            <Select
                                                value={data.salary_type}
                                                onValueChange={(value) => setData('salary_type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn hình thức" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="monthly">Thang</SelectItem>
                                                    <SelectItem value="hourly">Gio</SelectItem>
                                                    <SelectItem value="daily">Ngay</SelectItem>
                                                    <SelectItem value="project">Du an</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.salary_type && (
                                                <p className="text-sm text-destructive">{errors.salary_type}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="work_schedule">Lịch làm việc</Label>
                                            <Input
                                                id="work_schedule"
                                                value={data.work_schedule}
                                                onChange={(e) => setData('work_schedule', e.target.value)}
                                                placeholder="VD: Thu 2 - Thu 6, 8h-17h"
                                            />
                                            {errors.work_schedule && (
                                                <p className="text-sm text-destructive">{errors.work_schedule}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="experience_level">Kinh nghiệm yêu cầu</Label>
                                            <Select
                                                value={data.experience_level}
                                                onValueChange={(value) => setData('experience_level', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn mức kinh nghiệm" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Khong yêu cầu</SelectItem>
                                                    <SelectItem value="intern">Thuc tap sinh</SelectItem>
                                                    <SelectItem value="fresher">Fresher</SelectItem>
                                                    <SelectItem value="junior">Junior (1-2 nam)</SelectItem>
                                                    <SelectItem value="mid">Mid (3-5 nam)</SelectItem>
                                                    <SelectItem value="senior">Senior (5+ nam)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.experience_level && (
                                                <p className="text-sm text-destructive">{errors.experience_level}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Địa điểm làm việc</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Địa chỉ cụ thể</Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            placeholder="Số nhà, tên đường..."
                                        />
                                        {errors.location && (
                                            <p className="text-sm text-destructive">{errors.location}</p>
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
                                </CardContent>
                            </Card>

                            {/* Requirements & Benefits */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Yêu cầu & Quyền lợi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="requirements">Yêu cầu ứng viên</Label>
                                        <Textarea
                                            id="requirements"
                                            value={data.requirements}
                                            onChange={(e) => setData('requirements', e.target.value)}
                                            rows={4}
                                            placeholder="Cac yêu cầu doi voi ứng viên..."
                                        />
                                        {errors.requirements && (
                                            <p className="text-sm text-destructive">{errors.requirements}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="benefits">Quyền lợi</Label>
                                        <Textarea
                                            id="benefits"
                                            value={data.benefits}
                                            onChange={(e) => setData('benefits', e.target.value)}
                                            rows={4}
                                            placeholder="Các quyền lợi cho nhân viên..."
                                        />
                                        {errors.benefits && (
                                            <p className="text-sm text-destructive">{errors.benefits}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Other settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cài đặt khac</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="slots">Số lượng tuyển</Label>
                                            <Input
                                                id="slots"
                                                type="number"
                                                min={1}
                                                value={data.slots}
                                                onChange={(e) => setData('slots', e.target.value)}
                                                placeholder="VD: 5"
                                            />
                                            {errors.slots && (
                                                <p className="text-sm text-destructive">{errors.slots}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="deadline">Hạn nộp hồ sơ</Label>
                                            <Input
                                                id="deadline"
                                                type="date"
                                                value={data.deadline}
                                                onChange={(e) => setData('deadline', e.target.value)}
                                            />
                                            {errors.deadline && (
                                                <p className="text-sm text-destructive">{errors.deadline}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">Trạng thái</Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(value) => setData('status', value as 'draft' | 'active')}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn trạng thái" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Nhap</SelectItem>
                                                    <SelectItem value="active">Đăng tuyển</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && (
                                                <p className="text-sm text-destructive">{errors.status}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" asChild>
                                            <Link href={route('employer.jobs.index')}>Huỷ</Link>
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Đang tạo...' : 'Tạo tin tuyển dụng'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </div>
            </PermissionGate>
        </AuthenticatedLayout>
    );
}
