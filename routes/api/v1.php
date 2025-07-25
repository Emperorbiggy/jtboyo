<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\VerifyTinController;
use App\Http\Middleware\VerifyApiAccess;

Route::prefix('v1')
    ->middleware([VerifyApiAccess::class])
    ->group(function () {
        Route::post('/verify-tin', [VerifyTinController::class, 'verify']);
    });
