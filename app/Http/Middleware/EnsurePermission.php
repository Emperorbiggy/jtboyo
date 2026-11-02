<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * `permission` — signed out if the account was deactivated, 403 without the
 * named permission. With no argument it only does the deactivation check.
 */
class EnsurePermission
{
    public function handle(Request $request, Closure $next, ?string $permission = null): Response
    {
        $user = $request->user();

        if ($user && !$user->is_active) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->is('api/*') || $request->expectsJson()) {
                abort(401, 'This account has been deactivated.');
            }

            return redirect()->route('login')
                ->withErrors(['email' => 'This account has been deactivated. Contact an administrator.']);
        }

        if ($permission && !$user?->hasPermission($permission)) {
            abort(403, 'You do not have permission to do this.');
        }

        return $next($request);
    }
}
