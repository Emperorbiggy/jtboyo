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

    /**
     * Fetch non-individual taxpayers from JTB.
     */
    public function fetchNonIndividualTaxpayers(Request $request)
    {
        $fromDate = Carbon::parse($request->input('fromDate'))->format('d-m-Y');
        $toDate = Carbon::parse($request->input('toDate'))->format('d-m-Y');

        $token = session('jtb_token');
        $expiresAt = session('jtb_token_expires_at');

        Log::info('JTB Token from session (Non-Individual):', ['token' => $token, 'expires_at' => $expiresAt]);

        if (!$token || now()->greaterThan($expiresAt)) {
            auth()->logout();
            return response()->json(['success' => false, 'message' => 'Session expired. Please login again.'], 401);
        }

        $data = $this->jtbService->getNonIndividualTaxpayers($token, $fromDate, $toDate);
        return response()->json($data);
    }

    /**
     * Submit a tax record to JTB.
     */
    public function submitTaxRecord(Request $request)
    {
        $validated = $request->validate([
            'jtb_tin' => 'required|string',
            'tcc_number' => 'required|string',
            'tax_period' => 'required|string',
            'turnover' => 'required|numeric',
            'assessable_profit' => 'required|numeric',
            'total_profit' => 'required|numeric',
            'tax_payable' => 'required|numeric',
            'tax_paid' => 'required|numeric',
            'tax_type' => 'required|string',
            'tax_authority' => 'required|string',
            'employer_name' => 'required|string',
            'taxpayer_address' => 'required|string',
            'taxpayer_name' => 'required|string',
            'source_of_income' => 'required|string',
            'payment_date' => 'required|date',
            'tcc_expiry_date' => 'required|date',
        ]);

        $token = session('jtb_token');
        $expiresAt = session('jtb_token_expires_at');

        if (!$token || now()->greaterThan($expiresAt)) {
            auth()->logout();
            return response()->json(['success' => false, 'message' => 'Session expired. Please login again.'], 401);
        }

        // Call service method to send the payload
        $response = $this->jtbService->addTaxRecord($validated, $token);

        return response()->json($response);
    }
}
