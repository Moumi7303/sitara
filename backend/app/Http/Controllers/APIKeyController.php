<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ApiKey;
use App\Models\AuditLog;
use App\Services\EncryptionService;
use App\Services\GroqService;
use App\Services\CacheService;

class APIKeyController extends Controller
{
    protected EncryptionService $encryption;
    protected GroqService $groqService;
    protected CacheService $cache;

    public function __construct(EncryptionService $encryption, GroqService $groqService, CacheService $cache)
    {
        $this->encryption = $encryption;
        $this->groqService = $groqService;
        $this->cache = $cache;
    }

    /**
     * GET /api/api-key — list user's API keys (id, provider, status only — never the key)
     */
    public function index(Request $request)
    {
        $keys = $request->user()
            ->apiKeys()
            ->select(['id', 'provider', 'status', 'created_at', 'last_used_at'])
            ->latest()
            ->get();

        return response()->json($keys);
    }

    /**
     * POST /api/api-key — store a validated and encrypted API key
     */
    public function store(Request $request)
    {
        $request->validate([
            'key' => 'required|string|min:10|max:500',
            'provider' => 'nullable|string|in:groq',
        ]);

        $plainKey = trim($request->key);

        // Validate the key against Groq before storing
        if (!$this->groqService->validateApiKey($plainKey)) {
            return response()->json([
                'error' => 'The provided API key is invalid or could not be verified with Groq.',
            ], 422);
        }

        // Deactivate any existing keys for this provider
        $request->user()->apiKeys()
            ->where('provider', $request->provider ?? 'groq')
            ->update(['status' => false]);

        $encryptedKey = $this->encryption->encryptKey($plainKey);

        $apiKey = $request->user()->apiKeys()->create([
            'provider' => $request->provider ?? 'groq',
            'encrypted_key' => $encryptedKey,
            'status' => true,
        ]);

        // Audit log
        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'api_key_added',
            'details' => ['provider' => $apiKey->provider, 'api_key_id' => $apiKey->id],
        ]);

        return response()->json([
            'message' => 'API key validated and stored securely.',
            'id' => $apiKey->id,
            'provider' => $apiKey->provider,
        ], 201);
    }

    /**
     * PUT /api/api-key/{apiKey} — toggle active status
     */
    public function update(Request $request, ApiKey $apiKey)
    {
        if ($apiKey->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|boolean',
        ]);

        $apiKey->update(['status' => $request->status]);

        return response()->json(['message' => 'API key updated.', 'status' => $apiKey->status]);
    }

    /**
     * DELETE /api/api-key/{apiKey} — remove an API key
     */
    public function destroy(Request $request, ApiKey $apiKey)
    {
        if ($apiKey->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $apiKey->delete();

        // Flush any cached decisions — a key change may affect AI results
        $this->cache->invalidateUser($request->user()->id);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'api_key_deleted',
            'details' => ['provider' => $apiKey->provider],
        ]);

        return response()->json(['message' => 'API key deleted.'], 200);
    }
}
