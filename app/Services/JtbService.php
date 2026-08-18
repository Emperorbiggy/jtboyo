<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Joint Revenue Board (JRB) State API client.
 *
 * Covers two documents:
 *   - State API Lookups (Non-Individual) v1  — the reference lists
 *   - State API Documentation v2.2           — lookup / registration / resolve
 *
 * Every call except login takes ?authtoken={tokenId} in the URL. The login
 * session expires after 60 minutes; on a token error, log in again.
 *
 * Lookups (GET) return ['success' => bool, 'data' => …].
 * Everything else (POST) returns ['status' => int, 'body' => mixed] so that
 * the caller can pass JRB's own status codes (200/202/400/404) straight
 * through — 202 and 400 carry meaningful payloads and are not just failures.
 */
class JtbService
{
    protected string $baseUrl;
    protected string $email;
    protected string $password;
    protected string $clientName;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.jrb.base_url'), '/');
        $this->email = (string) config('services.jrb.email');
        $this->password = (string) config('services.jrb.password');
        $this->clientName = (string) config('services.jrb.client_name');
    }

    /* ---------------------------------------------------------------------
     | Authorisation
     * ------------------------------------------------------------------ */

    /** Cache key for the shared JRB token. */
    protected const TOKEN_KEY = 'jrb.token';

    /**
     * The token every call needs, fetched on demand and shared across
     * requests and users.
     *
     * JRB expires a login session after 60 minutes, so this is cached for 55
     * to leave a margin. Nothing here depends on the web session: a token is
     * obtained when it is first needed, not at login, so a JRB outage cannot
     * lock anybody out of the app.
     */
    public function token(): ?string
    {
        $cached = Cache::get(self::TOKEN_KEY);

        if ($cached) {
            return $cached;
        }

        $token = $this->generateTokenId();

        if ($token) {
            Cache::put(self::TOKEN_KEY, $token, now()->addMinutes(55));
        }

        return $token;
    }

    /** Drop the cached token so the next call logs in again. */
    public function forgetToken(): void
    {
        Cache::forget(self::TOKEN_KEY);
    }

    /**
     * Login. Returns the tokenId, or null when login fails.
     */
    public function generateTokenId(): ?string
    {
        $url = $this->baseUrl . '/api/v1/Account/login';

        $payload = [
            'email' => $this->email,
            'password' => $this->password,
            'clientname' => $this->clientName,
        ];

        $startedAt = microtime(true);

        Log::info('JRB → Login request', [
            'url' => $url,
            'method' => 'POST',
            // The password is a static credential from .env, not diagnostic
            // data — everything else is logged verbatim.
            'request' => array_merge($payload, ['password' => '[redacted]']),
        ]);

        try {
            $response = Http::timeout(15)->acceptJson()->post($url, $payload);

            $data = $response->json();

            Log::info('JRB ← Login response', [
                'url' => $url,
                'status' => $response->status(),
                'duration_ms' => $this->elapsed($startedAt),
                'headers' => $this->headers($response),
                'response' => $data ?? $response->body(),
            ]);

            // The API returns success as the string "true".
            $succeeded = filter_var($data['success'] ?? false, FILTER_VALIDATE_BOOLEAN);

            if ($response->successful() && $succeeded && !empty($data['tokenId'])) {
                return $data['tokenId'];
            }

            Log::error('JRB ✗ Login failed', [
                'url' => $url,
                'status' => $response->status(),
                'errorMsg' => $data['errorMsg'] ?? null,
                'response' => $data ?? $response->body(),
            ]);
        } catch (\Exception $e) {
            Log::error('JRB ✗ Login exception', [
                'url' => $url,
                'duration_ms' => $this->elapsed($startedAt),
                'exception' => $e->getMessage(),
            ]);
        }

        return null;
    }

    /* ---------------------------------------------------------------------
     | Lookups — Non-Individual (Lookups doc v1)
     * ------------------------------------------------------------------ */

    /** Organisation types. Use `id` as organizationTypeId. */
    public function getOrganizationTypes(string $token): array
    {
        return $this->lookup('/api/Lookups/organization-types', $token, 'Organisation Types');
    }

    /** Business sectors. Use `sectorCode` to filter lines of business. */
    public function getBusinessSectors(string $token): array
    {
        return $this->lookup('/api/Lookups/business-sectors', $token, 'Business Sectors');
    }

    /** All lines of business. Use `lobCode` as lineOfBusinessCode. */
    public function getLineOfBusiness(string $token): array
    {
        return $this->lookup('/api/Lookups/line-of-business', $token, 'Line of Business');
    }

    /** Lines of business within one sector, e.g. sectorCode "U". */
    public function getLineOfBusinessBySector(string $token, string $sectorCode): array
    {
        return $this->lookup(
            '/api/Lookups/line-of-business/by-sector/' . rawurlencode($sectorCode),
            $token,
            'Line of Business by Sector'
        );
    }

    /** Revenue authority for one state, e.g. "LA". Use `authCode` as taxAuthority. */
    public function getTaxAuthorityByState(string $token, string $stateCode): array
    {
        return $this->lookup(
            '/api/Lookups/tax-authority/by-state/' . rawurlencode($stateCode),
            $token,
            'Tax Authority by State'
        );
    }

    /* ---------------------------------------------------------------------
     | Lookups — referenced by the registration endpoints (State API v2.2).
     | Paths are given in v2.2; their response shapes are not documented.
     * ------------------------------------------------------------------ */

    /** Titles (Mr, Mrs, …). Use `id` as titleId. */
    public function getTitles(string $token): array
    {
        return $this->lookup('/api/Lookups/titles', $token, 'Titles');
    }

    /** Genders. Use `id` as genderId. */
    public function getGenders(string $token): array
    {
        return $this->lookup('/api/Lookups/genders', $token, 'Genders');
    }

    /** States. Supplies stateOfOriginCode / stateOfResidenceCode / stateCode. */
    public function getStates(string $token): array
    {
        return $this->lookup('/api/Lookups/states', $token, 'States');
    }

    /** Occupations. Use `id` as occupationId. */
    public function getOccupations(string $token): array
    {
        return $this->lookup('/api/Lookups/occupations', $token, 'Occupations');
    }

    /** Marital statuses. Use `id` as maritalStatusId. */
    public function getMaritalStatuses(string $token): array
    {
        return $this->lookup('/api/Lookups/marital-statuses', $token, 'Marital Statuses');
    }

    /** Nationalities. Supplies nationalityCode. */
    public function getNationalities(string $token): array
    {
        return $this->lookup('/api/Lookups/nationalities', $token, 'Nationalities');
    }

    /** Countries. Supplies countryCode. */
    public function getCountries(string $token): array
    {
        return $this->lookup('/api/Lookups/countries', $token, 'Countries');
    }

    /** LGAs within one state. Supplies lgaCode. */
    public function getLgasByState(string $token, string $stateCode): array
    {
        return $this->lookup(
            '/api/Lookups/lgas/by-state/' . rawurlencode($stateCode),
            $token,
            'LGAs by State'
        );
    }

    /* ---------------------------------------------------------------------
     | Individual — lookup and registration (State API v2.2 §2–3)
     * ------------------------------------------------------------------ */

    /**
     * First-level Tax ID lookup by NIN.
     * 200 = found, 202 = found but record incomplete (go to registration),
     * 404 = no record.
     *
     * @param array{nin:string,firstName:string,lastName:string,dateOfBirth:string} $payload
     */
    public function individualFirstLevelLookup(string $token, array $payload): array
    {
        return $this->post('/api/v1/Individual/first-level/taxid/lookup', $token, $payload, 'Individual First-Level Lookup');
    }

    /**
     * Complete new registration (second level) for an individual.
     * Requires the first-level lookup to have run, else status 003.
     */
    public function individualCompleteRegistration(string $token, array $payload): array
    {
        return $this->post('/api/v1/Individual/second-level/taxid/complete-new-registration', $token, $payload, 'Individual Complete Registration');
    }

    /* ---------------------------------------------------------------------
     | Non-Individual — lookup and registration (State API v2.2 §4–5)
     * ------------------------------------------------------------------ */

    /**
     * First-level Tax ID lookup by CAC registration number.
     *
     * @param array{cacRegNo:string,organizationTypeId:int} $payload
     */
    public function nonIndividualFirstLevelLookup(string $token, array $payload): array
    {
        return $this->post('/api/v1/NonIndividual/first-level/taxid/lookup', $token, $payload, 'Non-Individual First-Level Lookup');
    }

    /**
     * Complete new registration (second level) for a company, directors included.
     * Requires the first-level lookup to have run, else status 003.
     */
    public function nonIndividualCompleteRegistration(string $token, array $payload): array
    {
        return $this->post('/api/v1/NonIndividual/second-level/taxid/complete-new-registration', $token, $payload, 'Non-Individual Complete Registration');
    }

    /* ---------------------------------------------------------------------
     | Resolve / verify (State API v2.2 §6–8)
     * ------------------------------------------------------------------ */

    /**
     * Resolve a cooperative society's Tax ID. No prior lookup required.
     * Note: JRB spells the path "Cooporative".
     *
     * @param array{regNo:string,stateCode:string,dateOfIncorporation:string} $payload
     */
    public function resolveCooperative(string $token, array $payload): array
    {
        return $this->post('/api/Cooporative/resolve', $token, $payload, 'Cooperative Resolve');
    }

    /**
     * Resolve an MDA's Tax ID. No prior lookup required.
     *
     * @param array{source:string,Org_No:string} $payload  source: "mda" | "fed_mda"
     */
    public function resolveMda(string $token, array $payload): array
    {
        return $this->post('/api/Mdas/resolve', $token, $payload, 'MDA Resolve');
    }

    /**
     * Verify an existing Tax ID and confirm who it belongs to.
     */
    public function verifyTaxId(string $token, string $taxId): array
    {
        return $this->post('/api/TaxIdVerification/verify', $token, ['taxId' => $taxId], 'TaxID Verification');
    }

    /* ---------------------------------------------------------------------
     | Transport
     * ------------------------------------------------------------------ */

    /**
     * Shared GET for every lookup. Returns:
     *   ['success' => true,  'data' => mixed]
     *   ['success' => false, 'status' => int, 'message' => string, 'data' => mixed]
     */
    protected function lookup(string $path, string $token, string $label, bool $retrying = false): array
    {
        $url = $this->baseUrl . $path;
        $startedAt = microtime(true);

        Log::info("JRB → {$label} request", [
            'url' => $url,
            'method' => 'GET',
            'query' => ['authtoken' => $token],
        ]);

        try {
            $response = Http::timeout(30)
                ->acceptJson()
                ->get($url, ['authtoken' => $token]);

            $body = $response->json();

            Log::info("JRB ← {$label} response", [
                'url' => $url,
                'status' => $response->status(),
                'duration_ms' => $this->elapsed($startedAt),
                'headers' => $this->headers($response),
                'count' => is_array($body) ? count($body) : null,
                'response' => $body ?? $response->body(),
            ]);

            if ($response->successful()) {
                return ['success' => true, 'data' => $body];
            }

            // The 60-minute JRB session lapsed mid-use: re-login once.
            if ($this->isExpiredToken($response->status()) && !$retrying) {
                Log::info("JRB ↻ {$label}: token rejected, retrying with a fresh login");
                $this->forgetToken();

                if ($fresh = $this->token()) {
                    return $this->lookup($path, $fresh, $label, true);
                }
            }

            Log::warning("JRB ✗ {$label} failed", [
                'url' => $url,
                'status' => $response->status(),
                'response' => $body ?? $response->body(),
            ]);

            return [
                'success' => false,
                'status' => $response->status(),
                'message' => "Failed to fetch {$label}.",
                'data' => $body,
            ];
        } catch (\Exception $e) {
            Log::error("JRB ✗ {$label} exception", [
                'url' => $url,
                'duration_ms' => $this->elapsed($startedAt),
                'exception' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'status' => 502,
                'message' => "Could not reach the JRB API for {$label}.",
                'data' => null,
            ];
        }
    }

    /**
     * Shared JSON POST. Returns ['status' => int, 'body' => mixed].
     *
     * Non-2xx responses are returned as-is rather than swallowed: 202, 400 and
     * 404 all carry documented payloads the caller needs to act on.
     */
    protected function post(string $path, string $token, array $payload, string $label, bool $retrying = false): array
    {
        $url = $this->baseUrl . $path;
        $startedAt = microtime(true);

        Log::info("JRB → {$label} request", [
            'url' => $url,
            'method' => 'POST',
            'query' => ['authtoken' => $token],
            'request' => $payload,
        ]);

        try {
            $response = Http::timeout(60)
                ->acceptJson()
                ->asJson()
                ->post($url . '?authtoken=' . urlencode($token), $payload);

            $body = $response->json();

            Log::info("JRB ← {$label} response", [
                'url' => $url,
                'status' => $response->status(),
                'duration_ms' => $this->elapsed($startedAt),
                'headers' => $this->headers($response),
                'response' => $body ?? $response->body(),
            ]);

            // The 60-minute JRB session lapsed mid-use: re-login once.
            if ($this->isExpiredToken($response->status()) && !$retrying) {
                Log::info("JRB ↻ {$label}: token rejected, retrying with a fresh login");
                $this->forgetToken();

                if ($fresh = $this->token()) {
                    return $this->post($path, $fresh, $payload, $label, true);
                }
            }

            if (!$response->successful()) {
                Log::warning("JRB ✗ {$label} returned {$response->status()}", [
                    'url' => $url,
                    'request' => $payload,
                    'response' => $body ?? $response->body(),
                ]);
            }

            return [
                'status' => $response->status(),
                'body' => $body ?? ['raw' => $response->body()],
            ];
        } catch (\Exception $e) {
            Log::error("JRB ✗ {$label} exception", [
                'url' => $url,
                'duration_ms' => $this->elapsed($startedAt),
                'request' => $payload,
                'exception' => $e->getMessage(),
            ]);

            return [
                'status' => 502,
                'body' => [
                    'success' => false,
                    'message' => "Could not reach the JRB API for {$label}.",
                ],
            ];
        }
    }

    /** JRB signals a lapsed session with 401/403. */
    protected function isExpiredToken(int $status): bool
    {
        return in_array($status, [401, 403], true);
    }

    /** Milliseconds since $startedAt, for spotting slow JRB calls. */
    protected function elapsed(float $startedAt): float
    {
        return round((microtime(true) - $startedAt) * 1000, 1);
    }

    /** Response headers worth keeping; the full set is mostly noise. */
    protected function headers($response): array
    {
        return array_intersect_key($response->headers(), array_flip([
            'Content-Type',
            'Content-Length',
            'Date',
            'Server',
        ]));
    }
}
