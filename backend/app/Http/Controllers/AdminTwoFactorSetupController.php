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

class AdminTwoFactorSetupController extends Controller
{
    protected $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Get 2FA status for admin
     */
    public function status(Request $request): JsonResponse
    {
        $admin = $request->user();

        return response()->json([
            'enabled' => $admin->two_factor_enabled ?? false,
            'confirmed' => !is_null($admin->two_factor_confirmed_at),
            'recovery_codes_count' => $admin->two_factor_recovery_codes ? count($admin->two_factor_recovery_codes) : 0,
        ]);
    }

    /**
     * Generate 2FA secret and QR code for admin
     */
    public function generate(Request $request): JsonResponse
    {
        $admin = $request->user();

        // Generate a new secret key
        $secretKey = $this->google2fa->generateSecretKey();

        // Store the secret (temporarily until confirmed)
        $admin->two_factor_secret = encrypt($secretKey);
        $admin->two_factor_enabled = false; // Not enabled until confirmed
        $admin->two_factor_confirmed_at = null;
        $admin->save();

        // Generate QR code URL
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name', 'Laravel') . ' Admin',
            $admin->email,
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
     * Confirm 2FA setup for admin
     */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $admin = $request->user();

        if (!$admin->two_factor_secret) {
            return response()->json([
                'message' => 'No 2FA secret found. Please generate a new secret first.'
            ], 400);
        }

        $secret = decrypt($admin->two_factor_secret);
        $valid = $this->google2fa->verifyKey($secret, $request->code);

        if (!$valid) {
            return response()->json([
                'message' => 'Invalid verification code. Please try again.'
            ], 422);
        }

        // Enable 2FA and generate recovery codes
        $admin->two_factor_enabled = true;
        $admin->two_factor_confirmed_at = now();
        $admin->two_factor_recovery_codes = $this->createRecoveryCodes();
        $admin->save();

        return response()->json([
            'message' => '2FA has been enabled successfully.',
            'recovery_codes' => $admin->two_factor_recovery_codes
        ]);
    }

    /**
     * Disable 2FA for admin
     */
    public function disable(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $admin = $request->user();

        if (!\Hash::check($request->password, $admin->password)) {
            return response()->json([
                'message' => 'Invalid password.'
            ], 422);
        }

        $admin->two_factor_secret = null;
        $admin->two_factor_enabled = false;
        $admin->two_factor_confirmed_at = null;
        $admin->two_factor_recovery_codes = null;
        $admin->save();

        return response()->json([
            'message' => '2FA has been disabled successfully.'
        ]);
    }

    /**
     * Generate new recovery codes for admin
     */
    public function generateRecoveryCodes(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $admin = $request->user();

        if (!\Hash::check($request->password, $admin->password)) {
            return response()->json([
                'message' => 'Invalid password.'
            ], 422);
        }

        if (!$admin->two_factor_enabled) {
            return response()->json([
                'message' => '2FA is not enabled.'
            ], 400);
        }

        $admin->two_factor_recovery_codes = $this->createRecoveryCodes();
        $admin->save();

        return response()->json([
            'message' => 'New recovery codes generated successfully.',
            'recovery_codes' => $admin->two_factor_recovery_codes
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