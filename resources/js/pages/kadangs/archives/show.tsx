import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    Printer,
    User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index as archivesIndexRoute } from '@/routes/kadangs/archives';

interface ServiceLog {
    id: number;
    stage: string;
    activity: string;
    notes: string | null;
    created_at: string;
    performer?: {
        name: string;
    };
}

interface ArchiveData {
    id: number;
    archive_number: string;
    status: 'aktif' | 'ditutup' | 'retensi';
    archived_at: string;
    archivist?: {
        name: string;
    };
    service?: {
        id: number;
        service_number: string;
        status: string;
        draft_content: string | null;
        notes: string | null;
        created_at: string;
        updated_at: string;
        submission?: {
            id: number;
            submission_number: string;
            subject: string;
            description: string | null;
            created_at: string;
            resident?: {
                name: string;
                nik: string;
                no_kk: string;
                address: string | null;
            };
            type_service?: {
                service_name: string;
            };
            service_logs?: ServiceLog[];
        };
        letter?: {
            id: number;
            letter_number: string;
            file_path: string;
            generated_at: string;
        };
    };
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'aktif':
            return 'bg-(--primary)/10 text-(--primary)';
        case 'ditutup':
            return 'bg-red-100 text-red-600';
        case 'retensi':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-(--primary)/10 text-(--primary)';
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'aktif':
            return 'Aktif';
        case 'ditutup':
            return 'Ditutup';
        case 'retensi':
            return 'Retensi';
        default:
            return status;
    }
}

function getStageColor(stage: string) {
    switch (stage) {
        case 'Verification':
            return 'border-blue-400 bg-blue-50';
        case 'Disposition':
            return 'border-purple-400 bg-purple-50';
        case 'Processing':
            return 'border-orange-400 bg-orange-50';
        case 'Approval':
            return 'border-teal-400 bg-teal-50';
        case 'Finished':
            return 'border-green-400 bg-green-50';
        case 'Archived':
            return 'border-stone-400 bg-stone-50';
        default:
            return 'border-stone-300 bg-stone-50';
    }
}

