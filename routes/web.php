<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\JtbController;
use Illuminate\Foundation\Application;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'permission'])->name('dashboard');
Route::get('/', function () {
    return Inertia::render('Auth/Login');
})->name('login');

// JRB State API console
Route::prefix('jrb')->middleware(['auth', 'permission'])->group(function () {
    Route::inertia('/individual/lookup', 'Jrb/IndividualLookup')->middleware('permission:individual.lookup');
    Route::inertia('/individual/register', 'Jrb/IndividualRegister')->middleware('permission:individual.register');
    Route::inertia('/non-individual/lookup', 'Jrb/NonIndividualLookup')->middleware('permission:non_individual.lookup');
    Route::inertia('/non-individual/register', 'Jrb/NonIndividualRegister')->middleware('permission:non_individual.register');
    Route::inertia('/cooperative', 'Jrb/Cooperative')->middleware('permission:resolve');
    Route::inertia('/mdas', 'Jrb/Mdas')->middleware('permission:resolve');
    Route::inertia('/taxid-verification', 'Jrb/TaxIdVerification')->middleware('permission:verify');
    Route::inertia('/lookups', 'Jrb/Lookups');
});

// Operator and administrator handbook.
Route::inertia('/guide', 'Guide')->middleware(['auth', 'permission'])->name('guide');

// Public developer documentation for the /api/v1 partner API.
Route::inertia('/developers', 'Developers')->name('developers');

Route::get('/create-app', function () {
    return Inertia::render('AuthApps');
})->middleware(['auth', 'permission:api_keys.manage']);

// Console admins and their permissions.
Route::prefix('admins')->middleware(['auth', 'permission:admins.manage'])->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('admins.index');
    Route::post('/', [AdminController::class, 'store'])->name('admins.store');
    Route::put('/{admin}', [AdminController::class, 'update'])->name('admins.update');
    Route::patch('/{admin}/status', [AdminController::class, 'toggleStatus'])->name('admins.status');
    Route::delete('/{admin}', [AdminController::class, 'destroy'])->name('admins.destroy');
});

// Connectivity/credentials check for the JRB API, as seen by the web process.
Route::get('/jrb/token', [JtbController::class, 'getToken'])->middleware(['auth', 'permission:api_keys.manage']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');


Route::middleware(['auth', 'permission'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
