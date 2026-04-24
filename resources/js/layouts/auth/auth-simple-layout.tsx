// import { Link } from '@inertiajs/react';
// import AppLogoIcon from '@/components/app-logo-icon';
// import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex h-svh flex-col justify-center gap-6 p-2 lg:items-center">
            <div className="flex size-full max-h-250 max-w-350 flex-col gap-2 lg:flex-row lg:gap-4">
                <div className="size-full max-h-50 overflow-hidden rounded-md bp360:max-h-60 bp400:max-h-70 md:max-h-full">
                    <div className="relative size-full bg-primary">
                        <figure className="absolute top-2 left-2 z-3 flex items-center">
                            <img
                                src="/img/logo.png"
                                alt="logo"
                                className="w-8 bp360:w-9.5 bp400:w-10 md:w-10.5 lg:w-12 xl:w-15 2xl:w-16"
                            />
                            <figcaption className="t-size6 font-ubuntu font-bold text-(--fourth)">
                                SAN
                                <span className="text-amber-200">DU</span>
                            </figcaption>
                        </figure>
                        <span className="absolute inset-0 z-2 size-full shadow-[inset_0_-4px_250px_20px_var(--primary)]"></span>
                        <img
                            className="absolute inset-0 z-1 size-full object-cover object-center opacity-85"
                            src="/img/login_background.jpg"
                            alt="background"
                        />
                        <div className="absolute bottom-0 z-4 mx-2 my-2 flex flex-col lg:mx-4 lg:my-6 lg:gap-2">
                            <h1 className="t-size7 animate-fade-up font-bold text-white">
                                Selamat datang di SANDU, Sistem Andalan Desa
                                Utama
                            </h1>
                            <p className="t-size2 animate-fade-up text-white/70 opacity-0 delay-500">
                                Sistem informasi manajemen berbasis website
                                untuk mengelola pelayanan di Desa Utama
                            </p>
                            <div className="t-size3 mt-2 hidden gap-2 bp360:flex lg:mt-4 lg:gap-4">
                                <span className="flex animate-fade-up items-center gap-2 font-medium text-(--secondary) opacity-0 delay-700">
                                    <span className="inline-block rounded-full bg-white/30 p-1.5">
                                        <svg
                                            className="size-2.5 fill-current bp360:size-2.75 bp400:size-3 md:size-3.75 lg:size-4 xl:size-4.25 2xl:size-4.5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 448 512"
                                        >
                                            <path d="M338.8-9.9c11.9 8.6 16.3 24.2 10.9 37.8L271.3 224 416 224c13.5 0 25.5 8.4 30.1 21.1s.7 26.9-9.6 35.5l-288 240c-11.3 9.4-27.4 9.9-39.3 1.3s-16.3-24.2-10.9-37.8L176.7 288 32 288c-13.5 0-25.5-8.4-30.1-21.1s-.7-26.9 9.6-35.5l288-240c11.3-9.4 27.4-9.9 39.3-1.3z" />
                                        </svg>
                                    </span>
                                    Cepat
                                </span>
                                <span className="flex animate-fade-up items-center gap-2 font-medium text-(--secondary) opacity-0 delay-800">
                                    <span className="inline-block rounded-full bg-white/30 p-1.5">
                                        <svg
                                            className="size-2.5 fill-current bp360:size-2.75 bp400:size-3 md:size-3.75 lg:size-4 xl:size-4.25 2xl:size-4.5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 640 512"
                                        >
                                            <path d="M415.9 210.5c12.2-3.3 25 2.5 30.5 13.8L465 261.9c10.3 1.4 20.4 4.2 29.9 8.1l35-23.3c10.5-7 24.4-5.6 33.3 3.3l19.2 19.2c8.9 8.9 10.3 22.9 3.3 33.3l-23.3 34.9c1.9 4.7 3.6 9.6 5 14.7 1.4 5.1 2.3 10.1 3 15.2l37.7 18.6c11.3 5.6 17.1 18.4 13.8 30.5l-7 26.2c-3.3 12.1-14.6 20.3-27.2 19.5l-42-2.7c-6.3 8.1-13.6 15.6-21.9 22l2.7 41.9c.8 12.6-7.4 24-19.5 27.2l-26.2 7c-12.2 3.3-24.9-2.5-30.5-13.8l-18.6-37.6c-10.3-1.4-20.4-4.2-29.9-8.1l-35 23.3c-10.5 7-24.4 5.6-33.3-3.3l-19.2-19.2c-8.9-8.9-10.3-22.8-3.3-33.3l23.3-35c-1.9-4.7-3.6-9.6-5-14.7s-2.3-10.2-3-15.2l-37.7-18.6c-11.3-5.6-17-18.4-13.8-30.5l7-26.2c3.3-12.1 14.6-20.3 27.2-19.5l41.9 2.7c6.3-8.1 13.6-15.6 21.9-22l-2.7-41.8c-.8-12.6 7.4-24 19.5-27.2l26.2-7zM448.4 340a44 44 0 1 0 .1 88 44 44 0 1 0 -.1-88zM224.9-45.5l26.2 7c12.1 3.3 20.3 14.7 19.5 27.2l-2.7 41.8c8.3 6.4 15.6 13.8 21.9 22l42-2.7c12.5-.8 23.9 7.4 27.2 19.5l7 26.2c3.2 12.1-2.5 24.9-13.8 30.5l-37.7 18.6c-.7 5.1-1.7 10.2-3 15.2s-3.1 10-5 14.7l23.3 35c7 10.5 5.6 24.4-3.3 33.3L307.3 262c-8.9 8.9-22.8 10.3-33.3 3.3L239 242c-9.5 3.9-19.6 6.7-29.9 8.1l-18.6 37.6c-5.6 11.3-18.4 17-30.5 13.8l-26.2-7c-12.2-3.3-20.3-14.7-19.5-27.2l2.7-41.9c-8.3-6.4-15.6-13.8-21.9-22l-42 2.7c-12.5 .8-23.9-7.4-27.2-19.5l-7-26.2c-3.2-12.1 2.5-24.9 13.8-30.5l37.7-18.6c.7-5.1 1.7-10.1 3-15.2 1.4-5.1 3-10 5-14.7L55.1 46.5c-7-10.5-5.6-24.4 3.3-33.3L77.6-6c8.9-8.9 22.8-10.3 33.3-3.3l35 23.3c9.5-3.9 19.6-6.7 29.9-8.1l18.6-37.6c5.6-11.3 18.3-17 30.5-13.8zM192.4 84a44 44 0 1 0 0 88 44 44 0 1 0 0-88z" />
                                        </svg>
                                    </span>
                                    Terintegrasi
                                </span>
                                <span className="flex animate-fade-up items-center gap-2 font-medium text-(--secondary) opacity-0 delay-1000">
                                    <span className="inline-block rounded-full bg-white/30 p-1.5">
                                        <svg
                                            className="size-2.5 fill-current bp360:size-2.75 bp400:size-3 md:size-3.75 lg:size-4 xl:size-4.25 2xl:size-4.5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 512 512"
                                        >
                                            <path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64L0 400c0 44.2 35.8 80 80 80l400 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 416c-8.8 0-16-7.2-16-16L64 64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7 262.6 153.4c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l73.4-73.4 57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z" />
                                        </svg>
                                    </span>
                                    Efisien
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex size-full flex-col lg:px-4 lg:pt-4">
                    <div className="mb-4 flex flex-col">
                        {/* <div className="flex flex-col gap-4">
                             <Link
                                href={home()}
                                className="flex flex-col items-center gap-2 font-medium"
                            >
                                <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                    <AppLogoIcon className="size-9 fill-current text-[var(--foreground)] dark:text-white" />
                                </div>
                                <span className="sr-only">{title}</span>
                            </Link>
                        </div> */}
                        <div className="mb-1 bp360:mb-1.25 bp400:mb-1.5 md:mb-1.75 lg:mb-2 xl:mb-2.25 2xl:mb-2.5">
                            <h1 className="t-size7 animate-fade-left font-bold text-(--primary)">
                                {title}
                            </h1>
                            <p className="t-size3 animate-fade-left font-medium text-(--font-color)/70 opacity-0 delay-500">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                    <span className="t-size1 mt-auto inline-block animate-fade-left font-medium text-(--font-color)/60 opacity-0 delay-700">
                        © 2026 Desa Utama | Created By Dandy Tr
                    </span>
                </div>
            </div>
        </div>
    );
}
