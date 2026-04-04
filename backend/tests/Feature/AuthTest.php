<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ─── Registration ────────────────────────────────────────────────────────────

describe('POST /api/auth/register', function () {

    it('registers a new user and returns a token', function () {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Test User',
            'email'                 => 'newuser@sitara.local',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'token', 'user' => ['id', 'name', 'email']]);

        $this->assertDatabaseHas('users', ['email' => 'newuser@sitara.local']);
    });

    it('fails registration with duplicate email', function () {
        User::factory()->create(['email' => 'dupe@sitara.local']);

        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Dupe User',
            'email'                 => 'dupe@sitara.local',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertStatus(422)
                 ->assertJsonStructure(['messages' => ['email']]);
    });

    it('fails registration with weak/invalid data', function () {
        $response = $this->postJson('/api/auth/register', [
            'name'     => '',
            'email'    => 'not-an-email',
            'password' => '123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonStructure(['messages' => ['name', 'email', 'password']]);
    });

    it('creates an audit log entry on successful registration', function () {
        $this->postJson('/api/auth/register', [
            'name'                  => 'Audit User',
            'email'                 => 'audit@sitara.local',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'user_registration',
            'status' => 'success',
        ]);
    });
});

// ─── Login ───────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', function () {

    it('logs in with valid credentials and returns a token', function () {
        $user = User::factory()->create(['password' => bcrypt('secret123')]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['token', 'user']);
    });

    it('rejects login with wrong password', function () {
        $user = User::factory()->create(['password' => bcrypt('correct')]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'wrong',
        ]);

        $response->assertStatus(422)
                 ->assertJsonStructure(['messages' => ['email']]);
    });

    it('rejects login with non-existent email', function () {
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'nobody@sitara.local',
            'password' => 'whatever',
        ]);

        $response->assertStatus(422);
    });

    it('creates an audit log on failed login', function () {
        User::factory()->create(['email' => 'fail@sitara.local', 'password' => bcrypt('right')]);

        $this->postJson('/api/auth/login', [
            'email'    => 'fail@sitara.local',
            'password' => 'wrong',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'user_login',
            'status' => 'failure',
        ]);
    });
});

// ─── Profile ─────────────────────────────────────────────────────────────────

describe('GET /api/user/profile', function () {

    it('returns the authenticated user profile', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => "Bearer $token"])
                         ->getJson('/api/user/profile');

        $response->assertStatus(200)
                 ->assertJsonFragment(['email' => $user->email]);
    });

    it('returns 401 for unauthenticated requests', function () {
        $this->getJson('/api/user/profile')->assertStatus(401);
    });
});
