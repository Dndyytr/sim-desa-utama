import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Info,
    RefreshCcw,
    Save,
    ShieldCheck,
    UserPlus,
    UserRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Calendar28 } from '@/components/picker-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { edit, index, update } from '@/routes/residents';

const religionOptions = [
    'Islam',
    'Kristen',
    'Katolik',
    'Hindu',
    'Buddha',
    'Konghucu',
];

const maritalStatusOptions = [
    'Belum Kawin',
    'Kawin',
    'Cerai Hidup',
    'Cerai Mati',
];

const selectTriggerClass =
    't-size3 w-full max-w-full border border-(--primary)/20 bg-(--tertiary)/5 ring-0 outline-none selection:bg-(--tertiary)/10 selection:text-(--font-color) autofill:bg-(--tertiary)/10 hover:border-(--primary)/40 hover:bg-(--tertiary)/10 hover:ring-[3px] hover:ring-(--tertiary)/30 active:border-(--primary)/40 active:bg-(--tertiary)/10 active:ring-[3px] active:ring-(--tertiary)/30 data-[state=open]:border-(--primary)/40 data-[state=open]:bg-(--tertiary)/10 data-[state=open]:ring-[3px] data-[state=open]:ring-(--tertiary)/30';

interface Resident {
    id: number;
    nik: string;
    no_kk: string;
    name: string;
    birth_place: string;
    birth_date: string;
    gender: 'Laki-laki' | 'Perempuan';
    religion: string;
    marital_status: string;
    occupation: string;
    address: string;
    is_active: boolean;
}

