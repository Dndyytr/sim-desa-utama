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
            ['name' => 'r-village-agendas', 'guard_name' => 'web', 'feature' => 'village-agenda', 'title' => 'Read'],
            ['name' => 'c-village-agendas', 'guard_name' => 'web', 'feature' => 'village-agenda', 'title' => 'Create'],
            ['name' => 'u-village-agendas', 'guard_name' => 'web', 'feature' => 'village-agenda', 'title' => 'Update'],
            ['name' => 'd-village-agendas', 'guard_name' => 'web', 'feature' => 'village-agenda', 'title' => 'Delete'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm['name']], $perm);
        }

        // 2. Assign Permissions to Sekdes Role
        $sekdesRole = Role::where('name', 'sekdes')->first();
        if ($sekdesRole) {
            $sekdesRole->givePermissionTo([
                'r-village-agendas',
                'c-village-agendas',
                'u-village-agendas',
                'd-village-agendas',
            ]);
        }

        // 3. Create Standalone Parent/Main Menu: Kelola Agenda Desa
        Menu::firstOrCreate(
            ['title' => 'Kelola Agenda Desa'],
            [
                'parent_id' => null,
                'url' => 'village-agendas.index',
                'tag' => 'village-agendas',
                'icon' => 'Calendar',
                'permission' => 'village-agenda',
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
        // Delete menu
        Menu::where('url', 'village-agendas.index')->delete();

        // Revoke from Sekdes Role
        $sekdesRole = Role::where('name', 'sekdes')->first();
        if ($sekdesRole) {
            $sekdesRole->revokePermissionTo([
                'r-village-agendas',
                'c-village-agendas',
                'u-village-agendas',
                'd-village-agendas',
            ]);
        }

        // Delete Permissions
        Permission::where('feature', 'village-agenda')->delete();
    }
};
