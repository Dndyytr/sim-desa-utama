<?php

namespace App\Http\Controllers\Sekdes;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\Service;
use App\Models\ServiceLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
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
            new Middleware('permission:u-services', only: ['disposition']),
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
        $disposition = $request->input('disposition');
        $sort = $request->query('sort') ?? null;

        if (! in_array($status, ['processing', 'approved', 'completed'], true)) {
            $status = null;
        }

        if (! in_array($disposition, ['disposed', 'not_disposed'], true)) {
            $disposition = null;
        }

        $sorts = [
            'created_desc' => ['created_at', 'desc'],
            'created_asc' => ['created_at', 'asc'],
            'number_asc' => ['service_number', 'asc'],
            'number_desc' => ['service_number', 'desc'],
        ];

        [$sortColumn, $sortDirection] = $request->resolveSort($sorts);

        $services = Service::query()
            ->with(['submission', 'submission.resident', 'submission.typeService', 'assignedTo'])
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
            ->when($disposition === 'disposed', function ($query) {
                $query->whereNotNull('assigned_to');
            })
            ->when($disposition === 'not_disposed', function ($query) {
                $query->whereNull('assigned_to');
            })
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($validated['entries'])
            ->onEachSide(0)
            ->appends($request->except(['page']));

        return Inertia::render('sekdes/services/index', [
            'services' => $services,
            'i' => $request->startIndex(),
            'entries' => (int) $validated['entries'],
            'search' => $search,
            'sort' => $sort,
            'status' => $status,
            'disposition' => $disposition,
            'hasFilter' => $request->hasFilter(['status', 'disposition']),
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

        $officers = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('sekdes/services/show', [
            'service' => $service,
            'officers' => $officers,
        ]);
    }

    /**
     * Process service disposition.
     */
    public function disposition(Request $request, int $id): RedirectResponse
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
            'notes' => 'nullable|string|max:1000',
        ], [
            'assigned_to.required' => 'Petugas wajib dipilih.',
            'assigned_to.exists' => 'Petugas tidak valid.',
            'notes.max' => 'Catatan instruksi maksimal 1000 karakter.',
        ]);

        try {
            DB::beginTransaction();

            $officer = User::findOrFail($validated['assigned_to']);
            $service->assigned_to = $officer->id;
            $service->notes = $validated['notes'] ?? null;
            $service->save();

            // Create service log
            $serviceLog = new ServiceLog;
            $serviceLog->submission_id = $service->submission_id;
            $serviceLog->stage = 'Disposition';
            $serviceLog->activity = "Layanan Didisposisikan ke {$officer->name}";
            $serviceLog->performed_by = auth()->id();
            $serviceLog->notes = $validated['notes'] ?? null;
            $serviceLog->save();

            DB::commit();

            return redirect()->route('services.show', $service->id)->with('success', "Layanan berhasil didisposisikan ke {$officer->name}.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to dispose service: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal memproses disposisi layanan.');
        }
    }
}
