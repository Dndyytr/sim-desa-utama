<?php

namespace App\Http\Controllers\Sekdes;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ResidentController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-residents', only: ['index', 'show']),
            new Middleware('permission:c-residents', only: ['create', 'store']),
            new Middleware('permission:u-residents', only: ['edit', 'update']),
            new Middleware('permission:d-residents', only: ['destroy', 'bulkDelete']),
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
        $sort = $request->query('sort') ?? null;

        if (! in_array($status, ['active', 'inactive'], true)) {
            $status = null;
        }

        $sorts = [
            'created_desc' => ['created_at', 'desc'],
            'created_asc' => ['created_at', 'asc'],
            'updated_desc' => ['updated_at', 'desc'],
            'updated_asc' => ['updated_at', 'asc'],
            'name_asc' => ['name', 'asc'],
            'name_desc' => ['name', 'desc'],
            'nik_asc' => ['nik', 'asc'],
            'nik_desc' => ['nik', 'desc'],
        ];

        [$sortColumn, $sortDirection] = $request->resolveSort($sorts);

        $residents = Resident::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    // Search optimization: LIKE 'term%' (only trailing wildcard) to leverage index
                    $q->whereFullText('no_kk', 'name', 'birth_place', 'religion', 'marital_status', 'occupation', 'address', $search.'%')
                        ->orWhere('nik', 'like', $search.'%')
                        ->orWhere('birth_date', 'like', $search.'%');
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

        return Inertia::render('sekdes/residents/index', [
            'residents' => $residents,
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
        return Inertia::render('sekdes/residents/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nik' => 'required|string|size:16|unique:residents,nik',
            'no_kk' => 'required|string|size:16',
            'name' => 'required|string|max:255',
            'birth_place' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'religion' => 'required|string|max:255',
            'marital_status' => 'required|string|max:255',
            'occupation' => 'required|string|max:255',
            'address' => 'required|string',
            'is_active' => 'required|boolean',
        ], [
            'nik.required' => 'Kolom NIK wajib diisi.',
            'nik.string' => 'Kolom NIK harus berupa string.',
            'nik.size' => 'Kolom NIK harus tepat 16 karakter.',
            'nik.unique' => 'NIK sudah terdaftar.',
            'no_kk.required' => 'Kolom Nomor KK wajib diisi.',
            'no_kk.string' => 'Kolom Nomor KK harus berupa string.',
            'no_kk.size' => 'Kolom Nomor KK harus tepat 16 karakter.',
            'name.required' => 'Kolom Nama Lengkap wajib diisi.',
            'name.string' => 'Kolom Nama Lengkap harus berupa string.',
            'name.max' => 'Kolom Nama Lengkap tidak boleh lebih dari 255 karakter.',
            'birth_place.required' => 'Kolom Tempat Lahir wajib diisi.',
            'birth_place.string' => 'Kolom Tempat Lahir harus berupa string.',
            'birth_place.max' => 'Kolom Tempat Lahir tidak boleh lebih dari 255 karakter.',
            'birth_date.required' => 'Kolom Tanggal Lahir wajib diisi.',
            'birth_date.date' => 'Format Tanggal Lahir tidak valid.',
            'gender.required' => 'Kolom Jenis Kelamin wajib dipilih.',
            'gender.in' => 'Pilihan Jenis Kelamin tidak valid.',
            'religion.required' => 'Kolom Agama wajib diisi.',
            'religion.string' => 'Kolom Agama harus berupa string.',
            'religion.max' => 'Kolom Agama tidak boleh lebih dari 255 karakter.',
            'marital_status.required' => 'Kolom Status Perkawinan wajib diisi.',
            'marital_status.string' => 'Kolom Status Perkawinan harus berupa string.',
            'marital_status.max' => 'Kolom Status Perkawinan tidak boleh lebih dari 255 karakter.',
            'occupation.required' => 'Kolom Pekerjaan wajib diisi.',
            'occupation.string' => 'Kolom Pekerjaan harus berupa string.',
            'occupation.max' => 'Kolom Pekerjaan tidak boleh lebih dari 255 karakter.',
            'address.required' => 'Kolom Alamat wajib diisi.',
            'address.string' => 'Kolom Alamat harus berupa string.',
            'is_active.required' => 'Kolom Status wajib dipilih.',
            'is_active.boolean' => 'Format Status tidak valid.',
        ]);

        try {
            $resident = new Resident($validated);
            $resident->save();

            return redirect()->route('residents.index')->with('success', 'Data '.$resident->name.' berhasil disimpan.');
        } catch (\Throwable $th) {
            Log::error('Gagal membuat data penduduk: '.$th->getMessage());

            return redirect()->route('residents.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Resident $resident)
    {
        // Not used
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Resident $resident)
    {
        return Inertia::render('sekdes/residents/edit', [
            'resident' => $resident,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Resident $resident)
    {
        $validated = $request->validate([
            'nik' => 'required|string|size:16|unique:residents,nik,'.$resident->id,
            'no_kk' => 'required|string|size:16',
            'name' => 'required|string|max:255',
            'birth_place' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'religion' => 'required|string|max:255',
            'marital_status' => 'required|string|max:255',
            'occupation' => 'required|string|max:255',
            'address' => 'required|string',
            'is_active' => 'required|boolean',
        ], [
            'nik.required' => 'Kolom NIK wajib diisi.',
            'nik.string' => 'Kolom NIK harus berupa string.',
            'nik.size' => 'Kolom NIK harus tepat 16 karakter.',
            'nik.unique' => 'NIK sudah terdaftar.',
            'no_kk.required' => 'Kolom Nomor KK wajib diisi.',
            'no_kk.string' => 'Kolom Nomor KK harus berupa string.',
            'no_kk.size' => 'Kolom Nomor KK harus tepat 16 karakter.',
            'name.required' => 'Kolom Nama Lengkap wajib diisi.',
            'name.string' => 'Kolom Nama Lengkap harus berupa string.',
            'name.max' => 'Kolom Nama Lengkap tidak boleh lebih dari 255 karakter.',
            'birth_place.required' => 'Kolom Tempat Lahir wajib diisi.',
            'birth_place.string' => 'Kolom Tempat Lahir harus berupa string.',
            'birth_place.max' => 'Kolom Tempat Lahir tidak boleh lebih dari 255 karakter.',
            'birth_date.required' => 'Kolom Tanggal Lahir wajib diisi.',
            'birth_date.date' => 'Format Tanggal Lahir tidak valid.',
            'gender.required' => 'Kolom Jenis Kelamin wajib dipilih.',
            'gender.in' => 'Pilihan Jenis Kelamin tidak valid.',
            'religion.required' => 'Kolom Agama wajib diisi.',
            'religion.string' => 'Kolom Agama harus berupa string.',
            'religion.max' => 'Kolom Agama tidak boleh lebih dari 255 karakter.',
            'marital_status.required' => 'Kolom Status Perkawinan wajib diisi.',
            'marital_status.string' => 'Kolom Status Perkawinan harus berupa string.',
            'marital_status.max' => 'Kolom Status Perkawinan tidak boleh lebih dari 255 karakter.',
            'occupation.required' => 'Kolom Pekerjaan wajib diisi.',
            'occupation.string' => 'Kolom Pekerjaan harus berupa string.',
            'occupation.max' => 'Kolom Pekerjaan tidak boleh lebih dari 255 karakter.',
            'address.required' => 'Kolom Alamat wajib diisi.',
            'address.string' => 'Kolom Alamat harus berupa string.',
            'is_active.required' => 'Kolom Status wajib dipilih.',
            'is_active.boolean' => 'Format Status tidak valid.',
        ]);

        try {
            $resident->update($validated);

            return redirect()->route('residents.index')->with('success', 'Data '.$resident->name.' berhasil diperbarui.');
        } catch (\Throwable $th) {
            Log::error('Gagal memperbarui data penduduk: '.$th->getMessage());

            return redirect()->route('residents.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Resident $resident)
    {

        if ($resident) {
            $name = $resident->name;
            // Normal (Hard) Delete as requested by user
            /** @var Resident $resident */
            $resident->delete(); // @phpstan-ignore-line

            return redirect()->route('residents.index')->with('success', 'Data '.$name.' berhasil dihapus.');
        } else {
            return redirect()->route('residents.index')->with('error', 'Data tidak ditemukan.');
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
                // Hard delete the items
                Resident::whereIn('id', $ids, 'and', false)->get()->each(fn ($resident) => $resident->delete());

                return redirect()->route('residents.index')
                    ->with('success', 'Data penduduk yang dipilih berhasil dihapus.');
            }

            return redirect()->route('residents.index')->with('error', 'Data tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Gagal bulk delete data penduduk: '.$e->getMessage());

            return redirect()->route('residents.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }
}
