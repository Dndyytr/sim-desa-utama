import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { useInView } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Briefcase,
    CalendarClock,
    CheckCircle2,
    FileText,
    Info,
    KeyRound,
    LayoutGrid,
    Shield,
    ShieldAlert,
    SquareMenu,
    UserCog,
    Users,
    UserX,
    Wrench,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
    AnimatedCounter,
    EntranceContainer,
    EntranceItem,
} from '@/components/animations';
import { index } from '@/routes/dashboards';

echarts.use([
    BarChart,
    PieChart,
    LineChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer,
]);

const ECharts = (ReactEChartsCore as any).default || ReactEChartsCore;

// ─── TYPES ────────────────────────────────────

interface RoleCount {
    role: string;
    count: number;
}

interface DashboardStats {
    total_users: number;
    total_roles: number;
    total_permissions: number;
    total_menus: number;
    total_active_menus: number;
    total_type_services: number;
    total_active_type_services: number;
}

interface ModuleCount {
    module: string;
    count: number;
}

interface ModuleStatusItem {
    name: string;
    status: string;
}

interface SecurityStats {
    roles_without_permission: number;
    menus_without_permission: number;
}

interface DashboardProps {
    stats: DashboardStats;
    usersByRole: RoleCount[];
    onlineUsers: number;
    moduleCounts: ModuleCount[];
    moduleStatus: ModuleStatusItem[];
    securityStats: SecurityStats;
}

// ─── COLORS ───────────────────────────────────

const ROLE_COLORS = ['#0a8f3f', '#f4b400', '#1e88e5', '#6f42c1', '#20b8c5'];

const MODULE_BAR_COLORS: Record<string, string> = {
    'Kelola Pengguna': '#16a34a',
    'Kelola Peran': '#f6b91a',
    'Kelola Hak Akses': '#2f80ed',
    'Kelola Menu': '#6f42c1',
    'Jenis Layanan': '#22b8c7',
    'Template Surat': '#f97316',
};

// ─── DEMO / FALLBACK DATA ─────────────────────

const DEMO_ROLES: RoleCount[] = [
    { role: 'Admin Sistem', count: 10 },
    { role: 'Operator Desa', count: 6 },
    { role: 'Staff', count: 4 },
    { role: 'Sekretaris Desa', count: 2 },
    { role: 'Kepala Desa', count: 2 },
];

const DEMO_MODULES: ModuleCount[] = [
    { module: 'Kelola Pengguna', count: 85 },
    { module: 'Kelola Peran', count: 62 },
    { module: 'Kelola Hak Akses', count: 58 },
    { module: 'Kelola Menu', count: 43 },
    { module: 'Jenis Layanan', count: 37 },
    { module: 'Template Surat', count: 28 },
];

const DEMO_STATUSES: ModuleStatusItem[] = [
    { name: 'Kelola Pengguna', status: 'Aktif' },
    { name: 'Kelola Peran', status: 'Aktif' },
    { name: 'Kelola Hak Akses', status: 'Aktif' },
    { name: 'Kelola Menu', status: 'Aktif' },
    { name: 'Jenis Layanan', status: 'Aktif' },
    { name: 'Template Surat', status: 'Perlu Cek' },
];

const SECURITY_DATES = [
    '15 Mei',
    '16 Mei',
    '17 Mei',
    '18 Mei',
    '19 Mei',
    '20 Mei',
    '21 Mei',
];
const LOGIN_SUCCESS = [45, 48, 52, 50, 60, 55, 63];
const LOGIN_FAILED = [2, 1, 3, 2, 2, 4, 3];

const SECURITY_COUNTERS = [
    {
        label: 'Akun Nonaktif',
        value: 2,
        delta: '1 dari bulan lalu',
        deltaUp: true,
        deltaColor: '#16a34a',
        icon: UserX,
        iconBg: 'bg-green-50',
        iconColor: '#16a34a',
    },
    {
        label: 'Role Tanpa Permission',
        delta: '0 perubahan',
        deltaUp: null,
        deltaColor: '#6b7280',
        icon: Shield,
        iconBg: 'bg-amber-50',
        iconColor: '#f6b91a',
    },
    {
        label: 'Menu Tanpa Permission',
        delta: '1 dari bulan lalu',
        deltaUp: false,
        deltaColor: '#ef233c',
        icon: ShieldAlert,
        iconBg: 'bg-red-50',
        iconColor: '#ef233c',
    },
];

