import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Globe, Save, UploadCloud, X } from 'lucide-react';
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
import { index } from '@/routes/village-informations';

const selectTriggerClass =
    't-size3 w-full max-w-full border border-(--primary)/20 bg-(--tertiary)/5 ring-0 outline-none selection:bg-(--tertiary)/10 selection:text-(--font-color) autofill:bg-(--tertiary)/10 hover:border-(--primary)/40 hover:bg-(--tertiary)/10 hover:ring-[3px] hover:ring-(--tertiary)/30 active:border-(--primary)/40 active:bg-(--tertiary)/10 active:ring-[3px] active:ring-(--tertiary)/30 data-[state=open]:border-(--primary)/40 data-[state=open]:bg-(--tertiary)/10 data-[state=open]:ring-[3px] data-[state=open]:ring-(--tertiary)/30';

interface VillageInformation {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: 'berita' | 'pengumuman' | 'info_desa';
    thumbnail: string | null;
    status: 'published' | 'hidden' | 'draft';
    published_at: string | null;
}

export default function VillageInformationEdit({
    information,
}: {
    information: VillageInformation;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Format published_at for datetime-local input (YYYY-MM-DDTHH:MM)
    const formatPublishedAt = (dateStr: string | null) => {
        if (!dateStr) {
            return '';
        }

        const d = new Date(dateStr);
        const pad = (n: number) => n.toString().padStart(2, '0');

        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        information.thumbnail ? `/storage/${information.thumbnail}` : null,
    );

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        title: string;
        content: string;
        category: 'berita' | 'pengumuman' | 'info_desa';
        thumbnail: File | null;
        status: 'published' | 'hidden' | 'draft';
        published_at: string;
    }>({
        _method: 'PUT',
        title: information.title,
        content: information.content,
        category: information.category,
        thumbnail: null,
        status: information.status,
        published_at: formatPublishedAt(information.published_at),
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('thumbnail', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const removeFile = () => {
        setData('thumbnail', null);
        setPreviewUrl(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(
            route('village-informations.update', {
                village_information: information.id,
            }),
            {
                forceFormData: true,
            },
        );
    };

    return (
        <>
            <Head title="Ubah Informasi Desa" />

            <div className="flex h-full flex-col gap-2 px-2 py-2 bp360:px-2.25 bp400:px-2.5 md:px-3 md:py-2.25 lg:px-3.5 lg:py-2.5 xl:px-4 xl:py-3 2xl:px-4.5 2xl:py-3.5">
                <span className="t-size2 font-medium text-stone-500">
                    Kelola Informasi &gt; Kelola Info Desa &gt; Ubah Informasi
                </span>

                <form
                    onSubmit={handleSubmit}
                    className="flex h-full flex-col gap-4"
                >
                    <div className="flex flex-col gap-4 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:p-3 bp400:p-3.25 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                        <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                            <div className="grid size-8.25 shrink-0 place-items-center rounded-full bg-(--primary)/10 text-(--primary) bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                <Globe className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                            </div>
                            <div>
                                <h2 className="t-size3 font-semibold text-(--primary)">
                                    Ubah Informasi Desa
                                </h2>
                                <p className="t-size1 font-medium text-stone-500">
                                    Perbarui data informasi publik berikut
                                    dengan benar.
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
                                    Judul Informasi
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="Masukkan judul informasi..."
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
                                    Kategori
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
                                            <SelectItem value="info_desa">
                                                Info Desa
                                            </SelectItem>
                                            <SelectItem value="berita">
                                                Berita
                                            </SelectItem>
                                            <SelectItem value="pengumuman">
                                                Pengumuman
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.category} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {/* Status */}
                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                <Label className="t-size3 font-semibold text-(--font-color)">
                                    Status
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
                                                Diterbitkan
                                            </SelectItem>
                                            <SelectItem value="hidden">
                                                Diarsipkan
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            {/* Published At (Only show when status is published) */}
                            {data.status === 'published' && (
                                <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                    <Label
                                        className="t-size3 font-semibold text-(--font-color)"
                                        htmlFor="published_at"
                                    >
                                        Tanggal Terbit
                                    </Label>
                                    <Input
                                        id="published_at"
                                        type="datetime-local"
                                        value={data.published_at}
                                        onChange={(e) =>
                                            setData(
                                                'published_at',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.published_at} />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                            <Label
                                className="t-size3 font-semibold text-(--font-color)"
                                htmlFor="content"
                            >
                                Konten Informasi
                            </Label>
                            <Textarea
                                id="content"
                                placeholder="Tulis konten informasi lengkap di sini..."
                                className="min-h-[250px]"
                                value={data.content}
                                onChange={(e) =>
                                    setData('content', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.content} />
                        </div>

                        {/* Thumbnail File Upload */}
                        <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                            <Label className="t-size3 font-semibold text-(--font-color)">
                                Gambar Sampul / Thumbnail
                            </Label>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {!previewUrl ? (
                                <div
                                    onClick={triggerFileSelect}
                                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-(--primary)/30 bg-(--tertiary)/5 p-6 transition-all duration-300 hover:bg-(--tertiary)/10"
                                >
                                    <UploadCloud className="mb-2 size-10 text-(--primary) opacity-85" />
                                    <span className="t-size3 font-semibold text-(--primary)">
                                        Pilih Gambar
                                    </span>
                                    <span className="mt-1 text-xs text-stone-400">
                                        Hanya mendukung JPG, JPEG, PNG (Maks
                                        2MB)
                                    </span>
                                </div>
                            ) : (
                                <div className="relative max-w-sm overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="h-48 w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white shadow transition-all duration-300 hover:bg-red-700"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            )}
                            <InputError message={errors.thumbnail} />
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

VillageInformationEdit.layout = {
    breadcrumbs: [
        {
            title: 'Kelola Informasi',
            href: '#',
        },
        {
            title: 'Kelola Info Desa',
            href: route('village-informations.index'),
        },
        {
            title: 'Ubah',
            href: '#',
        },
    ],
};