function SelectField({
    id,
    value,
    onChange,
    placeholder,
    options,
    disabled,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: string[];
    disabled: boolean;
}) {
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger id={id} className={selectTriggerClass}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                {options.map((option) => (
                    <SelectItem key={option} value={option}>
                        {option}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function ValidationItem({
    title,
    children,
    className,
}: {
    title: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-2 border-b border-dashed border-(--secondary)/50 pb-4 last:border-b-0 last:pb-0 md:gap-2.5 lg:gap-2.75 xl:gap-3',
                className,
            )}
        >
            <div className="min-w-max shrink-0">
                <span className="grid size-7.25 place-items-center rounded-full border border-(--primary) bg-(--primary)/10 bp360:size-7.5 bp400:size-7.75 md:size-8.25 lg:size-8.75 xl:size-9.25 2xl:size-9.75">
                    <Check
                        strokeWidth={3}
                        className="size-3 text-(--primary) bp360:size-3.25 bp400:size-3.5 md:size-3.75 lg:size-4.25 xl:size-4.75 2xl:size-5.25"
                    />
                </span>
            </div>
            <div className="flex flex-col">
                <h3 className="t-size2 font-semibold text-(--primary)">
                    {title}
                </h3>
                <p className="t-size1 font-medium text-stone-600">{children}</p>
            </div>
        </div>
    );
}

export default function ResidentsEdit({ resident }: { resident: Resident }) {
    const initialBirthDate = resident.birth_date
        ? resident.birth_date.split('T')[0]
        : '';
    const initialIsActive = resident.is_active ? '1' : '0';
    const [gender, setGender] = useState<string>(resident.gender);
    const [birthDate, setBirthDate] = useState<string>(initialBirthDate);
    const [religion, setReligion] = useState<string>(resident.religion);
    const [maritalStatus, setMaritalStatus] = useState<string>(
        resident.marital_status,
    );
    const [isActive, setIsActive] = useState<string>(initialIsActive);
    const [calendarResetKey, setCalendarResetKey] = useState(0);

    type UpdateResidentArg = Parameters<typeof update>[0];
    const updateResidentArg = {
        resident: resident.id,
    } as unknown as UpdateResidentArg;

    return (
        <>
            <Head title="Kelola Data Penduduk" />
            <span className="t-size2 ml-10 font-medium text-stone-500 bp360:ml-11 bp400:ml-12 md:ml-14.5 lg:ml-15.5 xl:ml-16.5 2xl:ml-18">
                Kelola Data Penduduk &gt; Edit Data Penduduk
            </span>
            <div className="flex h-full flex-col gap-2 px-2 py-2 bp360:px-2.25 bp400:px-2.5 md:px-3 md:py-2.25 lg:px-3.5 lg:py-2.5 xl:px-4 xl:py-3 2xl:px-4.5 2xl:py-3.5">
                <Form
                    {...update.form(updateResidentArg)}
                    transform={(data) => ({
                        ...data,
                        gender,
                        birth_date: birthDate,
                        religion,
                        marital_status: maritalStatus,
                        is_active: isActive === '1',
                    })}
                    disableWhileProcessing
                    className="flex h-full flex-col gap-2"
                >
                    {({ processing, errors, reset }) => (
                        <>
                            <div className="flex flex-col gap-2">
                                <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                    <div className="min-w-max shrink-0">
                                        <span className="grid size-10.25 place-items-center rounded-full bg-(--primary)/10 bp360:size-10.5 bp400:size-10.75 md:size-11.25 lg:size-11.75 xl:size-12.25 2xl:size-12.75">
                                            <UserPlus className="size-6 text-(--primary) bp360:size-6.25 bp400:size-6.5 md:size-6.75 lg:size-7.25 xl:size-7.75 2xl:size-8.25" />
                                        </span>
                                    </div>
                                    <figcaption className="flex flex-col">
                                        <h1 className="t-size3 font-semibold text-(--font-color)">
                                            Identitas Penduduk
                                        </h1>
                                        <p className="t-size2 font-medium text-stone-500">
                                            Perbarui identitas penduduk dengan
                                            benar. Data yang valid akan
                                            digunakan untuk layanan desa dan
                                            pengelolaan keluarga.
                                        </p>
                                    </figcaption>
                                </div>
                                <div className="flex items-center gap-2 rounded-sm border-[1.5px] border-(--secondary)/50 bg-(--secondary)/10 px-2 py-1 bp400:rounded-md bp400:px-3 bp400:py-2 md:px-4 md:py-3 lg:rounded-lg">
                                    <Info className="size-5 text-(--secondary) bp360:size-5.25 bp400:size-5.5 md:size-5.75 lg:size-6.25 xl:size-6.75 2xl:size-7.25" />
                                    <p className="t-size2 font-medium text-stone-500">
                                        Pastikan NIK unik dan seluruh data wajib
                                        diisi dengan benar.
                                    </p>
                                </div>
                            </div>

                            <div className="grid flex-1 gap-3 xl:grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_400px]">
                                <div className="flex flex-col gap-3">
                                    <section className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                        <h2 className="t-size3 border-l-4 border-(--secondary) pl-3 font-semibold text-(--primary)">
                                            1. Informasi Utama
                                        </h2>

                                        <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5">
                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="nik"
                                                >
                                                    NIK
                                                </Label>
                                                <Input
                                                    id="nik"
                                                    type="text"
                                                    name="nik"
                                                    inputMode="numeric"
                                                    defaultValue={resident.nik}
                                                    maxLength={16}
                                                    placeholder="Masukkan NIK (16 digit)"
                                                    tabIndex={1}
                                                    required
                                                    autoFocus
                                                />
                                                <p className="t-size1 font-medium text-stone-500">
                                                    NIK harus unik dan tidak
                                                    boleh sama dengan data lain.
                                                </p>
                                                <InputError
                                                    message={errors.nik}
                                                />
                                            </div>

                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="no_kk"
                                                >
                                                    No KK
                                                </Label>
                                                <Input
                                                    id="no_kk"
                                                    type="text"
                                                    name="no_kk"
                                                    inputMode="numeric"
                                                    defaultValue={
                                                        resident.no_kk
                                                    }
                                                    maxLength={16}
                                                    placeholder="Masukkan No KK"
                                                    tabIndex={2}
                                                    required
                                                />
                                                <p className="t-size1 font-medium text-stone-500">
                                                    No KK wajib diisi dan harus
                                                    sesuai dengan Kartu
                                                    Keluarga.
                                                </p>
                                                <InputError
                                                    message={errors.no_kk}
                                                />
                                            </div>

                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="name"
                                                >
                                                    Nama Lengkap
                                                </Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    name="name"
                                                    defaultValue={resident.name}
                                                    placeholder="Masukkan nama lengkap"
                                                    tabIndex={3}
                                                    required
                                                />
                                                <InputError
                                                    message={errors.name}
                                                />
                                            </div>

                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="birth_place"
                                                >
                                                    Tempat Lahir
                                                </Label>
                                                <Input
                                                    id="birth_place"
                                                    type="text"
                                                    name="birth_place"
                                                    defaultValue={
                                                        resident.birth_place
                                                    }
                                                    placeholder="Masukkan tempat lahir"
                                                    tabIndex={4}
                                                    required
                                                />
                                                <InputError
                                                    message={errors.birth_place}
                                                />
                                            </div>

                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="birth_date"
                                                >
                                                    Tanggal Lahir
                                                </Label>

                                                <Calendar28
                                                    key={calendarResetKey}
                                                    id="birth_date"
                                                    name="birth_date"
                                                    value={birthDate}
                                                    onChange={setBirthDate}
                                                    required
                                                />
                                                <InputError
                                                    message={errors.birth_date}
                                                />
                                            </div>

                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="gender"
                                                >
                                                    Jenis Kelamin
                                                </Label>
                                                <div
                                                    id="gender"
                                                    className="grid grid-cols-2 gap-2"
                                                >
                                                    {[
                                                        'Laki-laki',
                                                        'Perempuan',
                                                    ].map((option) => (
                                                        <button
                                                            key={option}
                                                            type="button"
                                                            aria-pressed={
                                                                gender ===
                                                                option
                                                            }
                                                            onClick={() =>
                                                                setGender(
                                                                    option,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            className={cn(
                                                                't-size3 inline-flex cursor-pointer items-center justify-center gap-1 rounded-md border-[1.5px] px-2.5 py-1.5 font-medium whitespace-nowrap transition-all duration-300 ease-in-out outline-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive bp360:px-3 bp360:py-2 [&_svg]:pointer-events-none [&_svg]:shrink-0',
                                                                gender ===
                                                                    option
                                                                    ? 'border-(--primary)/80 bg-(--primary)/30 text-(--primary)'
                                                                    : 'border-(--primary)/50 bg-white text-(--font-color) hover:-translate-y-0.5 hover:border-(--primary)/80 hover:bg-(--primary)/30 hover:text-(--primary) hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:border-(--primary)/80 active:bg-(--primary)/30 active:shadow-none',
                                                            )}
                                                        >
                                                            <UserRound
                                                                strokeWidth={
                                                                    2.5
                                                                }
                                                                className={cn(
                                                                    'size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75',
                                                                    option ===
                                                                        'Perempuan'
                                                                        ? 'text-red-500'
                                                                        : 'text-(--primary)',
                                                                )}
                                                            />
                                                            {option}
                                                        </button>
                                                    ))}
                                                </div>
                                                <InputError
                                                    message={errors.gender}
                                                />
                                            </div>

                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="religion"
                                                >
                                                    Agama
                                                </Label>
                                                <SelectField
                                                    id="religion"
                                                    value={religion}
                                                    onChange={setReligion}
                                                    placeholder="Pilih agama"
                                                    options={religionOptions}
                                                    disabled={processing}
                                                />
                                                <InputError
                                                    message={errors.religion}
                                                />
                                            </div>

                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="marital_status"
                                                >
                                                    Status Perkawinan
                                                </Label>
                                                <SelectField
                                                    id="marital_status"
                                                    value={maritalStatus}
                                                    onChange={setMaritalStatus}
                                                    placeholder="Pilih status perkawinan"
                                                    options={
                                                        maritalStatusOptions
                                                    }
                                                    disabled={processing}
                                                />
                                                <InputError
                                                    message={
                                                        errors.marital_status
                                                    }
                                                />
                                            </div>

                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="occupation"
                                                >
                                                    Pekerjaan
                                                </Label>

                                                <Input
                                                    id="occupation"
                                                    type="text"
                                                    name="occupation"
                                                    defaultValue={
                                                        resident.occupation
                                                    }
                                                    placeholder="Masukkan pekerjaan"
                                                    tabIndex={5}
                                                    required
                                                />
                                                <InputError
                                                    message={errors.occupation}
                                                />
                                            </div>

                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="is_active"
                                                >
                                                    Status Data
                                                </Label>
                                                <Select
                                                    value={isActive}
                                                    onValueChange={setIsActive}
                                                    disabled={processing}
                                                >
                                                    <SelectTrigger
                                                        id="is_active"
                                                        className={
                                                            selectTriggerClass
                                                        }
                                                    >
                                                        <SelectValue placeholder="Pilih status data" />
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
                                                <InputError
                                                    message={errors.is_active}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <section className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                        <h2 className="t-size3 border-l-4 border-(--secondary) pl-3 font-semibold text-(--primary)">
                                            2. Alamat Penduduk
                                        </h2>

                                        <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                            <Label
                                                className="t-size3 text-(--font-color)"
                                                htmlFor="address"
                                            >
                                                Alamat Lengkap
                                            </Label>
                                            <Textarea
                                                id="address"
                                                name="address"
                                                defaultValue={resident.address}
                                                rows={4}
                                                placeholder="Masukkan alamat lengkap sesuai domisili"
                                                required
                                            />
                                            <InputError
                                                message={errors.address}
                                            />
                                        </div>
                                    </section>
                                </div>

                                <aside className="flex flex-col gap-2 overflow-hidden rounded-lg border-[1.5px] border-(--secondary) bg-yellow-50 p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                    <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                        <div className="relative z-2 min-w-max shrink-0">
                                            <span className="grid size-10.25 place-items-center rounded-full border border-(--secondary) bg-(--secondary)/10 bp360:size-10.5 bp400:size-10.75 md:size-11.25 lg:size-11.75 xl:size-12.25 2xl:size-12.75">
                                                <ShieldCheck className="size-6 text-(--secondary) bp360:size-6.25 bp400:size-6.5 md:size-6.75 lg:size-7.25 xl:size-7.75 2xl:size-8.25" />
                                            </span>
                                        </div>
                                        <div className="relative z-1 flex flex-col">
                                            <h2 className="t-size3 animate-fade-left font-semibold text-(--primary)">
                                                Validasi Data
                                            </h2>
                                            <p className="t-size2 animate-fade-left font-medium text-stone-600 opacity-0 delay-500">
                                                Pastikan seluruh data diisi
                                                dengan benar sesuai ketentuan
                                                berikut.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex flex-col gap-2 xl:gap-3 2xl:gap-4">
                                        <ValidationItem
                                            title="NIK harus unik"
                                            className="animate-fade-left opacity-0 delay-800"
                                        >
                                            NIK tidak boleh sama dengan data
                                            penduduk lain dan terdiri dari 16
                                            digit.
                                        </ValidationItem>
                                        <ValidationItem
                                            title="No KK wajib diisi"
                                            className="animate-fade-left opacity-0 delay-1000"
                                        >
                                            Nomor Kartu Keluarga harus valid dan
                                            terdaftar di wilayah desa.
                                        </ValidationItem>
                                        <ValidationItem
                                            title="Data akan digunakan pada layanan dan keluarga"
                                            className="animate-fade-left opacity-0 delay-1200"
                                        >
                                            Data penduduk akan digunakan untuk
                                            layanan desa, pengelolaan keluarga,
                                            dan laporan.
                                        </ValidationItem>
                                    </div>
                                </aside>
                            </div>

                            <div className="mt-auto flex flex-wrap justify-between gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                <Link href={index().url}>
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                                    >
                                        <ArrowLeft className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                        Batal
                                    </Button>
                                </Link>
                                <div className="ml-auto flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            reset();
                                            setGender(resident.gender);
                                            setBirthDate(initialBirthDate);
                                            setReligion(resident.religion);
                                            setMaritalStatus(
                                                resident.marital_status,
                                            );
                                            setIsActive(initialIsActive);
                                            setCalendarResetKey(
                                                (current) => current + 1,
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
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ResidentsEdit.layout = {
    breadcrumbs: [
        {
            title: 'Edit Data Penduduk',
            href: edit({ resident: 0 }),
        },
    ],
};
