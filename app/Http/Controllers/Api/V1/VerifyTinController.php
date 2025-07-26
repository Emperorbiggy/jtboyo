<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuthApp;
use App\Services\JtbService;
use Illuminate\Support\Facades\Log;

class VerifyTinController extends Controller
{
    protected $jtbService;

    public function __construct(JtbService $jtbService)
    {
        $this->jtbService = $jtbService;
    }

   public function verify(Request $request)
{
    // 1. Validate token from Authorization header
    $authHeader = $request->header('Authorization');

    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        Log::warning('Authorization token missing or malformed.', ['header' => $authHeader]);
        return response()->json(['message' => 'Authorization token missing or invalid.'], 401);
    }

    $token = $matches[1];
    Log::info('Token extracted from request.', ['token' => $token]);

    // 2. Find app by token and verify
    $authApp = AuthApp::where('token', $token)->first();
    Log::info('AuthApp token lookup result.', [
        'token_status' => $authApp?->status,
        'authApp_found' => (bool) $authApp,
    ]);

    if (!$authApp || $authApp->status != 1) {
        Log::warning('Invalid or inactive token.', ['token' => $token, 'status' => $authApp?->status]);
        return response()->json(['message' => 'Invalid or inactive token.'], 401);
    }

    // 3. Check IP whitelist
    $requestIp = $request->ip();
    $whitelistedIps = is_array($authApp->whitelisted_ips) 
        ? $authApp->whitelisted_ips 
        : explode(',', (string) $authApp->whitelisted_ips);

    $whitelistedIps = array_map('trim', $whitelistedIps);
    Log::info('Request IP check.', ['request_ip' => $requestIp, 'whitelisted_ips' => $whitelistedIps]);

    if (!in_array($requestIp, $whitelistedIps)) {
        Log::warning('Unauthorized IP access attempt.', ['request_ip' => $requestIp]);
        return response()->json(['message' => 'Your IP is not allowed to make this request.'], 403);
    }

    // 4. Validate request data
    $validated = $request->validate([
        'tin' => 'required|string',
        'type' => 'required|string|in:individual,non-individual',
    ]);

    $tin = $validated['tin'];
    $type = $validated['type'];

    try {
        // 5. Generate JTB token
        $jtbToken = $this->jtbService->generateTokenId();
        Log::info('JTB token generated.', ['jtbToken' => $jtbToken]);

        // 6. Verify TIN
        $result = $type === 'individual'
            ? $this->jtbService->verifyIndividualTin($tin, $jtbToken)
            : $this->jtbService->verifyNonIndividualTin($jtbToken, $tin);

        Log::info('JTB API response received.', ['response' => $result]);

        // 7. Process response
        if (isset($result['code']) && $result['code'] === '001') {
            return response()->json([
                'success' => true,
                'message' => 'TIN verified successfully.',
                'data' => $result['data'] ?? [],
            ], 200);
        }

        if (isset($result['code']) && $result['code'] === '003') {
            return response()->json([
                'success' => false,
                'message' => 'No record found.',
            ], 404);
        }

        return response()->json([
            'success' => false,
            'message' => 'Verification failed.',
        ], 400);

    } catch (\Exception $e) {
        Log::error('Verification exception occurred.', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'success' => false,
            'message' => 'An error occurred: ' . $e->getMessage(),
        ], 500);
    }
}
}
