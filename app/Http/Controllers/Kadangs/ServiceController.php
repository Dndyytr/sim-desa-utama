<?php

namespace App\Http\Controllers\Kadangs;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\Service;
use App\Models\ServiceLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-services', only: ['index', 'show']),
            new Middleware('permission:u-services', only: ['process']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(ListingRequest $request): Response
    {
        $validated = $request->validated();
        $search = $validated['search'] ?? null;
        $status = $request->input('status');
        $sort = $request->query('sort') ?? null;

        if (! in_array($status, ['processing', 'approved', 'completed'], true)) {
            $status = null;
        }

        $sorts = [
            'created_desc' => ['created_at', 'desc'],
            'created_asc' => ['created_at', 'asc'],
            'number_asc' => ['service_number', 'asc'],
            'number_desc' => ['service_number', 'desc'],
        ];

        [$sortColumn, $sortDirection] = $request->resolveSort($sorts);

        $services = Service::query()
            ->with(['submission', 'submission.resident', 'submission.typeService'])
            ->where('assigned_to', Auth::id())
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    // Search optimization: LIKE 'term%' (only trailing wildcard) to leverage index
                    $q->where('service_number', 'like', $search.'%')
                        ->orWhereHas('submission', function ($sq) use ($search) {
                            $sq->where('subject', 'like', $search.'%')
                                ->orWhereHas('resident', function ($rq) use ($search) {
                                    $rq->where('name', 'like', $search.'%')
                                        ->orWhere('nik', 'like', $search.'%');
                                });
                        });
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($validated['entries'])
            ->onEachSide(0)
            ->appends($request->except(['page']));

        return Inertia::render('kadangs/services/index', [
            'services' => $services,
            'i' => $request->startIndex(),
            'entries' => (int) $validated['entries'],
            'search' => $search,
            'sort' => $sort,
            'status' => $status,
            'hasFilter' => $request->hasFilter(['status']),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): Response
    {
        $service = Service::with([
            'submission',
            'submission.resident',
            'submission.typeService',
            'submission.attachments',
            'submission.serviceLogs',
            'submission.serviceLogs.performer',
            'assignedTo',
        ])->findOrFail($id);

        if ($service->assigned_to !== Auth::id()) {
            abort(403, 'Anda tidak ditugaskan untuk memproses layanan ini.');
        }

        return Inertia::render('kadangs/services/show', [
            'service' => $service,
        ]);
    }

    /**
     * Process service.
     */
    public function process(Request $request, int $id): RedirectResponse
    {
        $service = Service::findOrFail($id);

        if ($service->assigned_to !== Auth::id()) {
            abort(403, 'Anda tidak ditugaskan untuk memproses layanan ini.');
        }

        if ($service->status !== 'processing') {
            return redirect()->back()->with('error', 'Layanan tidak dalam status diproses.');
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ], [
            'notes.max' => 'Catatan pemrosesan maksimal 1000 karakter.',
        ]);

        try {
            DB::beginTransaction();

            $service->status = 'approved';
            $service->notes = $validated['notes'] ?? null;
            $service->save();

            // Create service log
            $serviceLog = new ServiceLog;
            $serviceLog->submission_id = $service->submission_id;
            $serviceLog->stage = 'Processing';
            $serviceLog->activity = 'Layanan selesai diproses dan diteruskan untuk persetujuan akhir';
            $serviceLog->performed_by = auth()->id();
            $serviceLog->notes = $validated['notes'] ?? null;
            $serviceLog->save();

            DB::commit();

            return redirect()->route('kadangs.services.show', $service->id)->with('success', 'Layanan berhasil diproses dan diteruskan ke Kepala Desa.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to process service: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal memproses layanan.');
        }
    }
}
