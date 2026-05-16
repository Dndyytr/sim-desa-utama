<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $page = $request->input('page', 1);
        $entries = $request->input('entries', 10);
        $search = $request->input('search');

        $users = User::with('roles')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            })
            ->paginate($entries)
            ->onEachSide(0)
            ->appends($request->query());

        $i = ($page - 1) * $entries;

        return Inertia::render('admins/users/index', [
            'users' => $users,
            'i' => $i,
            'entries' => (int) $entries,
            'search' => $search,
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
                ->with('success', 'Data '.$user->name.' berhasil disimpan.');
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
            $user->delete();

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
                User::whereIn('id', $ids)->get()->each->delete();

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
