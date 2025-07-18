<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
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

    // If user is the admin, generate and store JTB token
    $user = auth()->user();

    if ($user->email === 'admin@jtb.oyostate.gov.ng') {
        $tokenData = $jtbService->generateTokenId();

        if ($tokenData) {
            session([
                'jtb_token' => $tokenData,
                'jtb_token_expires_at' => now()->addMinutes(59), // to be safe
            ]);
        } else {
            // Optional: logout admin if token generation fails
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
