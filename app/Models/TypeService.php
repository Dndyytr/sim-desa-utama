<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class TypeService extends Model
{
    protected $fillable = [
        'service_code',
        'service_name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Booted method untuk melacak event Eloquent model.
     * Alur Kerja Optimasi Cache Invalidation:
     * - Ketika data jenis layanan disimpan (saved) atau dihapus (deleted), cache 'active_type_services' dibersihkan.
     * - Ini menjamin data dropdown jenis layanan selalu up-to-date tanpa perlu query DB terus-menerus.
     */
    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget('active_type_services'));
        static::deleted(fn () => Cache::forget('active_type_services'));
    }

    /**
     * Mengambil daftar semua jenis layanan yang aktif menggunakan cache.
     */
    public static function getActiveServices()
    {
        return Cache::rememberForever('active_type_services', function () {
            return self::where('is_active', true)->get();
        });
    }
}
