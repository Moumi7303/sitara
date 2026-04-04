<?php

namespace Database\Factories;

use App\Models\DecisionOutput;
use App\Models\Decision;
use Illuminate\Database\Eloquent\Factories\Factory;

class DecisionOutputFactory extends Factory
{
    protected $model = DecisionOutput::class;

    public function definition(): array
    {
        return [
            'decision_id'    => Decision::factory(),
            'recommendation' => $this->faker->sentence(15),
            'key_factors'    => $this->faker->words(3),
            'pros'           => $this->faker->words(3),
            'cons'           => $this->faker->words(2),
            'risks'          => $this->faker->words(2),
            'alternatives'   => $this->faker->words(2),
        ];
    }
}
