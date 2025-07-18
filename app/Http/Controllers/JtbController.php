<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\JtbService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class JtbController extends Controller
{
    protected $jtbService;

    public function __construct(JtbService $jtbService)
    {
        $this->jtbService = $jtbService;
    }

    /**
     * Generate a fresh token from JTB (manual trigger, optional).
     */
    public function getToken()
    {
        $token = $this->jtbService->generateTokenId();

        if ($token) {
            return response()->json([
                'status' => true,
                'token' => $token,
                'message' => 'Token generated successfully',
            ]);
        }

        return response()->json([
            'status' => false,
            'message' => 'Failed to generate token',
        ], 500);
    }

    /**
     * Fetch individual taxpayers from JTB using session token.
     */
   public function fetchIndividualTaxpayers(Request $request)
{
    $fromDate = $request->input('fromDate');
    $toDate = $request->input('toDate');

    $token = session('jtb_token');
    $expiresAt = session('jtb_token_expires_at');

    Log::info('🔐 Checking JTB Token from session', [
        'token_present' => $token ? 'yes' : 'no',
        'expires_at' => $expiresAt,
        'now' => now()->toDateTimeString(),
    ]);

    // Check if token is missing or expired
    if (!$token || !$expiresAt || now()->greaterThan($expiresAt)) {
        Log::warning('🚫 JTB Token missing or expired. Forcing logout.');
        auth()->logout(); // Optional: Only if session is tied to auth user
        return response()->json([
            'success' => false,
            'message' => 'Session expired. Please login again.',
        ], 401);
    }

    try {
        $data = $this->jtbService->getIndividualTaxpayers($token, $fromDate, $toDate);
        return response()->json($data);
    } catch (\Exception $e) {
        Log::error('❌ Failed to fetch taxpayers from JTB API', [
            'message' => $e->getMessage(),
        ]);
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch data from JTB.',
        ], 500);
    }
}


}
