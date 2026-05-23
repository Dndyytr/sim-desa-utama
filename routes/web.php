<?php

use App\Http\Controllers\Admins\PermissionController;
use App\Http\Controllers\Admins\RoleController;
use App\Http\Controllers\Admins\UserController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// use Laravel\Fortify\Features;

Route::get('/', function () {
    return Auth::check()
        ? redirect('/dashboard')
        : redirect('/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::post('users/bulk-delete', [UserController::class, 'bulkDelete'])->name('users.bulk-delete');
        Route::resource('users', UserController::class);
        Route::post('permissions/bulk-delete', [PermissionController::class, 'bulkDelete'])->name('permissions.bulk-delete');
        Route::resource('permissions', PermissionController::class);
        Route::post('roles/bulk-delete', [RoleController::class, 'bulkDelete'])->name('roles.bulk-delete');
        Route::resource('roles', RoleController::class);
    });
});

require __DIR__.'/settings.php';
