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
        $token = $request->header('Authorization');
        $requestIp = $request->ip();
        $requestPayload = $request->all();

        // Log the incoming request details
        Log::channel('api')->info('Incoming API Request', [
            'timestamp' => now()->toDateTimeString(),
            'ip' => $requestIp,
            'token' => $token,
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'headers' => $request->headers->all(),
            'payload' => $requestPayload,
        ]);

        if (!$token) {
            return response()->json(['error' => 'Missing API token.'], 401);
        }

        $authApp = AuthApp::where('token', $token)->where('status', 1)->first();

        if (!$authApp) {
            return response()->json(['error' => 'Invalid or inactive token.'], 401);
        }

        // No need to explode, it's already cast to array
        $whitelistedIps = $authApp->whitelisted_ips ?? [];

        if (!in_array($requestIp, $whitelistedIps)) {
            return response()->json(['error' => 'Your IP address is not whitelisted.'], 403);
        }

        // Track usage
        $authApp->increment('request_count');
        $authApp->update(['last_accessed_at' => now()]);

        return $next($request);
    }
}
