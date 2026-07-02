import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, FileText, Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface Service {
    id: number;
    service_number: string;
    status: string;
    draft_content: string | null;
    result: string | null;
    notes: string | null;
    submission?: {
        submission_number: string;
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
}

export default function LettersCreate({
    service,
    previewLetterNumber,
}: {
    service: Service;
    previewLetterNumber: string;
}) {
    const { post, processing } = useForm({
        service_id: service.id,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('kadangs.letters.store'));
    };

    return (
        <>
            <Head title="Generate Surat Resmi" />

            <div className="mx-auto flex max-w-5xl flex-col gap-4 px-3 py-4 md:px-6 md:py-6">
                {/* Back Link */}
                <div>
                    <Link
                        href={route('kadangs.letters.index')}
                        className="inline-flex items-center gap-1 text-sm font-medium text-(--primary) hover:underline"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali ke Daftar Layanan
                    </Link>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-1.5 border-b border-(--primary)/20 pb-4">
                    <h1 className="flex items-center gap-2 text-xl font-bold text-(--primary) md:text-2xl">
                        <Printer className="size-6 animate-pulse text-emerald-600" />
                        Generate Surat Resmi Desa
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Tinjau data layanan dan pratinjau draft surat sebelum
                        menerbitkan surat resmi.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Data Details & Actions */}
                    <div className="flex flex-col gap-6 md:col-span-1">
                        {/* Info Card */}
                        <div className="rounded-xl border border-(--primary)/20 bg-yellow-50/50 p-4 shadow-sm">
                            <h2 className="mb-3 text-sm font-bold tracking-wider text-(--primary) uppercase">
                                Data Layanan
                            </h2>
                            <div className="flex flex-col gap-3 text-sm">
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Nomor Layanan
                                    </div>
                                    <div className="font-semibold text-(--primary)">
                                        {service.service_number}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Jenis Layanan
                                    </div>
                                    <div className="font-semibold text-(--primary)">
                                        {
                                            service.submission?.type_service
                                                ?.service_name
                                        }
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Nama Pemohon
                                    </div>
                                    <div className="font-semibold text-(--primary)">
                                        {service.submission?.resident?.name}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        NIK Pemohon
                                    </div>
                                    <div className="font-mono text-xs font-semibold text-(--primary)">
                                        {service.submission?.resident?.nik}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Nomor Kartu Keluarga
                                    </div>
                                    <div className="font-mono text-xs font-semibold text-(--primary)">
                                        {service.submission?.resident?.no_kk ||
                                            '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Approval Info */}
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/30 p-4 shadow-sm">
                            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold tracking-wider text-emerald-800 uppercase">
                                <CheckCircle2 className="size-4 text-emerald-600" />
                                Persetujuan Kades
                            </h2>
                            <div className="flex flex-col gap-2.5 text-sm">
                                <div>
                                    <div className="text-xs font-medium text-emerald-700">
                                        Catatan Persetujuan
                                    </div>
                                    <div className="mt-1 rounded-lg border border-emerald-100 bg-emerald-50 p-2.5 text-emerald-900 italic">
                                        "
                                        {service.notes ||
                                            'Tidak ada catatan persetujuan.'}
                                        "
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Box */}
                        <div className="flex flex-col gap-3 rounded-xl border border-(--primary)/20 bg-yellow-50/50 p-4 shadow-sm">
                            <h2 className="text-sm font-bold tracking-wider text-(--primary) uppercase">
                                Terbitkan Surat
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Pastikan nomor surat dan draft isi di sebelah
                                kanan sudah benar.
                            </p>
                            <form onSubmit={handleSubmit} className="mt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full items-center justify-center gap-1.5 bg-emerald-600 py-5 font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98]"
                                >
                                    <Printer className="size-4" />
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Generate & Terbitkan'}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Letter Sheet Preview */}
                    <div className="flex flex-col gap-4 md:col-span-2">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-(--primary)">
                            <FileText className="size-4 text-(--primary)" />
                            Pratinjau Cetak Surat Resmi
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
                                        service.submission?.type_service
                                            ?.service_name
                                    }
                                </h4>
                                <p className="m-0 mt-0.5 text-xs">
                                    Nomor:{' '}
                                    <span className="font-semibold">
                                        {previewLetterNumber}
                                    </span>
                                </p>
                            </div>

                            {/* Letter Content HTML */}
                            <div
                                className="prose max-w-none text-justify text-sm leading-relaxed whitespace-pre-line"
                                dangerouslySetInnerHTML={{
                                    __html: service.draft_content || '',
                                }}
                            />

                            {/* Signature Block */}
                            <div className="mt-12 flex justify-end">
                                <div className="w-48 text-center text-sm">
                                    <p>
                                        Utama,{' '}
                                        {new Date().toLocaleDateString(
                                            'id-ID',
                                            {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            },
                                        )}
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
