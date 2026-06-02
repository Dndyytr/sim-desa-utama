'use client';

import { usePage } from '@inertiajs/react';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function formatDate(date: Date | undefined, locale: string = 'id') {
    if (!date) {
        return '';
    }

    // Match the exact locale format from your language-tabs.tsx
    const dateLocale = locale === 'id' ? 'id-ID' : 'en-US';

    return date.toLocaleDateString(dateLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false;
    }

    return !isNaN(date.getTime());
}

interface Calendar28Props {
    id?: string;
    name?: string;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    required?: boolean;
}

export function Calendar28({
    id,
    name,
    className,
    value,
    onChange,
    required = false,
}: Calendar28Props) {
    const { locale }: any = usePage().props;
    const currentLocale = locale || 'id';
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState('');
    const selectedValue = value ?? internalValue;
    const date = selectedValue ? new Date(selectedValue) : undefined;
    const validDate = isValidDate(date) ? date : undefined;
    const [month, setMonth] = React.useState<Date | undefined>(
        validDate ?? new Date(),
    );
    const inputValue = validDate ? formatDate(validDate, currentLocale) : '';

    const handleDateSelect = (newDate: Date | undefined) => {
        if (newDate && isValidDate(newDate)) {
            // Return ISO format for Laravel validation (YYYY-MM-DD)
            const year = newDate.getFullYear();
            const month = String(newDate.getMonth() + 1).padStart(2, '0');
            const day = String(newDate.getDate()).padStart(2, '0');
            const isoString = `${year}-${month}-${day}`;

            setInternalValue(isoString);
            setMonth(newDate);
            onChange?.(isoString);
            setOpen(false);
        }
    };

    // Simple placeholder
    const placeholder =
        currentLocale === 'id' ? '- Pilih Tanggal -' : '- Select Date -';

    return (
        <div className={cn('t-size3 flex w-full flex-col gap-3', className)}>
            <div className="relative flex gap-2">
                <Input
                    id={id}
                    value={inputValue}
                    placeholder={placeholder}
                    readOnly
                    required={required}
                    onClick={() => setOpen(true)}
                />
                {/* Hidden input for form submission with proper date format */}
                <input type="hidden" name={name} value={selectedValue} />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button
                            id="date-picker"
                            type="button"
                            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer hover:[&>svg]:text-(--tertiary)"
                        >
                            <CalendarIcon
                                size={2.5}
                                className="size-4 text-primary transition-all duration-300 ease-in-out md:size-4.25 lg:size-4.5 xl:size-4.75 2xl:size-5"
                            />
                            <span className="sr-only">Select date</span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="overflow-hidden p-0"
                        align="end"
                        alignOffset={-8}
                        sideOffset={10}
                    >
                        <Calendar
                            mode="single"
                            selected={validDate}
                            captionLayout="dropdown"
                            month={month}
                            onMonthChange={setMonth}
                            onSelect={handleDateSelect}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
