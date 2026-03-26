<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\APIKeyController;
use App\Http\Controllers\DecisionController;

// ─── Rate Limiters ──────────────────────────────────────────────────────────

// General API: 60 requests/min per user or IP
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

// AI Decisions: 10 requests/min per user
RateLimiter::for('ai_decisions', function (Request $request) {
    return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip())
        ->response(fn() => response()->json([
            'error' => 'Too many decision requests. Please wait before making another request.',
        ], 429));
});

// ─── Public Auth Routes ──────────────────────────────────────────────────────

Route::post('/auth/register', [AuthenticationController::class, 'register'])
    ->middleware('throttle:5,1'); // Max 5 registrations/min per IP

Route::post('/auth/login', [AuthenticationController::class, 'login'])
    ->middleware('throttle:10,1'); // Max 10 login attempts/min per IP

// ─── Authenticated Routes ────────────────────────────────────────────────────

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // User Profile
    Route::get('/user/profile', [AuthenticationController::class, 'profile']);

    // API Keys Management
    Route::get('/api-key', [APIKeyController::class, 'index']);
    Route::post('/api-key', [APIKeyController::class, 'store']);
    Route::put('/api-key/{apiKey}', [APIKeyController::class, 'update']);
    Route::delete('/api-key/{apiKey}', [APIKeyController::class, 'destroy']);

    // Decisions History & Management
    Route::get('/decisions', [DecisionController::class, 'index']);
    Route::get('/decisions/{decision}', [DecisionController::class, 'show']);
    
    // AI-processed decision
    // Supports ?async=true to dispatch to queue
    Route::post('/decision', [DecisionController::class, 'store'])
        ->middleware('throttle:ai_decisions');

    // Re-run Decision
    Route::post('/decisions/{decision}/rerun', [DecisionController::class, 'rerun'])
        ->middleware('throttle:ai_decisions');

    // SSE streaming endpoint
    Route::get('/decisions/{decision}/stream', [DecisionController::class, 'stream'])
        ->middleware('throttle:ai_decisions');

    // Status polling for async (queued) decisions
    Route::get('/decisions/{decision}/status', function (Request $request, \App\Models\Decision $decision) {
        if ($decision->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        return response()->json([
            'decision_id' => $decision->id,
            'status'      => $decision->status,
            'output'      => $decision->status === 'completed' ? $decision->load('output')->output : null,
        ]);
    });
});
