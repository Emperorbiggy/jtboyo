<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JtbController;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Session\Middleware\StartSession;

Route::middleware([
    EncryptCookies::class,
    AddQueuedCookiesToResponse::class,
    StartSession::class,
])->group(function () {
    Route::post('/jtb/individuals', [JtbController::class, 'fetchIndividualTaxpayers']);
    Route::post('/jtb/non-individuals', [JtbController::class, 'fetchNonIndividualTaxpayers']);
    Route::post('/jtb/add-tax-record', [JtbController::class, 'submitTaxRecord']);
});
