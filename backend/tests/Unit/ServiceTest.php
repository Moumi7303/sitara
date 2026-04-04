<?php

use App\Services\EncryptionService;
use App\Services\DecisionService;
use App\Services\PromptBuilderService;
use App\Services\ResponseParserService;
use App\Services\GroqService;
use App\Models\Decision;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ─── EncryptionService ────────────────────────────────────────────────────────

describe('EncryptionService', function () {

    it('encrypts and decrypts a key correctly', function () {
        $service = new EncryptionService();
        $plain   = 'gsk_my_super_secret_api_key';

        $encrypted = $service->encryptKey($plain);
        $decrypted = $service->decryptKey($encrypted);

        expect($encrypted)->not->toBe($plain)
            ->and($decrypted)->toBe($plain);
    });

    it('produces different ciphertext for the same input each time', function () {
        $service = new EncryptionService();
        $plain   = 'same_key';

        $enc1 = $service->encryptKey($plain);
        $enc2 = $service->encryptKey($plain);

        // Laravel's encrypt() uses random IV, so output should differ
        expect($enc1)->not->toBe($enc2);
    });
});

// ─── PromptBuilderService ──────────────────────────────────────────────────────

describe('PromptBuilderService', function () {

    it('classifies business domain', function () {
        $service = new PromptBuilderService();
        expect($service->classifyDomain('Should I invest in a business?'))->toBe('business');
    });

    it('classifies career domain', function () {
        $service = new PromptBuilderService();
        expect($service->classifyDomain('Should I change my job?'))->toBe('career');
    });

    it('returns personal for unknown domain', function () {
        $service = new PromptBuilderService();
        expect($service->classifyDomain('What is the meaning of life?'))->toBe('personal');
    });

    it('builds a prompt with messages array', function () {
        $service  = new PromptBuilderService();
        $messages = $service->buildPrompt('business', 'Invest in crypto?', []);

        expect($messages)->toBeArray()
            ->and(count($messages))->toBeGreaterThan(0);

        // Each message should have role and content
        foreach ($messages as $msg) {
            expect($msg)->toHaveKey('role')->toHaveKey('content');
        }
    });

    it('includes memory context in the prompt', function () {
        $service = new PromptBuilderService();
        $memories = ['User prefers low-risk options', 'User is 30 years old'];

        $messages = $service->buildPrompt('business', 'Should I buy bonds?', $memories);
        $combined = implode(' ', array_column($messages, 'content'));

        expect($combined)->toContain('low-risk');
    });
});

// ─── ResponseParserService ────────────────────────────────────────────────────

describe('ResponseParserService', function () {

    it('parses a valid JSON response', function () {
        $service  = new ResponseParserService();
        $rawJson  = json_encode([
            'recommendation'   => 'Buy index funds.',
            'analysis'         => 'Stable long-term growth.',
            'key_factors'      => ['Age', 'Income'],
            'pros'             => ['Low fees'],
            'cons'             => ['Slow growth'],
            'risks'            => ['Market crash'],
            'alternatives'     => ['Bonds'],
            'confidence_score' => 80,
        ]);

        $result = $service->parseResponse($rawJson);

        expect($result)->toBeArray()
            ->toHaveKey('recommendation')
            ->toHaveKey('confidence_score');
    });

    it('returns null for malformed/empty response', function () {
        $service = new ResponseParserService();
        $result  = $service->parseResponse('This is not JSON at all');

        expect($result)->toBeNull();
    });

    it('returns null for empty string', function () {
        $service = new ResponseParserService();
        expect($service->parseResponse(''))->toBeNull();
    });
});

// ─── DecisionService (mocked) ─────────────────────────────────────────────────

describe('DecisionService', function () {

    it('classifyDomain proxies PromptBuilderService', function () {
        $groq    = Mockery::mock(GroqService::class);
        $parser  = Mockery::mock(ResponseParserService::class);
        $builder = Mockery::mock(PromptBuilderService::class);

        $builder->shouldReceive('classifyDomain')->with('invest in stocks')->once()->andReturn('business');

        $service = new DecisionService($groq, $builder, $parser);
        expect($service->classifyDomain('invest in stocks'))->toBe('business');
    });

    it('returns null when no API key is available for user', function () {
        $user = User::factory()->create();
        $decision = Decision::factory()->create(['user_id' => $user->id, 'status' => 'pending']);

        $groq = Mockery::mock(GroqService::class);
        $groq->shouldReceive('resolveApiKey')->andReturn(null);

        $builder = Mockery::mock(PromptBuilderService::class);
        $parser  = Mockery::mock(ResponseParserService::class);

        $service = new DecisionService($groq, $builder, $parser);
        $result  = $service->processDecision($decision);

        expect($result)->toBeNull();
        $decision->refresh();
        expect($decision->status)->toBe('failed');
    });
});
