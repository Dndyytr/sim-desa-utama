import type { route as routeFn } from 'ziggy-js';

import type { Auth } from '@/types/auth';
import type { NavItem } from '@/types/navigation';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            can: string[];
            hasRole: string[];
            flash: {
                success: string | null;
                error: string | null;
                warning: string | null;
            };
            nav: NavItem[];
            [key: string]: unknown;
        };
    }
}

declare global {
    const route: typeof routeFn;
}
