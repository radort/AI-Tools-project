<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Admin;
use PragmaRX\Google2FA\Google2FA;
use Illuminate\Support\Str;

class TwoFactorAuthController extends Controller
{
    protected $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Handle user intermediate authentication check
     */
    public function authenticateUser(Request $request): JsonResponse
    {
        // Basic validation first
        $request->validate([
            'token' => 'required|string',
        ]);

        $token = $request->input('token');

        // Verify the intermediate token and get user
        $user = $this->getUserFromToken($token);
        if (!$user) {
            return response()->json([
                'message' => 'Invalid or expired token',
                'error' => 'unauthorized'
            ], 401);
        }

        // Check if 2FA is enabled for this user
        if ($user->two_factor_enabled && $user->two_factor_confirmed_at) {
            $twoFactorCode = $request->input('two_factor_code');

            // If no 2FA code provided, ask for it
            if (!$twoFactorCode || trim($twoFactorCode) === '') {
                return response()->json([
                    'requires_2fa' => true,
                    'message' => '2FA code required'
                ], 200);
            }

            // Validate 2FA code format
            if (!is_string($twoFactorCode) || strlen($twoFactorCode) !== 6 || !ctype_digit($twoFactorCode)) {
                return response()->json([
                    'message' => 'Invalid 2FA code format. Please enter a 6-digit code.',
                    'error' => 'invalid_2fa_format'
                ], 422);
            }

            // Verify 2FA code
            if (!$this->verify2FACode($user, $twoFactorCode)) {
                return response()->json([
                    'message' => 'Invalid 2FA code',
                    'error' => 'invalid_2fa_code'
                ], 422);
            }
        }

        // Generate final auth token
        $authToken = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Authentication successful',
            'token' => $authToken,
            'user' => $user->makeHidden(['two_factor_secret', 'two_factor_recovery_codes'])
        ]);
    }

    /**
     * Handle admin intermediate authentication check
     */
    public function authenticateAdmin(Request $request): JsonResponse
    {
        // Basic validation first
        $request->validate([
            'token' => 'required|string',
        ]);

        $token = $request->input('token');

        // Verify the intermediate token and get admin
        $admin = $this->getAdminFromToken($token);
        if (!$admin) {
            return response()->json([
                'message' => 'Invalid or expired token',
                'error' => 'unauthorized'
            ], 401);
        }

        // Check if 2FA is enabled for this admin
        if ($admin->two_factor_enabled && $admin->two_factor_confirmed_at) {
            $twoFactorCode = $request->input('two_factor_code');

            // If no 2FA code provided, ask for it
            if (!$twoFactorCode || trim($twoFactorCode) === '') {
                return response()->json([
                    'requires_2fa' => true,
                    'message' => '2FA code required'
                ], 200);
            }

            // Validate 2FA code format
            if (!is_string($twoFactorCode) || strlen($twoFactorCode) !== 6 || !ctype_digit($twoFactorCode)) {
                return response()->json([
                    'message' => 'Invalid 2FA code format. Please enter a 6-digit code.',
                    'error' => 'invalid_2fa_format'
                ], 422);
            }

            // Verify 2FA code
            if (!$this->verify2FACode($admin, $twoFactorCode)) {
                return response()->json([
                    'message' => 'Invalid 2FA code',
                    'error' => 'invalid_2fa_code'
                ], 422);
            }
        }

        // Generate final auth token
        $authToken = $admin->createToken('admin_auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Authentication successful',
            'token' => $authToken,
            'admin' => $admin->makeHidden(['two_factor_secret', 'two_factor_recovery_codes'])
        ]);
    }

    /**
     * Get user from intermediate token
     */
    private function getUserFromToken(string $token): ?User
    {
        // For now, we'll use a simple approach - the intermediate token
        // contains the user ID and expires in 10 minutes
        try {
            $decoded = json_decode(base64_decode($token), true);
            if (!$decoded || !isset($decoded['user_id']) || !isset($decoded['expires_at'])) {
                return null;
            }

            if (time() > $decoded['expires_at']) {
                return null;
            }

            return User::find($decoded['user_id']);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get admin from intermediate token
     */
    private function getAdminFromToken(string $token): ?Admin
    {
        try {
            $decoded = json_decode(base64_decode($token), true);
            if (!$decoded || !isset($decoded['admin_id']) || !isset($decoded['expires_at'])) {
                return null;
            }

            if (time() > $decoded['expires_at']) {
                return null;
            }

            return Admin::find($decoded['admin_id']);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Verify 2FA code
     */
    private function verify2FACode($user, string $code): bool
    {
        if (!$user->two_factor_secret) {
            return false;
        }

        // Check if it's a recovery code
        if ($user->two_factor_recovery_codes && in_array($code, $user->two_factor_recovery_codes)) {
            // Remove used recovery code
            $recoveryCodes = array_diff($user->two_factor_recovery_codes, [$code]);
            $user->two_factor_recovery_codes = array_values($recoveryCodes);
            $user->save();
            return true;
        }

        // Verify TOTP code
        return $this->google2fa->verifyKey(
            decrypt($user->two_factor_secret),
            $code
        );
    }

    /**
     * Generate intermediate token for user
     */
    public static function generateUserToken(User $user): string
    {
        $payload = [
            'user_id' => $user->id,
            'expires_at' => time() + (10 * 60), // 10 minutes
            'type' => 'user_intermediate'
        ];

        return base64_encode(json_encode($payload));
    }

    /**
     * Generate intermediate token for admin
     */
    public static function generateAdminToken(Admin $admin): string
    {
        $payload = [
            'admin_id' => $admin->id,
            'expires_at' => time() + (10 * 60), // 10 minutes
            'type' => 'admin_intermediate'
        ];

        return base64_encode(json_encode($payload));
    }
}