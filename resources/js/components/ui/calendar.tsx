import * as React from 'react';
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from 'lucide-react';
import {
    DayPicker,
    getDefaultClassNames,
    type DayButton,
} from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = 'label',
    buttonVariant = 'default',
    buttonSize = 'icon',
    formatters,
    components,
    ...props
}: React.ComponentProps<typeof DayPicker> & {
    buttonVariant?: React.ComponentProps<typeof Button>['variant'];
    buttonSize?: React.ComponentProps<typeof Button>['size'];
}) {
    const defaultClassNames = getDefaultClassNames();

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn(
                'group/calendar bg-white p-2 [--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent md:p-3',
                String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
                String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
                className,
            )}
            captionLayout={captionLayout}
            formatters={{
                formatMonthDropdown: (date) =>
                    date.toLocaleString('default', { month: 'short' }),
                ...formatters,
            }}
            classNames={{
                root: cn('w-fit', defaultClassNames.root),
                months: cn(
                    'relative flex flex-col gap-4 md:flex-row',
                    defaultClassNames.months,
                ),
                month: cn(
                    'flex w-full flex-col gap-4',
                    defaultClassNames.month,
                ),
                nav: cn(
                    'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
                    defaultClassNames.nav,
                ),
                button_previous: cn(
                    buttonVariants({ variant: buttonVariant }),
                    'rounded-sm hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none md:rounded-sm',
                    defaultClassNames.button_previous,
                ),
                button_next: cn(
                    buttonVariants({ variant: buttonVariant }),
                    'rounded-sm hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none md:rounded-sm',
                    defaultClassNames.button_next,
                ),
                month_caption: cn(
                    'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)',
                    defaultClassNames.month_caption,
                ),
                dropdowns: cn(
                    't-size3 flex h-(--cell-size) w-full items-center justify-center gap-1.5 font-medium text-primary',
                    defaultClassNames.dropdowns,
                ),
                dropdown_root: cn(
                    'bg-tertiary hover:bg-tertiary/70 relative rounded-sm border border-input shadow-xs transition-all duration-300 ease-in-out has-focus:border-ring has-focus:ring-[3px] has-focus:ring-ring/50',
                    defaultClassNames.dropdown_root,
                ),
                dropdown: cn(
                    'absolute inset-0 cursor-pointer opacity-0 [&>option]:bg-white [&>option]:text-primary [&>option]:checked:bg-primary [&>option]:checked:text-white [&>option]:hover:bg-primary [&>option]:focus:bg-primary',
                    defaultClassNames.dropdown,
                ),
                caption_label: cn(
                    'font-medium select-none',
                    captionLayout === 'label'
                        ? ''
                        : 'flex items-center gap-1 rounded-sm px-2 py-[5px] bp400:px-2.5 bp400:py-1.5 [&>svg]:size-1/2 [&>svg]:text-primary [&>svg]:hover:text-primary/60',
                    defaultClassNames.caption_label,
                ),
                month_grid: cn(
                    'w-full border-collapse',
                    defaultClassNames.month_grid,
                ),
                weekdays: cn('t-size2 flex gap-1', defaultClassNames.weekdays),
                weekday: cn(
                    'text-tertiary/70 flex-1 rounded-sm font-medium select-none',
                    defaultClassNames.weekday,
                ),
                week: cn(
                    't-size2 mt-2 flex w-full gap-1',
                    defaultClassNames.week,
                ),
                week_number_header: cn(
                    'w-(--cell-size) select-none',
                    defaultClassNames.week_number_header,
                ),
                week_number: cn(
                    'text-tertiary/70 select-none',
                    defaultClassNames.week_number,
                ),
                day: cn(
                    'text-tertiary group/day relative aspect-square h-full w-full p-0 text-center font-medium select-none hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md [&>button]:hover:bg-secondary/20 [&>button]:hover:text-primary [&>button]:md:rounded-sm',
                    props.showWeekNumber
                        ? '[&:nth-child(2)[data-selected=true]_button]:rounded-l-md'
                        : '[&:first-child[data-selected=true]_button]:rounded-l-md',
                    defaultClassNames.day,
                ),
                range_start: cn(
                    'rounded-l-md bg-accent',
                    defaultClassNames.range_start,
                ),
                range_middle: cn(
                    'rounded-none',
                    defaultClassNames.range_middle,
                ),
                range_end: cn(
                    'rounded-r-md bg-accent',
                    defaultClassNames.range_end,
                ),
                today: cn(
                    'rounded-sm bg-accent text-accent-foreground data-[selected=true]:rounded-none',
                    defaultClassNames.today,
                ),
                outside: cn(
                    'text-tertiary/70 aria-selected:text-tertiary/70',
                    defaultClassNames.outside,
                ),
                disabled: cn(
                    'text-muted-foreground opacity-50',
                    defaultClassNames.disabled,
                ),
                hidden: cn('invisible', defaultClassNames.hidden),
                ...classNames,
            }}
            components={{
                Root: ({ className, rootRef, ...props }) => {
                    return (
                        <div
                            data-slot="calendar"
                            ref={rootRef}
                            className={cn(className)}
                            {...props}
                        />
                    );
                },
                Chevron: ({ className, orientation, ...props }) => {
                    if (orientation === 'left') {
                        return (
                            <ChevronLeftIcon
                                strokeWidth={2.5}
                                className={cn(
                                    'size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5 xl:size-5.25 2xl:size-5.5',
                                    className,
                                )}
                                {...props}
                            />
                        );
                    }

                    if (orientation === 'right') {
                        return (
                            <ChevronRightIcon
                                strokeWidth={2.5}
                                className={cn(
                                    'size-4 bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5 xl:size-5.25 2xl:size-5.5',
                                    className,
                                )}
                                {...props}
                            />
                        );
                    }

                    return (
                        <ChevronDownIcon
                            strokeWidth={2.5}
                            className={cn('size-full text-red-900', className)}
                            {...props}
                        />
                    );
                },
                DayButton: CalendarDayButton,
                WeekNumber: ({ children, ...props }) => {
                    return (
                        <td {...props}>
                            <div className="flex size-(--cell-size) items-center justify-center text-center">
                                {children}
                            </div>
                        </td>
                    );
                },
                ...components,
            }}
            {...props}
        />
    );
}

function CalendarDayButton({
    className,
    day,
    modifiers,
    ...props
}: React.ComponentProps<typeof DayButton>) {
    const defaultClassNames = getDefaultClassNames();

    const ref = React.useRef<HTMLButtonElement>(null);
    React.useEffect(() => {
        if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);

    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            data-day={day.date.toLocaleDateString()}
            data-selected-single={
                modifiers.selected &&
                !modifiers.range_start &&
                !modifiers.range_end &&
                !modifiers.range_middle
            }
            data-range-start={modifiers.range_start}
            data-range-end={modifiers.range_end}
            data-range-middle={modifiers.range_middle}
            className={cn(
                'flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-medium group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-sm data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-sm data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-accent-foreground [&>span]:text-xs [&>span]:opacity-70',
                defaultClassNames.day,
                className,
            )}
            {...props}
        />
    );
}

export { Calendar, CalendarDayButton };
