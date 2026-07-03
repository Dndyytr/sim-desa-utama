<?php

namespace App\Http\Controllers\Kadangs;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\Letter;
use App\Models\Service;
use App\Models\ServiceArchive;
use App\Models\ServiceLog;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LetterController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-kadang-letters', only: ['index', 'show']),
            new Middleware('permission:u-kadang-letters', only: ['create', 'store', 'download']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(ListingRequest $request): Response
    {
        $validated = $request->validated();
        $search = $validated['search'] ?? null;
        $status = $request->input('status'); // completed (Belum Terbit) or finished (Sudah Terbit)
        $sort = $request->query('sort') ?? null;

        if (! in_array($status, ['completed', 'finished'], true)) {
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
            ->with(['submission', 'submission.resident', 'submission.typeService', 'letter'])
            ->where('assigned_to', Auth::id())
            ->whereIn('status', ['completed', 'finished'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    // Search optimization: LIKE 'term%' to leverage index
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

        return Inertia::render('kadangs/letters/index', [
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
     * Show the form for generating a letter.
     */
    public function create(Request $request): Response
    {
        $serviceId = $request->query('service_id');
        $service = Service::with([
            'submission',
            'submission.resident',
            'submission.typeService',
        ])->where('assigned_to', Auth::id())
            ->where('status', 'completed')
            ->findOrFail($serviceId);

        // Pre-calculate letter number to preview
        $count = Letter::whereYear('created_at', now()->year)->count();
        $counter = str_pad($count + 1, 3, '0', STR_PAD_LEFT);
        $romans = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        $romanMonth = $romans[now()->month] ?? 'I';
        $year = now()->year;
        $previewLetterNumber = "470/{$counter}/DSU/{$romanMonth}/{$year}";

        return Inertia::render('kadangs/letters/create', [
            'service' => $service,
            'previewLetterNumber' => $previewLetterNumber,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
        ]);

        $service = Service::with([
            'submission',
            'submission.resident',
            'submission.typeService',
        ])->where('assigned_to', Auth::id())
            ->where('status', 'completed')
            ->findOrFail($validated['service_id']);

        // Check if letter already generated
        $exists = Letter::where('service_id', $service->id)->exists();
        if ($exists) {
            return redirect()->back()->with('error', 'Surat sudah pernah diterbitkan untuk layanan ini.');
        }

        try {
            DB::beginTransaction();

            // Calculate letter number
            $count = Letter::whereYear('created_at', now()->year)->count();
            $counter = str_pad($count + 1, 3, '0', STR_PAD_LEFT);
            $romans = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
            $romanMonth = $romans[now()->month] ?? 'I';
            $year = now()->year;
            $letterNumber = "470/{$counter}/DSU/{$romanMonth}/{$year}";

            // Generate HTML layout for DomPDF
            $html = view('kadangs.letters.pdf', [
                'service' => $service,
                'letterNumber' => $letterNumber,
                'content' => $service->draft_content,
            ])->render();

            $pdf = Pdf::loadHTML($html);

            // Set paper to A4 or F4/Folio
            $pdf->setPaper('a4', 'portrait');

            $pdfContent = $pdf->output();

            // Ensure directory exists
            if (! Storage::disk('public')->exists('letters')) {
                Storage::disk('public')->makeDirectory('letters');
            }

            $filename = 'letters/'.uniqid().'.pdf';
            Storage::disk('public')->put($filename, $pdfContent);

            // Save to database
            $letter = new Letter;
            $letter->service_id = $service->id;
            $letter->letter_number = $letterNumber;
            $letter->file_path = $filename;
            $letter->generated_by = Auth::id();
            $letter->generated_at = now();
            $letter->save();

            // Update service status
            $service->status = 'finished';
            $service->save();

            // Create automatic ServiceArchive record
            $archiveCounter = ServiceArchive::count() + 1;
            $archiveNumber = 'ARSIP/'.now()->year.'/'.str_pad($archiveCounter, 3, '0', STR_PAD_LEFT);

            $archive = new ServiceArchive;
            $archive->archive_number = $archiveNumber;
            $archive->service_id = $service->id;
            $archive->status = 'aktif';
            $archive->archived_at = now();
            $archive->archived_by = Auth::id();
            $archive->save();

            // Create service log
            $serviceLog = new ServiceLog;
            $serviceLog->submission_id = $service->submission_id;
            $serviceLog->stage = 'Finished';
            $serviceLog->activity = 'Surat resmi diterbitkan & Layanan Diarsipkan';
            $serviceLog->performed_by = Auth::id();
            $serviceLog->notes = 'Nomor Surat: '.$letterNumber.', Nomor Arsip: '.$archiveNumber;
            $serviceLog->save();

            DB::commit();

            return redirect()->route('kadangs.letters.show', $letter->id)->with('success', 'Surat resmi berhasil diterbitkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to generate letter: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal menghasilkan surat resmi: '.$e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): Response
    {
        $letter = Letter::with([
            'service',
            'service.submission',
            'service.submission.resident',
            'service.submission.typeService',
            'generator',
        ])->findOrFail($id);

        if ($letter->service->assigned_to !== Auth::id()) {
            abort(403, 'Anda tidak ditugaskan untuk mengakses surat ini.');
        }

        return Inertia::render('kadangs/letters/show', [
            'letter' => $letter,
        ]);
    }

    /**
     * Download the letter PDF.
     */
    public function download(int $id): BinaryFileResponse
    {
        $letter = Letter::with(['service'])->findOrFail($id);

        if ($letter->service->assigned_to !== Auth::id()) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengunduh surat ini.');
        }

        $path = Storage::disk('public')->path($letter->file_path);

        if (! file_exists($path)) {
            abort(404, 'File surat tidak ditemukan.');
        }

        $cleanedName = str_replace('/', '_', $letter->letter_number).'.pdf';

        return response()->download($path, $cleanedName);
    }
}
