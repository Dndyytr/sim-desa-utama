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

class MenuController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-menus', only: ['index', 'show']),
            new Middleware('permission:c-menus', only: ['create', 'store']),
            new Middleware('permission:u-menus', only: ['edit', 'update']),
            new Middleware('permission:d-menus', only: ['destroy', 'bulkDelete']),
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
            'name_asc' => ['title', 'asc'],
            'name_desc' => ['title', 'desc'],
        ];

        // 5. Resolve sort lewat whitelist; input tidak dikenal otomatis fallback ke default ListingRequest.
        [$sortColumn, $sortDirection] = $request->resolveSort($sorts);

        // Query users dengan pencarian jika ada
        $menus = Menu::query()
            ->when($search, function ($query, $search) {
                $query->whereFullText(['url', 'tag', 'permission'], $search)
                    ->orWhere('status', 'like', $search.'%')
                    ->orWhere('title', 'like', $search.'%')
                    ->orWhere('icon', 'like', $search.'%');
            })
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($validated['entries'])
            ->onEachSide(0)
            ->appends($request->except(['page']));

        $parents = Menu::all();

        return Inertia::render('admins/menus/index', [
            'menus' => $menus,
            'i' => $request->startIndex(),
            'entries' => (int) $validated['entries'],
            'search' => $search,
            'sort' => $sort,
            'parents' => $parents,
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
            'url' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'tag' => 'nullable|string|max:255',
            'permission' => 'nullable|string|max:255',
            'status' => 'required|in:enabled,disabled',
            'parent_id' => 'nullable|integer|exists:menus,id',
            'locale' => 'required|string|max:10',
        ], [
            'title.required' => 'Kolom judul wajib diisi.',
            'title.string' => 'Kolom judul harus berupa string.',
            'title.max:255' => 'Kolom judul tidak boleh lebih dari 255 karakter.',
            'url.string' => 'Kolom URL harus berupa string.',
            'url.max:255' => 'Kolom URL tidak boleh lebih dari 255 karakter.',
            'icon.string' => 'Kolom ikon harus berupa string.',
            'icon.max:255' => 'Kolom ikon tidak boleh lebih dari 255 karakter.',
            'tag.string' => 'Kolom tag harus berupa string.',
            'tag.max:255' => 'Kolom tag tidak boleh lebih dari 255 karakter.',
            'permission.string' => 'Kolom izin harus berupa string.',
            'permission.max:255' => 'Kolom izin tidak boleh lebih dari 255 karakter.',
            'status.required' => 'Kolom status wajib diisi.',
            'status.in' => 'Kolom status harus bernilai "enabled" atau "disabled".',
            'parent_id.integer' => 'Kolom parent_id harus berupa integer.',
            'parent_id.exists' => 'Menu induk yang dipilih tidak valid.',
            'locale.required' => 'Kolom locale wajib diisi.',
            'locale.string' => 'Kolom locale harus berupa string.',
            'locale.max:10' => 'Kolom locale tidak boleh lebih dari 10 karakter.',
        ]);

        try {
            $menu = new Menu([
                'title' => $validated['title'],
                'url' => $validated['url'],
                'icon' => $validated['icon'],
                'parent_id' => $validated['parent_id'],
                'tag' => $validated['tag'],
                'permission' => $validated['permission'],
                'status' => $validated['status'],
                'locale' => $validated['locale'],
            ]);

            $menu->save();

            return redirect()->route('menus.index')->with('success', 'Data '.$menu->title.' berhasil disimpan.');
        } catch (\Throwable $th) {
            // throw $th;
            Log::error('Gagal membuat menu: '.$th->getMessage());

            return redirect()->route('menus.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Menu $menu)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Menu $menu)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'tag' => 'nullable|string|max:255',
            'permission' => 'nullable|string|max:255',
            'status' => 'required|in:enabled,disabled',
            'parent_id' => 'nullable|integer|exists:menus,id',
            'locale' => 'required|string|max:10',
        ], [
            'title.required' => 'Kolom judul wajib diisi.',
            'title.string' => 'Kolom judul harus berupa string.',
            'title.max:255' => 'Kolom judul tidak boleh lebih dari 255 karakter.',
            'url.string' => 'Kolom URL harus berupa string.',
            'url.max:255' => 'Kolom URL tidak boleh lebih dari 255 karakter.',
            'icon.string' => 'Kolom ikon harus berupa string.',
            'icon.max:255' => 'Kolom ikon tidak boleh lebih dari 255 karakter.',
            'tag.string' => 'Kolom tag harus berupa string.',
            'tag.max:255' => 'Kolom tag tidak boleh lebih dari 255 karakter.',
            'permission.string' => 'Kolom izin harus berupa string.',
            'permission.max:255' => 'Kolom izin tidak boleh lebih dari 255 karakter.',
            'status.required' => 'Kolom status wajib diisi.',
            'status.in' => 'Kolom status harus bernilai "enabled" atau "disabled".',
            'parent_id.integer' => 'Kolom parent_id harus berupa integer.',
            'parent_id.exists' => 'Menu induk yang dipilih tidak valid.',
            'locale.required' => 'Kolom locale wajib diisi.',
            'locale.string' => 'Kolom locale harus berupa string.',
            'locale.max:10' => 'Kolom locale tidak boleh lebih dari 10 karakter.',
        ]);

        try {
            $menu->update($validated);

            return redirect()->route('menus.index')->with('success', 'Data '.$menu->title.' berhasil diperbarui.');
        } catch (\Throwable $th) {
            // throw $th;
            Log::error('Gagal memperbarui menu: '.$th->getMessage());

            return redirect()->route('menus.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Menu $menu)
    {
        if ($menu) {
            /** @var Menu $menu */
            $menu->delete(); // @phpstan-ignore-line

            return redirect()->route('menus.index')->with('success', 'Data '.$menu->title.' berhasil dihapus.');
        } else {
            return redirect()->route('menus.index')->with('error', 'Data tidak ditemukan.');
        }
    }

    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->input('ids');

            if (is_array($ids) && count($ids) > 0) {
                // Gunakan get() lalu delete() per item agar Model Event terpicu
                // (whereIn()->delete() adalah query langsung, tidak memicu Event)
                /** @var Collection <int, Menu> $menus */
                Menu::whereIn('id', $ids, 'and', false)->get()->each(fn ($menu) => $menu->delete());

                return redirect()->route('menus.index')
                    ->with('success', 'Data yang dipilih berhasil dihapus.');
            }

            return redirect()->route('menus.index')->with('error', 'Data tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Gagal bulk delete menu: '.$e->getMessage());

            return redirect()->route('menus.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }
}
