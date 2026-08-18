<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\JtbService;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request, JtbService $jtbService): RedirectResponse
{
    Log::info('🔐 Entered store method of AuthenticatedSessionController');

    try {
        $request->authenticate();
        Log::info('✅ Authentication successful.');
    } catch (ValidationException $e) {
        Log::error('❌ Authentication failed', [
            'error' => $e->getMessage(),
        ]);
        throw $e; // Let Laravel handle redirect with error message
    }

    $request->session()->regenerate();

    Log::info('👤 Authenticated User', ['email' => auth()->user()->email]);

    // A successful app login also logs in to JRB with the JRB_* service
    // credentials, so the token is warm before the operator opens a page.
    // Deliberately non-fatal: if JRB is down or unreachable the operator stays
    // signed in, and JtbService will retry on the next call that needs it.
    if ($jtbService->token()) {
        Log::info('✅ JRB token ready');
    } else {
        Log::warning('⚠️ Signed in, but the JRB token could not be obtained — see the JRB ✗ entry above.');
        session()->flash('jrb_warning', 'Signed in, but the JRB API could not be reached. Lookups may fail until it recovers.');
    }

    return redirect()->intended(route('dashboard', absolute: false));
}
    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
{
    // Logout user
    Auth::guard('web')->logout();

    // Invalidate session and regenerate CSRF token
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/');
}

}
