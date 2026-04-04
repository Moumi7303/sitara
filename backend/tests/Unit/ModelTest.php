<?php

use App\Models\ApiKey;
use App\Models\AuditLog;
use App\Models\Decision;
use App\Models\DecisionOutput;
use App\Models\Memory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ─── User Model ───────────────────────────────────────────────────────────────

describe('User Model', function () {

    it('can be created with hashed password', function () {
        $user = User::factory()->create(['password' => bcrypt('secret')]);

        expect($user)->toBeInstanceOf(User::class)
            ->and($user->email)->not->toBeEmpty()
            ->and($user->password)->not->toBe('secret'); // hashed
    });

    it('hides password and remember_token from serialization', function () {
        $user = User::factory()->create();
        $arr  = $user->toArray();

        expect($arr)->not->toHaveKey('password')
            ->not->toHaveKey('remember_token');
    });

    it('has apiKeys relationship', function () {
        $user = User::factory()->create();
        ApiKey::create(['user_id' => $user->id, 'provider' => 'groq', 'encrypted_key' => 'enc', 'status' => true]);

        expect($user->apiKeys()->count())->toBe(1);
    });

    it('has decisions relationship', function () {
        $user = User::factory()->create();
        Decision::factory()->create(['user_id' => $user->id]);

        expect($user->decisions()->count())->toBe(1);
    });

    it('has memories relationship', function () {
        $user = User::factory()->create();
        Memory::create(['user_id' => $user->id, 'type' => 'preference', 'content' => 'test']);

        expect($user->memories()->count())->toBe(1);
    });

    it('has auditLogs relationship', function () {
        $user = User::factory()->create();
        AuditLog::create(['user_id' => $user->id, 'action' => 'test_action', 'status' => 'success', 'metadata' => []]);

        expect($user->auditLogs()->count())->toBe(1);
    });
});

// ─── ApiKey Model ─────────────────────────────────────────────────────────────

describe('ApiKey Model', function () {

    it('casts status as boolean', function () {
        $user = User::factory()->create();
        $key  = ApiKey::create(['user_id' => $user->id, 'provider' => 'groq', 'encrypted_key' => 'enc', 'status' => 1]);

        expect($key->status)->toBeBool()->and($key->status)->toBeTrue();
    });

    it('hides encrypted_key from serialization', function () {
        $user = User::factory()->create();
        $key  = ApiKey::create(['user_id' => $user->id, 'provider' => 'groq', 'encrypted_key' => 'enc_secret', 'status' => true]);

        expect($key->toArray())->not->toHaveKey('encrypted_key');
    });

    it('belongs to a user', function () {
        $user = User::factory()->create();
        $key  = ApiKey::create(['user_id' => $user->id, 'provider' => 'groq', 'encrypted_key' => 'enc', 'status' => true]);

        expect($key->user->id)->toBe($user->id);
    });
});

// ─── Decision Model ───────────────────────────────────────────────────────────

describe('Decision Model', function () {

    it('casts confidence_score as integer', function () {
        $user     = User::factory()->create();
        $decision = Decision::factory()->create(['user_id' => $user->id, 'confidence_score' => '85']);

        expect($decision->confidence_score)->toBeInt()->and($decision->confidence_score)->toBe(85);
    });

    it('has an output relationship', function () {
        $user     = User::factory()->create();
        $decision = Decision::factory()->create(['user_id' => $user->id]);
        DecisionOutput::factory()->create(['decision_id' => $decision->id]);

        expect($decision->output)->toBeInstanceOf(DecisionOutput::class);
    });

    it('belongs to a user', function () {
        $user     = User::factory()->create();
        $decision = Decision::factory()->create(['user_id' => $user->id]);

        expect($decision->user->id)->toBe($user->id);
    });
});

// ─── DecisionOutput Model ─────────────────────────────────────────────────────

describe('DecisionOutput Model', function () {

    it('casts array fields properly', function () {
        $user     = User::factory()->create();
        $decision = Decision::factory()->create(['user_id' => $user->id]);

        $output = DecisionOutput::factory()->create([
            'decision_id'    => $decision->id,
            'recommendation' => 'Go for it.',
            'pros'           => ['Good return', 'Low risk'],
            'cons'           => ['Time required'],
            'risks'          => ['Market may drop'],
            'alternatives'   => ['Bonds'],
            'key_factors'    => ['Income', 'Age'],
        ]);

        expect($output->pros)->toBeArray()
            ->and($output->cons)->toBeArray()
            ->and($output->risks)->toBeArray()
            ->and($output->alternatives)->toBeArray()
            ->and($output->key_factors)->toBeArray();
    });

    it('belongs to a decision', function () {
        $user     = User::factory()->create();
        $decision = Decision::factory()->create(['user_id' => $user->id]);
        $output   = DecisionOutput::factory()->create(['decision_id' => $decision->id]);

        expect($output->decision->id)->toBe($decision->id);
    });
});

// ─── Memory Model ─────────────────────────────────────────────────────────────

describe('Memory Model', function () {

    it('uses the correct table name: memory', function () {
        $memory = new Memory();
        expect($memory->getTable())->toBe('memory');
    });

    it('can be created with type and content', function () {
        $user   = User::factory()->create();
        $memory = Memory::create(['user_id' => $user->id, 'type' => 'context', 'content' => 'Test context.']);

        $this->assertDatabaseHas('memory', ['user_id' => $user->id, 'type' => 'context']);
    });

    it('belongs to a user', function () {
        $user   = User::factory()->create();
        $memory = Memory::create(['user_id' => $user->id, 'type' => 'preference', 'content' => 'Test.']);

        expect($memory->user->id)->toBe($user->id);
    });
});

// ─── AuditLog Model ───────────────────────────────────────────────────────────

describe('AuditLog Model', function () {

    it('stores and retrieves metadata as array', function () {
        $user = User::factory()->create();
        AuditLog::create([
            'user_id'  => $user->id,
            'action'   => 'test_action',
            'status'   => 'success',
            'metadata' => ['key' => 'value'],
        ]);

        $log = AuditLog::where('action', 'test_action')->first();
        expect($log->metadata)->toBeArray()->toHaveKey('key');
    });
});