const WELCOME_METRICS = [
    {
        label: 'Login Hari Ini',
        value: 36,
        delta: '12%',
        deltaUp: true,
        deltaColor: '#16a34a',
        sparkData: [28, 30, 32, 34, 35, 36, 36],
    },
    {
        label: 'Aksi Sistem Hari Ini',
        value: 78,
        delta: '15%',
        deltaUp: true,
        deltaColor: '#16a34a',
        sparkData: [55, 60, 65, 70, 72, 75, 78],
    },
    {
        label: 'Login Gagal Hari Ini',
        value: 3,
        delta: '25%',
        deltaUp: false,
        deltaColor: '#ef233c',
        sparkData: [7, 6, 5, 5, 4, 3, 3],
    },
    {
        label: 'Pengguna Online',
        value: 8,
        delta: '',
        deltaUp: true,
        deltaColor: '#16a34a',
        sparkData: [3, 4, 5, 6, 7, 8, 8],
    },
];

interface QuickActionItem {
    icon: any;
    label: string;
    href: string;
    color: string;
}

const QUICK_ACTIONS: QuickActionItem[] = [
    {
        icon: Users,
        label: 'Tambah Pengguna',
        href: route('users.index'),
        color: '#16a34a',
    },
    {
        icon: Shield,
        label: 'Tambah Role',
        href: route('roles.index'),
        color: '#f6b91a',
    },
    {
        icon: KeyRound,
        label: 'Atur Hak Akses',
        href: route('permissions.index'),
        color: '#2f80ed',
    },
    {
        icon: SquareMenu,
        label: 'Tambah Menu',
        href: route('menus.index'),
        color: '#16a34a',
    },
    {
        icon: Briefcase,
        label: 'Tambah Layanan',
        href: route('type-services.index'),
        color: '#6f42c1',
    },
    { icon: FileText, label: 'Tambah Template', href: '#', color: '#f97316' },
];

const STRUCTURE_STEPS = [
    { icon: Users, label: 'Pengguna', description: 'Kelola akun sistem' },
    { icon: Shield, label: 'Peran', description: 'Definisi role pengguna' },
    {
        icon: KeyRound,
        label: 'Hak Akses',
        description: 'Pengaturan permission',
    },
    { icon: SquareMenu, label: 'Menu', description: 'Struktur navigasi' },
    {
        icon: LayoutGrid,
        label: 'Modul Layanan',
        description: 'Layanan & dokumen',
    },
];

const LATEST_ACTIVITIES = [
    {
        waktu: '09:15',
        pengguna: 'Admin',
        aktivitas: 'Menambahkan pengguna baru',
        modul: 'Kelola Pengguna',
        status: 'Berhasil',
    },
    {
        waktu: '09:40',
        pengguna: 'Admin',
        aktivitas: 'Mengubah hak akses Sekdes',
        modul: 'Kelola Hak Akses',
        status: 'Berhasil',
    },
    {
        waktu: '10:05',
        pengguna: 'Admin',
        aktivitas: 'Menonaktifkan menu lama',
        modul: 'Kelola Menu',
        status: 'Berhasil',
    },
    {
        waktu: '10:30',
        pengguna: 'Admin',
        aktivitas: 'Menambahkan jenis layanan',
        modul: 'Jenis Layanan',
        status: 'Berhasil',
    },
];

const SUMMARY_CARDS = [
    {
        icon: Users,
        label: 'Total Pengguna',
        unit: 'Orang',
        deltaText: '3 dari bulan lalu',
        deltaTone: 'success' as const,
        iconBg: '#0a8f3f12',
        iconColor: '#0a8f3f',
        key: 'total_users' as const,
    },
    {
        icon: UserCog,
        label: 'Role Aktif',
        unit: 'Role',
        deltaText: '0 perubahan',
        deltaTone: 'neutral' as const,
        iconBg: '#1c535212',
        iconColor: '#1c5352',
        key: 'total_roles' as const,
    },
    {
        icon: KeyRound,
        label: 'Hak Akses',
        unit: 'Hak Akses',
        deltaText: '2 dari bulan lalu',
        deltaTone: 'success' as const,
        iconBg: '#f4b40018',
        iconColor: '#f4b400',
        key: 'total_permissions' as const,
    },
    {
        icon: SquareMenu,
        label: 'Menu Aktif',
        unit: 'Menu',
        deltaText: '0 perubahan',
        deltaTone: 'neutral' as const,
        iconBg: '#2f80ed12',
        iconColor: '#2f80ed',
        key: 'total_active_menus' as const,
    },
    {
        icon: Wrench,
        label: 'Jenis Layanan',
        unit: 'Layanan',
        deltaText: '1 dari bulan lalu',
        deltaTone: 'success' as const,
        iconBg: '#22b8c712',
        iconColor: '#22b8c7',
        key: 'total_type_services' as const,
    },
    {
        icon: FileText,
        label: 'Template Surat',
        unit: 'Template',
        deltaText: '0 perubahan',
        deltaTone: 'neutral' as const,
        iconBg: '#f9731612',
        iconColor: '#f97316',
        value: 10,
    },
];

