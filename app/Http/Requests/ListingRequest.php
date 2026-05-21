<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ListingRequest extends FormRequest
{
    /**
     * Query standar untuk halaman listing/tabel.
     *
     * Request ini sengaja hanya menangani field umum yang dipakai banyak
     * halaman: pagination, jumlah data, pencarian, dan sorting dasar.
     * Filter spesifik halaman, seperti role/status user, tetap dibaca di
     * controller agar request ini bisa dipakai ulang.
     */
    public function rules(): array
    {
        return [
            'page' => 'nullable|integer|min:1',
            'entries' => 'nullable|integer|min:1',
            'search' => 'nullable|string|max:255',
            'sort' => 'nullable|string',
        ];
    }

    /**
     * Normalisasi nilai query sebelum validasi berjalan.
     *
     * Tujuannya agar controller selalu menerima nilai aman:
     * - page default ke 1
     * - entries default ke 10
     * - sort default ke created_asc
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'page' => $this->input('page', 1),
            'entries' => $this->input('entries', 10),
        ]);
    }

    /**
     * Hitung nomor awal baris untuk pagination.
     *
     * Contoh: page 3 dengan entries 10 menghasilkan 20, sehingga index
     * pertama di halaman tersebut bisa dimulai dari 21 di tampilan.
     */
    public function startIndex(): int
    {
        $page = (int) $this->input('page', 1);
        $entries = (int) $this->input('entries', 10);

        return ($page - 1) * $entries;
    }

    /**
     * Tentukan apakah listing sedang memakai filter aktif.
     *
     * Field tambahan dikirim dari controller karena setiap halaman bisa punya
     * filter berbeda. Sort default tidak dianggap sebagai filter aktif agar UI
     * masih bisa menampilkan placeholder awal.
     */
    public function hasFilter(array $extraFields = []): bool
    {
        foreach ($extraFields as $field) {
            if ($this->filled($field)) {
                return true;
            }
        }

        if ($this->filled('sort') && $this->input('sort') !== 'created_asc') {
            return true;
        }

        return false;
    }

    /**
     * Ambil pasangan kolom dan arah sort dari daftar sort yang diizinkan.
     *
     * Controller memberikan whitelist sort agar query tidak menerima nama
     * kolom mentah dari request. Jika value tidak dikenal, fallback ke default.
     */
    public function resolveSort(array $sorts): array
    {
        $sort = $this->input('sort', 'created_asc');

        if (! array_key_exists($sort, $sorts)) {
            $sort = 'created_asc';
        }

        return $sorts[$sort];
    }
}
