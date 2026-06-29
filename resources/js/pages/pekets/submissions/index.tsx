import { Head, router, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Eye, Pencil, PlusCircle } from 'lucide-react';
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
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SingleDeleteDialog } from '@/components/ui/single-delete';
import { bulkDelete, destroy, index } from '@/routes/submissions';

interface Submission {
    id: number;
    submission_number: string;
    resident_id: number;
    type_service_id: number;
    submitted_by_id?: number;
    subject: string;
    description?: string;
    status:
        | 'pending'
        | 'verified'
        | 'rejected'
        | 'processing'
        | 'approved'
        | 'completed'
        | 'cancelled'
        | 'needs_correction';
    source: 'offline' | 'mobile' | 'website';
    notes?: string;
    created_at: string;
    updated_at: string;
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
    submitted_by?: {
        id: number;
        name: string;
    };
}

export default function SubmissionsIndex({
    submissions,
    entries,
    search,
    sort,
    status,
    source,
    i,
}: {
    submissions: {
        data: Submission[];
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
    source?: string | null;
    i: number;
}) {
    const [selected, setSelected] = useState<string[]>([]);
    const { can }: any = usePage().props;

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            // Only allow selecting pending submissions for bulk delete
            const pendingIds = submissions.data
                .filter((sub) => sub.status === 'pending')
                .map((sub) => sub.id.toString());
            setSelected(pendingIds);
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
    const currentSource = source || 'all';

    const handleQueryChange = (
        query: Record<string, string | number | null | undefined>,
    ) => {
        const params: Record<string, string | number | null | undefined> = {
            search: search || undefined,
            entries,
            sort: sort || undefined,
            status: status || undefined,
            source: source || undefined,
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

    const handleStatusChange = (value: string) => {
        handleQueryChange({
            status: value === 'all' ? undefined : value,
        });
    };

    const handleSourceChange = (value: string) => {
        handleQueryChange({
            source: value === 'all' ? undefined : value,
        });
    };

    const handleSortChange = (value: string) => {
        handleQueryChange({
            sort: value,
        });
    };

    const shouldShowPagination = submissions.last_page > 1;

    // Filter data pending for bulk select check
    const pendingSubmissions = submissions.data.filter(
        (sub) => sub.status === 'pending',
    );
    const isAllPendingSelected =
        pendingSubmissions.length > 0 &&
        pendingSubmissions.every((sub) => selected.includes(sub.id.toString()));

    const getStatusBadge = (status: Submission['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'needs_correction':
                return 'bg-orange-100 text-orange-850 border border-orange-200';
            case 'verified':
                return 'bg-blue-100 text-blue-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'processing':
                return 'bg-indigo-100 text-indigo-800';
            case 'approved':
                return 'bg-emerald-100 text-emerald-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-stone-150 text-stone-700 border border-stone-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: Submission['status']) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'needs_correction':
                return 'Perlu Perbaikan';
            case 'verified':
                return 'Terverifikasi';
            case 'rejected':
                return 'Ditolak';
            case 'processing':
                return 'Diproses';
            case 'approved':
                return 'Disetujui';
            case 'completed':
                return 'Selesai';
            case 'cancelled':
                return 'Dibatalkan';
            default:
                return status;
        }
    };

    return (
        <>
            <Head title="Kelola Pengajuan & Layanan" />

            <div className="flex flex-col gap-2 px-2 py-2 bp360:gap-2.25 bp360:px-2.25 bp400:gap-2.5 bp400:px-2.5 md:gap-2.75 md:px-3 md:py-2.25 lg:gap-3 lg:px-3.5 lg:py-2.5 xl:gap-3.5 xl:px-4 xl:py-3 2xl:gap-4 2xl:px-4.5 2xl:py-3.5">
                {/* Search Bar */}
                <div className="flex w-full max-w-full items-center gap-2 md:max-w-[70%] lg:max-w-1/2">
                    <SearchBar
                        route={route('submissions.index')}
                        search={search}
                        formId="search-submissions"
                        query={{
                            entries,
                            status: status || undefined,
                            source: source || undefined,
                            sort,
                        }}
                    />
                    <Button
                        type="submit"
                        form="search-submissions"
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
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                <SelectGroup>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="needs_correction">
                                        Perlu Perbaikan
                                    </SelectItem>
                                    <SelectItem value="verified">
                                        Terverifikasi
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Ditolak
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
                                    <SelectItem value="cancelled">
                                        Dibatalkan
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Source Filter */}
                        <Select
                            value={currentSource}
                            onValueChange={handleSourceChange}
                        >
                            <SelectTrigger className="t-size3 w-full gap-1.5 bg-(--secondary)/30 font-medium text-(--primary) hover:bg-(--secondary)/50 active:bg-(--secondary)/50 data-placeholder:text-(--primary) bp360:w-35">
                                <SelectValue placeholder="Sumber" />
                            </SelectTrigger>
                            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                <SelectGroup>
                                    <SelectItem value="all">
                                        Semua Sumber
                                    </SelectItem>
                                    <SelectItem value="offline">
                                        Offline
                                    </SelectItem>
                                    <SelectItem value="mobile">
                                        Mobile
                                    </SelectItem>
                                    <SelectItem value="website">
                                        Website
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
                                        No. Pengajuan A-Z
                                    </SelectItem>
                                    <SelectItem value="number_desc">
                                        No. Pengajuan Z-A
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Bulk Delete */}
                        {selected.length > 0 &&
                            can.includes('d-submissions') && (
                                <BulkDeleteDialog
                                    title="Data Pengajuan"
                                    selectedCount={selected.length}
                                    onConfirm={() => {
                                        router.post(
                                            bulkDelete().url,
                                            { ids: selected },
                                            {
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
                            entries={entries}
                            route={route('submissions.index')}
                            query={{
                                search,
                                status: status || undefined,
                                source: source || undefined,
                                sort,
                            }}
                        />
                        {can.includes('c-submissions') && (
                            <Link
                                href={route('submissions.create')}
                                className="t-size3 flex items-center gap-1.5 rounded-md bg-(--primary) px-2.5 py-1.5 font-medium whitespace-nowrap text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-(--secondary) hover:text-(--primary) hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:bg-(--secondary) active:text-(--primary) active:shadow-none bp360:px-3 bp360:py-2"
                            >
                                <PlusCircle className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                Tambah Baru
                            </Link>
                        )}
                    </div>
                </div>

                {/* Table Data */}
                <div className="mt-1">
                    {submissions.data.length > 0 ? (
                        <div className="sb-primary relative overflow-x-auto rounded-lg bg-green-50 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:rounded-xl">
                            <table className="w-full bg-white">
                                <thead className="bg-(--secondary)/15">
                                    <tr className="t-size3 text-(--primary)">
                                        {can.includes('d-submissions') && (
                                            <th className="px-4 py-3 text-center">
                                                <Checkbox
                                                    checked={
                                                        isAllPendingSelected
                                                    }
                                                    onCheckedChange={
                                                        toggleSelectAll
                                                    }
                                                    className="size-4.5 rounded-sm border-(--font-color)/70 bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.5 xl:size-5.75 2xl:size-6 [&>span>svg]:size-4 bp360:[&>span>svg]:size-4.25 bp400:[&>span>svg]:size-4.5 md:[&>span>svg]:size-4.75 lg:[&>span>svg]:size-5 xl:[&>span>svg]:size-5.25 2xl:[&>span>svg]:size-5.5"
                                                />
                                            </th>
                                        )}
                                        <th className="px-4 py-3 text-center font-semibold">
                                            No
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            No. Pengajuan
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
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Sumber
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.data.map(
                                        (submission, index) => (
                                            <tr
                                                key={submission.id}
                                                className="t-size2 border-b-[1.5px] border-(--primary)/10 text-(--font-color) last:border-b-0 even:bg-(--primary)/3"
                                            >
                                                {can.includes(
                                                    'd-submissions',
                                                ) && (
                                                    <td className="px-4 py-2 text-center">
                                                        {submission.status ===
                                                        'pending' ? (
                                                            <Checkbox
                                                                checked={selected.includes(
                                                                    submission.id.toString(),
                                                                )}
                                                                onCheckedChange={() =>
                                                                    toggleSelection(
                                                                        submission.id.toString(),
                                                                    )
                                                                }
                                                                className="size-4.5 rounded-sm border-(--font-color)/70 bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.5 xl:size-5.75 2xl:size-6 [&>span>svg]:size-4 bp360:[&>span>svg]:size-4.25 bp400:[&>span>svg]:size-4.5 md:[&>span>svg]:size-4.75 lg:[&>span>svg]:size-5 xl:[&>span>svg]:size-5.25 2xl:[&>span>svg]:size-5.5"
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-gray-400">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="px-4 py-2 text-center font-medium">
                                                    {i + index + 1}
                                                </td>
                                                <td className="px-4 py-2 text-center font-semibold text-(--primary)">
                                                    {
                                                        submission.submission_number
                                                    }
                                                </td>
                                                <td className="px-4 py-2 text-center font-medium">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">
                                                            {
                                                                submission
                                                                    .resident
                                                                    ?.name
                                                            }
                                                        </span>
                                                        <span className="t-size1 text-stone-500">
                                                            {
                                                                submission
                                                                    .resident
                                                                    ?.nik
                                                            }
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-center font-medium">
                                                    {
                                                        submission.type_service
                                                            ?.service_name
                                                    }
                                                </td>
                                                <td className="px-4 py-2 text-center font-medium">
                                                    {submission.subject}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <span
                                                        className={`t-size1 rounded-full px-2.5 py-1 font-semibold whitespace-nowrap ${getStatusBadge(submission.status)}`}
                                                    >
                                                        {getStatusLabel(
                                                            submission.status,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-center font-medium capitalize">
                                                    {submission.source}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        {can.includes(
                                                            'r-submissions',
                                                        ) && (
                                                            <Link
                                                                href={route(
                                                                    'submissions.show',
                                                                    {
                                                                        submission:
                                                                            submission.id,
                                                                    },
                                                                )}
                                                                className="inline-flex items-center gap-1 rounded-md border-[1.7px] border-(--primary)/50 bg-(--primary)/10 px-2.5 py-1.5 font-medium text-(--primary) transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-(--primary)/70 hover:bg-(--primary)/20 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:border-(--primary)/70 active:bg-(--primary)/20 active:shadow-none bp360:px-3 bp360:py-2"
                                                            >
                                                                <Eye className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                                                Detail
                                                            </Link>
                                                        )}
                                                        {can.includes(
                                                            'u-submissions',
                                                        ) &&
                                                            (submission.status ===
                                                                'pending' ||
                                                                submission.status ===
                                                                    'needs_correction') && (
                                                                <Link
                                                                    href={route(
                                                                        'submissions.edit',
                                                                        submission.id,
                                                                    )}
                                                                    className="inline-flex items-center gap-1 rounded-md border-[1.7px] border-amber-500 bg-amber-500/10 px-2.5 py-1.5 font-medium text-amber-600 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-amber-600 hover:bg-amber-500/20 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:border-amber-600 active:bg-amber-500/20 active:shadow-none bp360:px-3 bp360:py-2"
                                                                >
                                                                    <Pencil className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4" />
                                                                    Ubah
                                                                </Link>
                                                            )}
                                                        {can.includes(
                                                            'd-submissions',
                                                        ) &&
                                                            submission.status ===
                                                                'pending' && (
                                                                <SingleDeleteDialog
                                                                    title="Data Pengajuan"
                                                                    itemName={
                                                                        submission.submission_number
                                                                    }
                                                                    label="Hapus"
                                                                    onConfirm={() =>
                                                                        router.delete(
                                                                            destroy(
                                                                                {
                                                                                    submission:
                                                                                        submission.id,
                                                                                },
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
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                            <div
                                className={`t-size3 bg-green-50 ${shouldShowPagination ? 'px-3 py-2 bp360:px-3.25 bp400:px-3.5 md:px-4' : 'mb-7'}`}
                            >
                                <InertiaPagination pagination={submissions} />
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

SubmissionsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Kelola Pengajuan & Layanan',
            href: index(),
        },
    ],
};
