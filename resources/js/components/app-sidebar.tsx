// import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpenText,
    Globe,
    Home,
    ScrollText,
    SquareMenu,
    University,
    UserCog,
    UserKey,
    Users,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    useSidebar,
    // SidebarMenu,
    // SidebarMenuButton,
    // SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as permissions } from '@/routes/permissions';
import { index as users } from '@/routes/users';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: Home,
    },
    {
        title: 'Kelola Pengguna',
        href: users().url,
        icon: Users,
    },
    {
        title: 'Kelola Hak Akses',
        href: permissions().url,
        icon: UserKey,
    },
    {
        title: 'Kelola Peran',
        href: '#',
        icon: UserCog,
    },
    {
        title: 'Kelola Menu',
        href: '#',
        icon: SquareMenu,
    },
    {
        title: 'Kelola Informasi',
        href: '#',
        icon: University,
        children: [
            {
                title: 'Kelola Pengumuman',
                href: '#',
            },
            {
                title: 'Kelola Berita',
                href: '#',
            },
            {
                title: 'Kelola Info Desa',
                href: '#',
            },
        ],
    },
    {
        title: 'Laporan',
        href: '#',
        icon: ScrollText,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Profil Desa',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Globe,
    },
    {
        title: 'Panduan',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpenText,
    },
];

export function AppSidebar() {
    const { setOpenMobile, isMobile } = useSidebar();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <div className="flex w-full items-center justify-between">
                <SidebarHeader>
                    {/* <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href={dashboard()} prefetch>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu> */}
                    <div className="flex w-max items-center gap-1">
                        <AppLogo />
                    </div>
                </SidebarHeader>
                {isMobile && (
                    <button
                        onClick={() => setOpenMobile(false)}
                        className="cursor-pointer rounded-full bg-(--secondary) p-1.5 text-(--primary) transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-yellow-200 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none lg:hidden"
                    >
                        <ArrowLeft
                            strokeWidth={2.5}
                            className="size-5 bp360:size-5.25 bp400:size-5.5 md:size-5.75"
                        />
                    </button>
                )}
            </div>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
