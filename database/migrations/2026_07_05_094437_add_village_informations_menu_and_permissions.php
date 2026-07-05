<?php

use App\Models\Menu;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create Permissions
        $permissions = [
            ['name' => 'r-village-informations', 'guard_name' => 'web', 'feature' => 'village-information', 'title' => 'Read'],
            ['name' => 'c-village-informations', 'guard_name' => 'web', 'feature' => 'village-information', 'title' => 'Create'],
            ['name' => 'u-village-informations', 'guard_name' => 'web', 'feature' => 'village-information', 'title' => 'Update'],
            ['name' => 'd-village-informations', 'guard_name' => 'web', 'feature' => 'village-information', 'title' => 'Delete'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm['name']], $perm);
        }

        // 2. Assign Permissions to Admin Role
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo([
                'r-village-informations',
                'c-village-informations',
                'u-village-informations',
                'd-village-informations',
            ]);
        }

        // 3. Create Parent Menu: Kelola Informasi
        $parentMenu = Menu::firstOrCreate(
            ['title' => 'Kelola Informasi'],
            [
                'parent_id' => null,
                'url' => null,
                'tag' => 'village-informations-parent',
                'icon' => 'University',
                'permission' => 'village-information',
                'status' => 'enabled',
                'locale' => 'id',
            ]
        );

        // 4. Create Child Menu: Kelola Info Desa
        Menu::firstOrCreate(
            ['title' => 'Kelola Info Desa', 'parent_id' => $parentMenu->id],
            [
                'url' => 'village-informations.index',
                'tag' => 'village-informations',
                'icon' => 'Globe',
                'permission' => 'village-information',
                'status' => 'enabled',
                'locale' => 'id',
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Delete child menu
        Menu::where('url', 'village-informations.index')->delete();
        // Delete parent menu
        Menu::where('tag', 'village-informations-parent')->delete();

        // Revoke from Admin Role
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->revokePermissionTo([
                'r-village-informations',
                'c-village-informations',
                'u-village-informations',
                'd-village-informations',
            ]);
        }

        // Delete Permissions
        Permission::where('feature', 'village-information')->delete();
    }
};
