<?php

namespace Database\Factories;

use App\Models\Decision;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DecisionFactory extends Factory
{
    protected $model = Decision::class;

    public function definition(): array
    {
        return [
            'user_id'          => User::factory(),
            'domain'           => $this->faker->randomElement(['career', 'tech', 'business', 'personal']),
            'query'            => $this->faker->sentence(10),
            'status'           => $this->faker->randomElement(['pending', 'processing', 'completed', 'failed']),
            'confidence_score' => $this->faker->optional()->numberBetween(50, 99),
        ];
    }

    public function completed(): static
    {
        return $this->state(['status' => 'completed', 'confidence_score' => $this->faker->numberBetween(60, 99)]);
    }

    public function pending(): static
    {
        return $this->state(['status' => 'pending', 'confidence_score' => null]);
    }
}
