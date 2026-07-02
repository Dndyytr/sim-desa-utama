import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Download,
    FileText,
    FileUp,
    History,
    MapPin,
    RotateCcw,
    Tag,
    User as UserIcon,
    XCircle,
} from 'lucide-react';

import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { index as servicesIndexRoute } from '@/routes/kades/services';

interface ServiceLog {
    id: number;
    submission_id: number;
    stage: string;
    activity: string;
    notes: string | null;
    created_at: string;
    performer?: {
        id: number;
        name: string;
    };
}

interface Service {
    id: number;
    service_number: string;
    submission_id: number;
    status: 'processing' | 'approved' | 'completed' | 'rejected';
    notes: string | null;
    result: string | null;
    draft_content: string | null;
    created_at: string;
    updated_at: string;
    submission?: {
        id: number;
        submission_number: string;
        subject: string;
        description?: string;
        notes?: string;
        created_at: string;
        resident?: {
            id: number;
            nik: string;
            name: string;
            gender: string;
            religion: string;
            address: string;
            birth_place: string;
            birth_date: string;
        };
        type_service?: {
            id: number;
            service_code: string;
            service_name: string;
        };
        attachments?: Array<{
            id: number;
            file_name: string;
            file_path: string;
            file_type: string;
            file_size: number;
        }>;
        service_logs?: ServiceLog[];
    };
    assigned_to: {
        id: number;
        name: string;
    } | null;
}