export default function ArchivesShow({ archive }: { archive: ArchiveData }) {
    const service = archive.service;
    const submission = service?.submission;
    const resident = submission?.resident;
    const letter = service?.letter;
    const logs = submission?.service_logs || [];

    const handleStatusChange = (value: string) => {
        router.put(
            route('kadangs.archives.update', archive.id),
            { status: value },
            { preserveScroll: true },
        );
    };

    const handlePrint = () => {
        if (letter) {
            window.open(`/files/letters/${letter.id}/print`, '_blank');
        }
    };

    return (
        <>
            <Head title={`Detail Arsip - ${archive.archive_number}`} />

            <div className="flex flex-col gap-2 px-2 py-2 bp360:gap-2.25 bp360:px-2.25 bp400:gap-2.5 bp400:px-2.5 md:gap-2.75 md:px-3 md:py-2.25 lg:gap-3 lg:px-3.5 lg:py-2.5 xl:gap-3.5 xl:px-4 xl:py-3 2xl:gap-4 2xl:px-4.5 2xl:py-3.5">
                {/* Back button */}
                <div className="flex items-center gap-2">
                    <Link
                        href={archivesIndexRoute().url}
                        className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-(--primary) transition-all hover:bg-(--primary)/10"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali
                    </Link>
                </div>

                {/* Archive Header */}
                <div className="rounded-lg bg-white p-4 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-full bg-(--primary)/10">
                                <Archive className="size-6 text-(--primary)" />
                            </div>
                            <div>
                                <h1 className="t-size5 font-bold text-(--primary)">
                                    {archive.archive_number}
                                </h1>
                                <p className="t-size2 text-stone-500">
                                    Diarsipkan pada{' '}
                                    {archive.archived_at
                                        ? new Date(
                                              archive.archived_at,
                                          ).toLocaleDateString('id-ID', {
                                              day: 'numeric',
                                              month: 'long',
                                              year: 'numeric',
                                          })
                                        : '-'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`t-size2 rounded-full px-3 py-1.5 font-semibold ${getStatusBadge(archive.status)}`}
                            >
                                {getStatusLabel(archive.status)}
                            </span>
                            <Select
                                value={archive.status}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="t-size2 w-auto gap-1.5 border-(--primary)/30 bg-(--primary)/5 font-medium text-(--primary)">
                                    <SelectValue placeholder="Ubah Status" />
                                </SelectTrigger>
                                <SelectContent className="t-size2 border-(--primary)/60 bg-yellow-100">
                                    <SelectGroup>
                                        <SelectItem value="aktif">
                                            Aktif
                                        </SelectItem>
                                        <SelectItem value="ditutup">
                                            Ditutup
                                        </SelectItem>
                                        <SelectItem value="retensi">
                                            Retensi
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Left Column: Data Pemohon & Pengajuan */}
                    <div className="flex flex-col gap-4">
                        {/* Data Pemohon */}
                        <div className="rounded-lg bg-white p-4 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-full bg-(--primary)/10">
                                    <User className="size-4 text-(--primary)" />
                                </div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Data Pemohon
                                </h2>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <div className="t-size1 text-stone-500">
                                        Nama
                                    </div>
                                    <div className="t-size2 font-semibold">
                                        {resident?.name || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="t-size1 text-stone-500">
                                        NIK
                                    </div>
                                    <div className="t-size2 font-mono font-semibold">
                                        {resident?.nik || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="t-size1 text-stone-500">
                                        No. KK
                                    </div>
                                    <div className="t-size2 font-mono font-semibold">
                                        {resident?.no_kk || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="t-size1 text-stone-500">
                                        Alamat
                                    </div>
                                    <div className="t-size2 font-semibold">
                                        {resident?.address || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Pengajuan */}
                        <div className="rounded-lg bg-white p-4 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-full bg-(--primary)/10">
                                    <FileText className="size-4 text-(--primary)" />
                                </div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Data Pengajuan & Layanan
                                </h2>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <div className="t-size1 text-stone-500">
                                        No. Registrasi
                                    </div>
                                    <div className="t-size2 font-semibold">
                                        {submission?.submission_number || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="t-size1 text-stone-500">
                                        Jenis Layanan
                                    </div>
                                    <div className="t-size2 font-semibold">
                                        {submission?.type_service
                                            ?.service_name || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="t-size1 text-stone-500">
                                        Keperluan
                                    </div>
                                    <div className="t-size2 font-semibold">
                                        {submission?.subject || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="t-size1 text-stone-500">
                                        No. Layanan
                                    </div>
                                    <div className="t-size2 font-semibold text-(--primary)">
                                        {service?.service_number || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="t-size1 text-stone-500">
                                        Status Layanan
                                    </div>
                                    <div className="t-size2 font-semibold">
                                        <span className="rounded-full bg-green-100 px-2 py-1 text-green-800">
                                            Selesai
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="t-size1 text-stone-500">
                                        Tanggal Pengajuan
                                    </div>
                                    <div className="t-size2 font-semibold">
                                        {submission?.created_at
                                            ? new Date(
                                                  submission.created_at,
                                              ).toLocaleDateString('id-ID', {
                                                  day: 'numeric',
                                                  month: 'long',
                                                  year: 'numeric',
                                              })
                                            : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Surat & Timeline */}
                    <div className="flex flex-col gap-4">
                        {/* Data Surat */}
                        <div className="rounded-lg bg-white p-4 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-full bg-(--primary)/10">
                                    <CheckCircle2 className="size-4 text-(--primary)" />
                                </div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Data Surat
                                </h2>
                            </div>
                            {letter ? (
                                <>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <div className="t-size1 text-stone-500">
                                                No. Surat
                                            </div>
                                            <div className="t-size2 font-mono font-semibold text-(--primary)">
                                                {letter.letter_number}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="t-size1 text-stone-500">
                                                Jenis Surat
                                            </div>
                                            <div className="t-size2 font-semibold">
                                                {submission?.type_service
                                                    ?.service_name || '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="t-size1 text-stone-500">
                                                Tanggal Terbit
                                            </div>
                                            <div className="t-size2 font-semibold">
                                                {letter.generated_at
                                                    ? new Date(
                                                          letter.generated_at,
                                                      ).toLocaleDateString(
                                                          'id-ID',
                                                          {
                                                              day: 'numeric',
                                                              month: 'long',
                                                              year: 'numeric',
                                                          },
                                                      )
                                                    : '-'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Button
                                            onClick={handlePrint}
                                            className="t-size2 gap-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none"
                                        >
                                            <Printer className="size-4" />
                                            Cetak Ulang
                                        </Button>
                                        <a
                                            href={`/files/letters/${letter.id}/download`}
                                            className="inline-flex items-center gap-1 rounded-md border-[1.7px] border-(--primary)/50 bg-(--primary)/10 px-3 py-2 text-sm font-medium text-(--primary) transition-all duration-300 hover:-translate-y-0.5 hover:border-(--primary)/70 hover:bg-(--primary)/20 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none"
                                        >
                                            <Download className="size-4" />
                                            Unduh PDF
                                        </a>
                                    </div>
                                </>
                            ) : (
                                <p className="t-size2 text-stone-500">
                                    Surat belum tersedia.
                                </p>
                            )}
                        </div>

                        {/* Riwayat Proses */}
                        <div className="rounded-lg bg-white p-4 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-full bg-(--primary)/10">
                                    <Clock className="size-4 text-(--primary)" />
                                </div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Riwayat Proses
                                </h2>
                            </div>
                            {logs.length > 0 ? (
                                <div className="relative space-y-0">
                                    {logs.map((log, index) => (
                                        <div
                                            key={log.id}
                                            className="relative flex gap-3 pb-4"
                                        >
                                            {/* Timeline Line */}
                                            {index < logs.length - 1 && (
                                                <div className="absolute top-6 left-[11px] h-full w-0.5 bg-(--primary)/15" />
                                            )}
                                            {/* Timeline Dot */}
                                            <div className="relative z-10 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-(--primary)/30 bg-white">
                                                <div className="size-2 rounded-full bg-(--primary)" />
                                            </div>
                                            {/* Content */}
                                            <div
                                                className={`flex-1 rounded-lg border-l-4 p-3 ${getStageColor(log.stage)}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="t-size2 font-semibold text-(--font-color)">
                                                        {log.stage}
                                                    </span>
                                                    <span className="t-size1 text-stone-400">
                                                        {new Date(
                                                            log.created_at,
                                                        ).toLocaleDateString(
                                                            'id-ID',
                                                            {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="t-size2 mt-0.5 text-(--font-color)">
                                                    {log.activity}
                                                </p>
                                                {log.notes && (
                                                    <p className="t-size1 mt-1 text-stone-500 italic">
                                                        {log.notes}
                                                    </p>
                                                )}
                                                {log.performer && (
                                                    <p className="t-size1 mt-1 font-medium text-(--primary)">
                                                        Oleh:{' '}
                                                        {log.performer.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="t-size2 text-stone-500">
                                    Tidak ada riwayat proses.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ArchivesShow.layout = {
    breadcrumbs: [
        {
            title: 'Arsip Layanan',
            href: archivesIndexRoute().url,
        },
        {
            title: 'Detail Arsip',
        },
    ],
};
