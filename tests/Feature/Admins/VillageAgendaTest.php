<?php

namespace Tests\Feature\Admins;

use App\Models\User;
use App\Models\VillageAgenda;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class VillageAgendaTest extends TestCase
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

    public function test_user_with_permission_can_view_index()
    {
        $this->signInWithPermission('r-village-agendas');

        VillageAgenda::create([
            'title' => 'Rapat Koordinasi RT/RW',
            'slug' => 'rapat-koordinasi-rt-rw',
            'description' => 'Membahas tentang keamanan lingkungan.',
            'category' => 'rapat',
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-10',
            'start_time' => '09:00:00',
            'end_time' => '11:00:00',
            'location' => 'Aula Desa',
            'status' => 'published',
            'created_by' => auth()->id(),
        ]);

        $response = $this->get(route('village-agendas.index'));

        $response->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('admins/village-agendas/index')
                    ->where('agendas.total', 1)
                    ->where('agendas.data.0.title', 'Rapat Koordinasi RT/RW')
            );
    }

    public function test_user_without_permission_cannot_view_index()
    {
        /** @var User $user */
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('village-agendas.index'));
        $response->assertForbidden();
    }

    public function test_user_can_create_village_agenda()
    {
        $user = $this->signInWithPermission('c-village-agendas');

        $response = $this->post(route('village-agendas.store'), [
            'title' => 'Musyawarah Perencanaan Desa',
            'description' => 'Membahas program pembangunan tahun depan.',
            'category' => 'musyawarah',
            'start_date' => '2026-07-15',
            'end_date' => '2026-07-15',
            'start_time' => '08:00',
            'end_time' => '12:00',
            'location' => 'Balai Pertemuan',
            'address' => 'Jl. Utama No. 1',
            'status' => 'draft',
        ]);

        $response->assertRedirect(route('village-agendas.index'));
        $this->assertDatabaseHas('village_agendas', [
            'title' => 'Musyawarah Perencanaan Desa',
            'slug' => 'musyawarah-perencanaan-desa',
            'category' => 'musyawarah',
            'location' => 'Balai Pertemuan',
            'created_by' => $user->id,
        ]);
    }

    public function test_user_cannot_create_agenda_with_invalid_date_or_time()
    {
        $this->signInWithPermission('c-village-agendas');

        // End date before start date
        $response = $this->post(route('village-agendas.store'), [
            'title' => 'Agenda Error',
            'description' => 'Deskripsi agenda.',
            'category' => 'kegiatan',
            'start_date' => '2026-07-15',
            'end_date' => '2026-07-14',
            'start_time' => '08:00',
            'end_time' => '12:00',
            'location' => 'Balai Desa',
            'status' => 'draft',
        ]);

        $response->assertSessionHasErrors(['end_date']);

        // End time before start time on same day
        $response2 = $this->post(route('village-agendas.store'), [
            'title' => 'Agenda Error 2',
            'description' => 'Deskripsi agenda.',
            'category' => 'kegiatan',
            'start_date' => '2026-07-15',
            'end_date' => '2026-07-15',
            'start_time' => '10:00',
            'end_time' => '09:00',
            'location' => 'Balai Desa',
            'status' => 'draft',
        ]);

        $response2->assertSessionHasErrors(['end_time']);
    }

    public function test_user_can_update_village_agenda()
    {
        $user = $this->signInWithPermission('u-village-agendas');

        $agenda = VillageAgenda::create([
            'title' => 'Agenda Awal',
            'slug' => 'agenda-awal',
            'description' => 'Deskripsi awal.',
            'category' => 'kegiatan',
            'start_date' => '2026-07-12',
            'end_date' => '2026-07-12',
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'location' => 'Lapangan Desa',
            'status' => 'draft',
            'created_by' => $user->id,
        ]);

        $response = $this->put(route('village-agendas.update', $agenda), [
            'title' => 'Agenda Baru',
            'description' => 'Deskripsi baru.',
            'category' => 'kegiatan',
            'start_date' => '2026-07-12',
            'end_date' => '2026-07-12',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'location' => 'Lapangan Desa Utama',
            'status' => 'published',
        ]);

        $response->assertRedirect(route('village-agendas.index'));
        $this->assertDatabaseHas('village_agendas', [
            'id' => $agenda->id,
            'title' => 'Agenda Baru',
            'slug' => 'agenda-baru',
            'location' => 'Lapangan Desa Utama',
            'status' => 'published',
        ]);
    }

    public function test_user_can_delete_village_agenda()
    {
        $user = $this->signInWithPermission('d-village-agendas');

        $agenda = VillageAgenda::create([
            'title' => 'Agenda Hapus',
            'slug' => 'agenda-hapus',
            'description' => 'Akan dihapus.',
            'category' => 'kegiatan',
            'start_date' => '2026-07-12',
            'end_date' => '2026-07-12',
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'location' => 'Lapangan Desa',
            'status' => 'draft',
            'created_by' => $user->id,
        ]);

        $response = $this->delete(route('village-agendas.destroy', $agenda));

        $response->assertRedirect(route('village-agendas.index'));
        $this->assertSoftDeleted('village_agendas', [
            'id' => $agenda->id,
        ]);
    }
}
