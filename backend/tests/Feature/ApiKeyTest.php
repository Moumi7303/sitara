<?php

use App\Models\ApiKey;
use App\Models\User;
use App\Services\EncryptionService;
use App\Services\GroqService;
use App\Services\CacheService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Helper: creates an authenticated user and returns [user, token, headers]
function authUser(): array
{
    $user  = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;
    return [$user, $token, ['Authorization' => "Bearer $token"]];
}

// ─── GET /api/api-key ────────────────────────────────────────────────────────

describe('GET /api/api-key', function () {

    it('returns an empty list when user has no API keys', function () {
        [, , $headers] = authUser();

        $this->withHeaders($headers)->getJson('/api/api-key')
             ->assertStatus(200)
             ->assertJson([]);
    });

    it('lists only the authenticated user\'s keys', function () {
        [$user, , $headers] = authUser();
        $other = User::factory()->create();

        ApiKey::create(['user_id' => $user->id,  'provider' => 'groq', 'encrypted_key' => 'enc1', 'status' => true]);
        ApiKey::create(['user_id' => $other->id, 'provider' => 'groq', 'encrypted_key' => 'enc2', 'status' => true]);

        $response = $this->withHeaders($headers)->getJson('/api/api-key');

        $response->assertStatus(200);
        expect(count($response->json()))->toBe(1);
    });

    it('does not expose encrypted_key in the response', function () {
        [$user, , $headers] = authUser();
        ApiKey::create(['user_id' => $user->id, 'provider' => 'groq', 'encrypted_key' => 'super_secret', 'status' => true]);

        $response = $this->withHeaders($headers)->getJson('/api/api-key');

        $response->assertStatus(200);
        foreach ($response->json() as $key) {
            expect($key)->not->toHaveKey('encrypted_key');
        }
    });

    it('returns 401 when unauthenticated', function () {
        $this->getJson('/api/api-key')->assertStatus(401);
    });
});

// ─── POST /api/api-key ───────────────────────────────────────────────────────

describe('POST /api/api-key', function () {

    it('stores an API key after successful Groq validation', function () {
        [$user, , $headers] = authUser();

        // Mock GroqService to return true (key valid)
        $this->spy(GroqService::class, function ($spy) {
            $spy->shouldReceive('validateApiKey')->andReturn(true);
        });

        $response = $this->withHeaders($headers)->postJson('/api/api-key', [
            'api_key'  => 'gsk_validtestapikey12345',
            'provider' => 'groq',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'id', 'provider']);

        $this->assertDatabaseHas('api_keys', ['user_id' => $user->id, 'provider' => 'groq']);
    });

    it('rejects an invalid API key', function () {
        [, , $headers] = authUser();

        $this->spy(GroqService::class, function ($spy) {
            $spy->shouldReceive('validateApiKey')->andReturn(false);
        });

        $this->withHeaders($headers)->postJson('/api/api-key', [
            'api_key'  => 'bad_key',
            'provider' => 'groq',
        ])->assertStatus(422);
    });

    it('returns 401 when unauthenticated', function () {
        $this->postJson('/api/api-key', ['api_key' => 'test'])->assertStatus(401);
    });
});

// ─── PUT /api/api-key/{id} ───────────────────────────────────────────────────

describe('PUT /api/api-key/{id}', function () {

    it('toggles API key status', function () {
        [$user, , $headers] = authUser();
        $key = ApiKey::create(['user_id' => $user->id, 'provider' => 'groq', 'encrypted_key' => 'enc', 'status' => true]);

        $this->withHeaders($headers)->putJson("/api/api-key/{$key->id}", ['status' => false])
             ->assertStatus(200)
             ->assertJsonFragment(['status' => false]);

        $this->assertDatabaseHas('api_keys', ['id' => $key->id, 'status' => false]);
    });

    it('returns 403 when updating another user\'s key', function () {
        [, , $headers] = authUser();
        $other = User::factory()->create();
        $key   = ApiKey::create(['user_id' => $other->id, 'provider' => 'groq', 'encrypted_key' => 'enc', 'status' => true]);

        $this->withHeaders($headers)->putJson("/api/api-key/{$key->id}", ['status' => false])
             ->assertStatus(403);
    });
});

// ─── DELETE /api/api-key/{id} ────────────────────────────────────────────────

describe('DELETE /api/api-key/{id}', function () {

    it('deletes own API key', function () {
        [$user, , $headers] = authUser();
        $key = ApiKey::create(['user_id' => $user->id, 'provider' => 'groq', 'encrypted_key' => 'enc', 'status' => true]);

        $this->withHeaders($headers)->deleteJson("/api/api-key/{$key->id}")
             ->assertStatus(200);

        $this->assertDatabaseMissing('api_keys', ['id' => $key->id]);
    });

    it('returns 403 when deleting another user\'s key', function () {
        [, , $headers] = authUser();
        $other = User::factory()->create();
        $key   = ApiKey::create(['user_id' => $other->id, 'provider' => 'groq', 'encrypted_key' => 'enc', 'status' => true]);

        $this->withHeaders($headers)->deleteJson("/api/api-key/{$key->id}")
             ->assertStatus(403);
    });
});
