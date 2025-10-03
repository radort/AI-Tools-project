<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tool>
 */
class ToolFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'url' => $this->faker->url(),
            'docs_url' => $this->faker->optional()->url(),
            'video_url' => $this->faker->optional()->url(),
            'difficulty' => $this->faker->randomElement(['beginner', 'intermediate', 'advanced']),
            'created_by' => \App\Models\User::factory(),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
        ];
    }
}
