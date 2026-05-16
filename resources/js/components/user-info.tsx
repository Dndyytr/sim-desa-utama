import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

export function UserInfo({
    user,
    className,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
    className?: string;
}) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="size-6 overflow-hidden rounded-full bp360:size-6.25 bp400:size-6.5 md:size-6.75 lg:size-7.75 xl:size-8 2xl:size-8.25">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback
                    className={cn('t-size4 rounded-lg font-bold', className)}
                >
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="t-size3 grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                {showEmail && (
                    <span className="t-size2 truncate font-medium text-(--font-color)/70">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
