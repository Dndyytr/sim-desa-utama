import { Form } from '@inertiajs/react';
import { ArrowLeft, Info, Pencil, RefreshCcw, Save } from 'lucide-react';
import { useState } from 'react';

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
import { update } from '@/routes/permissions';

interface Menu {
    id: number;
    title: string;
    url?: string;
    tag?: string;
    permission: string;
    status?: string;
    locale?: string;
    icon?: string;
    parent_id?: string;
}

interface Permission {
    id: number;
    name: string;
    guard_name: string;
    title: string;
    feature: string;
}

interface EditModalPermissionProps {
    features: Menu[];
    permission: Permission;
}

export default function EditModalPermission({
    features,
    permission,
}: EditModalPermissionProps) {
    type UpdatePermissionArg = Parameters<typeof update.form.patch>[0];

    const updatePermissionArg = {
        id: permission.id,
    } as unknown as UpdatePermissionArg;

    const [isOpen, setIsOpen] = useState(false);

    const [selectedFeature, setSelectedFeature] = useState<string>(
        permission.feature,
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="edit"
                    className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                >
                    <Pencil className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                    Ubah
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
                                d="M58.3332 37.9166C58.3332 52.5 48.1248 59.7916 35.9915 64.0208C35.3561 64.2361 34.666 64.2258 34.0373 63.9916C21.8748 59.7916 11.6665 52.5 11.6665 37.9166V17.5C11.6665 16.7264 11.9738 15.9846 12.5208 15.4376C13.0678 14.8906 13.8096 14.5833 14.5832 14.5833C20.4165 14.5833 27.7082 11.0833 32.7832 6.64998C33.4011 6.12206 34.1871 5.832 34.9998 5.832C35.8126 5.832 36.5986 6.12206 37.2165 6.64998C42.3207 11.1125 49.5832 14.5833 55.4165 14.5833C56.19 14.5833 56.9319 14.8906 57.4789 15.4376C58.0259 15.9846 58.3332 16.7264 58.3332 17.5V37.9166Z"
                                fill="var(--secondary)"
                                stroke="var(--primary)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M31.8764 42.1954L30.7593 44.8904"
                                stroke="var(--primary)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M31.8764 26.0254L30.7593 23.3333"
                                stroke="var(--primary)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M38.5728 26.0254L39.6898 23.3333"
                                stroke="var(--primary)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M39.6869 44.8904L38.5728 42.1954"
                                stroke="var(--primary)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M43.3096 30.7621L46.0017 29.645"
                                stroke="var(--primary)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M43.3096 37.4587L46.0017 38.5758"
                                stroke="var(--primary)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M27.1394 30.7621L24.4473 29.645"
                                stroke="var(--primary)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M27.1394 37.4587L24.4473 38.5758"
                                stroke="var(--primary)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M35.2246 42.8604C40.0571 42.8604 43.9746 38.9429 43.9746 34.1104C43.9746 29.2779 40.0571 25.3604 35.2246 25.3604C30.3921 25.3604 26.4746 29.2779 26.4746 34.1104C26.4746 38.9429 30.3921 42.8604 35.2246 42.8604Z"
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
                        Edit Akses
                    </DialogTitle>
                    <DialogDescription>
                        Perbarui formulir untuk mengubah akses.
                    </DialogDescription>
                </DialogHeader>

                {/* <form onSubmit={handleSubmit} className="space-y-4"> */}
                <Form
                    {...update.form.patch(updatePermissionArg)}
                    transform={(data) => ({
                        ...data,
                        feature: selectedFeature,
                        guard_name: permission.guard_name || 'web',
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
                                    Judul Akses
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    name="title"
                                    tabIndex={1}
                                    placeholder="Judul akses"
                                    defaultValue={permission.title}
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.title} />
                            </div>
                            <div className="flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                {/* URL */}
                                <Label
                                    className="t-size3 text-(--font-color)"
                                    htmlFor="name"
                                >
                                    Nama
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    tabIndex={2}
                                    placeholder="Nama akses"
                                    defaultValue={permission.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                {/* Parent */}
                                <Label
                                    className="t-size3 text-(--font-color)"
                                    htmlFor="feature"
                                >
                                    Fitur Akses
                                </Label>
                                <Select
                                    value={selectedFeature}
                                    onValueChange={setSelectedFeature}
                                    disabled={processing}
                                >
                                    <SelectTrigger className="t-size3 w-full max-w-full border border-(--primary)/20 bg-(--tertiary)/5 ring-0 outline-none selection:bg-(--tertiary)/10 selection:text-(--font-color) autofill:bg-(--tertiary)/10 hover:border-(--primary)/40 hover:bg-(--tertiary)/10 hover:ring-[3px] hover:ring-(--tertiary)/30 active:border-(--primary)/40 active:bg-(--tertiary)/10 active:ring-[3px] active:ring-(--tertiary)/30 data-[state=open]:border-(--primary)/40 data-[state=open]:bg-(--tertiary)/10 data-[state=open]:ring-[3px] data-[state=open]:ring-(--tertiary)/30">
                                        <SelectValue placeholder="Pilih nama akses" />
                                    </SelectTrigger>
                                    <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                        {features.map((feature) => (
                                            <SelectItem
                                                key={feature.id}
                                                value={feature.permission}
                                            >
                                                {feature.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.feature} />
                            </div>

                            <div className="t-size1 flex items-center gap-1 font-medium text-stone-500">
                                <Info className="size-3.5 shrink-0 text-(--primary) bp360:size-3.75 bp400:size-4 md:size-4.25 lg:size-4.5 xl:size-4.75 2xl:size-5" />{' '}
                                Pilih fitur yang dapat diakses oleh pengguna
                                dengan akses ini.
                            </div>

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
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            reset();
                                            setSelectedFeature(
                                                permission.feature,
                                            );
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
