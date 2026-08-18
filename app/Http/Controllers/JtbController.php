<?php

namespace App\Http\Controllers;

use App\Services\JtbService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * JRB State API — lookups, Tax ID lookups, registrations and resolves.
 *
 * Lookup actions return the service envelope. The POST actions pass JRB's own
 * status code and body straight through, so the frontend can act on the
 * documented codes (200 found, 202 record incomplete, 400/404, and the
 * body-level registration codes 000/001/003/004).
 */
class JtbController extends Controller
{
    protected $jtbService;

    public function __construct(JtbService $jtbService)
    {
        $this->jtbService = $jtbService;
    }

    /**
     * Generate a fresh token from JRB (manual trigger, optional).
     */
    public function getToken(): JsonResponse
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

    /* ---------------------------------------------------------------------
     | Lookups
     * ------------------------------------------------------------------ */

    public function organizationTypes(): JsonResponse
    {
        return $this->withToken(fn ($t) => $this->jtbService->getOrganizationTypes($t));
    }

    public function businessSectors(): JsonResponse
    {
        return $this->withToken(fn ($t) => $this->jtbService->getBusinessSectors($t));
    }

    public function lineOfBusiness(): JsonResponse
    {
        return $this->withToken(fn ($t) => $this->jtbService->getLineOfBusiness($t));
    }

    public function lineOfBusinessBySector(string $sectorCode): JsonResponse
    {
        return $this->withToken(fn ($t) => $this->jtbService->getLineOfBusinessBySector($t, $sectorCode));
    }

    public function taxAuthorityByState(string $stateCode): JsonResponse
    {
        return $this->withToken(fn ($t) => $this->jtbService->getTaxAuthorityByState($t, $stateCode));
    }

    public function titles(): JsonResponse
    {
        return $this->withToken(fn ($t) => $this->jtbService->getTitles($t));
    }

    public function genders(): JsonResponse
    {
        return $this->withToken(fn ($t) => $this->jtbService->getGenders($t));
    }

    public function states(): JsonResponse
    {
        return $this->withToken(fn ($t) => $this->jtbService->getStates($t));
    }

    public function occupations(): JsonResponse
    {
        return $this->withToken(fn ($t) => $this->jtbService->getOccupations($t));
    }

    public function maritalStatuses(): JsonResponse
    {
        return $this->withToken(fn ($t) => $this->jtbService->getMaritalStatuses($t));
    }

    public function nationalities(): JsonResponse
    {
        return $this->withToken(fn ($t) => $this->jtbService->getNationalities($t));
    }

    public function countries(): JsonResponse
    {
        return $this->withToken(fn ($t) => $this->jtbService->getCountries($t));
    }

    public function lgasByState(string $stateCode): JsonResponse
    {
        return $this->withToken(fn ($t) => $this->jtbService->getLgasByState($t, $stateCode));
    }

    /* ---------------------------------------------------------------------
     | Individual
     * ------------------------------------------------------------------ */

