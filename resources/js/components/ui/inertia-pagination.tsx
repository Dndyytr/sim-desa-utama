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

                    {/* Page Numbers */}
                    {pageLinks.map((page, index: number) => {
                        if (page.label === '...') {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        } else if (
                            page.label === 'pagination.previous' ||
                            page.label === '&laquo; Previous'
                        ) {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationPrevious
                                        href={prev_page_url || '#'}
                                    />
                                </PaginationItem>
                            );
                        } else if (
                            page.label === 'pagination.next' ||
                            page.label === 'Next &raquo;'
                        ) {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationNext
                                        href={next_page_url || '#'}
                                    />
                                </PaginationItem>
                            );
                        } else {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        className="t-size4 font-semibold"
                                        href={page.url || '#'}
                                        isActive={page.active}
                                        dangerouslySetInnerHTML={{
                                            __html: page.label,
                                        }}
                                    />
                                </PaginationItem>
                            );
                        }
                    })}

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
