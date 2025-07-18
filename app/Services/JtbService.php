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

    public function generateTokenId(): ?string
    {
        $url = "{$this->baseUrl}/GetTokenID";
        $requestBody = [
            'email' => $this->email,
            'password' => $this->password,
            'clientname' => $this->clientName,
        ];

        // Generate cURL equivalent
        $curl = <<<CURL
curl --location --request POST '{$url}' \\
--header 'Accept: application/json' \\
--header 'Content-Type: application/json' \\
--data '{
  "email": "{$this->email}",
  "password": "******",
  "clientname": "{$this->clientName}"
}'
CURL;

        Log::info('JTB Token Request Initiated', [
            'url' => $url,
            'payload' => $requestBody,
            'curl' => $curl,
        ]);

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post($url, $requestBody);

            Log::info('JTB Token Response Received', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['tokenid'] ?? null;
            }

            Log::error('JTB token generation failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('JTB token generation exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }
}
