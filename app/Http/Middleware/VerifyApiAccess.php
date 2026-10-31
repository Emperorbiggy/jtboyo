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

        // Extract token from "Bearer XYZ..."
        if (!$authHeader || !preg_match('/Bearer\s+(.*)/i', $authHeader, $matches)) {
            return response()->json(['error' => 'Missing or invalid Authorization header.'], 401);
        }

        $token = trim($matches[1]);

        $authApp = AuthApp::where('token', $token)->where('status', 1)->first();

        if (!$authApp) {
            Log::channel('api')->warning('Auth failed - token not found or inactive', [
                'ip' => $requestIp,
                'token' => substr($token, 0, 6) . '…',
                'url' => $request->fullUrl(),
            ]);

            return response()->json(['error' => 'Invalid or inactive token.'], 401);
        }

        // IPs are saved from a comma-separated field, so allow for stray spaces.
        $whitelistedIps = array_map('trim', $authApp->whitelisted_ips ?? []);
        if (!in_array($requestIp, $whitelistedIps)) {
            Log::channel('api')->warning('Auth failed - IP not whitelisted', [
                'app_id' => $authApp->id,
                'app_name' => $authApp->app_name,
                'ip' => $requestIp,
            ]);

            return response()->json(['error' => 'Your IP address is not whitelisted.'], 403);
        }

        $authApp->increment('request_count');
        $authApp->update(['last_accessed_at' => now()]);

        $response = $next($request);

        // One line per call, so each consultant's activity can be traced.
        // The photo is dropped: a base64 image would swamp the log.
        Log::channel('api')->info('API request', [
            'app_id' => $authApp->id,
            'app_name' => $authApp->app_name,
            'ip' => $requestIp,
            'method' => $request->method(),
            'path' => $request->path(),
            'payload' => $request->except('taxpayerPhoto'),
            'status' => $response->getStatusCode(),
        ]);

        return $response;
    }
}
