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
    Tag,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { index as servicesIndexRoute } from '@/routes/kadangs/services';

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
    status: 'processing' | 'approved' | 'completed';
    notes: string | null;
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
    const [isProcessOpen, setIsProcessOpen] = useState(false);

    const currentAssignedTo = service.assigned_to;

    const processForm = useForm({
        notes: '',
    });

    const handleProcessSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        processForm.patch(route('kadangs.services.process', service.id), {
            onSuccess: () => {
                setIsProcessOpen(false);
            },
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: Service['status']) => {
        switch (status) {
            case 'processing':
                return 'bg-indigo-100 text-indigo-800';
            case 'approved':
                return 'bg-emerald-100 text-emerald-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: Service['status']) => {
        switch (status) {
            case 'processing':
                return 'Diproses';
            case 'approved':
                return 'Disetujui';
            case 'completed':
                return 'Selesai';
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
            <Head title={`Detail Layanan ${service.service_number}`} />

            <div className="flex h-full flex-col gap-2 px-2 py-2 bp360:gap-2.25 bp360:px-2.25 bp360:py-2.25 bp400:gap-2.5 bp400:px-2.5 bp400:py-2.5 md:gap-2.75 md:px-3 md:py-2.25 lg:gap-3 lg:px-3.5 lg:py-2.5 xl:gap-3.5 xl:px-4 xl:py-3 2xl:gap-4 2xl:px-4.5 2xl:py-3.5">
                {/* Manual Breadcrumb */}
                <div className="t-size2 font-medium text-stone-500">
                    Kelola Layanan &gt; Detail Layanan &gt;{' '}
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
                                { dateStyle: 'long', timeStyle: 'short' },
                            )}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`t-size2 rounded-full px-2.5 py-1 font-bold whitespace-nowrap bp360:px-3 bp360:py-1.5 ${getStatusBadge(service.status)}`}
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

                                {service.notes && (
                                    <div className="mt-1 flex flex-col gap-1">
                                        <span className="t-size2 font-semibold text-stone-500">
                                            Catatan / Instruksi Pemrosesan
                                        </span>
                                        <div className="t-size2 rounded-md border border-amber-200 bg-yellow-50 p-2.5 font-medium text-amber-800 bp360:p-3">
                                            {service.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

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
                                        NIK (NOMOR INDUK KEPENDUDUKAN)
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

                        {/* Officer Info Card */}
                        <div className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                            <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                <div className="grid size-8.25 shrink-0 place-items-center rounded-full bg-(--primary)/10 text-(--primary) bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                    <Tag className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                                </div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Petugas Pemroses
                                </h2>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col">
                                    <span className="t-size1 font-semibold text-stone-400">
                                        DITUGASKAN KEPADA
                                    </span>
                                    {currentAssignedTo ? (
                                        <span className="t-size2 font-semibold text-stone-800">
                                            {currentAssignedTo.name}
                                        </span>
                                    ) : (
                                        <span className="t-size2 font-medium text-stone-400 italic">
                                            Belum Didisposisikan
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back & Actions Button Footer */}
                <div className="mt-auto flex flex-wrap justify-between gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                    <Link
                        href={route('kadangs.services.index')}
                        className={cn(
                            buttonVariants({ variant: 'ghost' }),
                            't-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none',
                        )}
                    >
                        <ArrowLeft className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                        Kembali
                    </Link>

                    {service.status === 'processing' && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                onClick={() => setIsProcessOpen(true)}
                                className="t-size3 bg-emerald-600 text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none"
                            >
                                <CheckCircle className="mr-1.5 size-3.5" />
                                Proses Layanan
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Process Dialog */}
            <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
                <DialogContent className="sm:max-w-120">
                    <DialogHeader className="t-size2">
                        <DialogTitle className="text-[1.3em] font-bold text-(--primary)">
                            Proses Layanan
                        </DialogTitle>
                        <DialogDescription>
                            Selesaikan pemrosesan berkas layanan ini dan
                            teruskan ke Kepala Desa untuk mendapat persetujuan
                            akhir.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleProcessSubmit}
                        className="mt-2 flex flex-col gap-4"
                    >
                        {/* Textarea for Notes */}
                        <div className="flex flex-col gap-1.5">
                            <Label
                                htmlFor="process_notes"
                                className="t-size3 font-semibold text-(--font-color)"
                            >
                                Catatan Hasil Pemrosesan
                            </Label>
                            <Textarea
                                id="process_notes"
                                value={processForm.data.notes}
                                onChange={(e) =>
                                    processForm.setData('notes', e.target.value)
                                }
                                placeholder="Masukkan catatan hasil pengerjaan layanan..."
                                rows={4}
                                className="t-size3"
                            />
                            <InputError message={processForm.errors.notes} />
                        </div>

                        <DialogFooter className="mt-3">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsProcessOpen(false);
                                        processForm.reset();
                                    }}
                                    className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                                >
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={processForm.processing}
                                className="t-size3 bg-emerald-600 text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none"
                            >
                                Kirim ke Kepala Desa
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

ServicesShow.layout = {
    breadcrumbs: [
        {
            title: 'Kelola Layanan',
            href: servicesIndexRoute().url,
        },
    ],
};
