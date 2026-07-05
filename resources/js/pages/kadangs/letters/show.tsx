import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Download,
    FileText,
    Printer,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface Letter {
    id: number;
    letter_number: string;
    file_path: string;
    generated_at: string;
    service?: {
        id: number;
        service_number: string;
        draft_content: string | null;
        notes: string | null;
        submission?: {
            subject: string;
            resident?: {
                name: string;
                nik: string;
                no_kk: string;
            };
            type_service?: {
                service_name: string;
            };
        };
    };
    generator?: {
        name: string;
    };
}

export default function LettersShow({ letter }: { letter: Letter }) {
    const service = letter.service;

    const handlePrint = () => {
        if (letter) {
            window.open(`/files/letters/${letter.id}/print`, '_blank');
        }
    };

    return (
        <>
            <Head title={`Detail Surat - ${letter.letter_number}`} />

            <div className="mx-auto flex max-w-5xl flex-col gap-4 px-3 py-4 md:px-6 md:py-6">
                {/* Back Link */}
                <div>
                    <Link
                        href={route('kadangs.letters.index')}
                        className="inline-flex items-center gap-1 text-sm font-medium text-(--primary) hover:underline"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali ke Daftar Surat
                    </Link>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-1.5 border-b border-(--primary)/20 pb-4 md:flex-row md:items-center md:justify-between md:gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="flex items-center gap-2 text-xl font-bold text-(--primary) md:text-2xl">
                            <CheckCircle2 className="size-6 text-green-600" />
                            Surat Resmi Berhasil Diterbitkan
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Surat resmi telah dibuat secara sah dan tersimpan di
                            dalam sistem.
                        </p>
                    </div>
                    <div className="mt-2 flex items-center gap-2 md:mt-0">
                        <Button
                            onClick={handlePrint}
                            className="t-size3 flex items-center gap-1.5 border border-(--primary)/50 bg-yellow-50 px-4 py-4.5 font-semibold text-(--primary) shadow-sm hover:bg-yellow-100"
                        >
                            <Printer className="size-4" />
                            Cetak Surat
                        </Button>
                        <a
                            href={`/files/letters/${letter.id}/download`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98]"
                        >
                            <Download className="size-4" />
                            Unduh PDF
                        </a>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Metadata Details */}
                    <div className="flex flex-col gap-6 md:col-span-1">
                        {/* Info Card */}
                        <div className="rounded-xl border border-(--primary)/20 bg-yellow-50/50 p-4 shadow-sm">
                            <h2 className="mb-3 text-sm font-bold tracking-wider text-(--primary) uppercase">
                                Informasi Surat
                            </h2>
                            <div className="flex flex-col gap-3 text-sm">
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Nomor Surat
                                    </div>
                                    <div className="font-mono font-semibold text-(--primary)">
                                        {letter.letter_number}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Jenis Surat
                                    </div>
                                    <div className="font-semibold text-(--primary)">
                                        Surat Keterangan{' '}
                                        {
                                            service?.submission?.type_service
                                                ?.service_name
                                        }
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Tanggal Diterbitkan
                                    </div>
                                    <div className="font-semibold text-(--primary)">
                                        {new Date(
                                            letter.generated_at,
                                        ).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}{' '}
                                        WIB
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Diterbitkan Oleh
                                    </div>
                                    <div className="font-semibold text-(--primary)">
                                        {letter.generator?.name}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Status Layanan
                                    </div>
                                    <div>
                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                                            Selesai (Archived)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resident Info Card */}
                        <div className="rounded-xl border border-(--primary)/20 bg-yellow-50/50 p-4 shadow-sm">
                            <h2 className="mb-3 text-sm font-bold tracking-wider text-(--primary) uppercase">
                                Data Pemohon
                            </h2>
                            <div className="flex flex-col gap-3 text-sm">
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Nama Pemohon
                                    </div>
                                    <div className="font-semibold text-(--primary)">
                                        {service?.submission?.resident?.name}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        NIK Pemohon
                                    </div>
                                    <div className="font-mono text-xs font-semibold text-(--primary)">
                                        {service?.submission?.resident?.nik}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Nomor Kartu Keluarga
                                    </div>
                                    <div className="font-mono text-xs font-semibold text-(--primary)">
                                        {service?.submission?.resident?.no_kk ||
                                            '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Letter Sheet Preview */}
                    <div className="flex flex-col gap-4 md:col-span-2">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-(--primary)">
                            <FileText className="size-4 text-(--primary)" />
                            Isi Surat Resmi
                        </div>

                        {/* White paper page container */}
                        <div
                            className="relative mx-auto aspect-[1/1.41] w-full max-w-2xl overflow-y-auto rounded-lg border border-gray-300 bg-white p-6 text-black shadow-lg md:p-12"
                            style={{ fontFamily: 'Arial, sans-serif' }}
                        >
                            {/* Letter Header */}
                            <div className="mb-6 border-b-[3px] border-black pb-2 text-center">
                                <h3 className="m-0 text-base leading-tight font-bold tracking-wide uppercase">
                                    Pemerintah Kabupaten Utama
                                </h3>
                                <h3 className="m-0 text-base leading-tight font-bold tracking-wide uppercase">
                                    Kecamatan Desa Utama
                                </h3>
                                <h2 className="m-0 mt-0.5 text-lg leading-normal font-bold tracking-wide uppercase">
                                    Kantor Kepala Desa Utama
                                </h2>
                                <p className="m-0 mt-1 text-[10px] italic">
                                    Jl. Raya Utama No. 1, Desa Utama, Kode Pos
                                    12345
                                </p>
                            </div>

                            {/* Letter Title & Number */}
                            <div className="mb-6 text-center">
                                <h4 className="m-0 text-sm font-bold tracking-wider uppercase underline">
                                    SURAT KETERANGAN{' '}
                                    {
                                        service?.submission?.type_service
                                            ?.service_name
                                    }
                                </h4>
                                <p className="m-0 mt-0.5 text-xs">
                                    Nomor:{' '}
                                    <span className="font-semibold">
                                        {letter.letter_number}
                                    </span>
                                </p>
                            </div>

                            {/* Letter Content HTML */}
                            <div
                                className="prose max-w-none text-justify text-sm leading-relaxed whitespace-pre-line"
                                dangerouslySetInnerHTML={{
                                    __html: service?.draft_content || '',
                                }}
                            />

                            {/* Signature Block */}
                            <div className="mt-12 flex justify-end">
                                <div className="w-48 text-center text-sm">
                                    <p>
                                        Utama,{' '}
                                        {new Date(
                                            letter.generated_at,
                                        ).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                    <p>Kepala Desa Utama</p>
                                    <div className="h-20"></div>
                                    <p className="font-bold underline">
                                        Kepala Desa Utama
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
