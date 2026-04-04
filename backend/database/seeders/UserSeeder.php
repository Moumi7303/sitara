<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Sitara Test User',
            'email' => 'test@sitara.local',
            'password' => Hash::make('password123'),
        ]);

        User::create([
            'name' => 'Sitara Admin',
            'email' => 'admin@sitara.local',
            'password' => Hash::make('admin123'),
        ]);
    }
}
