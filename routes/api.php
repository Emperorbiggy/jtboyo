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
    Route::prefix('jrb')->middleware(['auth', 'permission'])->group(function () {
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
        Route::post('/individual/lookup', [JtbController::class, 'individualLookup'])->middleware('permission:individual.lookup');
        Route::post('/individual/register', [JtbController::class, 'individualRegister'])->middleware('permission:individual.register');

        // Non-Individual — lookup then complete registration
        Route::post('/non-individual/lookup', [JtbController::class, 'nonIndividualLookup'])->middleware('permission:non_individual.lookup');
        Route::post('/non-individual/register', [JtbController::class, 'nonIndividualRegister'])->middleware('permission:non_individual.register');

        // Resolve / verify
        Route::post('/cooperative/resolve', [JtbController::class, 'resolveCooperative'])->middleware('permission:resolve');
        Route::post('/mda/resolve', [JtbController::class, 'resolveMda'])->middleware('permission:resolve');
        Route::post('/taxid/verify', [JtbController::class, 'verifyTaxId'])->middleware('permission:verify');
    });

    // API key management — operators only, since these list and mint live keys.
    Route::middleware(['auth', 'permission:api_keys.manage'])->group(function () {
        Route::post('/v1/generate-token', [ApiController::class, 'generateToken']);
        Route::get('/v1/auth-apps', [ApiController::class, 'getAllAuthApps']);
        Route::put('/v1/auth-apps/{id}', [ApiController::class, 'updateApp']);
        Route::delete('/v1/auth-apps/{id}', [ApiController::class, 'deleteApp']);
        Route::patch('/v1/auth-apps/{id}/status', [ApiController::class, 'toggleStatus']);
    });
});

require __DIR__.'/api/v1.php';