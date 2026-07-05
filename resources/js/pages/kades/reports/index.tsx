import { Head, Link, router } from '@inertiajs/react';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import {
    BarChart3,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Entries } from '@/components/ui/entries';
import { InertiaPagination } from '@/components/ui/inertia-pagination';
import { SearchBar } from '@/components/ui/search-bar';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index as reportsIndexRoute } from '@/routes/kades/reports';

echarts.use([
    BarChart,
    LineChart,
    PieChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    CanvasRenderer,
]);

const ECharts = (ReactEChartsCore as any).default || ReactEChartsCore;

interface ReportRow {
    submission_id: number;
    submission_number: string;
    subject: string;
    submission_status: string;
    submission_created_at: string;
    type_service_id: number;
    resident_name: string;
    resident_nik: string;
    service_name: string;
    service_id: number | null;
    service_number: string | null;
    service_status: string | null;
    assigned_to: number | null;
    officer_name: string | null;
}

interface Metrics {
    total_submissions: number;
    total_finished: number;
    total_rejected: number;
    total_processing: number;
    completion_rate: number;
}

interface StatsPerType {
    name: string;
    count: number;
}

interface StatsPerMonth {
    year: number;
    month: number;
    count: number;
}

interface Filters {
    period: string;
    start_date: string | null;
    end_date: string | null;
    type_service_id: string | null;
    status: string;
    assigned_to: string | null;
    search: string | null;
    entries: number;
}