// ─── HELPERS ──────────────────────────────────

const sumRoleCount = (data: RoleCount[]) =>
    data.reduce((a, r) => a + r.count, 0);

function useViewportOnce<T extends Element>() {
    const ref = useRef<T>(null);

    return [
        ref,
        useInView(ref, { once: true, margin: '0px', amount: 0.35 }),
    ] as const;
}

// ─── COMPONENTS ───────────────────────────────

function Sparkline({
    data,
    color,
    label,
}: {
    data: number[];
    color: string;
    label: string;
}) {
    const [ref, hasEntered] = useViewportOnce<HTMLDivElement>();
    const points = useMemo(() => data.map((_, i) => `${i + 1}`), [data]);

    const option = useMemo(
        (): echarts.EChartsCoreOption => ({
            tooltip: {
                trigger: 'axis',
                confine: true,
                backgroundColor: '#1e1e1e',
                borderColor: '#1e1e1e',
                borderWidth: 0,
                padding: [5, 7],
                textStyle: { color: '#ffffff', fontSize: 10 },
                formatter: (params: any[]) => {
                    const point = params[0];

                    return `${label}<br/>${point.value}`;
                },
                axisPointer: {
                    type: 'line',
                    lineStyle: { color: `${color}80`, width: 1 },
                },
            },
            grid: { left: 0, right: 0, top: 1, bottom: 0 },
            xAxis: {
                show: false,
                type: 'category',
                data: points,
                boundaryGap: false,
            },
            yAxis: { show: false, min: 'dataMin', max: 'dataMax' },
            series: [
                {
                    type: 'line',
                    data,
                    smooth: true,
                    showSymbol: true,
                    symbol: 'circle',
                    symbolSize: 3,
                    lineStyle: { width: 1.5, color },
                    itemStyle: { color },
                    emphasis: {
                        scale: true,
                        lineStyle: { width: 2, color },
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: `${color}44` },
                            { offset: 1, color: `${color}00` },
                        ]),
                    },
                    animation: hasEntered,
                    animationDuration: 800,
                    animationEasing: 'cubicOut',
                },
            ],
        }),
        [color, data, hasEntered, label, points],
    );

    return (
        <div ref={ref} style={{ width: 56, height: 22 }}>
            {hasEntered && (
                <ECharts
                    echarts={echarts}
                    option={option}
                    style={{ width: '100%', height: '100%' }}
                    notMerge
                    lazyUpdate
                />
            )}
        </div>
    );
}

function Card({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-white shadow-sm ${className}`}
        >
            {children}
        </div>
    );
}

function SectionHeader({
    title,
    showInfo = false,
}: {
    title: string;
    showInfo?: boolean;
}) {
    return (
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3 md:px-5">
            <h3 className="text-sm font-semibold text-[#062f1d]">{title}</h3>
            {showInfo && (
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb]">
                    <Info className="size-2.5 text-gray-400" />
                </div>
            )}
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    unit,
    iconBg,
    iconColor,
    deltaText,
    deltaTone,
}: {
    icon: any;
    label: string;
    value: number | string;
    unit: string;
    iconBg: string;
    iconColor: string;
    deltaText: string;
    deltaTone: 'success' | 'neutral' | 'danger';
}) {
    const deltaColor =
        deltaTone === 'success'
            ? 'text-emerald-600'
            : deltaTone === 'danger'
              ? 'text-red-500'
              : 'text-gray-400';

    return (
        <Card>
            <div className="flex items-center gap-3 p-3.5 md:p-4">
                <div
                    className="flex size-13 shrink-0 items-center justify-center rounded-[10px]"
                    style={{ backgroundColor: iconBg, color: iconColor }}
                >
                    <Icon className="size-5.5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] leading-tight text-gray-500">
                        {label}
                    </p>
                    <div className="mt-0.5 flex items-baseline gap-1">
                        <AnimatedCounter
                            to={Number(value)}
                            className="text-xl font-bold text-[#062f1d]"
                        />
                        <span className="text-[11px] text-gray-400">
                            {unit}
                        </span>
                    </div>
                    <p
                        className={`mt-0.5 text-[10px] font-medium ${deltaColor}`}
                    >
                        {deltaText}
                    </p>
                </div>
            </div>
        </Card>
    );
}

function QuickAction({
    icon: Icon,
    label,
    href,
    color,
}: {
    icon: any;
    label: string;
    href: string;
    color: string;
}) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-gray-50/60 p-3"
        >
            <div
                className="flex size-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}15`, color }}
            >
                <Icon className="size-4.5" />
            </div>
            <span className="text-[10px] leading-tight font-medium text-gray-600">
                {label}
            </span>
        </Link>
    );
}

