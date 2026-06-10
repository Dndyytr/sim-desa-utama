import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Info,
    PlusCircle,
    RefreshCcw,
    Save,
    ShieldCheck,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { edit, index, update } from '@/routes/familys';

interface Resident {
    id: number;
    nik: string;
    name: string;
    pivot?: {
        relationship?: string | null;
    };
}

interface Family {
    id: number;
    no_kk: string;
    head_resident_id: number | string | null;
    address?: string | null;
    rt?: string | null;
    rw?: string | null;
    hamlet?: string | null;
    status: boolean;
    head_resident?: Resident | null;
    members?: Resident[];
}

interface FamilyMember {
    resident: Resident;
    relationship: string;
}

const relationshipOptions = [
    'Ayah',
    'Ibu',
    'Anak',
    'Saudara',
    'Mertua',
    'Cucu',
];

const normalizeRelationship = (relationship?: string | null) =>
    relationship && relationshipOptions.includes(relationship)
        ? relationship
        : 'Anak';

const hamletOptions = [
    'Wetan',
    'Kulon',
    'Tenjoe Laut',
    'Bojong Nangoh',
    'Cihideung',
    'Ciawitali',
];

const selectTriggerClass =
    't-size3 w-full max-w-full border border-(--primary)/20 bg-(--tertiary)/5 ring-0 outline-none selection:bg-(--tertiary)/10 selection:text-(--font-color) autofill:bg-(--tertiary)/10 hover:border-(--primary)/40 hover:bg-(--tertiary)/10 hover:ring-[3px] hover:ring-(--tertiary)/30 active:border-(--primary)/40 active:bg-(--tertiary)/10 active:ring-[3px] active:ring-(--tertiary)/30 data-[state=open]:border-(--primary)/40 data-[state=open]:bg-(--tertiary)/10 data-[state=open]:ring-[3px] data-[state=open]:ring-(--tertiary)/30';

const relationshipClass: Record<string, string> = {
    Ayah: 'bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-200 text-(--primary) [&>svg]:text-(--primary)',
    Ibu: 'bg-yellow-100 hover:bg-yellow-200 active:bg-yellow-200 text-yellow-700 [&>svg]:text-yellow-700',
    Anak: 'bg-blue-100 hover:bg-blue-200 active:bg-blue-200 text-blue-700 [&>svg]:text-blue-700',
    Saudara:
        'bg-violet-100 hover:bg-violet-200 active:bg-violet-200 text-violet-700 [&>svg]:text-violet-700',
    Mertua: 'bg-stone-100 hover:bg-stone-200 active:bg-stone-200 text-stone-700 [&>svg]:text-stone-700',
    Cucu: 'bg-cyan-100 hover:bg-cyan-200 active:bg-cyan-200 text-cyan-700 [&>svg]:text-cyan-700',
};

function RuleItem({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('flex items-start gap-2', className)}>
            <Check className="mt-0.5 size-3 shrink-0 rounded-full bg-(--primary)/10 p-0.5 text-(--primary) bp360:size-3.25 bp400:size-3.5 md:size-3.75 lg:size-4.25 xl:size-4.75 2xl:size-5.25" />
            <p className="t-size2 font-medium text-stone-600">{children}</p>
        </div>
    );
}

