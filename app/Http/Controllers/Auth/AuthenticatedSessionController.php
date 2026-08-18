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
    public function store(LoginRequest $request): RedirectResponse
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

    // The JRB token is no longer fetched here. JtbService obtains and caches
    // one on demand, so signing in never depends on JRB being reachable and
    // no single hardcoded address is privileged over other users.
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
