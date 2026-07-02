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
        [
            'id' => 6,
            'parent_id' => null,
            'title' => 'Kelola Jenis Layanan',
            'url' => 'type-services.index',
            'tag' => 'type-services',
            'icon' => 'Wrench',
            'permission' => 'type-service',
            'status' => 'enabled',
            'locale' => 'id',
        ],
        [
            'id' => 7,
            'parent_id' => null,
            'title' => 'Kelola Data Penduduk',
            'url' => 'residents.index',
            'tag' => 'residents',
            'icon' => 'ShieldUser',
            'permission' => 'resident',
            'status' => 'enabled',
            'locale' => 'id',
        ],
        [
            'id' => 8,
            'parent_id' => null,
            'title' => 'Kelola Data Keluarga',
            'url' => 'familys.index',
            'tag' => 'familys',
            'icon' => 'LucideSquareUser',
            'permission' => 'family',
            'status' => 'enabled',
            'locale' => 'id',
        ],
        [
            'parent_id' => null,
            'title' => 'Kelola Pengajuan & Layanan',
            'url' => 'submissions.index',
            'tag' => 'submissions',
            'icon' => 'FileSignature',
            'permission' => 'submission',
            'status' => 'enabled',
            'locale' => 'id',
        ],
        [
            'parent_id' => null,
            'title' => 'Disposisi Layanan',
            'url' => 'services.index',
            'tag' => 'services',
            'icon' => 'FileText',
            'permission' => 'service',
            'status' => 'enabled',
            'locale' => 'id',
        ],
        [
            'parent_id' => null,
            'title' => 'Kelola Layanan',
            'url' => 'kadangs.services.index',
            'tag' => 'kadangs-services',
            'icon' => 'Briefcase',
            'permission' => 'kadang-service',
            'status' => 'enabled',
            'locale' => 'id',
        ],
        [
            'parent_id' => null,
            'title' => 'Persetujuan Akhir',
            'url' => 'kades.services.index',
            'tag' => 'kades-services',
            'icon' => 'ShieldCheck',
            'permission' => 'kades-service',
            'status' => 'enabled',
            'locale' => 'id',
        ],
        [
            'parent_id' => null,
            'title' => 'Generate Surat',
            'url' => 'kadangs.letters.index',
            'tag' => 'kadangs-letters',
            'icon' => 'Printer',
            'permission' => 'kadang-letter',
            'status' => 'enabled',
            'locale' => 'id',
        ],
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