function SelectResidentButton({
    value,
    residents,
    placeholder,
    disabled,
    onChange,
    triggerVariant = 'field',
}: {
    value: string;
    residents: Resident[];
    placeholder: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    triggerVariant?: 'field' | 'button';
}) {
    const [search, setSearch] = useState('');
    const MAX_VISIBLE_RESIDENTS = 40;
    const selectedResident = residents.find(
        (resident) => resident.id.toString() === value,
    );

    const filteredResidents = residents
        .filter(
            (resident) =>
                resident.name.toLowerCase().includes(search.toLowerCase()) ||
                resident.nik.includes(search),
        )
        .slice(0, MAX_VISIBLE_RESIDENTS);
    const visibleResidents =
        selectedResident &&
        !filteredResidents.some(
            (resident) => resident.id === selectedResident.id,
        )
            ? [selectedResident, ...filteredResidents]
            : filteredResidents;

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger
                className={cn(
                    triggerVariant === 'button'
                        ? buttonVariants({ variant: 'default' })
                        : 't-size3 w-full max-w-full border border-(--primary)/20 bg-(--tertiary)/5 ring-0 outline-none selection:bg-(--tertiary)/10 selection:text-(--font-color) autofill:bg-(--tertiary)/10 hover:border-(--primary)/40 hover:bg-(--tertiary)/10 hover:ring-[3px] hover:ring-(--tertiary)/30 active:border-(--primary)/40 active:bg-(--tertiary)/10 active:ring-[3px] active:ring-(--tertiary)/30 data-[state=open]:border-(--primary)/40 data-[state=open]:bg-(--tertiary)/10 data-[state=open]:ring-[3px] data-[state=open]:ring-(--tertiary)/30',
                    triggerVariant === 'button' &&
                        't-size3 max-w-max text-white! ring-0 hover:text-(--primary)! hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none [&>svg]:text-white hover:[&>svg]:text-(--primary)',
                )}
            >
                {triggerVariant === 'button' ? (
                    <>
                        <PlusCircle className="size-4" />
                        {placeholder}
                    </>
                ) : selectedResident ? (
                    <>{selectedResident.name}</>
                ) : (
                    <SelectValue placeholder={placeholder} />
                )}
            </SelectTrigger>
            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    autoFocus
                    placeholder="Cari NIK atau nama..."
                    className="mb-2 bg-primary text-white placeholder:text-white/60 focus-visible:bg-primary"
                />
                <SelectSeparator className="bg-(--primary)/60" />
                <SelectGroup>
                    {visibleResidents.length > 0 ? (
                        visibleResidents.map((resident) => (
                            <SelectItem
                                key={resident.id}
                                value={resident.id.toString()}
                            >
                                <span className="flex min-w-0 flex-col">
                                    <span className="truncate">
                                        {resident.name}
                                    </span>
                                    <span className="t-size1 truncate opacity-70">
                                        {resident.nik}
                                    </span>
                                </span>
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="__empty" disabled>
                            Data tidak ditemukan
                        </SelectItem>
                    )}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default function FamilysEdit({
    family,
    residents,
}: {
    family: Family;
    residents: Resident[];
}) {
    const initialHeadResidentId = family.head_resident_id
        ? family.head_resident_id.toString()
        : (family.head_resident?.id.toString() ?? '');
    const initialHamlet = family.hamlet ?? '';
    const initialIsActive = family.status ? '1' : '0';
    const initialMembers = (family.members ?? [])
        .filter((member) => member.id.toString() !== initialHeadResidentId)
        .map((resident) => ({
            resident,
            relationship: normalizeRelationship(resident.pivot?.relationship),
        }));

    const [headResidentId, setHeadResidentId] = useState<string>(
        initialHeadResidentId,
    );
    const [isActive, setIsActive] = useState<string>(initialIsActive);
    const [hamlet, setHamlet] = useState<string>(initialHamlet);
    const [members, setMembers] = useState<FamilyMember[]>(initialMembers);

    type UpdateFamilyArg = Parameters<typeof update>[0];
    const familyRouteArg = {
        family: family.id,
    } as unknown as UpdateFamilyArg;

    const headResident = useMemo(
        () =>
            residents.find(
                (resident) => resident.id.toString() === headResidentId,
            ),
        [headResidentId, residents],
    );

    const availableMemberResidents = residents.filter(
        (resident) =>
            resident.id.toString() !== headResidentId &&
            !members.some((member) => member.resident.id === resident.id),
    );

    const tableRows = headResident
        ? [
              {
                  resident: headResident,
                  relationship: 'Ayah',
                  isHead: true,
              },
              ...members.map((member) => ({
                  ...member,
                  isHead: false,
              })),
          ]
        : [];

    const handleSelectHead = (residentId: string) => {
        setHeadResidentId(residentId);
        setMembers((current) =>
            current.filter(
                (member) => member.resident.id.toString() !== residentId,
            ),
        );
    };

    const handleAddMember = (residentId: string) => {
        const resident = residents.find(
            (resident) => resident.id.toString() === residentId,
        );

        if (!resident) {
            return;
        }

        setMembers((current) => [
            ...current,
            {
                resident,
                relationship:
                    current.length === 0 && headResident ? 'Ibu' : 'Anak',
            },
        ]);
    };

    const handleRelationshipChange = (residentId: number, value: string) => {
        setMembers((current) =>
            current.map((member) =>
                member.resident.id === residentId
                    ? { ...member, relationship: value }
                    : member,
            ),
        );
    };

    return (
        <>
            <Head title="Ubah Data Keluarga" />
            <span className="t-size2 ml-10 font-medium text-stone-500 bp360:ml-11 bp400:ml-12 md:ml-14.5 lg:ml-15.5 xl:ml-16.5 2xl:ml-18">
                Kelola Data Keluarga &gt; Ubah Keluarga
            </span>
            <div className="flex h-full flex-col gap-2 px-2 py-2 bp360:px-2.25 bp400:px-2.5 md:px-3 md:py-2.25 lg:px-3.5 lg:py-2.5 xl:px-4 xl:py-3 2xl:px-4.5 2xl:py-3.5">
                <Form
                    {...update.form(familyRouteArg)}
                    transform={(data) => ({
                        ...data,
                        head_resident_id: headResidentId,
                        hamlet,
                        status: isActive === '1',
                        member_ids: members.map((member) => member.resident.id),
                        member_relationships: members.map((member) => ({
                            resident_id: member.resident.id,
                            relationship: member.relationship,
                        })),
                    })}
                    disableWhileProcessing
                    className="flex h-full flex-col gap-2"
                >
                    {({ processing, errors, reset }) => (
                        <>
                            <div className="flex items-center gap-2 rounded-sm border-[1.5px] border-(--secondary)/50 bg-(--secondary)/10 px-2 py-1 bp400:rounded-md bp400:px-3 bp400:py-2 md:px-4 md:py-3 lg:rounded-lg">
                                <span className="min-w-max shrink-0">
                                    <Info className="size-5 text-(--secondary) bp360:size-5.25 bp400:size-5.5 md:size-5.75 lg:size-6.25 xl:size-6.75 2xl:size-7.25" />
                                </span>
                                <p className="t-size2 font-medium text-stone-500">
                                    Pastikan data keluarga yang Anda inputkan
                                    valid dan lengkap.
                                </p>
                            </div>

                            <div className="grid flex-1 grid-cols-1 gap-3 xl:grid-cols-[650px_1fr] 2xl:grid-cols-[900px_1fr]">
                                <div className="flex flex-col gap-2">
                                    <section className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                        <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                            <div className="min-w-max shrink-0">
                                                <span className="grid size-8.25 place-items-center rounded-full bg-(--primary)/10 bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                                    <Users className="size-4 text-(--primary) bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                                                </span>
                                            </div>
                                            <h2 className="t-size3 font-semibold text-(--primary)">
                                                Informasi Keluarga
                                            </h2>
                                        </div>

                                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="no_kk"
                                                >
                                                    Nomor KK
                                                </Label>
                                                <Input
                                                    id="no_kk"
                                                    type="text"
                                                    name="no_kk"
                                                    inputMode="numeric"
                                                    maxLength={16}
                                                    defaultValue={family.no_kk}
                                                    placeholder="3301010100010001"
                                                    required
                                                    tabIndex={1}
                                                    autoFocus
                                                />
                                                <InputError
                                                    message={errors.no_kk}
                                                />
                                            </div>

                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="head_resident_id"
                                                >
                                                    Kepala Keluarga
                                                </Label>
                                                <SelectResidentButton
                                                    value={headResidentId}
                                                    residents={residents}
                                                    placeholder="Pilih kepala keluarga"
                                                    onChange={handleSelectHead}
                                                    disabled={processing}
                                                />
                                                <InputError
                                                    message={
                                                        errors.head_resident_id
                                                    }
                                                />
                                            </div>

                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="address"
                                                >
                                                    Alamat
                                                </Label>
                                                <Input
                                                    id="address"
                                                    type="text"
                                                    name="address"
                                                    defaultValue={
                                                        family.address ?? ''
                                                    }
                                                    placeholder="Jl. Melati No. 12"
                                                    required
                                                />
                                                <InputError
                                                    message={errors.address}
                                                />
                                            </div>

                                            <div className="grid gap-2 sm:grid-cols-2 lg:col-span-1">
                                                <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                    <Label
                                                        className="t-size3 text-(--font-color)"
                                                        htmlFor="rt"
                                                    >
                                                        RT
                                                    </Label>
                                                    <Input
                                                        id="rt"
                                                        type="text"
                                                        name="rt"
                                                        maxLength={5}
                                                        defaultValue={
                                                            family.rt ?? ''
                                                        }
                                                        placeholder="001"
                                                    />
                                                    <InputError
                                                        message={errors.rt}
                                                    />
                                                </div>
                                                <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                    <Label
                                                        className="t-size3 text-(--font-color)"
                                                        htmlFor="rw"
                                                    >
                                                        RW
                                                    </Label>
                                                    <Input
                                                        id="rw"
                                                        type="text"
                                                        name="rw"
                                                        maxLength={5}
                                                        defaultValue={
                                                            family.rw ?? ''
                                                        }
                                                        placeholder="001"
                                                    />
                                                    <InputError
                                                        message={errors.rw}
                                                    />
                                                </div>
                                            </div>

                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="hamlet"
                                                >
                                                    Dusun
                                                </Label>
                                                <Select
                                                    value={hamlet}
                                                    onValueChange={setHamlet}
                                                    disabled={processing}
                                                >
                                                    <SelectTrigger
                                                        id="hamlet"
                                                        className={
                                                            selectTriggerClass
                                                        }
                                                    >
                                                        <SelectValue placeholder="Pilih dusun" />
                                                    </SelectTrigger>
                                                    <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                                        {hamletOptions.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={option}
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {option}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={errors.hamlet}
                                                />
                                            </div>

                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="status"
                                                >
                                                    Status Data
                                                </Label>
                                                <Select
                                                    value={isActive}
                                                    onValueChange={setIsActive}
                                                    disabled={processing}
                                                >
                                                    <SelectTrigger
                                                        id="status"
                                                        className={
                                                            selectTriggerClass
                                                        }
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
                                                <InputError
                                                    message={errors.status}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <section className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                                <div className="min-w-max shrink-0">
                                                    <span className="grid size-8.25 place-items-center rounded-full bg-(--primary)/10 bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                                        <Users className="size-4 text-(--primary) bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                                                    </span>
                                                </div>
                                                <h2 className="t-size3 font-semibold text-(--primary)">
                                                    Anggota Keluarga
                                                </h2>
                                            </div>

                                            <div className="ml-auto">
                                                <SelectResidentButton
                                                    value=""
                                                    residents={
                                                        availableMemberResidents
                                                    }
                                                    placeholder="Tambah"
                                                    onChange={handleAddMember}
                                                    disabled={
                                                        !headResident ||
                                                        processing
                                                    }
                                                    triggerVariant="button"
                                                />
                                            </div>
                                        </div>

                                        <div className="sb-primary overflow-x-auto rounded-md bg-white shadow-[0_0_5px_rgba(0,0,0,0.3)] lg:rounded-lg">
                                            <table className="w-full">
                                                <thead className="bg-(--secondary)/15">
                                                    <tr className="t-size3 whitespace-nowrap text-(--primary)">
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-3 text-center font-semibold"
                                                        >
                                                            No
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-3 text-center font-semibold"
                                                        >
                                                            Nama Penduduk
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-3 text-center font-semibold"
                                                        >
                                                            NIK
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-3 text-center font-semibold"
                                                        >
                                                            Hubungan Keluarga
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-3 text-center font-semibold"
                                                        >
                                                            Status Kepala
                                                            Keluarga
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-4 py-3 text-center font-semibold"
                                                        >
                                                            Aksi
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tableRows.length > 0 ? (
                                                        tableRows.map(
                                                            (row, index) => (
                                                                <tr
                                                                    key={
                                                                        row
                                                                            .resident
                                                                            .id
                                                                    }
                                                                    className="t-size2 border-b-[1.5px] border-(--primary)/10 text-(--font-color) last:border-b-0 even:bg-(--primary)/3"
                                                                >
                                                                    <td className="px-4 py-2 text-center font-medium">
                                                                        {index +
                                                                            1}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-center font-medium">
                                                                        {
                                                                            row
                                                                                .resident
                                                                                .name
                                                                        }
                                                                    </td>
                                                                    <td className="px-4 py-2 text-center font-medium">
                                                                        {
                                                                            row
                                                                                .resident
                                                                                .nik
                                                                        }
                                                                    </td>
                                                                    <td className="flex justify-center px-4 py-2 text-center font-medium">
                                                                        {row.isHead ? (
                                                                            <span
                                                                                className={cn(
                                                                                    'rounded-md px-3 py-2 font-semibold',
                                                                                    relationshipClass[
                                                                                        row
                                                                                            .relationship
                                                                                    ],
                                                                                )}
                                                                            >
                                                                                {
                                                                                    row.relationship
                                                                                }
                                                                            </span>
                                                                        ) : (
                                                                            <Select
                                                                                value={
                                                                                    row.relationship
                                                                                }
                                                                                onValueChange={(
                                                                                    value,
                                                                                ) =>
                                                                                    handleRelationshipChange(
                                                                                        row
                                                                                            .resident
                                                                                            .id,
                                                                                        value,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <SelectTrigger
                                                                                    className={cn(
                                                                                        't-size2 border-0 ring-0',
                                                                                        relationshipClass[
                                                                                            row
                                                                                                .relationship
                                                                                        ],
                                                                                    )}
                                                                                >
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                                                                    {relationshipOptions.map(
                                                                                        (
                                                                                            option,
                                                                                        ) => (
                                                                                            <SelectItem
                                                                                                key={
                                                                                                    option
                                                                                                }
                                                                                                value={
                                                                                                    option
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    option
                                                                                                }
                                                                                            </SelectItem>
                                                                                        ),
                                                                                    )}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-center font-medium">
                                                                        <span className="inline-flex items-center gap-1">
                                                                            {row.isHead ? (
                                                                                <>
                                                                                    <Check className="size-3.25 rounded-full bg-emerald-100 p-0.5 text-(--primary) bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                                                                    Kepala
                                                                                    Keluarga
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <X className="size-3.25 rounded-full bg-red-100 p-0.5 text-red-600 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                                                                    Bukan
                                                                                    Kepala
                                                                                    Keluarga
                                                                                </>
                                                                            )}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-center font-medium">
                                                                        <Button
                                                                            type="button"
                                                                            disabled={
                                                                                row.isHead
                                                                            }
                                                                            onClick={() =>
                                                                                setMembers(
                                                                                    (
                                                                                        current,
                                                                                    ) =>
                                                                                        current.filter(
                                                                                            (
                                                                                                member,
                                                                                            ) =>
                                                                                                member
                                                                                                    .resident
                                                                                                    .id !==
                                                                                                row
                                                                                                    .resident
                                                                                                    .id,
                                                                                        ),
                                                                                )
                                                                            }
                                                                            variant="error"
                                                                            className="gap-1 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                                                                        >
                                                                            <Trash2 className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )
                                                    ) : (
                                                        <tr>
                                                            <td
                                                                colSpan={6}
                                                                className="t-size2 px-4 py-8 text-center font-medium text-stone-500"
                                                            >
                                                                Pilih kepala
                                                                keluarga untuk
                                                                mulai menyusun
                                                                anggota.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
                                            <Info className="size-3.25 min-w-max shrink-0 text-blue-600 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                            <p className="t-size2 font-medium text-stone-600">
                                                Setiap anggota keluarga harus
                                                merupakan data penduduk yang
                                                terdaftar di sistem.
                                            </p>
                                        </div>
                                        <InputError
                                            message={errors.member_ids}
                                        />
                                    </section>
                                </div>

                                <aside className="grid grid-cols-1 gap-2 xl:auto-rows-min">
                                    <section className="flex flex-col gap-2 overflow-hidden rounded-lg border-[1.5px] border-(--secondary) bg-yellow-50 p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                        <div className="inline-flex items-center gap-2">
                                            <span className="relative z-2 grid size-8.25 shrink-0 place-items-center rounded-full border border-(--secondary) bg-(--secondary)/10 bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                                <ShieldCheck className="size-4 text-(--secondary) bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                                            </span>
                                            <h2 className="t-size3 relative z-1 animate-fade-left font-semibold text-(--primary)">
                                                Validasi Data
                                            </h2>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <RuleItem className="animate-fade-left opacity-0 delay-400">
                                                Nomor KK harus unik
                                            </RuleItem>
                                            <RuleItem className="animate-fade-left opacity-0 delay-600">
                                                Kepala keluarga wajib dipilih
                                            </RuleItem>
                                            <RuleItem className="animate-fade-left opacity-0 delay-800">
                                                Minimal 1 anggota keluarga
                                            </RuleItem>
                                            <RuleItem className="animate-fade-left opacity-0 delay-1000">
                                                Data digunakan untuk relasi
                                                layanan dan administrasi
                                            </RuleItem>
                                        </div>
                                    </section>

                                    <section className="flex flex-col gap-2 overflow-hidden rounded-lg border-[1.5px] border-(--primary) bg-green-50 p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                        <div className="inline-flex items-center gap-2">
                                            <div className="relative z-2 min-w-max shrink-0">
                                                <span className="grid size-8.25 place-items-center rounded-full bg-(--primary)/10 bp360:size-8.5 bp400:size-8.75 md:size-9.25 lg:size-9.75 xl:size-10.25 2xl:size-10.75">
                                                    <Users className="size-4 text-(--primary) bp360:size-4.25 bp400:size-4.5 md:size-4.75 lg:size-5.25 xl:size-5.75 2xl:size-6.25" />
                                                </span>
                                            </div>
                                            <h2 className="t-size3 relative z-1 animate-fade-left font-semibold text-(--primary)">
                                                Relasi Keluarga
                                            </h2>
                                        </div>
                                        <p className="t-size2 animate-fade-left font-medium text-stone-600 opacity-0 delay-200">
                                            Pilih hubungan keluarga sesuai
                                            kedudukan anggota dalam keluarga.
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex animate-fade-left items-center gap-2 opacity-0 delay-400">
                                                <span className="t-size2 inline-flex justify-center rounded-md bg-emerald-100 px-3 py-2 font-semibold text-(--primary)">
                                                    Ayah
                                                </span>
                                                <p className="t-size2 font-medium text-stone-600">
                                                    Laki-laki sebagai ayah atau
                                                    kepala keluarga.
                                                </p>
                                            </div>
                                            <div className="flex animate-fade-left items-center gap-2 opacity-0 delay-600">
                                                <span className="t-size2 inline-flex justify-center rounded-md bg-yellow-100 px-3 py-2 font-semibold text-yellow-700">
                                                    Ibu
                                                </span>
                                                <p className="t-size2 font-medium text-stone-600">
                                                    Perempuan sebagai istri dari
                                                    kepala keluarga.
                                                </p>
                                            </div>
                                            <div className="flex animate-fade-left items-center gap-2 opacity-0 delay-800">
                                                <span className="t-size2 inline-flex justify-center rounded-md bg-blue-100 px-3 py-2 font-semibold text-blue-700">
                                                    Anak
                                                </span>
                                                <p className="t-size2 font-medium text-stone-600">
                                                    Anak kandung atau anak
                                                    angkat dalam keluarga.
                                                </p>
                                            </div>
                                        </div>
                                        <p className="t-size2 animate-fade-left font-medium text-stone-600 opacity-0 delay-1000">
                                            Pilihan lainnya seperti Saudara,
                                            Mertua, Cucu, dll akan tersedia pada
                                            daftar hubungan.
                                        </p>
                                    </section>
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
                                            setHeadResidentId(
                                                initialHeadResidentId,
                                            );
                                            setIsActive(initialIsActive);
                                            setHamlet(initialHamlet);
                                            setMembers(initialMembers);
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
                                        disabled={processing || !headResidentId}
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

FamilysEdit.layout = {
    breadcrumbs: [
        {
            title: 'Ubah Data Keluarga',
            href: edit({ family: 0 }),
        },
    ],
};
