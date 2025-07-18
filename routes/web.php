<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\JtbController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

Route::get('/individual', function () {
    return Inertia::render('IndividualTaxPayer');
});

Route::get('/non-individual', function () {
    return Inertia::render('NonIndividualTaxPayers');
});

Route::get('/add-tax-record', function () {
    return Inertia::render('AddRecord');
});

Route::get('/add-asset', function () {
    return Inertia::render('AddAssets');
});
Route::get('/jtb/token', [JtbController::class, 'getToken']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
