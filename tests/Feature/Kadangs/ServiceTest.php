<?php

namespace Tests\Feature\Kadangs;

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

        Permission::firstOrCreate(['name' => 'r-services', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'u-services', 'guard_name' => 'web']);
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

    private function createService(?User $assignedTo = null): Service
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
        $service->status = 'processing';
        $service->assigned_to = $assignedTo?->id;
        $service->save();

        return $service;
    }

    public function test_guests_cannot_access_services()
    {
        $response = $this->get(route('kadangs.services.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_unauthorized_users_cannot_access_services()
    {
        $this->signIn();
        $response = $this->get(route('kadangs.services.index'));
        $response->assertForbidden();
    }

    public function test_authorized_users_can_view_assigned_services_only()
    {
        $currentUser = $this->signIn(['r-services']);
        $anotherUser = User::factory()->create();

        $assignedService = $this->createService($currentUser);
        $unassignedService = $this->createService($anotherUser);

        $response = $this->get(route('kadangs.services.index'));
        $response->assertOk();

        $response->assertSee($assignedService->service_number);
        $response->assertDontSee($unassignedService->service_number);
    }

    public function test_can_show_assigned_service_details()
    {
        $currentUser = $this->signIn(['r-services']);
        $service = $this->createService($currentUser);

        $response = $this->get(route('kadangs.services.show', $service->id));
        $response->assertOk();
    }

    public function test_cannot_show_service_details_assigned_to_someone_else()
    {
        $this->signIn(['r-services']);
        $anotherUser = User::factory()->create();
        $service = $this->createService($anotherUser);

        $response = $this->get(route('kadangs.services.show', $service->id));
        $response->assertForbidden();
    }

    public function test_can_process_assigned_service_successfully()
    {
        $currentUser = $this->signIn(['r-services', 'u-services']);
        $service = $this->createService($currentUser);

        $response = $this->patch(route('kadangs.services.process', $service->id), [
            'notes' => 'Berkas lengkap dan sesuai.',
        ]);

        $response->assertRedirect(route('kadangs.services.show', $service->id));
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'approved',
            'notes' => 'Berkas lengkap dan sesuai.',
        ]);

        $this->assertDatabaseHas('service_logs', [
            'submission_id' => $service->submission_id,
            'stage' => 'Processing',
            'activity' => 'Layanan selesai diproses dan diteruskan untuk persetujuan akhir',
            'notes' => 'Berkas lengkap dan sesuai.',
        ]);
    }

    public function test_cannot_process_service_assigned_to_someone_else()
    {
        $this->signIn(['r-services', 'u-services']);
        $anotherUser = User::factory()->create();
        $service = $this->createService($anotherUser);

        $response = $this->patch(route('kadangs.services.process', $service->id), [
            'notes' => 'Catatan',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'processing',
        ]);
    }

    public function test_cannot_process_non_processing_service()
    {
        $currentUser = $this->signIn(['r-services', 'u-services']);
        $service = $this->createService($currentUser);
        $service->status = 'approved';
        $service->save();

        $response = $this->patch(route('kadangs.services.process', $service->id), [
            'notes' => 'Catatan',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'approved',
        ]);
    }
}
