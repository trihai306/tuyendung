import CandidateLayout from '@/Layouts/CandidateLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import type { CandidateProfile, User } from '@/types';
import { FormEventHandler, useMemo, useState } from 'react';
import {
    User as UserIcon,
    Briefcase,
    GraduationCap,
    MapPin,
    FileText,
    Target,
    X,
    Plus,
    Save,
    Calendar,
    DollarSign,
    Shield,
} from 'lucide-react';

interface Props {
    profile: CandidateProfile;
}

export default function Edit({ profile }: Props) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;

    const { data, setData, patch, processing, errors } = useForm({
        bio: profile?.bio || '',
        skills: profile?.skills?.join(', ') || '',
        experience_years: profile?.experience_years ?? '',
        education: profile?.education || '',
        resume_url: profile?.resume_url || '',
        desired_salary: profile?.desired_salary ?? '',
        job_type_preference: profile?.job_type_preference || '',
        current_address: profile?.current_address || '',
        district: profile?.district || '',
        city: profile?.city || '',
        date_of_birth: profile?.date_of_birth || '',
        gender: profile?.gender || '',
    });

    const [skillInput, setSkillInput] = useState('');

    const skillsList = useMemo(() => {
        return data.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }, [data.skills]);

    const addSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed && !skillsList.includes(trimmed)) {
            const updated = [...skillsList, trimmed].join(', ');
            setData('skills', updated);
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => {
        const updated = skillsList.filter((s) => s !== skill).join(', ');
        setData('skills', updated);
    };

    const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addSkill();
        }
    };

    // Profile completion
    const completionFields = [
        data.bio,
        data.skills,
        data.experience_years,
        data.education,
        data.desired_salary,
        data.current_address,
        data.city,
        data.date_of_birth,
        data.gender,
    ];
    const filledCount = completionFields.filter((f) => f !== '' && f !== null && f !== undefined).length;
    const completionPercent = Math.round((filledCount / completionFields.length) * 100);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('candidate.profile.update'));
    };

    return (
        <CandidateLayout title="Ho so ung vien">
            <Head title="Ho so ung vien" />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Profile Header Card */}
                <Card className="overflow-hidden">
                    <div className="h-28 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJoMTJ6TTM2IDI0djJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                    </div>
                    <CardContent className="relative px-6 pb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
                            <Avatar className="h-24 w-24 rounded-2xl border-4 border-background shadow-xl">
                                <AvatarImage src={user?.avatar} className="rounded-2xl" />
                                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-bold">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 pt-2">
                                <h1 className="text-2xl font-bold tracking-tight">{user?.name}</h1>
                                <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
                                {data.city && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {[data.district, data.city].filter(Boolean).join(', ')}
                                    </p>
                                )}
                            </div>
                            <div className="w-full sm:w-56 shrink-0">
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="font-medium text-muted-foreground">Ho so hoan thanh</span>
                                    <span className={`font-bold ${completionPercent >= 80 ? 'text-emerald-600' : completionPercent >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                        {completionPercent}%
                                    </span>
                                </div>
                                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${completionPercent >= 80
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                                : completionPercent >= 50
                                                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                                                    : 'bg-gradient-to-r from-red-500 to-red-400'
                                            }`}
                                        style={{ width: `${completionPercent}%` }}
                                    />
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Cap nhat day du de tang co hoi tuyen dung
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* About Section */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                                            <UserIcon className="h-4.5 w-4.5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Gioi thieu ban than</CardTitle>
                                            <CardDescription className="text-xs">Mo ta ngan gon ve ban than va muc tieu nghe nghiep</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        id="bio"
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                        rows={5}
                                        placeholder="Vi du: Toi la mot lap trinh vien voi 3 nam kinh nghiem trong linh vuc web development. Toi dam me cong nghe va luon tim kiem nhung co hoi moi de phat trien ban than..."
                                        className="resize-none"
                                    />
                                    {errors.bio && <p className="text-sm text-destructive mt-1">{errors.bio}</p>}
                                </CardContent>
                            </Card>

                            {/* Skills Section */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                                            <Target className="h-4.5 w-4.5 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Ky nang</CardTitle>
                                            <CardDescription className="text-xs">Them cac ky nang chuyen mon va ky nang mem</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-2">
                                        <Input
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyDown={handleSkillKeyDown}
                                            placeholder="Nhap ky nang roi nhan Enter..."
                                            className="flex-1"
                                        />
                                        <Button type="button" variant="outline" size="icon" onClick={addSkill} disabled={!skillInput.trim()}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {skillsList.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {skillsList.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-500/20"
                                                >
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSkill(skill)}
                                                        className="rounded-full p-0.5 hover:bg-emerald-500/20 transition-colors"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {errors.skills && <p className="text-sm text-destructive">{errors.skills}</p>}
                                </CardContent>
                            </Card>

                            {/* Experience & Education */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
                                            <GraduationCap className="h-4.5 w-4.5 text-purple-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Kinh nghiem & Hoc van</CardTitle>
                                            <CardDescription className="text-xs">Thong tin ve kinh nghiem lam viec va trinh do hoc van</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="experience_years" className="text-sm font-medium flex items-center gap-1.5">
                                                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                                So nam kinh nghiem
                                            </Label>
                                            <Input
                                                id="experience_years"
                                                type="number"
                                                min={0}
                                                value={data.experience_years}
                                                onChange={(e) => setData('experience_years', e.target.value)}
                                                placeholder="VD: 3"
                                            />
                                            {errors.experience_years && <p className="text-sm text-destructive">{errors.experience_years}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="education" className="text-sm font-medium flex items-center gap-1.5">
                                                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                                                Hoc van
                                            </Label>
                                            <Input
                                                id="education"
                                                value={data.education}
                                                onChange={(e) => setData('education', e.target.value)}
                                                placeholder="VD: Cu nhan CNTT - DH Bach Khoa"
                                            />
                                            {errors.education && <p className="text-sm text-destructive">{errors.education}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* CV / Resume */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10">
                                            <FileText className="h-4.5 w-4.5 text-rose-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">CV / Resume</CardTitle>
                                            <CardDescription className="text-xs">Them link CV de nha tuyen dung xem ho so cua ban</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Input
                                            id="resume_url"
                                            value={data.resume_url}
                                            onChange={(e) => setData('resume_url', e.target.value)}
                                            placeholder="https://drive.google.com/... hoac link CV truc tuyen"
                                        />
                                        {errors.resume_url && <p className="text-sm text-destructive">{errors.resume_url}</p>}
                                        {data.resume_url && (
                                            <a
                                                href={data.resume_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                                            >
                                                <FileText className="h-3.5 w-3.5" />
                                                Xem CV
                                            </a>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Sidebar Info */}
                        <div className="space-y-6">
                            {/* Personal Info */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                                            <Shield className="h-4.5 w-4.5 text-amber-600" />
                                        </div>
                                        <CardTitle className="text-base">Thong tin ca nhan</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date_of_birth" className="text-sm font-medium flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                            Ngay sinh
                                        </Label>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                        />
                                        {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender" className="text-sm font-medium">Gioi tinh</Label>
                                        <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chon gioi tinh" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Nam</SelectItem>
                                                <SelectItem value="female">Nu</SelectItem>
                                                <SelectItem value="other">Khac</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Job Preferences */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
                                            <Briefcase className="h-4.5 w-4.5 text-indigo-600" />
                                        </div>
                                        <CardTitle className="text-base">Mong muon cong viec</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="desired_salary" className="text-sm font-medium flex items-center gap-1.5">
                                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                            Muc luong mong muon (VND)
                                        </Label>
                                        <Input
                                            id="desired_salary"
                                            type="number"
                                            min={0}
                                            value={data.desired_salary}
                                            onChange={(e) => setData('desired_salary', e.target.value)}
                                            placeholder="VD: 15000000"
                                        />
                                        {errors.desired_salary && <p className="text-sm text-destructive">{errors.desired_salary}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="job_type_preference" className="text-sm font-medium">Loai cong viec</Label>
                                        <Select value={data.job_type_preference} onValueChange={(value) => setData('job_type_preference', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chon loai cong viec" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="seasonal">Thoi vu</SelectItem>
                                                <SelectItem value="office">Van phong</SelectItem>
                                                <SelectItem value="remote">Tu xa</SelectItem>
                                                <SelectItem value="freelance">Freelance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.job_type_preference && <p className="text-sm text-destructive">{errors.job_type_preference}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10">
                                            <MapPin className="h-4.5 w-4.5 text-teal-600" />
                                        </div>
                                        <CardTitle className="text-base">Dia chi</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_address" className="text-sm font-medium">Dia chi hien tai</Label>
                                        <Input
                                            id="current_address"
                                            value={data.current_address}
                                            onChange={(e) => setData('current_address', e.target.value)}
                                            placeholder="So nha, ten duong..."
                                        />
                                        {errors.current_address && <p className="text-sm text-destructive">{errors.current_address}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="district" className="text-sm font-medium">Quan/Huyen</Label>
                                        <Input
                                            id="district"
                                            value={data.district}
                                            onChange={(e) => setData('district', e.target.value)}
                                            placeholder="VD: Cau Giay"
                                        />
                                        {errors.district && <p className="text-sm text-destructive">{errors.district}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-sm font-medium">Tinh/Thanh pho</Label>
                                        <Input
                                            id="city"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder="VD: Ha Noi"
                                        />
                                        {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Sticky Save Bar */}
                    <div className="sticky bottom-0 z-10 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-lg border-t border-border/50">
                        <div className="max-w-5xl mx-auto flex items-center justify-between">
                            <p className="text-sm text-muted-foreground hidden sm:block">
                                Moi thay doi se duoc luu khi ban nhan nut "Luu ho so"
                            </p>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-600/20 px-6"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Dang luu...' : 'Luu ho so'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CandidateLayout>
    );
}
