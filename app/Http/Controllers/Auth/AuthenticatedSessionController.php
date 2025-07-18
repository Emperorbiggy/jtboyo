<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\JtbService;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Carbon;

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
    // Authenticate user
    $request->authenticate();
    $request->session()->regenerate();

    $user = auth()->user();

    // Log authenticated user info
    \Log::info('User logged in', ['user_id' => $user->id, 'email' => $user->email]);

    // If user is admin, generate and store JTB token
    if ($user->email === 'admin@jtb.oyostate.gov.ng') {
        \Log::info('Attempting JTB token generation for admin user...');

        $token = $jtbService->generateTokenId();

        if ($token) {
            session([
                'jtb_token' => $token,
                'jtb_token_expires_at' => now()->addSeconds(3540),
            ]);

            \Log::info('JTB token successfully stored in session', [
                'token' => $token,
                'expires_at' => now()->addSeconds(3540)->toDateTimeString(),
            ]);
        } else {
            \Log::warning('JTB token generation failed. Logging user out.');

            auth()->logout();

            return redirect()->route('login')->withErrors([
                'email' => 'JTB token generation failed. Try again later.',
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
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
