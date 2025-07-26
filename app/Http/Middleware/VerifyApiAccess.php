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

        $authApp = AuthApp::where('token', $token)->where('status', true)->first();

        if (!$authApp) {
            return response()->json(['error' => 'Invalid or inactive token.'], 401);
        }

        // Convert comma-separated IPs to an array
        $whitelistedIpString = $authApp->whitelisted_ips ?? '';
        $whitelistedIps = array_map('trim', explode(',', $whitelistedIpString));

        if (!in_array($requestIp, $whitelistedIps)) {
            return response()->json(['error' => 'Your IP address is not whitelisted.'], 403);
        }

        // Update usage tracking
        $authApp->increment('request_count');
        $authApp->update(['last_accessed_at' => now()]);

        return $next($request);
    }
}
