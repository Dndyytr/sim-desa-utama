import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { edit } from '@/routes/profile';

const buttonVariants = cva(
    "inline-flex cursor-pointer items-center justify-center gap-1 rounded-md font-medium whitespace-nowrap transition-all duration-300 ease-in-out outline-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    'bg-(--primary) text-white hover:-translate-y-0.5 hover:bg-(--secondary) hover:text-(--primary) active:translate-y-0.5 active:bg-(--secondary) active:text-(--primary)',
                destructive:
                    'bg-red-600 text-white hover:-translate-y-0.5 hover:bg-red-400 active:translate-y-0.5 active:bg-red-400',
                outline:
                    'bg-(--secondary)/20 text-(--primary) hover:-translate-y-0.5 hover:bg-(--secondary)/50 active:translate-y-0.5 active:bg-(--secondary)/50',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-xs hover:-translate-y-0.5 hover:bg-secondary/80 active:translate-y-0.5',
                ghost: 'bg-white text-primary ring-[1.5px] ring-(--primary)/50 hover:-translate-y-0.5 hover:bg-(--primary)/30 hover:ring-(--primary)/80 active:translate-y-0.5 active:bg-(--primary)/30 active:ring-(--primary)/80',
                link: 'text-primary underline-offset-4 hover:-translate-y-0.5 hover:underline active:translate-y-0.5',
                error: 'bg-red-100 text-red-600 ring-[1.7px] ring-red-300 hover:-translate-y-0.5 hover:bg-red-200 hover:ring-red-400 active:translate-y-0.5 active:bg-red-300 active:ring-red-400',
                edit: 'bg-(--secondary)/10 text-yellow-500 ring-[1.7px] ring-(--secondary)/50 hover:-translate-y-0.5 hover:bg-(--secondary)/50 hover:ring-(--secondary)/70 active:translate-y-0.5 active:bg-(--secondary)/50 active:ring-(--secondary)/70',
                none: '',
                paginateActive: 'bg-(--primary) text-white',
                paginateInactive:
                    'bg-white text-(--primary) hover:bg-(--primary) hover:text-white active:bg-(--primary) active:text-white',
            },
            size: {
                default: 'px-2.5 py-1.5 bp360:px-3 bp360:py-2',
                sm: 'rounded-md px-3 has-[>svg]:px-2.5',
                lg: 'rounded-md px-6 has-[>svg]:px-4',
                icon: 'size-7.5 bp360:size-7.75 bp400:size-8 md:size-8.25 lg:size-8.5 xl:size-8.75 2xl:size-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
