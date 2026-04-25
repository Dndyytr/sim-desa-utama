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
                className={cn('pr-10', prefix && 'pl-8 bp360:pl-8', className)}
                ref={ref}
                {...props}
            />
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center rounded-r-md px-3 text-(--font-color)/70 hover:text-(--font-color) focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
            >
                {showPassword ? (
                    <EyeOff
                        strokeWidth={2}
                        className="size-4 md:size-4.5 lg:size-4.75 2xl:size-5"
                    />
                ) : (
                    <Eye
                        strokeWidth={2}
                        className="size-4 md:size-4.5 lg:size-4.75 2xl:size-5"
                    />
                )}
            </button>
        </div>
    );
}
