import { Toaster } from 'sonner';
import { useFlash } from '@/hooks/use-flash';

export default function FlashToast() {
    useFlash();
    return <Toaster position="top-right" richColors closeButton />;
}
