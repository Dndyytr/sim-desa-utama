<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    private $roles = [
        [
            'name' => 'admin',
            'guard_name' => 'web',
            'description' => 'Memiliki akses penuh ke semua fitur dan pengaturan dalam sistem.',
        ],
        [
            'name' => 'sekdes',
            'guard_name' => 'web',
            'description' => 'Memiliki akses sebagai sekretaris desa.',
        ],
        [
            'name' => 'peket',
            'guard_name' => 'web',
            'description' => 'Memiliki akses sebagai petugas loket.',
        ],
        [
            'name' => 'kadang',
            'guard_name' => 'web',
            'description' => 'Memiliki akses sebagai kasi bidang.',
        ],
        [
            'name' => 'kades',
            'guard_name' => 'web',
            'description' => 'Memiliki akses sebagai kepala desa.',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->roles as $value) {
            $role = Role::where('name', $value['name'])->first();

            if ($role === null) {
                $role = new Role($value);
            }

            $role->save();
        }
    }
}
