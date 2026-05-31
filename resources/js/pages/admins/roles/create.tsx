import { Form, Head, Link } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import {
    ArrowLeft,
    Eye,
    type LucideIcon,
    Pencil,
    PlusCircle,
    RefreshCcw,
    Save,
    ShieldCog,
    Trash2,
    UserCog,
} from 'lucide-react';
import { type MouseEvent, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { create, index, store } from '@/routes/roles';

interface Permission {
    id: number;
    title: string;
    name?: string;
}

interface Feature {
    id: number;
    title: string;
    icon: string;
    locale: string;
    parent_id?: number | string | null;
    permissions: Permission[];
}

export default function RolesCreate({ features }: { features: Feature[] }) {
    const filteredFeatures = features;
    const parentFeatures = filteredFeatures.filter(
        (feature) => !feature.parent_id,
    );
    const childFeaturesByParentId = filteredFeatures.reduce<
        Record<number, Feature[]>
    >((children, feature) => {
        if (!feature.parent_id) {
            return children;
        }

        const parentId = Number(feature.parent_id);

        return {
            ...children,
            [parentId]: [...(children[parentId] ?? []), feature],
        };
    }, {});
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
        [],
    );

    const allPermissionIds = filteredFeatures.flatMap((f) =>
        f.permissions.map((p) => p.id),
    );
    const isAllSelected =
        allPermissionIds.length > 0 &&
        allPermissionIds.every((id) => selectedPermissions.includes(id));

    const getFeatureIcon = (icon: string): LucideIcon => {
        const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[
            icon
        ];

        return Icon ?? ShieldCog;
    };

    const hasSamePermissionIds = (current: number[], next: number[]) =>
        current.length === next.length &&
        current.every((id) => next.includes(id));

    const togglePermission = (permissionId: number, checked: boolean) => {
        setSelectedPermissions((current) => {
            const next = checked
                ? Array.from(new Set([...current, permissionId]))
                : current.filter((id) => id !== permissionId);

            return hasSamePermissionIds(current, next) ? current : next;
        });
    };

    const toggleFeature = (feature: Feature, checked: boolean) => {
        const permissionIds = feature.permissions.map((p) => p.id);

        setSelectedPermissions((current) => {
            const next = checked
                ? Array.from(new Set([...current, ...permissionIds]))
                : current.filter((id) => !permissionIds.includes(id));

            return hasSamePermissionIds(current, next) ? current : next;
        });
    };

    const toggleSelectAll = (checked: boolean) => {
        setSelectedPermissions((current) => {
            const next = checked ? allPermissionIds : [];

            return hasSamePermissionIds(current, next) ? current : next;
        });
    };

    const handlePermissionItemClick = (
        event: MouseEvent<HTMLDivElement>,
        permissionId: number,
        isSelected: boolean,
    ) => {
        const target = event.target as HTMLElement;

        if (target.closest('button,input')) {
            return;
        }

        togglePermission(permissionId, !isSelected);
    };

    const isFeatureAllSelected = (feature: Feature) =>
        feature.permissions.length > 0 &&
        feature.permissions.every((p) => selectedPermissions.includes(p.id));

    const permissionItemClass = (selected: boolean) =>
        selected
            ? 'bg-(--primary) [&>svg]:text-white [&>span]:text-white'
            : 'bg-white hover:bg-(--primary)/20 [&>svg]:text-(--primary) [&>span]:text-(--primary)';

    const getPermissionIcon = (title: string): LucideIcon => {
        const normalizedTitle = title.toLowerCase();

        if (
            normalizedTitle.includes('read') ||
            normalizedTitle.includes('lihat')
        ) {
            return Eye;
        }

        if (
            normalizedTitle.includes('create') ||
            normalizedTitle.includes('tambah')
        ) {
            return PlusCircle;
        }

        if (
            normalizedTitle.includes('update') ||
            normalizedTitle.includes('ubah') ||
            normalizedTitle.includes('edit')
        ) {
            return Pencil;
        }

        if (
            normalizedTitle.includes('delete') ||
            normalizedTitle.includes('hapus')
        ) {
            return Trash2;
        }

        return ShieldCog;
    };

    const renderPermissionItems = (feature: Feature) =>
        feature.permissions.map((permission) => {
            const PermissionIcon = getPermissionIcon(permission.title);
            const isSelected = selectedPermissions.includes(permission.id);

            return (
                <div
                    key={permission.id}
                    onClick={(event) =>
                        handlePermissionItemClick(
                            event,
                            permission.id,
                            isSelected,
                        )
                    }
                    className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 shadow-[0_0_3.5px_0_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 active:translate-y-0.5 ${permissionItemClass(isSelected)}`}
                >
                    <Checkbox
                        id={`permission_${permission.id}`}
                        checked={isSelected}
                        className="pointer-events-none size-3.5 rounded-[3.7px] border-(--font-color)/70 data-[state=checked]:border-secondary data-[state=checked]:bg-secondary data-[state=checked]:text-primary bp360:size-3.75 bp400:size-4 md:size-4.25 lg:size-4.5 xl:size-4.75 2xl:size-5 [&>span>svg]:size-3 bp360:[&>span>svg]:size-3.25 bp400:[&>span>svg]:size-3.5 md:[&>span>svg]:size-3.75 lg:[&>span>svg]:size-4 xl:[&>span>svg]:size-4.25 2xl:[&>span>svg]:size-4.5"
                    />
                    <PermissionIcon className="size-3.5 shrink-0 bp360:size-3.75 bp400:size-4 md:size-4.25 lg:size-4.75 xl:size-5.25 2xl:size-5.75" />
                    <span className="t-size2 font-medium">
                        {permission.title}
                    </span>
                </div>
            );
        });

    return (
        <>
            <Head title="Kelola Peran" />
            <span className="t-size2 ml-10 font-medium text-stone-500 bp360:ml-11 bp400:ml-12 md:ml-14.5 lg:ml-15.5 xl:ml-16.5 2xl:ml-18">
                Kelola Peran &gt; Tambah Peran
            </span>
            <div className="h-full px-2 py-2 bp360:px-2.25 bp400:px-2.5 md:px-3 md:py-2.25 lg:px-3.5 lg:py-2.5 xl:px-4 xl:py-3 2xl:px-4.5 2xl:py-3.5">
                <Form
                    {...store.form()}
                    transform={(data) => ({
                        ...data,
                        permissions: selectedPermissions,
                    })}
                    disableWhileProcessing
                    className="h-full"
                >
                    {({ processing, errors, reset }) => (
                        <>
                            <div className="flex h-full flex-col gap-4 2xl:gap-5.5">
                                {/* Header */}
                                <div className="grid grid-cols-1 gap-2 sm:gap-2.5 md:grid-cols-[1fr_0.6fr]">
                                    <div className="flex flex-col gap-1 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-1.25 bp360:p-3 bp400:gap-1.5 bp400:p-3.25 sm:gap-1.75 md:gap-2 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                        <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                            <div className="min-w-max shrink-0">
                                                <span className="grid size-10.25 place-items-center rounded-full bg-yellow-100 bp360:size-10.5 bp400:size-10.75 md:size-11.25 lg:size-11.75 xl:size-12.25 2xl:size-12.75">
                                                    <UserCog className="size-6 text-(--secondary) bp360:size-6.25 bp400:size-6.5 md:size-6.75 lg:size-7.25 xl:size-7.75 2xl:size-8.25" />
                                                </span>
                                            </div>
                                            <figcaption className="flex flex-col">
                                                <h1 className="t-size3 font-semibold text-(--primary)">
                                                    Informasi Peran
                                                </h1>
                                                <p className="t-size2 font-medium text-stone-500">
                                                    Lengkapi data peran berikut
                                                </p>
                                            </figcaption>
                                        </div>
                                        <div className="grid gap-2 sm:gap-2.5">
                                            {/* Nama */}
                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
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
                                                    tabIndex={1}
                                                    autoComplete="name"
                                                    placeholder="Nama peran"
                                                    required
                                                />
                                                <InputError
                                                    message={errors.name}
                                                />
                                            </div>
                                            {/* Description */}
                                            <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <Label
                                                    className="t-size3 text-(--font-color)"
                                                    htmlFor="description"
                                                >
                                                    Deskripsi
                                                </Label>
                                                <Input
                                                    id="description"
                                                    type="text"
                                                    name="description"
                                                    tabIndex={2}
                                                    autoComplete="description"
                                                    placeholder="Deskripsi peran"
                                                    required
                                                />
                                                <InputError
                                                    message={errors.description}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 overflow-hidden rounded-lg bg-yellow-50 p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                        <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                            <div className="relative z-2 min-w-max shrink-0">
                                                <span className="grid size-10.25 place-items-center rounded-full bg-yellow-100 bp360:size-10.5 bp400:size-10.75 md:size-11.25 lg:size-11.75 xl:size-12.25 2xl:size-12.75">
                                                    <ShieldCog className="size-6 text-(--secondary) bp360:size-6.25 bp400:size-6.5 md:size-6.75 lg:size-7.25 xl:size-7.75 2xl:size-8.25" />
                                                </span>
                                            </div>
                                            <figcaption className="relative z-1 flex flex-col">
                                                <h1 className="t-size3 animate-fade-left font-semibold text-(--primary)">
                                                    Atur Hak Akses Peran
                                                </h1>
                                                <p className="t-size2 animate-fade-left font-medium text-stone-500 opacity-0 delay-500">
                                                    Pilih izin fitur yang dapat
                                                    diakses peran ini
                                                </p>
                                            </figcaption>
                                        </div>
                                        <div className="my-auto inline-grid grid-cols-[max-content_max-content] gap-1 bp360:gap-1.5 bp400:gap-1.75 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-4.5">
                                            {/* Read */}
                                            <div className="inline-flex animate-fade-up gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-yellow-100 bp360:size-8.25 bp400:size-8.5 md:size-9 lg:size-9.5 xl:size-10 2xl:size-10.5">
                                                    <Eye className="size-4.5 text-(--primary) bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.75 xl:size-6.25 2xl:size-6.75" />
                                                </span>
                                                <div className="w-full wrap-break-word whitespace-pre-wrap">
                                                    <h3 className="t-size2 font-semibold text-(--primary)">
                                                        Read
                                                    </h3>
                                                    <p className="t-size1 font-medium text-stone-500">
                                                        Melihat data
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Update */}
                                            <div className="inline-flex animate-fade-up gap-1.5 opacity-0 delay-700 bp360:gap-1.75 bp400:gap-2">
                                                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-yellow-100 bp360:size-8.25 bp400:size-8.5 md:size-9 lg:size-9.5 xl:size-10 2xl:size-10.5">
                                                    <Pencil className="size-4.5 text-(--primary) bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.75 xl:size-6.25 2xl:size-6.75" />
                                                </span>
                                                <div className="w-full wrap-break-word whitespace-pre-wrap">
                                                    <h3 className="t-size2 font-semibold text-(--primary)">
                                                        Update
                                                    </h3>
                                                    <p className="t-size1 font-medium text-stone-500">
                                                        Mengubah data
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Create */}
                                            <div className="inline-flex animate-fade-up gap-1.5 opacity-0 delay-500 bp360:gap-1.75 bp400:gap-2">
                                                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-yellow-100 bp360:size-8.25 bp400:size-8.5 md:size-9 lg:size-9.5 xl:size-10 2xl:size-10.5">
                                                    <PlusCircle className="size-4.5 text-(--primary) bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.75 xl:size-6.25 2xl:size-6.75" />
                                                </span>
                                                <div className="w-full wrap-break-word whitespace-pre-wrap">
                                                    <h3 className="t-size2 font-semibold text-(--primary)">
                                                        Create
                                                    </h3>
                                                    <p className="t-size1 font-medium text-stone-500">
                                                        Menambah data baru
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Delete */}
                                            <div className="inline-flex animate-fade-up gap-1.5 opacity-0 delay-800 bp360:gap-1.75 bp400:gap-2">
                                                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-yellow-100 bp360:size-8.25 bp400:size-8.5 md:size-9 lg:size-9.5 xl:size-10 2xl:size-10.5">
                                                    <Trash2 className="size-4.5 text-(--primary) bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.75 xl:size-6.25 2xl:size-6.75" />
                                                </span>
                                                <div className="w-full wrap-break-word whitespace-pre-wrap">
                                                    <h3 className="t-size2 font-semibold text-(--primary)">
                                                        Delete
                                                    </h3>
                                                    <p className="t-size1 font-medium text-stone-500">
                                                        Menghapus data
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                    <div className="flex flex-wrap items-center justify-between">
                                        <h3 className="t-size3 font-semibold text-(--primary)">
                                            Izin Fitur
                                        </h3>

                                        <div className="inline-flex items-center gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                            <Checkbox
                                                id="check_all"
                                                className="size-4.5 rounded-sm border-(--font-color)/70 bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.5 xl:size-5.75 2xl:size-6 [&>span>svg]:size-4 bp360:[&>span>svg]:size-4.25 bp400:[&>span>svg]:size-4.5 md:[&>span>svg]:size-4.75 lg:[&>span>svg]:size-5 xl:[&>span>svg]:size-5.25 2xl:[&>span>svg]:size-5.5"
                                                checked={isAllSelected}
                                                onCheckedChange={(checked) =>
                                                    toggleSelectAll(
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor="check_all"
                                                className="t-size3 cursor-pointer text-(--primary) select-none"
                                            >
                                                Pilih Semua
                                            </Label>

                                            <Separator orientation="vertical" />

                                            <span className="t-size2 rounded-md bg-(--secondary)/20 px-2 py-1 font-medium text-(--primary)">
                                                {selectedPermissions.length}{' '}
                                                dari {allPermissionIds.length}{' '}
                                                dipilih
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {parentFeatures.map((feature) => {
                                            const IconComponent =
                                                getFeatureIcon(feature.icon);
                                            const featureChecked =
                                                isFeatureAllSelected(feature);
                                            const childFeatures =
                                                childFeaturesByParentId[
                                                    feature.id
                                                ] ?? [];

                                            return (
                                                <div
                                                    key={feature.id}
                                                    className="inline-flex flex-col flex-wrap gap-2 rounded-md bg-white p-2 shadow-[0_0_3.5px_0_rgba(0,0,0,0.2)] bp400:flex-row md:p-2.5 xl:p-3 2xl:p-3.5"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <Checkbox
                                                            id={`feature_${feature.id}`}
                                                            checked={
                                                                featureChecked
                                                            }
                                                            className="mt-2 size-4.5 rounded-sm border-(--font-color)/70 bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.5 xl:size-5.75 2xl:size-6 [&>span>svg]:size-4 bp360:[&>span>svg]:size-4.25 bp400:[&>span>svg]:size-4.5 md:[&>span>svg]:size-4.75 lg:[&>span>svg]:size-5 xl:[&>span>svg]:size-5.25 2xl:[&>span>svg]:size-5.5"
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                toggleFeature(
                                                                    feature,
                                                                    checked ===
                                                                        true,
                                                                )
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={`feature_${feature.id}`}
                                                            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-md bg-(--primary)/10 bp360:size-9.25 bp400:size-9.5 md:size-10 lg:size-10.5 xl:size-11 2xl:size-11.5"
                                                        >
                                                            <IconComponent className="size-5.5 text-(--primary) bp360:size-5.75 bp400:size-6 md:size-6.25 lg:size-6.75 xl:size-7.25 2xl:size-7.75" />
                                                        </Label>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <h3 className="t-size3 font-semibold text-(--primary)">
                                                            {feature.title}
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4">
                                                            {renderPermissionItems(
                                                                feature,
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Child Menu */}
                                                    {childFeatures.length >
                                                        0 && (
                                                        <div className="inline-flex flex-col flex-wrap gap-2 rounded-md bg-white p-2 shadow-[0_0_3.5px_0_rgba(0,0,0,0.2)] bp400:flex-row md:p-2.5 xl:p-3 2xl:p-3.5">
                                                            {childFeatures.map(
                                                                (
                                                                    childFeature,
                                                                ) => {
                                                                    const ChildIcon =
                                                                        getFeatureIcon(
                                                                            childFeature.icon,
                                                                        );
                                                                    const childChecked =
                                                                        isFeatureAllSelected(
                                                                            childFeature,
                                                                        );

                                                                    return (
                                                                        <>
                                                                            <div
                                                                                key={
                                                                                    childFeature.id
                                                                                }
                                                                                className="flex items-start gap-2"
                                                                            >
                                                                                <Checkbox
                                                                                    id={`feature_${childFeature.id}`}
                                                                                    checked={
                                                                                        childChecked
                                                                                    }
                                                                                    className="mt-2 size-4.5 rounded-sm border-(--font-color)/70 bp360:size-4.75 bp400:size-5 md:size-5.25 lg:size-5.5 xl:size-5.75 2xl:size-6 [&>span>svg]:size-4 bp360:[&>span>svg]:size-4.25 bp400:[&>span>svg]:size-4.5 md:[&>span>svg]:size-4.75 lg:[&>span>svg]:size-5 xl:[&>span>svg]:size-5.25 2xl:[&>span>svg]:size-5.5"
                                                                                    onCheckedChange={(
                                                                                        checked,
                                                                                    ) =>
                                                                                        toggleFeature(
                                                                                            childFeature,
                                                                                            checked ===
                                                                                                true,
                                                                                        )
                                                                                    }
                                                                                />
                                                                                <Label
                                                                                    htmlFor={`feature_${childFeature.id}`}
                                                                                    className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-md bg-(--primary)/10 bp360:size-9.25 bp400:size-9.5 md:size-10 lg:size-10.5 xl:size-11 2xl:size-11.5"
                                                                                >
                                                                                    <ChildIcon className="size-5.5 text-(--primary) bp360:size-5.75 bp400:size-6 md:size-6.25 lg:size-6.75 xl:size-7.25 2xl:size-7.75" />
                                                                                </Label>
                                                                            </div>
                                                                            <div className="flex flex-col gap-2">
                                                                                <h3 className="t-size3 font-semibold text-(--primary)">
                                                                                    {
                                                                                        childFeature.title
                                                                                    }
                                                                                </h3>
                                                                                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4">
                                                                                    {renderPermissionItems(
                                                                                        childFeature,
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.permissions} />
                                </div>

                                <div className="mt-auto flex flex-wrap justify-between gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                    <Link href={index().url}>
                                        <Button
                                            variant="ghost"
                                            className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                                        >
                                            <ArrowLeft className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                            Kembali
                                        </Button>
                                    </Link>
                                    <div className="ml-auto flex gap-2">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                reset();
                                                setSelectedPermissions([]);
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
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

RolesCreate.layout = {
    breadcrumbs: [
        {
            title: 'Tambah Peran',
            href: create(),
        },
    ],
};
