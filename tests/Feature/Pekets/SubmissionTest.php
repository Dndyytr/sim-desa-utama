<?php

namespace Tests\Feature\Pekets;

use App\Models\Resident;
use App\Models\Submission;
use App\Models\TypeService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class SubmissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::firstOrCreate(['name' => 'r-submissions', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'c-submissions', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'u-submissions', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'd-submissions', 'guard_name' => 'web']);
    }

    private function signIn(array $permissions = []): User
    {
        /** @var User $user */
        $user = User::factory()->create();
        $user->givePermissionTo($permissions);
        $this->actingAs($user);

        return $user;
    }

    private function createResident(array $overrides = []): Resident
    {
        $resident = new Resident;
        $resident->nik = $overrides['nik'] ?? '1234567890123456';
        $resident->no_kk = $overrides['no_kk'] ?? '1234567890123456';
        $resident->name = $overrides['name'] ?? 'John Doe';
        $resident->birth_place = $overrides['birth_place'] ?? 'Jakarta';
        $resident->birth_date = $overrides['birth_date'] ?? '1990-01-01';
        $resident->gender = $overrides['gender'] ?? 'Laki-laki';
        $resident->religion = $overrides['religion'] ?? 'Islam';
        $resident->marital_status = $overrides['marital_status'] ?? 'Belum Kawin';
        $resident->occupation = $overrides['occupation'] ?? 'Swasta';
        $resident->address = $overrides['address'] ?? 'Jl. Merdeka No. 1';
        $resident->is_active = $overrides['is_active'] ?? true;
        $resident->save();

        return $resident;
    }

    private function createTypeService(array $overrides = []): TypeService
    {
        $typeService = new TypeService;
        $typeService->service_code = $overrides['service_code'] ?? 'SKU';
        $typeService->service_name = $overrides['service_name'] ?? 'Surat Keterangan Usaha';
        $typeService->description = $overrides['description'] ?? 'Layanan pembuatan SKU';
        $typeService->is_active = $overrides['is_active'] ?? true;
        $typeService->save();

        return $typeService;
    }

    public function test_guests_cannot_access_submissions()
    {
        $response = $this->get(route('submissions.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_unauthorized_users_cannot_access_submissions()
    {
        $this->signIn();
        $response = $this->get(route('submissions.index'));
        $response->assertForbidden();
    }

    public function test_authorized_users_can_view_submissions_index()
    {
        $this->signIn(['r-submissions']);
        $response = $this->get(route('submissions.index'));
        $response->assertOk();
    }

    public function test_can_store_submission_offline_successfully()
    {
        $this->signIn(['c-submissions', 'r-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        Storage::fake('public');

        $response = $this->post(route('submissions.store'), [
            'resident_id' => $resident->id,
            'type_service_id' => $typeService->id,
            'subject' => 'Permohonan SKU Baru',
            'description' => 'Ingin membuat SKU untuk usaha toko kelontong',
            'attachments' => [
                UploadedFile::fake()->create('ktp.pdf', 100),
                UploadedFile::fake()->image('usaha.jpg', 200),
            ],
        ]);

        $response->assertRedirect(route('submissions.index'));
        $this->assertDatabaseHas('submissions', [
            'resident_id' => $resident->id,
            'type_service_id' => $typeService->id,
            'subject' => 'Permohonan SKU Baru',
            'status' => 'pending',
            'source' => 'offline',
        ]);

        $submission = Submission::first();
        $this->assertNotNull($submission);
        $this->assertStringStartsWith('SUB-'.date('Ymd').'-', $submission->submission_number);

        $this->assertCount(2, $submission->attachments);
        $this->assertDatabaseHas('submission_attachments', [
            'submission_id' => $submission->id,
            'file_name' => 'ktp.pdf',
        ]);

        Storage::disk('public')->assertExists("submissions/{$submission->submission_number}/ktp.pdf");
        Storage::disk('public')->assertExists("submissions/{$submission->submission_number}/usaha.jpg");
    }

    public function test_cannot_store_submission_if_resident_is_inactive()
    {
        $this->signIn(['c-submissions']);
        $resident = $this->createResident(['is_active' => false]);
        $typeService = $this->createTypeService();

        $response = $this->post(route('submissions.store'), [
            'resident_id' => $resident->id,
            'type_service_id' => $typeService->id,
            'subject' => 'Permohonan SKU Baru',
        ]);

        $response->assertSessionHasErrors(['resident_id']);
        $this->assertDatabaseEmpty('submissions');
    }

    public function test_can_show_submission_details()
    {
        $user = $this->signIn(['r-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->submitted_by = $user->id;
        $submission->save();

        $response = $this->get(route('submissions.show', $submission->id));
        $response->assertOk();
    }

    public function test_can_delete_pending_submission()
    {
        $this->signIn(['d-submissions', 'r-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'pending';
        $submission->save();

        Storage::fake('public');
        Storage::disk('public')->put("submissions/{$submission->submission_number}/file.pdf", 'dummy');

        $response = $this->delete(route('submissions.destroy', $submission->id));
        $response->assertRedirect(route('submissions.index'));
        $this->assertDatabaseMissing('submissions', ['id' => $submission->id]);
        Storage::disk('public')->assertDirectoryEmpty("submissions/{$submission->submission_number}");
    }

    public function test_cannot_delete_non_pending_submission()
    {
        $this->signIn(['d-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'verified';
        $submission->save();

        $response = $this->delete(route('submissions.destroy', $submission->id));
        $response->assertRedirect(route('submissions.index'));
        $this->assertDatabaseHas('submissions', ['id' => $submission->id]);
    }

    public function test_can_render_edit_submission_page()
    {
        $this->signIn(['u-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'pending';
        $submission->save();

        $response = $this->get(route('submissions.edit', $submission->id));
        $response->assertOk();
    }

    public function test_cannot_render_edit_page_if_non_pending()
    {
        $this->signIn(['u-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'verified';
        $submission->save();

        $response = $this->get(route('submissions.edit', $submission->id));
        $response->assertRedirect(route('submissions.index'));
    }

    public function test_can_update_pending_submission_successfully()
    {
        $this->signIn(['u-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();
        $newTypeService = $this->createTypeService(['service_code' => 'SKE', 'service_name' => 'Surat Keterangan Empat']);

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'pending';
        $submission->save();

        Storage::fake('public');

        $response = $this->put(route('submissions.update', $submission->id), [
            'type_service_id' => $newTypeService->id,
            'subject' => 'Permohonan SKE Baru',
            'description' => 'Keperluan mendesak',
            'attachments' => [
                UploadedFile::fake()->create('dokumen_baru.pdf', 100),
            ],
        ]);

        $response->assertRedirect(route('submissions.index'));
        $this->assertDatabaseHas('submissions', [
            'id' => $submission->id,
            'type_service_id' => $newTypeService->id,
            'subject' => 'Permohonan SKE Baru',
            'description' => 'Keperluan mendesak',
        ]);

        // Assert ServiceLog was created
        $this->assertDatabaseHas('service_logs', [
            'submission_id' => $submission->id,
            'stage' => 'Submission',
            'activity' => 'Pengajuan Diperbarui',
        ]);
    }

    public function test_cannot_update_non_pending_submission()
    {
        $this->signIn(['u-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'verified';
        $submission->save();

        $response = $this->put(route('submissions.update', $submission->id), [
            'type_service_id' => $typeService->id,
            'subject' => 'Permohonan SKU Baru',
        ]);

        $response->assertRedirect(route('submissions.index'));
        $this->assertDatabaseHas('submissions', [
            'id' => $submission->id,
            'subject' => 'Permohonan SKU',
        ]);
    }

    public function test_can_cancel_pending_submission_with_reason()
    {
        $this->signIn(['u-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'pending';
        $submission->save();

        $response = $this->patch(route('submissions.cancel', $submission->id), [
            'reason' => 'Salah memilih pemohon',
        ]);

        $response->assertRedirect(route('submissions.index'));
        $this->assertDatabaseHas('submissions', [
            'id' => $submission->id,
            'status' => 'cancelled',
        ]);

        // Assert ServiceLog was created with the cancel reason
        $this->assertDatabaseHas('service_logs', [
            'submission_id' => $submission->id,
            'stage' => 'Submission',
            'activity' => 'Pengajuan Dibatalkan',
            'notes' => 'Alasan: Salah memilih pemohon',
        ]);
    }

    public function test_cannot_cancel_non_pending_submission()
    {
        $this->signIn(['u-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'verified';
        $submission->save();

        $response = $this->patch(route('submissions.cancel', $submission->id), [
            'reason' => 'Batal saja',
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('submissions', [
            'id' => $submission->id,
            'status' => 'verified',
        ]);
    }

    public function test_can_approve_pending_submission()
    {
        $this->signIn(['u-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'pending';
        $submission->save();

        $response = $this->patch(route('submissions.verify', $submission->id), [
            'action' => 'approve',
            'notes' => 'Berkas lengkap dan sesuai',
        ]);

        $response->assertRedirect(route('submissions.index'));
        $this->assertDatabaseHas('submissions', [
            'id' => $submission->id,
            'status' => 'verified',
            'notes' => 'Berkas lengkap dan sesuai',
        ]);

        $this->assertDatabaseHas('services', [
            'submission_id' => $submission->id,
            'status' => 'processing',
            'notes' => 'Berkas lengkap dan sesuai',
        ]);

        $this->assertDatabaseHas('service_logs', [
            'submission_id' => $submission->id,
            'stage' => 'Verification',
            'activity' => 'Verifikasi Berkas Disetujui',
            'notes' => 'Berkas lengkap dan sesuai',
        ]);
    }

    public function test_can_reject_pending_submission()
    {
        $this->signIn(['u-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'pending';
        $submission->save();

        $response = $this->patch(route('submissions.verify', $submission->id), [
            'action' => 'reject',
            'notes' => 'KTP tidak terbaca jelas',
        ]);

        $response->assertRedirect(route('submissions.index'));
        $this->assertDatabaseHas('submissions', [
            'id' => $submission->id,
            'status' => 'rejected',
            'notes' => 'KTP tidak terbaca jelas',
        ]);

        $this->assertDatabaseMissing('services', [
            'submission_id' => $submission->id,
        ]);

        $this->assertDatabaseHas('service_logs', [
            'submission_id' => $submission->id,
            'stage' => 'Verification',
            'activity' => 'Verifikasi Berkas Ditolak',
            'notes' => 'KTP tidak terbaca jelas',
        ]);
    }

    public function test_cannot_verify_non_pending_submission()
    {
        $this->signIn(['u-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'verified';
        $submission->save();

        $response = $this->patch(route('submissions.verify', $submission->id), [
            'action' => 'approve',
            'notes' => 'Setuju ulang',
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('submissions', [
            'id' => $submission->id,
            'status' => 'verified',
        ]);
    }

    public function test_can_request_revision_on_pending_submission()
    {
        $this->signIn(['u-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'pending';
        $submission->save();

        $response = $this->patch(route('submissions.verify', $submission->id), [
            'action' => 'needs_correction',
            'notes' => 'Tolong lengkapi foto KTP terbaru',
        ]);

        $response->assertRedirect(route('submissions.index'));
        $this->assertDatabaseHas('submissions', [
            'id' => $submission->id,
            'status' => 'needs_correction',
            'notes' => 'Tolong lengkapi foto KTP terbaru',
        ]);

        $this->assertDatabaseMissing('services', [
            'submission_id' => $submission->id,
        ]);

        $this->assertDatabaseHas('service_logs', [
            'submission_id' => $submission->id,
            'stage' => 'Verification',
            'activity' => 'Perlu Perbaikan Berkas',
            'notes' => 'Tolong lengkapi foto KTP terbaru',
        ]);
    }

    public function test_can_render_edit_submission_page_with_needs_correction_status()
    {
        $this->signIn(['u-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'needs_correction';
        $submission->save();

        $response = $this->get(route('submissions.edit', $submission->id));
        $response->assertOk();
    }

    public function test_can_update_needs_correction_submission_and_resets_status_to_pending()
    {
        $this->signIn(['u-submissions']);
        $resident = $this->createResident();
        $typeService = $this->createTypeService();

        $submission = new Submission;
        $submission->submission_number = 'SUB-20260628-00001';
        $submission->resident_id = $resident->id;
        $submission->type_service_id = $typeService->id;
        $submission->subject = 'Permohonan SKU';
        $submission->status = 'needs_correction';
        $submission->save();

        $response = $this->put(route('submissions.update', $submission->id), [
            'type_service_id' => $typeService->id,
            'subject' => 'Permohonan SKU Direvisi',
            'description' => 'Sudah dilengkapi KTP baru',
        ]);

        $response->assertRedirect(route('submissions.index'));
        $this->assertDatabaseHas('submissions', [
            'id' => $submission->id,
            'subject' => 'Permohonan SKU Direvisi',
            'description' => 'Sudah dilengkapi KTP baru',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('service_logs', [
            'submission_id' => $submission->id,
            'stage' => 'Submission',
            'activity' => 'Pengajuan Diperbarui',
        ]);
    }
}
