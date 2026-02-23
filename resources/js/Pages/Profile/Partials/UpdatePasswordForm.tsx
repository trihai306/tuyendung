import InputError from '@/Components/InputError';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { Lock, KeyRound, Eye, CheckCircle2, Send } from 'lucide-react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <form onSubmit={updatePassword} className="space-y-5">
                {/* Current Password */}
                <div className="space-y-2">
                    <Label htmlFor="current_password" className="text-xs font-medium flex items-center gap-1.5">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        Mat khau hien tai
                    </Label>
                    <Input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        autoComplete="current-password"
                        className="h-10 text-sm border-border/60 focus:border-blue-500/50 focus:ring-blue-500/20 transition-colors"
                        placeholder="Nhap mat khau hien tai"
                    />
                    <InputError message={errors.current_password} className="mt-1" />
                </div>

                {/* New Password */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-medium flex items-center gap-1.5">
                        <KeyRound className="h-3 w-3 text-muted-foreground" />
                        Mat khau moi
                    </Label>
                    <Input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        className="h-10 text-sm border-border/60 focus:border-blue-500/50 focus:ring-blue-500/20 transition-colors"
                        placeholder="Nhap mat khau moi (it nhat 8 ky tu)"
                    />
                    <InputError message={errors.password} className="mt-1" />

                    {/* Password strength hints */}
                    {data.password && (
                        <div className="flex items-center gap-2 pt-1">
                            {[
                                { test: data.password.length >= 8, label: '8+ ky tu' },
                                { test: /[A-Z]/.test(data.password), label: 'Chu hoa' },
                                { test: /[0-9]/.test(data.password), label: 'So' },
                            ].map((rule, i) => (
                                <span
                                    key={i}
                                    className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md font-medium transition-colors ${rule.test
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {rule.test && <CheckCircle2 className="h-2.5 w-2.5" />}
                                    {rule.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="text-xs font-medium flex items-center gap-1.5">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        Xac nhan mat khau
                    </Label>
                    <Input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        className="h-10 text-sm border-border/60 focus:border-blue-500/50 focus:ring-blue-500/20 transition-colors"
                        placeholder="Nhap lai mat khau moi"
                    />
                    <InputError message={errors.password_confirmation} className="mt-1" />

                    {/* Match indicator */}
                    {data.password && data.password_confirmation && (
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${data.password === data.password_confirmation
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-500'
                            }`}>
                            {data.password === data.password_confirmation ? (
                                <>
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                    Mat khau khop
                                </>
                            ) : (
                                'Mat khau khong khop'
                            )}
                        </span>
                    )}
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3 pt-2">
                    <Button
                        type="submit"
                        disabled={processing}
                        size="sm"
                        className="gap-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm shadow-blue-500/20 border-0"
                    >
                        <Send className="h-3 w-3" />
                        {processing ? 'Dang cap nhat...' : 'Cap nhat mat khau'}
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
                            Da cap nhat thanh cong
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
