<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    private $menus = [
        [
            'id' => 1,
            'parent_id' => null,
            'title' => 'Beranda',
            'url' => 'dashboards.index',
            'tag' => 'dashboards',
            'icon' => 'Home',
            'permission' => 'dashboard',
            'status' => 'enabled',
            'locale' => 'id', // Default locale
        ],
        [
            'id' => 2,
            'parent_id' => null,
            'title' => 'Kelola Pengguna',
            'url' => 'users.index',
            'tag' => 'users',
            'icon' => 'Users',
            'permission' => 'user',
            'status' => 'enabled',
            'locale' => 'id', // Default locale
        ],
        [
            'id' => 3,
            'parent_id' => null,
            'title' => 'Kelola Hak Akses',
            'url' => 'permissions.index',
            'tag' => 'permissions',
            'icon' => 'UserKey',
            'permission' => 'permission',
            'status' => 'enabled',
            'locale' => 'id', // Default locale
        ],
        [
            'id' => 4,
            'parent_id' => null,
            'title' => 'Kelola Peran',
            'url' => 'roles.index',
            'tag' => 'role',
            'icon' => 'UserCog',
            'permission' => 'role',
            'status' => 'enabled',
            'locale' => 'id', // Default locale
        ],
        [
            'id' => 5,
            'parent_id' => null,
            'title' => 'Kelola Menu',
            'url' => 'menus.index',
            'tag' => 'menus',
            'icon' => 'SquareMenu',
            'permission' => 'menu',
            'status' => 'enabled',
            'locale' => 'id', // Default locale
        ],
        // Tambahkan menu lainnya sesuai kebutuhan
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->menus as $value) {
            $menu = Menu::where('title', $value['title'], 'and', false)->first();

            if ($menu === null) {
                $menu = new Menu($value);
            }

            $menu->save();
        }
    }
}
