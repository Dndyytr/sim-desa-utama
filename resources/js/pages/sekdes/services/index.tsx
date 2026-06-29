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
    assigned_to: {
        id: number;
        name: string;
    } | null;
}

export default function ServicesIndex({
    services,
    entries,
    search,
    sort,
    status,
    disposition,
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
    disposition?: string | null;
    i: number;
}) {
    const currentStatus = status || 'all';
    const currentDisposition = disposition || 'all';

    const handleQueryChange = (
        query: Record<string, string | number | null | undefined>,
    ) => {
        const params: Record<string, string | number | null | undefined> = {
            search: search || undefined,
            entries,
            sort: sort || undefined,
            status: status || undefined,
            disposition: disposition || undefined,
            ...query,
        };

        Object.keys(params).forEach((key) => {
            if (params[key] === undefined || params[key] === null) {
                delete params[key];
            }
        });

        router.get(route('services.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = (value: string) => {
        handleQueryChange({
            status: value === 'all' ? undefined : value,
        });
    };

    const handleDispositionChange = (value: string) => {
        handleQueryChange({
            disposition: value === 'all' ? undefined : value,
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

    return (
        <>
            <Head title="Disposisi Layanan" />

            <div className="flex flex-col gap-2 px-2 py-2 bp360:gap-2.25 bp360:px-2.25 bp400:gap-2.5 bp400:px-2.5 md:gap-2.75 md:px-3 md:py-2.25 lg:gap-3 lg:px-3.5 lg:py-2.5 xl:gap-3.5 xl:px-4 xl:py-3 2xl:gap-4 2xl:px-4.5 2xl:py-3.5">
                {/* Search Bar */}
                <div className="flex w-full max-w-full items-center gap-2 md:max-w-[70%] lg:max-w-1/2">
                    <SearchBar
                        route={route('services.index')}
                        search={search}
                        formId="search-services"
                        query={{
                            entries,
                            status: status || undefined,
                            disposition: disposition || undefined,
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
                            <SelectTrigger className="t-size3 w-full gap-1.5 bg-(--secondary)/30 font-medium text-(--primary) hover:bg-(--secondary)/50 active:bg-(--secondary)/50 data-placeholder:text-(--primary) bp360:w-37.5">
                                <SelectValue placeholder="Status Layanan" />
                            </SelectTrigger>
                            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                <SelectGroup>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="processing">
                                        Diproses
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        Disetujui
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Selesai
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Disposition Filter */}
                        <Select
                            value={currentDisposition}
                            onValueChange={handleDispositionChange}
                        >
                            <SelectTrigger className="t-size3 w-full gap-1.5 bg-(--secondary)/30 font-medium text-(--primary) hover:bg-(--secondary)/50 active:bg-(--secondary)/50 data-placeholder:text-(--primary) bp360:w-42.5">
                                <SelectValue placeholder="Status Disposisi" />
                            </SelectTrigger>
                            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                <SelectGroup>
                                    <SelectItem value="all">
                                        Semua Status Disposisi
                                    </SelectItem>
                                    <SelectItem value="disposed">
                                        Sudah Didisposisikan
                                    </SelectItem>
                                    <SelectItem value="not_disposed">
                                        Belum Didisposisikan
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
                                        Terbaru
                                    </SelectItem>
                                    <SelectItem value="created_asc">
                                        Terlama
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

                    <div className="flex items-center gap-2 justify-self-end">
                        <Entries
                            route={route('services.index')}
                            query={{
                                search,
                                status: status || undefined,
                                disposition: disposition || undefined,
                                sort,
                            }}
                            entries={entries}
                        />
                    </div>
                </div>

                {/* Table Data */}
                <div className="mt-1">
                    {services.data.length > 0 ? (
                        <div className="sb-primary relative overflow-x-auto rounded-lg bg-green-50 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:rounded-xl">
                            <table className="w-full bg-white">
                                <thead className="bg-(--secondary)/15">
                                    <tr className="t-size3 text-(--primary)">
                                        <th className="px-4 py-3 text-center font-semibold">
                                            No
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            No. Layanan
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Pemohon (NIK)
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Jenis Layanan
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Judul
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Disposisi Ke
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.data.map((service, index) => (
                                        <tr
                                            key={service.id}
                                            className="t-size2 border-b-[1.5px] border-(--primary)/10 text-(--font-color) last:border-b-0 even:bg-(--primary)/3"
                                        >
                                            <td className="px-4 py-2 text-center font-medium">
                                                {i + index + 1}
                                            </td>
                                            <td className="px-4 py-2 text-center font-semibold text-(--primary)">
                                                {service.service_number}
                                            </td>
                                            <td className="px-4 py-2 text-center font-medium">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">
                                                        {
                                                            service.submission
                                                                ?.resident?.name
                                                        }
                                                    </span>
                                                    <span className="t-size1 text-stone-500">
                                                        {
                                                            service.submission
                                                                ?.resident?.nik
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center font-medium">
                                                {
                                                    service.submission
                                                        ?.type_service
                                                        ?.service_name
                                                }
                                            </td>
                                            <td className="px-4 py-2 text-center font-medium">
                                                {service.submission?.subject}
                                            </td>
                                            <td className="px-4 py-2 text-center font-medium">
                                                {service.assigned_to ? (
                                                    <span className="font-semibold text-stone-800">
                                                        {
                                                            service.assigned_to
                                                                .name
                                                        }
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-400 italic">
                                                        Belum Didisposisikan
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <span
                                                    className={`t-size1 rounded-full px-2.5 py-1 font-semibold whitespace-nowrap ${getStatusBadge(
                                                        service.status,
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        service.status,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Link
                                                        href={route(
                                                            'services.show',
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
                                    ))}
                                </tbody>
                            </table>
                            <div
                                className={`t-size3 bg-green-50 ${shouldShowPagination ? 'px-3 py-2 bp360:px-3.25 bp400:px-3.5 md:px-4' : 'mb-7'}`}
                            >
                                <InertiaPagination pagination={services} />
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

ServicesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Disposisi Layanan',
            href: route('services.index'),
        },
    ],
};
