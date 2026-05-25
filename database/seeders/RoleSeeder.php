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
