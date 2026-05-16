import { usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// 1. Definisikan tipe untuk alert type
type AlertType = 'success' | 'error' | 'warning';

interface AlertState {
    show: boolean;
    message: string;
    type: AlertType;
}

export default function Alert() {
    const { flash }: any = usePage().props;
    const [isMounted, setIsMounted] = useState(false);
    const [state, setState] = useState<AlertState>({
        show: false,
        message: '',
        type: 'success',
    });

    // Simpan reference timeout untuk dibersihkan nanti
    const autoCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const unmountTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    const show_alert = useCallback((type: AlertType, message: string) => {
        // Bersihkan timeout lama jika ada
        if (autoCloseTimeoutRef.current) {
            clearTimeout(autoCloseTimeoutRef.current);
        }

        if (unmountTimeoutRef.current) {
            clearTimeout(unmountTimeoutRef.current);
        }

        setState({
            show: true,
            message,
            type,
        });
        setIsMounted(true);

        // Buat timeout baru untuk penutupan otomatis (5 detik)
        autoCloseTimeoutRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, show: false }));
        }, 5000);
    }, []);

    // ── Flash dari Laravel (Inertia) ──
    useEffect(() => {
        const success = flash?.success;
        const error = flash?.error;
        const warning = flash?.warning;
        const toast = flash?.toast;

        if (success || error || warning || toast) {
            const type = success
                ? 'success'
                : error
                  ? 'error'
                  : warning
                    ? 'warning'
                    : toast?.type || 'success';
            const message = success || error || warning || toast?.message || '';

            const timer = setTimeout(() => {
                show_alert(type as AlertType, message);
            }, 0);

            return () => clearTimeout(timer);
        }
    }, [flash, show_alert]);

    // ── Programmatic trigger ──
    useEffect(() => {
        const handler = (e: Event) => {
            const { type, message } = (e as CustomEvent).detail;
            show_alert(type, message);
        };

        window.addEventListener('show-alert', handler);

        return () => window.removeEventListener('show-alert', handler);
    }, [show_alert]);

    // ── Handle Unmounting (Exit Animation) ──
    useEffect(() => {
        if (!state.show && isMounted) {
            // Berikan waktu sesuai duration-1000 agar animasi exit selesai
            unmountTimeoutRef.current = setTimeout(() => {
                setIsMounted(false);
            }, 800);
        }

        return () => {
            if (unmountTimeoutRef.current) {
                clearTimeout(unmountTimeoutRef.current);
            }
        };
    }, [state.show, isMounted]);

    if (!isMounted) {
        return null;
    }

    const config = {
        success: {
            bg: 'bg-green-50',
            ping: 'bg-(--primary)',
            close: 'hover:bg-(--primary)/20 active:bg-(--primary)/20 hover:border-(--primary) active:border-(--primary)',
            border: 'border-(--primary) border-2',
            text: 'text-(--primary)',
            icon: (
                <svg
                    className="size-7.5 text-(--primary) bp360:size-7.75 bp400:size-8 md:size-8.25 lg:size-8.5 xl:size-8.75 2xl:size-9"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
        },
        error: {
            bg: 'bg-red-50',
            ping: 'bg-red-600',
            close: 'hover:bg-red-100 active:bg-red-100 hover:border-red-600 active:border-red-600',
            border: 'border-red-600 border-2',
            text: 'text-red-600',
            icon: (
                <svg
                    className="size-7.5 text-red-600 bp360:size-7.75 bp400:size-8 md:size-8.25 lg:size-8.5 xl:size-8.75 2xl:size-9"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
        },
        warning: {
            bg: 'bg-yellow-50',
            ping: 'bg-(--secondary)',
            close: 'hover:bg-yellow-100 active:bg-yellow-100 hover:border-(--secondary) active:border-(--secondary)',
            border: 'border-(--secondary) border-2',
            text: 'text-(--secondary)',
            icon: (
                <svg
                    className="size-7.5 text-(--secondary) bp360:size-7.75 bp400:size-8 md:size-8.25 lg:size-8.5 xl:size-8.75 2xl:size-9"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
        },
    };

    const current = config[state.type];

    return (
        <div
            data-state={state.show ? 'open' : 'closed'}
            className="fixed top-4 right-4 z-49 max-w-70 min-w-60 duration-800 ease-in-out data-[state=closed]:pointer-events-none data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-right-full data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-right-full bp360:max-w-73 bp360:min-w-63 bp400:max-w-75 bp400:min-w-65 md:max-w-100 md:min-w-70 lg:max-w-107 xl:max-w-110"
        >
            <div
                className={`flex w-full items-center gap-2 rounded-lg border p-2 shadow-lg bp400:p-2.25 md:p-2.5 lg:p-3 ${current.bg} ${current.border} ${current.text}`}
            >
                <div className="relative inline-flex w-max shrink-0">
                    <div
                        className={`${current.ping} absolute inset-0 animate-ping-slow rounded-full opacity-20`}
                    ></div>
                    {current.icon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="t-size3 w-full font-medium wrap-break-word whitespace-pre-wrap">
                        {state.message}
                    </p>
                </div>
                <div className="ml-auto shrink-0">
                    <button
                        onClick={() =>
                            setState((prev) => ({ ...prev, show: false }))
                        }
                        className={`ml-auto inline-flex cursor-pointer rounded-full border p-1 transition-all duration-300 ease-in-out ${current.close}`}
                    >
                        <span className="sr-only">Dismiss</span>
                        <svg
                            className="size-4.5 bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.5 xl:size-5.75 2xl:size-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Helper Function ──
export const showAlert = (type: AlertType, message: string) => {
    window.dispatchEvent(
        new CustomEvent('show-alert', { detail: { type, message } }),
    );
};
