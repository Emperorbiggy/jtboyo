<?php

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
})->name('dashboard');
Route::get('/', function () {
    return Inertia::render('Auth/Login');
})->name('login');

// JRB State API console
Route::prefix('jrb')->group(function () {
    Route::inertia('/individual/lookup', 'Jrb/IndividualLookup');
    Route::inertia('/individual/register', 'Jrb/IndividualRegister');
    Route::inertia('/non-individual/lookup', 'Jrb/NonIndividualLookup');
    Route::inertia('/non-individual/register', 'Jrb/NonIndividualRegister');
    Route::inertia('/cooperative', 'Jrb/Cooperative');
    Route::inertia('/mdas', 'Jrb/Mdas');
    Route::inertia('/taxid-verification', 'Jrb/TaxIdVerification');
    Route::inertia('/lookups', 'Jrb/Lookups');
});

Route::get('/create-app', function () {
    return Inertia::render('AuthApps');
});

// Connectivity/credentials check for the JRB API, as seen by the web process.
Route::get('/jrb/token', [JtbController::class, 'getToken'])->middleware('auth');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
