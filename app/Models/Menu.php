<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
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

        $menus = self::with('children')->whereNull('parent_id')->where('status', 'enabled')->get();

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
