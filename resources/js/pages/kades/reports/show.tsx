import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, FileText, User } from 'lucide-react';

import { index as reportsIndexRoute } from '@/routes/kades/reports';

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

interface SubmissionData {
    id: number;
    submission_number: string;
    subject: string;
    description: string | null;
    status: string;
    source: string;
    notes: string | null;
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
    service?: {
        id: number;
        service_number: string;
        status: string;
        draft_content: string | null;
        result: string | null;
        notes: string | null;
        created_at: string;
        updated_at: string;
        assigned_to?: {
            name: string;
        };
        letter?: {
            id: number;
            letter_number: string;
            generated_at: string;
        };
    };
    service_logs?: ServiceLog[];
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'finished':
            return {
                label: 'Selesai',
                className: 'bg-green-100 text-green-700',
            };
        case 'rejected':
            return { label: 'Ditolak', className: 'bg-red-100 text-red-600' };
        case 'completed':
        case 'approved':
            return {
                label: 'Disetujui',
                className: 'bg-teal-100 text-teal-700',
            };
        case 'processing':
            return {
                label: 'Dalam Proses',
                className: 'bg-orange-100 text-orange-700',
            };
        case 'pending':
            return {
                label: 'Menunggu Verifikasi',
                className: 'bg-blue-100 text-blue-700',
            };
        case 'verified':
            return {
                label: 'Terverifikasi',
                className: 'bg-purple-100 text-purple-700',
            };
        case 'needs_correction':
            return {
                label: 'Perlu Perbaikan',
                className: 'bg-yellow-100 text-yellow-700',
            };
        default:
            return {
                label: status || '-',
                className: 'bg-stone-100 text-stone-600',
            };
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

export default function ReportsShow({
    submission,
}: {
    submission: SubmissionData;
}) {
    const resident = submission.resident;
    const service = submission.service;
    const letter = service?.letter;
    const logs = submission.service_logs || [];

    const overallStatus = service?.status || submission.status;
    const statusInfo = getStatusBadge(overallStatus);

    return (
        <>
            <Head title={`Detail Laporan - ${submission.submission_number}`} />

            <div className="flex flex-col gap-2 px-2 py-2 bp360:gap-2.25 bp360:px-2.25 bp400:gap-2.5 bp400:px-2.5 md:gap-2.75 md:px-3 md:py-2.25 lg:gap-3 lg:px-3.5 lg:py-2.5 xl:gap-3.5 xl:px-4 xl:py-3 2xl:gap-4 2xl:px-4.5 2xl:py-3.5">
                {/* Back button */}
                <div className="flex items-center gap-2">
                    <Link
                        href={reportsIndexRoute().url}
                        className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-(--primary) transition-all hover:bg-(--primary)/10"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali
                    </Link>
                </div>

                {/* Header */}
                <div className="rounded-lg bg-white p-4 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-full bg-(--primary)/10">
                                <FileText className="size-6 text-(--primary)" />
                            </div>
                            <div>
                                <h1 className="t-size5 font-bold text-(--primary)">
                                    {submission.submission_number}
                                </h1>
                                <p className="t-size2 text-stone-500">
                                    {submission.subject}
                                </p>
                            </div>
                        </div>
                        <span
                            className={`t-size2 w-fit rounded-full px-3 py-1.5 font-semibold ${statusInfo.className}`}
                        >
                            {statusInfo.label}
                        </span>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Left Column */}
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

                        {/* Data Pengajuan & Layanan */}
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
                                        {submission.submission_number}
                                    </div>
                                </div>
                                <div>
                                    <div className="t-size1 text-stone-500">
                                        Jenis Layanan
                                    </div>
                                    <div className="t-size2 font-semibold">
                                        {submission.type_service
                                            ?.service_name || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="t-size1 text-stone-500">
                                        Keperluan
                                    </div>
                                    <div className="t-size2 font-semibold">
                                        {submission.subject}
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
                                        Petugas Penanganan
                                    </div>
                                    <div className="t-size2 font-semibold">
                                        {service?.assigned_to?.name || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="t-size1 text-stone-500">
                                        Tanggal Pengajuan
                                    </div>
                                    <div className="t-size2 font-semibold">
                                        {new Date(
                                            submission.created_at,
                                        ).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </div>
                                </div>
                                {service?.updated_at && (
                                    <div>
                                        <div className="t-size1 text-stone-500">
                                            Tanggal Penyelesaian
                                        </div>
                                        <div className="t-size2 font-semibold">
                                            {service.status === 'finished'
                                                ? new Date(
                                                      service.updated_at,
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
                                )}
                                {letter && (
                                    <div>
                                        <div className="t-size1 text-stone-500">
                                            No. Surat
                                        </div>
                                        <div className="t-size2 font-mono font-semibold text-(--primary)">
                                            {letter.letter_number}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Timeline */}
                    <div className="flex flex-col gap-4">
                        {/* Surat Info */}
                        {letter && (
                            <div className="rounded-lg bg-white p-4 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-(--primary)/10">
                                        <CheckCircle2 className="size-4 text-(--primary)" />
                                    </div>
                                    <h2 className="t-size3 font-semibold text-(--primary)">
                                        Data Surat
                                    </h2>
                                </div>
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
                            </div>
                        )}

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
                                    {logs.map((log, idx) => (
                                        <div
                                            key={log.id}
                                            className="relative flex gap-3 pb-4"
                                        >
                                            {idx < logs.length - 1 && (
                                                <div className="absolute top-6 left-2.75 h-full w-0.5 bg-(--primary)/15" />
                                            )}
                                            <div className="relative z-10 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-(--primary)/30 bg-white">
                                                <div className="size-2 rounded-full bg-(--primary)" />
                                            </div>
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

ReportsShow.layout = {
    breadcrumbs: [
        {
            title: 'Laporan',
            href: reportsIndexRoute().url,
        },
        {
            title: 'Detail Laporan',
        },
    ],
};
