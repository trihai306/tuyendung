import CandidateLayout from '@/Layouts/CandidateLayout';
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
import type { CandidateProfile } from '@/types';
import { FormEventHandler } from 'react';

interface Props {
    profile: CandidateProfile;
}

export default function Edit({ profile }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        bio: profile.bio || '',
        skills: profile.skills?.join(', ') || '',
        experience_years: profile.experience_years ?? '',
        education: profile.education || '',
        resume_url: profile.resume_url || '',
        desired_salary: profile.desired_salary ?? '',
        job_type_preference: profile.job_type_preference || '',
        current_address: profile.current_address || '',
        district: profile.district || '',
        city: profile.city || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('candidate.profile.update'));
    };

    return (
        <CandidateLayout title="Ho so ung vien">
            <Head title="Hồ sơ ứng viên" />

            <div className="max-w-3xl mx-auto">
                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cá nhân</CardTitle>
                            <CardDescription>
                                Cập nhật hồ sơ ứng viên của bạn để nhà tuyển dụng có thể tìm thấy bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Bio */}
                            <div className="space-y-2">
                                <Label htmlFor="bio">Giới thiệu bản thân</Label>
                                <Textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    rows={4}
                                    placeholder="Viết một vài dòng giới thiệu về bản thân..."
                                />
                                {errors.bio && (
                                    <p className="text-sm text-destructive">{errors.bio}</p>
                                )}
                            </div>

                            {/* Skills */}
                            <div className="space-y-2">
                                <Label htmlFor="skills">Kỹ năng</Label>
                                <Input
                                    id="skills"
                                    value={data.skills}
                                    onChange={(e) => setData('skills', e.target.value)}
                                    placeholder="VD: React, TypeScript, Laravel (phân cách bằng dấu phẩy)"
                                />
                                {errors.skills && (
                                    <p className="text-sm text-destructive">{errors.skills}</p>
                                )}
                            </div>

                            {/* Experience & Education */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="experience_years">Số năm kinh nghiệm</Label>
                                    <Input
                                        id="experience_years"
                                        type="number"
                                        min={0}
                                        value={data.experience_years}
                                        onChange={(e) => setData('experience_years', e.target.value)}
                                        placeholder="VD: 3"
                                    />
                                    {errors.experience_years && (
                                        <p className="text-sm text-destructive">{errors.experience_years}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="education">Học vấn</Label>
                                    <Input
                                        id="education"
                                        value={data.education}
                                        onChange={(e) => setData('education', e.target.value)}
                                        placeholder="VD: Cử nhân CNTT"
                                    />
                                    {errors.education && (
                                        <p className="text-sm text-destructive">{errors.education}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Job preferences */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="desired_salary">Mức lương mong muốn (VND)</Label>
                                    <Input
                                        id="desired_salary"
                                        type="number"
                                        min={0}
                                        value={data.desired_salary}
                                        onChange={(e) => setData('desired_salary', e.target.value)}
                                        placeholder="VD: 15000000"
                                    />
                                    {errors.desired_salary && (
                                        <p className="text-sm text-destructive">{errors.desired_salary}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="job_type_preference">Loại công việc mong muốn</Label>
                                    <Select
                                        value={data.job_type_preference}
                                        onValueChange={(value) => setData('job_type_preference', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn loại công việc" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="seasonal">Thời vụ</SelectItem>
                                            <SelectItem value="office">Văn phòng</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.job_type_preference && (
                                        <p className="text-sm text-destructive">{errors.job_type_preference}</p>
                                    )}
                                </div>
                            </div>

                            {/* Resume */}
                            <div className="space-y-2">
                                <Label htmlFor="resume_url">Link CV / Resume</Label>
                                <Input
                                    id="resume_url"
                                    value={data.resume_url}
                                    onChange={(e) => setData('resume_url', e.target.value)}
                                    placeholder="https://example.com/cv.pdf"
                                />
                                {errors.resume_url && (
                                    <p className="text-sm text-destructive">{errors.resume_url}</p>
                                )}
                            </div>

                            <Separator />

                            {/* Personal info */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth">Ngày sinh</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                    />
                                    {errors.date_of_birth && (
                                        <p className="text-sm text-destructive">{errors.date_of_birth}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">Giới tính</Label>
                                    <Select
                                        value={data.gender}
                                        onValueChange={(value) => setData('gender', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn giới tính" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Nam</SelectItem>
                                            <SelectItem value="female">Nữ</SelectItem>
                                            <SelectItem value="other">Khác</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && (
                                        <p className="text-sm text-destructive">{errors.gender}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="current_address">Địa chỉ hiện tại</Label>
                                <Input
                                    id="current_address"
                                    value={data.current_address}
                                    onChange={(e) => setData('current_address', e.target.value)}
                                    placeholder="Số nhà, tên đường..."
                                />
                                {errors.current_address && (
                                    <p className="text-sm text-destructive">{errors.current_address}</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="district">Quận/Huyện</Label>
                                    <Input
                                        id="district"
                                        value={data.district}
                                        onChange={(e) => setData('district', e.target.value)}
                                        placeholder="VD: Cầu Giấy"
                                    />
                                    {errors.district && (
                                        <p className="text-sm text-destructive">{errors.district}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">Tỉnh/Thành phố</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="VD: Hà Nội"
                                    />
                                    {errors.city && (
                                        <p className="text-sm text-destructive">{errors.city}</p>
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
        </CandidateLayout>
    );
}
