import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from './delete-dialog';
import { usePage } from '@inertiajs/react';

interface BulkDeleteDialogProps {
    title: string;
    selectedCount: number;
    onConfirm: () => void;
}

export function BulkDeleteDialog({
    title,
    selectedCount,
    onConfirm,
}: BulkDeleteDialogProps) {
    return (
        <DeleteDialog
            trigger={
                <Button
                    variant="error"
                    className="t-size3 gap-1 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                >
                    <Trash2 className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                    Terpilih ({selectedCount})
                </Button>
            }
            title="Hapus Item Terpilih"
            description={`Apakah anda yakin ingin menghapus ${selectedCount} item yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
            warning={`Semua data terkait ${title} ini juga akan terhapus secara permanen.`}
            onConfirm={onConfirm}
            cancelText="Batal"
            confirmText="Hapus Semua"
        />
    );
}
