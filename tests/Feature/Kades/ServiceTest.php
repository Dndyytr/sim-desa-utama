<?php

namespace Tests\Feature\Kades;

use App\Models\Resident;
use App\Models\Service;
use App\Models\Submission;
use App\Models\TypeService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        Permission::firstOrCreate(['name' => 'r-kades-services', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'u-kades-services', 'guard_name' => 'web']);
    }

    private function signIn(array $permissions = []): User
    {
        /** @var User $user */
        $user = User::factory()->create();
        $user->givePermissionTo($permissions);
        $this->actingAs($user);

        return $user;
    }

    private function createResident(): Resident
    {
        $nik = (string) rand(1000000000000000, 9999999999999999);
        $resident = new Resident;
        $resident->nik = $nik;
        $resident->no_kk = $nik;
        $resident->name = 'John Doe '.rand(1, 100);
        $resident->birth_place = 'Jakarta';
        $resident->birth_date = '1990-01-01';
        $resident->gender = 'Laki-laki';
        $resident->religion = 'Islam';
        $resident->marital_status = 'Belum Kawin';
        $resident->occupation = 'Swasta';
        $resident->address = 'Jl. Merdeka No. 1';
        $resident->is_active = true;
        $resident->save();

        return $resident;
    }

    private function createTypeService(): TypeService
    {
        $typeService = TypeService::where('service_code', 'SKU')->first();
        if (! $typeService) {
            $typeService = new TypeService;
            $typeService->service_code = 'SKU';
            $typeService->service_name = 'Surat Keterangan Usaha';
            $typeService->description = 'Layanan pembuatan SKU';
            $typeService->is_active = true;
            $typeService->save();
        }

        return $typeService;
    }

    private function createService(string $status = 'approved'): Service
    {
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-'.time().'-'.rand(1000, 9999);
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'verified';
        $submission->save();

        $service = new Service;
        $service->service_number = 'SRV-'.time().'-'.rand(1000, 9999);
        $service->submission_id = $submission->id;
        $service->status = $status;
        $service->result = 'Hasil proses lengkap.';
        $service->draft_content = 'DRAFT CONTENT SURAT';
        $service->notes = 'Catatan awal.';
        $service->save();

        return $service;
    }

    public function test_guests_cannot_access_services()
    {
        $response = $this->get(route('kades.services.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_unauthorized_users_cannot_access_services()
    {
        $this->signIn();
        $response = $this->get(route('kades.services.index'));
        $response->assertForbidden();
    }

    public function test_authorized_users_can_view_services_list()
    {
        $this->signIn(['r-kades-services']);
        $service = $this->createService();

        $response = $this->get(route('kades.services.index'));
        $response->assertOk();
        $response->assertSee($service->service_number);
    }

    public function test_can_show_service_details()
    {
        $this->signIn(['r-kades-services']);
        $service = $this->createService();

        $response = $this->get(route('kades.services.show', $service->id));
        $response->assertOk();
    }

    public function test_kades_can_approve_service_successfully()
    {
        $this->signIn(['r-kades-services', 'u-kades-services']);
        $service = $this->createService();

        $response = $this->patch(route('kades.services.approve', $service->id), [
            'notes' => 'Surat disetujui untuk diterbitkan.',
        ]);

        $response->assertRedirect(route('kades.services.show', $service->id));
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'completed',
            'notes' => 'Surat disetujui untuk diterbitkan.',
        ]);

        $this->assertDatabaseHas('service_logs', [
            'submission_id' => $service->submission_id,
            'stage' => 'Approved',
            'activity' => 'Layanan disetujui secara akhir oleh Kepala Desa',
            'notes' => 'Surat disetujui untuk diterbitkan.',
        ]);
    }

    public function test_cannot_approve_service_without_draft_or_result()
    {
        $this->signIn(['r-kades-services', 'u-kades-services']);
        $service = $this->createService();
        $service->draft_content = null;
        $service->save();

        $response = $this->patch(route('kades.services.approve', $service->id), [
            'notes' => 'Catatan',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'approved',
        ]);
    }

    public function test_kades_can_request_revision_successfully()
    {
        $this->signIn(['r-kades-services', 'u-kades-services']);
        $service = $this->createService();

        $response = $this->patch(route('kades.services.revise', $service->id), [
            'notes' => 'Perbaiki penulisan NIK pemohon.',
        ]);

        $response->assertRedirect(route('kades.services.show', $service->id));
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'processing',
            'notes' => 'Perbaiki penulisan NIK pemohon.',
        ]);

        $this->assertDatabaseHas('service_logs', [
            'submission_id' => $service->submission_id,
            'stage' => 'Revision',
            'activity' => 'Layanan dikembalikan untuk revisi oleh Kepala Desa',
            'notes' => 'Perbaiki penulisan NIK pemohon.',
        ]);
    }

    public function test_cannot_request_revision_without_notes()
    {
        $this->signIn(['r-kades-services', 'u-kades-services']);
        $service = $this->createService();

        $response = $this->patch(route('kades.services.revise', $service->id), [
            'notes' => '',
        ]);

        $response->assertSessionHasErrors(['notes']);
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'approved',
        ]);
    }

    public function test_kades_can_reject_service_successfully()
    {
        $this->signIn(['r-kades-services', 'u-kades-services']);
        $service = $this->createService();

        $response = $this->patch(route('kades.services.reject', $service->id), [
            'notes' => 'Layanan ditolak karena pemohon pindah domisili.',
        ]);

        $response->assertRedirect(route('kades.services.show', $service->id));
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'rejected',
            'notes' => 'Layanan ditolak karena pemohon pindah domisili.',
        ]);

        $this->assertDatabaseHas('service_logs', [
            'submission_id' => $service->submission_id,
            'stage' => 'Rejected',
            'activity' => 'Layanan ditolak oleh Kepala Desa',
            'notes' => 'Layanan ditolak karena pemohon pindah domisili.',
        ]);
    }

    public function test_cannot_reject_service_without_notes()
    {
        $this->signIn(['r-kades-services', 'u-kades-services']);
        $service = $this->createService();

        $response = $this->patch(route('kades.services.reject', $service->id), [
            'notes' => '',
        ]);

        $response->assertSessionHasErrors(['notes']);
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'approved',
        ]);
    }

    public function test_cannot_make_decision_on_non_approved_service()
    {
        $this->signIn(['r-kades-services', 'u-kades-services']);
        $service = $this->createService('processing');

        $response = $this->patch(route('kades.services.approve', $service->id), [
            'notes' => 'Notes',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'processing',
        ]);
    }
}
