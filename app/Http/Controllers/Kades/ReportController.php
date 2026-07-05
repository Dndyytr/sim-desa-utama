<?php

namespace App\Http\Controllers\Kades;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\TypeService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class ReportController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-kades-reports', only: ['index', 'show']),
        ];
    }

    public function index(Request $request)
    {
        $request->validate([
            'period' => 'nullable|in:all,today,week,month,year,custom',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'type_service_id' => 'nullable|exists:type_services,id',
            'status' => 'nullable|in:all,pending,processing,approved,finished,rejected',
            'assigned_to' => 'nullable|exists:users,id',
            'search' => 'nullable|string',
            'entries' => 'nullable|integer|min:1|max:100',
        ]);

        $period = $request->input('period', 'all');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $typeServiceId = $request->input('type_service_id');
        $status = $request->input('status', 'all');
        $assignedTo = $request->input('assigned_to');
        $search = $request->input('search');
        $entries = $request->input('entries', 10);

        // Build base query
        $query = Submission::leftJoin('services', 'submissions.id', '=', 'services.submission_id')
            ->leftJoin('residents', 'submissions.resident_id', '=', 'residents.id')
            ->leftJoin('type_services', 'submissions.type_service_id', '=', 'type_services.id')
            ->leftJoin('users', 'services.assigned_to', '=', 'users.id');

        // Filter: Period
        if ($period === 'today') {
            $query->whereDate('submissions.created_at', today());
        } elseif ($period === 'week') {
            $query->whereBetween('submissions.created_at', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($period === 'month') {
            $query->whereMonth('submissions.created_at', now()->month)
                ->whereYear('submissions.created_at', now()->year);
        } elseif ($period === 'year') {
            $query->whereYear('submissions.created_at', now()->year);
        } elseif ($period === 'custom' && $startDate && $endDate) {
            $query->whereBetween('submissions.created_at', [
                $startDate.' 00:00:00',
                $endDate.' 23:59:59',
            ]);
        }

        // Filter: Type Service
        if ($typeServiceId) {
            $query->where('submissions.type_service_id', $typeServiceId);
        }

        // Filter: Assigned To (Officer)
        if ($assignedTo) {
            $query->where('services.assigned_to', $assignedTo);
        }

        // Filter: Status
        if ($status && $status !== 'all') {
            if ($status === 'pending') {
                $query->where('submissions.status', 'pending');
            } elseif ($status === 'processing') {
                $query->where('services.status', 'processing');
            } elseif ($status === 'approved') {
                $query->whereIn('services.status', ['completed', 'approved']);
            } elseif ($status === 'finished') {
                $query->where('services.status', 'finished');
            } elseif ($status === 'rejected') {
                $query->where(function ($q) {
                    $q->where('submissions.status', 'rejected')
                        ->orWhere('services.status', 'rejected');
                });
            }
        }

        // Filter: Search (TRAILING-ONLY WILDCARD to utilize index)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('submissions.submission_number', 'like', $search.'%')
                    ->orWhere('services.service_number', 'like', $search.'%')
                    ->orWhere('residents.name', 'like', $search.'%');
            });
        }

        // Metrik Utama (Aggregated using clones)
        $totalSubmissions = (clone $query)->count();

        $totalFinished = (clone $query)->where('services.status', 'finished')->count();

        $totalRejected = (clone $query)->where(function ($q) {
            $q->where('submissions.status', 'rejected')
                ->orWhere('services.status', 'rejected');
        })->count();

        $totalProcessing = (clone $query)->where(function ($q) {
            $q->whereIn('submissions.status', ['pending', 'needs_correction'])
                ->orWhereIn('services.status', ['processing', 'completed', 'approved']);
        })->count();

        // Statistik Layanan Per Jenis
        $statsPerType = (clone $query)
            ->groupBy('submissions.type_service_id', 'type_services.service_name')
            ->selectRaw('type_services.service_name as name, count(submissions.id) as count')
            ->get();

        // Statistik Layanan Per Bulan
        $statsPerMonth = (clone $query)
            ->groupByRaw('YEAR(submissions.created_at), MONTH(submissions.created_at)')
            ->orderByRaw('YEAR(submissions.created_at) DESC, MONTH(submissions.created_at) DESC')
            ->selectRaw('YEAR(submissions.created_at) as year, MONTH(submissions.created_at) as month, count(submissions.id) as count')
            ->limit(12)
            ->get()
            ->reverse()
            ->values();

        // Completion Rate
        $completionRate = $totalSubmissions > 0 ? round(($totalFinished / $totalSubmissions) * 100) : 0;

        // Paginated details
        $reports = $query->select([
            'submissions.id as submission_id',
            'submissions.submission_number',
            'submissions.subject',
            'submissions.status as submission_status',
            'submissions.created_at as submission_created_at',
            'submissions.type_service_id',
            'residents.name as resident_name',
            'residents.nik as resident_nik',
            'type_services.service_name as service_name',
            'services.id as service_id',
            'services.service_number',
            'services.status as service_status',
            'services.assigned_to',
            'users.name as officer_name',
        ])
            ->orderBy('submissions.created_at', 'desc')
            ->paginate($entries)
            ->withQueryString();

        $typeServices = TypeService::where('is_active', true)->get(['id', 'service_name']);
        $officers = User::role('kadang')->get(['id', 'name']); // assuming kadang is the officer

        $i = ($reports->currentPage() - 1) * $reports->perPage();

        return Inertia::render('kades/reports/index', [
            'reports' => $reports,
            'metrics' => [
                'total_submissions' => $totalSubmissions,
                'total_finished' => $totalFinished,
                'total_rejected' => $totalRejected,
                'total_processing' => $totalProcessing,
                'completion_rate' => $completionRate,
            ],
            'stats' => [
                'per_type' => $statsPerType,
                'per_month' => $statsPerMonth,
            ],
            'typeServices' => $typeServices,
            'officers' => $officers,
            'filters' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'type_service_id' => $typeServiceId,
                'status' => $status,
                'assigned_to' => $assignedTo,
                'search' => $search,
                'entries' => $entries,
            ],
            'i' => $i,
        ]);
    }

    public function show($id)
    {
        $submission = Submission::with([
            'resident',
            'typeService',
            'service.assignedTo',
            'service.letter',
            'serviceLogs.performer',
        ])->findOrFail($id);

        return Inertia::render('kades/reports/show', [
            'submission' => $submission,
        ]);
    }
}
