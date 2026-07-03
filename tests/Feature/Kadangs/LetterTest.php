<?php

namespace Tests\Feature\Kadangs;

use App\Models\Letter;
use App\Models\Resident;
use App\Models\Service;
use App\Models\Submission;
use App\Models\TypeService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class LetterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        Permission::firstOrCreate(['name' => 'r-kadang-letters', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'u-kadang-letters', 'guard_name' => 'web']);
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

    private function createService(?User $assignedTo = null, string $status = 'completed'): Service
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
        $service->assigned_to = $assignedTo?->id;
        $service->draft_content = 'Ini adalah draf surat resmi yang diterbitkan.';
        $service->result = 'Berkas lengkap.';
        $service->save();

        return $service;
    }

    public function test_guests_cannot_access_letters()
    {
        $response = $this->get(route('kadangs.letters.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_unauthorized_users_cannot_access_letters()
    {
        $this->signIn();
        $response = $this->get(route('kadangs.letters.index'));
        $response->assertForbidden();
    }

    public function test_authorized_users_can_view_letters_index()
    {
        $currentUser = $this->signIn(['r-kadang-letters']);
        $service = $this->createService($currentUser, 'completed');

        $response = $this->get(route('kadangs.letters.index'));
        $response->assertOk();
        $response->assertSee($service->service_number);
    }

    public function test_can_view_generate_preview_page()
    {
        $currentUser = $this->signIn(['u-kadang-letters']);
        $service = $this->createService($currentUser, 'completed');

        $response = $this->get(route('kadangs.letters.create', ['service_id' => $service->id]));
        $response->assertOk();
    }

    public function test_can_generate_letter_successfully()
    {
        Storage::fake('public');

        $currentUser = $this->signIn(['u-kadang-letters']);
        $service = $this->createService($currentUser, 'completed');

        $response = $this->post(route('kadangs.letters.store'), [
            'service_id' => $service->id,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => 'finished',
        ]);

        $this->assertDatabaseHas('letters', [
            'service_id' => $service->id,
            'generated_by' => $currentUser->id,
        ]);

        $letter = Letter::where('service_id', $service->id)->first();
        Storage::disk('public')->assertExists($letter->file_path);

        $this->assertDatabaseHas('service_logs', [
            'submission_id' => $service->submission_id,
            'stage' => 'Finished',
            'activity' => 'Surat resmi diterbitkan & Layanan Diarsipkan',
        ]);
    }

    public function test_cannot_generate_letter_if_not_completed()
    {
        $currentUser = $this->signIn(['u-kadang-letters']);
        $service = $this->createService($currentUser, 'processing');

        $response = $this->post(route('kadangs.letters.store'), [
            'service_id' => $service->id,
        ]);

        $response->assertStatus(404); // Fails in route model binding/findOrFail
    }

    public function test_cannot_generate_duplicate_letter()
    {
        $currentUser = $this->signIn(['u-kadang-letters']);
        $service = $this->createService($currentUser, 'completed');

        // Pre-create a letter record to simulate a previously generated letter
        $letter = new Letter;
        $letter->service_id = $service->id;
        $letter->letter_number = '470/001/DSU/VII/2026';
        $letter->file_path = 'letters/test.pdf';
        $letter->generated_by = $currentUser->id;
        $letter->generated_at = now();
        $letter->save();

        // Attempt to generate again
        $response = $this->post(route('kadangs.letters.store'), [
            'service_id' => $service->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Surat sudah pernah diterbitkan untuk layanan ini.');
    }

    public function test_can_download_generated_letter()
    {
        Storage::fake('public');

        $currentUser = $this->signIn(['u-kadang-letters']);
        $service = $this->createService($currentUser, 'completed');

        $this->post(route('kadangs.letters.store'), [
            'service_id' => $service->id,
        ]);

        $letter = Letter::where('service_id', $service->id)->firstOrFail();

        $response = $this->get(route('kadangs.letters.download', $letter->id));
        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }
}
