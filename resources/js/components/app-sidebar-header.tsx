import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex items-center gap-2 px-2 py-2 transition-all duration-300 ease-in-out bp360:px-2.25 bp400:px-2.5 md:px-3 md:py-2.25 lg:px-3.5 lg:py-2.5 xl:px-4 xl:py-3 2xl:px-4.5 2xl:py-3.5">
            <div className="flex items-center gap-2 bp360:gap-2.5 bp400:gap-3 md:gap-3.5">
                <SidebarTrigger tooltip="Toggle Sidebar" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
                <span className="t-size1 rounded-md bg-(--primary)/10 px-2.5 py-1.5 font-semibold text-(--primary) md:rounded-lg md:px-2.75 md:py-1.75 xl:rounded-[8px] xl:px-3 xl:py-2">
                    Admin Panel
                </span>
            </div>
        </header>
    );
}
