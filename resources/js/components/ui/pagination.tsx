import { Link, type InertiaLinkProps } from '@inertiajs/react';
import * as React from 'react';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MoreHorizontalIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants, Button } from '@/components/ui/button';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn('mx-auto flex w-full justify-center', className)}
            {...props}
        />
    );
}

function PaginationContent({
    className,
    ...props
}: React.ComponentProps<'ul'>) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn('flex items-center gap-1', className)}
            {...props}
        />
    );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
    return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
    isActive?: boolean;
    size?: 'default' | 'sm' | 'lg' | 'icon';
} & Omit<InertiaLinkProps, 'size'>;

function PaginationLink({
    className,
    isActive,
    size = 'icon',
    ...props
}: PaginationLinkProps) {
    return (
        <Button
            asChild
            variant={isActive ? 'paginateActive' : 'paginateInactive'}
            size={size}
            className={className}
            data-active={isActive}
            aria-current={isActive ? 'page' : undefined}
        >
            <Link {...props} />
        </Button>
    );
}

function PaginationPrevious({
    className,
    ...props
}: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            size="icon"
            className={cn('', className)}
            {...props}
        >
            <ChevronLeftIcon
                strokeWidth={2.5}
                className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5 xl:size-5.25 2xl:size-5.5"
            />
        </PaginationLink>
    );
}

function PaginationNext({
    className,
    ...props
}: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to next page"
            size="icon"
            className={cn('', className)}
            {...props}
        >
            <ChevronRightIcon
                strokeWidth={2.5}
                className="size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5 xl:size-5.25 2xl:size-5.5"
            />
        </PaginationLink>
    );
}

function PaginationEllipsis({
    className,
    ...props
}: React.ComponentProps<'span'>) {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn(
                'flex size-7.5 items-center justify-center rounded-md bg-white bp360:size-7.75 bp400:size-8 md:size-8.25 lg:size-8.5 xl:size-8.75 2xl:size-9',
                className,
            )}
            {...props}
        >
            <MoreHorizontalIcon className="size-4 text-(--primary) bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5 xl:size-5.25 2xl:size-5.5" />
            <span className="sr-only">More pages</span>
        </span>
    );
}

export {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
};
