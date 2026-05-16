import { Eye, EyeOff } from 'lucide-react';
import type { ComponentProps, ReactNode, Ref } from 'react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends Omit<
    ComponentProps<'input'>,
    'type' | 'prefix'
> {
    ref?: Ref<HTMLInputElement>;
    prefix?: ReactNode;
}

export default function PasswordInput({
    className,
    ref,
    prefix,
    ...props
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            {prefix && (
                <span className="absolute inset-y-0 left-0 flex items-center px-3 text-(--font-color)/70">
                    {prefix}
                </span>
            )}
            <Input
                type={showPassword ? 'text' : 'password'}
                className={cn('pr-10', prefix && 'pl-9 bp360:pl-9', className)}
                ref={ref}
                {...props}
            />
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-(--font-color)/70 transition-all duration-300 ease-in-out hover:text-(--font-color) active:text-(--font-color)"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
            >
                {showPassword ? (
                    <Eye
                        strokeWidth={2.5}
                        className="size-4 md:size-4.25 lg:size-4.5 xl:size-4.75 2xl:size-5"
                    />
                ) : (
                    <EyeOff
                        strokeWidth={2.5}
                        className="size-4 md:size-4.25 lg:size-4.5 xl:size-4.75 2xl:size-5"
                    />
                )}
            </button>
        </div>
    );
}
