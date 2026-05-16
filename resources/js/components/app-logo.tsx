import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            {/* <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground">
            </div> */}
            <AppLogoIcon className="-ml-1.5 size-7 bp360:size-8 bp400:size-9 md:size-10 lg:size-11 xl:-ml-2.25 xl:size-12 2xl:size-13" />
            <span className="t-size6 truncate font-ubuntu leading-tight font-bold text-(--fourth)">
                SAN<span className="text-amber-200">DU</span>
            </span>
            {/* <div className="ml-1 grid flex-1 text-left text-sm">
            </div> */}
        </>
    );
}
