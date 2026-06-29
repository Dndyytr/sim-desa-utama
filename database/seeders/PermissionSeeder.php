<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    private $permissions = [
        // Dashboard
        ['name' => 'r-dashboards', 'guard_name' => 'web', 'feature' => 'dashboard', 'title' => 'Read'],
        ['name' => 'c-dashboards', 'guard_name' => 'web', 'feature' => 'dashboard', 'title' => 'Create'],
        ['name' => 'u-dashboards', 'guard_name' => 'web', 'feature' => 'dashboard', 'title' => 'Update'],
        ['name' => 'd-dashboards', 'guard_name' => 'web', 'feature' => 'dashboard', 'title' => 'Delete'],

        // Role
        ['name' => 'r-roles', 'guard_name' => 'web', 'feature' => 'role', 'title' => 'Read'],
        ['name' => 'c-roles', 'guard_name' => 'web', 'feature' => 'role', 'title' => 'Create'],
        ['name' => 'u-roles', 'guard_name' => 'web', 'feature' => 'role', 'title' => 'Update'],
        ['name' => 'd-roles', 'guard_name' => 'web', 'feature' => 'role', 'title' => 'Delete'],

        // Permission
        ['name' => 'r-permissions', 'guard_name' => 'web', 'feature' => 'permission', 'title' => 'Read'],
        ['name' => 'c-permissions', 'guard_name' => 'web', 'feature' => 'permission', 'title' => 'Create'],
        ['name' => 'u-permissions', 'guard_name' => 'web', 'feature' => 'permission', 'title' => 'Update'],
        ['name' => 'd-permissions', 'guard_name' => 'web', 'feature' => 'permission', 'title' => 'Delete'],

        // Menu
        ['name' => 'r-menus', 'guard_name' => 'web', 'feature' => 'menu', 'title' => 'Read'],
        ['name' => 'c-menus', 'guard_name' => 'web', 'feature' => 'menu', 'title' => 'Create'],
        ['name' => 'u-menus', 'guard_name' => 'web', 'feature' => 'menu', 'title' => 'Update'],
        ['name' => 'd-menus', 'guard_name' => 'web', 'feature' => 'menu', 'title' => 'Delete'],

        // User
        ['name' => 'r-users', 'guard_name' => 'web', 'feature' => 'user', 'title' => 'Read'],
        ['name' => 'c-users', 'guard_name' => 'web', 'feature' => 'user', 'title' => 'Create'],
        ['name' => 'u-users', 'guard_name' => 'web', 'feature' => 'user', 'title' => 'Update'],
        ['name' => 'd-users', 'guard_name' => 'web', 'feature' => 'user', 'title' => 'Delete'],

        // Type Service
        ['name' => 'r-type-services', 'guard_name' => 'web', 'feature' => 'type-service', 'title' => 'Read'],
        ['name' => 'c-type-services', 'guard_name' => 'web', 'feature' => 'type-service', 'title' => 'Create'],
        ['name' => 'u-type-services', 'guard_name' => 'web', 'feature' => 'type-service', 'title' => 'Update'],
        ['name' => 'd-type-services', 'guard_name' => 'web', 'feature' => 'type-service', 'title' => 'Delete'],

        // Resident
        ['name' => 'r-residents', 'guard_name' => 'web', 'feature' => 'resident', 'title' => 'Read'],
        ['name' => 'c-residents', 'guard_name' => 'web', 'feature' => 'resident', 'title' => 'Create'],
        ['name' => 'u-residents', 'guard_name' => 'web', 'feature' => 'resident', 'title' => 'Update'],
        ['name' => 'd-residents', 'guard_name' => 'web', 'feature' => 'resident', 'title' => 'Delete'],

        // Family
        ['name' => 'r-familys', 'guard_name' => 'web', 'feature' => 'family', 'title' => 'Read'],
        ['name' => 'c-familys', 'guard_name' => 'web', 'feature' => 'family', 'title' => 'Create'],
        ['name' => 'u-familys', 'guard_name' => 'web', 'feature' => 'family', 'title' => 'Update'],
        ['name' => 'd-familys', 'guard_name' => 'web', 'feature' => 'family', 'title' => 'Delete'],

        // Submissions
        ['name' => 'r-submissions', 'guard_name' => 'web', 'feature' => 'submission', 'title' => 'Read'],
        ['name' => 'c-submissions', 'guard_name' => 'web', 'feature' => 'submission', 'title' => 'Create'],
        ['name' => 'u-submissions', 'guard_name' => 'web', 'feature' => 'submission', 'title' => 'Update'],
        ['name' => 'd-submissions', 'guard_name' => 'web', 'feature' => 'submission', 'title' => 'Delete'],

        // Services
        ['name' => 'r-services', 'guard_name' => 'web', 'feature' => 'service', 'title' => 'Read'],
        ['name' => 'c-services', 'guard_name' => 'web', 'feature' => 'service', 'title' => 'Create'],
        ['name' => 'u-services', 'guard_name' => 'web', 'feature' => 'service', 'title' => 'Update'],
        ['name' => 'd-services', 'guard_name' => 'web', 'feature' => 'service', 'title' => 'Delete'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->permissions as $value) {
            $permission = Permission::where('name', $value['name'])->first();

            if ($permission === null) {
                $permission = new Permission($value);
            }

            $permission->save();
        }
    }
}
