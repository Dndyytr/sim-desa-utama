<?php

namespace Tests\Feature;

use App\Models\Letter;
use App\Models\Resident;
use App\Models\Service;
use App\Models\ServiceLog;
use App\Models\Submission;
use App\Models\SubmissionAttachment;
use App\Models\TypeService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class FileAccessTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Resident $resident;

    protected TypeService $typeService;

    protected Submission $submission;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->resident = Resident::create([
            'nik' => '1234567890123456',
            'no_kk' => '1234567890123456',
            'name' => 'John Doe',
            'birth_place' => 'Jakarta',
            'birth_date' => '1990-01-01',
            'gender' => 'Laki-laki',
            'religion' => 'Islam',
            'marital_status' => 'Belum Kawin',
            'occupation' => 'Karyawan',
            'address' => 'Jl. Merdeka',
            'is_active' => true,
        ]);

        $this->typeService = TypeService::create([
            'service_code' => 'SKD',
            'service_name' => 'Domisili',
            'is_active' => true,
        ]);

        $this->submission = Submission::create([
            'submission_number' => 'SUB/2026/001',
            'resident_id' => $this->resident->id,
            'type_service_id' => $this->typeService->id,
            'submitted_by' => $this->user->id,
            'subject' => 'Surat Keterangan Domisili',
            'status' => 'pending',
            'source' => 'offline',
        ]);
    }

    public function test_guests_cannot_access_any_file_endpoints()
    {
        $attachment = SubmissionAttachment::create([
            'submission_id' => $this->submission->id,
            'file_name' => 'ktp.png',
            'file_path' => 'attachments/ktp.png',
            'file_type' => 'image/png',
            'file_size' => 1024,
            'uploaded_by' => $this->user->id,
        ]);

        $response = $this->get(route('files.attachments.preview', $attachment->id));
        $response->assertRedirect(route('login'));

        $response = $this->get(route('files.attachments.download', $attachment->id));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_without_permission_cannot_access_files()
    {
        $this->actingAs($this->user);

        $attachment = SubmissionAttachment::create([
            'submission_id' => $this->submission->id,
            'file_name' => 'ktp.png',
            'file_path' => 'attachments/ktp.png',
            'file_type' => 'image/png',
            'file_size' => 1024,
            'uploaded_by' => $this->user->id,
        ]);

        $response = $this->get(route('files.attachments.preview', $attachment->id));
        $response->assertStatus(403);
    }

    public function test_authorized_user_can_preview_and_download_attachment_and_it_logs_activity()
    {
        Storage::fake('public');
        Storage::disk('public')->put('attachments/ktp.png', 'fake file content');

        Permission::create(['name' => 'r-submissions']);
        $this->user->givePermissionTo('r-submissions');

        $this->actingAs($this->user);

        $attachment = SubmissionAttachment::create([
            'submission_id' => $this->submission->id,
            'file_name' => 'ktp.png',
            'file_path' => 'attachments/ktp.png',
            'file_type' => 'image/png',
            'file_size' => 1024,
            'uploaded_by' => $this->user->id,
        ]);

        // Test Preview
        $response = $this->get(route('files.attachments.preview', $attachment->id));
        $response->assertOk();
        $response->assertHeader('Content-Disposition', 'inline; filename="ktp.png"');

        $this->assertTrue(
            ServiceLog::where('submission_id', $this->submission->id)
                ->where('activity', 'Melihat Berkas')
                ->where('notes', 'like', '%ktp.png%')
                ->exists()
        );

        // Test Download
        $response = $this->get(route('files.attachments.download', $attachment->id));
        $response->assertOk();
        $response->assertHeader('Content-Disposition', 'attachment; filename=ktp.png');

        $this->assertTrue(
            ServiceLog::where('submission_id', $this->submission->id)
                ->where('activity', 'Unduh Berkas')
                ->where('notes', 'like', '%ktp.png%')
                ->exists()
        );
    }

    public function test_authorized_user_can_preview_download_and_print_letter_and_it_logs_activity()
    {
        Storage::fake('public');
        Storage::disk('public')->put('letters/letter.pdf', 'fake pdf content');

        Permission::create(['name' => 'r-kadang-services']);
        $this->user->givePermissionTo('r-kadang-services');

        $this->actingAs($this->user);

        $service = Service::create([
            'service_number' => 'SRV/2026/001',
            'submission_id' => $this->submission->id,
            'status' => 'completed',
        ]);

        $letter = Letter::create([
            'service_id' => $service->id,
            'letter_number' => '470/001/DSU/I/2026',
            'file_path' => 'letters/letter.pdf',
            'generated_by' => $this->user->id,
            'generated_at' => now(),
        ]);

        // Test Preview
        $response = $this->get(route('files.letters.preview', $letter->id));
        $response->assertOk();
        $response->assertHeader('Content-Disposition', 'inline; filename="470_001_DSU_I_2026.pdf"');

        $this->assertTrue(
            ServiceLog::where('submission_id', $this->submission->id)
                ->where('activity', 'Melihat Berkas')
                ->where('notes', 'like', '%470/001/DSU/I/2026%')
                ->exists()
        );

        // Test Download
        $response = $this->get(route('files.letters.download', $letter->id));
        $response->assertOk();
        $response->assertHeader('Content-Disposition', 'attachment; filename=470_001_DSU_I_2026.pdf');

        $this->assertTrue(
            ServiceLog::where('submission_id', $this->submission->id)
                ->where('activity', 'Unduh Berkas')
                ->where('notes', 'like', '%470/001/DSU/I/2026%')
                ->exists()
        );

        // Test Print
        $response = $this->get(route('files.letters.print', $letter->id));
        $response->assertOk();
        $response->assertHeader('Content-Disposition', 'inline; filename="470_001_DSU_I_2026.pdf"');

        $this->assertTrue(
            ServiceLog::where('submission_id', $this->submission->id)
                ->where('activity', 'Cetak Berkas')
                ->where('notes', 'like', '%470/001/DSU/I/2026%')
                ->exists()
        );
    }
}