function StructureStep({
    icon: Icon,
    label,
    description,
    index,
    total,
}: {
    icon: any;
    label: string;
    description: string;
    index: number;
    total: number;
}) {
    return (
        <div className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
                {index > 0 ? (
                    <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                ) : (
                    <div className="flex-1" />
                )}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0a8f3f]">
                    <Icon className="size-5 text-white" />
                </div>
                {index < total - 1 ? (
                    <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                ) : (
                    <div className="flex-1" />
                )}
            </div>
            <div className="mt-1.5 text-center">
                <p className="text-[11px] font-semibold text-[#062f1d]">
                    {label}
                </p>
                <p className="text-[10px] leading-tight text-gray-400">
                    {description}
                </p>
            </div>
        </div>
    );
}

// ─── MAIN PAGE ─────────────────────────────────

export default function AdminDashboard({
    stats,
    usersByRole,
    onlineUsers,
    moduleCounts,
    moduleStatus,
    securityStats,
}: DashboardProps) {
    const { auth } = usePage<{ auth: { user: { name: string } } }>().props;
    const [currentTime, setCurrentTime] = useState(new Date());
    const [donutChartRef, donutChartEntered] =
        useViewportOnce<HTMLDivElement>();
    const [barChartRef, barChartEntered] = useViewportOnce<HTMLDivElement>();
    const [lineChartRef, lineChartEntered] = useViewportOnce<HTMLDivElement>();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60_000);

        return () => clearInterval(timer);
    }, []);

    const greeting =
        currentTime.getHours() < 12
            ? 'Selamat Pagi'
            : currentTime.getHours() < 15
              ? 'Selamat Siang'
              : currentTime.getHours() < 18
                ? 'Selamat Sore'
                : 'Selamat Malam';

    // ── Merge real backend data with demo fallbacks ──

    const roleDist = usersByRole.length > 0 ? usersByRole : DEMO_ROLES;
    const totalRoleCount = sumRoleCount(roleDist);

    const modActs = useMemo(
        () =>
            moduleCounts.length >= 6
                ? moduleCounts
                : [...moduleCounts, ...DEMO_MODULES.slice(moduleCounts.length)],
        [moduleCounts],
    );

    const modStatuses = useMemo(
        () =>
            moduleStatus.length >= 6
                ? moduleStatus
                : [
                      ...moduleStatus,
                      ...DEMO_STATUSES.slice(moduleStatus.length),
                  ],
        [moduleStatus],
    );

    const welcomeMetrics = WELCOME_METRICS.map((m) =>
        m.label === 'Pengguna Online' ? { ...m, value: onlineUsers } : m,
    );

    const securityCounters = SECURITY_COUNTERS.map((c) => {
        if (c.label === 'Role Tanpa Permission') {
            return { ...c, value: securityStats.roles_without_permission };
        }

        if (c.label === 'Menu Tanpa Permission') {
            return { ...c, value: securityStats.menus_without_permission };
        }

        return c;
    });

    // ── ECharts option: Donut (Row 3 left) ──

    const pieOption: echarts.EChartsCoreOption = useMemo(
        () => ({
            stateAnimation: {
                duration: 300,
                easing: 'cubicOut',
            },
            animation: 'auto' as any,
            animationDuration: 1000,
            animationDurationUpdate: 500,
            animationEasing: 'cubicInOut',
            animationEasingUpdate: 'cubicInOut',
            animationThreshold: 2000,
            progressiveThreshold: 3000,
            progressive: 400,
            hoverLayerThreshold: 3000,
            useUTC: false,
            tooltip: {
                trigger: 'item',
                backgroundColor: '#1e1e1e',
                borderColor: '#1e1e1e',
                borderWidth: 0,
                padding: [10, 14],
                textStyle: { color: '#ffffff', fontSize: 12 },
                formatter: (p: any) =>
                    `<strong>${p.name}</strong><br/>${p.value} pengguna (${p.percent}%)`,
            },
            legend: {
                orient: 'vertical' as const,
                right: '2%',
                top: 'center',
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 12,
                textStyle: { color: '#374151', fontSize: 11 },
                formatter: (name: string) => {
                    const item = roleDist.find((r) => r.role === name);
                    const c = item?.count ?? 0;
                    const pct =
                        totalRoleCount > 0
                            ? ((c / totalRoleCount) * 100).toFixed(1)
                            : '0';

                    return `${name}  ${c} (${pct}%)`;
                },
            },
            series: [
                {
                    type: 'pie',
                    radius: ['42%', '68%'],
                    center: ['32%', '50%'],
                    startAngle: 90,
                    clockwise: true,
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 4,
                        borderColor: '#fff',
                        borderWidth: 2,
                    },
                    label: {
                        show: false,
                    },
                    emphasis: {
                        label: { show: true },
                        scaleSize: 6,
                    },
                    labelLine: { show: false },
                    data: roleDist.map((r, i) => ({
                        value: r.count,
                        name: r.role,
                        itemStyle: {
                            color: ROLE_COLORS[i % ROLE_COLORS.length],
                        },
                    })),
                },
            ],
        }),
        [roleDist, totalRoleCount],
    );

    // ── ECharts option: Bar (Row 3 right) ──

    const barOption: echarts.EChartsCoreOption = useMemo(
        () => ({
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1e1e1e',
                borderColor: '#1e1e1e',
                borderWidth: 0,
                padding: [10, 14],
                textStyle: { color: '#ffffff', fontSize: 12 },
                axisPointer: { type: 'shadow' },
                formatter: (params: any[]) => {
                    const p = params[0];

                    return `<strong>${p.name}</strong><br/>${p.value} aktivitas`;
                },
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '10%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: modActs.map((m) => m.module),
                axisLabel: {
                    color: '#6b7280',
                    fontSize: 10,
                    interval: 0,
                    width: 60,
                    overflow: 'break' as const,
                    lineHeight: 14,
                },
                axisLine: { lineStyle: { color: '#e5e7eb' } },
                axisTick: { show: false },
            },
            yAxis: {
                type: 'value',
                max: 100,
                minInterval: 1,
                axisLabel: { color: '#6b7280', fontSize: 10 },
                axisLine: { show: false },
                splitLine: {
                    lineStyle: { color: '#f3f4f6', type: 'dashed' as const },
                },
            },
            series: [
                {
                    type: 'bar',
                    data: modActs.map((m) => ({
                        value: m.count,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(
                                0,
                                0,
                                0,
                                1,
                                [
                                    {
                                        offset: 0,
                                        color:
                                            MODULE_BAR_COLORS[m.module] ||
                                            '#16a34a',
                                    },
                                    {
                                        offset: 1,
                                        color: `${
                                            MODULE_BAR_COLORS[m.module] ||
                                            '#16a34a'
                                        }66`,
                                    },
                                ],
                            ),
                            borderRadius: [6, 6, 0, 0],
                        },
                    })),
                    barMaxWidth: 36,
                    animation: barChartEntered,
                    label: {
                        show: true,
                        position: 'top',
                        color: '#062f1d',
                        fontSize: 11,
                        fontWeight: 'bold' as const,
                    },
                    animationDuration: 1200,
                    animationEasing: 'cubicOut',
                },
            ],
        }),
        [barChartEntered, modActs],
    );

    // ── ECharts option: Line (Row 4 left) ──

    const lineOption: echarts.EChartsCoreOption = useMemo(
        () => ({
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1e1e1e',
                borderColor: '#1e1e1e',
                borderWidth: 0,
                padding: [10, 14],
                textStyle: { color: '#ffffff', fontSize: 11 },
            },
            legend: {
                data: ['Login Berhasil', 'Login Gagal'],
                orient: 'horizontal' as const,
                top: 0,
                left: 'center',
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 16,
                textStyle: { color: '#374151', fontSize: 10 },
            },
            grid: {
                left: '1%',
                right: '1%',
                bottom: '2%',
                top: '18%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: SECURITY_DATES,
                axisLabel: { color: '#9ca3af', fontSize: 9 },
                axisLine: { show: false },
                axisTick: { show: false },
            },
            yAxis: {
                type: 'value',
                axisLabel: { color: '#9ca3af', fontSize: 9 },
                axisLine: { show: false },
                splitLine: {
                    lineStyle: { color: '#f3f4f6', type: 'dashed' as const },
                },
            },
            series: [
                {
                    name: 'Login Berhasil',
                    type: 'line',
                    data: LOGIN_SUCCESS,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 5,
                    lineStyle: { width: 2, color: '#16a34a' },
                    itemStyle: { color: '#16a34a' },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#16a34a33' },
                            { offset: 1, color: '#16a34a00' },
                        ]),
                    },
                    label: {
                        show: true,
                        position: 'top',
                        color: '#374151',
                        fontSize: 9,
                        fontWeight: 'bold' as const,
                    },
                    animation: lineChartEntered,
                    animationDuration: 1000,
                    animationEasing: 'cubicOut',
                },
                {
                    name: 'Login Gagal',
                    type: 'line',
                    data: LOGIN_FAILED,
                    smooth: true,
                    symbol: 'diamond',
                    symbolSize: 6,
                    lineStyle: { width: 1.5, color: '#ef233c' },
                    itemStyle: { color: '#ef233c' },
                    label: {
                        show: true,
                        position: 'top',
                        color: '#ef233c',
                        fontSize: 9,
                        fontWeight: 'bold' as const,
                    },
                    animation: lineChartEntered,
                    animationDuration: 1000,
                    animationEasing: 'cubicOut',
                },
            ],
        }),
        [lineChartEntered],
    );

    return (
        <>
            <Head title="Dashboard Admin Sistem" />

            <div className="flex flex-col gap-4 px-2 py-3 bp360:px-2.25 bp400:px-2.5 md:gap-5 md:px-3 lg:px-3.5 xl:px-4 2xl:px-4.5">
                {/* ── PAGE HEADER ── */}
                <div>
                    <h1 className="text-[22px] font-bold text-[#062f1d]">
                        Dashboard Admin Sistem
                    </h1>
                    <p className="mt-0.5 text-[12px] text-gray-500">
                        Ringkasan informasi dan monitoring sistem SANDU secara
                        real-time.
                    </p>
                </div>

                {/* ── ROW 1: WELCOME + MONITORING ── */}
                <Card className="hidden md:block">
                    <div className="flex min-h-30 items-stretch">
                        {/* Welcome — ~27% */}
                        <div className="flex w-[27%] shrink-0 flex-col justify-center gap-1.5 px-5 py-4">
                            <h2 className="text-base font-bold text-[#062f1d]">
                                Selamat Datang,{' '}
                                <span className="text-[#0a8f3f]">
                                    {auth.user.name}
                                </span>
                            </h2>
                            <p className="text-[11px] leading-snug text-gray-500">
                                Kelola dan pantau seluruh aktivitas sistem SANDU
                                secara efisien dan aman.
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5">
                                    <span className="relative flex size-2">
                                        <span className="absolute size-full rounded-full bg-emerald-400 opacity-25" />
                                        <span className="relative size-2 rounded-full bg-emerald-500" />
                                    </span>
                                    <span className="text-[10px] font-medium text-emerald-700">
                                        Status Sistem: Aktif
                                    </span>
                                </span>
                                <span className="inline-flex items-center gap-1 text-gray-400">
                                    <CalendarClock className="size-3" />
                                    <span className="text-[10px]">
                                        {currentTime.toLocaleDateString(
                                            'id-ID',
                                            {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            },
                                        )}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* 4 metrics */}
                        <div className="flex flex-1 divide-x divide-[#e5e7eb]">
                            {welcomeMetrics.map((m) => (
                                <div
                                    key={m.label}
                                    className="flex flex-1 flex-col justify-center gap-0.5 px-3 py-3"
                                >
                                    <p className="text-[10px] text-gray-500">
                                        {m.label}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <AnimatedCounter
                                            to={m.value}
                                            className="text-lg font-bold text-[#062f1d]"
                                        />
                                        <Sparkline
                                            data={m.sparkData}
                                            color={m.deltaColor}
                                            label={m.label}
                                        />
                                    </div>
                                    {m.delta && (
                                        <div className="flex items-center gap-0.5">
                                            <Activity
                                                className={`size-2.5 ${m.deltaUp ? 'text-emerald-500' : 'rotate-180 text-red-500'}`}
                                            />
                                            <span
                                                className="text-[10px] font-medium"
                                                style={{
                                                    color: m.deltaColor,
                                                }}
                                            >
                                                {m.delta}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="flex w-43.75 shrink-0 items-center px-4">
                            <Link
                                href={route('users.index')}
                                className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#0a8f3f] px-3 py-2.5 text-[12px] font-semibold text-white"
                            >
                                Lihat Aktivitas Sistem
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </div>
                    </div>
                </Card>

                {/* Row 1 mobile fallback */}
                <div className="grid gap-3 md:hidden">
                    <Card>
                        <div className="p-4">
                            <h2 className="text-sm font-bold text-[#062f1d]">
                                {greeting},{' '}
                                <span className="text-[#0a8f3f]">
                                    {auth.user.name}
                                </span>
                            </h2>
                            <p className="mt-1 text-[11px] text-gray-500">
                                Kelola dan pantau seluruh aktivitas sistem SANDU
                                secara efisien dan aman.
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5">
                                    <span className="relative flex size-2">
                                        <span className="absolute size-full rounded-full bg-emerald-400 opacity-25" />
                                        <span className="relative size-2 rounded-full bg-emerald-500" />
                                    </span>
                                    <span className="text-[10px] font-medium text-emerald-700">
                                        Status: Aktif
                                    </span>
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                                    <CalendarClock className="size-3" />
                                    {currentTime.toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>
                    </Card>
                    <div className="grid grid-cols-2 gap-3">
                        {welcomeMetrics.map((m) => (
                            <Card key={m.label}>
                                <div className="p-3">
                                    <p className="text-[10px] text-gray-500">
                                        {m.label}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <AnimatedCounter
                                            to={m.value}
                                            className="text-base font-bold text-[#062f1d]"
                                        />
                                        <Sparkline
                                            data={m.sparkData}
                                            color={m.deltaColor}
                                            label={m.label}
                                        />
                                    </div>
                                    {m.delta && (
                                        <span
                                            className="ml-1 text-[10px] font-medium"
                                            style={{ color: m.deltaColor }}
                                        >
                                            {m.deltaUp ? '↑' : '↓'} {m.delta}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
                {/* ── ROW 2: SIX SUMMARY CARDS ── */}
                <EntranceContainer
                    stagger={0.04}
                    className="grid grid-cols-2 gap-3 bp400:gap-3.5 md:grid-cols-3 lg:grid-cols-6 lg:gap-4"
                >
                    {SUMMARY_CARDS.map((card) => (
                        <EntranceItem key={card.label}>
                            <StatCard
                                icon={card.icon}
                                label={card.label}
                                value={
                                    'value' in card
                                        ? card.value
                                        : stats[card.key]
                                }
                                unit={card.unit}
                                iconBg={card.iconBg}
                                iconColor={card.iconColor}
                                deltaText={card.deltaText}
                                deltaTone={card.deltaTone}
                            />
                        </EntranceItem>
                    ))}
                </EntranceContainer>
                {/* ── ROW 3: CHARTS ── */}
                <EntranceContainer
                    stagger={0.1}
                    className="grid gap-4 lg:grid-cols-5 lg:gap-5"
                >
                    {/* Donut — 43% */}
                    <EntranceItem className="lg:col-span-2">
                        <Card>
                            <SectionHeader
                                title="Distribusi Role Pengguna"
                                showInfo
                            />
                            <div className="p-2 md:p-3">
                                {roleDist.length > 0 ? (
                                    <div
                                        ref={donutChartRef}
                                        className="relative"
                                        style={{ height: 260 }}
                                    >
                                        {donutChartEntered && (
                                            <>
                                                <ECharts
                                                    echarts={echarts}
                                                    option={pieOption}
                                                    style={{
                                                        width: '100%',
                                                        height: 260,
                                                    }}
                                                    notMerge
                                                    lazyUpdate
                                                />
                                                <div className="pointer-events-none absolute top-1/2 left-[32%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center">
                                                    <span className="text-[10px] leading-tight text-gray-500">
                                                        Total
                                                    </span>
                                                    <AnimatedCounter
                                                        to={totalRoleCount}
                                                        className="text-2xl leading-7 font-bold text-[#062f1d]"
                                                    />
                                                    <span className="text-[11px] leading-tight text-gray-400">
                                                        Pengguna
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex h-65 items-center justify-center text-xs text-gray-400">
                                        Belum ada data distribusi
                                    </div>
                                )}
                            </div>
                        </Card>
                    </EntranceItem>

                    {/* Bar — 57% */}
                    <EntranceItem className="lg:col-span-3">
                        <Card>
                            <SectionHeader
                                title="Aktivitas Sistem per Modul"
                                showInfo
                            />
                            <div className="p-2 md:p-3">
                                {modActs.length > 0 ? (
                                    <div
                                        ref={barChartRef}
                                        style={{ height: 260 }}
                                    >
                                        {barChartEntered && (
                                            <ECharts
                                                echarts={echarts}
                                                option={barOption}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                }}
                                                notMerge
                                                lazyUpdate
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex h-65 items-center justify-center text-xs text-gray-400">
                                        Belum ada data modul
                                    </div>
                                )}
                            </div>
                        </Card>
                    </EntranceItem>
                </EntranceContainer>

                {/* ── ROW 4: SECURITY + MODULE STATUS ── */}
                <EntranceContainer
                    stagger={0.1}
                    className="grid gap-4 lg:grid-cols-5 lg:gap-5"
                >
                    {/* Security — 43% */}
                    <EntranceItem className="lg:col-span-2">
                        <Card>
                            <SectionHeader
                                title="Monitoring Keamanan Akses"
                                showInfo
                            />
                            <div className="flex flex-col gap-4 p-3 md:flex-row md:p-4">
                                <div
                                    ref={lineChartRef}
                                    className="min-h-40 flex-1"
                                >
                                    {lineChartEntered && (
                                        <ECharts
                                            echarts={echarts}
                                            option={lineOption}
                                            style={{
                                                height: 150,
                                                width: '100%',
                                            }}
                                            notMerge
                                            lazyUpdate
                                        />
                                    )}
                                </div>
                                <div className="h-px w-full bg-[#e5e7eb] md:h-full md:w-px" />
                                <div className="flex shrink-0 flex-col justify-center gap-0 md:w-35">
                                    {securityCounters.map((c) => (
                                        <div
                                            key={c.label}
                                            className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0"
                                        >
                                            <div
                                                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${c.iconBg}`}
                                            >
                                                <c.icon
                                                    className="size-4"
                                                    style={{
                                                        color: c.iconColor,
                                                    }}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[9px] text-gray-500">
                                                    {c.label}
                                                </p>
                                                <AnimatedCounter
                                                    to={c.value}
                                                    className="text-sm font-bold text-[#062f1d]"
                                                />
                                                <p
                                                    className="text-[9px]"
                                                    style={{
                                                        color: c.deltaColor,
                                                    }}
                                                >
                                                    {c.delta}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </EntranceItem>

                    {/* Module Status — 57% */}
                    <EntranceItem className="lg:col-span-3">
                        <Card>
                            <SectionHeader
                                title="Status Modul Sistem"
                                showInfo
                            />
                            <div className="grid grid-cols-1 divide-y divide-[#e5e7eb] md:grid-cols-2 md:divide-x md:divide-y-0">
                                {modStatuses.map((mod) => (
                                    <div
                                        key={mod.name}
                                        className="flex items-center justify-between px-4 py-3 md:px-5"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="relative flex size-2">
                                                <span className="absolute size-full rounded-full bg-emerald-400 opacity-25" />
                                                <span className="relative size-2 rounded-full bg-emerald-500" />
                                            </span>
                                            <span className="text-[12px] font-medium text-[#062f1d]">
                                                {mod.name}
                                            </span>
                                        </div>
                                        {mod.status === 'Aktif' ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700">
                                                <CheckCircle2 className="size-3" />
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-700">
                                                <AlertTriangle className="size-3" />
                                                Perlu Cek
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </EntranceItem>
                </EntranceContainer>

                {/* ── ROW 5: QUICK ACTIONS / STRUCTURE / ACTIVITY ── */}
                <EntranceContainer
                    stagger={0.08}
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5"
                >
                    {/* Quick Actions */}
                    <EntranceItem>
                        <Card>
                            <SectionHeader title="Aksi Cepat" />
                            <div className="grid grid-cols-3 gap-2 p-3 md:p-4">
                                {QUICK_ACTIONS.map((qa) => (
                                    <QuickAction
                                        key={qa.label}
                                        icon={qa.icon}
                                        label={qa.label}
                                        href={qa.href}
                                        color={qa.color}
                                    />
                                ))}
                            </div>
                        </Card>
                    </EntranceItem>

                    {/* System Structure */}
                    <EntranceItem>
                        <Card>
                            <SectionHeader title="Struktur Sistem SANDU" />
                            <div className="px-3 py-5 md:px-4">
                                <div className="flex items-start">
                                    {STRUCTURE_STEPS.map((step, i) => (
                                        <StructureStep
                                            key={step.label}
                                            icon={step.icon}
                                            label={step.label}
                                            description={step.description}
                                            index={i}
                                            total={STRUCTURE_STEPS.length}
                                        />
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </EntranceItem>

                    {/* Recent Activity */}
                    <EntranceItem>
                        <Card>
                            <SectionHeader title="Aktivitas Sistem Terbaru" />
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#e5e7eb] bg-gray-50/60">
                                            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 md:px-4">
                                                Waktu
                                            </th>
                                            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 md:px-4">
                                                Pengguna
                                            </th>
                                            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 md:px-4">
                                                Aktivitas
                                            </th>
                                            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 md:px-4">
                                                Modul
                                            </th>
                                            <th className="px-3 py-2 text-center text-[10px] font-medium text-gray-500 md:px-4">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e5e7eb]">
                                        {LATEST_ACTIVITIES.map((act, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2.5 text-[11px] text-gray-500 md:px-4">
                                                    {act.waktu}
                                                </td>
                                                <td className="px-3 py-2.5 text-[11px] font-medium text-[#062f1d] md:px-4">
                                                    {act.pengguna}
                                                </td>
                                                <td className="px-3 py-2.5 text-[11px] text-gray-500 md:px-4">
                                                    {act.aktivitas}
                                                </td>
                                                <td className="px-3 py-2.5 text-[11px] text-gray-500 md:px-4">
                                                    {act.modul}
                                                </td>
                                                <td className="px-3 py-2.5 text-center md:px-4">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                                        <CheckCircle2 className="size-3" />
                                                        {act.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </EntranceItem>
                </EntranceContainer>

                {/* ── FOOTER ── */}
                <div className="mt-2 flex items-center justify-center border-t border-[#e5e7eb] pt-3 pb-1 text-[10px] text-gray-400">
                    <span>
                        © {currentTime.getFullYear()} SANDU – Sistem Andalan
                        Desa Utama. All rights reserved.
                    </span>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: index(),
        },
    ],
};
