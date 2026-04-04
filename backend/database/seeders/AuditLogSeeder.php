<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class AuditLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'test@sitara.local')->first();

        if ($user) {
            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'user_login',
                'status' => 'success',
                'metadata' => ['ip' => '127.0.0.1'],
            ]);

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'api_key_added',
                'status' => 'success',
                'metadata' => ['provider' => 'groq', 'system_seeded' => true],
            ]);
            
            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'decision_creation',
                'status' => 'success',
                'metadata' => ['domain' => 'Finance', 'system_seeded' => true],
            ]);
        }
    }
}
