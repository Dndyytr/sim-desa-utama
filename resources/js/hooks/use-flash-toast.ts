import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import type { FlashToast } from '@/types/ui';

export function useFlashToast(): void {
    const { flash } = usePage().props as any;
    const lastToastRef = useRef<string | null>(null);

    useEffect(() => {
        const toastData = flash?.toast as FlashToast | undefined;

        if (toastData) {
            // Prevent duplicate toasts if the component re-renders with the same flash data
            const toastKey = `${toastData.type}:${toastData.message}`;

            if (lastToastRef.current !== toastKey) {
                toast[toastData.type](toastData.message);
                lastToastRef.current = toastKey;
            }
        } else {
            lastToastRef.current = null;
        }
    }, [flash]);
}
