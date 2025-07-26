<?php

namespace App\Http\Middleware;

use App\Models\AuthApp;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class VerifyApiAccess
{
    public function handle(Request $request, Closure $next): Response
{
    $authHeader = $request->header('Authorization');
    $requestIp = $request->ip();
    $requestPayload = $request->all();

    // Extract token from "Bearer XYZ..."
    if (!$authHeader || !preg_match('/Bearer\s+(.*)/i', $authHeader, $matches)) {
        return response()->json(['error' => 'Missing or invalid Authorization header.'], 401);
    }

    $token = trim($matches[1]);

    Log::channel('api')->info('Incoming API Request', [
        'timestamp' => now()->toDateTimeString(),
        'ip' => $requestIp,
        'token' => $token,
        'url' => $request->fullUrl(),
        'method' => $request->method(),
        'headers' => $request->headers->all(),
        'payload' => $requestPayload,
    ]);

    $authApp = AuthApp::where('token', $token)->where('status', 1)->first();

    if (!$authApp) {
        Log::channel('api')->warning('Auth failed - token not found or inactive', [
            'token' => $token,
        ]);

        return response()->json(['error' => 'Invalid or inactive token.'], 401);
    }

    $whitelistedIps = $authApp->whitelisted_ips ?? [];
    if (!in_array($requestIp, $whitelistedIps)) {
        return response()->json(['error' => 'Your IP address is not whitelisted.'], 403);
    }

    $authApp->increment('request_count');
    $authApp->update(['last_accessed_at' => now()]);

    return $next($request);
}

}
