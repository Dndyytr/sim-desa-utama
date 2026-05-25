<?php

namespace Database\Seeders;

// use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Admin',
        //     'email' => 'admin@gmail.com',
        //     'password' => 'admin123',
        // ]);

        $this->call(MenuSeeder::class);
        $this->call(PermissionSeeder::class);
        $this->call(RoleSeeder::class);
        $this->call(UserSeeder::class);

        // User::create([ 'name' => 'Admin', 'email' => 'admin@gmail.com', 'email_verified_at' => now(), 'password' => Hash::make('admin123'), 'remember_token' => Str::random(10), ]);
    }
}
