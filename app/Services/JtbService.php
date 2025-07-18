<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JtbService
{
    protected string $baseUrl;
    protected string $email;
    protected string $password;
    protected string $clientName;

    public function __construct()
    {
        $this->baseUrl = config('services.jtb.base_url');
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

}
