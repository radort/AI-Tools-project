<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Str;

class TwoFactorSetupController extends Controller
{
    protected $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Get 2FA status for user
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'enabled' => $user->two_factor_enabled ?? false,
            'confirmed' => !is_null($user->two_factor_confirmed_at),
            'recovery_codes_count' => $user->two_factor_recovery_codes ? count($user->two_factor_recovery_codes) : 0,
        ]);
    }

    /**
     * Generate 2FA secret and QR code
     */
    public function generate(Request $request): JsonResponse
    {
        $user = $request->user();

        // Generate a new secret key
        $secretKey = $this->google2fa->generateSecretKey();

        // Store the secret (temporarily until confirmed)
        $user->two_factor_secret = encrypt($secretKey);
        $user->two_factor_enabled = false; // Not enabled until confirmed
        $user->two_factor_confirmed_at = null;
        $user->save();

        // Generate QR code URL
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name', 'Laravel'),
            $user->email,
            $secretKey
        );

        // Generate QR code SVG
        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        $qrCodeSvg = $writer->writeString($qrCodeUrl);

        return response()->json([
            'secret' => $secretKey,
            'qr_code' => base64_encode($qrCodeSvg),
            'manual_entry_key' => chunk_split($secretKey, 4, ' ')
        ]);
    }

    /**
     * Confirm 2FA setup
     */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!$user->two_factor_secret) {
            return response()->json([
                'message' => 'No 2FA secret found. Please generate a new secret first.'
            ], 400);
        }

        $secret = decrypt($user->two_factor_secret);
        $valid = $this->google2fa->verifyKey($secret, $request->code);

        if (!$valid) {
            return response()->json([
                'message' => 'Invalid verification code. Please try again.'
            ], 422);
        }

        // Enable 2FA and generate recovery codes
        $user->two_factor_enabled = true;
        $user->two_factor_confirmed_at = now();
        $user->two_factor_recovery_codes = $this->createRecoveryCodes();
        $user->save();

        return response()->json([
            'message' => '2FA has been enabled successfully.',
            'recovery_codes' => $user->two_factor_recovery_codes
        ]);
    }

    /**
     * Disable 2FA
     */
    public function disable(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (!\Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid password.'
            ], 422);
        }

        $user->two_factor_secret = null;
        $user->two_factor_enabled = false;
        $user->two_factor_confirmed_at = null;
        $user->two_factor_recovery_codes = null;
        $user->save();

        return response()->json([
            'message' => '2FA has been disabled successfully.'
        ]);
    }

    /**
     * Generate new recovery codes
     */
    public function generateRecoveryCodes(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (!\Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid password.'
            ], 422);
        }

        if (!$user->two_factor_enabled) {
            return response()->json([
                'message' => '2FA is not enabled.'
            ], 400);
        }

        $user->two_factor_recovery_codes = $this->createRecoveryCodes();
        $user->save();

        return response()->json([
            'message' => 'New recovery codes generated successfully.',
            'recovery_codes' => $user->two_factor_recovery_codes
        ]);
    }

    /**
     * Generate recovery codes
     */
    private function createRecoveryCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = strtoupper(Str::random(5) . '-' . Str::random(5));
        }
        return $codes;
    }
}