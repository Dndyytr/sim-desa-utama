import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                't-size2 flex w-full rounded-md border border-(--primary)/20 bg-(--tertiary)/5 px-2.5 py-1.5 font-medium text-(--font-color) shadow-xs transition-all duration-300 ease-in-out outline-none selection:bg-(--tertiary)/10 selection:text-(--font-color) file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground autofill:bg-(--tertiary)/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bp360:px-3 bp360:py-2',
                'focus-visible:border-(--primary)/40 focus-visible:bg-(--tertiary)/10 focus-visible:ring-[3px] focus-visible:ring-(--tertiary)/30',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                className,
            )}
            {...props}
        />
    );
}

export { Input };
