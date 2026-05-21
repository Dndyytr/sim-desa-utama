<?php

namespace Tests\Feature\Admins;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_are_sorted_by_oldest_created_time_by_default()
    {
        $this->signIn(now()); // Signed in user created today

        User::factory()->create([
            'email' => 'old@example.test',
            'created_at' => now()->subDays(2),
        ]);
        User::factory()->create([
            'email' => 'new@example.test',
            'created_at' => now()->subDay(),
        ]);

        $response = $this->get(route('users.index'));

        $response->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('admins/users/index')
                    ->where('users.data.0.email', 'old@example.test')
                    ->where('sort', 'created_asc')
            );
    }

    public function test_users_can_be_sorted_by_newest_created_time()
    {
        $this->signIn(now()->subYears(5)); // Signed in user created 5 years ago

        User::factory()->create([
            'email' => 'old@example.test',
            'created_at' => now()->subDays(2),
        ]);
        User::factory()->create([
            'email' => 'new@example.test',
            'created_at' => now(),
        ]);

        $response = $this->get(route('users.index', ['sort' => 'created_desc']));

        $response->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('admins/users/index')
                    ->where('users.data.0.email', 'new@example.test')
                    ->where('sort', 'created_desc')
            );
    }

    // public function test_users_can_be_filtered_by_role()
    // {
    //     $this->signIn();
    //     $adminRole = Role::create(['name' => 'Admin', 'guard_name' => 'web']);
    //     $staffRole = Role::create(['name' => 'Staff', 'guard_name' => 'web']);
    //     $admin = User::factory()->create(['email' => 'admin@example.test']);
    //     $staff = User::factory()->create(['email' => 'staff@example.test']);

    //     $admin->assignRole($adminRole);
    //     $staff->assignRole($staffRole);

    //     $response = $this->get(route('users.index', ['role' => $adminRole->id]));

    //     $response->assertOk()
    //         ->assertInertia(
    //             fn (Assert $page) => $page
    //                 ->component('admins/users/index')
    //                 ->where('users.total', 1)
    //                 ->where('users.data.0.email', 'admin@example.test')
    //         );
    // }

    public function test_users_can_be_filtered_by_email_verification_status()
    {
        $this->signIn();

        User::factory()->create([
            'name' => 'Matched Verified',
            'email' => 'verified@example.test',
            'email_verified_at' => now(),
        ]);
        User::factory()->unverified()->create([
            'name' => 'Matched Unverified',
            'email' => 'unverified@example.test',
        ]);

        $verifiedResponse = $this->get(route('users.index', [
            'search' => 'Matched',
            'verified' => 'verified',
        ]));

        $verifiedResponse->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('admins/users/index')
                    ->where('users.total', 1)
                    ->where('users.data.0.email', 'verified@example.test')
            );

        $unverifiedResponse = $this->get(route('users.index', [
            'search' => 'Matched',
            'verified' => 'unverified',
        ]));

        $unverifiedResponse->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('admins/users/index')
                    ->where('users.total', 1)
                    ->where('users.data.0.email', 'unverified@example.test')
            );
    }

    public function test_user_index_pagination_preserves_filter_query()
    {
        $this->signIn();
        $role = Role::create(['name' => 'Operator', 'guard_name' => 'web']);
        $firstUser = User::factory()->create([
            'name' => 'Alpha One',
            'email' => 'alpha-one@example.test',
        ]);
        $secondUser = User::factory()->create([
            'name' => 'Alpha Two',
            'email' => 'alpha-two@example.test',
        ]);

        $firstUser->assignRole($role);
        $secondUser->assignRole($role);

        $response = $this->get(route('users.index', [
            'entries' => 1,
            'search' => 'Alpha',
            'sort' => 'name_asc',
            'role' => $role->id,
            'verified' => 'verified',
        ]));

        $response->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('admins/users/index')
                    ->where('entries', 1)
                    ->where('search', 'Alpha')
                    ->where('sort', 'name_asc')
                    ->where('verified', 'verified')
                    ->where('users.data.0.name', 'Alpha One')
                    ->where('users.next_page_url', fn (?string $url) => $url !== null
                        && str_contains($url, 'entries=1')
                        && str_contains($url, 'search=Alpha')
                        && str_contains($url, 'sort=name_asc')
                        && str_contains($url, 'role='.$role->id)
                        && str_contains($url, 'verified=verified'))
            );
    }

    private function signIn(?\DateTimeInterface $createdAt = null): User
    {
        /** @var User $user */
        $user = User::factory()->create([
            'created_at' => $createdAt ?? now()->subYears(5),
        ]);

        $this->actingAs($user);

        return $user;
    }
}
