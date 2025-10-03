<?php

use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\TwoFactorAuthController;
use App\Http\Controllers\AdminTwoFactorSetupController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

// Admin Authentication Routes (no middleware)
Route::post('/login', [AdminAuthController::class, 'login']);
Route::post('/authenticate', [TwoFactorAuthController::class, 'authenticateAdmin']);

// Protected Admin Routes
Route::middleware(['admin.auth'])->group(function () {
    // Auth routes
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me', [AdminAuthController::class, 'user']);

    // 2FA Setup for Admins
    Route::prefix('two-factor')->group(function () {
        Route::get('/status', [AdminTwoFactorSetupController::class, 'status']);
        Route::post('/generate', [AdminTwoFactorSetupController::class, 'generate']);
        Route::post('/confirm', [AdminTwoFactorSetupController::class, 'confirm']);
        Route::post('/disable', [AdminTwoFactorSetupController::class, 'disable']);
        Route::post('/recovery-codes', [AdminTwoFactorSetupController::class, 'generateRecoveryCodes']);
    });

    // Admin panel routes
    Route::get('/tools', [AdminController::class, 'tools']);
    Route::post('/tools/{tool}/approve', [AdminController::class, 'approve']);
    Route::post('/tools/{tool}/reject', [AdminController::class, 'reject']);
    Route::get('/stats', [AdminController::class, 'getStats']);
    Route::get('/activities', [AdminController::class, 'activities']);
});