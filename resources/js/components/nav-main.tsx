import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from './ui/collapsible';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { url } = usePage();

    return (
        <SidebarGroup className="px-0 py-0 lg:px-2">
            <SidebarMenu>
                {items.map((item) => {
                    const Icon = item.icon;
                    const hasChildren =
                        item.children && item.children.length > 0;

                    return (
                        <SidebarMenuItem key={item.title}>
                            {hasChildren ? (
                                <Collapsible
                                    defaultOpen={item.children?.some((child) =>
                                        url.startsWith(child.href as string),
                                    )}
                                    className="group/collapsible"
                                >
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            // variant="parent"
                                            tooltip={{ children: item.title }}
                                        >
                                            {Icon && <Icon strokeWidth={2.7} />}
                                            <span className="truncate">
                                                {item.title}
                                            </span>
                                            <ChevronDown
                                                strokeWidth={2.7}
                                                className="ml-auto transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-180"
                                            />
                                            {/* <Minus className="ml-auto group-data-[collapsible=icon]:hidden group-data-[state=closed]/collapsible:hidden" /> */}
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.children?.map(
                                                (child, index) => (
                                                    <SidebarMenuSubItem
                                                        key={`${item.title}-${child.title}`}
                                                        style={{
                                                            animationDelay: `${(index + 1) * 70}ms`,
                                                        }}
                                                        className="opacity-0 group-data-[state=open]/collapsible:animate-fade-in-sub"
                                                    >
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={url.startsWith(
                                                                child.href as string,
                                                            )}
                                                            tooltip={{
                                                                children:
                                                                    child.title,
                                                            }}
                                                        >
                                                            <Link
                                                                href={
                                                                    child.href
                                                                }
                                                                prefetch
                                                            >
                                                                {child.icon && (
                                                                    <child.icon
                                                                        strokeWidth={
                                                                            2.7
                                                                        }
                                                                    />
                                                                )}
                                                                <span>
                                                                    {
                                                                        child.title
                                                                    }
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuSubItem>
                                                ),
                                            )}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>
                            ) : (
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={toUrl(item.href)} prefetch>
                                        {Icon && <Icon strokeWidth={2.7} />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
