<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuthApp;
use App\Services\TokenService;
use Illuminate\Support\Facades\Validator;

class ApiController extends Controller
{
    public function generateToken(Request $request, TokenService $tokenService)
{
    $validator = Validator::make($request->all(), [
        'app_name' => 'required|string|max:255',
        'whitelisted_ips' => 'required|string', // or use array if sent that way
        'description' => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'error' => 'Validation failed',
            'messages' => $validator->errors(),
        ], 422);
    }

    $data = $validator->validated();

    // ✅ Use the injected service to generate token
    $token = $tokenService->generateToken($data['app_name']); // optionally pass app_name as context

    $authApp = AuthApp::create([
        'app_name' => $data['app_name'],
        'token' => $token,
        'whitelisted_ips' => [$data['whitelisted_ips']], // store as array (auto-cast to JSON)
        'request_count' => 0,
        'status' => true,
        'description' => $data['description'] ?? null,
        'last_accessed_at' => null,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Token generated successfully.',
        'data' => [
            'app_name' => $authApp->app_name,
            'token' => $authApp->token,
            'whitelisted_ips' => $authApp->whitelisted_ips,
            'status' => $authApp->status,
            'description' => $authApp->description,
        ],
    ], 201);
}
}