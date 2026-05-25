<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-users', only: ['index', 'show']),
            new Middleware('permission:c-users', only: ['create', 'store']),
            new Middleware('permission:u-users', only: ['edit', 'update']),
            new Middleware('permission:d-users', only: ['destroy', 'bulkDelete']),
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
        // $role = $request->input('role');
        $verified = $request->input('verified');

        // 3. Simpan sort asli dari URL untuk props UI; null berarti dropdown tetap menampilkan placeholder.
        $sort = $request->query('sort') ?? null;

        // 4. Batasi value filter status agar hanya menerima opsi yang didukung.
        if (! in_array($verified, ['verified', 'unverified'], true)) {
            $verified = null;
        }

        // 5. Role dipakai sebagai id, jadi abaikan input kosong/non-numeric sebelum masuk ke query relasi.
        // if ($role !== null && $role !== '' && !ctype_digit((string) $role)) {
        //     $role = null;
        // }

        // 6. Daftar sort yang diizinkan. Key dipakai frontend, value dipakai query builder.
        $sorts = [
            'created_desc' => ['created_at', 'desc'],
            'created_asc' => ['created_at', 'asc'],
            'updated_desc' => ['updated_at', 'desc'],
            'updated_asc' => ['updated_at', 'asc'],
            'name_asc' => ['name', 'asc'],
            'name_desc' => ['name', 'desc'],
        ];

        // 7. Resolve sort lewat whitelist; input tidak dikenal otomatis fallback ke default ListingRequest.
        [$sortColumn, $sortDirection] = $request->resolveSort($sorts);

        // 8. Susun query utama: eager load role, terapkan search/filter, lalu urutkan dan paginate.
        $users = User::with('roles')
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%')
                        ->orWhereHas('roles', function ($query) use ($search) {
                            $query->where('name', 'like', '%'.$search.'%');
                        });
                });
            })
            // ->when($role, function ($query, $role) {
            //     $query->whereHas('roles', function ($query) use ($role) {
            //         $query->whereKey($role);
            //     });
            // })
            ->when($verified === 'verified', function ($query) {
                $query->whereNotNull('email_verified_at');
            })
            ->when($verified === 'unverified', function ($query) {
                $query->whereNull('email_verified_at');
            })
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($validated['entries'])
            ->onEachSide(0)
            ->appends($request->except(['page']));

        // 9. Ambil daftar role untuk opsi filter peran di dropdown.
        $roles = Role::orderBy('name')->get(['id', 'name']);

        // 10. Kirim data tabel, state query, dan metadata UI ke halaman Inertia.
        return Inertia::render('admins/users/index', [
            'users' => $users,
            'roles' => $roles,
            'i' => $request->startIndex(),
            'entries' => (int) $validated['entries'],
            'search' => $search,
            'sort' => $sort,
            // 'role' => $role,
            'verified' => $verified,
            'hasFilter' => $request->hasFilter(['role', 'verified']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::all();

        return Inertia::render('admins/users/create', ['roles' => $roles]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'required|array',
            'password_confirmation' => 'required|string|same:password',
        ], [
            'name.required' => 'Kolom nama wajib diisi.',
            'name.string' => 'Kolom nama harus berupa string.',
            'name.max:255' => 'Kolom nama tidak boleh lebih dari 255 karakter.',
            'email.required' => 'Kolom email wajib diisi.',
            'email.string' => 'Kolom email harus berupa string.',
            'email.max:255' => 'Kolom email tidak boleh lebih dari 255 karakter.',
            'email.email' => 'Kolom email harus berupa alamat email yang valid.',
            'email.unique' => 'Email sudah digunakan.',
            'password.string' => 'Kolom password harus berupa string.',
            'password.required' => 'Kolom password wajib diisi.',
            'password.min:8' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'password_confirmation.same' => 'Konfirmasi password tidak cocok.',
            'password_confirmation.required' => 'Kolom konfirmasi password wajib diisi.',
            'password_confirmation.string' => 'Kolom konfirmasi password harus berupa string.',
            'roles.required' => 'Kolom peran wajib diisi.',
            'roles.array' => 'Kolom peran harus berupa array.',
        ]);

        DB::beginTransaction();

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $user->syncRoles($validated['roles']);

            DB::commit();

            return redirect()->route('users.index')
                ->with(
                    'success',
                    'Data '.$user->name.' berhasil disimpan.'
                );
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('Gagal membuat user: '.$th->getMessage());

            return redirect()->route('users.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $roles = Role::all();
        $userRoles = $user->roles->pluck('name')->toArray();

        return Inertia::render('admins/users/edit', [
            'user' => $user,
            'roles' => $roles,
            'userRoles' => $userRoles,
            'breadcrumbs' => [
                ['title' => 'Edit Pengguna', 'href' => route('users.edit', $user->id)],
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'roles' => 'required|array',
            'password_confirmation' => 'nullable|string|same:password',
        ], [
            'name.required' => 'Kolom nama wajib diisi.',
            'name.string' => 'Kolom nama harus berupa string.',
            'name.max:255' => 'Kolom nama tidak boleh lebih dari 255 karakter.',
            'email.required' => 'Kolom email wajib diisi.',
            'email.string' => 'Kolom email harus berupa string.',
            'email.max:255' => 'Kolom email tidak boleh lebih dari 255 karakter.',
            'email.email' => 'Kolom email harus berupa alamat email yang valid.',
            'email.unique' => 'Email sudah digunakan.',
            'password.string' => 'Kolom password harus berupa string.',
            'password.required' => 'Kolom password wajib diisi.',
            'password.min:8' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'password_confirmation.same' => 'Konfirmasi password tidak cocok.',
            'password_confirmation.required' => 'Kolom konfirmasi password wajib diisi.',
            'password_confirmation.string' => 'Kolom konfirmasi password harus berupa string.',
            'roles.required' => 'Kolom peran wajib diisi.',
            'roles.array' => 'Kolom peran harus berupa array.',
        ]);

        DB::beginTransaction();

        try {
            $input = $validated;

            if ($request->filled('password')) {
                $input['password'] = Hash::make($input['password']);
            } else {
                $input = Arr::except($input, ['password']);
            }

            $user->update($input);

            // Hapus role lama dan assign role baru
            DB::table('model_has_roles')->where('model_id', $user->id)->delete();
            $user->syncRoles($validated['roles']);

            DB::commit();

            return redirect()->route('users.index')
                ->with('success', 'Data '.$user->name.' berhasil diperbarui.');
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('Gagal memperbarui user: '.$th->getMessage());

            return redirect()->route('users.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        if ($user) {
            /** @var Model $user */
            $user->delete(); // @phpstan-ignore-line

            return redirect()->route('users.index')->with('success', 'Data '.$user->name.' berhasil dihapus.');
        } else {
            return redirect()->route('users.index')->with('error', 'Data tidak ditemukan.');
        }
    }

    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->input('ids');

            if (is_array($ids) && count($ids) > 0) {
                // Gunakan get() lalu delete() per item agar Model Event terpicu
                // (whereIn()->delete() adalah query langsung, tidak memicu Event)
                /** @var Collection<int, User> $users */
                User::whereIn('id', $ids, 'and', false)->get()->each(fn ($user) => $user->delete());

                return redirect()->route('users.index')
                    ->with('success', 'Data yang dipilih berhasil dihapus.');
            }

            return redirect()->route('users.index')->with('error', 'Data tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Gagal bulk delete user: '.$e->getMessage());

            return redirect()->route('users.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }
}
