<?php

namespace App\Http\Controllers\Sekdes;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Models\Family;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class FamilyController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-familys', only: ['index', 'show']),
            new Middleware('permission:c-familys', only: ['create', 'store']),
            new Middleware('permission:u-familys', only: ['edit', 'update']),
            new Middleware('permission:d-familys', only: ['destroy', 'bulkDelete']),
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
            'no_kk_asc' => ['no_kk', 'asc'],
            'no_kk_desc' => ['no_kk', 'desc'],
        ];

        [$sortColumn, $sortDirection] = $request->resolveSort($sorts);

        $familys = Family::query()
            ->with(['headResident'])
            ->withCount('members')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    // Search optimization: LIKE 'term%' (only trailing wildcard) to leverage index
                    $q->where('no_kk', 'like', $search.'%')
                        ->orWhere('address', 'like', $search.'%')
                        ->orWhere('hamlet', 'like', $search.'%');
                });
            })
            ->when($status === 'active', function ($query) {
                $query->where('status', true);
            })
            ->when($status === 'inactive', function ($query) {
                $query->where('status', false);
            })
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($validated['entries'])
            ->onEachSide(0)
            ->appends($request->except(['page']));

        return Inertia::render('sekdes/familys/index', [
            'familys' => $familys,
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
    public function create(): Response
    {
        $residents = Resident::where('is_active', true, 'and', false)
            ->orderBy('name')
            ->get(['id', 'nik', 'name']);

        return Inertia::render('sekdes/familys/create', [
            'residents' => $residents,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'no_kk' => 'required|string|size:16|unique:familys,no_kk',
            'head_resident_id' => 'required|exists:residents,id|unique:familys,head_resident_id',
            'address' => 'required|string',
            'rt' => 'nullable|string|max:5',
            'rw' => 'nullable|string|max:5',
            'hamlet' => 'nullable|string|max:255',
            'status' => 'required|boolean',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'exists:residents,id',
            'member_relationships' => 'nullable|array',
            'member_relationships.*.resident_id' => 'required|exists:residents,id',
            'member_relationships.*.relationship' => 'required|string|max:50',
        ], [
            'no_kk.required' => 'Kolom Nomor KK wajib diisi.',
            'no_kk.string' => 'Kolom Nomor KK harus berupa string.',
            'no_kk.size' => 'Kolom Nomor KK harus tepat 16 karakter.',
            'no_kk.unique' => 'Nomor KK sudah terdaftar.',
            'head_resident_id.required' => 'Kolom Kepala Keluarga wajib diisi.',
            'head_resident_id.exists' => 'Kepala Keluarga tidak valid.',
            'head_resident_id.unique' => 'Penduduk tersebut sudah menjadi Kepala Keluarga di keluarga lain.',
            'address.required' => 'Kolom Alamat wajib diisi.',
            'status.required' => 'Kolom Status wajib dipilih.',
            'status.boolean' => 'Format Status tidak valid.',
            'member_ids.array' => 'Format Anggota Keluarga tidak valid.',
            'member_ids.*.exists' => 'Anggota Keluarga tidak valid.',
            'member_relationships.array' => 'Format Hubungan Keluarga tidak valid.',
            'member_relationships.*.resident_id.required' => 'Penduduk pada Hubungan Keluarga wajib diisi.',
            'member_relationships.*.resident_id.exists' => 'Penduduk pada Hubungan Keluarga tidak valid.',
            'member_relationships.*.relationship.required' => 'Hubungan Keluarga wajib dipilih.',
        ]);

        try {
            DB::beginTransaction();

            $family = new Family;
            $family->no_kk = $validated['no_kk'];
            $family->head_resident_id = $validated['head_resident_id'];
            $family->address = $validated['address'];
            $family->rt = $validated['rt'] ?? null;
            $family->rw = $validated['rw'] ?? null;
            $family->hamlet = $validated['hamlet'] ?? null;
            $family->status = $validated['status'];
            $family->save();

            // Sync family members (Head of family is automatically a member)
            $memberRelationships = collect($request->input('member_relationships', []))
                ->mapWithKeys(fn ($member) => [(int) $member['resident_id'] => $member['relationship']]);

            $memberIds = ($memberRelationships->isNotEmpty()
                ? $memberRelationships->keys()
                : collect($request->input('member_ids', [])))
                ->push($family->head_resident_id)
                ->unique()
                ->values()
                ->toArray();

            $syncData = [];
            foreach ($memberIds as $id) {
                $isHead = ($id == $family->head_resident_id);
                $syncData[$id] = [
                    'is_head' => $isHead,
                    'relationship' => $isHead ? 'Kepala Keluarga' : ($memberRelationships->get((int) $id) ?? 'Anggota Keluarga'),
                    'status_member' => 'Active',
                ];
            }

            $family->members()->sync($syncData);

            // Update NIK's KK for all members to match this KK
            Resident::whereIn('id', $memberIds, 'and', false)->update(['no_kk' => $family->no_kk]);

            DB::commit();

            return redirect()->route('familys.index')->with('success', 'Data '.$family->no_kk.' berhasil disimpan.');
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('Gagal membuat data keluarga: '.$th->getMessage());

            return redirect()->route('familys.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Family $family)
    {
        // Not used
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Family $family): Response
    {
        $family->load(['headResident', 'members']);

        $residents = Resident::where('is_active', true, 'and', false)
            ->orderBy('name')
            ->get(['id', 'nik', 'name']);

        return Inertia::render('sekdes/familys/edit', [
            'family' => $family,
            'residents' => $residents,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Family $family)
    {
        $validated = $request->validate([
            'no_kk' => 'required|string|size:16|unique:familys,no_kk,'.$family->id,
            'head_resident_id' => 'required|exists:residents,id|unique:familys,head_resident_id,'.$family->id,
            'address' => 'required|string',
            'rt' => 'nullable|string|max:5',
            'rw' => 'nullable|string|max:5',
            'hamlet' => 'nullable|string|max:255',
            'status' => 'required|boolean',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'exists:residents,id',
            'member_relationships' => 'nullable|array',
            'member_relationships.*.resident_id' => 'required|exists:residents,id',
            'member_relationships.*.relationship' => 'required|string|max:50',
        ], [
            'no_kk.required' => 'Kolom Nomor KK wajib diisi.',
            'no_kk.string' => 'Kolom Nomor KK harus berupa string.',
            'no_kk.size' => 'Kolom Nomor KK harus tepat 16 karakter.',
            'no_kk.unique' => 'Nomor KK sudah terdaftar.',
            'head_resident_id.required' => 'Kolom Kepala Keluarga wajib diisi.',
            'head_resident_id.exists' => 'Kepala Keluarga tidak valid.',
            'head_resident_id.unique' => 'Penduduk tersebut sudah menjadi Kepala Keluarga di keluarga lain.',
            'address.required' => 'Kolom Alamat wajib diisi.',
            'status.required' => 'Kolom Status wajib dipilih.',
            'status.boolean' => 'Format Status tidak valid.',
            'member_ids.array' => 'Format Anggota Keluarga tidak valid.',
            'member_ids.*.exists' => 'Anggota Keluarga tidak valid.',
            'member_relationships.array' => 'Format Hubungan Keluarga tidak valid.',
            'member_relationships.*.resident_id.required' => 'Penduduk pada Hubungan Keluarga wajib diisi.',
            'member_relationships.*.resident_id.exists' => 'Penduduk pada Hubungan Keluarga tidak valid.',
            'member_relationships.*.relationship.required' => 'Hubungan Keluarga wajib dipilih.',
        ]);

        try {
            DB::beginTransaction();

            $family->no_kk = $validated['no_kk'];
            $family->head_resident_id = $validated['head_resident_id'];
            $family->address = $validated['address'];
            $family->rt = $validated['rt'] ?? null;
            $family->rw = $validated['rw'] ?? null;
            $family->hamlet = $validated['hamlet'] ?? null;
            $family->status = $validated['status'];
            $family->save();

            // Sync family members (Head of family is automatically a member)
            $memberRelationships = collect($request->input('member_relationships', []))
                ->mapWithKeys(fn ($member) => [(int) $member['resident_id'] => $member['relationship']]);

            $memberIds = ($memberRelationships->isNotEmpty()
                ? $memberRelationships->keys()
                : collect($request->input('member_ids', [])))
                ->push($family->head_resident_id)
                ->unique()
                ->values()
                ->toArray();

            $syncData = [];
            foreach ($memberIds as $id) {
                $isHead = ($id == $family->head_resident_id);
                $syncData[$id] = [
                    'is_head' => $isHead,
                    'relationship' => $isHead ? 'Kepala Keluarga' : ($memberRelationships->get((int) $id) ?? 'Anggota Keluarga'),
                    'status_member' => 'Active',
                ];
            }

            $family->members()->sync($syncData);

            // Update NIK's KK for all members to match this KK
            Resident::whereIn('id', $memberIds, 'and', false)->update(['no_kk' => $family->no_kk]);

            DB::commit();

            return redirect()->route('familys.index')->with('success', 'Data '.$family->no_kk.' berhasil diperbarui.');
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('Gagal memperbarui data keluarga: '.$th->getMessage());

            return redirect()->route('familys.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Family $family)
    {
        try {
            $noKk = $family->no_kk;
            // Normal (Hard) Delete as requested by user
            /** @var Family $family */
            $family->delete(); // @phpstan-ignore-line

            return redirect()->route('familys.index')->with('success', 'Data '.$noKk.' berhasil dihapus.');
        } catch (\Throwable $th) {
            Log::error('Gagal menghapus data keluarga: '.$th->getMessage());

            return redirect()->route('familys.index')->with('error', 'Oops, terjadi kesalahan!');
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
                Family::whereIn('id', $ids, 'and', false)->get()->each(fn ($family) => $family->delete());

                return redirect()->route('familys.index')
                    ->with('success', 'Data keluarga yang dipilih berhasil dihapus.');
            }

            return redirect()->route('familys.index')->with('error', 'Data tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Gagal bulk delete data keluarga: '.$e->getMessage());

            return redirect()->route('familys.index')->with('error', 'Oops, terjadi kesalahan!');
        }
    }
}
