<?php

namespace App\Http\Controllers\Pekets;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\Resident;
use App\Models\Submission;
use App\Models\SubmissionAttachment;
use App\Models\TypeService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-submissions', only: ['index', 'show']),
            new Middleware('permission:c-submissions', only: ['create', 'store']),
            new Middleware('permission:d-submissions', only: ['destroy', 'bulkDelete']),
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
        $source = $request->input('source');
        $sort = $request->query('sort') ?? null;

        if (! in_array($status, ['pending', 'verified', 'rejected', 'processing', 'approved', 'completed'], true)) {
            $status = null;
        }

        if (! in_array($source, ['offline', 'mobile', 'website'], true)) {
            $source = null;
        }

        $sorts = [
            'created_desc' => ['created_at', 'desc'],
            'created_asc' => ['created_at', 'asc'],
            'updated_desc' => ['updated_at', 'desc'],
            'updated_asc' => ['updated_at', 'asc'],
            'number_asc' => ['submission_number', 'asc'],
            'number_desc' => ['submission_number', 'desc'],
        ];

        [$sortColumn, $sortDirection] = $request->resolveSort($sorts);

        $submissions = Submission::query()
            ->with(['resident', 'typeService', 'submittedBy'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    // Search optimization: LIKE 'term%' (only trailing wildcard) to leverage index
                    $q->where('submission_number', 'like', $search.'%')
                        ->orWhere('subject', 'like', $search.'%');
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($source, function ($query, $source) {
                $query->where('source', $source);
            })
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($validated['entries'])
            ->onEachSide(0)
            ->appends($request->except(['page']));

        return Inertia::render('pekets/submissions/index', [
            'submissions' => $submissions,
            'i' => $request->startIndex(),
            'entries' => (int) $validated['entries'],
            'search' => $search,
            'sort' => $sort,
            'status' => $status,
            'source' => $source,
            'hasFilter' => $request->hasFilter(['status', 'source']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $residents = Resident::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'nik', 'name']);

        $typeServices = TypeService::where('is_active', true)
            ->orderBy('service_name')
            ->get(['id', 'service_code', 'service_name']);

        return Inertia::render('pekets/submissions/create', [
            'residents' => $residents,
            'typeServices' => $typeServices,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'type_service_id' => 'required|exists:type_services,id',
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:5120|mimes:pdf,jpg,jpeg,png,doc,docx',
        ], [
            'resident_id.required' => 'Pemohon wajib dipilih.',
            'resident_id.exists' => 'Pemohon tidak valid.',
            'type_service_id.required' => 'Jenis Layanan wajib dipilih.',
            'type_service_id.exists' => 'Jenis Layanan tidak valid.',
            'subject.required' => 'Judul Pengajuan wajib diisi.',
            'subject.max' => 'Judul Pengajuan maksimal 255 karakter.',
            'attachments.*.max' => 'File lampiran maksimal 5MB.',
            'attachments.*.mimes' => 'Format file lampiran hanya mendukung pdf, jpg, jpeg, png, doc, docx.',
        ]);

        try {
            DB::beginTransaction();

            // Check if resident is active
            $resident = Resident::findOrFail($validated['resident_id']);
            if (! $resident->is_active) {
                return redirect()->back()->withErrors(['resident_id' => 'Pemohon harus merupakan penduduk aktif.']);
            }

            // Safe submission number generation with lock
            $prefix = 'SUB-'.date('Ymd').'-';
            $lastSubmission = Submission::where('submission_number', 'like', $prefix.'%')
                ->orderBy('submission_number', 'desc')
                ->lockForUpdate()
                ->first();

            if ($lastSubmission) {
                $sequence = (int) substr($lastSubmission->submission_number, -5);
                $newSequence = $sequence + 1;
            } else {
                $newSequence = 1;
            }

            $submissionNumber = $prefix.str_pad($newSequence, 5, '0', STR_PAD_LEFT);

            $submission = new Submission;
            $submission->submission_number = $submissionNumber;
            $submission->resident_id = $validated['resident_id'];
            $submission->type_service_id = $validated['type_service_id'];
            $submission->submitted_by = auth()->id();
            $submission->subject = $validated['subject'];
            $submission->description = $validated['description'] ?? null;
            $submission->status = 'pending';
            $submission->source = 'offline';
            $submission->save();

            // Handle attachments
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $fileName = $file->getClientOriginalName();
                    $filePath = $file->storeAs(
                        "submissions/{$submissionNumber}",
                        $fileName,
                        'public'
                    );

                    $attachment = new SubmissionAttachment;
                    $attachment->submission_id = $submission->id;
                    $attachment->file_name = $fileName;
                    $attachment->file_path = $filePath;
                    $attachment->file_type = $file->getClientMimeType();
                    $attachment->file_size = $file->getSize();
                    $attachment->uploaded_by = auth()->id();
                    $attachment->save();
                }
            }

            DB::commit();

            return redirect()->route('submissions.index')->with('success', "Pengajuan {$submissionNumber} berhasil disimpan.");
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('Gagal membuat pengajuan: '.$th->getMessage());

            return redirect()->route('submissions.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Submission $submission): Response
    {
        $submission->load(['resident', 'typeService', 'submittedBy', 'attachments.uploader']);

        return Inertia::render('pekets/submissions/show', [
            'submission' => $submission,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Submission $submission)
    {
        try {
            if ($submission->status !== 'pending') {
                return redirect()->route('submissions.index')->with('error', 'Hanya pengajuan dengan status Pending yang dapat dihapus.');
            }

            $submissionNumber = $submission->submission_number;

            // Delete physical files
            Storage::disk('public')->deleteDirectory("submissions/{$submissionNumber}");

            // Hard delete
            $submission->delete();

            return redirect()->route('submissions.index')->with('success', "Pengajuan {$submissionNumber} berhasil dihapus.");
        } catch (\Throwable $th) {
            Log::error('Gagal menghapus pengajuan: '.$th->getMessage());

            return redirect()->route('submissions.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Remove selected resources from storage.
     */
    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->input('ids');

            if (is_array($ids) && count($ids) > 0) {
                // Verify all are pending
                $pendingCount = Submission::whereIn('id', $ids)->where('status', 'pending')->count();
                if ($pendingCount !== count($ids)) {
                    return redirect()->route('submissions.index')->with('error', 'Hanya pengajuan dengan status Pending yang dapat dihapus.');
                }

                $submissions = Submission::whereIn('id', $ids)->get();
                foreach ($submissions as $submission) {
                    Storage::disk('public')->deleteDirectory("submissions/{$submission->submission_number}");
                    $submission->delete();
                }

                return redirect()->route('submissions.index')->with('success', 'Pengajuan yang dipilih berhasil dihapus.');
            }

            return redirect()->route('submissions.index')->with('error', 'Data tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Gagal bulk delete pengajuan: '.$e->getMessage());

            return redirect()->route('submissions.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }
}
