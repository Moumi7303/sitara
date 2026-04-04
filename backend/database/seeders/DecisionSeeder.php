<?php

namespace Database\Seeders;

use App\Models\Decision;
use App\Models\User;
use Illuminate\Database\Seeder;

class DecisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'test@sitara.local')->first();

        if ($user) {
            Decision::create([
                'user_id' => $user->id,
                'domain' => 'Finance',
                'query' => 'Should I invest in quantum computing startups now?',
                'status' => 'completed',
                'confidence_score' => 85,
            ]);

            Decision::create([
                'user_id' => $user->id,
                'domain' => 'Career',
                'query' => 'Is transitioning from frontend to full-stack worth it in 2026?',
                'status' => 'completed',
                'confidence_score' => 92,
            ]);
        }
    }
}
