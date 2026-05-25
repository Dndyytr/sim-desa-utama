import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useState } from 'react';

import { Input } from './ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from './ui/select';

const isLucideIcon = (value: unknown): value is LucideIcon =>
    (typeof value === 'function' || typeof value === 'object') &&
    value !== null &&
    'displayName' in value;

const ICONS = Object.entries(LucideIcons)
    .filter(
        ([name, icon]) =>
            /^[A-Z][A-Za-z0-9]+$/.test(name) &&
            !name.endsWith('Icon') &&
            isLucideIcon(icon),
    )
    .map(([name, icon]) => ({
        name,
        Icon: icon as LucideIcon,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

interface IconSelectProps {
    value?: string;
    onChange: (value: string) => void;
}

export function IconSelect({ value, onChange }: IconSelectProps) {
    const [search, setSearch] = useState('');

    const MAX_VISIBLE_ICONS = 40;
    const selectedIcon = ICONS.find(({ name }) => name === value);

    const filteredIcons = ICONS.filter(({ name }) =>
        name.toLowerCase().includes(search.toLowerCase()),
    ).slice(0, MAX_VISIBLE_ICONS);
    const visibleIcons =
        selectedIcon &&
        !filteredIcons.some(({ name }) => name === selectedIcon.name)
            ? [selectedIcon, ...filteredIcons]
            : filteredIcons;

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="t-size3 w-full max-w-full border border-(--primary)/20 bg-(--tertiary)/5 ring-0 outline-none selection:bg-(--tertiary)/10 selection:text-(--font-color) autofill:bg-(--tertiary)/10 hover:border-(--primary)/40 hover:bg-(--tertiary)/10 hover:ring-[3px] hover:ring-(--tertiary)/30 active:border-(--primary)/40 active:bg-(--tertiary)/10 active:ring-[3px] active:ring-(--tertiary)/30 data-[state=open]:border-(--primary)/40 data-[state=open]:bg-(--tertiary)/10 data-[state=open]:ring-[3px] data-[state=open]:ring-(--tertiary)/30 [&>span]:flex [&>span]:items-center [&>span]:gap-2">
                {selectedIcon ? (
                    <span className="flex items-center gap-2">
                        <selectedIcon.Icon className="size-3.25 text-current bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                        <span>{selectedIcon.name}</span>
                    </span>
                ) : (
                    <SelectValue placeholder="Pilih Ikon" />
                )}
            </SelectTrigger>
            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari ikon..."
                    className="mb-2 bg-primary text-white placeholder:text-white/60 focus-visible:bg-primary"
                />
                <SelectSeparator className="bg-(--primary)/60" />
                <SelectGroup>
                    {visibleIcons.map(({ name, Icon }) => (
                        <SelectItem key={name} value={name}>
                            <Icon className="size-3.25 text-current bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                            <span>{name}</span>
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
