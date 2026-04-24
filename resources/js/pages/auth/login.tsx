import { Form, Head } from '@inertiajs/react';
import { Lock, Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
// import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    // canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-2 rounded-md bg-white p-2.5 shadow-[0_15px_40px_0px_rgba(0,0,0,0.12)] bp360:p-3 bp400:p-3.5 md:p-3.75 lg:gap-6 lg:p-4 xl:p-5 2xl:p-5.5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2 lg:gap-6">
                            <div className="grid gap-2">
                                <Label
                                    className="t-size3 text-(--font-color)"
                                    htmlFor="email"
                                >
                                    Email address
                                </Label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center px-3 text-(--font-color)/70">
                                        <Mail
                                            strokeWidth={2}
                                            className="size-3.5 md:size-3.75 lg:size-4 xl:size-4.25 2xl:size-4.5"
                                        />
                                    </span>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="Masukkan email anda"
                                        className="pl-8 bp360:pl-8"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        className="t-size3 text-(--font-color)"
                                        htmlFor="password"
                                    >
                                        Password
                                    </Label>
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Masukkan password anda"
                                    prefix={
                                        <Lock
                                            strokeWidth={2}
                                            className="size-3.5 md:size-3.75 lg:size-4 xl:size-4.25 2xl:size-4.5"
                                        />
                                    }
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-(--font-color)/70"
                                />
                                <Label
                                    className="t-size2 cursor-pointer font-medium text-(--font-color)/70 transition-all duration-300 ease-in-out hover:-translate-y-0.5"
                                    htmlFor="remember"
                                >
                                    Ingatkan Saya
                                </Label>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="t-size2 ml-auto text-(--tertiary) transition-all duration-300 ease-in-out hover:-translate-y-0.5"
                                        tabIndex={5}
                                    >
                                        Lupa password?
                                    </TextLink>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="t-size4 mt-2 w-full rounded-full font-semibold text-(--font-color) md:mt-4"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                                variant="secondary"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {/* {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Sign up
                                </TextLink>
                            </div>
                        )} */}
                    </>
                )}
            </Form>

            {status && (
                <div className="t-size3 mt-2 text-center font-medium text-green-600 md:mt-4">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Selamat Datang!',
    description: 'Log in untuk masuk sistem manajemen SANDU',
};
