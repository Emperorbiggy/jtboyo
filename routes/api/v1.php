<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JtbController;
use App\Http\Middleware\VerifyApiAccess;

/*
| Public API for partner apps and tax consultants (bearer token + IP
| whitelist, keys issued from the "Partner API Apps" screen). Every route
| proxies to JRB through the same JtbController the operator console uses,
| so request fields and responses match the console exactly.
*/
Route::prefix('v1')
    ->middleware([VerifyApiAccess::class])
    ->group(function () {
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

        // Legacy endpoint from jtb-tin-verification.yaml, kept for existing callers.
        Route::post('/verify-tin', [JtbController::class, 'legacyVerifyTin']);
    });
