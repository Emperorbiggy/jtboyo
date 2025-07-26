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
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return response()->json(['message' => 'Authorization token missing or invalid.'], 401);
        }

        $token = $matches[1];

        // 2. Find app by token
        $authApp = AuthApp::where('token', $token)->first();
        if (!$authApp) {
            return response()->json(['message' => 'Invalid token.'], 401);
        }

        // 3. Validate IP address
        $requestIp = $request->ip();
        $whitelistedIps = is_string($authApp->whitelisted_ips)
    ? array_map('trim', explode(',', $authApp->whitelisted_ips))
    : ($authApp->whitelisted_ips ?? []);


        if (!in_array($requestIp, $whitelistedIps)) {
            return response()->json(['message' => 'Your IP is not allowed to make this request.'], 403);
        }

        // 4. Validate input
        $validated = $request->validate([
            'tin' => 'required|string',
            'type' => 'required|string|in:individual,non-individual',
        ]);

        // 5. Get TIN and generate token
        $tin = $validated['tin'];
        $type = $validated['type'];

        try {
            $jtbToken = $this->jtbService->generateTokenId();

            // 6. Verify TIN
            $result = $type === 'individual'
                ? $this->jtbService->verifyIndividualTin($tin, $jtbToken)
                : $this->jtbService->verifyNonIndividualTin($jtbToken, $tin);

            // 7. Handle response
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
                ], 402);
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
