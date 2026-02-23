import InputError from '@/Components/InputError';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Trash2, AlertTriangle, Lock } from 'lucide-react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            clearErrors();
            reset();
        }
    };

    return (
        <section className={`space-y-4 ${className}`}>
            {/* Warning Banner */}
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold text-red-600 dark:text-red-400">
                            Xoa tai khoan vinh vien
                        </h3>
                        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                            Khi tai khoan cua ban bi xoa, tat ca du lieu va thong tin se bi xoa vinh vien.
                            Truoc khi xoa, hay tai ve bat ky du lieu nao ban muon giu lai.
                        </p>
                    </div>
                </div>
            </div>

            {/* Delete Trigger */}
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5 text-xs font-semibold"
                    >
                        <Trash2 className="h-3 w-3" />
                        Xoa tai khoan
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                    <form onSubmit={deleteUser}>
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <DialogTitle className="text-base">
                                        Xac nhan xoa tai khoan
                                    </DialogTitle>
                                    <DialogDescription className="text-xs mt-0.5">
                                        Hanh dong nay khong the hoan tac
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="mt-4 space-y-4">
                            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Tat ca du lieu cua ban bao gom ho so, don ung tuyen, va lich su
                                    hoat dong se bi xoa vinh vien. Vui long nhap mat khau de xac nhan.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="delete-password" className="text-xs font-medium flex items-center gap-1.5">
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                    Mat khau xac nhan
                                </Label>
                                <Input
                                    id="delete-password"
                                    type="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="h-10 text-sm border-red-500/30 focus:border-red-500/50 focus:ring-red-500/20"
                                    placeholder="Nhap mat khau cua ban"
                                    autoFocus
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>
                        </div>

                        <DialogFooter className="mt-6 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenChange(false)}
                                className="text-xs"
                            >
                                Huy bo
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                size="sm"
                                disabled={processing || !data.password}
                                className="gap-1.5 text-xs font-semibold"
                            >
                                <Trash2 className="h-3 w-3" />
                                {processing ? 'Dang xoa...' : 'Xoa vinh vien'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
