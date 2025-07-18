<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\JtbService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Carbon\Carbon;

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
    $fromDate = Carbon::parse($request->input('fromDate'))->format('d-m-Y');
    $toDate = Carbon::parse($request->input('toDate'))->format('d-m-Y');

    $token = session('jtb_token');
    $expiresAt = session('jtb_token_expires_at');

    Log::info('JTB Token from session:', ['token' => $token, 'expires_at' => $expiresAt]);

    if (!$token || now()->greaterThan($expiresAt)) {
        auth()->logout();
        return response()->json(['success' => false, 'message' => 'Session expired. Please login again.'], 401);
    }

    $data = $this->jtbService->getIndividualTaxpayers($token, $fromDate, $toDate);
    return response()->json($data);
}

}
