import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Checkbox({
    className,
    ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                'peer size-3.5 shrink-0 cursor-pointer rounded-[4px] border-[1.7px] shadow-xs transition-all duration-300 ease-in-out outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground md:size-3.75 lg:size-4 xl:size-4.25 2xl:size-4.5 dark:aria-invalid:ring-destructive/40',
                className,
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current transition-none"
            >
                <CheckIcon
                    strokeWidth={3}
                    className="size-3 md:size-3.25 lg:size-3.5 xl:size-3.75 2xl:size-4"
                />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };
