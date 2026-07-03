<?php

namespace App\Http\Controllers\Kadangs;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\ServiceArchive;
use App\Models\ServiceLog;
use App\Models\TypeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ServiceArchiveController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-kadang-archives', only: ['index', 'show']),
            new Middleware('permission:u-kadang-archives', only: ['update']),
        ];
    }

    /**
     * Display a listing of the archives.
     */
    public function index(ListingRequest $request): Response
    {
        $validated = $request->validated();
        $search = $validated['search'] ?? null;
        $status = $request->input('status');
        $typeServiceId = $request->input('type_service_id');
        $sort = $request->query('sort') ?? null;

        if (! in_array($status, ['aktif', 'ditutup', 'retensi'], true)) {
            $status = null;
        }

        $sorts = [
            'created_desc' => ['created_at', 'desc'],
            'created_asc' => ['created_at', 'asc'],
            'archive_number_asc' => ['archive_number', 'asc'],
            'archive_number_desc' => ['archive_number', 'desc'],
        ];

        [$sortColumn, $sortDirection] = $request->resolveSort($sorts);

        $archives = ServiceArchive::query()
            ->with([
                'service',
                'service.submission',
                'service.submission.resident',
                'service.submission.typeService',
                'service.letter',
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    // Search optimization: LIKE 'term%' (only trailing wildcard) to leverage index
                    $q->where('archive_number', 'like', $search.'%')
                        ->orWhereHas('service', function ($sq) use ($search) {
                            $sq->where('service_number', 'like', $search.'%')
                                ->orWhereHas('submission', function ($subq) use ($search) {
                                    $subq->where('subject', 'like', $search.'%')
                                        ->orWhereHas('resident', function ($rq) use ($search) {
                                            $rq->where('name', 'like', $search.'%')
                                                ->orWhere('nik', 'like', $search.'%');
                                        });
                                });
                        });
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($typeServiceId, function ($query, $typeServiceId) {
                $query->whereHas('service.submission', function ($q) use ($typeServiceId) {
                    $q->where('type_service_id', $typeServiceId);
                });
            })
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($validated['entries'])
            ->onEachSide(0)
            ->appends($request->except(['page']));

        $typeServices = TypeService::orderBy('service_name', 'asc')->get();

        return Inertia::render('kadangs/archives/index', [
            'archives' => $archives,
            'typeServices' => $typeServices,
            'i' => $request->startIndex(),
            'entries' => (int) $validated['entries'],
            'search' => $search,
            'sort' => $sort,
            'status' => $status,
            'type_service_id' => $typeServiceId,
            'hasFilter' => $request->hasFilter(['status', 'type_service_id']),
        ]);
    }

    /**
     * Display the specified archive.
     */
    public function show(int $id): Response
    {
        $archive = ServiceArchive::with([
            'service',
            'service.submission',
            'service.submission.resident',
            'service.submission.typeService',
            'service.submission.serviceLogs.performer',
            'service.letter',
            'archivist',
        ])->findOrFail($id);

        return Inertia::render('kadangs/archives/show', [
            'archive' => $archive,
        ]);
    }

    /**
     * Update the status of the archive.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:aktif,ditutup,retensi',
        ]);

        $archive = ServiceArchive::findOrFail($id);
        $oldStatus = $archive->status;
        $archive->status = $request->input('status');
        $archive->save();

        // Create service log
        $serviceLog = new ServiceLog;
        $serviceLog->submission_id = $archive->service->submission_id;
        $serviceLog->stage = 'Archived';
        $serviceLog->activity = 'Status arsip diubah';
        $serviceLog->performed_by = Auth::id();
        $serviceLog->notes = 'Status: '.ucfirst($oldStatus).' -> '.ucfirst($archive->status);
        $serviceLog->save();

        return redirect()->back()->with('success', 'Status arsip berhasil diperbarui.');
    }
}
