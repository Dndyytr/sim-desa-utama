import { router } from '@inertiajs/react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface SearchBarProps {
    route: string;
    search?: string;
    formId: string;
    className?: string;
}

export function SearchBar({
    className,
    route,
    search,
    formId,
}: SearchBarProps) {
    const [searchs, setSearch] = useState(search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route, { search: searchs });
    };

    return (
        <div className="relative w-full">
            <span className="absolute top-1/2 bottom-1/2 left-0 flex items-center px-2 text-(--font-color)/70">
                <Search
                    strokeWidth={2.5}
                    className="size-4.25 md:size-4.5 lg:size-4.75 xl:size-5 2xl:size-5.25"
                />
            </span>
            <form id={formId} onSubmit={handleSearch}>
                <input
                    type="text"
                    name="search"
                    placeholder="Masukkan kata kunci..."
                    value={searchs}
                    onInput={(e) =>
                        setSearch((e.target as HTMLInputElement).value)
                    }
                    className={cn(
                        't-size3 flex w-full rounded-md border border-(--primary)/20 bg-(--tertiary)/5 py-1.5 pr-2.5 pl-7 font-medium text-(--font-color) shadow-xs transition-all duration-300 ease-in-out outline-none selection:bg-(--tertiary)/10 selection:text-(--font-color) placeholder:text-(--font-color)/60 autofill:bg-(--tertiary)/10 bp360:py-2 bp360:pr-3 lg:pl-8',
                        'focus-visible:border-(--primary)/40 focus-visible:bg-(--tertiary)/10 focus-visible:ring-[3px] focus-visible:ring-(--tertiary)/30',
                        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                        className,
                    )}
                />
            </form>
        </div>
    );
}
