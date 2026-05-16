import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';

import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-(--primary)">
                    <UserInfo
                        className="bg-(--primary) text-(--secondary)"
                        user={user}
                        showEmail={true}
                    />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-(--primary)" />
            <DropdownMenuGroup>
                <DropdownMenuItem
                    className="group px-2.5 py-2 text-(--font-color) focus:bg-(--primary) focus:text-white active:bg-(--primary) active:text-white"
                    asChild
                >
                    {/* data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive-foreground! */}
                    <Link
                        className="t-size3 block w-full cursor-pointer font-medium"
                        href={edit().url}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings
                            strokeWidth={2.7}
                            className="size-3.25 text-(--primary) transition-all duration-300 ease-in-out group-focus:text-(--secondary) group-active:text-(--secondary) bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75"
                        />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-(--primary)" />
            <DropdownMenuItem
                asChild
                className="group px-2.5 py-2 text-red-800 focus:bg-red-100 focus:text-red-600 active:bg-red-100 active:text-red-600"
            >
                <Link
                    className="t-size3 block w-full cursor-pointer font-medium"
                    href={logout().url}
                    method={logout().method}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut
                        strokeWidth={2.7}
                        className="size-3.25 text-red-800 transition-all duration-300 ease-in-out group-focus:text-red-600 group-active:text-red-600 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75"
                    />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
