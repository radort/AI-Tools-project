<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TwoFactorController;
use App\Http\Controllers\TwoFactorAuthController;
use App\Http\Controllers\TwoFactorSetupController;
use App\Http\Controllers\Api\ToolController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\RatingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/authenticate', [TwoFactorAuthController::class, 'authenticateUser']);

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'test works']);
});

// Simple test login without any middleware
Route::post('/test-login', function (Illuminate\Http\Request $request) {
    return response()->json([
        'message' => 'test login endpoint works',
        'data' => $request->all(),
        'origin' => $request->header('Origin'),
        'user_agent' => $request->header('User-Agent')
    ]);
});

// Public routes (no authentication required)
Route::get('/categories', [CategoryController::class, 'index']);

// Public tool comments and ratings (read-only)
Route::get('tools/{tool}/comments', [CommentController::class, 'index']);
Route::get('tools/{tool}/comments/{comment}', [CommentController::class, 'show']);
Route::get('tools/{tool}/ratings', [RatingController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // 2FA Setup
    Route::prefix('two-factor')->group(function () {
        Route::get('/status', [TwoFactorSetupController::class, 'status']);
        Route::post('/generate', [TwoFactorSetupController::class, 'generate']);
        Route::post('/confirm', [TwoFactorSetupController::class, 'confirm']);
        Route::post('/disable', [TwoFactorSetupController::class, 'disable']);
        Route::post('/recovery-codes', [TwoFactorSetupController::class, 'generateRecoveryCodes']);
    });

    // Tools
    Route::apiResource('tools', ToolController::class);

    // Tool Comments (authenticated write operations)
    Route::post('tools/{tool}/comments', [CommentController::class, 'store']);
    Route::put('tools/{tool}/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('tools/{tool}/comments/{comment}', [CommentController::class, 'destroy']);

    // Tool Ratings (authenticated operations)
    Route::post('tools/{tool}/ratings', [RatingController::class, 'store']);
    Route::get('tools/{tool}/my-rating', [RatingController::class, 'show']);
    Route::delete('tools/{tool}/my-rating', [RatingController::class, 'destroy']);

    // Categories
    Route::post('/categories', [CategoryController::class, 'store']);

    // Admin Routes
    Route::prefix('admin')->group(function () {
        Route::get('/tools', [AdminController::class, 'tools']);
        Route::post('/tools/{tool}/approve', [AdminController::class, 'approve']);
        Route::post('/tools/{tool}/reject', [AdminController::class, 'reject']);
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/activities', [AdminController::class, 'activities']);
    });

    // Stats
    Route::get('/stats/tool-counts', [CategoryController::class, 'toolCounts']);
});
