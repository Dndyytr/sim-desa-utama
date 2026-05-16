import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from './delete-dialog';

interface SingleDeleteDialogProps {
    title: string;
    itemName: string;
    label?: string;
    onConfirm: () => void;
}

export function SingleDeleteDialog({
    title,
    itemName,
    onConfirm,
    label = 'HAPUS',
}: SingleDeleteDialogProps) {
    return (
        <DeleteDialog
            trigger={
                <Button
                    variant="error"
                    className="gap-1 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                >
                    <Trash2 className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                    {label}
                </Button>
            }
            title={`Hapus ${title}?`}
            description={`Anda yakin ingin menghapus ${title} "${itemName}"? Tindakan ini tidak dapat dibatalkan.`}
            warning={`Semua data terkait ${title} ini juga akan terhapus secara permanen.`}
            onConfirm={onConfirm}
            cancelText="Batal"
            confirmText="Ya, Hapus"
        />
    );
}
