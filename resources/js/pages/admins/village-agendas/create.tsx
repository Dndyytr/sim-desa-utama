import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Save,
    UploadCloud,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
import { index, store } from '@/routes/village-agendas';

const selectTriggerClass =
    't-size3 w-full max-w-full border border-(--primary)/20 bg-(--tertiary)/5 ring-0 outline-none selection:bg-(--tertiary)/10 selection:text-(--font-color) autofill:bg-(--tertiary)/10 hover:border-(--primary)/40 hover:bg-(--tertiary)/10 hover:ring-[3px] hover:ring-(--tertiary)/30 active:border-(--primary)/40 active:bg-(--tertiary)/10 active:ring-[3px] active:ring-(--tertiary)/30 data-[state=open]:border-(--primary)/40 data-[state=open]:bg-(--tertiary)/10 data-[state=open]:ring-[3px] data-[state=open]:ring-(--tertiary)/30';

export default function VillageAgendaCreate() {
    const posterInputRef = useRef<HTMLInputElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);

    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const [attachmentName, setAttachmentName] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm<{
        title: string;
        description: string;
        category:
            | 'kegiatan'
            | 'rapat'
            | 'musyawarah'
            | 'pelayanan'
            | 'sosialisasi'
            | 'pembangunan'
            | 'lainnya';
        start_date: string;
        end_date: string;
        start_time: string;
        end_time: string;
        location: string;
        address: string;
        poster: File | null;
        attachment: File | null;
        status: 'draft' | 'published' | 'unpublished' | 'completed';
    }>({
        title: '',
        description: '',
        category: 'kegiatan',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        location: '',
        address: '',
        poster: null,
        attachment: null,
        status: 'draft',
    });

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('poster', file);
            setPosterPreview(URL.createObjectURL(file));
        }
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('attachment', file);
            setAttachmentName(file.name);
        }
    };

    const triggerPosterSelect = () => {
        posterInputRef.current?.click();
    };

    const triggerAttachmentSelect = () => {
        attachmentInputRef.current?.click();
    };

    const removePoster = () => {
        setData('poster', null);
        setPosterPreview(null);

        if (posterInputRef.current) {
            posterInputRef.current.value = '';
        }
    };

    const removeAttachment = () => {
        setData('attachment', null);
        setAttachmentName(null);

        if (attachmentInputRef.current) {
            attachmentInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store().url, {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Tambah Agenda Desa" />

            <div className="flex h-full flex-col gap-2 px-2 py-2 bp360:px-2.25 bp400:px-2.5 md:px-3 md:py-2.25 lg:px-3.5 lg:py-2.5 xl:px-4 xl:py-3 2xl:px-4.5 2xl:py-3.5">
                <span className="t-size2 font-medium text-stone-500">
                    Kelola Agenda Desa &gt; Tambah Baru
                </span>

                <form
                    onSubmit={handleSubmit}
                    className="flex h-full flex-col gap-4"
                >
                    <div className="flex flex-col gap-4 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:p-3 bp400:p-3.25 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                        <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                            <div className="grid size-8.25 shrink-0 place-items-center rounded-full bg-(--primary)/10 text-(--primary) bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                <Calendar className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                            </div>
                            <div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Agenda / Kegiatan Desa
                                </h2>
                                <p className="t-size1 font-medium text-stone-500">
                                    Lengkapi data agenda resmi Pemerintah Desa
                                    Utama berikut.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {/* Title */}
                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2 md:col-span-2">
                                <Label
                                    className="t-size3 font-semibold text-(--font-color)"
                                    htmlFor="title"
                                >
                                    Judul Agenda
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="Masukkan judul agenda desa..."
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            {/* Category */}
                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                <Label className="t-size3 font-semibold text-(--font-color)">
                                    Kategori Agenda
                                </Label>
                                <Select
                                    value={data.category}
                                    onValueChange={(val: any) =>
                                        setData('category', val)
                                    }
                                >
                                    <SelectTrigger
                                        className={selectTriggerClass}
                                    >
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                        <SelectGroup>
                                            <SelectItem value="kegiatan">
                                                Kegiatan
                                            </SelectItem>
                                            <SelectItem value="rapat">
                                                Rapat
                                            </SelectItem>
                                            <SelectItem value="musyawarah">
                                                Musyawarah
                                            </SelectItem>
                                            <SelectItem value="pelayanan">
                                                Pelayanan Keliling
                                            </SelectItem>
                                            <SelectItem value="sosialisasi">
                                                Sosialisasi
                                            </SelectItem>
                                            <SelectItem value="pembangunan">
                                                Pembangunan
                                            </SelectItem>
                                            <SelectItem value="lainnya">
                                                Lainnya
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.category} />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                            <Label
                                className="t-size3 font-semibold text-(--font-color)"
                                htmlFor="description"
                            >
                                Deskripsi Agenda
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Tuliskan deskripsi lengkap agenda di sini..."
                                className="min-h-[120px]"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.description} />
                        </div>

                        {/* Schedule Section */}
                        <div className="border-t border-stone-100 pt-4">
                            <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-(--primary)">
                                <Clock className="size-4 shrink-0" />
                                <span>Waktu & Jadwal Kegiatan</span>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                                <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                    <Label
                                        htmlFor="start_date"
                                        className="t-size3 font-semibold text-(--font-color)"
                                    >
                                        Tanggal Mulai
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) =>
                                            setData(
                                                'start_date',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError message={errors.start_date} />
                                </div>
                                <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                    <Label
                                        htmlFor="end_date"
                                        className="t-size3 font-semibold text-(--font-color)"
                                    >
                                        Tanggal Selesai
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) =>
                                            setData('end_date', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.end_date} />
                                </div>
                                <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                    <Label
                                        htmlFor="start_time"
                                        className="t-size3 font-semibold text-(--font-color)"
                                    >
                                        Waktu Mulai
                                    </Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) =>
                                            setData(
                                                'start_time',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError message={errors.start_time} />
                                </div>
                                <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                    <Label
                                        htmlFor="end_time"
                                        className="t-size3 font-semibold text-(--font-color)"
                                    >
                                        Waktu Selesai
                                    </Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) =>
                                            setData('end_time', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.end_time} />
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="border-t border-stone-100 pt-4">
                            <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-(--primary)">
                                <MapPin className="size-4 shrink-0" />
                                <span>Lokasi Kegiatan</span>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2 md:col-span-1">
                                    <Label
                                        htmlFor="location"
                                        className="t-size3 font-semibold text-(--font-color)"
                                    >
                                        Nama Lokasi / Tempat
                                    </Label>
                                    <Input
                                        id="location"
                                        type="text"
                                        placeholder="Contoh: Aula Desa, Lapangan..."
                                        value={data.location}
                                        onChange={(e) =>
                                            setData('location', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.location} />
                                </div>
                                <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2 md:col-span-2">
                                    <Label
                                        htmlFor="address"
                                        className="t-size3 font-semibold text-(--font-color)"
                                    >
                                        Alamat Lengkap (opsional)
                                    </Label>
                                    <Input
                                        id="address"
                                        type="text"
                                        placeholder="Masukkan alamat lengkap lokasi kegiatan..."
                                        value={data.address}
                                        onChange={(e) =>
                                            setData('address', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.address} />
                                </div>
                            </div>
                        </div>

                        {/* Media Upload Section */}
                        <div className="grid gap-4 border-t border-stone-100 pt-4 md:grid-cols-2">
                            {/* Poster File Upload */}
                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                <Label className="t-size3 font-semibold text-(--font-color)">
                                    Poster Kegiatan (opsional)
                                </Label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={posterInputRef}
                                    onChange={handlePosterChange}
                                    className="hidden"
                                />

                                {!posterPreview ? (
                                    <div
                                        onClick={triggerPosterSelect}
                                        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-(--primary)/30 bg-(--tertiary)/5 p-5 transition-all duration-300 hover:bg-(--tertiary)/10"
                                    >
                                        <UploadCloud className="mb-2 size-8 text-(--primary) opacity-85" />
                                        <span className="t-size3 font-semibold text-(--primary)">
                                            Pilih Poster
                                        </span>
                                        <span className="mt-1 text-xs text-stone-400">
                                            Hanya JPG, JPEG, PNG (Maks 2MB)
                                        </span>
                                    </div>
                                ) : (
                                    <div className="relative max-w-xs overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
                                        <img
                                            src={posterPreview}
                                            alt="Poster Preview"
                                            className="h-32 w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={removePoster}
                                            className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white shadow transition-all duration-300 hover:bg-red-700"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                )}
                                <InputError message={errors.poster} />
                            </div>

                            {/* Attachment File Upload */}
                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                <Label className="t-size3 font-semibold text-(--font-color)">
                                    Lampiran Dokumen / File (opsional)
                                </Label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                                    ref={attachmentInputRef}
                                    onChange={handleAttachmentChange}
                                    className="hidden"
                                />

                                {!attachmentName ? (
                                    <div
                                        onClick={triggerAttachmentSelect}
                                        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-(--primary)/30 bg-(--tertiary)/5 p-5 transition-all duration-300 hover:bg-(--tertiary)/10"
                                    >
                                        <UploadCloud className="mb-2 size-8 text-(--primary) opacity-85" />
                                        <span className="t-size3 font-semibold text-(--primary)">
                                            Pilih File Dokumen
                                        </span>
                                        <span className="mt-1 text-xs text-stone-400">
                                            PDF, Word, Excel, ZIP (Maks 5MB)
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-4">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="t-size3 truncate font-semibold text-(--primary)">
                                                {attachmentName}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeAttachment}
                                            className="shrink-0 rounded-full bg-red-600 p-1.5 text-white shadow transition-all duration-300 hover:bg-red-700"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                )}
                                <InputError message={errors.attachment} />
                            </div>
                        </div>

                        {/* Status Publication */}
                        <div className="border-t border-stone-100 pt-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                    <Label className="t-size3 font-semibold text-(--font-color)">
                                        Status Publikasi
                                    </Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(val: any) =>
                                            setData('status', val)
                                        }
                                    >
                                        <SelectTrigger
                                            className={selectTriggerClass}
                                        >
                                            <SelectValue placeholder="Pilih Status" />
                                        </SelectTrigger>
                                        <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                            <SelectGroup>
                                                <SelectItem value="draft">
                                                    Draft
                                                </SelectItem>
                                                <SelectItem value="published">
                                                    Dipublikasikan
                                                </SelectItem>
                                                <SelectItem value="unpublished">
                                                    Tidak Dipublikasikan
                                                </SelectItem>
                                                <SelectItem value="completed">
                                                    Selesai
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:p-3 bp400:p-3.25 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                        <Link
                            href={index().url}
                            className="t-size3 flex items-center gap-1.5 rounded-md border border-(--primary)/40 bg-transparent px-2.5 py-1.5 font-medium text-(--primary) transition-all duration-300 ease-in-out hover:bg-stone-50 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.1)] active:bg-stone-100 active:shadow-none bp360:px-3 bp360:py-2"
                        >
                            <ArrowLeft className="size-4" />
                            Batal
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="t-size3 flex items-center gap-1.5 bg-(--primary) text-white hover:bg-(--secondary) hover:text-(--primary) hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                        >
                            <Save className="size-4" />
                            Simpan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

VillageAgendaCreate.layout = {
    breadcrumbs: [
        {
            title: 'Kelola Agenda Desa',
            href: route('village-agendas.index'),
        },
        {
            title: 'Tambah Baru',
            href: route('village-agendas.create'),
        },
    ],
};
