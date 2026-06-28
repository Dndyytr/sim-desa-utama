import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, Save, UploadCloud, User, X } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { index } from '@/routes/submissions';

interface Resident {
    id: number;
    nik: string;
    name: string;
}

interface TypeService {
    id: number;
    service_code: string;
    service_name: string;
}

interface Attachment {
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
}

interface Submission {
    id: number;
    submission_number: string;
    resident_id: number;
    type_service_id: number;
    subject: string;
    description: string | null;
    status: string;
    attachments: Attachment[];
}

const selectTriggerClass =
    't-size3 w-full max-w-full border border-(--primary)/20 bg-(--tertiary)/5 ring-0 outline-none selection:bg-(--tertiary)/10 selection:text-(--font-color) autofill:bg-(--tertiary)/10 hover:border-(--primary)/40 hover:bg-(--tertiary)/10 hover:ring-[3px] hover:ring-(--tertiary)/30 active:border-(--primary)/40 active:bg-(--tertiary)/10 active:ring-[3px] active:ring-(--tertiary)/30 data-[state=open]:border-(--primary)/40 data-[state=open]:bg-(--tertiary)/10 data-[state=open]:ring-[3px] data-[state=open]:ring-(--tertiary)/30';

export default function SubmissionsEdit({
    submission,
    residents,
    typeServices,
}: {
    submission: Submission;
    residents: Resident[];
    typeServices: TypeService[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        _method: string;
        type_service_id: string;
        subject: string;
        description: string;
        attachments: File[];
        deleted_attachments: number[];
    }>({
        _method: 'PUT',
        type_service_id: submission.type_service_id.toString(),
        subject: submission.subject,
        description: submission.description || '',
        attachments: [],
        deleted_attachments: [],
    });

    const [existingAttachments, setExistingAttachments] = useState<
        Attachment[]
    >(submission.attachments || []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setData('attachments', [...data.attachments, ...newFiles]);
        }
    };

    const removeNewFile = (index: number) => {
        setData(
            'attachments',
            data.attachments.filter((_, i) => i !== index),
        );
    };

    const removeExistingFile = (attachmentId: number) => {
        setExistingAttachments(
            existingAttachments.filter((file) => file.id !== attachmentId),
        );
        setData('deleted_attachments', [
            ...data.deleted_attachments,
            attachmentId,
        ]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('submissions.update', submission.id), {
            forceFormData: true,
            onError: () => {
                // Keep data intact
            },
        });
    };

    const selectedResident = residents.find(
        (resident) => resident.id === submission.resident_id,
    );

    return (
        <>
            <Head title={`Edit Pengajuan - ${submission.submission_number}`} />

            <div className="flex h-full flex-col gap-2 px-2 py-2 bp360:px-2.25 bp400:px-2.5 md:px-3 md:py-2.25 lg:px-3.5 lg:py-2.5 xl:px-4 xl:py-3 2xl:px-4.5 2xl:py-3.5">
                {/* Manual Breadcrumb */}
                <div className="t-size2 font-medium text-stone-500">
                    Input Pengajuan Offline &gt; Edit Pengajuan &gt;{' '}
                    {submission.submission_number}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex h-full flex-col gap-2"
                >
                    {/* Section 1: Pemohon & Layanan */}
                    <div className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                        <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                            <div className="grid size-8.25 shrink-0 place-items-center rounded-full bg-(--primary)/10 text-(--primary) bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                <User className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                            </div>
                            <div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Informasi Pemohon & Layanan
                                </h2>
                                <p className="t-size1 font-medium text-stone-500">
                                    Data pemohon bersifat tetap dan jenis
                                    layanan dapat disesuaikan.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                            {/* Resident ID (Disabled / Readonly) */}
                            <div className="inline-flex flex-col gap-1.5 opacity-80 bp360:gap-1.75 bp400:gap-2">
                                <Label className="t-size3 font-semibold text-stone-500">
                                    Pemohon (Penduduk)
                                </Label>
                                <Input
                                    value={
                                        selectedResident
                                            ? `${selectedResident.name} (${selectedResident.nik})`
                                            : '-'
                                    }
                                    disabled
                                    className="t-size3 cursor-not-allowed border-stone-200 bg-stone-100"
                                />
                            </div>

                            {/* Type Service ID */}
                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                <Label className="t-size3 font-semibold text-(--font-color)">
                                    Jenis Layanan
                                </Label>
                                <Select
                                    value={data.type_service_id}
                                    onValueChange={(value) =>
                                        setData('type_service_id', value)
                                    }
                                >
                                    <SelectTrigger
                                        className={selectTriggerClass}
                                    >
                                        <SelectValue placeholder="Pilih Jenis Layanan..." />
                                    </SelectTrigger>
                                    <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                        <SelectGroup>
                                            {typeServices.map((type) => (
                                                <SelectItem
                                                    key={type.id}
                                                    value={type.id.toString()}
                                                >
                                                    {type.service_name} (
                                                    {type.service_code})
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.type_service_id} />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Detail Pengajuan */}
                    <div className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                        <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                            <div className="grid size-8.25 shrink-0 place-items-center rounded-full bg-(--primary)/10 text-(--primary) bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                <FileText className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                            </div>
                            <div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Detail Permohonan
                                </h2>
                                <p className="t-size1 font-medium text-stone-500">
                                    Perbarui subjek dan deskripsi lengkap
                                    pengajuan layanan.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            {/* Subject */}
                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                <Label className="t-size3 font-semibold text-(--font-color)">
                                    Subjek / Judul Pengajuan
                                </Label>
                                <Input
                                    value={data.subject}
                                    onChange={(e) =>
                                        setData('subject', e.target.value)
                                    }
                                    placeholder="Contoh: Permohonan Surat Keterangan Usaha"
                                    className="t-size3"
                                />
                                <InputError message={errors.subject} />
                            </div>

                            {/* Description */}
                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                <Label className="t-size3 font-semibold text-(--font-color)">
                                    Deskripsi / Keterangan Tambahan
                                </Label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Tuliskan keterangan detail pengajuan di sini..."
                                    rows={4}
                                    className="t-size3"
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Lampiran Dokumen */}
                    <div className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                        <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                            <div className="grid size-8.25 shrink-0 place-items-center rounded-full bg-(--primary)/10 text-(--primary) bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                <UploadCloud className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                            </div>
                            <div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Dokumen Pendukung / Lampiran
                                </h2>
                                <p className="t-size1 font-medium text-stone-500">
                                    Kelola dokumen persyaratan (maks. 5MB per
                                    file, format: PDF, JPG, PNG, DOCX).
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            {/* Existing Attachments */}
                            {existingAttachments.length > 0 && (
                                <div className="mb-2 flex flex-col gap-1.5 rounded-md bg-stone-50 p-2.5 bp360:p-3">
                                    <span className="t-size2 border-b pb-1 font-bold text-(--primary)">
                                        Lampiran Saat Ini (
                                        {existingAttachments.length}):
                                    </span>
                                    <div className="mt-1 grid gap-2 sm:grid-cols-2">
                                        {existingAttachments.map((file) => (
                                            <div
                                                key={file.id}
                                                className="flex items-center justify-between rounded border border-stone-200 bg-white px-2 py-1.5"
                                            >
                                                <div className="flex min-w-0 items-center gap-1.5">
                                                    <FileText className="size-4 shrink-0 text-stone-500" />
                                                    <span
                                                        className="t-size2 truncate font-medium text-stone-700"
                                                        title={file.file_name}
                                                    >
                                                        {file.file_name}
                                                    </span>
                                                    <span className="t-size1 shrink-0 text-stone-400">
                                                        (
                                                        {(
                                                            file.file_size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)}{' '}
                                                        MB)
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeExistingFile(
                                                            file.id,
                                                        )
                                                    }
                                                    className="shrink-0 rounded p-1 text-red-500 transition-all hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <X className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Dropzone for New Files */}
                            <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-(--primary)/20 bg-(--tertiary)/5 p-3 transition-all duration-300 hover:bg-(--tertiary)/10 bp360:p-3.5 bp400:p-4 md:p-5 lg:p-6">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                                <UploadCloud className="animate-bounce-slow mb-2 size-6 text-(--primary) bp360:size-6.5 bp400:size-7 md:size-7.5 lg:size-8" />
                                <span className="t-size3 font-semibold text-(--primary)">
                                    Tambah File Baru
                                </span>
                                <span className="t-size1 mt-1 text-stone-500">
                                    Mendukung PDF, Word, dan Gambar (Maks. 5MB)
                                </span>
                            </div>

                            {/* List of New Files */}
                            {data.attachments.length > 0 && (
                                <div className="mt-1 flex flex-col gap-1.5 rounded-md bg-stone-50 p-2.5 bp360:p-3">
                                    <span className="t-size2 border-b pb-1 font-bold text-(--primary)">
                                        Lampiran Baru yang Ditambahkan (
                                        {data.attachments.length}):
                                    </span>
                                    <div className="mt-1 grid gap-2 sm:grid-cols-2">
                                        {data.attachments.map((file, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between rounded border border-(--primary)/10 bg-white px-2 py-1.5"
                                            >
                                                <div className="flex min-w-0 items-center gap-1.5">
                                                    <FileText className="size-4 shrink-0 text-stone-500" />
                                                    <span
                                                        className="t-size2 truncate font-medium text-stone-700"
                                                        title={file.name}
                                                    >
                                                        {file.name}
                                                    </span>
                                                    <span className="t-size1 shrink-0 text-stone-400">
                                                        (
                                                        {(
                                                            file.size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)}{' '}
                                                        MB)
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeNewFile(idx)
                                                    }
                                                    className="shrink-0 rounded p-1 text-red-500 transition-all hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <X className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <InputError message={errors.attachments} />
                        </div>
                    </div>

                    {/* Action Buttons Sticky Footer */}
                    <div className="mt-auto flex flex-wrap justify-between gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                        <Link
                            href={route('submissions.index')}
                            className={cn(
                                buttonVariants({ variant: 'ghost' }),
                                't-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none',
                            )}
                        >
                            <ArrowLeft className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                            Kembali
                        </Link>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => reset()}
                                className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                                disabled={processing}
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                                disabled={processing}
                            >
                                <Save className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                Simpan Perubahan
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

SubmissionsEdit.layout = {
    breadcrumbs: [
        {
            title: 'Input Pengajuan Offline',
            href: index(),
        },
        {
            title: 'Edit Pengajuan',
            href: '#',
        },
    ],
};
