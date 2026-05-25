<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    private $users = [
        [
            'name' => 'Admin Sistem',
            'email' => 'admin@gmail.com',
            'password' => 'admin123',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->users as $value) {
            $user = User::where('name', $value['name'], 'and', false)->first();
            /** @var Role $role */
            $role = Role::where('name', 'admin')->firstOrFail();
            $permissions = Permission::pluck('id')->all();

            $role->syncPermissions($permissions);

            if ($user === null) {
                $user = User::forceCreate([
                    'name' => $value['name'],
                    'email' => $value['email'],
                    'password' => Hash::make($value['password']),
                    'email_verified_at' => now(),
                ]);
                $user->syncRoles([$role->id]);
            }

            $user->save();
        }
    }
}
