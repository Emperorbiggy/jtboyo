<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Recovery: grant super admin to an existing account, e.g. after a lockout.
Artisan::command('admin:super {email}', function (string $email) {
    $user = \App\Models\User::where('email', $email)->first();

    if (!$user) {
        $this->error("No user with email {$email}.");
        return 1;
    }

    $user->update(['is_super_admin' => true, 'is_active' => true]);
    $this->info("{$user->name} is now an active super admin.");
})->purpose('Make an existing user an active super admin');
