import { Head, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Eye, Printer } from 'lucide-react';

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
import { index as lettersIndexRoute } from '@/routes/kadangs/letters';

interface Service {
    id: number;
    service_number: string;
    submission_id: number;
    status: 'completed' | 'finished';
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
    letter?: {
        id: number;
        letter_number: string;
        file_path: string;
    };
}

export default function LettersIndex({
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
    const currentStatus = status || 'all';

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

        router.get(lettersIndexRoute().url, params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = (value: string) => {
        handleQueryChange({
            status: value === 'all' ? undefined : value,
        });
    };

    const handleSortChange = (value: string) => {
        handleQueryChange({
            sort: value,
        });
    };

    const shouldShowPagination = services.last_page > 1;

    return (
        <>
            <Head title="Generate Surat Resmi" />

            <div className="flex flex-col gap-2 px-2 py-2 bp360:gap-2.25 bp360:px-2.25 bp400:gap-2.5 bp400:px-2.5 md:gap-2.75 md:px-3 md:py-2.25 lg:gap-3 lg:px-3.5 lg:py-2.5 xl:gap-3.5 xl:px-4 xl:py-3 2xl:gap-4 2xl:px-4.5 2xl:py-3.5">
                {/* Search Bar */}
                <div className="flex w-full max-w-full items-center gap-2 md:max-w-[70%] lg:max-w-1/2">
                    <SearchBar
                        route={lettersIndexRoute().url}
                        search={search}
                        formId="search-letters"
                        query={{
                            entries,
                            status: status || undefined,
                            sort,
                        }}
                    />
                    <Button
                        type="submit"
                        form="search-letters"
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
                            <SelectTrigger className="t-size3 w-full gap-1.5 bg-(--secondary)/30 font-medium text-(--primary) hover:bg-(--secondary)/50 active:bg-(--secondary)/50 data-placeholder:text-(--primary) bp360:w-40">
                                <SelectValue placeholder="Status Penerbitan" />
                            </SelectTrigger>
                            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                <SelectGroup>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Belum Terbit
                                    </SelectItem>
                                    <SelectItem value="finished">
                                        Sudah Terbit
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
                                        No Layanan A-Z
                                    </SelectItem>
                                    <SelectItem value="number_desc">
                                        No Layanan Z-A
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-start gap-1 md:justify-end">
                        <span className="t-size3 font-medium text-(--primary)">
                            Tampilkan:
                        </span>
                        <Entries
                            route={lettersIndexRoute().url}
                            entries={entries}
                            query={{
                                search: search || undefined,
                                status: status || undefined,
                                sort,
                            }}
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
                                            Nomor Layanan
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            NIK & Nama Pemohon
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Jenis Layanan
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Tanggal Pengajuan
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
                                                    <span className="t-size1 font-normal text-stone-500">
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
                                                {new Date(
                                                    service.created_at,
                                                ).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {service.status ===
                                                'completed' ? (
                                                    <span className="t-size1 rounded-full bg-yellow-100 px-2.5 py-1.5 font-semibold whitespace-nowrap text-yellow-800">
                                                        Belum Terbit
                                                    </span>
                                                ) : (
                                                    <span className="t-size1 rounded-full bg-green-100 px-2.5 py-1.5 font-semibold whitespace-nowrap text-green-800">
                                                        Sudah Terbit
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    {service.status ===
                                                    'completed' ? (
                                                        <Link
                                                            href={route(
                                                                'kadangs.letters.create',
                                                                {
                                                                    service_id:
                                                                        service.id,
                                                                },
                                                            )}
                                                            className="inline-flex items-center gap-1 rounded-md border-[1.7px] border-emerald-500/50 bg-emerald-50 px-2.5 py-1.5 font-medium text-emerald-700 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-emerald-600 hover:bg-emerald-100 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.15)] active:translate-y-0.5 active:shadow-none bp360:px-3 bp360:py-2"
                                                        >
                                                            <Printer className="size-3.5 bp360:size-4" />
                                                            Generate Surat
                                                        </Link>
                                                    ) : (
                                                        service.letter && (
                                                            <Link
                                                                href={route(
                                                                    'kadangs.letters.show',
                                                                    service
                                                                        .letter
                                                                        .id,
                                                                )}
                                                                className="inline-flex items-center gap-1 rounded-md border-[1.7px] border-(--primary)/50 bg-(--primary)/10 px-2.5 py-1.5 font-medium text-(--primary) transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-(--primary)/70 hover:bg-(--primary)/20 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:border-(--primary)/70 active:bg-(--primary)/20 active:shadow-none bp360:px-3 bp360:py-2"
                                                            >
                                                                <Eye className="size-3.5 bp360:size-4" />
                                                                Detail
                                                            </Link>
                                                        )
                                                    )}
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

LettersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Generate Surat',
            href: lettersIndexRoute().url,
        },
    ],
};
