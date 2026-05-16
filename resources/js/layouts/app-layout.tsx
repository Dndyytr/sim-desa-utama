// import FlashToast from '@/components/flash-toast';
import Alert from '@/components/alert';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
// import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {/* <FlashToast /> */}
            <Alert />
            {children}
        </AppLayoutTemplate>
    );
}
