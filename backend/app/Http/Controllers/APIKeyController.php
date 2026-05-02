<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ApiKey;
use App\Services\AuditService;
use App\Services\EncryptionService;
use App\Services\GroqService;
use App\Services\CacheService;

use App\Http\Requests\StoreApiKeyRequest;
use Illuminate\Support\Facades\DB;

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
     * GET /api/api-key — list API keys
     * Admin sees all; user/viewer sees own only.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', ApiKey::class);

        $user = $request->user();

        if ($user->isAdmin()) {
            $keys = ApiKey::select(['id', 'user_id', 'provider', 'status', 'created_at', 'last_used_at'])
                ->latest()
                ->get();
        } else {
            $keys = $user->apiKeys()
                ->select(['id', 'provider', 'status', 'created_at', 'last_used_at'])
                ->latest()
                ->get();
        }

        return response()->json($keys);
    }

    /**
     * POST /api/api-key — store a validated and encrypted API key
     */
    public function store(StoreApiKeyRequest $request)
    {
        $this->authorize('create', ApiKey::class);

        \Log::info('Incoming Request to /api/api-key', $request->all());
        $validated = $request->validated();
        $plainKey = trim($validated['api_key']);
        $provider = $request->input('provider', 'groq');

        // Validate the key against Groq before storing
        if (!$this->groqService->validateApiKey($plainKey)) {
            AuditService::log(
                $request->user()->id,
                'api_key_validation',
                'failure',
                ['provider' => $provider, 'reason' => 'invalid_key']
            );

            return response()->json([
                'error' => 'The provided API key is invalid or could not be verified with Groq.',
            ], 422);
        }

        return DB::transaction(function () use ($request, $plainKey, $provider) {
            // Deactivate any existing keys for this provider (Strict Branding Rule)
            $request->user()->apiKeys()
                ->where('provider', $provider)
                ->update(['status' => false]);

            $encryptedKey = $this->encryption->encryptKey($plainKey);

            $status = ($request->input('status') === 'inactive') ? false : true;

            try {
                $apiKey = $request->user()->apiKeys()->create([
                    'provider' => $provider,
                    'encrypted_key' => $encryptedKey,
                    'status' => $status,
                ]);
                \Log::info('Database insert success: ApiKey created', ['api_key_id' => $apiKey->id]);
            } catch (\Exception $e) {
                \Log::error('Database insert failure: ApiKey failed', ['error' => $e->getMessage()]);
                throw $e;
            }

            AuditService::log(
                $request->user()->id,
                'api_key_added',
                'success',
                ['provider' => $apiKey->provider, 'api_key_id' => $apiKey->id]
            );

            return response()->json([
                'message' => 'API key validated and stored securely.',
                'id' => $apiKey->id,
                'provider' => $apiKey->provider,
            ], 201);
        });
    }

    /**
     * PUT /api/api-key/{apiKey} — toggle active status
     */
    public function update(Request $request, ApiKey $apiKey)
    {
        $this->authorize('update', $apiKey);

        $validated = $request->validate([
            'status' => 'required|boolean',
        ]);

        $apiKey->update(['status' => $validated['status']]);

        AuditService::log(
            $request->user()->id,
            'api_key_toggle',
            'success',
            ['api_key_id' => $apiKey->id, 'new_status' => $validated['status']]
        );

        return response()->json(['message' => 'API key updated.', 'status' => $apiKey->status]);
    }

    /**
     * DELETE /api/api-key/{apiKey} — remove an API key
     */
    public function destroy(Request $request, ApiKey $apiKey)
    {
        $this->authorize('delete', $apiKey);

        $apiKey->delete();

        // Flush cached decisions — key changes affect AI logic
        $this->cache->invalidateUser($apiKey->user_id);

        AuditService::log(
            $request->user()->id,
            'api_key_deleted',
            'success',
            ['provider' => $apiKey->provider, 'api_key_id' => $apiKey->id]
        );

        return response()->json(['message' => 'API key deleted.'], 200);
    }
}
