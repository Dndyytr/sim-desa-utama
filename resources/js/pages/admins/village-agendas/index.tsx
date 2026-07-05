import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    Eye,
    FileText,
    Filter,
    MapPin,
    Pencil,
    PlusCircle,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { BulkDeleteDialog } from '@/components/ui/bulk-delete';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Entries } from '@/components/ui/entries';
import { InertiaPagination } from '@/components/ui/inertia-pagination';
import { SearchBar } from '@/components/ui/search-bar';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SingleDeleteDialog } from '@/components/ui/single-delete';
import { bulkDelete, index } from '@/routes/village-agendas';

interface Author {
    id: number;
    name: string;
}

interface VillageAgenda {
    id: number;
    title: string;
    slug: string;
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
    address: string | null;
    poster: string | null;
    attachment: string | null;
    status: 'draft' | 'published' | 'unpublished' | 'completed';
    published_at: string | null;
    created_at: string;
    author: Author;
}

export default function VillageAgendaIndex({
    agendas,
    entries,
    search,
    sort,
    category,
    status,
    month,
    year,
    hasFilter,
    i,
}: {
    agendas: {
        data: VillageAgenda[];
        from: number;
        to: number;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        links: any[];
        first_page_url: string | null;
        last_page_url: string | null;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    entries: number;
    search: string;
    sort: string | null;
    category: string | null;
    status: string | null;
    month: string | null;
    year: string | null;
    hasFilter: boolean;
    i: number;
}) {
    const [selected, setSelected] = useState<string[]>([]);
    const { can }: any = usePage().props;

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(agendas.data.map((agenda) => agenda.id.toString()));
        } else {
            setSelected([]);
        }
    };

    const toggleSelection = (id: string) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const shouldShowPagination = agendas.last_page > 1;

    const currentFilter = hasFilter
        ? category
            ? `category:${category}`
            : status
              ? `status:${status}`
              : month
                ? `month:${month}`
                : year
                  ? `year:${year}`
                  : sort
                    ? `sort:${sort}`
                    : undefined
        : undefined;

    const queryFilters = {
        sort: sort || undefined,
        category: category || undefined,
        status: status || undefined,
        month: month || undefined,
        year: year || undefined,
    };

    const handleQueryChange = (
        query: Record<string, string | number | null | undefined>,
    ) => {
        const params: Record<string, string | number | null | undefined> = {
            search: search || undefined,
            entries,
            ...queryFilters,
            ...query,
        };

        Object.keys(params).forEach((key) => {
            if (
                params[key] === undefined ||
                params[key] === null ||
                params[key] === ''
            ) {
                delete params[key];
            }
        });

        router.get(index().url, params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (value: string) => {
        const [type, selectedValue] = value.split(':');

        if (type === 'sort') {
            handleQueryChange({ sort: selectedValue });
        } else if (type === 'category') {
            handleQueryChange({
                category: selectedValue === 'all' ? null : selectedValue,
            });
        } else if (type === 'status') {
            handleQueryChange({
                status: selectedValue === 'all' ? null : selectedValue,
            });
        } else if (type === 'month') {
            handleQueryChange({
                month: selectedValue === 'all' ? null : selectedValue,
            });
        } else if (type === 'year') {
            handleQueryChange({
                year: selectedValue === 'all' ? null : selectedValue,
            });
        }
    };

    const getCategoryLabel = (cat: string) => {
        switch (cat) {
            case 'kegiatan':
                return 'Kegiatan';
            case 'rapat':
                return 'Rapat';
            case 'musyawarah':
                return 'Musyawarah';
            case 'pelayanan':
                return 'Pelayanan Keliling';
            case 'sosialisasi':
                return 'Sosialisasi';
            case 'pembangunan':
                return 'Pembangunan';
            case 'lainnya':
                return 'Lainnya';
            default:
                return cat;
        }
    };

    const getCategoryVariant = (cat: string) => {
        switch (cat) {
            case 'kegiatan':
                return 'default';
            case 'rapat':
                return 'secondary';
            case 'musyawarah':
                return 'outline';
            case 'pelayanan':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getStatusBadge = (stat: string) => {
        switch (stat) {
            case 'published':
                return (
                    <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">
                        Dipublikasikan
                    </Badge>
                );
            case 'unpublished':
                return (
                    <Badge className="border-amber-200 bg-amber-100 text-amber-800">
                        Tidak Dipublikasikan
                    </Badge>
                );
            case 'draft':
                return (
                    <Badge className="border-gray-200 bg-gray-100 text-gray-800">
                        Draft
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge className="border-blue-200 bg-blue-100 text-blue-800">
                        Selesai
                    </Badge>
                );
            default:
                return <Badge>{stat}</Badge>;
        }
    };

    const formatDateRange = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (start === end) {
            return startDate.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        }

        return `${startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    };

    const formatTimeRange = (start: string, end: string) => {
        return `${start.substring(0, 5)} - ${end.substring(0, 5)} WIB`;
    };

    return (
        <>
            <Head title="Kelola Agenda Desa" />

            <div className="flex flex-col gap-2 px-2 py-2 bp360:gap-2.25 bp360:px-2.25 bp400:gap-2.5 bp400:px-2.5 md:gap-2.75 md:px-3 md:py-2.25 lg:gap-3 lg:px-3.5 lg:py-2.5 xl:gap-3.5 xl:px-4 xl:py-3 2xl:gap-4 2xl:px-4.5 2xl:py-3.5">
                <div className="flex w-full max-w-full items-center gap-2 md:max-w-[70%] lg:max-w-1/2">
                    <SearchBar
                        route={route('village-agendas.index')}
                        search={search}
                        formId="search-village-agendas"
                        query={{ entries, ...queryFilters }}
                    />
                    <Button
                        type="submit"
                        form="search-village-agendas"
                        className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                    >
                        Cari
                    </Button>
                </div>

                <div className="grid items-center justify-between gap-2 md:grid-cols-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={currentFilter}
                            onValueChange={handleFilterChange}
                        >
                            <SelectTrigger className="t-size3 gap-1.5 bg-(--secondary)/30 text-(--primary) hover:bg-(--secondary)/50 active:bg-(--secondary)/50 data-placeholder:text-(--primary)">
                                <Filter className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                <SelectGroup>
                                    <SelectLabel>Urutan</SelectLabel>
                                    <SelectItem value="sort:start_date_asc">
                                        Tanggal Kegiatan Terdekat
                                    </SelectItem>
                                    <SelectItem value="sort:start_date_desc">
                                        Tanggal Kegiatan Terjauh
                                    </SelectItem>
                                    <SelectItem value="sort:created_desc">
                                        Waktu Input Terbaru
                                    </SelectItem>
                                    <SelectItem value="sort:title_asc">
                                        Judul A-Z
                                    </SelectItem>
                                </SelectGroup>
                                <SelectSeparator className="bg-(--primary)/60" />
                                <SelectGroup>
                                    <SelectLabel>Kategori</SelectLabel>
                                    <SelectItem value="category:all">
                                        Semua Kategori
                                    </SelectItem>
                                    <SelectItem value="category:kegiatan">
                                        Kegiatan
                                    </SelectItem>
                                    <SelectItem value="category:rapat">
                                        Rapat
                                    </SelectItem>
                                    <SelectItem value="category:musyawarah">
                                        Musyawarah
                                    </SelectItem>
                                    <SelectItem value="category:pelayanan">
                                        Pelayanan Keliling
                                    </SelectItem>
                                    <SelectItem value="category:sosialisasi">
                                        Sosialisasi
                                    </SelectItem>
                                    <SelectItem value="category:pembangunan">
                                        Pembangunan
                                    </SelectItem>
                                    <SelectItem value="category:lainnya">
                                        Lainnya
                                    </SelectItem>
                                </SelectGroup>
                                <SelectSeparator className="bg-(--primary)/60" />
                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem value="status:all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="status:draft">
                                        Draft
                                    </SelectItem>
                                    <SelectItem value="status:published">
                                        Dipublikasikan
                                    </SelectItem>
                                    <SelectItem value="status:unpublished">
                                        Tidak Dipublikasikan
                                    </SelectItem>
                                    <SelectItem value="status:completed">
                                        Selesai
                                    </SelectItem>
                                </SelectGroup>
                                <SelectSeparator className="bg-(--primary)/60" />
                                <SelectGroup>
                                    <SelectLabel>Bulan</SelectLabel>
                                    <SelectItem value="month:all">
                                        Semua Bulan
                                    </SelectItem>
                                    <SelectItem value="month:1">
                                        Januari
                                    </SelectItem>
                                    <SelectItem value="month:2">
                                        Februari
                                    </SelectItem>
                                    <SelectItem value="month:3">
                                        Maret
                                    </SelectItem>
                                    <SelectItem value="month:4">
                                        April
                                    </SelectItem>
                                    <SelectItem value="month:5">Mei</SelectItem>
                                    <SelectItem value="month:6">
                                        Juni
                                    </SelectItem>
                                    <SelectItem value="month:7">
                                        Juli
                                    </SelectItem>
                                    <SelectItem value="month:8">
                                        Agustus
                                    </SelectItem>
                                    <SelectItem value="month:9">
                                        September
                                    </SelectItem>
                                    <SelectItem value="month:10">
                                        Oktobor
                                    </SelectItem>
                                    <SelectItem value="month:11">
                                        November
                                    </SelectItem>
                                    <SelectItem value="month:12">
                                        Desember
                                    </SelectItem>
                                </SelectGroup>
                                <SelectSeparator className="bg-(--primary)/60" />
                                <SelectGroup>
                                    <SelectLabel>Tahun</SelectLabel>
                                    <SelectItem value="year:all">
                                        Semua Tahun
                                    </SelectItem>
                                    <SelectItem value="year:2026">
                                        2026
                                    </SelectItem>
                                    <SelectItem value="year:2025">
                                        2025
                                    </SelectItem>
                                    <SelectItem value="year:2024">
                                        2024
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {selected.length > 0 &&
                            can.includes('d-village-agendas') && (
                                <BulkDeleteDialog
                                    title="Agenda Desa"
                                    selectedCount={selected.length}
                                    onConfirm={() => {
                                        router.post(
                                            bulkDelete().url,
                                            { ids: selected },
                                            {
                                                preserveScroll: true,
                                                onSuccess: () =>
                                                    setSelected([]),
                                            },
                                        );
                                    }}
                                />
                            )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 justify-self-end">
                        <Entries
                            route={route('village-agendas.index')}
                            search={search}
                            entries={entries}
                            query={queryFilters}
                        />
                        {can.includes('c-village-agendas') && (
                            <Link
                                href={route('village-agendas.create')}
                                className="t-size3 flex items-center gap-1.5 rounded-md bg-(--primary) px-2.5 py-1.5 font-medium whitespace-nowrap text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-(--secondary) hover:text-(--primary) hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:bg-(--secondary) active:text-(--primary) active:shadow-none bp360:px-3 bp360:py-2"
                            >
                                <PlusCircle className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                Tambah Baru
                            </Link>
                        )}
                    </div>
                </div>

                <div className="sb-primary relative mt-1 overflow-x-auto rounded-lg bg-green-50 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:rounded-xl">
                    {agendas.data.length > 0 ? (
                        <div className="bg-white">
                            <table className="w-full">
                                <thead className="bg-(--secondary)/15">
                                    <tr className="t-size3 text-(--primary)">
                                        {can.includes('d-village-agendas') && (
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-center font-semibold"
                                            >
                                                <Checkbox
                                                    className="size-4.5 rounded-sm border-(--font-color)/70 bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.5 xl:size-5.75 2xl:size-6 [&>span>svg]:size-4 bp360:[&>span>svg]:size-4.25 bp400:[&>span>svg]:size-4.5 md:[&>span>svg]:size-4.75 lg:[&>span>svg]:size-5 xl:[&>span>svg]:size-5.25 2xl:[&>span>svg]:size-5.5"
                                                    checked={
                                                        selected.length ===
                                                            agendas.data
                                                                .length &&
                                                        agendas.data.length > 0
                                                    }
                                                    onCheckedChange={
                                                        toggleSelectAll
                                                    }
                                                />
                                            </th>
                                        )}
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            NO
                                        </th>
                                        <th
                                            scope="col"
                                            className="min-w-50 px-4 py-3 text-left font-semibold"
                                        >
                                            Agenda / Kegiatan
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            Kategori
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left font-semibold"
                                        >
                                            Jadwal
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left font-semibold"
                                        >
                                            Lokasi
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold whitespace-nowrap"
                                        >
                                            Media / File
                                        </th>
                                        {(can.includes('u-village-agendas') ||
                                            can.includes(
                                                'd-village-agendas',
                                            )) && (
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-center font-semibold"
                                            >
                                                Aksi
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {agendas.data.map((agenda, indexNum) => (
                                        <tr
                                            key={agenda.id}
                                            className="t-size2 border-b-[1.5px] border-(--primary)/10 text-(--font-color) last:border-b-0 even:bg-(--primary)/3"
                                        >
                                            {can.includes(
                                                'd-village-agendas',
                                            ) && (
                                                <td className="px-4 py-2 text-center">
                                                    <Checkbox
                                                        className="size-4.5 rounded-sm border-(--font-color)/70 bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.5 xl:size-5.75 2xl:size-6 [&>span>svg]:size-4 bp360:[&>span>svg]:size-4.25 bp400:[&>span>svg]:size-4.5 md:[&>span>svg]:size-4.75 lg:[&>span>svg]:size-5 xl:[&>span>svg]:size-5.25 2xl:[&>span>svg]:size-5.5"
                                                        checked={selected.includes(
                                                            agenda.id.toString(),
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleSelection(
                                                                agenda.id.toString(),
                                                            )
                                                        }
                                                    />
                                                </td>
                                            )}
                                            <td
                                                scope="row"
                                                className="px-4 py-2 text-center font-medium"
                                            >
                                                {i + indexNum}
                                            </td>
                                            <td className="px-4 py-2 font-medium">
                                                <div className="line-clamp-1 font-semibold">
                                                    {agenda.title}
                                                </div>
                                                <div className="line-clamp-1 text-xs text-(--font-color)/55">
                                                    {agenda.slug}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <Badge
                                                    variant={getCategoryVariant(
                                                        agenda.category,
                                                    )}
                                                >
                                                    {getCategoryLabel(
                                                        agenda.category,
                                                    )}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2 text-left font-medium">
                                                <div className="flex items-center gap-1.5 text-xs text-(--font-color)/85">
                                                    <Calendar className="size-3.5 shrink-0 text-(--primary)" />
                                                    <span>
                                                        {formatDateRange(
                                                            agenda.start_date,
                                                            agenda.end_date,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="mt-0.5 pl-5 text-xs text-(--font-color)/55">
                                                    {formatTimeRange(
                                                        agenda.start_time,
                                                        agenda.end_time,
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-left font-medium">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-(--primary)">
                                                    <MapPin className="size-3.5 shrink-0" />
                                                    <span>
                                                        {agenda.location}
                                                    </span>
                                                </div>
                                                {agenda.address && (
                                                    <div className="mt-0.5 line-clamp-1 pl-5 text-xs text-(--font-color)/55">
                                                        {agenda.address}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {getStatusBadge(agenda.status)}
                                            </td>
                                            <td className="px-4 py-2 text-center font-medium whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {agenda.poster ? (
                                                        <a
                                                            href={`/storage/${agenda.poster}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded bg-stone-100 p-1 text-(--primary) hover:bg-stone-200"
                                                            title="Lihat Poster"
                                                        >
                                                            <Eye className="size-4.25" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-stone-300">
                                                            -
                                                        </span>
                                                    )}
                                                    {agenda.attachment ? (
                                                        <a
                                                            href={`/storage/${agenda.attachment}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded bg-stone-100 p-1 text-(--primary) hover:bg-stone-200"
                                                            title="Download Lampiran"
                                                        >
                                                            <FileText className="size-4.25" />
                                                        </a>
                                                    ) : null}
                                                </div>
                                            </td>
                                            {(can.includes(
                                                'u-village-agendas',
                                            ) ||
                                                can.includes(
                                                    'd-village-agendas',
                                                )) && (
                                                <td className="px-4 py-2 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        {can.includes(
                                                            'u-village-agendas',
                                                        ) && (
                                                            <Link
                                                                href={route(
                                                                    'village-agendas.edit',
                                                                    {
                                                                        village_agenda:
                                                                            agenda.id,
                                                                    },
                                                                )}
                                                                className="inline-flex items-center gap-1 rounded-md border-[1.7px] border-(--secondary)/50 bg-(--secondary)/10 px-2.5 py-1.5 font-medium text-yellow-500 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-(--secondary)/70 hover:bg-(--secondary)/50 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:border-(--secondary)/70 active:bg-(--secondary)/50 active:shadow-none bp360:px-3 bp360:py-2"
                                                            >
                                                                <Pencil className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                                                Ubah
                                                            </Link>
                                                        )}
                                                        {can.includes(
                                                            'd-village-agendas',
                                                        ) && (
                                                            <SingleDeleteDialog
                                                                title="Agenda Desa"
                                                                itemName={
                                                                    agenda.title
                                                                }
                                                                label="Hapus"
                                                                onConfirm={() =>
                                                                    router.delete(
                                                                        route(
                                                                            'village-agendas.destroy',
                                                                            {
                                                                                village_agenda:
                                                                                    agenda.id,
                                                                            },
                                                                        ),
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div
                                className={`t-size3 bg-green-50 ${
                                    shouldShowPagination
                                        ? 'px-3 py-2 bp360:px-3.25 bp400:px-3.5 md:px-4'
                                        : 'mb-7'
                                }`}
                            >
                                <InertiaPagination pagination={agendas} />
                            </div>
                        </div>
                    ) : (
                        <div className="t-size3 mb-3 bg-(--secondary)/15 p-3 text-center font-semibold text-(--primary)">
                            Data Tidak Ditemukan
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

VillageAgendaIndex.layout = {
    breadcrumbs: [
        {
            title: 'Kelola Agenda Desa',
            href: route('village-agendas.index'),
        },
    ],
};
