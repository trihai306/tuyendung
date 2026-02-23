import CandidateLayout from '@/Layouts/CandidateLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import type { CandidateProfile, User } from '@/types';
import { FormEventHandler, useMemo, useState, useEffect } from 'react';
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
    Camera,
    CheckCircle2,
    Sparkles,
    ExternalLink,
    Clock,
    Award,
    Heart,
    TrendingUp,
    AlertCircle,
} from 'lucide-react';

interface Props {
    profile: CandidateProfile;
}

const JOB_TYPE_LABELS: Record<string, string> = {
    seasonal: 'Thời vụ',
    office: 'Văn phòng',
    remote: 'Từ xa',
    freelance: 'Freelance',
    both: 'Tất cả',
};

function CircularProgress({ percent, size = 80, strokeWidth = 6 }: { percent: number; size?: number; strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const [animatedPercent, setAnimatedPercent] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedPercent(percent), 200);
        return () => clearTimeout(timer);
    }, [percent]);

    const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;
    const color = animatedPercent >= 80 ? '#10b981' : animatedPercent >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted/50"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color }}>{animatedPercent}%</span>
            </div>
        </div>
    );
}

export default function Edit({ profile }: Props) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;

    const { data, setData, patch, processing, errors, isDirty } = useForm({
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

    const formatSalary = (value: string | number) => {
        const num = typeof value === 'string' ? parseInt(value, 10) : value;
        if (!num || isNaN(num)) return '';
        if (num >= 1000000) return `${(num / 1000000).toFixed(0)} triệu`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
        return `${num}`;
    };

    const hasExperience = data.experience_years !== '' && data.experience_years !== null && data.experience_years !== undefined && Number(data.experience_years) > 0;
    const hasSalary = data.desired_salary !== '' && data.desired_salary !== null && data.desired_salary !== undefined && Number(data.desired_salary) > 0;
    const hasJobType = data.job_type_preference !== '' && JOB_TYPE_LABELS[data.job_type_preference] !== undefined;

    return (
        <CandidateLayout title="Hồ sơ ứng viên">
            <Head title="Hồ sơ ứng viên" />

            <div className="max-w-5xl mx-auto space-y-8">
                {/* HERO HEADER */}
                <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card shadow-xl animate-fade-in-up">
                    <div className="h-40 sm:h-44 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500" />
                        <div className="absolute inset-0 opacity-30" style={{
                            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(0,0,0,0.1) 0%, transparent 50%)',
                        }} />
                        <div className="absolute top-6 right-12 w-32 h-32 border border-white/10 rounded-full hidden sm:block" />
                        <div className="absolute -bottom-6 right-24 w-48 h-48 border border-white/[0.06] rounded-full hidden sm:block" />
                        <div className="absolute top-10 left-1/3 w-20 h-20 border border-white/[0.08] rounded-2xl rotate-12 hidden md:block" />
                        <div className="absolute inset-0 opacity-[0.04]" style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }} />
                    </div>

                    <div className="relative px-5 sm:px-8 pb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-5 -mt-14 sm:-mt-16">
                            <div className="relative group shrink-0">
                                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-background shadow-2xl">
                                    <AvatarImage src={user?.avatar} className="rounded-2xl object-cover" />
                                    <AvatarFallback className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl sm:text-3xl font-bold">
                                        {user?.name?.charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    type="button"
                                    className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                                >
                                    <Camera className="h-6 w-6 text-white drop-shadow-md" />
                                </button>
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-emerald-500 border-[3px] border-background" />
                            </div>

                            <div className="flex-1 min-w-0 pt-1 sm:pb-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{user?.name}</h1>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="shrink-0">
                                                    {completionPercent >= 80 ? (
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                    ) : (
                                                        <AlertCircle className="h-5 w-5 text-amber-500" />
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {completionPercent >= 80
                                                    ? 'Hồ sơ đã đầy đủ'
                                                    : 'Hồ sơ chưa hoàn thành - hãy cập nhật thêm'}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                                {data.city && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {[data.district, data.city].filter(Boolean).join(', ')}
                                    </p>
                                )}
                            </div>

                            <div className="shrink-0 hidden sm:flex flex-col items-center gap-1.5">
                                <CircularProgress percent={completionPercent} size={76} strokeWidth={5} />
                                <span className="text-[11px] text-muted-foreground font-medium">Hồ sơ</span>
                            </div>
                        </div>

                        <div className="sm:hidden mt-4">
                            <div className="flex items-center justify-between text-sm mb-1.5">
                                <span className="text-muted-foreground font-medium">Mức độ hoàn thành</span>
                                <span className={`font-bold ${completionPercent >= 80 ? 'text-emerald-600' : completionPercent >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                    {completionPercent}%
                                </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
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
                        </div>

                        {(hasExperience || hasSalary || hasJobType || skillsList.length > 0) && (
                            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-border/50">
                                {hasExperience && (
                                    <Badge variant="secondary" className="rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-3 py-1.5 gap-1.5 font-medium text-xs">
                                        <Briefcase className="h-3.5 w-3.5" />
                                        {data.experience_years} năm kinh nghiệm
                                    </Badge>
                                )}
                                {hasSalary && (
                                    <Badge variant="secondary" className="rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1.5 gap-1.5 font-medium text-xs">
                                        <DollarSign className="h-3.5 w-3.5" />
                                        {formatSalary(data.desired_salary)} VND
                                    </Badge>
                                )}
                                {hasJobType && (
                                    <Badge variant="secondary" className="rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 px-3 py-1.5 gap-1.5 font-medium text-xs">
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        {JOB_TYPE_LABELS[data.job_type_preference]}
                                    </Badge>
                                )}
                                {skillsList.length > 0 && (
                                    <Badge variant="secondary" className="rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-3 py-1.5 gap-1.5 font-medium text-xs">
                                        <Target className="h-3.5 w-3.5" />
                                        {skillsList.length} kỹ năng
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={submit} className="space-y-6">
                    <Tabs defaultValue="intro" className="animate-fade-in-up stagger-2">
                        <TabsList className="w-full h-auto rounded-xl bg-muted/80 p-1.5 grid grid-cols-4 gap-1">
                            <TabsTrigger value="intro" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md py-2.5 text-xs sm:text-sm gap-1.5 transition-all">
                                <UserIcon className="h-4 w-4 hidden sm:block" />
                                Giới thiệu
                            </TabsTrigger>
                            <TabsTrigger value="experience" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md py-2.5 text-xs sm:text-sm gap-1.5 transition-all">
                                <GraduationCap className="h-4 w-4 hidden sm:block" />
                                Kinh nghiệm
                            </TabsTrigger>
                            <TabsTrigger value="preferences" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md py-2.5 text-xs sm:text-sm gap-1.5 transition-all">
                                <Heart className="h-4 w-4 hidden sm:block" />
                                Mong muốn
                            </TabsTrigger>
                            <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md py-2.5 text-xs sm:text-sm gap-1.5 transition-all">
                                <Shield className="h-4 w-4 hidden sm:block" />
                                Cá nhân
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB 1: GIOI THIEU */}
                        <TabsContent value="intro" className="mt-6 space-y-6">
                            <Card className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/10">
                                            <UserIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Giới thiệu bản thân</CardTitle>
                                            <CardDescription className="text-xs mt-0.5">Mô tả ngắn gọn về bản thân và mục tiêu nghề nghiệp của bạn</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        id="bio"
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                        rows={5}
                                        placeholder="Ví dụ: Tôi là một lập trình viên với 3 năm kinh nghiệm trong lĩnh vực web development. Tôi đam mê công nghệ và luôn tìm kiếm những cơ hội mới để phát triển bản thân..."
                                        className="resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all"
                                    />
                                    {errors.bio && <p className="text-sm text-destructive mt-1.5">{errors.bio}</p>}
                                    <p className="text-[11px] text-muted-foreground mt-2">
                                        {data.bio.length}/500 ký tự
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-500/10">
                                            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Kỹ năng</CardTitle>
                                            <CardDescription className="text-xs mt-0.5">Thêm các kỹ năng chuyên môn và kỹ năng mềm của bạn</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                            <Input
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyDown={handleSkillKeyDown}
                                                placeholder="Nhập kỹ năng rồi nhấn Enter..."
                                                className="pl-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={addSkill}
                                            disabled={!skillInput.trim()}
                                            className="shrink-0 hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {skillsList.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {skillsList.map((skill, index) => (
                                                <span
                                                    key={skill}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-all duration-300 hover:shadow-md hover:shadow-emerald-500/5 animate-fade-in-up"
                                                    style={{ animationDelay: `${index * 0.03}s` }}
                                                >
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSkill(skill)}
                                                        className="rounded-full p-0.5 hover:bg-red-500/15 hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {skillsList.length === 0 && (
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-dashed border-border/50">
                                            <Sparkles className="h-5 w-5 text-muted-foreground/50" />
                                            <p className="text-sm text-muted-foreground">
                                                Thêm kỹ năng để nhà tuyển dụng dễ dàng tìm thấy bạn
                                            </p>
                                        </div>
                                    )}
                                    {errors.skills && <p className="text-sm text-destructive">{errors.skills}</p>}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB 2: KINH NGHIEM */}
                        <TabsContent value="experience" className="mt-6 space-y-6">
                            <Card className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 to-purple-600/5 border border-purple-500/10">
                                            <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Kinh nghiệm & Học vấn</CardTitle>
                                            <CardDescription className="text-xs mt-0.5">Thông tin về kinh nghiệm làm việc và trình độ học vấn của bạn</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="experience_years" className="text-sm font-medium flex items-center gap-1.5">
                                                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                                Số năm kinh nghiệm
                                            </Label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="experience_years"
                                                    type="number"
                                                    min={0}
                                                    value={data.experience_years}
                                                    onChange={(e) => setData('experience_years', e.target.value)}
                                                    placeholder="VD: 3"
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.experience_years && <p className="text-sm text-destructive">{errors.experience_years}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="education" className="text-sm font-medium flex items-center gap-1.5">
                                                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                                                Học vấn
                                            </Label>
                                            <div className="relative">
                                                <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="education"
                                                    value={data.education}
                                                    onChange={(e) => setData('education', e.target.value)}
                                                    placeholder={'VD: Cử nhân CNTT - ĐH Bách Khoa'}
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.education && <p className="text-sm text-destructive">{errors.education}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-rose-600/5 border border-rose-500/10">
                                            <FileText className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">CV / Resume</CardTitle>
                                            <CardDescription className="text-xs mt-0.5">Thêm đường dẫn CV để nhà tuyển dụng có thể xem hồ sơ của bạn</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                        <Input
                                            id="resume_url"
                                            value={data.resume_url}
                                            onChange={(e) => setData('resume_url', e.target.value)}
                                            placeholder={'https://drive.google.com/... hoặc link CV trực tuyến'}
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.resume_url && <p className="text-sm text-destructive">{errors.resume_url}</p>}
                                    {data.resume_url && (
                                        <a
                                            href={data.resume_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/15 px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 font-medium transition-all"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Xem CV của bạn
                                        </a>
                                    )}
                                    {!data.resume_url && (
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/5 border border-dashed border-rose-500/15">
                                            <FileText className="h-5 w-5 text-rose-400/60" />
                                            <p className="text-sm text-muted-foreground">Thêm link CV để tăng cơ hội được nhà tuyển dụng liên hệ</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB 3: MONG MUON */}
                        <TabsContent value="preferences" className="mt-6 space-y-6">
                            <Card className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-indigo-600/5 border border-indigo-500/10">
                                            <Heart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Mong muốn công việc</CardTitle>
                                            <CardDescription className="text-xs mt-0.5">Mức lương và loại hình công việc bạn mong muốn</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="desired_salary" className="text-sm font-medium flex items-center gap-1.5">
                                                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                                Mức lương mong muốn (VND)
                                            </Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="desired_salary"
                                                    type="number"
                                                    min={0}
                                                    value={data.desired_salary}
                                                    onChange={(e) => setData('desired_salary', e.target.value)}
                                                    placeholder="VD: 15000000"
                                                    className="pl-10"
                                                />
                                            </div>
                                            {hasSalary && (
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                    ~ {formatSalary(data.desired_salary)} VND/tháng
                                                </p>
                                            )}
                                            {errors.desired_salary && <p className="text-sm text-destructive">{errors.desired_salary}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="job_type_preference" className="text-sm font-medium flex items-center gap-1.5">
                                                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                                Loại hình công việc
                                            </Label>
                                            <Select value={data.job_type_preference} onValueChange={(value) => setData('job_type_preference', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={'Chọn loại hình công việc'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="seasonal">Thời vụ</SelectItem>
                                                    <SelectItem value="office">Văn phòng</SelectItem>
                                                    <SelectItem value="remote">Từ xa</SelectItem>
                                                    <SelectItem value="freelance">Freelance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.job_type_preference && <p className="text-sm text-destructive">{errors.job_type_preference}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10">
                                <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Mẹo nhỏ</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Nhà tuyển dụng thường lọc ứng viên theo mức lương và loại công việc. Điền đầy đủ để tăng cơ hội xuất hiện trong kết quả tìm kiếm.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB 4: CA NHAN */}
                        <TabsContent value="personal" className="mt-6 space-y-6">
                            <Card className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/10">
                                            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Thông tin cá nhân</CardTitle>
                                            <CardDescription className="text-xs mt-0.5">Ngày sinh và giới tính của bạn</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="date_of_birth" className="text-sm font-medium flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                Ngày sinh
                                            </Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                                                <Input
                                                    id="date_of_birth"
                                                    type="date"
                                                    value={data.date_of_birth}
                                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender" className="text-sm font-medium">Giới tính</Label>
                                            <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={'Chọn giới tính'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Nam</SelectItem>
                                                    <SelectItem value="female">Nữ</SelectItem>
                                                    <SelectItem value="other">Khác</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/15 to-teal-600/5 border border-teal-500/10">
                                            <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{'Địa chỉ'}</CardTitle>
                                            <CardDescription className="text-xs mt-0.5">{'Địa chỉ hiện tại của bạn'}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_address" className="text-sm font-medium">{'Địa chỉ cụ thể'}</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                            <Input
                                                id="current_address"
                                                value={data.current_address}
                                                onChange={(e) => setData('current_address', e.target.value)}
                                                placeholder={'Số nhà, tên đường...'}
                                                className="pl-10"
                                            />
                                        </div>
                                        {errors.current_address && <p className="text-sm text-destructive">{errors.current_address}</p>}
                                    </div>
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="district" className="text-sm font-medium">Quận / Huyện</Label>
                                            <Input
                                                id="district"
                                                value={data.district}
                                                onChange={(e) => setData('district', e.target.value)}
                                                placeholder={'VD: Cầu Giấy'}
                                            />
                                            {errors.district && <p className="text-sm text-destructive">{errors.district}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city" className="text-sm font-medium">Tỉnh / Thành phố</Label>
                                            <Input
                                                id="city"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                placeholder={'VD: Hà Nội'}
                                            />
                                            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* STICKY SAVE BAR */}
                    <div className="sticky bottom-0 z-10 -mx-4 px-4 py-3.5 bg-background/80 backdrop-blur-xl border-t border-border/30 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
                        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {isDirty && (
                                    <div className="flex items-center gap-2 animate-fade-in-up">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                                        </span>
                                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                            Chưa lưu thay đổi
                                        </p>
                                    </div>
                                )}
                                {!isDirty && (
                                    <p className="text-sm text-muted-foreground hidden sm:flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        {'Đã cập nhật'}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant="secondary"
                                    className={`hidden sm:inline-flex rounded-lg px-3 py-1.5 text-xs font-medium ${completionPercent >= 80
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                        : completionPercent >= 50
                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}
                                >
                                    {completionPercent}% hoàn thành
                                </Badge>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 px-6 rounded-xl transition-all duration-300"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Đang lưu...' : 'Lưu hồ sơ'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CandidateLayout>
    );
}
