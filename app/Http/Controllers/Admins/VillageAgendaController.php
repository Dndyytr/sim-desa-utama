<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\VillageAgenda;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class VillageAgendaController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-village-agendas', only: ['index', 'show']),
            new Middleware('permission:c-village-agendas', only: ['create', 'store']),
            new Middleware('permission:u-village-agendas', only: ['edit', 'update']),
            new Middleware('permission:d-village-agendas', only: ['destroy', 'bulkDelete']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(ListingRequest $request): Response
    {
        $validated = $request->validated();
        $search = $validated['search'] ?? null;
        $category = $request->query('category') ?? null;
        $status = $request->query('status') ?? null;
        $month = $request->query('month') ?? null;
        $year = $request->query('year') ?? null;
        $sort = $request->query('sort') ?? null;

        if (! in_array($category, ['kegiatan', 'rapat', 'musyawarah', 'pelayanan', 'sosialisasi', 'pembangunan', 'lainnya'], true)) {
            $category = null;
        }

        if (! in_array($status, ['draft', 'published', 'unpublished', 'completed'], true)) {
            $status = null;
        }

        if ($month && (! is_numeric($month) || $month < 1 || $month > 12)) {
            $month = null;
        }

        if ($year && (! is_numeric($year) || strlen($year) !== 4)) {
            $year = null;
        }

        $sorts = [
            'start_date_asc' => ['start_date', 'asc'],
            'start_date_desc' => ['start_date', 'desc'],
            'created_desc' => ['created_at', 'desc'],
            'created_asc' => ['created_at', 'asc'],
            'title_asc' => ['title', 'asc'],
            'title_desc' => ['title', 'desc'],
        ];

        [$sortColumn, $sortDirection] = $request->resolveSort($sorts);

        // Auto update agenda status if start_date/end_date is passed and status is published
        // Let's do a quick update check (Completed status logic)
        VillageAgenda::where('status', 'published')
            ->where('end_date', '<', now()->toDateString())
            ->update(['status' => 'completed']);

        $agendas = VillageAgenda::query()
            ->with('author')
            ->when($search, function ($query, $search) {
                // Search optimization: LIKE 'term%' (only trailing wildcard) to leverage index
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', $search.'%')
                        ->orWhere('location', 'like', $search.'%');
                });
            })
            ->when($category, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($month, function ($query, $month) {
                $query->whereMonth('start_date', $month);
            })
            ->when($year, function ($query, $year) {
                $query->whereYear('start_date', $year);
            })
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($validated['entries'])
            ->onEachSide(0)
            ->appends($request->except(['page']));

        return Inertia::render('admins/village-agendas/index', [
            'agendas' => $agendas,
            'i' => $request->startIndex(),
            'entries' => (int) $validated['entries'],
            'search' => $search,
            'sort' => $sort,
            'category' => $category,
            'status' => $status,
            'month' => $month,
            'year' => $year,
            'hasFilter' => $request->hasFilter(['category', 'status', 'month', 'year']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admins/village-agendas/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:kegiatan,rapat,musyawarah,pelayanan,sosialisasi,pembangunan,lainnya',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'location' => 'required|string|max:255',
            'address' => 'nullable|string',
            'poster' => 'nullable|image|max:2048|mimes:jpg,jpeg,png',
            'attachment' => 'nullable|file|max:5120|mimes:pdf,doc,docx,xls,xlsx,zip',
            'status' => 'required|in:draft,published,unpublished,completed',
        ];

        $messages = [
            'title.required' => 'Judul agenda wajib diisi.',
            'title.max' => 'Judul agenda maksimal 255 karakter.',
            'description.required' => 'Deskripsi agenda wajib diisi.',
            'category.required' => 'Kategori wajib dipilih.',
            'category.in' => 'Kategori tidak valid.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date' => 'Format tanggal mulai tidak valid.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.date' => 'Format tanggal selesai tidak valid.',
            'end_date.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
            'start_time.required' => 'Waktu mulai wajib diisi.',
            'end_time.required' => 'Waktu selesai wajib diisi.',
            'location.required' => 'Lokasi wajib diisi.',
            'location.max' => 'Lokasi maksimal 255 karakter.',
            'poster.image' => 'Poster harus berupa gambar.',
            'poster.max' => 'Ukuran poster maksimal 2MB.',
            'poster.mimes' => 'Format poster harus JPG, JPEG, atau PNG.',
            'attachment.file' => 'File lampiran tidak valid.',
            'attachment.max' => 'Ukuran lampiran maksimal 5MB.',
            'attachment.mimes' => 'Format lampiran harus PDF, DOC, DOCX, XLS, XLSX, atau ZIP.',
            'status.required' => 'Status wajib dipilih.',
            'status.in' => 'Status tidak valid.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        $validator->after(function ($validator) use ($request) {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            $startTime = $request->input('start_time');
            $endTime = $request->input('end_time');

            if ($startDate && $endDate && $startDate === $endDate) {
                if ($startTime && $endTime && strtotime($endTime) <= strtotime($startTime)) {
                    $validator->errors()->add('end_time', 'Waktu selesai harus lebih lambat dari waktu mulai.');
                }
            }
        });

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        try {
            $agenda = new VillageAgenda;
            $agenda->title = $validated['title'];

            // Auto generate slug
            $slug = str($validated['title'])->slug();
            $originalSlug = $slug;
            $count = 1;
            while (VillageAgenda::where('slug', $slug)->exists()) {
                $slug = $originalSlug.'-'.$count++;
            }
            $agenda->slug = $slug;

            $agenda->description = $validated['description'];
            $agenda->category = $validated['category'];
            $agenda->start_date = $validated['start_date'];
            $agenda->end_date = $validated['end_date'];
            $agenda->start_time = $validated['start_time'];
            $agenda->end_time = $validated['end_time'];
            $agenda->location = $validated['location'];
            $agenda->address = $validated['address'] ?? null;
            $agenda->status = $validated['status'];
            $agenda->created_by = auth()->id();

            if ($validated['status'] === 'published') {
                $agenda->published_at = now();
            }

            if ($request->hasFile('poster')) {
                $file = $request->file('poster');
                $fileName = time().'_'.$file->getClientOriginalName();
                $filePath = $file->storeAs('village-agendas/posters', $fileName, 'public');
                $agenda->poster = $filePath;
            }

            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $fileName = time().'_'.$file->getClientOriginalName();
                $filePath = $file->storeAs('village-agendas/attachments', $fileName, 'public');
                $agenda->attachment = $filePath;
            }

            $agenda->save();

            return redirect()->route('village-agendas.index')->with('success', 'Agenda desa berhasil disimpan.');
        } catch (\Throwable $th) {
            Log::error('Gagal membuat agenda desa: '.$th->getMessage());

            return redirect()->back()->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(VillageAgenda $villageAgenda): Response
    {
        return Inertia::render('admins/village-agendas/edit', [
            'agenda' => $villageAgenda,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, VillageAgenda $villageAgenda)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:kegiatan,rapat,musyawarah,pelayanan,sosialisasi,pembangunan,lainnya',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'location' => 'required|string|max:255',
            'address' => 'nullable|string',
            'poster' => 'nullable|image|max:2048|mimes:jpg,jpeg,png',
            'attachment' => 'nullable|file|max:5120|mimes:pdf,doc,docx,xls,xlsx,zip',
            'status' => 'required|in:draft,published,unpublished,completed',
        ];

        $messages = [
            'title.required' => 'Judul agenda wajib diisi.',
            'title.max' => 'Judul agenda maksimal 255 karakter.',
            'description.required' => 'Deskripsi agenda wajib diisi.',
            'category.required' => 'Kategori wajib dipilih.',
            'category.in' => 'Kategori tidak valid.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date' => 'Format tanggal mulai tidak valid.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.date' => 'Format tanggal selesai tidak valid.',
            'end_date.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
            'start_time.required' => 'Waktu mulai wajib diisi.',
            'end_time.required' => 'Waktu selesai wajib diisi.',
            'location.required' => 'Lokasi wajib diisi.',
            'location.max' => 'Lokasi maksimal 255 karakter.',
            'poster.image' => 'Poster harus berupa gambar.',
            'poster.max' => 'Ukuran poster maksimal 2MB.',
            'poster.mimes' => 'Format poster harus JPG, JPEG, atau PNG.',
            'attachment.file' => 'File lampiran tidak valid.',
            'attachment.max' => 'Ukuran lampiran maksimal 5MB.',
            'attachment.mimes' => 'Format lampiran harus PDF, DOC, DOCX, XLS, XLSX, atau ZIP.',
            'status.required' => 'Status wajib dipilih.',
            'status.in' => 'Status tidak valid.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        $validator->after(function ($validator) use ($request) {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            $startTime = $request->input('start_time');
            $endTime = $request->input('end_time');

            if ($startDate && $endDate && $startDate === $endDate) {
                if ($startTime && $endTime && strtotime($endTime) <= strtotime($startTime)) {
                    $validator->errors()->add('end_time', 'Waktu selesai harus lebih lambat dari waktu mulai.');
                }
            }
        });

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        try {
            $villageAgenda->title = $validated['title'];

            if ($villageAgenda->isDirty('title')) {
                $slug = str($validated['title'])->slug();
                $originalSlug = $slug;
                $count = 1;
                while (VillageAgenda::where('slug', $slug)->where('id', '!=', $villageAgenda->id)->exists()) {
                    $slug = $originalSlug.'-'.$count++;
                }
                $villageAgenda->slug = $slug;
            }

            $villageAgenda->description = $validated['description'];
            $villageAgenda->category = $validated['category'];
            $villageAgenda->start_date = $validated['start_date'];
            $villageAgenda->end_date = $validated['end_date'];
            $villageAgenda->start_time = $validated['start_time'];
            $villageAgenda->end_time = $validated['end_time'];
            $villageAgenda->location = $validated['location'];
            $villageAgenda->address = $validated['address'] ?? null;
            $villageAgenda->status = $validated['status'];

            if ($validated['status'] === 'published' && ! $villageAgenda->published_at) {
                $villageAgenda->published_at = now();
            } elseif ($validated['status'] !== 'published') {
                $villageAgenda->published_at = null;
            }

            if ($request->hasFile('poster')) {
                if ($villageAgenda->poster) {
                    Storage::disk('public')->delete($villageAgenda->poster);
                }
                $file = $request->file('poster');
                $fileName = time().'_'.$file->getClientOriginalName();
                $filePath = $file->storeAs('village-agendas/posters', $fileName, 'public');
                $villageAgenda->poster = $filePath;
            }

            if ($request->hasFile('attachment')) {
                if ($villageAgenda->attachment) {
                    Storage::disk('public')->delete($villageAgenda->attachment);
                }
                $file = $request->file('attachment');
                $fileName = time().'_'.$file->getClientOriginalName();
                $filePath = $file->storeAs('village-agendas/attachments', $fileName, 'public');
                $villageAgenda->attachment = $filePath;
            }

            $villageAgenda->save();

            return redirect()->route('village-agendas.index')->with('success', 'Agenda desa berhasil diperbarui.');
        } catch (\Throwable $th) {
            Log::error('Gagal memperbarui agenda desa: '.$th->getMessage());

            return redirect()->back()->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(VillageAgenda $villageAgenda)
    {
        try {
            $villageAgenda->delete();

            return redirect()->route('village-agendas.index')->with('success', 'Agenda desa berhasil dihapus.');
        } catch (\Throwable $th) {
            Log::error('Gagal menghapus agenda desa: '.$th->getMessage());

            return redirect()->route('village-agendas.index')->with('error', 'Oops, terjadi kesalahan!');
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
                VillageAgenda::whereIn('id', $ids)->delete();

                return redirect()->route('village-agendas.index')
                    ->with('success', 'Data agenda yang dipilih berhasil dihapus.');
            }

            return redirect()->route('village-agendas.index')->with('error', 'Data tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Gagal bulk delete agenda desa: '.$e->getMessage());

            return redirect()->route('village-agendas.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }
}
