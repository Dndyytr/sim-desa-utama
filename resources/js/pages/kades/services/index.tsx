import { Head, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Entries } from '@/components/ui/entries';
import { InertiaPagination } from '@/components/ui/inertia-pagination';
import { SearchBar } from '@/components/ui/search-bar';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index as servicesIndexRoute } from '@/routes/kades/services';

interface Service {
    id: number;
    service_number: string;
    submission_id: number;
    status: 'processing' | 'approved' | 'completed' | 'rejected';
    notes: string | null;
    created_at: string;
    updated_at: string;
    submission?: {
        id: number;
        submission_number: string;
        subject: string;
        resident?: {
            id: number;
            nik: string;
            name: string;
        };
        type_service?: {
            id: number;
            service_code: string;
            service_name: string;
        };
    };
}

export default function ServicesIndex({
    services,
    entries,
    search,
    sort,
    status,
    i,
}: {
    services: {
        data: Service[];
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
    i: number;
}) {
    const currentStatus = status || 'approved';

    const handleQueryChange = (
        query: Record<string, string | number | null | undefined>,
    ) => {
        const params: Record<string, string | number | null | undefined> = {
            search: search || undefined,
            entries,
            sort: sort || undefined,
            status: status || undefined,
            ...query,
        };

        Object.keys(params).forEach((key) => {
            if (params[key] === undefined || params[key] === null) {
                delete params[key];
            }
        });

        router.get(servicesIndexRoute().url, params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = (value: string) => {
        handleQueryChange({
            status: value,
        });
    };

    const handleSortChange = (value: string) => {
        handleQueryChange({
            sort: value,
        });
    };

    const shouldShowPagination = services.last_page > 1;

    const getStatusBadge = (status: Service['status']) => {
        switch (status) {
            case 'processing':
                return 'bg-amber-100 text-amber-800'; // Revisi/Diproses
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

    return (
        <>
            <Head title="Persetujuan Akhir Layanan" />

            <div className="flex flex-col gap-2 px-2 py-2 bp360:gap-2.25 bp360:px-2.25 bp400:gap-2.5 bp400:px-2.5 md:gap-2.75 md:px-3 md:py-2.25 lg:gap-3 lg:px-3.5 lg:py-2.5 xl:gap-3.5 xl:px-4 xl:py-3 2xl:gap-4 2xl:px-4.5 2xl:py-3.5">
                {/* Search Bar */}
                <div className="flex w-full max-w-full items-center gap-2 md:max-w-[70%] lg:max-w-1/2">
                    <SearchBar
                        route={servicesIndexRoute().url}
                        search={search}
                        formId="search-services"
                        query={{
                            entries,
                            status: status || undefined,
                            sort,
                        }}
                    />
                    <Button
                        type="submit"
                        form="search-services"
                        className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                    >
                        Cari
                    </Button>
                </div>

                {/* Toolbar */}
                <div className="grid items-center justify-between gap-2 md:grid-cols-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Filter */}
                        <Select
                            value={currentStatus}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger className="t-size3 w-full gap-1.5 bg-(--secondary)/30 font-medium text-(--primary) hover:bg-(--secondary)/50 active:bg-(--secondary)/50 data-placeholder:text-(--primary) bp360:w-48">
                                <SelectValue placeholder="Status Persetujuan" />
                            </SelectTrigger>
                            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                <SelectGroup>
                                    <SelectItem value="approved">
                                        Menunggu Persetujuan
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Disetujui (Selesai)
                                    </SelectItem>
                                    <SelectItem value="processing">
                                        Perlu Revisi (Diproses)
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Ditolak (Batal)
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Sort Filter */}
                        <Select
                            value={sort || 'created_desc'}
                            onValueChange={handleSortChange}
                        >
                            <SelectTrigger className="t-size3 w-full gap-1.5 bg-(--secondary)/30 font-medium text-(--primary) hover:bg-(--secondary)/50 active:bg-(--secondary)/50 data-placeholder:text-(--primary) bp360:w-40">
                                <SelectValue placeholder="Urutan" />
                            </SelectTrigger>
                            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                <SelectGroup>
                                    <SelectItem value="created_desc">
                                        Baru Masuk
                                    </SelectItem>
                                    <SelectItem value="created_asc">
                                        Paling Lama
                                    </SelectItem>
                                    <SelectItem value="number_asc">
                                        No. Layanan A-Z
                                    </SelectItem>
                                    <SelectItem value="number_desc">
                                        No. Layanan Z-A
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-end">
                        <Entries
                            entries={entries}
                            route={servicesIndexRoute().url}
                            query={{
                                search: search || undefined,
                                status: status || undefined,
                                sort,
                            }}
                        />
                    </div>
                </div>

                {/* Table Container */}
                <div className="w-full overflow-hidden rounded-lg bg-white p-3 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)]">
                    <div className="w-full overflow-x-auto">
                        <table className="t-size2 w-full table-auto border-collapse text-left">
                            <thead>
                                <tr className="border-b-2 border-stone-200 text-stone-500">
                                    <th className="px-3 py-2.5 font-bold">
                                        No
                                    </th>
                                    <th className="px-3 py-2.5 font-bold">
                                        No. Layanan
                                    </th>
                                    <th className="px-3 py-2.5 font-bold">
                                        Pemohon
                                    </th>
                                    <th className="px-3 py-2.5 font-bold">
                                        Jenis Layanan
                                    </th>
                                    <th className="px-3 py-2.5 font-bold">
                                        Subjek
                                    </th>
                                    <th className="px-3 py-2.5 font-bold">
                                        Tgl Pengajuan
                                    </th>
                                    <th className="px-3 py-2.5 text-center font-bold">
                                        Status
                                    </th>
                                    <th className="px-3 py-2.5 text-center font-bold">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.data.length > 0 ? (
                                    services.data.map((service, index) => (
                                        <tr
                                            key={service.id}
                                            className="border-b border-stone-100 transition-colors hover:bg-stone-50"
                                        >
                                            <td className="px-3 py-3.5 font-medium text-stone-600">
                                                {i + index}
                                            </td>
                                            <td className="px-3 py-3.5 font-bold text-(--primary)">
                                                {service.service_number}
                                                <span className="t-size1 block font-semibold text-stone-400">
                                                    Req:{' '}
                                                    {
                                                        service.submission
                                                            ?.submission_number
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5 font-bold text-stone-800">
                                                {
                                                    service.submission?.resident
                                                        ?.name
                                                }
                                                <span className="t-size1 block font-semibold text-stone-500">
                                                    {
                                                        service.submission
                                                            ?.resident?.nik
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5 font-semibold text-stone-700">
                                                {
                                                    service.submission
                                                        ?.type_service
                                                        ?.service_name
                                                }
                                            </td>
                                            <td className="max-w-64 truncate px-3 py-3.5 font-medium text-stone-600">
                                                {service.submission?.subject}
                                            </td>
                                            <td className="px-3 py-3.5 font-medium text-stone-500">
                                                {new Date(
                                                    service.created_at,
                                                ).toLocaleDateString('id-ID', {
                                                    dateStyle: 'medium',
                                                })}
                                            </td>
                                            <td className="px-3 py-3.5 text-center">
                                                <span
                                                    className={`t-size1 inline-block rounded-full px-2.5 py-1 font-bold whitespace-nowrap ${getStatusBadge(
                                                        service.status,
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        service.status,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Link
                                                        href={route(
                                                            'kades.services.show',
                                                            service.id,
                                                        )}
                                                        className="inline-flex items-center gap-1 rounded-md border-[1.7px] border-(--primary)/50 bg-(--primary)/10 px-2.5 py-1.5 font-medium text-(--primary) transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-(--primary)/70 hover:bg-(--primary)/20 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:border-(--primary)/70 active:bg-(--primary)/20 active:shadow-none bp360:px-3 bp360:py-2"
                                                    >
                                                        <Eye className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                                        Detail
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-3 py-8 text-center text-stone-400 italic"
                                        >
                                            Tidak ada data layanan yang
                                            ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {shouldShowPagination && (
                        <div className="mt-4 flex justify-center">
                            <InertiaPagination pagination={services} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ServicesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Persetujuan Akhir',
            href: servicesIndexRoute().url,
        },
    ],
};
