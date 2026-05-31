import { Form } from '@inertiajs/react';
import { ArrowLeft, Info, PlusCircle, RefreshCcw, Save } from 'lucide-react';
import { useState } from 'react';

import { IconSelect } from '@/components/icon-select';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { store } from '@/routes/menus';

interface Menu {
    id: number;
    title: string;
}

interface AddModalMenuProps {
    menus: Menu[];
}

export default function AddModalMenu({ menus }: AddModalMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const [selectedParentId, setSelectedParentId] = useState<string>('');
    const [selectedIcon, setSelectedIcon] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none">
                    <PlusCircle className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                    Tambah Baru
                </Button>
            </DialogTrigger>

            <DialogContent>
                {/* icon */}
                <div className="relative mx-auto -mt-6 flex w-max flex-col gap-2 rounded-full bg-white p-2.5 shadow-[0_5px_7px_0_rgba(0,0,0,0.2)]">
                    <div className="relative w-max">
                        <span className="absolute inset-2 z-1 animate-ping-slow rounded-full bg-(--primary) opacity-20"></span>
                        <svg
                            className="relative z-2 size-12.5 bp360:size-13 bp400:size-13.5 md:size-14 lg:size-14.5 xl:size-14.75 2xl:size-15"
                            viewBox="0 0 70 70"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M26.25 8.75H11.6667C10.0558 8.75 8.75 10.0558 8.75 11.6667V26.25C8.75 27.8608 10.0558 29.1667 11.6667 29.1667H26.25C27.8608 29.1667 29.1667 27.8608 29.1667 26.25V11.6667C29.1667 10.0558 27.8608 8.75 26.25 8.75Z"
                                fill="var(--secondary)"
                                stroke="var(--primary)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M58.3335 8.75H43.7502C42.1393 8.75 40.8335 10.0558 40.8335 11.6667V26.25C40.8335 27.8608 42.1393 29.1667 43.7502 29.1667H58.3335C59.9443 29.1667 61.2502 27.8608 61.2502 26.25V11.6667C61.2502 10.0558 59.9443 8.75 58.3335 8.75Z"
                                fill="var(--secondary)"
                                stroke="var(--primary)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M58.3335 40.8333H43.7502C42.1393 40.8333 40.8335 42.1392 40.8335 43.75V58.3333C40.8335 59.9442 42.1393 61.25 43.7502 61.25H58.3335C59.9443 61.25 61.2502 59.9442 61.2502 58.3333V43.75C61.2502 42.1392 59.9443 40.8333 58.3335 40.8333Z"
                                fill="var(--secondary)"
                                stroke="var(--primary)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M26.25 40.8333H11.6667C10.0558 40.8333 8.75 42.1392 8.75 43.75V58.3333C8.75 59.9442 10.0558 61.25 11.6667 61.25H26.25C27.8608 61.25 29.1667 59.9442 29.1667 58.3333V43.75C29.1667 42.1392 27.8608 40.8333 26.25 40.8333Z"
                                fill="var(--secondary)"
                                stroke="var(--primary)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>
                <DialogHeader className="t-size2">
                    <DialogTitle className="text-[1.3em] text-(--primary)">
                        Tambah Menu Baru
                    </DialogTitle>
                    <DialogDescription>
                        Isi formulir untuk menambahkan menu baru.
                    </DialogDescription>
                </DialogHeader>

                {/* <form onSubmit={handleSubmit} className="space-y-4"> */}
                <Form
                    {...store.form()}
                    transform={(data) => ({
                        ...data,
                        parent_id:
                            selectedParentId === 'null' || !selectedParentId
                                ? null
                                : selectedParentId,
                        icon: selectedIcon,
                        status: selectedStatus,
                        locale: 'id',
                    })}
                    options={{
                        preserveState: 'errors',
                        preserveScroll: true,
                    }}
                    onSuccess={() => {
                        setIsOpen(false);
                    }}
                    onError={() => {
                        setIsOpen(true);
                    }}
                    disableWhileProcessing
                    className="sb-primary flex max-h-[calc(100dvh-180px)] w-full flex-col gap-2 overflow-auto p-1"
                >
                    {({ processing, errors, reset }) => (
                        <>
                            {/* Title */}
                            <div className="flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                <Label
                                    className="t-size3 text-(--font-color)"
                                    htmlFor="title"
                                >
                                    Judul Menu
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    name="title"
                                    tabIndex={1}
                                    placeholder="Judul menu"
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid gap-1.5 bp360:gap-1.75 bp400:gap-2 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                    {/* URL */}
                                    <Label
                                        className="t-size3 text-(--font-color)"
                                        htmlFor="url"
                                    >
                                        URL Menu
                                    </Label>
                                    <Input
                                        id="url"
                                        type="text"
                                        name="url"
                                        tabIndex={2}
                                        placeholder="URL menu"
                                    />
                                    <InputError message={errors.url} />
                                </div>
                                <div className="flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                    {/* Tag Menu */}
                                    <Label
                                        className="t-size3 text-(--font-color)"
                                        htmlFor="tag"
                                    >
                                        Tag Menu
                                    </Label>
                                    <Input
                                        id="tag"
                                        type="text"
                                        name="tag"
                                        tabIndex={3}
                                        placeholder="Tag menu"
                                        required
                                    />
                                    <InputError message={errors.tag} />
                                </div>
                            </div>
                            <div className="grid gap-1.5 bp360:gap-1.75 bp400:gap-2 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                    {/* Permission */}
                                    <Label
                                        className="t-size3 text-(--font-color)"
                                        htmlFor="permission"
                                    >
                                        Izin Menu
                                    </Label>
                                    <Input
                                        id="permission"
                                        type="text"
                                        name="permission"
                                        tabIndex={3}
                                        placeholder="Izin menu"
                                    />
                                    <InputError message={errors.permission} />
                                </div>
                                <div className="flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                    {/* Parent */}
                                    <Label
                                        className="t-size3 text-(--font-color)"
                                        htmlFor="parent_id"
                                    >
                                        Menu Induk
                                    </Label>
                                    <Select
                                        value={selectedParentId}
                                        onValueChange={setSelectedParentId}
                                        disabled={processing}
                                    >
                                        <SelectTrigger className="t-size3 w-full max-w-full border border-(--primary)/20 bg-(--tertiary)/5 ring-0 outline-none selection:bg-(--tertiary)/10 selection:text-(--font-color) autofill:bg-(--tertiary)/10 hover:border-(--primary)/40 hover:bg-(--tertiary)/10 hover:ring-[3px] hover:ring-(--tertiary)/30 active:border-(--primary)/40 active:bg-(--tertiary)/10 active:ring-[3px] active:ring-(--tertiary)/30 data-[state=open]:border-(--primary)/40 data-[state=open]:bg-(--tertiary)/10 data-[state=open]:ring-[3px] data-[state=open]:ring-(--tertiary)/30">
                                            <SelectValue placeholder="Pilih menu induk" />
                                        </SelectTrigger>
                                        <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                            {menus.map((menu) => (
                                                <SelectItem
                                                    key={menu.id}
                                                    value={menu.id.toString()}
                                                >
                                                    {menu.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.parent_id} />
                                </div>
                            </div>

                            <div className="grid gap-1.5 bp360:gap-1.75 bp400:gap-2 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                    {/* Icon */}
                                    <Label
                                        className="t-size3 text-(--font-color)"
                                        htmlFor="icon"
                                    >
                                        Ikon Menu
                                    </Label>
                                    <IconSelect
                                        value={selectedIcon}
                                        onChange={setSelectedIcon}
                                    />
                                    <InputError message={errors.icon} />
                                </div>
                                <div className="flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                    {/* Status */}
                                    <Label
                                        className="t-size3 text-(--font-color)"
                                        htmlFor="status"
                                    >
                                        Status
                                    </Label>
                                    <Select
                                        value={selectedStatus}
                                        onValueChange={setSelectedStatus}
                                        disabled={processing}
                                    >
                                        <SelectTrigger className="t-size3 w-full max-w-full border border-(--primary)/20 bg-(--tertiary)/5 ring-0 outline-none selection:bg-(--tertiary)/10 selection:text-(--font-color) autofill:bg-(--tertiary)/10 hover:border-(--primary)/40 hover:bg-(--tertiary)/10 hover:ring-[3px] hover:ring-(--tertiary)/30 active:border-(--primary)/40 active:bg-(--tertiary)/10 active:ring-[3px] active:ring-(--tertiary)/30 data-[state=open]:border-(--primary)/40 data-[state=open]:bg-(--tertiary)/10 data-[state=open]:ring-[3px] data-[state=open]:ring-(--tertiary)/30">
                                            <SelectValue placeholder="Pilih status menu" />
                                        </SelectTrigger>
                                        <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                            <SelectItem value="enabled">
                                                Enabled
                                            </SelectItem>
                                            <SelectItem value="disabled">
                                                Disabled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            <div className="t-size1 flex items-center gap-1 font-medium text-stone-500">
                                <Info className="size-3.5 shrink-0 text-(--primary) bp360:size-3.75 bp400:size-4 md:size-4.25 lg:size-4.5 xl:size-4.75 2xl:size-5" />{' '}
                                Isi data menu untuk membuat menu di sidebar,
                                pilih menu induk untuk menu dropdown.
                            </div>

                            <Separator orientation="horizontal" />

                            <DialogFooter className="mt-2">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                                    >
                                        <ArrowLeft className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                        Batal
                                    </Button>
                                </DialogClose>
                                <div className="ml-auto flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            reset();
                                            setSelectedParentId('');
                                            setSelectedIcon('');
                                            setSelectedStatus('');
                                        }}
                                        className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                                        variant="outline"
                                    >
                                        <RefreshCcw className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                                        disabled={processing}
                                    >
                                        <Save className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                        Simpan
                                    </Button>
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
