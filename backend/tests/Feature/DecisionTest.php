<?php

use App\Models\Decision;
use App\Models\DecisionOutput;
use App\Models\User;
use App\Services\DecisionService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::flush();
});

function decisionAuthUser(): array
{
    \Illuminate\Support\Facades\Http::fake(); // Prevent external network calls
    $user  = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;
    return [$user, ['Authorization' => "Bearer $token"]];
}

// ─── GET /api/decisions ──────────────────────────────────────────────────────

describe('GET /api/decisions', function () {

    it('returns paginated decisions for the authenticated user', function () {
        [$user, $headers] = decisionAuthUser();

        Decision::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->withHeaders($headers)->getJson('/api/decisions');

        $response->assertStatus(200)
                 ->assertJsonStructure(['data', 'total', 'per_page']);

        expect(count($response->json('data')))->toBe(3);
    });

    it('does not return other users\' decisions', function () {
        [, $headers] = decisionAuthUser();
        $other = User::factory()->create();

        Decision::factory()->count(2)->create(['user_id' => $other->id]);

        $response = $this->withHeaders($headers)->getJson('/api/decisions');

        $response->assertStatus(200);
        expect(count($response->json('data')))->toBe(0);
    });

    it('returns 401 when unauthenticated', function () {
        $this->getJson('/api/decisions')->assertStatus(401);
    });
});

// ─── GET /api/decisions/{id} ─────────────────────────────────────────────────

describe('GET /api/decisions/{id}', function () {

    it('returns a decision with its output', function () {
        [$user, $headers] = decisionAuthUser();
        $decision = Decision::factory()->create(['user_id' => $user->id, 'status' => 'completed']);
        DecisionOutput::factory()->create(['decision_id' => $decision->id]);

        $response = $this->withHeaders($headers)->getJson("/api/decisions/{$decision->id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['id' => $decision->id])
                 ->assertJsonStructure(['output']);
    });

    it('returns 403 when accessing another user\'s decision', function () {
        [, $headers] = decisionAuthUser();
        $other    = User::factory()->create();
        $decision = Decision::factory()->create(['user_id' => $other->id]);

        $this->withHeaders($headers)->getJson("/api/decisions/{$decision->id}")
             ->assertStatus(403);
    });
});

// ─── POST /api/decision ──────────────────────────────────────────────────────

describe('POST /api/decision', function () {

    it('creates and processes a decision synchronously', function () {
        [$user, $headers] = decisionAuthUser();

        $this->mock(DecisionService::class, function ($mock) {
            // classifyDomain is NOT called if domain is provided in request
            $mock->shouldReceive('processDecision')->once()->andReturn([
                'recommendation'   => 'Invest in index funds.',
                'analysis'         => 'Low risk, long-term growth.',
                'alternatives'     => ['Bonds', 'Real Estate'],
                'risks'            => ['Market volatility'],
                'confidence_score' => 85,
            ]);
        });

        $response = $this->withHeaders($headers)->postJson('/api/decision', [
            'query'  => 'Should I invest in stocks?',
            'domain' => 'business',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'decision'])
                 ->assertJsonFragment(['cached' => false]);

        $this->assertDatabaseHas('decisions', ['user_id' => $user->id, 'domain' => 'business']);
    });

    it('queues the decision when async=true', function () {
        Illuminate\Support\Facades\Queue::fake();

        [$user, $headers] = decisionAuthUser();

        $this->spy(DecisionService::class, function ($spy) {
            $spy->shouldReceive('classifyDomain')->andReturn('career');
        });

        $response = $this->withHeaders($headers)->postJson('/api/decision', [
            'query' => 'Should I change my job?',
            'async' => true,
        ]);

        $response->assertStatus(202)
                 ->assertJsonStructure(['message', 'decision_id', 'status', 'stream_url'])
                 ->assertJsonFragment(['status' => 'pending']);
    });

    it('returns 422 when query is missing', function () {
        [, $headers] = decisionAuthUser();

        $this->withHeaders($headers)->postJson('/api/decision', [])
             ->assertStatus(422)
             ->assertJsonStructure(['messages' => ['query']]);
    });

    it('returns 401 when unauthenticated', function () {
        $this->postJson('/api/decision', ['query' => 'test'])->assertStatus(401);
    });
});

// ─── GET /api/decisions/{id}/status ──────────────────────────────────────────

describe('GET /api/decisions/{id}/status', function () {

    it('returns the decision status', function () {
        [$user, $headers] = decisionAuthUser();
        $decision = Decision::factory()->create(['user_id' => $user->id, 'status' => 'pending']);

        $response = $this->withHeaders($headers)->getJson("/api/decisions/{$decision->id}/status");

        $response->assertStatus(200)
                 ->assertJsonFragment(['status' => 'pending']);
    });

    it('returns 403 for another user\'s decision status', function () {
        [, $headers] = decisionAuthUser();
        $other    = User::factory()->create();
        $decision = Decision::factory()->create(['user_id' => $other->id]);

        $this->withHeaders($headers)->getJson("/api/decisions/{$decision->id}/status")
             ->assertStatus(403);
    });
});
