<?php

namespace Tests\Feature\Admins;

use App\Models\User;
use App\Models\VillageInformation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class VillageInformationTest extends TestCase
{
    use RefreshDatabase;

    private function signInWithPermission(string $permissionName): User
    {
        /** @var User $user */
        $user = User::factory()->create();

        $permission = Permission::firstOrCreate([
            'name' => $permissionName,
            'guard_name' => 'web',
        ]);
        $user->givePermissionTo($permission);

        $this->actingAs($user);

        return $user;
    }

    public function test_admin_with_permission_can_view_index()
    {
        $this->signInWithPermission('r-village-informations');

        VillageInformation::create([
            'title' => 'Profil Desa Utama',
            'slug' => 'profil-desa-utama',
            'content' => 'Konten profil desa utama.',
            'category' => 'info_desa',
            'status' => 'published',
            'created_by' => auth()->id(),
        ]);

        $response = $this->get(route('village-informations.index'));

        $response->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('admins/village-informations/index')
                    ->where('informations.total', 1)
                    ->where('informations.data.0.title', 'Profil Desa Utama')
            );
    }

    public function test_admin_without_permission_cannot_view_index()
    {
        /** @var User $user */
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('village-informations.index'));
        $response->assertForbidden();
    }

    public function test_admin_can_create_village_information()
    {
        $user = $this->signInWithPermission('c-village-informations');

        $response = $this->post(route('village-informations.store'), [
            'title' => 'Berita Baru Desa',
            'content' => 'Ini adalah konten berita baru.',
            'category' => 'berita',
            'status' => 'published',
        ]);

        $response->assertRedirect(route('village-informations.index'));
        $this->assertDatabaseHas('village_informations', [
            'title' => 'Berita Baru Desa',
            'slug' => 'berita-baru-desa',
            'category' => 'berita',
            'created_by' => $user->id,
        ]);
    }

    public function test_admin_can_update_village_information()
    {
        $user = $this->signInWithPermission('u-village-informations');

        $info = VillageInformation::create([
            'title' => 'Info Lama',
            'slug' => 'info-lama',
            'content' => 'Konten lama.',
            'category' => 'info_desa',
            'status' => 'draft',
            'created_by' => $user->id,
        ]);

        $response = $this->put(route('village-informations.update', $info), [
            'title' => 'Info Baru',
            'content' => 'Konten baru.',
            'category' => 'info_desa',
            'status' => 'published',
        ]);

        $response->assertRedirect(route('village-informations.index'));
        $this->assertDatabaseHas('village_informations', [
            'id' => $info->id,
            'title' => 'Info Baru',
            'slug' => 'info-baru',
            'status' => 'published',
        ]);
    }

    public function test_admin_can_delete_village_information()
    {
        $user = $this->signInWithPermission('d-village-informations');

        $info = VillageInformation::create([
            'title' => 'Info Hapus',
            'slug' => 'info-hapus',
            'content' => 'Akan dihapus.',
            'category' => 'info_desa',
            'created_by' => $user->id,
        ]);

        $response = $this->delete(route('village-informations.destroy', $info));

        $response->assertRedirect(route('village-informations.index'));
        $this->assertSoftDeleted('village_informations', [
            'id' => $info->id,
        ]);
    }
}
