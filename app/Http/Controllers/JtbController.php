<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\JtbService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

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
    // Manually map old keys to expected ones
    $input = $request->all();

    $mapped = [
        'jtb_tin' => $input['jtb_tin'] ?? null,
        'tcc_number' => $input['tcc_number'] ?? null,
        'tax_period' => $input['tax_period'] ?? null,
        'turnover' => $input['turnover'] ?? null,
        'assessable_profit' => $input['assessable_profit'] ?? null,
        'total_profit' => $input['total_profit'] ?? null,
        'tax_payable' => $input['tax_payable'] ?? null,
        'tax_paid' => $input['tax_paid'] ?? null,
        'tax_type' => $input['tax_type'] ?? null,
        'tax_authority' => $input['tax_authority'] ?? null,
        'tax_office' => $input['tax_office'] ?? null,
        'employer_name' => $input['EmployerName'] ?? $input['employer_name'] ?? null,
        'taxpayer_address' => $input['TaxPayerAddress'] ?? $input['taxpayer_address'] ?? null,
        'taxpayer_name' => $input['TaxPayerName'] ?? $input['taxpayer_name'] ?? null,
        'source_of_income' => $input['Sourceofincome'] ?? $input['source_of_income'] ?? null,
        'payment_date' => $input['payment_date'] ?? null,
        'tcc_expiry_date' => $input['expirydate'] ?? $input['tcc_expiry_date'] ?? null,
    ];

    $validated = Validator::make($mapped, [
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

    if ($validated->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed.',
            'errors' => $validated->errors(),
        ], 422);
    }

    $token = session('jtb_token');
    $expiresAt = session('jtb_token_expires_at');

    if (!$token || now()->greaterThan($expiresAt)) {
        auth()->logout();
        return response()->json(['success' => false, 'message' => 'Session expired. Please login again.'], 401);
    }

    $response = $this->jtbService->addTaxRecord($validated->validated(), $token);

    return response()->json($response);
}
public function submitAsset(Request $request)
{
    $input = $request->all();

    // ✅ Convert date to expected d/m/Y format if provided
    if (!empty($input['date_acquired'])) {
        try {
            $input['date_acquired'] = \Carbon\Carbon::parse($input['date_acquired'])->format('d/m/Y');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid date format.',
                'errors' => ['date_acquired' => ['Invalid date format.']],
            ], 422);
        }
    }

    // ✅ Now validate with expected format
    $validator = Validator::make($input, [
        'tin' => 'required|string',
        'location' => 'required|string',
        'asset_type' => 'required|string',
        'asset_value' => 'required|numeric',
        'date_acquired' => 'required|date_format:d/m/Y',
        'description' => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 422);
    }

    // ✅ Check token
    $token = session('jtb_token');
    $expiresAt = session('jtb_token_expires_at');

    if (!$token || now()->greaterThan($expiresAt)) {
        auth()->logout();
        return response()->json(['success' => false, 'message' => 'Session expired. Please log in again.'], 401);
    }

    // ✅ Proceed with validated payload
    $payload = $validator->validated();

    $response = $this->jtbService->addAssetDetails($payload, $token);

    return response()->json($response);
}

public function verifyIndividualTin(Request $request)
{
    $validator = Validator::make($request->all(), [
        'tin' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 422);
    }

    $token = session('jtb_token');
    $expiresAt = session('jtb_token_expires_at');

    if (!$token || now()->greaterThan($expiresAt)) {
        auth()->logout();
        return response()->json(['success' => false, 'message' => 'Session expired. Please login again.'], 401);
    }

    $tin = $request->input('tin');
    $response = $this->jtbService->verifyIndividualTin($tin, $token);

    return response()->json($response);
}

/**
 * Verify Non-Individual TIN using JTB new endpoint.
 */
public function verifyNonIndividualTin(Request $request)
{
    $validator = Validator::make($request->all(), [
        'tin' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 422);
    }

    $token = session('jtb_token');
    $expiresAt = session('jtb_token_expires_at');

    if (!$token || now()->greaterThan($expiresAt)) {
        auth()->logout();
        return response()->json(['success' => false, 'message' => 'Session expired. Please login again.'], 401);
    }

    $tin = $request->input('tin');

    
    $response = $this->jtbService->verifyNonIndividualTin($token, $tin);

    return response()->json($response);
}


}
