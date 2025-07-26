<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuthApp;
use App\Services\JtbService;

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
        $token = $request->header('Authorization');

if (!$token) {
    return response()->json(['message' => 'Authorization token missing or invalid.'], 401);
}


        // 2. Find app by token and verify
        $authApp = AuthApp::where('token', $token)->where('status', true)->first();
        if (!$authApp) {
            return response()->json(['message' => 'Invalid or inactive token.'], 401);
        }

        // 3. Check IP whitelist (assumes cast to array in model)
        $requestIp = $request->ip();
        $whitelistedIps = is_array($authApp->whitelisted_ips) 
            ? $authApp->whitelisted_ips 
            : explode(',', (string) $authApp->whitelisted_ips);

        $whitelistedIps = array_map('trim', $whitelistedIps);

        if (!in_array($requestIp, $whitelistedIps)) {
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

            // 6. Verify TIN
            $result = $type === 'individual'
                ? $this->jtbService->verifyIndividualTin($tin, $jtbToken)
                : $this->jtbService->verifyNonIndividualTin($jtbToken, $tin);

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
            return response()->json([
                'success' => false,
                'message' => 'An error occurred: ' . $e->getMessage(),
            ], 500);
        }
    }
}
