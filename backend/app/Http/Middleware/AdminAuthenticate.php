<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Admin;
use Laravel\Sanctum\PersonalAccessToken;

class AdminAuthenticate
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Admin authentication required'], 401);
        }

        // Find the token in personal_access_tokens table (Sanctum)
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            return response()->json(['message' => 'Invalid admin token'], 401);
        }

        // Get the admin (tokenable model)
        $admin = $accessToken->tokenable;

        // Check if the tokenable is an Admin model
        if (!$admin || !$admin instanceof Admin) {
            return response()->json(['message' => 'Invalid admin token'], 401);
        }

        if (!$admin->is_active) {
            return response()->json(['message' => 'Admin account is deactivated'], 401);
        }

        // Update last used at
        $accessToken->update(['last_used_at' => now()]);

        // Set the admin on the request
        $request->setUserResolver(function () use ($admin) {
            return $admin;
        });

        return $next($request);
    }
}