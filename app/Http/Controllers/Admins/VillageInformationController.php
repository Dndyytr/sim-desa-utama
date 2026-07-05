<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\VillageInformation;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class VillageInformationController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-village-informations', only: ['index', 'show']),
            new Middleware('permission:c-village-informations', only: ['create', 'store']),
            new Middleware('permission:u-village-informations', only: ['edit', 'update']),
            new Middleware('permission:d-village-informations', only: ['destroy', 'bulkDelete']),
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
        $sort = $request->query('sort') ?? null;

        if (! in_array($category, ['berita', 'pengumuman', 'info_desa'], true)) {
            $category = null;
        }

        if (! in_array($status, ['published', 'hidden', 'draft'], true)) {
            $status = null;
        }

        $sorts = [
            'created_desc' => ['created_at', 'desc'],
            'created_asc' => ['created_at', 'asc'],
            'updated_desc' => ['updated_at', 'desc'],
            'updated_asc' => ['updated_at', 'asc'],
            'title_asc' => ['title', 'asc'],
            'title_desc' => ['title', 'desc'],
        ];

        [$sortColumn, $sortDirection] = $request->resolveSort($sorts);

        $informations = VillageInformation::query()
            ->with('author')
            ->when($search, function ($query, $search) {
                // Search optimization: LIKE 'term%' (only trailing wildcard) to leverage index
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', $search.'%')
                        ->orWhere('content', 'like', $search.'%');
                });
            })
            ->when($category, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($validated['entries'])
            ->onEachSide(0)
            ->appends($request->except(['page']));

        return Inertia::render('admins/village-informations/index', [
            'informations' => $informations,
            'i' => $request->startIndex(),
            'entries' => (int) $validated['entries'],
            'search' => $search,
            'sort' => $sort,
            'category' => $category,
            'status' => $status,
            'hasFilter' => $request->hasFilter(['category', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admins/village-informations/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'required|in:berita,pengumuman,info_desa',
            'thumbnail' => 'nullable|image|max:2048|mimes:jpg,jpeg,png',
            'status' => 'required|in:published,hidden,draft',
            'published_at' => 'nullable|date',
        ], [
            'title.required' => 'Judul wajib diisi.',
            'title.max' => 'Judul maksimal 255 karakter.',
            'content.required' => 'Konten wajib diisi.',
            'category.required' => 'Kategori wajib dipilih.',
            'category.in' => 'Kategori tidak valid.',
            'thumbnail.image' => 'File harus berupa gambar.',
            'thumbnail.max' => 'Ukuran gambar maksimal 2MB.',
            'thumbnail.mimes' => 'Format gambar harus JPG, JPEG, atau PNG.',
            'status.required' => 'Status wajib dipilih.',
            'status.in' => 'Status tidak valid.',
        ]);

        try {
            $info = new VillageInformation;
            $info->title = $validated['title'];

            // Auto generate slug
            $slug = str($validated['title'])->slug();
            $originalSlug = $slug;
            $count = 1;
            while (VillageInformation::where('slug', $slug)->exists()) {
                $slug = $originalSlug.'-'.$count++;
            }
            $info->slug = $slug;

            $info->content = $validated['content'];
            $info->category = $validated['category'];
            $info->status = $validated['status'];

            if ($validated['status'] === 'published') {
                $info->published_at = $validated['published_at'] ?? now();
            } else {
                $info->published_at = null;
            }

            $info->created_by = auth()->id();

            if ($request->hasFile('thumbnail')) {
                $file = $request->file('thumbnail');
                $fileName = time().'_'.$file->getClientOriginalName();
                $filePath = $file->storeAs('village-informations', $fileName, 'public');
                $info->thumbnail = $filePath;
            }

            $info->save();

            return redirect()->route('village-informations.index')->with('success', 'Informasi Desa berhasil disimpan.');
        } catch (\Throwable $th) {
            Log::error('Gagal membuat informasi desa: '.$th->getMessage());

            return redirect()->back()->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(VillageInformation $villageInformation): Response
    {
        return Inertia::render('admins/village-informations/edit', [
            'information' => $villageInformation,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, VillageInformation $villageInformation)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'required|in:berita,pengumuman,info_desa',
            'thumbnail' => 'nullable|image|max:2048|mimes:jpg,jpeg,png',
            'status' => 'required|in:published,hidden,draft',
            'published_at' => 'nullable|date',
        ], [
            'title.required' => 'Judul wajib diisi.',
            'title.max' => 'Judul maksimal 255 karakter.',
            'content.required' => 'Konten wajib diisi.',
            'category.required' => 'Kategori wajib dipilih.',
            'category.in' => 'Kategori tidak valid.',
            'thumbnail.image' => 'File harus berupa gambar.',
            'thumbnail.max' => 'Ukuran gambar maksimal 2MB.',
            'thumbnail.mimes' => 'Format gambar harus JPG, JPEG, atau PNG.',
            'status.required' => 'Status wajib dipilih.',
            'status.in' => 'Status tidak valid.',
        ]);

        try {
            $villageInformation->title = $validated['title'];

            // Regenerate slug only if title changes
            if ($villageInformation->isDirty('title')) {
                $slug = str($validated['title'])->slug();
                $originalSlug = $slug;
                $count = 1;
                while (VillageInformation::where('slug', $slug)->where('id', '!=', $villageInformation->id)->exists()) {
                    $slug = $originalSlug.'-'.$count++;
                }
                $villageInformation->slug = $slug;
            }

            $villageInformation->content = $validated['content'];
            $villageInformation->category = $validated['category'];
            $villageInformation->status = $validated['status'];

            if ($validated['status'] === 'published') {
                $villageInformation->published_at = $validated['published_at'] ?? ($villageInformation->published_at ?? now());
            } else {
                $villageInformation->published_at = null;
            }

            if ($request->hasFile('thumbnail')) {
                // Delete old thumbnail if exists
                if ($villageInformation->thumbnail) {
                    Storage::disk('public')->delete($villageInformation->thumbnail);
                }

                $file = $request->file('thumbnail');
                $fileName = time().'_'.$file->getClientOriginalName();
                $filePath = $file->storeAs('village-informations', $fileName, 'public');
                $villageInformation->thumbnail = $filePath;
            }

            $villageInformation->save();

            return redirect()->route('village-informations.index')->with('success', 'Informasi Desa berhasil diperbarui.');
        } catch (\Throwable $th) {
            Log::error('Gagal memperbarui informasi desa: '.$th->getMessage());

            return redirect()->back()->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(VillageInformation $villageInformation)
    {
        try {
            // Keep the thumbnail since it's soft deleted
            $villageInformation->delete();

            return redirect()->route('village-informations.index')->with('success', 'Informasi Desa berhasil dihapus.');
        } catch (\Throwable $th) {
            Log::error('Gagal menghapus informasi desa: '.$th->getMessage());

            return redirect()->route('village-informations.index')->with('error', 'Oops, terjadi kesalahan!');
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
                VillageInformation::whereIn('id', $ids)->delete();

                return redirect()->route('village-informations.index')
                    ->with('success', 'Data informasi yang dipilih berhasil dihapus.');
            }

            return redirect()->route('village-informations.index')->with('error', 'Data tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Gagal bulk delete informasi desa: '.$e->getMessage());

            return redirect()->route('village-informations.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }
}
