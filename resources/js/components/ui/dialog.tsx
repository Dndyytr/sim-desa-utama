import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Dialog({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
    return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
    return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
    return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
    return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className={cn(
                'fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
                className,
            )}
            {...props}
        />
    );
}

function DialogContent({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
    return (
        <DialogPortal data-slot="dialog-portal">
            <DialogOverlay />
            <DialogPrimitive.Content
                data-slot="dialog-content"
                className={cn(
                    'fixed top-[50%] left-[50%] z-50 grid max-h-[calc(100dvh-5rem)] w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[calc(-50%-1.25rem)] gap-4 rounded-xl bg-(--primary) pt-10 shadow-lg transition-all duration-300 ease-in-out data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-xl lg:max-w-152 xl:max-w-160 2xl:max-w-2xl',
                    className,
                )}
                {...props}
            >
                <div className="relative flex max-h-[calc(100dvh-5rem)] w-full flex-col gap-2 rounded-t-md rounded-b-xl bg-white px-2.5 pb-2.5 bp360:px-3 bp360:pb-3 bp400:px-3.25 bp400:pb-3.25 md:px-3.5 md:pb-3.5 lg:px-4 lg:pb-4 xl:px-4.5 xl:pb-4.5 2xl:px-5 2xl:pb-5">
                    {children}
                    <DialogPrimitive.Close className="absolute top-4 right-4 cursor-pointer rounded-full bg-white p-1 text-(--primary) shadow-[0_0_5px_0_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out hover:bg-(--primary) hover:text-white active:bg-(--primary) active:text-white disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0">
                        <XIcon
                            strokeWidth={2.5}
                            className="size-4.5 bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.5 xl:size-5.75 2xl:size-6"
                        />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                </div>
            </DialogPrimitive.Content>
        </DialogPortal>
    );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-header"
            className={cn('flex flex-col gap-0.5 text-center', className)}
            {...props}
        />
    );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-footer"
            className={cn('flex flex-wrap justify-between gap-2', className)}
            {...props}
        />
    );
}

function DialogTitle({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            data-slot="dialog-title"
            className={cn('leading-none font-bold', className)}
            {...props}
        />
    );
}

function DialogDescription({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description
            data-slot="dialog-description"
            className={cn('font-medium text-stone-500', className)}
            {...props}
        />
    );
}

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
