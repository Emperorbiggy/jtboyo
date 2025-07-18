<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JtbController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth'])->post('/jtb/individuals', [JtbController::class, 'fetchIndividualTaxpayers']);


// Group routes that require authentication
// Route::middleware(['auth:sanctum'])->group(function () {
//     // JTB Fetch Individual Taxpayers
//     Route::post('/jtb/individual-taxpayers', [JtbController::class, 'fetchIndividualTaxpayers']);

//     // You can define more JTB-related APIs here
//     // Route::post('/jtb/corporate-taxpayers', [JtbController::class, 'fetchCorporateTaxpayers']);
//     // Route::post('/jtb/get-tin-details', [JtbController::class, 'getTinDetails']);

//     // // Logout endpoint (optional)
//     // Route::post('/logout', [AuthController::class, 'logout']);
// });
