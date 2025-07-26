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
        'whitelisted_ips' => 'required|string',
        'description' => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'error' => 'Validation failed',
            'messages' => $validator->errors(),
        ], 422);
    }

    $data = $validator->validated();
    $token = $tokenService->generateToken($data['app_name']);

    $authApp = AuthApp::create([
        'app_name' => $data['app_name'],
        'token' => $token,
        'whitelisted_ips' => explode(',', $data['whitelisted_ips']), // ✅ fixed
        'request_count' => 0,
        'status' => true,
        'description' => $data['description'] ?? null,
        'last_accessed_at' => null,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Token generated successfully.',
        'data' => $authApp,
    ], 201);
}


    public function getAllAuthApps()
    {
        $apps = AuthApp::orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'data' => $apps
        ]);
    }

    public function updateApp(Request $request, $id)
{
    $authApp = AuthApp::find($id);
    if (!$authApp) {
        return response()->json(['success' => false, 'message' => 'App not found.'], 404);
    }

    $validator = Validator::make($request->all(), [
        'app_name' => 'required|string|max:255',
        'whitelisted_ips' => 'required|string',
        'description' => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json(['error' => 'Validation failed', 'messages' => $validator->errors()], 422);
    }

    $authApp->update([
        'app_name' => $request->app_name,
        'whitelisted_ips' => explode(',', $request->whitelisted_ips), // ✅ fixed
        'description' => $request->description,
    ]);

    return response()->json(['success' => true, 'message' => 'App updated successfully.', 'data' => $authApp]);
}

    public function deleteApp($id)
    {
        $authApp = AuthApp::find($id);
        if (!$authApp) {
            return response()->json(['success' => false, 'message' => 'App not found.'], 404);
        }

        $authApp->delete();

        return response()->json(['success' => true, 'message' => 'App deleted successfully.']);
    }

    public function toggleStatus($id)
    {
        $authApp = AuthApp::find($id);
        if (!$authApp) {
            return response()->json(['success' => false, 'message' => 'App not found.'], 404);
        }

        $authApp->status = !$authApp->status;
        $authApp->save();

        return response()->json([
            'success' => true,
            'message' => 'App status updated.',
            'data' => [
                'id' => $authApp->id,
                'status' => $authApp->status
            ]
        ]);
    }
}
