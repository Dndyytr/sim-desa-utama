import { Head, router, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Filter, Pencil, PlusCircle } from 'lucide-react';
import { useState } from 'react';

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
import { bulkDelete, destroy, index } from '@/routes/familys';

interface Family {
    id: number;
    no_kk: string;
    head_resident_id: number;
    address: string;
    rt?: string;
    rw?: string;
    hamlet?: string;
    status: boolean;
    created_at: string;
    updated_at: string;
    head_resident?: {
        id: number;
        nik: string;
        name: string;
    };
    members_count?: number;
}

export default function FamilysIndex({
    familys,
    entries,
    search,
    sort,
    status,
    hasFilter,
}: {
    familys: {
        data: Family[];
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
    entries: any;
    search: string;
    sort: string;
    status?: string | null;
    hasFilter: boolean;
}) {
    const [selected, setSelected] = useState<string[]>([]);
    const { can }: any = usePage().props;

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(familys.data.map((family) => family.id.toString()));
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

    const currentStatus = status || 'all';

    const currentFilter = hasFilter
        ? status
            ? `status:${currentStatus}`
            : `sort:${sort}`
        : undefined;

    const queryFilters = {
        sort: hasFilter ? sort : undefined,
        status: status || undefined,
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
            if (params[key] === undefined || params[key] === null) {
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
            handleQueryChange({
                sort: selectedValue,
                status: undefined,
            });

            return;
        }

        if (type === 'status') {
            handleQueryChange({
                sort: 'created_desc',
                status: selectedValue === 'all' ? undefined : selectedValue,
            });
        }
    };

    const shouldShowPagination = familys.last_page > 1;

    type DestroyFamilyArg = Parameters<typeof destroy>[0];

    const familyRouteArg = (id: Family['id']) =>
        ({ family: String(id) }) as unknown as DestroyFamilyArg;

    return (
        <>
            <Head title="Kelola Data Keluarga" />

            <div className="flex flex-col gap-2 px-2 py-2 bp360:gap-2.25 bp360:px-2.25 bp400:gap-2.5 bp400:px-2.5 md:gap-2.75 md:px-3 md:py-2.25 lg:gap-3 lg:px-3.5 lg:py-2.5 xl:gap-3.5 xl:px-4 xl:py-3 2xl:gap-4 2xl:px-4.5 2xl:py-3.5">
                {/* Search Bar */}
                <div className="flex w-full max-w-full items-center gap-2 md:max-w-[70%] lg:max-w-1/2">
                    <SearchBar
                        route={route('familys.index')}
                        search={search}
                        formId="search-familys"
                        query={{ entries, ...queryFilters }}
                    />
                    <Button
                        type="submit"
                        form="search-familys"
                        className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                    >
                        Cari
                    </Button>
                </div>

                {/* Toolbar */}
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
                                    <SelectItem value="sort:created_desc">
                                        Waktu Terbaru
                                    </SelectItem>
                                    <SelectItem value="sort:created_asc">
                                        Waktu Terlama
                                    </SelectItem>
                                    <SelectItem value="sort:no_kk_asc">
                                        No. KK A-Z
                                    </SelectItem>
                                    <SelectItem value="sort:no_kk_desc">
                                        No. KK Z-A
                                    </SelectItem>
                                </SelectGroup>
                                <SelectSeparator className="bg-(--primary)/60" />
                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem value="status:all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="status:active">
                                        Aktif
                                    </SelectItem>
                                    <SelectItem value="status:inactive">
                                        Nonaktif
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {selected.length > 0 && can.includes('d-familys') && (
                            <BulkDeleteDialog
                                title="Data Keluarga"
                                selectedCount={selected.length}
                                onConfirm={() => {
                                    router.post(
                                        bulkDelete().url,
                                        { ids: selected },
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => setSelected([]),
                                        },
                                    );
                                }}
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-2 justify-self-end">
                        <Entries
                            route={route('familys.index')}
                            search={search}
                            entries={entries}
                            query={queryFilters}
                        />
                        {can.includes('c-familys') && (
                            <Link
                                className="t-size3 flex items-center gap-1.5 rounded-md bg-(--primary) px-2.5 py-1.5 font-medium whitespace-nowrap text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-(--secondary) hover:text-(--primary) hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:bg-(--secondary) active:text-(--primary) active:shadow-none bp360:px-3 bp360:py-2"
                                href={route('familys.create')}
                            >
                                <PlusCircle className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                Tambah Baru
                            </Link>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="sb-primary relative mt-1 overflow-x-auto rounded-lg bg-green-50 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:rounded-xl">
                    {familys.data.length > 0 ? (
                        <div className="bg-white">
                            <table className="w-full">
                                <thead className="bg-(--secondary)/15">
                                    <tr className="t-size3 text-(--primary)">
                                        {can.includes('d-familys') && (
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-center font-semibold"
                                            >
                                                <Checkbox
                                                    className="size-4.5 rounded-sm border-(--font-color)/70 bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.5 xl:size-5.75 2xl:size-6 [&>span>svg]:size-4 bp360:[&>span>svg]:size-4.25 bp400:[&>span>svg]:size-4.5 md:[&>span>svg]:size-4.75 lg:[&>span>svg]:size-5 xl:[&>span>svg]:size-5.25 2xl:[&>span>svg]:size-5.5"
                                                    onCheckedChange={
                                                        toggleSelectAll
                                                    }
                                                    checked={
                                                        selected.length ===
                                                            familys.data
                                                                .length &&
                                                        familys.data.length > 0
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
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            No. KK & Kepala Keluarga
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            Alamat
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            Jumlah Anggota
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            Status
                                        </th>
                                        {(can.includes('u-familys') ||
                                            can.includes('d-familys')) && (
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
                                    {familys.data.map((family, idx) => (
                                        <tr
                                            key={family.id}
                                            className="t-size2 border-b-[1.5px] border-(--primary)/10 text-(--font-color) last:border-b-0 even:bg-(--primary)/3"
                                        >
                                            {can.includes('d-familys') && (
                                                <td className="px-4 py-2 text-center">
                                                    <Checkbox
                                                        className="size-4.5 rounded-sm border-(--font-color)/70 bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.5 xl:size-5.75 2xl:size-6 [&>span>svg]:size-4 bp360:[&>span>svg]:size-4.25 bp400:[&>span>svg]:size-4.5 md:[&>span>svg]:size-4.75 lg:[&>span>svg]:size-5 xl:[&>span>svg]:size-5.25 2xl:[&>span>svg]:size-5.5"
                                                        onCheckedChange={() =>
                                                            toggleSelection(
                                                                family.id.toString(),
                                                            )
                                                        }
                                                        checked={selected.includes(
                                                            family.id.toString(),
                                                        )}
                                                    />
                                                </td>
                                            )}
                                            <td className="px-4 py-2 text-center font-medium">
                                                {familys.from + idx}
                                            </td>
                                            <td className="px-4 py-2 text-center font-medium">
                                                <div className="flex flex-col">
                                                    <span className="font-bold">
                                                        {family.no_kk}
                                                    </span>
                                                    <span className="t-size1 font-semibold text-stone-500">
                                                        Kepala:{' '}
                                                        {family.head_resident
                                                            ?.name ||
                                                            'Belum Ditentukan'}
                                                    </span>
                                                    {family.head_resident && (
                                                        <span className="t-size1 text-stone-400">
                                                            NIK:{' '}
                                                            {
                                                                family
                                                                    .head_resident
                                                                    .nik
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center font-medium">
                                                <div className="flex flex-col">
                                                    <span>
                                                        {family.address || '-'}
                                                    </span>
                                                    {(family.rt ||
                                                        family.rw ||
                                                        family.hamlet) && (
                                                        <span className="t-size1 font-semibold text-stone-500">
                                                            RT/RW:{' '}
                                                            {family.rt || '-'}/
                                                            {family.rw || '-'} |
                                                            Dusun:{' '}
                                                            {family.hamlet ||
                                                                '-'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center font-medium">
                                                {family.members_count || 0}{' '}
                                                Orang
                                            </td>
                                            <td className="px-4 py-2 text-center font-medium">
                                                <span
                                                    className={`rounded-full bg-${family.status ? '(--primary)/10' : 'red-100'} px-2.5 py-1.5 whitespace-nowrap text-${
                                                        family.status
                                                            ? '(--primary)'
                                                            : 'red-600'
                                                    }`}
                                                >
                                                    {family.status
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </span>
                                            </td>
                                            {(can.includes('u-familys') ||
                                                can.includes('d-familys')) && (
                                                <td className="px-4 py-2 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        {can.includes(
                                                            'u-familys',
                                                        ) && (
                                                            <Link
                                                                href={route(
                                                                    'familys.edit',
                                                                    {
                                                                        family: family.id,
                                                                    },
                                                                )}
                                                                className="inline-flex items-center gap-1 rounded-md border-[1.7px] border-(--secondary)/50 bg-(--secondary)/10 px-2.5 py-1.5 font-medium text-yellow-500 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-(--secondary)/70 hover:bg-(--secondary)/50 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:border-(--secondary)/70 active:bg-(--secondary)/50 active:shadow-none bp360:px-3 bp360:py-2"
                                                            >
                                                                <Pencil className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                                                Ubah
                                                            </Link>
                                                        )}
                                                        {can.includes(
                                                            'd-familys',
                                                        ) && (
                                                            <SingleDeleteDialog
                                                                title="Data Keluarga"
                                                                itemName={`KK ${family.no_kk}`}
                                                                label="Hapus"
                                                                onConfirm={() =>
                                                                    router.delete(
                                                                        destroy(
                                                                            familyRouteArg(
                                                                                family.id,
                                                                            ),
                                                                        ).url,
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
                                <InertiaPagination pagination={familys} />
                            </div>
                        </div>
                    ) : (
                        <div className="t-size3 mb-3 bg-(--secondary)/15 p-3 text-center font-semibold text-(--primary)">
                            Data Tidak ditemukan
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

FamilysIndex.layout = {
    breadcrumbs: [
        {
            title: 'Data Keluarga',
            href: index(),
        },
    ],
};
