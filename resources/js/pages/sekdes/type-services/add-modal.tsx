import { Form } from '@inertiajs/react';
import { ArrowLeft, Info, PlusCircle, RefreshCcw, Save } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { store } from '@/routes/type-services';

export default function AddModalTypeService() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('1');

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none">
                    <PlusCircle className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                    Tambah Baru
                </Button>
            </DialogTrigger>

            <DialogContent>
                {/* Icon wrapper */}
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
                                d="M42.8751 18.3776C42.3406 18.9228 42.0413 19.6558 42.0413 20.4193C42.0413 21.1827 42.3406 21.9157 42.8751 22.4609L47.5417 27.1276C48.0869 27.662 48.8199 27.9614 49.5834 27.9614C50.3468 27.9614 51.0799 27.662 51.6251 27.1276L60.6842 18.0714C61.6176 17.1322 63.2013 17.4297 63.5513 18.7072C64.4325 21.9122 64.3827 25.302 63.4077 28.4798C62.4327 31.6575 60.5729 34.4919 58.0458 36.6512C55.5187 38.8105 52.4288 40.2055 49.1379 40.6728C45.8469 41.1401 42.4909 40.6605 39.4626 39.2901L16.3917 62.3609C15.2314 63.5209 13.6578 64.1724 12.0172 64.1721C10.3765 64.1718 8.80312 63.5198 7.64318 62.3595C6.48325 61.1992 5.83176 59.6256 5.83203 57.9849C5.8323 56.3442 6.48432 54.7709 7.64464 53.6109L30.7155 30.5401C29.3451 27.5118 28.8655 24.1558 29.3328 20.8648C29.8001 17.5738 31.195 14.484 33.3544 11.9569C35.5137 9.4298 38.3481 7.56994 41.5258 6.59494C44.7036 5.61994 48.0933 5.57014 51.2984 6.45136C52.5759 6.80136 52.8734 8.3822 51.9371 9.32136L42.8751 18.3776Z"
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
                        Tambah Jenis Layanan Baru
                    </DialogTitle>
                    <DialogDescription>
                        Isi formulir untuk menambahkan jenis layanan baru.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    {...store.form()}
                    transform={(data) => ({
                        ...data,
                        is_active: selectedStatus,
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
                            <div className="flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                {/* Service Code */}
                                <Label
                                    className="t-size3 text-(--font-color)"
                                    htmlFor="service_code"
                                >
                                    Kode Layanan
                                </Label>
                                <Input
                                    id="service_code"
                                    type="text"
                                    name="service_code"
                                    placeholder="Contoh: LY-DOMISILI"
                                    tabIndex={1}
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.service_code} />
                            </div>

                            <div className="grid gap-1.5 bp360:gap-1.75 bp400:gap-2 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                    {/* Service Name */}
                                    <Label
                                        className="t-size3 text-(--font-color)"
                                        htmlFor="service_name"
                                    >
                                        Nama Layanan
                                    </Label>
                                    <Input
                                        id="service_name"
                                        type="text"
                                        name="service_name"
                                        placeholder="Contoh: Surat Keterangan Domisili"
                                        tabIndex={2}
                                        required
                                    />
                                    <InputError message={errors.service_name} />
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
                                        <SelectTrigger
                                            id="status"
                                            className="t-size3 w-full max-w-full border border-(--primary)/20 bg-(--tertiary)/5 ring-0 outline-none selection:bg-(--tertiary)/10 selection:text-(--font-color) autofill:bg-(--tertiary)/10 hover:border-(--primary)/40 hover:bg-(--tertiary)/10 hover:ring-[3px] hover:ring-(--tertiary)/30 active:border-(--primary)/40 active:bg-(--tertiary)/10 active:ring-[3px] active:ring-(--tertiary)/30 data-[state=open]:border-(--primary)/40 data-[state=open]:bg-(--tertiary)/10 data-[state=open]:ring-[3px] data-[state=open]:ring-(--tertiary)/30"
                                        >
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                            <SelectItem value="1">
                                                Aktif
                                            </SelectItem>
                                            <SelectItem value="0">
                                                Nonaktif
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                {/* Description */}
                                <Label
                                    className="t-size3 text-(--font-color)"
                                    htmlFor="description"
                                >
                                    Deskripsi Layanan
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    tabIndex={3}
                                    rows={5}
                                    placeholder="Penjelasan singkat mengenai peruntukan jenis layanan ini"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="t-size1 flex items-center gap-1 font-medium text-stone-500">
                                <Info className="size-3.5 shrink-0 text-(--primary) bp360:size-3.75 bp400:size-4 md:size-4.25 lg:size-4.5 xl:size-4.75 2xl:size-5" />
                                Kode layanan harus unik dan digunakan sebagai
                                acuan pengajuan surat.
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
                                            setSelectedStatus('1');
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
