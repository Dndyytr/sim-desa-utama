<?php

use App\Http\Controllers\Admins\AnnouncementController;
use App\Http\Controllers\Admins\MenuController;
use App\Http\Controllers\Admins\PermissionController;
use App\Http\Controllers\Admins\RoleController;
use App\Http\Controllers\Admins\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Pekets\SubmissionController;
use App\Http\Controllers\Sekdes\FamilyController;
use App\Http\Controllers\Sekdes\ResidentController;
use App\Http\Controllers\Sekdes\TypeServiceController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// use Laravel\Fortify\Features;

Route::get('/', function () {
    return Auth::check()
        ? redirect('/dashboards')
        : redirect('/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('dashboards', DashboardController::class);

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::post('users/bulk-delete', [UserController::class, 'bulkDelete'])->name('users.bulk-delete');
        Route::resource('users', UserController::class);
        Route::post('permissions/bulk-delete', [PermissionController::class, 'bulkDelete'])->name('permissions.bulk-delete');
        Route::resource('permissions', PermissionController::class);
        Route::post('roles/bulk-delete', [RoleController::class, 'bulkDelete'])->name('roles.bulk-delete');
        Route::resource('roles', RoleController::class);
        Route::post('menus/bulk-delete', [MenuController::class, 'bulkDelete'])->name('menus.bulk-delete');
        Route::resource('menus', MenuController::class);
        Route::resource('announcements', AnnouncementController::class);
    });

    // Sekdes routes
    Route::prefix('sekdes')->group(function () {
        Route::post('type-services/bulk-delete', [TypeServiceController::class, 'bulkDelete'])->name('type-services.bulk-delete');
        Route::resource('type-services', TypeServiceController::class);
        Route::post('residents/bulk-delete', [ResidentController::class, 'bulkDelete'])->name('residents.bulk-delete');
        Route::resource('residents', ResidentController::class);
        Route::post('familys/bulk-delete', [FamilyController::class, 'bulkDelete'])->name('familys.bulk-delete');
        Route::resource('familys', FamilyController::class);
    });

    // Pekets routes
    Route::prefix('pekets')->group(function () {
        Route::post('submissions/bulk-delete', [SubmissionController::class, 'bulkDelete'])->name('submissions.bulk-delete');
        Route::resource('submissions', SubmissionController::class)->except(['edit', 'update']);
    });
});

require __DIR__.'/settings.php';
