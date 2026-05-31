<?php

namespace App\Http\Controllers\Sekdes;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\TypeService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TypeServiceController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-type-services', only: ['index', 'show']),
            new Middleware('permission:c-type-services', only: ['create', 'store']),
            new Middleware('permission:u-type-services', only: ['edit', 'update']),
            new Middleware('permission:d-type-services', only: ['destroy', 'bulkDelete']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(ListingRequest $request): Response
    {
        // 1. Ambil query umum yang sudah divalidasi dan dinormalisasi oleh ListingRequest.
        $validated = $request->validated();

        // 2. Pisahkan query umum dari filter khusus halaman pengguna.
        $search = $validated['search'] ?? null;

        // 3. Simpan sort asli dari URL untuk props UI; null berarti dropdown tetap menampilkan placeholder.
        $status = $request->input('status');

        // 4. Daftar sort yang diizinkan. Key dipakai frontend, value dipakai query builder.
        $sort = $request->query('sort') ?? null;

        // 5. Resolve sort lewat whitelist; input tidak dikenal otomatis fallback ke default ListingRequest.
        if (! in_array($status, ['active', 'inactive'], true)) {
            $status = null;
        }

        // 6. Buat array sort yang valid untuk query builder.
        $sorts = [
            'created_desc' => ['created_at', 'desc'],
            'created_asc' => ['created_at', 'asc'],
            'updated_desc' => ['updated_at', 'desc'],
            'updated_asc' => ['updated_at', 'asc'],
            'name_asc' => ['service_name', 'asc'],
            'name_desc' => ['service_name', 'desc'],
        ];

        // 7. Resolve sort lewat whitelist; input tidak dikenal otomatis fallback ke default ListingRequest.
        [$sortColumn, $sortDirection] = $request->resolveSort($sorts);

        // 8. Query users dengan pencarian jika ada
        $typeServices = TypeService::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('service_code', 'like', $search.'%')
                        ->orWhere('service_name', 'like', $search.'%')
                        ->orWhere('description', 'like', $search.'%');
                });
            })
            ->when($status === 'active', function ($query) {
                $query->where('is_active', true);
            })
            ->when($status === 'inactive', function ($query) {
                $query->where('is_active', false);
            })
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($validated['entries'])
            ->onEachSide(0)
            ->appends($request->except(['page']));

        // 9. Render view
        return Inertia::render('sekdes/type-services/index', [
            'typeServices' => $typeServices,
            'i' => $request->startIndex(),
            'entries' => (int) $validated['entries'],
            'search' => $search,
            'sort' => $sort,
            'status' => $status,
            'hasFilter' => $request->hasFilter(['status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Not used as we use modals
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_code' => 'required|string|max:255|unique:type_services,service_code',
            'service_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'is_active' => 'required|boolean',
        ], [
            'service_code.required' => 'Kolom kode layanan wajib diisi.',
            'service_code.string' => 'Kolom kode layanan harus berupa string.',
            'service_code.max:255' => 'Kolom kode layanan tidak boleh lebih dari 255 karakter.',
            'service_code.unique' => 'Kode layanan sudah digunakan.',
            'service_name.required' => 'Kolom nama layanan wajib diisi.',
            'service_name.string' => 'Kolom nama layanan harus berupa string.',
            'service_name.max:255' => 'Kolom nama layanan tidak boleh lebih dari 255 karakter.',
            'description.string' => 'Kolom deskripsi harus berupa string.',
            'description.max:255' => 'Kolom deskripsi tidak boleh lebih dari 255 karakter.',
            'is_active.required' => 'Kolom status wajib diisi.',
            'is_active.boolean' => 'Kolom status harus berupa boolean.',
        ]);

        try {
            $typeService = new TypeService([
                'service_code' => $validated['service_code'],
                'service_name' => $validated['service_name'],
                'description' => $validated['description'],
                'is_active' => $validated['is_active'],
            ]);

            $typeService->save();

            return redirect()->route('type-services.index')->with('success', 'Data '.$typeService->service_name.' berhasil disimpan.');
        } catch (\Throwable $th) {
            // throw $th;
            Log::error('Gagal membuat jenis layanan: '.$th->getMessage());

            return redirect()->route('type-services.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(TypeService $typeService)
    {
        // Not used
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TypeService $typeService)
    {
        // Not used as we use modals
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TypeService $typeService)
    {
        $validated = $request->validate([
            'service_code' => 'required|string|max:255|unique:type_services,service_code,'.$typeService->id,
            'service_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ], [
            'service_code.required' => 'Kolom kode layanan wajib diisi.',
            'service_code.string' => 'Kolom kode layanan harus berupa string.',
            'service_code.max:255' => 'Kolom kode layanan tidak boleh lebih dari 255 karakter.',
            'service_code.unique' => 'Kode layanan sudah digunakan.',
            'service_name.required' => 'Kolom nama layanan wajib diisi.',
            'service_name.string' => 'Kolom nama layanan harus berupa string.',
            'service_name.max:255' => 'Kolom nama layanan tidak boleh lebih dari 255 karakter.',
            'description.string' => 'Kolom deskripsi harus berupa string.',
            'description.max:255' => 'Kolom deskripsi tidak boleh lebih dari 255 karakter.',
            'is_active.required' => 'Kolom status wajib diisi.',
            'is_active.boolean' => 'Kolom status harus berupa boolean.',
        ]);

        try {
            $typeService->update($validated);

            return redirect()->route('type-services.index')->with('success', 'Data '.$typeService->service_name.' berhasil diperbarui.');
        } catch (\Throwable $th) {
            // throw $th;
            Log::error('Gagal memperbarui jenis layanan: '.$th->getMessage());

            return redirect()->route('type-services.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TypeService $typeService)
    {
        if ($typeService) {
            /** @var TypeService $typeService */
            $typeService->delete(); // @phpstan-ignore-line

            return redirect()->route('type-services.index')->with('success', 'Data '.$typeService->service_name.' berhasil dihapus.');
        } else {
            return redirect()->route('type-services.index')->with('error', 'Data tidak ditemukan.');
        }
    }

    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->input('ids');

            if (is_array($ids) && count($ids) > 0) {
                // Gunakan get() lalu delete() per item agar Model Event terpicu
                // (whereIn()->delete() adalah query langsung, tidak memicu Event)
                /** @var Collection <int, TypeService> $typeServices */
                TypeService::whereIn('id', $ids, 'and', false)->get()->each(fn ($typeService) => $typeService->delete());

                return redirect()->route('type-services.index')
                    ->with('success', 'Data yang dipilih berhasil dihapus.');
            }

            return redirect()->route('type-services.index')->with('error', 'Data tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Gagal bulk delete jenis layanan: '.$e->getMessage());

            return redirect()->route('type-services.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }
}
