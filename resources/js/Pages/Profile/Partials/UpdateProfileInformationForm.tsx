import InputError from '@/Components/InputError';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { User, Mail, CheckCircle2, Send } from 'lucide-react';
import type { PageProps } from '@/types';

interface UpdateProfileInformationProps {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}

export default function UpdateProfileInformationForm({
    mustVerifyEmail,
    status,
    className = '',
}: UpdateProfileInformationProps) {
    const user = usePage<PageProps>().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-medium flex items-center gap-1.5">
                        <User className="h-3 w-3 text-muted-foreground" />
                        Ho va ten
                    </Label>
                    <div className="relative">
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            className="h-10 text-sm pl-3 border-border/60 focus:border-violet-500/50 focus:ring-violet-500/20 transition-colors"
                            placeholder="Nhap ho va ten cua ban"
                        />
                    </div>
                    <InputError className="mt-1" message={errors.name} />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        Dia chi email
                    </Label>
                    <div className="relative">
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            className="h-10 text-sm pl-3 border-border/60 focus:border-violet-500/50 focus:ring-violet-500/20 transition-colors"
                            placeholder="Nhap dia chi email"
                        />
                    </div>
                    <InputError className="mt-1" message={errors.email} />
                </div>

                {/* Email Verification Notice */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            Dia chi email cua ban chua duoc xac minh.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-semibold underline underline-offset-2 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                            >
                                Nhan vao day de gui lai email xac minh.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Da gui lien ket xac minh moi den email cua ban.
                            </div>
                        )}
                    </div>
                )}

                {/* Submit */}
                <div className="flex items-center gap-3 pt-2">
                    <Button
                        type="submit"
                        disabled={processing}
                        size="sm"
                        className="gap-1.5 text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm shadow-violet-500/20 border-0"
                    >
                        <Send className="h-3 w-3" />
                        {processing ? 'Dang luu...' : 'Luu thay doi'}
                    </Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-x-2"
                        leave="transition ease-in-out duration-200"
                        leaveTo="opacity-0"
                    >
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Da luu thanh cong
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
