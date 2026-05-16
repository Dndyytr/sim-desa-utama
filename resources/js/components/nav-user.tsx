import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Auth } from '@/types/auth';

export function NavUser() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    if (!auth.user) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            variant="primary"
                            size="lg"
                            className="group cursor-pointer ring-(--secondary) active:ring-2 data-[state=open]:ring-2"
                            data-test="sidebar-menu-button"
                        >
                            <UserInfo
                                className="bg-(--secondary) text-(--primary)"
                                user={auth.user}
                            />
                            <ChevronsUpDown
                                strokeWidth={2.7}
                                className="ml-auto"
                            />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-(--secondary) shadow-[0_5px_8px_1px_rgba(0,0,0,0.3)]"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
