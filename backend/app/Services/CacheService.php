<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CacheService
{
    /**
     * Cache TTL for decision results (1 hour).
     */
    const DECISION_TTL_MINUTES = 60;

    /**
     * Get a cached decision result by user + domain + input hash.
     */
    public function getDecision(int $userId, string $domain, string $inputData): ?array
    {
        $key = $this->buildKey($userId, $domain, $inputData);

        try {
            return Cache::get($key);
        } catch (\Exception $e) {
            Log::warning('CacheService: get failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Store a decision result in cache.
     */
    public function putDecision(int $userId, string $domain, string $inputData, mixed $value): void
    {
        $key = $this->buildKey($userId, $domain, $inputData);

        try {
            Cache::put($key, $value, now()->addMinutes(self::DECISION_TTL_MINUTES));
        } catch (\Exception $e) {
            Log::warning('CacheService: put failed', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Invalidate a user's cached decisions (e.g., when API key changes).
     */
    public function invalidateUser(int $userId): void
    {
        try {
            // Tags only work with Redis/Memcached drivers
            if (in_array(config('cache.default'), ['redis', 'memcached'])) {
                Cache::tags("user:{$userId}")->flush();
            }
        } catch (\Exception $e) {
            Log::warning('CacheService: invalidate failed', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Build a deterministic cache key.
     */
    private function buildKey(int $userId, string $domain, string $inputData): string
    {
        return 'decision:' . $userId . ':' . md5($domain . '|' . trim($inputData));
    }
}
