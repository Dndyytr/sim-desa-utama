<?php

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
});

require __DIR__ . '/settings.php';
