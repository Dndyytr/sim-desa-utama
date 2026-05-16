import { router } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ShowEntriesProps {
    route: string;
    search?: string;
    entries?: number;
}

export function Entries({ route, search, entries = 10 }: ShowEntriesProps) {
    const handleEntriesChange = (value: string) => {
        router.get(
            route,
            {
                entries: value,
                search: search,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <div className="t-size3 flex items-center gap-1.5">
                <span className="font-medium text-(--font-color)">
                    Tampilkan
                </span>
                <Select
                    value={entries.toString()}
                    onValueChange={handleEntriesChange}
                >
                    <SelectTrigger className="w-max">
                        <SelectValue placeholder={entries} />
                    </SelectTrigger>
                    <SelectContent className="t-size3">
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </>
    );
}
