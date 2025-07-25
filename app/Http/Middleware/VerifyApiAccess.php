<?php

namespace App\Http\Middleware;

use App\Models\AuthApp;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyApiAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header('Authorization');

        if (!$token) {
            return response()->json(['error' => 'Missing API token.'], 401);
        }

        $authApp = AuthApp::where('token', $token)->where('status', true)->first();

        if (!$authApp) {
            return response()->json(['error' => 'Invalid or inactive token.'], 401);
        }

        $requestIp = $request->ip();
        $whitelistedIps = $authApp->whitelisted_ips ?? [];

        if (!in_array($requestIp, $whitelistedIps)) {
            return response()->json(['error' => 'Your IP address is not whitelisted.'], 403);
        }

        // Update usage data
        $authApp->increment('request_count');
        $authApp->update(['last_accessed_at' => now()]);

        return $next($request);
    }
}
