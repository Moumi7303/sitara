<?php

namespace Database\Seeders;

use App\Models\ApiKey;
use App\Models\User;
use App\Services\EncryptionService;
use Illuminate\Database\Seeder;

class ApiKeySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(EncryptionService $encryption): void
    {
        // Add an API key for the first user
        $user = User::where('email', 'test@sitara.local')->first();

        if ($user) {
            ApiKey::create([
                'user_id' => $user->id,
                'provider' => 'groq',
                'encrypted_key' => $encryption->encryptKey('gsk_sampleTestKey12345'),
                'status' => true,
                'last_used_at' => now(),
            ]);
        }
    }
}
