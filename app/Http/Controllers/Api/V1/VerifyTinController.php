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
       if (isset($result['ResponseCode']) && $result['ResponseCode'] === '001') {
    $taxpayer = $result['Taxpayer'];

    if (isset($taxpayer['first_name'])) {
        // Individual TIN response
        return response()->json([
            'success' => true,
            'message' => 'TIN verified successfully.',
            'status_code' => 200,
            'data' => [
                'tin' => $taxpayer['tin'] ?? null,
                'first_name' => $taxpayer['first_name'] ?? null,
                'middle_name' => $taxpayer['middle_name'] ?? null,
                'last_name' => $taxpayer['last_name'] ?? null,
                'phone_no' => $taxpayer['phone_no'] ?? null,
                'email' => $taxpayer['email'] ?? null,
                'date_of_birth' => $taxpayer['date_of_birth'] ?? null,
                'date_of_registration' => $taxpayer['date_of_registration'] ?? null,
                'tax_authority' => $taxpayer['tax_authority'] ?? null,
                'tax_office' => $taxpayer['tax_office'] ?? null,
            ]
        ], 200);
    } else {
        // Non-individual TIN response
        return response()->json([
            'success' => true,
            'message' => 'TIN verified successfully.',
            'status_code' => 200,
            'data' => [
                'tin' => $taxpayer['tin'] ?? null,
                'registered_name' => $taxpayer['registered_name'] ?? null,
                'registration_number' => $taxpayer['registration_number'] ?? null,
                'phone_no' => $taxpayer['phone_no'] ?? null,
                'email' => $taxpayer['email'] ?? null,
                'date_of_incorporation' => $taxpayer['date_of_incorporation'] ?? null,
                'date_of_registration' => $taxpayer['date_of_registration'] ?? null,
                'tax_authority' => $taxpayer['tax_authority'] ?? null,
                'tax_office' => $taxpayer['tax_office'] ?? null,
            ]
        ], 200);
    }
}

// Handle missing TIN (003 and 005 both mean record not found)
if (in_array($result['ResponseCode'] ?? '', ['003', '004', '005'])) {
    return response()->json([
        'success' => false,
        'message' => $result['ResponseDescription'] ?? 'No record found for this TIN.',
        'status_code' => 404,
    ], 404);
}

// General failure
return response()->json([
    'success' => false,
    'message' => $result['ResponseDescription'] ?? 'TIN verification failed.',
    'status_code' => 400,
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