    public function individualLookup(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nin' => 'required|string|digits:11',
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'dateOfBirth' => 'required|date_format:d/m/Y',
        ]);

        return $this->proxy(fn ($t) => $this->jtbService->individualFirstLevelLookup($t, $data));
    }

    public function individualRegister(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nin' => 'required|string|digits:11',
            'bvn' => 'nullable|string',
            'titleId' => 'required|integer|min:1',
            'firstName' => 'required|string',
            'middleName' => 'nullable|string',
            'lastName' => 'required|string',
            'genderId' => 'required|integer|min:1',
            'stateOfOriginCode' => 'required|string',
            'dateOfBirth' => 'required|date_format:d/m/Y',
            'occupationId' => 'required|integer|min:1',
            'maritalStatusId' => 'required|integer|min:1',
            'phoneNumber1' => 'required|string',
            'phoneNumber2' => 'nullable|string',
            'email' => 'nullable|email',
            'maidenName' => 'nullable|string',
            'nextOfKin' => 'nullable|string',
            'nationalityCode' => 'required|string',
            'isResident' => 'required|boolean',
            'isExporter' => 'required|boolean',
            'isImporter' => 'required|boolean',
            'countryCode' => 'required|string',
            'stateOfResidenceCode' => 'required|string',
            'lgaCode' => 'required|string',
            'city' => 'required|string',
            'street' => 'required|string',
            'houseNumber' => 'required|string',
            'taxpayerPhoto' => 'nullable|string',
        ]);

        $data = $this->castBooleans($data, ['isResident', 'isExporter', 'isImporter']);

        return $this->proxy(fn ($t) => $this->jtbService->individualCompleteRegistration($t, $data));
    }

    /* ---------------------------------------------------------------------
     | Non-Individual
     * ------------------------------------------------------------------ */

    public function nonIndividualLookup(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cacRegNo' => 'required|string',
            'organizationTypeId' => 'required|integer|min:1',
        ]);

        return $this->proxy(fn ($t) => $this->jtbService->nonIndividualFirstLevelLookup($t, $data));
    }

    public function nonIndividualRegister(Request $request): JsonResponse
    {
        $data = $request->validate([
            'organizationTypeId' => 'required|integer|min:1',
            'registrationNumber' => 'required|string',
            'phoneNumber1' => 'required|string',
            'phoneNumber2' => 'nullable|string',
            'emailAddress' => 'nullable|email',
            'lineOfBusinessCode' => 'required|string',
            'commencementDate' => 'required|date_format:d/m/Y',
            'dateOfIncorporation' => 'required|date_format:d/m/Y',
            'isExporter' => 'required|boolean',
            'isImporter' => 'required|boolean',
            'isLandlord' => 'required|boolean',
            'countryCode' => 'required|string',
            'stateCode' => 'required|string',
            'lgaCode' => 'required|string',
            'city' => 'required|string',
            'streetName' => 'required|string',
            'houseNumber' => 'required|string',
            'poBox' => 'nullable|string',
            'postalCode' => 'nullable|string',
            // dd/MM only — a regex, not date_format:d/m, so that 29/02 does not
            // depend on whether the current year happens to be a leap year.
            'fiscalYearStart' => ['required', 'regex:/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])$/'],
            'fiscalYearEnd' => ['required', 'regex:/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])$/'],
            'shareCapital' => 'required|numeric',
            'directors' => 'required|array|min:1',
            'directors.*.directorTaxId' => 'nullable|string',
            // JRB rejects the literal placeholder "string" as a director name.
            'directors.*.name' => 'required|string|not_in:string',
            'directors.*.phone' => 'nullable|string',
            'directors.*.email' => 'nullable|email',
            'directors.*.address' => 'nullable|string',
            'directors.*.shares' => 'nullable|string',
        ]);

        $data = $this->castBooleans($data, ['isExporter', 'isImporter', 'isLandlord']);
        $data['shareCapital'] = (float) $data['shareCapital'];

        return $this->proxy(fn ($t) => $this->jtbService->nonIndividualCompleteRegistration($t, $data));
    }

    /* ---------------------------------------------------------------------
     | Resolve / verify
     * ------------------------------------------------------------------ */

    public function resolveCooperative(Request $request): JsonResponse
    {
        $data = $request->validate([
            'regNo' => 'required|string',
            'stateCode' => 'required|string',
            'dateOfIncorporation' => 'required|date_format:d/m/Y',
        ]);

        return $this->proxy(fn ($t) => $this->jtbService->resolveCooperative($t, $data));
    }

    public function resolveMda(Request $request): JsonResponse
    {
        $data = $request->validate([
            'source' => 'required|string|in:mda,fed_mda',
            'Org_No' => 'required|string',
        ]);

        return $this->proxy(fn ($t) => $this->jtbService->resolveMda($t, $data));
    }

    public function verifyTaxId(Request $request): JsonResponse
    {
        $data = $request->validate([
            'taxId' => 'required|string',
        ]);

        return $this->proxy(fn ($t) => $this->jtbService->verifyTaxId($t, $data['taxId']));
    }

    /* ---------------------------------------------------------------------
     | Helpers
     * ------------------------------------------------------------------ */

    /**
     * Run a lookup with a JRB token, or 503 if one cannot be obtained.
     */
    protected function withToken(callable $lookup): JsonResponse
    {
        $token = $this->jtbService->token();

        if (!$token) {
            return $this->unavailable();
        }

        $result = $lookup($token);

        return response()->json(
            $result,
            $result['success'] ? 200 : ($result['status'] ?? 502)
        );
    }

    /**
     * Run a JRB POST and pass its status and body through untouched.
     */
    protected function proxy(callable $call): JsonResponse
    {
        $token = $this->jtbService->token();

        if (!$token) {
            return $this->unavailable();
        }

        $result = $call($token);

        return response()->json($result['body'], $result['status']);
    }

    /**
     * We could not log in to JRB at all — a credential or connectivity
     * problem on our side, not something the operator did wrong.
     */
    protected function unavailable(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Could not authenticate with the JRB API. Check the JRB_* credentials '
                . 'and that this server can reach ' . config('services.jrb.base_url') . '.',
        ], 503);
    }

    /**
     * JRB expects real JSON booleans; form posts arrive as "1"/"true".
     */
    protected function castBooleans(array $data, array $keys): array
    {
        foreach ($keys as $key) {
            $data[$key] = filter_var($data[$key], FILTER_VALIDATE_BOOLEAN);
        }

        return $data;
    }
}
