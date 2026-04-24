import { Loader2Icon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
    return (
        <Loader2Icon
            strokeWidth={2}
            role="status"
            aria-label="Loading"
            className={cn(
                'size-3.25 animate-spin bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.75 2xl:size-5',
                className,
            )}
            {...props}
        />
    );
}

export { Spinner };
