import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, LockKeyhole, RefreshCcw, Save, User } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { MultiSelect } from '@/components/multi-select';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { update } from '@/routes/users';

export default function UsersEdit({
    user,
    roles,
    userRoles,
}: {
    user: any;
    roles: any[];
    userRoles: string[];
}) {
    const [selectedRoles, setSelectedRoles] = useState<string[]>(
        userRoles || [],
    );

    return (
        <>
            <Head title="Kelola Pengguna" />
            <span className="t-size2 ml-10 font-medium text-stone-500 bp360:ml-11 bp400:ml-12 md:ml-14.5 lg:ml-15.5 xl:ml-16.5 2xl:ml-18">
                Kelola Pengguna &gt; Edit Pengguna
            </span>
            <div className="h-full px-2 py-2 bp360:px-2.25 bp400:px-2.5 md:px-3 md:py-2.25 lg:px-3.5 lg:py-2.5 xl:px-4 xl:py-3 2xl:px-4.5 2xl:py-3.5">
                <Form
                    {...update.form({ user: user.id })}
                    transform={(data) => ({
                        ...data,
                        roles: selectedRoles,
                    })}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="h-full"
                >
                    {({ processing, errors, reset }) => (
                        <>
                            <div className="flex h-full flex-col gap-4 2xl:gap-5.5">
                                <div className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                    <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                        <div className="min-w-max shrink-0">
                                            <span className="grid size-10.25 place-items-center rounded-full bg-(--primary)/10 bp360:size-10.5 bp400:size-10.75 md:size-11.25 lg:size-11.75 xl:size-12.25 2xl:size-12.75">
                                                <User className="size-6 text-(--primary) bp360:size-6.25 bp400:size-6.5 md:size-6.75 lg:size-7.25 xl:size-7.75 2xl:size-8.25" />
                                            </span>
                                        </div>
                                        <figcaption className="flex flex-col">
                                            <h1 className="t-size3 font-semibold text-(--font-color)">
                                                Informasi Pengguna
                                            </h1>
                                            <p className="t-size2 font-medium text-stone-500">
                                                Perbarui data pengguna dengan
                                                informasi yang benar
                                            </p>
                                        </figcaption>
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-3">
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
                                                placeholder="Nama pengguna"
                                                defaultValue={user.name}
                                                required
                                            />
                                            <InputError message={errors.name} />
                                        </div>
                                        {/* Email */}
                                        <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                            <Label
                                                className="t-size3 text-(--font-color)"
                                                htmlFor="email"
                                            >
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                tabIndex={2}
                                                autoComplete="email"
                                                placeholder="email@example.com"
                                                defaultValue={user.email}
                                                required
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>
                                        {/* Peran */}
                                        <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                            <Label
                                                className="t-size3 text-(--font-color)"
                                                htmlFor="roles"
                                            >
                                                Peran
                                            </Label>
                                            <MultiSelect
                                                options={roles.map((role) => ({
                                                    value: role.name,
                                                    label: role.name,
                                                }))}
                                                defaultValue={selectedRoles}
                                                onValueChange={setSelectedRoles}
                                                placeholder="Pilih Peran"
                                                variant="inverted"
                                                animation={2}
                                                maxCount={3}
                                            />
                                            <InputError
                                                message={errors.roles}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                    <div className="inline-flex items-center gap-2 md:gap-2.5 lg:gap-2.75 xl:gap-3">
                                        <div className="min-w-max">
                                            <span className="grid size-10.25 place-items-center rounded-full bg-(--primary)/10 bp360:size-10.5 bp400:size-10.75 md:size-11.25 lg:size-11.75 xl:size-12.25 2xl:size-12.75">
                                                <LockKeyhole className="size-6 text-(--primary) bp360:size-6.25 bp400:size-6.5 md:size-6.75 lg:size-7.25 xl:size-7.75 2xl:size-8.25" />
                                            </span>
                                        </div>
                                        <figcaption className="flex flex-col">
                                            <h1 className="t-size3 font-semibold text-(--font-color)">
                                                Kata Sandi
                                            </h1>
                                            <p className="t-size2 font-medium text-stone-500">
                                                Kosongkan jika tidak ingin
                                                mengubah kata sandi
                                            </p>
                                        </figcaption>
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5">
                                        <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                            <Label
                                                className="t-size3 text-(--font-color)"
                                                htmlFor="password"
                                            >
                                                Password Baru
                                            </Label>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                disabled={processing}
                                                placeholder="Masukkan password baru"
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>
                                        <div className="inline-flex flex-col gap-1.5 bp360:gap-1.75 bp400:gap-2">
                                            <Label
                                                className="t-size3 text-(--font-color)"
                                                htmlFor="password_confirmation"
                                            >
                                                Konfirmasi Password
                                            </Label>
                                            <PasswordInput
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                tabIndex={5}
                                                autoComplete="new-password"
                                                disabled={processing}
                                                placeholder="Konfirmasi Password"
                                            />
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                            />
                                        </div>
                                    </div>
                                    <span className="t-size2 font-medium text-stone-500">
                                        Minimal 8 karakter dengan kombinasi
                                        huruf dan angka
                                    </span>
                                </div>

                                <div className="mt-auto flex flex-wrap justify-between gap-2 rounded-lg bg-white p-2.5 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] bp360:gap-2.25 bp360:p-3 bp400:gap-2.5 bp400:p-3.25 sm:gap-2.75 md:gap-3 md:p-3.5 lg:p-4 xl:p-4.5 2xl:p-5">
                                    <Link href={route('users.index')}>
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
                                                setSelectedRoles(
                                                    userRoles || [],
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
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
