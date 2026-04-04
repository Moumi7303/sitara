<?php

namespace Database\Seeders;

use App\Models\Memory;
use App\Models\User;
use Illuminate\Database\Seeder;

class MemorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'test@sitara.local')->first();

        if ($user) {
            Memory::create([
                'user_id' => $user->id,
                'type' => 'preference',
                'content' => 'User prefers concise recommendations without fluff.',
            ]);

            Memory::create([
                'user_id' => $user->id,
                'type' => 'context',
                'content' => 'User is currently working as a mid-level frontend developer.',
            ]);
        }
    }
}
