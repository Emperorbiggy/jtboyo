<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\VerifyApiAccess;

/*
| Public API for authorised partner apps (bearer token + IP whitelist).
| The TIN verification endpoint was removed along with the old JTB
| integration; new JRB-backed endpoints belong in this group.
*/
Route::prefix('v1')
    ->middleware([VerifyApiAccess::class])
    ->group(function () {
        //
    });
