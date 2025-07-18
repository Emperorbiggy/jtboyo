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

    $user = auth()->user();
    Log::info('👤 Authenticated User', ['email' => $user->email]);

    if ($user->email === 'admin@jtb.oyostate.gov.ng') {
        Log::info('🎯 Admin matched. Attempting to fetch token...');

        $token = $jtbService->generateTokenId();

        if ($token) {
            $expiresAt = now()->addSeconds(3540);

            session([
                'jtb_token' => $token,
                'jtb_token_expires_at' => $expiresAt,
            ]);

            Log::info('✅ JTB token stored', ['expires_at' => $expiresAt->toDateTimeString()]);
        } else {
            Log::warning('❌ Failed to get JTB token. Logging out.');
            auth()->logout();

            return redirect()->route('login')->withErrors([
                'email' => 'Failed to generate JTB token. Try again later.',
            ]);
        }
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

    // Explicitly forget JTB token session data
    $request->session()->forget('jtb_token');
    $request->session()->forget('jtb_token_expires_at');

    // Invalidate session and regenerate CSRF token
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/');
}

}
