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
    // Existing JTB routes
    Route::post('/jtb/individuals', [JtbController::class, 'fetchIndividualTaxpayers']);
    Route::post('/jtb/non-individuals', [JtbController::class, 'fetchNonIndividualTaxpayers']);
    Route::post('/jtb/add-tax-record', [JtbController::class, 'submitTaxRecord']);
    Route::post('/jtb/submit-asset', [JtbController::class, 'submitAsset']);

    // ✅ New Verification Routes
    Route::post('/jtb/verify-individual-tin', [JtbController::class, 'verifyIndividualTin']);
    Route::post('/jtb/verify-non-individual-tin', [JtbController::class, 'verifyNonIndividualTin']);
    Route::post('/v1/generate-token', [ApiController::class, 'generateToken']);
});

require __DIR__.'/api/v1.php';