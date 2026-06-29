<?php

namespace Tests\Feature\Sekdes;

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
        $resident = new Resident;
        $resident->nik = '1234567890123456';
        $resident->no_kk = '1234567890123456';
        $resident->name = 'John Doe';
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
        $typeService = new TypeService;
        $typeService->service_code = 'SKU';
        $typeService->service_name = 'Surat Keterangan Usaha';
        $typeService->description = 'Layanan pembuatan SKU';
        $typeService->is_active = true;
        $typeService->save();

        return $typeService;
    }

    private function createService(): Service
    {
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260629-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'verified';
        $submission->save();

        $service = new Service;
        $service->service_number = 'SRV-20260629-00001';
        $service->submission_id = $submission->id;
        $service->status = 'processing';
        $service->save();

        return $service;
    }

    public function test_guests_cannot_access_services()
    {
        $response = $this->get(route('services.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_unauthorized_users_cannot_access_services()
    {
        $this->signIn();
        $response = $this->get(route('services.index'));
        $response->assertForbidden();
    }

    public function test_authorized_users_can_view_services_index()
    {
        $this->signIn(['r-services']);
        $this->createService();

        $response = $this->get(route('services.index'));
        $response->assertOk();
    }

    public function test_can_show_service_details()
    {
        $this->signIn(['r-services']);
        $service = $this->createService();

        $response = $this->get(route('services.show', $service->id));
        $response->assertOk();
    }

    public function test_can_dispose_service_successfully()
    {
        $this->signIn(['r-services', 'u-services']);
        $service = $this->createService();
        $officer = User::factory()->create(['name' => 'Kasi Pemerintahan']);

        $response = $this->patch(route('services.disposition', $service->id), [
            'assigned_to' => $officer->id,
            'notes' => 'Tolong diproses berkasnya.',
        ]);

        $response->assertRedirect(route('services.show', $service->id));
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'assigned_to' => $officer->id,
            'notes' => 'Tolong diproses berkasnya.',
        ]);

        $this->assertDatabaseHas('service_logs', [
            'submission_id' => $service->submission_id,
            'stage' => 'Disposition',
            'activity' => 'Layanan Didisposisikan ke Kasi Pemerintahan',
            'notes' => 'Tolong diproses berkasnya.',
        ]);
    }

    public function test_cannot_dispose_service_with_invalid_officer()
    {
        $this->signIn(['r-services', 'u-services']);
        $service = $this->createService();

        $response = $this->patch(route('services.disposition', $service->id), [
            'assigned_to' => 9999, // Invalid user ID
            'notes' => 'Instruksi',
        ]);

        $response->assertSessionHasErrors(['assigned_to']);
        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'assigned_to' => null,
        ]);
    }
}
