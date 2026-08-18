<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JtbController;
use App\Http\Controllers\Api\ApiController;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Session\Middleware\StartSession;

Route::middleware([
    EncryptCookies::class,
    AddQueuedCookiesToResponse::class,
    StartSession::class,
])->group(function () {
    // Authenticated operators only — these proxy straight through to JRB with
    // a service-held token, so they are no longer gated by a session token.
    Route::prefix('jrb')->middleware('auth')->group(function () {
        // Reference lookups
        Route::prefix('lookups')->group(function () {
            Route::get('/organization-types', [JtbController::class, 'organizationTypes']);
            Route::get('/business-sectors', [JtbController::class, 'businessSectors']);
            Route::get('/line-of-business', [JtbController::class, 'lineOfBusiness']);
            Route::get('/line-of-business/by-sector/{sectorCode}', [JtbController::class, 'lineOfBusinessBySector']);
            Route::get('/tax-authority/by-state/{stateCode}', [JtbController::class, 'taxAuthorityByState']);
            Route::get('/titles', [JtbController::class, 'titles']);
            Route::get('/genders', [JtbController::class, 'genders']);
            Route::get('/states', [JtbController::class, 'states']);
            Route::get('/occupations', [JtbController::class, 'occupations']);
            Route::get('/marital-statuses', [JtbController::class, 'maritalStatuses']);
            Route::get('/nationalities', [JtbController::class, 'nationalities']);
            Route::get('/countries', [JtbController::class, 'countries']);
            Route::get('/lgas/by-state/{stateCode}', [JtbController::class, 'lgasByState']);
        });

        // Individual — lookup then complete registration
        Route::post('/individual/lookup', [JtbController::class, 'individualLookup']);
        Route::post('/individual/register', [JtbController::class, 'individualRegister']);

        // Non-Individual — lookup then complete registration
        Route::post('/non-individual/lookup', [JtbController::class, 'nonIndividualLookup']);
        Route::post('/non-individual/register', [JtbController::class, 'nonIndividualRegister']);

        // Resolve / verify
        Route::post('/cooperative/resolve', [JtbController::class, 'resolveCooperative']);
        Route::post('/mda/resolve', [JtbController::class, 'resolveMda']);
        Route::post('/taxid/verify', [JtbController::class, 'verifyTaxId']);
    });

    Route::post('/v1/generate-token', [ApiController::class, 'generateToken']);
    Route::get('/v1/auth-apps', [ApiController::class, 'getAllAuthApps']);
    Route::put('/v1/auth-apps/{id}', [ApiController::class, 'updateApp']);         // ✅ Fixed
Route::delete('/v1/auth-apps/{id}', [ApiController::class, 'deleteApp']);      // ✅ Fixed 
    Route::patch('/v1/auth-apps/{id}/status', [ApiController::class, 'toggleStatus']); 
});

require __DIR__.'/api/v1.php';