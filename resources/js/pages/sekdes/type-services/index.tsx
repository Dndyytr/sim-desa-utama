import { Head, router, usePage } from '@inertiajs/react';
import { Filter } from 'lucide-react';
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
import { bulkDelete, destroy, index } from '@/routes/type-services';

import AddModalTypeService from './add-modal';
import EditModalTypeService from './edit-modal';

interface TypeService {
    id: number;
    service_code: string;
    service_name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function TypeServicesIndex({
    typeServices,
    entries,
    search,
    sort,
    status,
    hasFilter,
}: {
    typeServices: {
        data: TypeService[];
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
            setSelected(
                typeServices.data.map((typeService) =>
                    typeService.id.toString(),
                ),
            );
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

    // Query filter yang harus tetap terbawa saat user mencari atau mengganti jumlah entries.
    const queryFilters = {
        sort: hasFilter ? sort : undefined,
        status: status || undefined,
    };

    // Pusat perubahan query untuk filter/sort. Nilai kosong dibuang agar URL tetap bersih.
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

    // Satu dropdown Filter berisi 3 jenis value: sort.
    // Memilih role/status akan menghapus filter lain agar dropdown hanya punya satu pilihan aktif.
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
                sort: 'created_asc',
                status: selectedValue === 'all' ? undefined : selectedValue,
            });
        }
    };

    // Check if pagination should be shown
    const shouldShowPagination = typeServices.last_page > 1;

    // TypeService argument untuk delete
    type DestroyTypeServiceArg = Parameters<typeof destroy>[0];

    // TypeService argument untuk delete
    const typeServiceRouteArg = (id: TypeService['id']) =>
        ({ type_service: String(id) }) as unknown as DestroyTypeServiceArg;

    return (
        <>
            <Head title="Kelola Jenis Layanan" />

            <div className="flex flex-col gap-2 px-2 py-2 bp360:gap-2.25 bp360:px-2.25 bp400:gap-2.5 bp400:px-2.5 md:gap-2.75 md:px-3 md:py-2.25 lg:gap-3 lg:px-3.5 lg:py-2.5 xl:gap-3.5 xl:px-4 xl:py-3 2xl:gap-4 2xl:px-4.5 2xl:py-3.5">
                {/* Search Bar */}
                <div className="flex w-full max-w-full items-center gap-2 md:max-w-[70%] lg:max-w-1/2">
                    <SearchBar
                        route={route('type-services.index')}
                        search={search}
                        formId="search-type-services"
                        query={{ entries, ...queryFilters }}
                    />
                    <Button
                        type="submit"
                        form="search-type-services"
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
                                    <SelectItem value="sort:updated_desc">
                                        Terakhir Diubah
                                    </SelectItem>
                                    <SelectItem value="sort:updated_asc">
                                        Paling Lama Diubah
                                    </SelectItem>
                                    <SelectItem value="sort:name_asc">
                                        Nama A-Z
                                    </SelectItem>
                                    <SelectItem value="sort:name_desc">
                                        Nama Z-A
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
                        {selected.length > 0 &&
                            can.includes('d-type-services') && (
                                <BulkDeleteDialog
                                    title="Jenis Layanan"
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

                    <div className="flex items-center gap-2 justify-self-end">
                        <Entries
                            route={route('type-services.index')}
                            search={search}
                            entries={entries}
                            query={queryFilters}
                        />
                        {can.includes('c-type-services') && (
                            <AddModalTypeService />
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="sb-primary relative mt-1 overflow-x-auto rounded-lg bg-green-50 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:rounded-xl">
                    {typeServices.data.length > 0 ? (
                        <div className="bg-white">
                            <table className="w-full">
                                <thead className="bg-(--secondary)/15">
                                    <tr className="t-size3 text-(--primary)">
                                        {can.includes('d-type-services') && (
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
                                                            typeServices.data
                                                                .length &&
                                                        typeServices.data
                                                            .length > 0
                                                    }
                                                />
                                            </th>
                                        )}
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            <span>NO</span>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            <span>Kode Layanan</span>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            <span>Nama Layanan</span>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            <span>Deskripsi</span>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            <span>Status</span>
                                        </th>
                                        {(can.includes('u-type-services') ||
                                            can.includes(
                                                'd-type-services',
                                            )) && (
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-center font-semibold"
                                            >
                                                <span>Aksi</span>
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {typeServices.data.map(
                                        (typeService, index) => (
                                            <tr
                                                key={typeService.id}
                                                className="t-size2 border-b-[1.5px] border-(--primary)/10 text-(--font-color) last:border-b-0 even:bg-(--primary)/3"
                                            >
                                                {can.includes(
                                                    'd-type-services',
                                                ) && (
                                                    <td className="px-4 py-2 text-center">
                                                        <Checkbox
                                                            className="size-4.5 rounded-sm border-(--font-color)/70 bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.5 xl:size-5.75 2xl:size-6 [&>span>svg]:size-4 bp360:[&>span>svg]:size-4.25 bp400:[&>span>svg]:size-4.5 md:[&>span>svg]:size-4.75 lg:[&>span>svg]:size-5 xl:[&>span>svg]:size-5.25 2xl:[&>span>svg]:size-5.5"
                                                            onCheckedChange={() =>
                                                                toggleSelection(
                                                                    typeService.id.toString(),
                                                                )
                                                            }
                                                            checked={selected.includes(
                                                                typeService.id.toString(),
                                                            )}
                                                        />
                                                    </td>
                                                )}
                                                <td
                                                    scope="row"
                                                    className="px-4 py-2 text-center font-medium"
                                                >
                                                    {typeServices.from + index}
                                                </td>
                                                <td className="px-4 py-2 text-center font-bold">
                                                    {typeService.service_code}
                                                </td>
                                                <td className="px-4 py-2 text-center font-medium">
                                                    {typeService.service_name}
                                                </td>
                                                <td className="px-4 py-2 text-center font-medium">
                                                    {typeService.description ||
                                                        '-'}
                                                </td>
                                                <td className="px-4 py-2 text-center font-medium">
                                                    <span
                                                        className={`rounded-full bg-${typeService.is_active ? '(--primary)/10' : 'red-100'} px-2.5 py-1.5 whitespace-nowrap text-${
                                                            typeService.is_active
                                                                ? '(--primary)'
                                                                : 'red-600'
                                                        }`}
                                                    >
                                                        {typeService.is_active
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                {(can.includes(
                                                    'u-type-services',
                                                ) ||
                                                    can.includes(
                                                        'd-type-services',
                                                    )) && (
                                                    <td className="px-4 py-2 text-center">
                                                        <div className="flex justify-center space-x-2">
                                                            {can.includes(
                                                                'u-type-services',
                                                            ) && (
                                                                <EditModalTypeService
                                                                    typeService={
                                                                        typeService
                                                                    }
                                                                />
                                                            )}
                                                            {can.includes(
                                                                'd-type-services',
                                                            ) && (
                                                                <SingleDeleteDialog
                                                                    title="Jenis Layanan"
                                                                    itemName={
                                                                        typeService.service_name
                                                                    }
                                                                    label="Hapus"
                                                                    onConfirm={() =>
                                                                        router.delete(
                                                                            destroy(
                                                                                typeServiceRouteArg(
                                                                                    typeService.id,
                                                                                ),
                                                                            )
                                                                                .url,
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
                                        ),
                                    )}
                                </tbody>
                            </table>
                            <div
                                className={`t-size3 bg-green-50 ${
                                    shouldShowPagination
                                        ? 'px-3 py-2 bp360:px-3.25 bp400:px-3.5 md:px-4'
                                        : 'mb-7'
                                }`}
                            >
                                <InertiaPagination pagination={typeServices} />
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

TypeServicesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Kelola Jenis Layanan',
            href: index(),
        },
    ],
};
