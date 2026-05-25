<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Permission;

#[Fillable([
    'parent_id',
    'title',
    'url',
    'tag',
    'icon',
    'permission',
    'status',
    'locale',
])]
class Menu extends Model
{
    use HasFactory;

    /**
     * Booted method untuk melacak event Eloquent model.
     * Alur Kerja Optimasi Cache Invalidation:
     * - Ketika data menu disimpan (saved) atau dihapus (deleted), cache 'menus_all_active' dibersihkan (forget).
     * - Ini menjamin data navigasi yang ditampilkan ke user selalu up-to-date tanpa perlu query DB terus-menerus.
     */
    // protected static function booted(): void
    // {
    //     static::saved(fn () => Cache::forget('menus_all_active'));
    //     static::deleted(fn () => Cache::forget('menus_all_active'));
    // }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function permissions()
    {
        return $this->hasMany(Permission::class, 'feature', 'permission');
    }

    public static function getMenu()
    {
        $nav = [];

        /**
         * Alur Kerja Optimasi Query:
         * 1. Query menus menggunakan cache 'menus_all_active' agar database tidak melayani request query menu yang sama di setiap page load.
         * 2. Cache diatur agar disimpan selamanya (rememberForever), dan hanya dihapus (invalidate) saat ada perubahan data melalui event model 'booted' di atas.
         * 3. Pemanggilan query eager-loading 'children' juga otomatis ikut ter-cache.
         */
        // $menus = Cache::rememberForever('menus_all_active', function () {
        //     return self::with('children')
        //         ->whereNull('parent_id')
        //         ->where('status', 'enabled')
        //         ->get();
        // });

        $menus = self::with('children')
            ->whereNull('parent_id')
            ->where('status', 'enabled')
            ->get();

        foreach ($menus as $key => $menu) {

            if (Auth::user()?->can('r-'.$menu->permission.'s')) {
                $nav[$key] = [
                    'title' => $menu->title,
                    'href' => $menu->url ? route($menu->url, [], false) : '#',
                    'icon' => $menu->icon,
                    'locale' => $menu->locale,
                    'children' => [],
                ];

                foreach ($menu->children as $child) {
                    if (Auth::user()?->can('r-'.$child->permission.'s')) {
                        $nav[$key]['children'][] = [
                            'title' => $child->title,
                            'href' => $child->url ? route($child->url, [], false) : '#',
                            'icon' => $child->icon,
                            'locale' => $child->locale,
                            'tag' => $child->tag,
                        ];
                    }
                }
            }
        }

        return array_values($nav);
    }
}
