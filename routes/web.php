<?php

use App\Http\Controllers\Admins\AnnouncementController;
use App\Http\Controllers\Admins\MenuController;
use App\Http\Controllers\Admins\PermissionController;
use App\Http\Controllers\Admins\RoleController;
use App\Http\Controllers\Admins\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Kadangs\LetterController as KadangsLetterController;
use App\Http\Controllers\Kadangs\ServiceArchiveController as KadangsServiceArchiveController;
use App\Http\Controllers\Kadangs\ServiceController as KadangsServiceController;
use App\Http\Controllers\Kades\ReportController as KadesReportController;
use App\Http\Controllers\Kades\ServiceController as KadesServiceController;
use App\Http\Controllers\Pekets\SubmissionController;
use App\Http\Controllers\Sekdes\FamilyController;
use App\Http\Controllers\Sekdes\ResidentController;
use App\Http\Controllers\Sekdes\ServiceController;
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
        Route::patch('services/{service}/disposition', [ServiceController::class, 'disposition'])->name('services.disposition');
        Route::resource('services', ServiceController::class);
    });

    // Pekets routes
    Route::prefix('pekets')->group(function () {
        Route::patch('submissions/{submission}/cancel', [SubmissionController::class, 'cancel'])->name('submissions.cancel');
        Route::patch('submissions/{submission}/verify', [SubmissionController::class, 'verify'])->name('submissions.verify');
        Route::post('submissions/bulk-delete', [SubmissionController::class, 'bulkDelete'])->name('submissions.bulk-delete');
        Route::resource('submissions', SubmissionController::class);
    });

    // Kadangs routes
    Route::prefix('kadangs')->name('kadangs.')->group(function () {
        Route::patch('services/{service}/start-process', [KadangsServiceController::class, 'startProcess'])->name('services.start-process');
        Route::patch('services/{service}/save-progress', [KadangsServiceController::class, 'saveProgress'])->name('services.save-progress');
        Route::patch('services/{service}/process', [KadangsServiceController::class, 'process'])->name('services.process');
        Route::resource('services', KadangsServiceController::class);

        Route::get('letters/{letter}/download', [KadangsLetterController::class, 'download'])->name('letters.download');
        Route::resource('letters', KadangsLetterController::class);

        Route::resource('archives', KadangsServiceArchiveController::class)->only(['index', 'show', 'update']);
    });

    // Kades routes
    Route::prefix('kades')->name('kades.')->group(function () {
        Route::patch('services/{service}/approve', [KadesServiceController::class, 'approve'])->name('services.approve');
        Route::patch('services/{service}/revise', [KadesServiceController::class, 'revise'])->name('services.revise');
        Route::patch('services/{service}/reject', [KadesServiceController::class, 'reject'])->name('services.reject');
        Route::resource('services', KadesServiceController::class);
        Route::resource('reports', KadesReportController::class)->only(['index', 'show']);
    });
});

require __DIR__.'/settings.php';
