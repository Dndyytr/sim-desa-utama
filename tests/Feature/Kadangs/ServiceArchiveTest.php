<?php

namespace Tests\Feature\Kadangs;

use App\Models\Letter;
use App\Models\Resident;
use App\Models\Service;
use App\Models\ServiceArchive;
use App\Models\Submission;
use App\Models\TypeService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ServiceArchiveTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        Permission::firstOrCreate(['name' => 'r-kadang-archives', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'u-kadang-archives', 'guard_name' => 'web']);
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
        $typeService = TypeService::where('service_code', 'SKU-ARC')->first();
        if (! $typeService) {
            $typeService = new TypeService;
            $typeService->service_code = 'SKU-ARC';
            $typeService->service_name = 'Surat Keterangan Usaha';
            $typeService->description = 'Layanan pembuatan SKU';
            $typeService->is_active = true;
            $typeService->save();
        }

        return $typeService;
    }

    private function createServiceWithArchive(?User $assignedTo = null): ServiceArchive
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
        $service->status = 'finished';
        $service->assigned_to = $assignedTo?->id;
        $service->draft_content = 'Ini adalah draf surat resmi.';
        $service->result = 'Berkas lengkap.';
        $service->save();

        $letter = new Letter;
        $letter->service_id = $service->id;
        $letter->letter_number = '470/'.rand(1, 999).'/DSU/VII/2026';
        $letter->file_path = 'letters/test.pdf';
        $letter->generated_by = $assignedTo?->id;
        $letter->generated_at = now();
        $letter->save();

        $archiveCounter = ServiceArchive::count() + 1;
        $archive = new ServiceArchive;
        $archive->archive_number = 'ARSIP/2026/'.str_pad($archiveCounter, 3, '0', STR_PAD_LEFT);
        $archive->service_id = $service->id;
        $archive->status = 'aktif';
        $archive->archived_at = now();
        $archive->archived_by = $assignedTo?->id;
        $archive->save();

        return $archive;
    }

    public function test_guests_cannot_access_archives()
    {
        $response = $this->get(route('kadangs.archives.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_unauthorized_users_cannot_access_archives()
    {
        $this->signIn();
        $response = $this->get(route('kadangs.archives.index'));
        $response->assertForbidden();
    }

    public function test_authorized_users_can_view_archives_index()
    {
        $currentUser = $this->signIn(['r-kadang-archives']);
        $archive = $this->createServiceWithArchive($currentUser);

        $response = $this->get(route('kadangs.archives.index'));
        $response->assertOk();
        $response->assertSee(str_replace('/', '\/', $archive->archive_number));
    }

    public function test_can_view_archive_detail()
    {
        $currentUser = $this->signIn(['r-kadang-archives']);
        $archive = $this->createServiceWithArchive($currentUser);

        $response = $this->get(route('kadangs.archives.show', $archive->id));
        $response->assertOk();
        $response->assertSee(str_replace('/', '\/', $archive->archive_number));
    }

    public function test_can_search_archives()
    {
        $currentUser = $this->signIn(['r-kadang-archives']);
        $archive = $this->createServiceWithArchive($currentUser);

        $response = $this->get(route('kadangs.archives.index', ['search' => 'ARSIP']));
        $response->assertOk();
        $response->assertSee(str_replace('/', '\/', $archive->archive_number));
    }

    public function test_can_filter_archives_by_status()
    {
        $currentUser = $this->signIn(['r-kadang-archives']);
        $archive = $this->createServiceWithArchive($currentUser);

        $response = $this->get(route('kadangs.archives.index', ['status' => 'aktif']));
        $response->assertOk();
        $response->assertSee(str_replace('/', '\/', $archive->archive_number));
    }

    public function test_can_update_archive_status()
    {
        $currentUser = $this->signIn(['u-kadang-archives']);
        $archive = $this->createServiceWithArchive($currentUser);

        $response = $this->put(route('kadangs.archives.update', $archive->id), [
            'status' => 'retensi',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('service_archives', [
            'id' => $archive->id,
            'status' => 'retensi',
        ]);
    }

    public function test_cannot_update_archive_with_invalid_status()
    {
        $currentUser = $this->signIn(['u-kadang-archives']);
        $archive = $this->createServiceWithArchive($currentUser);

        $response = $this->put(route('kadangs.archives.update', $archive->id), [
            'status' => 'invalid_status',
        ]);

        $response->assertSessionHasErrors('status');
    }
}
