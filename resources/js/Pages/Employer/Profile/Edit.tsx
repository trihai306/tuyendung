import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PermissionGate from '@/Components/PermissionGate';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
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
import type { EmployerProfile, PageProps } from '@/types';
import { FormEventHandler, useRef, useState } from 'react';
import {
    Building2,
    Camera,
    Globe,
    Mail,
    MapPin,
    Phone,
    FileText,
    Users,
    Briefcase,
    Save,
    Loader2,
    CheckCircle2,
    X,
} from 'lucide-react';

interface Props {
    profile: EmployerProfile;
}

export default function Edit({ profile }: Props) {
    const { flash } = usePage<PageProps>().props;
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(profile.company_logo || null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);

    const { data, setData, errors } = useForm({
        company_name: profile.company_name || '',
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

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setLogoPreview(null);
        setLogoFile(null);
        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('_method', 'PATCH');

        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        if (logoFile) {
            formData.append('company_logo', logoFile);
        }

        router.post(route('employer.profile.update'), formData, {
            forceFormData: true,
            onFinish: () => setProcessing(false),
        });
    };

    // Calculate profile completion
    const fields = ['company_name', 'industry', 'company_size', 'address', 'city', 'description', 'contact_phone', 'contact_email'];
    const filledCount = fields.filter(f => {
        const val = data[f as keyof typeof data];
        return val !== null && val !== undefined && val !== '';
    }).length;
    const completionPct = Math.round((filledCount / fields.length) * 100);

    return (
        <AuthenticatedLayout title="Ho so cong ty" header="Ho so cong ty">
            <Head title="Ho so cong ty" />

            <PermissionGate permission="company.view">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Success Message */}
                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            {flash.success}
                        </div>
                    )}

                    {/* Profile Completion */}
                    <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <span className="font-semibold text-sm">Ho so hoan thien</span>
                                </div>
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completionPct}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-blue-100 dark:bg-blue-900/50 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                                    style={{ width: `${completionPct}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Ho so day du giup tang uy tin voi ung vien
                            </p>
                        </CardContent>
                    </Card>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Logo & Company Identity */}
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                        <Camera className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <CardTitle className="text-base">Thuong hieu cong ty</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Logo Upload */}
                                <div className="flex flex-col sm:flex-row items-start gap-6">
                                    <div className="relative group shrink-0">
                                        <div
                                            className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 overflow-hidden cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5"
                                            onClick={() => logoInputRef.current?.click()}
                                        >
                                            {logoPreview ? (
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <Building2 className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                                                    <p className="text-[10px] text-muted-foreground/60 mt-1">Logo</p>
                                                </div>
                                            )}
                                        </div>
                                        {logoPreview && (
                                            <button
                                                type="button"
                                                onClick={removeLogo}
                                                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        <input
                                            ref={logoInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                            className="hidden"
                                            onChange={handleLogoChange}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-3 w-full">
                                        <div>
                                            <p className="text-sm font-medium">Logo cong ty</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Dinh dang: JPG, PNG, WebP, SVG. Toi da 2MB. Hien thi tren tin tuyen dung.
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => logoInputRef.current?.click()}
                                            className="gap-2"
                                        >
                                            <Camera className="h-3.5 w-3.5" />
                                            {logoPreview ? 'Doi logo' : 'Tai logo len'}
                                        </Button>
                                        {errors.company_logo && (
                                            <p className="text-sm text-destructive">{errors.company_logo}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Company Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="company_name">Ten cong ty *</Label>
                                    <Input
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        placeholder="VD: Cong ty TNHH ABC"
                                        className="h-11"
                                    />
                                    {errors.company_name && (
                                        <p className="text-sm text-destructive">{errors.company_name}</p>
                                    )}
                                </div>

                                {/* Industry & Size */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="industry">Nganh nghe</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="industry"
                                                value={data.industry}
                                                onChange={(e) => setData('industry', e.target.value)}
                                                placeholder="VD: Cong nghe thong tin"
                                                className="pl-10 h-11"
                                            />
                                        </div>
                                        {errors.industry && (
                                            <p className="text-sm text-destructive">{errors.industry}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company_size">Quy mo</Label>
                                        <Select
                                            value={data.company_size}
                                            onValueChange={(value) => setData('company_size', value)}
                                        >
                                            <SelectTrigger className="h-11">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <SelectValue placeholder="Chon quy mo" />
                                                </div>
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
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <FileText className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <CardTitle className="text-base">Gioi thieu cong ty</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Mo ta</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={5}
                                        placeholder="Mo ta ve cong ty, van hoa lam viec, tam nhin su menh..."
                                        className="resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground text-right">
                                        {data.description.length} ky tu
                                    </p>
                                    {errors.description && (
                                        <p className="text-sm text-destructive">{errors.description}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address */}
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                        <MapPin className="h-4 w-4 text-amber-500" />
                                    </div>
                                    <CardTitle className="text-base">Dia chi</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Dia chi chi tiet</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="So nha, ten duong..."
                                            className="pl-10 h-11"
                                        />
                                    </div>
                                    {errors.address && (
                                        <p className="text-sm text-destructive">{errors.address}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="district">Quan/Huyen</Label>
                                        <Input
                                            id="district"
                                            value={data.district}
                                            onChange={(e) => setData('district', e.target.value)}
                                            placeholder="VD: Cau Giay"
                                            className="h-11"
                                        />
                                        {errors.district && (
                                            <p className="text-sm text-destructive">{errors.district}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">Tinh/Thanh pho</Label>
                                        <Input
                                            id="city"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder="VD: Ha Noi"
                                            className="h-11"
                                        />
                                        {errors.city && (
                                            <p className="text-sm text-destructive">{errors.city}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Business & Contact */}
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                                        <Globe className="h-4 w-4 text-violet-500" />
                                    </div>
                                    <CardTitle className="text-base">Thong tin lien he</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Tax code & Website */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="tax_code">Ma so thue</Label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="tax_code"
                                                value={data.tax_code}
                                                onChange={(e) => setData('tax_code', e.target.value)}
                                                placeholder="VD: 0123456789"
                                                className="pl-10 h-11"
                                            />
                                        </div>
                                        {errors.tax_code && (
                                            <p className="text-sm text-destructive">{errors.tax_code}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="website"
                                                value={data.website}
                                                onChange={(e) => setData('website', e.target.value)}
                                                placeholder="https://example.com"
                                                className="pl-10 h-11"
                                            />
                                        </div>
                                        {errors.website && (
                                            <p className="text-sm text-destructive">{errors.website}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_phone">So dien thoai</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="contact_phone"
                                                value={data.contact_phone}
                                                onChange={(e) => setData('contact_phone', e.target.value)}
                                                placeholder="VD: 0901234567"
                                                className="pl-10 h-11"
                                            />
                                        </div>
                                        {errors.contact_phone && (
                                            <p className="text-sm text-destructive">{errors.contact_phone}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_email">Email lien he</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="contact_email"
                                                type="email"
                                                value={data.contact_email}
                                                onChange={(e) => setData('contact_email', e.target.value)}
                                                placeholder="hr@example.com"
                                                className="pl-10 h-11"
                                            />
                                        </div>
                                        {errors.contact_email && (
                                            <p className="text-sm text-destructive">{errors.contact_email}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sticky Save Bar */}
                        <div className="sticky bottom-4 z-10">
                            <div className="flex items-center justify-between rounded-2xl border bg-background/80 backdrop-blur-lg px-6 py-4 shadow-lg">
                                <p className="text-sm text-muted-foreground hidden sm:block">
                                    {completionPct === 100 ? 'Ho so da hoan thien!' : `Con ${fields.length - filledCount} muc chua dien`}
                                </p>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="gap-2 h-10 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Dang luu...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Luu thay doi
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </PermissionGate>
        </AuthenticatedLayout >
    );
}
