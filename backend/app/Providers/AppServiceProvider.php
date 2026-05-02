<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Gate;

use App\Models\Decision;
use App\Models\ApiKey;
use App\Models\Memory;
use App\Policies\DecisionPolicy;
use App\Policies\ApiKeyPolicy;
use App\Policies\MemoryPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ─── Rate Limiters ───────────────────────────────────────────────────────

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

        // ─── Authorization Policies ──────────────────────────────────────────────

        Gate::policy(Decision::class, DecisionPolicy::class);
        Gate::policy(ApiKey::class, ApiKeyPolicy::class);
        Gate::policy(Memory::class, MemoryPolicy::class);
    }
}
