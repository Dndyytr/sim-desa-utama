<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\Menu;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-permissions', only: ['index', 'show']),
            new Middleware('permission:c-permissions', only: ['create', 'store']),
            new Middleware('permission:u-permissions', only: ['edit', 'update']),
            new Middleware('permission:d-permissions', only: ['destroy', 'bulkDelete']),
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
        $sort = $request->query('sort') ?? null;

        // 4. Daftar sort yang diizinkan. Key dipakai frontend, value dipakai query builder.
        $sorts = [
            'created_desc' => ['created_at', 'desc'],
            'created_asc' => ['created_at', 'asc'],
            'updated_desc' => ['updated_at', 'desc'],
            'updated_asc' => ['updated_at', 'asc'],
            'name_asc' => ['name', 'asc'],
            'name_desc' => ['name', 'desc'],
        ];

        // 5. Resolve sort lewat whitelist; input tidak dikenal otomatis fallback ke default ListingRequest.
        [$sortColumn, $sortDirection] = $request->resolveSort($sorts);

        // Query permissions dengan pencarian jika ada
        $permissions = Permission::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhere('title', 'like', '%'.$search.'%')
                    ->orWhere('feature', 'like', '%'.$search.'%');
            })
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($validated['entries'])
            ->onEachSide(0)
            ->appends($request->except(['page']));

        $features = Menu::all();

        return Inertia::render('admins/permissions/index', [
            'permissions' => $permissions,
            'i' => $request->startIndex(),
            'entries' => (int) $validated['entries'],
            'search' => $search,
            'features' => $features,
            'sort' => $sort,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'name' => 'required|string|max:255|unique:permissions,name',
            'feature' => 'required|string|max:255|exists:menus,permission',
            'guard_name' => 'required|string|max:255',
        ], [
            'title.required' => 'Kolom judul wajib diisi.',
            'title.string' => 'Kolom judul harus berupa string.',
            'title.max:255' => 'Kolom judul tidak boleh lebih dari 255 karakter.',
            'name.required' => 'Kolom nama wajib diisi.',
            'name.string' => 'Kolom nama harus berupa string.',
            'name.max:255' => 'Kolom nama tidak boleh lebih dari 255 karakter.',
            'name.unique' => 'Nama sudah digunakan.',
            'feature.required' => 'Kolom fitur wajib diisi.',
            'feature.string' => 'Kolom fitur harus berupa string.',
            'feature.max:255' => 'Kolom fitur tidak boleh lebih dari 255 karakter.',
            'feature.exists' => 'Fitur tidak ditemukan.',
            'guard_name.required' => 'Kolom guard name wajib diisi.',
            'guard_name.string' => 'Kolom guard name harus berupa string.',
            'guard_name.max:255' => 'Kolom guard name tidak boleh lebih dari 255 karakter.',
        ]);

        try {
            $permission = new Permission([
                'title' => $validated['title'],
                'name' => $validated['name'],
                'feature' => $validated['feature'],
                'guard_name' => $validated['guard_name'],
            ]);

            $permission->save();

            return redirect()->route('permissions.index')->with('success', 'Data '.$validated['name'].' berhasil disimpan.');

        } catch (\Throwable $th) {
            // throw $th;
            Log::error('Gagal membuat hak akses: '.$th->getMessage());

            return redirect()->route('permissions.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'name' => 'required|string|max:255|unique:permissions,name,'.$permission->id,
            'feature' => 'required|string|max:255|exists:menus,permission',
            'guard_name' => 'required|string|max:255',
        ], [
            'title.required' => 'Kolom judul wajib diisi.',
            'title.string' => 'Kolom judul harus berupa string.',
            'title.max:255' => 'Kolom judul tidak boleh lebih dari 255 karakter.',
            'name.required' => 'Kolom nama wajib diisi.',
            'name.string' => 'Kolom nama harus berupa string.',
            'name.max:255' => 'Kolom nama tidak boleh lebih dari 255 karakter.',
            'name.unique' => 'Nama sudah digunakan.',
            'feature.required' => 'Kolom fitur wajib diisi.',
            'feature.string' => 'Kolom fitur harus berupa string.',
            'feature.max:255' => 'Kolom fitur tidak boleh lebih dari 255 karakter.',
            'feature.exists' => 'Fitur tidak ditemukan.',
            'guard_name.required' => 'Kolom guard name wajib diisi.',
            'guard_name.string' => 'Kolom guard name harus berupa string.',
            'guard_name.max:255' => 'Kolom guard name tidak boleh lebih dari 255 karakter.',
        ]);

        try {
            $input = $validated;
            $permission->update($input);

            return redirect()->route('permissions.index')->with('success', 'Data '.$validated['name'].' berhasil diperbarui.');
        } catch (\Throwable $th) {
            // throw $th;
            Log::error('Gagal memperbarui hak akses: '.$th->getMessage());

            return redirect()->route('permissions.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permission $permission)
    {
        if ($permission) {
            /** @var Permission $permission */
            $permission->delete(); // @phpstan-ignore-line

            return redirect()->route('permissions.index')->with('success', 'Data '.$permission->name.' berhasil dihapus.');
        } else {
            return redirect()->route('permissions.index')->with('error', 'Data tidak ditemukan.');
        }
    }

    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->input('ids');

            if (is_array($ids) && count($ids) > 0) {
                // Gunakan get() lalu delete() per item agar Model Event terpicu
                // (whereIn()->delete() adalah query langsung, tidak memicu Event)
                /** @var Collection <int, Permission> $permissions */
                Permission::whereIn('id', $ids, 'and', false)->get()->each(fn ($permission) => $permission->delete());

                return redirect()->route('permissions.index')
                    ->with('success', 'Data yang dipilih berhasil dihapus.');
            }

            return redirect()->route('permissions.index')->with('error', 'Data tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Gagal bulk delete permission: '.$e->getMessage());

            return redirect()->route('permissions.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }
}
