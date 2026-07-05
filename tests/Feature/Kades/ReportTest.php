<?php

namespace Tests\Feature\Kades;

use App\Models\Resident;
use App\Models\Service;
use App\Models\Submission;
use App\Models\TypeService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        Permission::firstOrCreate(['name' => 'r-kades-reports', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'kadang', 'guard_name' => 'web']);
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
        $resident->name = 'Jane Doe '.rand(1, 100);
        $resident->birth_place = 'Jakarta';
        $resident->birth_date = '1990-01-01';
        $resident->gender = 'Perempuan';
        $resident->religion = 'Islam';
        $resident->marital_status = 'Belum Kawin';
        $resident->occupation = 'Swasta';
        $resident->address = 'Jl. Merdeka No. 2';
        $resident->is_active = true;
        $resident->save();

        return $resident;
    }

    private function createTypeService(): TypeService
    {
        $typeService = TypeService::where('service_code', 'SKU-RPT')->first();
        if (! $typeService) {
            $typeService = new TypeService;
            $typeService->service_code = 'SKU-RPT';
            $typeService->service_name = 'Surat Keterangan Usaha';
            $typeService->description = 'Layanan pembuatan SKU';
            $typeService->is_active = true;
            $typeService->save();
        }

        return $typeService;
    }

    private function createSubmissionWithService(string $serviceStatus = 'finished', ?User $officer = null): Submission
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
        $service->status = $serviceStatus;
        $service->assigned_to = $officer?->id;
        $service->draft_content = 'Ini adalah draf surat resmi.';
        $service->result = 'Berkas lengkap.';
        $service->save();

        return $submission;
    }

    public function test_guests_cannot_access_reports()
    {
        $response = $this->get(route('kades.reports.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_unauthorized_users_cannot_access_reports()
    {
        $this->signIn();
        $response = $this->get(route('kades.reports.index'));
        $response->assertForbidden();
    }

    public function test_authorized_users_can_view_reports_index()
    {
        $this->signIn(['r-kades-reports']);
        $this->createSubmissionWithService('finished');

        $response = $this->get(route('kades.reports.index'));
        $response->assertOk();
    }

    public function test_reports_display_correct_metrics()
    {
        $this->signIn(['r-kades-reports']);
        $this->createSubmissionWithService('finished');
        $this->createSubmissionWithService('processing');

        $response = $this->get(route('kades.reports.index'));
        $response->assertOk();

        // Check that the page rendered successfully with Inertia props
        $page = $response->original->getData()['page']['props'];
        $this->assertEquals(2, $page['metrics']['total_submissions']);
        $this->assertEquals(1, $page['metrics']['total_finished']);
    }

    public function test_can_filter_reports_by_status()
    {
        $this->signIn(['r-kades-reports']);
        $this->createSubmissionWithService('finished');
        $this->createSubmissionWithService('processing');

        $response = $this->get(route('kades.reports.index', ['status' => 'finished']));
        $response->assertOk();

        $page = $response->original->getData()['page']['props'];
        $this->assertEquals(1, $page['reports']['total']);
    }

    public function test_can_filter_reports_by_period()
    {
        $this->signIn(['r-kades-reports']);
        $this->createSubmissionWithService('finished');

        $response = $this->get(route('kades.reports.index', ['period' => 'today']));
        $response->assertOk();
    }

    public function test_can_search_reports()
    {
        $this->signIn(['r-kades-reports']);
        $submission = $this->createSubmissionWithService('finished');

        $searchTerm = substr($submission->submission_number, 0, 5);

        $response = $this->get(route('kades.reports.index', ['search' => $searchTerm]));
        $response->assertOk();
    }

    public function test_can_view_report_detail()
    {
        $this->signIn(['r-kades-reports']);
        $submission = $this->createSubmissionWithService('finished');

        $response = $this->get(route('kades.reports.show', $submission->id));
        $response->assertOk();
        $response->assertSee($submission->submission_number);
    }

    public function test_can_filter_by_custom_date_range()
    {
        $this->signIn(['r-kades-reports']);
        $this->createSubmissionWithService('finished');

        $response = $this->get(route('kades.reports.index', [
            'period' => 'custom',
            'start_date' => now()->subDays(7)->format('Y-m-d'),
            'end_date' => now()->format('Y-m-d'),
        ]));
        $response->assertOk();
    }

    public function test_invalid_period_returns_validation_error()
    {
        $this->signIn(['r-kades-reports']);

        $response = $this->get(route('kades.reports.index', ['period' => 'invalid_period']));
        $response->assertSessionHasErrors('period');
    }
}