export default function ServicesShow({ service }: { service: Service }) {
    const currentAssignedTo = service.assigned_to;

    const approvalForm = useForm({
        notes: '',
    });

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        approvalForm.patch(route('kades.services.approve', service.id), {
            preserveScroll: true,
        });
    };

    const handleRevise = (e: React.FormEvent) => {
        e.preventDefault();
        approvalForm.patch(route('kades.services.revise', service.id), {
            preserveScroll: true,
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        approvalForm.patch(route('kades.services.reject', service.id), {
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: Service['status']) => {
        switch (status) {
            case 'processing':
                return 'bg-amber-100 text-amber-800'; // Revisi
            case 'approved':
                return 'bg-indigo-100 text-indigo-800'; // Menunggu Persetujuan
            case 'completed':
                return 'bg-emerald-100 text-emerald-800'; // Disetujui
            case 'rejected':
                return 'bg-rose-100 text-rose-800'; // Ditolak
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: Service['status']) => {
        switch (status) {
            case 'processing':
                return 'Perlu Revisi';
            case 'approved':
                return 'Menunggu Persetujuan';
            case 'completed':
                return 'Disetujui';
            case 'rejected':
                return 'Ditolak';
            default:
                return status;
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) {
            return '0 B';
        }

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <>
            <Head title={`Persetujuan Layanan ${service.service_number}`} />

            <div className="flex h-full flex-col gap-2 px-2 py-2 bp360:gap-2.25 bp360:px-2.25 bp360:py-2.25 bp400:gap-2.5 bp400:px-2.5 bp400:py-2.5 md:gap-2.75 md:px-3 md:py-2.25 lg:gap-3 lg:px-3.5 lg:py-2.5 xl:gap-3.5 xl:px-4 xl:py-3 2xl:gap-4 2xl:px-4.5 2xl:py-3.5">
                {/* Manual Breadcrumb */}
                <div className="t-size2 font-medium text-stone-500">
                    Persetujuan Akhir &gt; Detail Persetujuan &gt;{' '}
                    {service.service_number}
                </div>

                {/* Header Card */}
                <div className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:flex-row md:items-center md:justify-between md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                    <div className="flex flex-col">
                        <span className="t-size1 font-semibold text-stone-400">
                            No. Pengajuan:{' '}
                            {service.submission?.submission_number}
                        </span>
                        <h1 className="t-size5 mt-0.5 font-bold text-(--primary)">
                            Layanan: {service.service_number}
                        </h1>
                        <span className="t-size2 mt-0.5 text-stone-500">
                            Masuk pada:{' '}
                            {new Date(service.created_at).toLocaleString(
                                'id-ID',
                                {
                                    dateStyle: 'long',
                                    timeStyle: 'short',
                                },
                            )}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`t-size2 rounded-full px-2.5 py-1 font-bold whitespace-nowrap bp360:px-3 bp360:py-1.5 ${getStatusBadge(
                                service.status,
                            )}`}
                        >
                            {getStatusLabel(service.status)}
                        </span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-2 bp400:gap-2.5 md:gap-3 lg:grid-cols-3">
                    {/* Left Column: Detail Permohonan & Service Logs */}
                    <div className="flex flex-col gap-2 bp400:gap-2.5 md:gap-3 lg:col-span-2">
                        {/* Detail Info Card */}
                        <div className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                            <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                <div className="grid size-8.25 shrink-0 place-items-center rounded-full bg-(--primary)/10 text-(--primary) bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                    <FileText className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                                </div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Detail Permohonan Layanan
                                </h2>
                            </div>

                            <div className="flex flex-col gap-2 bp400:gap-2.5">
                                <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                    <span className="t-size2 font-semibold text-stone-500">
                                        Jenis Layanan
                                    </span>
                                    <span className="t-size2 col-span-2 font-medium text-stone-800">
                                        {
                                            service.submission?.type_service
                                                ?.service_name
                                        }{' '}
                                        (
                                        {
                                            service.submission?.type_service
                                                ?.service_code
                                        }
                                        )
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 border-b pb-2">
                                    <span className="t-size2 font-semibold text-stone-500">
                                        Subjek / Judul
                                    </span>
                                    <span className="t-size2 col-span-2 font-bold text-(--primary)">
                                        {service.submission?.subject}
                                    </span>
                                </div>

                                <div className="mt-1 flex flex-col gap-1">
                                    <span className="t-size2 font-semibold text-stone-500">
                                        Keterangan / Deskripsi
                                    </span>
                                    <div className="t-size2 rounded-md border border-stone-200 bg-stone-50 p-2.5 font-medium whitespace-pre-line text-stone-800 bp360:p-3">
                                        {service.submission?.description || '-'}
                                    </div>
                                </div>

                                {service.submission?.notes && (
                                    <div className="mt-1 flex flex-col gap-1">
                                        <span className="t-size2 font-semibold text-stone-500">
                                            Catatan Verifikasi Berkas
                                        </span>
                                        <div className="t-size2 rounded-md border border-stone-200 bg-stone-50 p-2.5 font-medium text-stone-700 bp360:p-3">
                                            {service.submission.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hasil Proses Kasi & Draft Surat Card */}
                        <div className="flex flex-col gap-2 rounded-lg border border-indigo-50 bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                            <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                <div className="grid size-8.25 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600 bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                    <CheckCircle className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                                </div>
                                <h2 className="t-size3 font-semibold text-indigo-900">
                                    Hasil Pemeriksaan & Draft Surat
                                </h2>
                            </div>

                            <div className="mt-2 flex flex-col gap-3">
                                <div className="flex flex-col border-b pb-2">
                                    <span className="t-size1 font-semibold text-stone-400">
                                        PETUGAS PEMROSES (KASI/KAUR)
                                    </span>
                                    <span className="t-size2 mt-0.5 font-bold text-stone-800">
                                        {currentAssignedTo?.name ||
                                            'Belum Ditugaskan'}
                                    </span>
                                </div>

                                <div className="flex flex-col border-b pb-2">
                                    <span className="t-size1 font-semibold text-stone-400">
                                        HASIL PEMERIKSAAN / KETERANGAN PROSES
                                    </span>
                                    <span className="t-size2 mt-1 font-medium whitespace-pre-wrap text-stone-800">
                                        {service.result || '-'}
                                    </span>
                                </div>

                                <div className="flex flex-col border-b pb-2">
                                    <span className="t-size1 font-semibold text-stone-400">
                                        CATATAN PROSES
                                    </span>
                                    <span className="t-size2 mt-1 font-medium whitespace-pre-wrap text-stone-800">
                                        {service.notes || '-'}
                                    </span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="t-size1 font-semibold text-stone-400">
                                        DRAFT SURAT PELAYANAN
                                    </span>
                                    <pre className="t-size2 mt-1.5 max-h-96 overflow-auto rounded border border-stone-200 bg-stone-50 p-3 font-mono whitespace-pre-wrap">
                                        {service.draft_content || '-'}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Keputusan Kepala Desa Form */}
                        {service.status === 'approved' && (
                            <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50/5 bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                    <div className="grid size-8.25 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700 bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                        <Tag className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                                    </div>
                                    <h2 className="t-size3 font-semibold text-amber-900">
                                        Keputusan Kepala Desa (Persetujuan
                                        Akhir)
                                    </h2>
                                </div>

                                <div className="mt-2 flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Label
                                            htmlFor="kades_notes"
                                            className="t-size3 font-semibold text-stone-700"
                                        >
                                            Catatan / Alasan Keputusan{' '}
                                            <span className="font-normal text-red-400">
                                                (Wajib jika Revisi / Tolak)
                                            </span>
                                        </Label>
                                        <Textarea
                                            id="kades_notes"
                                            value={approvalForm.data.notes}
                                            onChange={(e) =>
                                                approvalForm.setData(
                                                    'notes',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Masukkan catatan persetujuan, instruksi revisi, atau alasan penolakan..."
                                            rows={4}
                                            className="t-size3 border-stone-200 focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <InputError
                                            message={approvalForm.errors.notes}
                                        />
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center gap-3 border-t pt-3">
                                        <Button
                                            type="button"
                                            onClick={handleApprove}
                                            disabled={approvalForm.processing}
                                            className="t-size3 bg-emerald-600 font-bold text-white transition-all hover:bg-emerald-700"
                                        >
                                            <CheckCircle className="mr-1.5 size-4" />
                                            Setujui & Terbitkan
                                        </Button>

                                        <Button
                                            type="button"
                                            onClick={handleRevise}
                                            disabled={approvalForm.processing}
                                            className="t-size3 bg-amber-500 font-bold text-white transition-all hover:bg-amber-600"
                                        >
                                            <RotateCcw className="mr-1.5 size-4" />
                                            Minta Revisi
                                        </Button>

                                        <Button
                                            type="button"
                                            onClick={handleReject}
                                            disabled={approvalForm.processing}
                                            className="t-size3 bg-rose-600 font-bold text-white transition-all hover:bg-rose-700"
                                        >
                                            <XCircle className="mr-1.5 size-4" />
                                            Tolak Layanan
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Attachments Card */}
                        <div className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                            <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                <div className="grid size-8.25 shrink-0 place-items-center rounded-full bg-(--primary)/10 text-(--primary) bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                    <FileUp className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                                </div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Dokumen Lampiran (
                                    {service.submission?.attachments?.length ||
                                        0}
                                    )
                                </h2>
                            </div>

                            <div>
                                {service.submission?.attachments &&
                                service.submission.attachments.length > 0 ? (
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {service.submission.attachments.map(
                                            (file) => (
                                                <div
                                                    key={file.id}
                                                    className="flex items-center justify-between gap-2 rounded-lg border border-(--primary)/10 bg-stone-50 p-2.5 transition-all duration-300 hover:bg-stone-100 bp360:p-3"
                                                >
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <FileText className="size-5 shrink-0 text-stone-500" />
                                                        <div className="flex min-w-0 flex-col">
                                                            <span
                                                                className="t-size2 truncate font-semibold text-stone-700"
                                                                title={
                                                                    file.file_name
                                                                }
                                                            >
                                                                {file.file_name}
                                                            </span>
                                                            <span className="t-size1 text-stone-400">
                                                                {formatSize(
                                                                    file.file_size,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <a
                                                        href={`/storage/${file.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary) transition-all hover:bg-(--primary) hover:text-white bp360:size-7.5 bp400:size-8"
                                                        title="Download Lampiran"
                                                    >
                                                        <Download className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4" />
                                                    </a>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="t-size2 text-stone-500 italic">
                                        Tidak ada lampiran dokumen pendukung.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Service Logs Card */}
                        <div className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                            <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                <div className="grid size-8.25 shrink-0 place-items-center rounded-full bg-(--primary)/10 text-(--primary) bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                    <History className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                                </div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Riwayat Proses Layanan (Service Logs)
                                </h2>
                            </div>

                            <div className="relative mt-2 flex flex-col gap-4 border-l border-(--primary)/20 pl-4">
                                {service.submission?.service_logs &&
                                service.submission.service_logs.length > 0 ? (
                                    service.submission.service_logs.map(
                                        (log) => (
                                            <div
                                                key={log.id}
                                                className="relative"
                                            >
                                                {/* Bullet dot */}
                                                <span className="absolute top-1.5 -left-5.25 size-2.5 rounded-full border-2 border-white bg-(--primary) ring-2 ring-(--primary)/30"></span>

                                                <div className="flex flex-col">
                                                    <div className="flex flex-wrap items-baseline gap-x-2">
                                                        <span className="t-size3 font-bold text-stone-800">
                                                            {log.activity}
                                                        </span>
                                                        <span className="t-size1 rounded bg-stone-100 px-1.5 py-0.5 font-semibold text-stone-600">
                                                            {log.stage}
                                                        </span>
                                                    </div>
                                                    <span className="t-size1 mt-0.5 inline-flex items-center gap-1.5 font-medium text-stone-400">
                                                        <Calendar className="size-3" />
                                                        {new Date(
                                                            log.created_at,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                            {
                                                                dateStyle:
                                                                    'medium',
                                                                timeStyle:
                                                                    'short',
                                                            },
                                                        )}{' '}
                                                        • Oleh:{' '}
                                                        {log.performer?.name ||
                                                            'Sistem'}
                                                    </span>
                                                    {log.notes && (
                                                        <p className="t-size2 mt-1 rounded border bg-stone-50/50 p-2 font-medium whitespace-pre-wrap text-stone-600">
                                                            {log.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <div className="relative">
                                        <span className="absolute top-1.5 -left-5.25 size-2.5 rounded-full border-2 border-white bg-stone-300 ring-2 ring-stone-200"></span>
                                        <p className="t-size2 font-medium text-stone-500 italic">
                                            Tidak ada riwayat aktivitas yang
                                            tercatat.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Profile Pemohon & Petugas */}
                    <div className="flex flex-col gap-2 bp400:gap-2.5 md:gap-3">
                        {/* Profile Card */}
                        <div className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                            <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                <div className="grid size-8.25 shrink-0 place-items-center rounded-full bg-(--primary)/10 text-(--primary) bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                    <UserIcon className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                                </div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Profil Pemohon
                                </h2>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col border-b pb-1.5">
                                    <span className="t-size1 font-semibold text-stone-400">
                                        NAMA LENGKAP
                                    </span>
                                    <span className="t-size2 font-bold text-stone-800">
                                        {service.submission?.resident?.name}
                                    </span>
                                </div>

                                <div className="flex flex-col border-b pb-1.5">
                                    <span className="t-size1 font-semibold text-stone-400">
                                        NIK
                                    </span>
                                    <span className="t-size2 font-semibold text-(--primary)">
                                        {service.submission?.resident?.nik}
                                    </span>
                                </div>

                                <div className="flex flex-col border-b pb-1.5">
                                    <span className="t-size1 font-semibold text-stone-400">
                                        TEMPAT / TANGGAL LAHIR
                                    </span>
                                    <span className="t-size2 font-medium text-stone-700">
                                        {
                                            service.submission?.resident
                                                ?.birth_place
                                        }
                                        ,{' '}
                                        {service.submission?.resident
                                            ?.birth_date
                                            ? new Date(
                                                  service.submission.resident
                                                      .birth_date,
                                              ).toLocaleDateString('id-ID', {
                                                  dateStyle: 'medium',
                                              })
                                            : '-'}
                                    </span>
                                </div>

                                <div className="flex flex-col border-b pb-1.5">
                                    <span className="t-size1 font-semibold text-stone-400">
                                        JENIS KELAMIN / AGAMA
                                    </span>
                                    <span className="t-size2 font-medium text-stone-700">
                                        {service.submission?.resident?.gender} /{' '}
                                        {service.submission?.resident?.religion}
                                    </span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="t-size1 font-semibold text-stone-400">
                                        ALAMAT TINGGAL
                                    </span>
                                    <span className="t-size2 flex items-start gap-1 font-medium text-stone-700">
                                        <MapPin className="mt-0.5 size-3.5 shrink-0 text-stone-400" />
                                        {service.submission?.resident
                                            ?.address || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back & Actions Button Footer */}
                <div className="mt-auto flex flex-wrap justify-between gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                    <Link
                        href={route('kades.services.index')}
                        className={cn(
                            buttonVariants({ variant: 'ghost' }),
                            't-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none',
                        )}
                    >
                        <ArrowLeft className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                        Kembali
                    </Link>
                </div>
            </div>
        </>
    );
}

ServicesShow.layout = {
    breadcrumbs: [
        {
            title: 'Persetujuan Akhir',
            href: servicesIndexRoute().url,
        },
    ],
};
