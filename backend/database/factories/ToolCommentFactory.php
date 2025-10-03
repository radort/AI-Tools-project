<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ToolComment>
 */
class ToolCommentFactory extends Factory
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
            'author_id' => \App\Models\User::factory(),
            'content' => $this->faker->paragraphs(2, true),
        ];
    }
}
