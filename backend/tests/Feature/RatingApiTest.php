<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Tool;
use App\Models\ToolRating;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class RatingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_can_get_tool_ratings_summary(): void
    {
        $tool = Tool::factory()->create();
        $users = User::factory()->count(5)->create();

        // Create ratings with different values
        ToolRating::factory()->create([
            'tool_id' => $tool->id,
            'rater_id' => $users[0]->id,
            'value' => 5,
        ]);
        ToolRating::factory()->create([
            'tool_id' => $tool->id,
            'rater_id' => $users[1]->id,
            'value' => 4,
        ]);
        ToolRating::factory()->create([
            'tool_id' => $tool->id,
            'rater_id' => $users[2]->id,
            'value' => 5,
        ]);

        $response = $this->getJson("/api/tools/{$tool->id}/ratings");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'total_ratings',
                        'average_rating',
                        'rating_distribution' => [
                            '1', '2', '3', '4', '5'
                        ],
                        'ratings' => [
                            '*' => [
                                'id',
                                'tool_id',
                                'value',
                                'rater' => ['id', 'name'],
                                'created_at',
                                'updated_at',
                                'can_edit',
                            ]
                        ]
                    ]
                ])
                ->assertJson([
                    'data' => [
                        'total_ratings' => 3,
                        'average_rating' => 4.67, // (5+4+5)/3 = 4.67
                        'rating_distribution' => [
                            '1' => 0,
                            '2' => 0,
                            '3' => 0,
                            '4' => 1,
                            '5' => 2,
                        ]
                    ]
                ]);
    }

    public function test_can_submit_rating_when_authenticated(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        Sanctum::actingAs($user);

        $ratingData = [
            'value' => 5,
        ];

        $response = $this->postJson("/api/tools/{$tool->id}/ratings", $ratingData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'data' => [
                        'id',
                        'tool_id',
                        'value',
                        'rater' => ['id', 'name'],
                        'created_at',
                        'updated_at',
                    ]
                ]);

        $this->assertDatabaseHas('tool_ratings', [
            'tool_id' => $tool->id,
            'rater_id' => $user->id,
            'value' => 5,
        ]);
    }

    public function test_can_update_existing_rating(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        // Create initial rating
        ToolRating::factory()->create([
            'tool_id' => $tool->id,
            'rater_id' => $user->id,
            'value' => 3,
        ]);

        Sanctum::actingAs($user);

        $updateData = [
            'value' => 5,
        ];

        $response = $this->postJson("/api/tools/{$tool->id}/ratings", $updateData);

        $response->assertStatus(200)
                ->assertJsonFragment([
                    'message' => 'Rating updated successfully'
                ]);

        $this->assertDatabaseHas('tool_ratings', [
            'tool_id' => $tool->id,
            'rater_id' => $user->id,
            'value' => 5,
        ]);

        // Ensure only one rating exists for this user-tool combination
        $this->assertDatabaseCount('tool_ratings', 1);
    }

    public function test_cannot_submit_rating_when_unauthenticated(): void
    {
        $tool = Tool::factory()->create();

        $ratingData = [
            'value' => 5,
        ];

        $response = $this->postJson("/api/tools/{$tool->id}/ratings", $ratingData);

        $response->assertStatus(401);
    }

    public function test_rating_value_is_required(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/tools/{$tool->id}/ratings", []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors('value');
    }

    public function test_rating_value_must_be_between_1_and_5(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        Sanctum::actingAs($user);

        // Test value too low
        $response = $this->postJson("/api/tools/{$tool->id}/ratings", ['value' => 0]);
        $response->assertStatus(422)
                ->assertJsonValidationErrors('value');

        // Test value too high
        $response = $this->postJson("/api/tools/{$tool->id}/ratings", ['value' => 6]);
        $response->assertStatus(422)
                ->assertJsonValidationErrors('value');

        // Test non-integer value
        $response = $this->postJson("/api/tools/{$tool->id}/ratings", ['value' => 'invalid']);
        $response->assertStatus(422)
                ->assertJsonValidationErrors('value');
    }

    public function test_can_get_user_rating_for_tool(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();
        $rating = ToolRating::factory()->create([
            'tool_id' => $tool->id,
            'rater_id' => $user->id,
            'value' => 4,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/tools/{$tool->id}/my-rating");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'tool_id',
                        'value',
                        'rater' => ['id', 'name'],
                        'created_at',
                        'updated_at',
                        'can_edit',
                    ]
                ])
                ->assertJson([
                    'data' => [
                        'id' => $rating->id,
                        'value' => 4,
                    ]
                ]);
    }

    public function test_returns_null_when_user_has_no_rating(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/tools/{$tool->id}/my-rating");

        $response->assertStatus(200)
                ->assertJson([
                    'data' => null
                ]);
    }

    public function test_can_delete_user_rating(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();
        $rating = ToolRating::factory()->create([
            'tool_id' => $tool->id,
            'rater_id' => $user->id,
            'value' => 4,
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/tools/{$tool->id}/my-rating");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Rating deleted successfully'
                ]);

        $this->assertDatabaseMissing('tool_ratings', [
            'id' => $rating->id,
        ]);
    }

    public function test_cannot_delete_nonexistent_rating(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/tools/{$tool->id}/my-rating");

        $response->assertStatus(404)
                ->assertJson([
                    'error' => 'Rating not found'
                ]);
    }

    public function test_rating_summary_with_no_ratings(): void
    {
        $tool = Tool::factory()->create();

        $response = $this->getJson("/api/tools/{$tool->id}/ratings");

        $response->assertStatus(200)
                ->assertJson([
                    'data' => [
                        'total_ratings' => 0,
                        'average_rating' => 0,
                        'rating_distribution' => [
                            '1' => 0,
                            '2' => 0,
                            '3' => 0,
                            '4' => 0,
                            '5' => 0,
                        ],
                        'ratings' => [],
                    ]
                ]);
    }

    public function test_cannot_access_user_rating_when_unauthenticated(): void
    {
        $tool = Tool::factory()->create();

        $response = $this->getJson("/api/tools/{$tool->id}/my-rating");

        $response->assertStatus(401);
    }
}