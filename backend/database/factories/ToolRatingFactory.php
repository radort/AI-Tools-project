<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ToolRating>
 */
class ToolRatingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tool_id' => \App\Models\Tool::factory(),
            'rater_id' => \App\Models\User::factory(),
            'value' => $this->faker->numberBetween(1, 5),
        ];
    }
}
