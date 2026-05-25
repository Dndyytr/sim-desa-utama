import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface InertiaPaginationProps {
    pagination: {
        per_page: number;
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        first_page_url: string | null;
        last_page_url: string | null;
        prev_page_url: string | null;
        next_page_url: string | null;
        links: PaginationLinks[];
    };
}

type VisiblePage = number | 'start-ellipsis' | 'end-ellipsis';

const getVisiblePages = (
    currentPage: number,
    lastPage: number,
): VisiblePage[] => {
    if (lastPage <= 3) {
        return Array.from({ length: lastPage }, (_, index) => index + 1);
    }

    if (lastPage === 4) {
        return currentPage <= 2
            ? [1, 2, 'end-ellipsis', 4]
            : [1, 'start-ellipsis', 3, 4];
    }

    if (currentPage <= 2) {
        return [1, 2, 'end-ellipsis', lastPage];
    }

    if (currentPage === lastPage) {
        return [1, 'start-ellipsis', lastPage];
    }

    if (currentPage === lastPage - 1) {
        return [1, 'start-ellipsis', lastPage - 1, lastPage];
    }

    return [1, 'start-ellipsis', currentPage, 'end-ellipsis', lastPage];
};

const getUrlWithPage = (url: string | null, page: number) => {
    if (!url) {
        return '#';
    }

    const hashIndex = url.indexOf('#');
    const path = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
    const hash = hashIndex >= 0 ? url.slice(hashIndex) : '';

    if (/[?&]page=\d+/.test(path)) {
        return `${path.replace(/([?&]page=)\d+/, `$1${page}`)}${hash}`;
    }

    return `${path}${path.includes('?') ? '&' : '?'}page=${page}${hash}`;
};

export function InertiaPagination({ pagination }: InertiaPaginationProps) {
    const {
        current_page,
        last_page,
        total,
        from,
        to,
        first_page_url,
        last_page_url,
        prev_page_url,
        next_page_url,
        links: pageLinks,
    } = pagination;

    if (last_page <= 1) return null;

    const visiblePages = getVisiblePages(current_page, last_page);
    const urlByPage = new Map(
        pageLinks
            .map((page) => [Number(page.label), page.url] as const)
            .filter(([page]) => Number.isInteger(page)),
    );
    const basePageUrl =
        first_page_url ||
        pageLinks.find((page) => page.url !== null)?.url ||
        last_page_url;
    const getPageUrl = (page: number) =>
        urlByPage.get(page) ||
        (page === 1 ? first_page_url : null) ||
        (page === last_page ? last_page_url : null) ||
        getUrlWithPage(basePageUrl, page);

    return (
        <div className="flex items-center justify-between">
            {/* Total Records di sebelah kiri */}
            <div className="t-size3 w-full font-medium text-(--primary)">
                <span className="font-bold">
                    {from} - {to}{' '}
                </span>
                of {total} Baris
            </div>

            {/* Pagination di sebelah kanan */}
            <Pagination className="mx-auto flex w-auto justify-end">
                <PaginationContent>
                    {/* First Page Button */}

                    <PaginationItem className="hidden md:block">
                        <PaginationLink
                            aria-label="Go to first page"
                            size="icon"
                            href={first_page_url || '#'}
                        >
                            <ChevronsLeft
                                strokeWidth={2.5}
                                className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5 xl:size-5.25 2xl:size-5.5"
                            />
                        </PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationPrevious href={prev_page_url || '#'} />
                    </PaginationItem>

                    {/* Page Numbers */}
                    {visiblePages.map((page) => {
                        if (typeof page === 'string') {
                            return (
                                <PaginationItem key={page}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        return (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    className="t-size4 font-semibold"
                                    href={getPageUrl(page)}
                                    isActive={page === current_page}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}

                    <PaginationItem>
                        <PaginationNext href={next_page_url || '#'} />
                    </PaginationItem>

                    {/* Last Page Button */}
                    <PaginationItem className="hidden md:block">
                        <PaginationLink href={last_page_url || '#'} size="icon">
                            <ChevronsRight
                                strokeWidth={2.5}
                                className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5 xl:size-5.25 2xl:size-5.5"
                            />
                        </PaginationLink>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
