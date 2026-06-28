import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, CircleAlert, Trash2 } from 'lucide-react';
import { ReactNode } from 'react';

interface DeleteDialogProps {
    trigger: ReactNode;
    title: string;
    description: string;
    warning: string;
    onConfirm: () => void;
    cancelText?: string;
    confirmText?: string;
}

export function DeleteDialog({
    trigger,
    title,
    description,
    warning,
    onConfirm,
    cancelText = 'Cancel',
    confirmText = 'Continue',
}: DeleteDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="relative inline-flex w-max">
                        {/* Ripple Effect Background */}
                        <span className="absolute inset-0 z-1 animate-ping-slow rounded-full bg-red-500 opacity-20"></span>

                        {/* Animated Icon Wrapper */}
                        <span className="relative z-2 flex animate-trash-shake items-center justify-center rounded-full bg-red-100 p-4 text-red-600 transition-transform duration-300 hover:scale-110 hover:rotate-3 active:scale-110 active:rotate-3">
                            <Trash2 className="size-8.5 bp360:size-9 bp400:size-9.5 md:size-10 lg:size-10.5 xl:size-11 2xl:size-11.5" />
                        </span>
                    </div>
                    <AlertDialogTitle className="t-size8">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="t-size3">
                        {description}
                    </AlertDialogDescription>
                    <AlertDialogDescription className="t-size2 flex items-center gap-2 rounded-md bg-red-100 p-2 text-left text-red-600">
                        <CircleAlert className="size-7.25 bp360:size-7.5 bp400:size-7.75 md:size-8 lg:size-7.5 xl:size-8.25 2xl:size-8.5" />
                        {warning}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="t-size3">
                    <AlertDialogCancel className="hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none">
                        <ChevronLeft className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                    >
                        <Trash2 className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