const monthNames = [
    '',
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

function getDisplayStatus(row: ReportRow): {
    label: string;
    className: string;
} {
    if (row.service_status === 'finished') {
        return {
            label: 'Selesai',
            className: 'bg-green-100 text-green-700',
        };
    }

    if (
        row.service_status === 'rejected' ||
        row.submission_status === 'rejected'
    ) {
        return { label: 'Ditolak', className: 'bg-red-100 text-red-600' };
    }

    if (
        row.service_status === 'completed' ||
        row.service_status === 'approved'
    ) {
        return {
            label: 'Disetujui',
            className: 'bg-teal-100 text-teal-700',
        };
    }

    if (row.service_status === 'processing') {
        return {
            label: 'Dalam Proses',
            className: 'bg-orange-100 text-orange-700',
        };
    }

    if (row.submission_status === 'needs_correction') {
        return {
            label: 'Perlu Perbaikan',
            className: 'bg-yellow-100 text-yellow-700',
        };
    }

    if (row.submission_status === 'pending') {
        return {
            label: 'Menunggu Verifikasi',
            className: 'bg-blue-100 text-blue-700',
        };
    }

    if (row.submission_status === 'verified') {
        return {
            label: 'Terverifikasi',
            className: 'bg-purple-100 text-purple-700',
        };
    }

    return {
        label: row.submission_status || '-',
        className: 'bg-stone-100 text-stone-600',
    };
}

export default function ReportsIndex({
    reports,
    metrics,
    stats,
    typeServices,
    officers,
    filters,
    i,
}: {
    reports: {
        data: ReportRow[];
        from: number;
        to: number;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        links: any[];
        first_page_url: string | null;
        last_page_url: string | null;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    metrics: Metrics;
    stats: {
        per_type: StatsPerType[];
        per_month: StatsPerMonth[];
    };
    typeServices: { id: number; service_name: string }[];
    officers: { id: number; name: string }[];
    filters: Filters;
    i: number;
}) {
    const shouldShowPagination = reports.last_page > 1;

    const handleQueryChange = (
        query: Record<string, string | number | null | undefined>,
    ) => {
        const params: Record<string, string | number | null | undefined> = {
            search: filters.search || undefined,
            entries: filters.entries,
            period: filters.period || undefined,
            start_date: filters.start_date || undefined,
            end_date: filters.end_date || undefined,
            type_service_id: filters.type_service_id || undefined,
            status: filters.status || undefined,
            assigned_to: filters.assigned_to || undefined,
            ...query,
        };

        Object.keys(params).forEach((key) => {
            if (
                params[key] === undefined ||
                params[key] === null ||
                params[key] === 'all'
            ) {
                delete params[key];
            }
        });

        router.get(reportsIndexRoute().url, params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        handleQueryChange({
            [key]: value === 'all' ? undefined : value,
        });
    };

    const statusChartData = useMemo(() => {
        const other = Math.max(
            metrics.total_submissions -
                metrics.total_finished -
                metrics.total_rejected -
                metrics.total_processing,
            0,
        );

        return [
            {
                name: 'Selesai',
                value: metrics.total_finished,
                itemStyle: { color: '#16a34a' },
            },
            {
                name: 'Dalam Proses',
                value: metrics.total_processing,
                itemStyle: { color: '#f59e0b' },
            },
            {
                name: 'Ditolak',
                value: metrics.total_rejected,
                itemStyle: { color: '#ef4444' },
            },
            {
                name: 'Lainnya',
                value: other,
                itemStyle: { color: '#3b82f6' },
            },
        ].filter((item) => item.value > 0);
    }, [metrics]);

    const statusChartOption: echarts.EChartsCoreOption = useMemo(
        () => ({
            tooltip: {
                trigger: 'item',
                backgroundColor: '#1f2937',
                borderWidth: 0,
                padding: [8, 12],
                textStyle: { color: '#ffffff', fontSize: 11 },
                formatter: (item: any) =>
                    `<strong>${item.name}</strong><br/>${item.value} layanan (${item.percent}%)`,
            },
            legend: {
                bottom: 0,
                left: 'center',
                itemWidth: 9,
                itemHeight: 9,
                itemGap: 12,
                textStyle: { color: '#57534e', fontSize: 10 },
            },
            series: [
                {
                    type: 'pie',
                    radius: ['54%', '76%'],
                    center: ['50%', '44%'],
                    startAngle: 90,
                    avoidLabelOverlap: true,
                    label: { show: false },
                    labelLine: { show: false },
                    itemStyle: {
                        borderColor: '#ffffff',
                        borderWidth: 3,
                        borderRadius: 4,
                    },
                    emphasis: {
                        scaleSize: 5,
                    },
                    data: statusChartData,
                    animationDuration: 900,
                    animationEasing: 'cubicOut',
                },
            ],
        }),
        [statusChartData],
    );

    const typeChartOption: echarts.EChartsCoreOption = useMemo(
        () => ({
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1f2937',
                borderWidth: 0,
                padding: [8, 12],
                textStyle: { color: '#ffffff', fontSize: 11 },
                axisPointer: { type: 'shadow' },
                formatter: (items: any[]) => {
                    const item = items[0];

                    return `<strong>${item.name}</strong><br/>${item.value} layanan`;
                },
            },
            grid: {
                top: 10,
                right: 24,
                bottom: 8,
                left: 10,
                containLabel: true,
            },
            xAxis: {
                type: 'value',
                minInterval: 1,
                axisLabel: { color: '#78716c', fontSize: 10 },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: {
                    lineStyle: { color: '#e7e5e4', type: 'dashed' },
                },
            },
            yAxis: {
                type: 'category',
                inverse: true,
                data: stats.per_type.map((item) => item.name),
                axisLabel: {
                    color: '#44403c',
                    fontSize: 10,
                    width: 105,
                    overflow: 'truncate',
                },
                axisLine: { show: false },
                axisTick: { show: false },
            },
            series: [
                {
                    type: 'bar',
                    data: stats.per_type.map((item) => item.count),
                    barMaxWidth: 18,
                    itemStyle: {
                        borderRadius: [0, 5, 5, 0],
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: '#15803d' },
                            { offset: 1, color: '#4ade80' },
                        ]),
                    },
                    label: {
                        show: true,
                        position: 'right',
                        color: '#166534',
                        fontSize: 10,
                        fontWeight: 'bold',
                    },
                    animationDuration: 900,
                    animationEasing: 'cubicOut',
                },
            ],
        }),
        [stats.per_type],
    );

    const monthChartOption: echarts.EChartsCoreOption = useMemo(
        () => ({
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1f2937',
                borderWidth: 0,
                padding: [8, 12],
                textStyle: { color: '#ffffff', fontSize: 11 },
                formatter: (items: any[]) => {
                    const item = items[0];

                    return `<strong>${item.name}</strong><br/>${item.value} layanan`;
                },
            },
            grid: {
                top: 24,
                right: 14,
                bottom: 10,
                left: 12,
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: stats.per_month.map(
                    (item) =>
                        `${monthNames[item.month]?.slice(0, 3)} ${item.year}`,
                ),
                axisLabel: {
                    color: '#78716c',
                    fontSize: 9,
                    hideOverlap: true,
                },
                axisLine: { lineStyle: { color: '#d6d3d1' } },
                axisTick: { show: false },
            },
            yAxis: {
                type: 'value',
                minInterval: 1,
                axisLabel: { color: '#78716c', fontSize: 10 },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: {
                    lineStyle: { color: '#e7e5e4', type: 'dashed' },
                },
            },
            series: [
                {
                    type: 'line',
                    data: stats.per_month.map((item) => item.count),
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: { width: 2.5, color: '#0f766e' },
                    itemStyle: {
                        color: '#0f766e',
                        borderColor: '#ffffff',
                        borderWidth: 2,
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#14b8a655' },
                            { offset: 1, color: '#14b8a600' },
                        ]),
                    },
                    animationDuration: 1000,
                    animationEasing: 'cubicOut',
                },
            ],
        }),
        [stats.per_month],
    );

    return (
        <>
            <Head title="Laporan" />

            <div className="flex flex-col gap-2 px-2 py-2 bp360:gap-2.25 bp360:px-2.25 bp400:gap-2.5 bp400:px-2.5 md:gap-2.75 md:px-3 md:py-2.25 lg:gap-3 lg:px-3.5 lg:py-2.5 xl:gap-3.5 xl:px-4 xl:py-3 2xl:gap-4 2xl:px-4.5 2xl:py-3.5">
                {/* Metric Cards */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4">
                    {/* Total Pengajuan */}
                    <div className="rounded-lg bg-white p-3 shadow-[0_10px_20px_0px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-(--primary)/10 md:size-9">
                                <FileText className="size-4 text-(--primary) md:size-5" />
                            </div>
                            <span className="t-size2 font-medium text-stone-500">
                                Total Pengajuan
                            </span>
                        </div>
                        <p className="t-size9 font-bold text-(--primary)">
                            {metrics.total_submissions.toLocaleString('id-ID')}
                        </p>
                    </div>

                    {/* Total Selesai */}
                    <div className="rounded-lg bg-white p-3 shadow-[0_10px_20px_0px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-green-100 md:size-9">
                                <CheckCircle2 className="size-4 text-green-600 md:size-5" />
                            </div>
                            <span className="t-size2 font-medium text-stone-500">
                                Layanan Selesai
                            </span>
                        </div>
                        <p className="t-size9 font-bold text-green-600">
                            {metrics.total_finished.toLocaleString('id-ID')}
                        </p>
                    </div>

                    {/* Total Ditolak */}
                    <div className="rounded-lg bg-white p-3 shadow-[0_10px_20px_0px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-red-100 md:size-9">
                                <XCircle className="size-4 text-red-500 md:size-5" />
                            </div>
                            <span className="t-size2 font-medium text-stone-500">
                                Ditolak
                            </span>
                        </div>
                        <p className="t-size9 font-bold text-red-500">
                            {metrics.total_rejected.toLocaleString('id-ID')}
                        </p>
                    </div>

                    {/* Total Dalam Proses */}
                    <div className="rounded-lg bg-white p-3 shadow-[0_10px_20px_0px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-orange-100 md:size-9">
                                <Clock className="size-4 text-orange-500 md:size-5" />
                            </div>
                            <span className="t-size2 font-medium text-stone-500">
                                Dalam Proses
                            </span>
                        </div>
                        <p className="t-size9 font-bold text-orange-500">
                            {metrics.total_processing.toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>

                {/* Informative Charts */}
                <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    {/* Status Distribution */}
                    <div className="min-h-80 rounded-lg bg-white p-3 shadow-[0_10px_20px_0px_rgba(0,0,0,0.12)] md:p-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="size-4 text-(--primary)" />
                            <div>
                                <h3 className="t-size3 font-semibold text-(--primary)">
                                    Distribusi Status
                                </h3>
                                <p className="t-size1 text-stone-500">
                                    Ringkasan hasil layanan
                                </p>
                            </div>
                        </div>
                        {statusChartData.length > 0 ? (
                            <div className="relative h-65">
                                <ECharts
                                    echarts={echarts}
                                    option={statusChartOption}
                                    style={{ width: '100%', height: '100%' }}
                                    notMerge
                                    lazyUpdate
                                />
                                <div className="pointer-events-none absolute top-[44%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                                    <span className="t-size6 font-bold text-(--primary)">
                                        {metrics.completion_rate}%
                                    </span>
                                    <span className="t-size1 text-stone-500">
                                        Penyelesaian
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="t-size2 flex h-65 items-center justify-center text-stone-400">
                                Belum ada data.
                            </div>
                        )}
                    </div>

                    {/* Services Per Type */}
                    <div className="min-h-80 rounded-lg bg-white p-3 shadow-[0_10px_20px_0px_rgba(0,0,0,0.12)] md:p-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="size-4 text-(--primary)" />
                            <div>
                                <h3 className="t-size3 font-semibold text-(--primary)">
                                    Layanan Per Jenis
                                </h3>
                                <p className="t-size1 text-stone-500">
                                    Volume berdasarkan layanan
                                </p>
                            </div>
                        </div>
                        {stats.per_type.length > 0 ? (
                            <ECharts
                                echarts={echarts}
                                option={typeChartOption}
                                style={{ width: '100%', height: 260 }}
                                notMerge
                                lazyUpdate
                            />
                        ) : (
                            <div className="t-size2 flex h-65 items-center justify-center text-stone-400">
                                Belum ada data.
                            </div>
                        )}
                    </div>

                    {/* Monthly Trend */}
                    <div className="min-h-80 rounded-lg bg-white p-3 shadow-[0_10px_20px_0px_rgba(0,0,0,0.12)] md:p-4 lg:col-span-2 xl:col-span-1">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="size-4 text-teal-700" />
                            <div>
                                <h3 className="t-size3 font-semibold text-(--primary)">
                                    Tren Layanan Bulanan
                                </h3>
                                <p className="t-size1 text-stone-500">
                                    Pergerakan layanan per bulan
                                </p>
                            </div>
                        </div>
                        {stats.per_month.length > 0 ? (
                            <ECharts
                                echarts={echarts}
                                option={monthChartOption}
                                style={{ width: '100%', height: 260 }}
                                notMerge
                                lazyUpdate
                            />
                        ) : (
                            <div className="t-size2 flex h-65 items-center justify-center text-stone-400">
                                Belum ada data.
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex w-full max-w-full items-center gap-2 md:max-w-[70%] lg:max-w-1/2">
                    <SearchBar
                        route={reportsIndexRoute().url}
                        search={filters.search || ''}
                        formId="search-reports"
                        query={{
                            entries: filters.entries,
                            period:
                                filters.period !== 'all'
                                    ? filters.period
                                    : undefined,
                            start_date: filters.start_date || undefined,
                            end_date: filters.end_date || undefined,
                            type_service_id:
                                filters.type_service_id || undefined,
                            status:
                                filters.status !== 'all'
                                    ? filters.status
                                    : undefined,
                            assigned_to: filters.assigned_to || undefined,
                        }}
                    />
                    <Button
                        type="submit"
                        form="search-reports"
                        className="t-size3 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:shadow-none"
                    >
                        Cari
                    </Button>
                </div>

                {/* Filters Toolbar */}
                <div className="grid items-center justify-between gap-2 md:grid-cols-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Period */}
                        <Select
                            value={filters.period || 'all'}
                            onValueChange={(v) =>
                                handleFilterChange('period', v)
                            }
                        >
                            <SelectTrigger className="t-size3 w-full gap-1.5 bg-(--secondary)/30 font-medium text-(--primary) hover:bg-(--secondary)/50 active:bg-(--secondary)/50 data-placeholder:text-(--primary) bp360:w-36">
                                <SelectValue placeholder="Periode" />
                            </SelectTrigger>
                            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                <SelectGroup>
                                    <SelectItem value="all">
                                        Semua Periode
                                    </SelectItem>
                                    <SelectItem value="today">
                                        Hari Ini
                                    </SelectItem>
                                    <SelectItem value="week">
                                        Minggu Ini
                                    </SelectItem>
                                    <SelectItem value="month">
                                        Bulan Ini
                                    </SelectItem>
                                    <SelectItem value="year">
                                        Tahun Ini
                                    </SelectItem>
                                    <SelectItem value="custom">
                                        Rentang Tanggal
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Custom Date Range */}
                        {filters.period === 'custom' && (
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="date"
                                    value={filters.start_date || ''}
                                    onChange={(e) =>
                                        handleQueryChange({
                                            start_date: e.target.value,
                                            period: 'custom',
                                        })
                                    }
                                    className="t-size2 rounded-md border border-(--primary)/30 bg-white px-2 py-1.5 text-(--font-color) focus:ring-1 focus:ring-(--primary) focus:outline-none"
                                />
                                <span className="t-size2 text-stone-400">
                                    —
                                </span>
                                <input
                                    type="date"
                                    value={filters.end_date || ''}
                                    onChange={(e) =>
                                        handleQueryChange({
                                            end_date: e.target.value,
                                            period: 'custom',
                                        })
                                    }
                                    className="t-size2 rounded-md border border-(--primary)/30 bg-white px-2 py-1.5 text-(--font-color) focus:ring-1 focus:ring-(--primary) focus:outline-none"
                                />
                            </div>
                        )}

                        {/* Status */}
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(v) =>
                                handleFilterChange('status', v)
                            }
                        >
                            <SelectTrigger className="t-size3 w-full gap-1.5 bg-(--secondary)/30 font-medium text-(--primary) hover:bg-(--secondary)/50 active:bg-(--secondary)/50 data-placeholder:text-(--primary) bp360:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                <SelectGroup>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Menunggu Verifikasi
                                    </SelectItem>
                                    <SelectItem value="processing">
                                        Dalam Proses
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        Disetujui
                                    </SelectItem>
                                    <SelectItem value="finished">
                                        Selesai
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Ditolak
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Type Service */}
                        <Select
                            value={filters.type_service_id || 'all'}
                            onValueChange={(v) =>
                                handleFilterChange('type_service_id', v)
                            }
                        >
                            <SelectTrigger className="t-size3 w-full gap-1.5 bg-(--secondary)/30 font-medium text-(--primary) hover:bg-(--secondary)/50 active:bg-(--secondary)/50 data-placeholder:text-(--primary) bp360:w-48">
                                <SelectValue placeholder="Jenis Layanan" />
                            </SelectTrigger>
                            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                <SelectGroup>
                                    <SelectItem value="all">
                                        Semua Jenis
                                    </SelectItem>
                                    {typeServices.map((ts) => (
                                        <SelectItem
                                            key={ts.id}
                                            value={String(ts.id)}
                                        >
                                            {ts.service_name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Officer */}
                        <Select
                            value={filters.assigned_to || 'all'}
                            onValueChange={(v) =>
                                handleFilterChange('assigned_to', v)
                            }
                        >
                            <SelectTrigger className="t-size3 w-full gap-1.5 bg-(--secondary)/30 font-medium text-(--primary) hover:bg-(--secondary)/50 active:bg-(--secondary)/50 data-placeholder:text-(--primary) bp360:w-40">
                                <SelectValue placeholder="Petugas" />
                            </SelectTrigger>
                            <SelectContent className="t-size3 border-(--primary)/60 bg-yellow-100">
                                <SelectGroup>
                                    <SelectItem value="all">
                                        Semua Petugas
                                    </SelectItem>
                                    {officers.map((o) => (
                                        <SelectItem
                                            key={o.id}
                                            value={String(o.id)}
                                        >
                                            {o.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-start gap-1 md:justify-end">
                        <span className="t-size3 font-medium text-(--primary)">
                            Tampilkan:
                        </span>
                        <Entries
                            route={reportsIndexRoute().url}
                            entries={filters.entries}
                            query={{
                                search: filters.search || undefined,
                                period:
                                    filters.period !== 'all'
                                        ? filters.period
                                        : undefined,
                                start_date: filters.start_date || undefined,
                                end_date: filters.end_date || undefined,
                                type_service_id:
                                    filters.type_service_id || undefined,
                                status:
                                    filters.status !== 'all'
                                        ? filters.status
                                        : undefined,
                                assigned_to: filters.assigned_to || undefined,
                            }}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="mt-1">
                    {reports.data.length > 0 ? (
                        <div className="sb-primary relative overflow-x-auto rounded-lg bg-green-50 shadow-[0_10px_20px_0px_rgba(0,0,0,0.2)] md:rounded-xl">
                            <table className="w-full bg-white">
                                <thead className="bg-(--secondary)/15">
                                    <tr className="t-size3 text-(--primary)">
                                        <th className="px-4 py-3 text-center font-semibold">
                                            No
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            No. Registrasi
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            No. Layanan
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Pemohon
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Jenis Layanan
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Tanggal
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Petugas
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.data.map((row, index) => {
                                        const statusInfo =
                                            getDisplayStatus(row);

                                        return (
                                            <tr
                                                key={row.submission_id}
                                                className="t-size2 border-b-[1.5px] border-(--primary)/10 text-(--font-color) last:border-b-0 even:bg-(--primary)/3"
                                            >
                                                <td className="px-4 py-2 text-center font-medium">
                                                    {i + index + 1}
                                                </td>
                                                <td className="px-4 py-2 text-center font-semibold text-(--primary)">
                                                    {row.submission_number}
                                                </td>
                                                <td className="px-4 py-2 text-center font-medium">
                                                    {row.service_number || '-'}
                                                </td>
                                                <td className="px-4 py-2 text-center font-medium">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">
                                                            {row.resident_name}
                                                        </span>
                                                        <span className="t-size1 font-normal text-stone-500">
                                                            {row.resident_nik}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-center font-medium">
                                                    {row.service_name || '-'}
                                                </td>
                                                <td className="px-4 py-2 text-center font-medium">
                                                    {row.submission_created_at
                                                        ? new Date(
                                                              row.submission_created_at,
                                                          ).toLocaleDateString(
                                                              'id-ID',
                                                              {
                                                                  day: 'numeric',
                                                                  month: 'short',
                                                                  year: 'numeric',
                                                              },
                                                          )
                                                        : '-'}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <span
                                                        className={`t-size1 rounded-full px-2.5 py-1.5 font-semibold whitespace-nowrap ${statusInfo.className}`}
                                                    >
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-center font-medium">
                                                    {row.officer_name || '-'}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <Link
                                                            href={route(
                                                                'kades.reports.show',
                                                                row.submission_id,
                                                            )}
                                                            className="inline-flex items-center gap-1 rounded-md border-[1.7px] border-(--primary)/50 bg-(--primary)/10 px-2.5 py-1.5 font-medium text-(--primary) transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-(--primary)/70 hover:bg-(--primary)/20 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:border-(--primary)/70 active:bg-(--primary)/20 active:shadow-none bp360:px-3 bp360:py-2"
                                                        >
                                                            <Eye className="size-3.25 bp360:size-3.5 bp400:size-3.75 md:size-4 lg:size-4.25 xl:size-4.5 2xl:size-4.75" />
                                                            Detail
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div
                                className={`t-size3 bg-green-50 ${shouldShowPagination ? 'px-3 py-2 bp360:px-3.25 bp400:px-3.5 md:px-4' : 'mb-7'}`}
                            >
                                <InertiaPagination pagination={reports} />
                            </div>
                        </div>
                    ) : (
                        <div className="t-size3 mb-3 bg-(--secondary)/15 p-3 text-center font-semibold text-(--primary)">
                            Data Tidak Ditemukan
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Laporan',
            href: reportsIndexRoute().url,
        },
    ],
};
