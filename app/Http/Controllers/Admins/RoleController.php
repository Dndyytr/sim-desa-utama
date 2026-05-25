<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\Menu;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RoleController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-roles', only: ['index', 'show']),
            new Middleware('permission:c-roles', only: ['create', 'store']),
            new Middleware('permission:u-roles', only: ['edit', 'update']),
            new Middleware('permission:d-roles', only: ['destroy', 'bulkDelete']),
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

        // Query roles dengan pencarian jika ada
        $roles = Role::query()
            ->withCount('permissions as features_count')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', $search.'%')
                    ->orWhere('description', 'like', $search.'%');
            })
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($validated['entries'])
            ->onEachSide(0)
            ->appends($request->except(['page']));

        return Inertia::render('admins/roles/index', [
            'roles' => $roles,
            'i' => $request->startIndex(),
            'entries' => (int) $validated['entries'],
            'search' => $search,
            'sort' => $sort,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $features = Menu::with('permissions')->get();

        return Inertia::render('admins/roles/create', [
            'features' => $features,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'description' => 'required|string|max:255',
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,id',
        ], [
            'name.required' => 'Kolom nama wajib diisi.',
            'name.string' => 'Kolom nama harus berupa string.',
            'name.max:255' => 'Kolom nama tidak boleh lebih dari 255 karakter.',
            'name.unique' => 'Nama sudah digunakan.',
            'description.required' => 'Kolom deskripsi wajib diisi.',
            'description.string' => 'Kolom deskripsi harus berupa string.',
            'description.max:255' => 'Kolom deskripsi tidak boleh lebih dari 255 karakter.',
            'permissions.required' => 'Pilih setidaknya satu izin untuk peran ini.',
            'permissions.array' => 'Format izin tidak valid.',
            'permissions.min:1' => 'Pilih setidaknya satu izin untuk peran ini.',
            'permissions.*.exists' => 'Izin yang dipilih tidak valid.',
        ]);

        DB::beginTransaction();

        try {
            $role = Role::create(['name' => $validated['name'], 'description' => $validated['description']]);

            // Konversi permission IDs ke integer
            $permissionIds = array_map('intval', $validated['permissions']);

            // Sync permissions ke role
            $role->syncPermissions($permissionIds);

            DB::commit();

            return redirect()->route('roles.index')->with('success', 'Data '.$role->name.' berhasil disimpan.');
        } catch (\Throwable $th) {
            DB::rollback();
            Log::error('Gagal membuat peran: '.$th->getMessage());

            return redirect()->route('roles.index')->with('error', 'Oops, terjadi kesalahan!');
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
    public function edit(Role $role)
    {
        $rolePermissions = $role->permissions()->pluck('id')->all();
        $features = Menu::with('permissions')->get();

        return Inertia::render('admins/roles/edit', [
            'role' => $role,
            'features' => $features,
            'rolePermissions' => (array) $rolePermissions,
            'breadcrumbs' => [
                ['title' => 'Edit Peran', 'href' => route('roles.edit', $role->id)],
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,'.$role->id,
            'description' => 'required|string|max:255',
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,id',
        ], [
            'name.required' => 'Kolom nama wajib diisi.',
            'name.string' => 'Kolom nama harus berupa string.',
            'name.max:255' => 'Kolom nama tidak boleh lebih dari 255 karakter.',
            'name.unique' => 'Nama sudah digunakan.',
            'description.required' => 'Kolom deskripsi wajib diisi.',
            'description.string' => 'Kolom deskripsi harus berupa string.',
            'description.max:255' => 'Kolom deskripsi tidak boleh lebih dari 255 karakter.',
            'permissions.required' => 'Pilih setidaknya satu izin untuk peran ini.',
            'permissions.array' => 'Format izin tidak valid.',
            'permissions.min:1' => 'Pilih setidaknya satu izin untuk peran ini.',
            'permissions.*.exists' => 'Izin yang dipilih tidak valid.',
        ]);

        DB::beginTransaction();

        try {
            $role->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
            ]);

            $permissionIds = array_map('intval', $validated['permissions']);
            $role->syncPermissions($permissionIds);

            DB::commit();

            return redirect()->route('roles.index')->with('success', 'Data '.$role->name.' berhasil diperbarui.');
        } catch (\Throwable $th) {
            DB::rollback();
            Log::error('Gagal memperbarui peran: '.$th->getMessage());

            return redirect()->route('roles.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        if ($role) {
            /** @var Role $role */
            $role->delete(); // @phpstan-ignore-line

            return redirect()->route('roles.index')->with('success', 'Data '.$role->name.' berhasil dihapus.');
        } else {
            return redirect()->route('roles.index')->with('error', 'Data tidak ditemukan.');
        }
    }

    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->input('ids');

            if (is_array($ids) && count($ids) > 0) {
                // Gunakan get() lalu delete() per item agar Model Event terpicu
                // (whereIn()->delete() adalah query langsung, tidak memicu Event)
                /** @var Collection <int, Role> $roles */
                Role::whereIn('id', $ids, 'and', false)->get()->each(fn ($role) => $role->delete());

                return redirect()->route('roles.index')
                    ->with('success', 'Data yang dipilih berhasil dihapus.');
            }

            return redirect()->route('roles.index')->with('error', 'Data tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Gagal bulk delete role: '.$e->getMessage());

            return redirect()->route('roles.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }
}
