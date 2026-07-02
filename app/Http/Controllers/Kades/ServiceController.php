<?php

namespace App\Http\Controllers\Kades;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\Service;
use App\Models\ServiceLog;
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
            new Middleware('permission:r-kades-services', only: ['index', 'show']),
            new Middleware('permission:u-kades-services', only: ['approve', 'revise', 'reject']),
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

        // Default status is 'approved' (waiting for final approval)
        if (! in_array($status, ['processing', 'approved', 'completed', 'rejected'], true)) {
            $status = 'approved';
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
            ->where('status', $status)
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($validated['entries'])
            ->onEachSide(0)
            ->appends($request->except(['page']));

        return Inertia::render('kades/services/index', [
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

        return Inertia::render('kades/services/show', [
            'service' => $service,
        ]);
    }

    /**
     * Approve service.
     */
    public function approve(Request $request, int $id): RedirectResponse
    {
        $service = Service::findOrFail($id);

        if ($service->status !== 'approved') {
            return redirect()->back()->with('error', 'Layanan tidak dalam status menunggu persetujuan.');
        }

        if (empty($service->draft_content) || empty($service->result)) {
            return redirect()->back()->with('error', 'Hasil proses atau draft surat belum tersedia.');
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ], [
            'notes.max' => 'Catatan persetujuan maksimal 1000 karakter.',
        ]);

        try {
            DB::beginTransaction();

            $service->status = 'completed';
            // Simpan catatan persetujuan Kades di kolom notes atau biarkan notes berisi riwayat
            $service->notes = $validated['notes'] ?? $service->notes;
            $service->save();

            // Create service log
            $serviceLog = new ServiceLog;
            $serviceLog->submission_id = $service->submission_id;
            $serviceLog->stage = 'Approved';
            $serviceLog->activity = 'Layanan disetujui secara akhir oleh Kepala Desa';
            $serviceLog->performed_by = auth()->id();
            $serviceLog->notes = $validated['notes'] ?? null;
            $serviceLog->save();

            DB::commit();

            return redirect()->route('kades.services.show', $service->id)->with('success', 'Layanan berhasil disetujui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to approve service: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal menyetujui layanan.');
        }
    }

    /**
     * Revise service.
     */
    public function revise(Request $request, int $id): RedirectResponse
    {
        $service = Service::findOrFail($id);

        if ($service->status !== 'approved') {
            return redirect()->back()->with('error', 'Layanan tidak dalam status menunggu persetujuan.');
        }

        $validated = $request->validate([
            'notes' => 'required|string|max:1000',
        ], [
            'notes.required' => 'Catatan revisi wajib diisi.',
            'notes.max' => 'Catatan revisi maksimal 1000 karakter.',
        ]);

        try {
            DB::beginTransaction();

            $service->status = 'processing';
            $service->notes = $validated['notes'];
            $service->save();

            // Create service log
            $serviceLog = new ServiceLog;
            $serviceLog->submission_id = $service->submission_id;
            $serviceLog->stage = 'Revision';
            $serviceLog->activity = 'Layanan dikembalikan untuk revisi oleh Kepala Desa';
            $serviceLog->performed_by = auth()->id();
            $serviceLog->notes = $validated['notes'];
            $serviceLog->save();

            DB::commit();

            return redirect()->route('kades.services.show', $service->id)->with('success', 'Layanan dikembalikan untuk revisi.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to revise service: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal meminta revisi layanan.');
        }
    }

    /**
     * Reject service.
     */
    public function reject(Request $request, int $id): RedirectResponse
    {
        $service = Service::findOrFail($id);

        if ($service->status !== 'approved') {
            return redirect()->back()->with('error', 'Layanan tidak dalam status menunggu persetujuan.');
        }

        $validated = $request->validate([
            'notes' => 'required|string|max:1000',
        ], [
            'notes.required' => 'Alasan penolakan wajib diisi.',
            'notes.max' => 'Alasan penolakan maksimal 1000 karakter.',
        ]);

        try {
            DB::beginTransaction();

            $service->status = 'rejected';
            $service->notes = $validated['notes'];
            $service->save();

            // Create service log
            $serviceLog = new ServiceLog;
            $serviceLog->submission_id = $service->submission_id;
            $serviceLog->stage = 'Rejected';
            $serviceLog->activity = 'Layanan ditolak oleh Kepala Desa';
            $serviceLog->performed_by = auth()->id();
            $serviceLog->notes = $validated['notes'];
            $serviceLog->save();

            DB::commit();

            return redirect()->route('kades.services.show', $service->id)->with('success', 'Layanan berhasil ditolak.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to reject service: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal menolak layanan.');
        }
    }
}
