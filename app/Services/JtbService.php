<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class JtbService
{
    protected string $baseUrl;
    protected string $email;
    protected string $password;
    protected string $clientName;

    public function __construct()
    {
        $this->baseUrl = config('services.jtb.base_url');
        $this->baseUrlNew = config('services.jtb.new_base_url');
        $this->email = config('services.jtb.email');
        $this->password = config('services.jtb.password');
        $this->clientName = config('services.jtb.client_name');
    }

    public function generateTokenId()
    {
        try {
            Log::info('JTB Token Request Initiated', [
                'url' => $this->baseUrl . '/GetTokenID',
                'payload' => [
                    'email' => $this->email,
                    'password' => $this->password,
                    'clientname' => $this->clientName,
                ],
            ]);

            $response = Http::timeout(15)->post($this->baseUrl . '/GetTokenID', [
                'email' => $this->email,
                'password' => $this->password,
                'clientname' => $this->clientName,
            ]);

            if ($response->ok()) {
                Log::info('JTB Token Response Received', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                $data = $response->json();

                if ($data['success'] === "true" && isset($data['tokenId'])) {
                    return $data['tokenId']; // ✅ Return only the token
                }
            }

            Log::error('Failed to get valid token from JTB', [
                'response' => $response->body()
            ]);
        } catch (\Exception $e) {
            Log::error('JTB token generation exception: ' . $e->getMessage());
        }

        return null; // fallback if anything fails
    }

    public function getIndividualTaxpayers(string $token, string $fromDate, string $toDate)
    {
        $url = $this->baseUrl . '/SBIR/Individual?tokenid=' . $token;

        $formattedFrom = Carbon::parse($fromDate)->format('d-m-Y');
        $formattedTo = Carbon::parse($toDate)->format('d-m-Y');

        Log::info('Fetching JTB Individual Taxpayers', [
            'endpoint' => $url,
            'fromDate' => $formattedFrom,
            'toDate' => $formattedTo,
        ]);

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post($url, [
                'fromdate' => $formattedFrom,
                'todate' => $formattedTo,
            ]);

            Log::info('JTB Response (Individual)', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Error fetching JTB individual taxpayers', ['message' => $e->getMessage()]);
            return ['success' => false, 'message' => 'Request failed.'];
        }
    }

    public function getNonIndividualTaxpayers(string $token, string $fromDate, string $toDate)
    {
        $url = $this->baseUrl . '/SBIR/NonIndividual?tokenid=' . $token;

        $formattedFrom = Carbon::parse($fromDate)->format('d-m-Y');
        $formattedTo = Carbon::parse($toDate)->format('d-m-Y');

        Log::info('Fetching JTB Non-Individual Taxpayers', [
            'endpoint' => $url,
            'fromDate' => $formattedFrom,
            'toDate' => $formattedTo,
        ]);

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post($url, [
                'fromdate' => $formattedFrom,
                'todate' => $formattedTo,
            ]);

            Log::info('JTB Response (Non-Individual)', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Error fetching JTB non-individual taxpayers', ['message' => $e->getMessage()]);
            return ['success' => false, 'message' => 'Request failed.'];
        }
    }
    
    public function addTaxRecord(array $payload, string $token)
    {
        $url = $this->baseUrl . '/SBIR/AddTaxRecord?tokenid=' . $token;

        // Format required date fields
        if (isset($payload['payment_date'])) {
            $payload['payment_date'] = Carbon::parse($payload['payment_date'])->format('d-m-Y');
        }

        if (isset($payload['tcc_expiry_date'])) {
            $payload['tcc_expiry_date'] = Carbon::parse($payload['tcc_expiry_date'])->format('d-m-Y');
        }

        Log::info('Sending Add Tax Record Request to JTB', [
            'url' => $url,
            'payload' => $payload
        ]);

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post($url, $payload);

            Log::info('Add Tax Record Response from JTB', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Error adding JTB tax record', [
                'message' => $e->getMessage(),
                'payload' => $payload,
            ]);
            return ['success' => false, 'message' => 'AddTaxRecord failed.'];
        }
    }
        public function addAssetDetails(array $payload, string $token)
    {
        $url = $this->baseUrl . '/SBIR/AddAssetDetails?tokenid=' . $token;

        // Format the date field
        if (isset($payload['date_acquired'])) {
            $payload['date_acquired'] = Carbon::parse($payload['date_acquired'])->format('d-m-Y');
        }

        Log::info('Sending Add Asset Details Request to JTB', [
            'url' => $url,
            'payload' => $payload
        ]);

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post($url, $payload);

            Log::info('Add Asset Details Response from JTB', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Error adding asset details to JTB', [
                'message' => $e->getMessage(),
                'payload' => $payload,
            ]);
            return ['success' => false, 'message' => 'AddAssetDetails failed.'];
        }
    }
       public function verifyIndividualTin(string $tin, string $token) // ✅ Correct order
{
    $url = $this->baseUrlNew . '/individualtinvalidation?tokenid=' . $token;

    Log::info('Verifying Individual TIN', [
        'url' => $url,
        'tin' => $tin,
    ]);

    try {
        $response = Http::asForm()->withHeaders([
            'Accept' => 'application/json',
        ])->post($url, [
            'tin' => $tin,
        ]);

        Log::info('JTB Individual TIN Verification Response', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return $response->json();
    } catch (\Exception $e) {
        Log::error('Error verifying individual TIN', ['message' => $e->getMessage()]);
        return ['success' => false, 'message' => 'Individual TIN verification failed.'];
    }
}


    public function verifyNonIndividualTin(string $token, string $tin)
    {
        $url = $this->baseUrlNew . '/nonindividualtinvalidation?tokenid=' . $token;

        Log::info('Verifying Non-Individual TIN', [
            'url' => $url,
            'tin' => $tin,
        ]);

        try {
            $response = Http::asForm()->withHeaders([
                'Accept' => 'application/json',
            ])->post($url, [
                'tin' => $tin,
            ]);

            Log::info('JTB Non-Individual TIN Verification Response', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Error verifying non-individual TIN', ['message' => $e->getMessage()]);
            return ['success' => false, 'message' => 'Non-Individual TIN verification failed.'];
        }
    }


}
