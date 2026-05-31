import { Head, Link, router, usePage } from '@inertiajs/react';
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
import { bulkDelete, destroy, index } from '@/routes/users';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    email_verified_at: string | null;
    roles: Role[];
    created_at: string;
    updated_at: string;
}

// Halaman listing pengguna menerima data yang sudah diproses dari UserController@index.
// Props di bawah berisi data tabel, daftar role untuk filter, serta state query aktif.
export default function UsersIndex({
    users,
    // roles,
    // i,
    entries,
    search,
    sort,
    // role,
    verified,
    hasFilter,
    // pagination,
}: {
    users: {
        data: User[];
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
    roles: Role[];
    i: number;
    entries: any;
    search: string;
    sort: string;
    role?: string | number | null;
    verified?: string | null;
    hasFilter: boolean;
    pagination?: any;
}) {
    // State lokal hanya menyimpan checkbox yang dipilih untuk kebutuhan bulk delete.
    const [selected, setSelected] = useState<string[]>([]);

    const { can }: any = usePage().props;

    // Normalisasi value filter dari props agar cocok dengan format value Select.
    // const currentRole = role ? role.toString() : 'all';
    const currentVerified = verified || 'all';

    // Jika belum ada filter dari URL, Select dibiarkan undefined agar placeholder "Filter" muncul.
    const currentFilter = hasFilter
        ? // ? role
          //     ? `role:${currentRole}`
          // : verified
          verified
            ? `verified:${currentVerified}`
            : `sort:${sort}`
        : undefined;

    // Query filter yang harus tetap terbawa saat user mencari atau mengganti jumlah entries.
    const queryFilters = {
        sort: hasFilter ? sort : undefined,
        // role: role || undefined,
        verified: verified || undefined,
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

    // Satu dropdown Filter berisi 3 jenis value: sort, role, dan verified.
    // Memilih role/status akan menghapus filter lain agar dropdown hanya punya satu pilihan aktif.
    const handleFilterChange = (value: string) => {
        const [type, selectedValue] = value.split(':');

        if (type === 'sort') {
            handleQueryChange({
                sort: selectedValue,
                role: undefined,
                verified: undefined,
            });

            return;
        }

        // if (type === 'role') {
        //     handleQueryChange({
        //         sort: 'created_asc',
        //         role: selectedValue,
        //         verified: undefined,
        //     });

        //     return;
        // }

        if (type === 'verified') {
            handleQueryChange({
                sort: 'created_asc',
                role: undefined,
                verified: selectedValue,
            });
        }
    };

    // Checkbox header memilih semua user yang tampil di halaman pagination saat ini.
    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(users.data.map((user) => user.id.toString()));
        } else {
            setSelected([]);
        }
    };

    // Checkbox per baris menambah/menghapus id user dari daftar bulk delete.
    const toggleSelection = (id: string) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    // Check if pagination should be shown
    const shouldShowPagination = users.last_page > 1;

    type DestroyUserArg = Parameters<typeof destroy>[0];

    const userRouteArg = (id: User['id']) =>
        ({ id: String(id) }) as unknown as DestroyUserArg;

    return (
        <>
            <Head title="Kelola Pengguna" />

            <div className="flex flex-col gap-2 px-2 py-2 bp360:gap-2.25 bp360:px-2.25 bp400:gap-2.5 bp400:px-2.5 md:gap-2.75 md:px-3 md:py-2.25 lg:gap-3 lg:px-3.5 lg:py-2.5 xl:gap-3.5 xl:px-4 xl:py-3 2xl:gap-4 2xl:px-4.5 2xl:py-3.5">
                {/* SearchBar mengirim keyword ke server dan tetap membawa filter yang sedang aktif. */}
                <div className="flex w-full max-w-full items-center gap-2 md:max-w-[70%] lg:max-w-1/2">
                    <SearchBar
                        route={route('users.index')}
                        search={search}
                        formId="search-users"
                        query={{ entries, ...queryFilters }}
                    />
                    <Button
                        type="submit"
                        form="search-users"
                        className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                    >
                        Cari
                    </Button>
                </div>

                {/* Toolbar utama: filter/sort di kiri, entries dan tombol tambah di kanan. */}
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
                            {/* Opsi filter memakai prefix value agar handler tahu tipe filter yang dipilih. */}
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
                                {/* <SelectSeparator />
                                <SelectGroup>
                                    <SelectLabel>Peran</SelectLabel>
                                    {roles.map((roleOption) => (
                                        <SelectItem
                                            key={roleOption.id}
                                            value={`role:${roleOption.id}`}
                                        >
                                            {roleOption.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup> */}
                                <SelectSeparator className="bg-(--primary)/60" />
                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem value="verified:verified">
                                        Terverifikasi
                                    </SelectItem>
                                    <SelectItem value="verified:unverified">
                                        Belum Terverifikasi
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {selected.length > 0 && can.includes('d-users') && (
                            /* Bulk delete hanya muncul saat ada minimal satu user dipilih. */
                            <BulkDeleteDialog
                                title="Pengguna"
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
                    <div className="flex flex-wrap items-center gap-2 justify-self-end">
                        <Entries
                            route={route('users.index')}
                            search={search}
                            entries={entries}
                            query={queryFilters}
                        />
                        {can.includes('c-users') && (
                            <Link
                                href={route('users.create')}
                                className="t-size3 flex items-center gap-1.5 rounded-md bg-(--primary) px-2.5 py-1.5 font-medium whitespace-nowrap text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-(--secondary) hover:text-(--primary) hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:bg-(--secondary) active:text-(--primary) active:shadow-none bp360:px-3 bp360:py-2"
                            >
                                <PlusCircle className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                Tambah Baru
                            </Link>
                        )}
                    </div>
                </div>

                {/* Tabel menampilkan data dari paginator Inertia; filter/search selalu dilakukan di server. */}
                <div className="sb-primary relative mt-1 overflow-x-auto rounded-lg bg-green-50 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:rounded-xl">
                    {users.data.length > 0 ? (
                        <div className="bg-white">
                            <table className="w-full">
                                <thead className="bg-(--secondary)/15">
                                    <tr className="t-size3 text-(--primary)">
                                        {can.includes('d-users') && (
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
                                                            users.data.length &&
                                                        users.data.length > 0
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
                                            <span>Nama</span>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            <span>Email</span>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-center font-semibold"
                                        >
                                            <span>Peran</span>
                                        </th>
                                        {(can.includes('u-users') ||
                                            can.includes('d-users')) && (
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
                                    {users.data.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className="t-size2 border-b-[1.5px] border-(--primary)/10 text-(--font-color) last:border-b-0 even:bg-(--primary)/3"
                                        >
                                            {can.includes('d-users') && (
                                                <td className="px-4 py-2 text-center">
                                                    <Checkbox
                                                        className="size-4.5 rounded-sm border-(--font-color)/70 bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.5 xl:size-5.75 2xl:size-6 [&>span>svg]:size-4 bp360:[&>span>svg]:size-4.25 bp400:[&>span>svg]:size-4.5 md:[&>span>svg]:size-4.75 lg:[&>span>svg]:size-5 xl:[&>span>svg]:size-5.25 2xl:[&>span>svg]:size-5.5"
                                                        onCheckedChange={() =>
                                                            toggleSelection(
                                                                user.id.toString(),
                                                            )
                                                        }
                                                        checked={selected.includes(
                                                            user.id.toString(),
                                                        )}
                                                    />
                                                </td>
                                            )}
                                            <td
                                                scope="row"
                                                className="px-4 py-2 text-center font-medium"
                                            >
                                                {users.from + index}
                                            </td>
                                            <td className="px-4 py-2 text-center font-medium">
                                                {user.name}
                                            </td>
                                            <td className="px-4 py-2 text-center font-medium">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-2 text-center font-medium">
                                                <div className="inline-flex flex-wrap gap-1">
                                                    {user.roles.length > 0 ? (
                                                        user.roles.map(
                                                            (role) => (
                                                                <span
                                                                    key={
                                                                        role.id
                                                                    }
                                                                    className="rounded-full bg-(--primary)/10 px-2.5 py-1.5 whitespace-nowrap text-(--primary)"
                                                                >
                                                                    {role.name}
                                                                </span>
                                                            ),
                                                        )
                                                    ) : (
                                                        <span className="rounded-full bg-(--primary)/10 px-2.5 py-1.5 whitespace-nowrap text-(--primary)">
                                                            Tidak Ada
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            {(can.includes('u-users') ||
                                                can.includes('d-users')) && (
                                                <td className="px-4 py-2 text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        {can.includes(
                                                            'u-users',
                                                        ) && (
                                                            <Link
                                                                href={route(
                                                                    'users.edit',
                                                                    user.id,
                                                                )}
                                                                className="inline-flex items-center gap-1 rounded-md border-[1.7px] border-(--secondary)/50 bg-(--secondary)/10 px-2.5 py-1.5 font-medium text-yellow-500 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-(--secondary)/70 hover:bg-(--secondary)/50 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:border-(--secondary)/70 active:bg-(--secondary)/50 active:shadow-none bp360:px-3 bp360:py-2"
                                                            >
                                                                <Pencil className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                                                Ubah
                                                            </Link>
                                                        )}
                                                        {/* Untuk single delete */}
                                                        {can.includes(
                                                            'd-users',
                                                        ) && (
                                                            <SingleDeleteDialog
                                                                title="Pengguna"
                                                                itemName={
                                                                    user.name
                                                                }
                                                                label="Hapus"
                                                                onConfirm={() =>
                                                                    router.delete(
                                                                        destroy(
                                                                            userRouteArg(
                                                                                user.id,
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
                            {/* Pagination memakai link dari Laravel paginator yang sudah membawa query aktif. */}
                            <div
                                className={`t-size3 bg-green-50 ${
                                    shouldShowPagination
                                        ? 'px-3 py-2 bp360:px-3.25 bp400:px-3.5 md:px-4'
                                        : 'mb-7'
                                }`}
                            >
                                <InertiaPagination pagination={users} />
                            </div>
                        </div>
                    ) : (
                        <div className="t-size3 mb-3 bg-(--secondary)/15 p-3 text-center font-semibold text-(--primary)">
                            Data Tidak Ditemukan
                        </div>
                    )}
                </div>

                {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Kelola Pengguna',
            href: index(),
        },
    ],
};
