<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('production')) {
            URL::forceRootUrl(config('app.url') . '/app/public');

            if (str_starts_with(config('app.url'), 'https://')) {
                URL::forceScheme('https');
            }
        }

        // Share JTB token with all Inertia responses
        Inertia::share([
            'jtb_token' => fn () => session('jtb_token'),
            'jtb_token_expires_at' => fn () => session('jtb_token_expires_at'),
        ]);
    }
}
