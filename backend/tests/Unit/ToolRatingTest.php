<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\ToolRating;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ToolRatingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_can_create_tool_rating(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $rating = ToolRating::create([
            'tool_id' => $tool->id,
            'rater_id' => $user->id,
            'value' => 5,
        ]);

        $this->assertDatabaseHas('tool_ratings', [
            'id' => $rating->id,
            'tool_id' => $tool->id,
            'rater_id' => $user->id,
            'value' => 5,
        ]);
    }

    public function test_rating_belongs_to_tool(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $rating = ToolRating::create([
            'tool_id' => $tool->id,
            'rater_id' => $user->id,
            'value' => 4,
        ]);

        $this->assertInstanceOf(Tool::class, $rating->tool);
        $this->assertEquals($tool->id, $rating->tool->id);
    }

    public function test_rating_belongs_to_rater(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $rating = ToolRating::create([
            'tool_id' => $tool->id,
            'rater_id' => $user->id,
            'value' => 3,
        ]);

        $this->assertInstanceOf(User::class, $rating->rater);
        $this->assertEquals($user->id, $rating->rater->id);
    }

    public function test_unique_constraint_tool_rater(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        ToolRating::create([
            'tool_id' => $tool->id,
            'rater_id' => $user->id,
            'value' => 4,
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        ToolRating::create([
            'tool_id' => $tool->id,
            'rater_id' => $user->id,
            'value' => 5,
        ]);
    }

    public function test_rating_value_cast_to_integer(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $rating = ToolRating::create([
            'tool_id' => $tool->id,
            'rater_id' => $user->id,
            'value' => '5',
        ]);

        $this->assertIsInt($rating->value);
        $this->assertEquals(5, $rating->value);
    }

    public function test_fillable_attributes(): void
    {
        $rating = new ToolRating();
        $fillable = $rating->getFillable();

        $this->assertContains('tool_id', $fillable);
        $this->assertContains('rater_id', $fillable);
        $this->assertContains('value', $fillable);
    }

    public function test_activity_logging(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $rating = ToolRating::create([
            'tool_id' => $tool->id,
            'rater_id' => $user->id,
            'value' => 5,
        ]);

        $this->assertDatabaseHas('activity_log', [
            'subject_type' => ToolRating::class,
            'subject_id' => $rating->id,
        ]);
    }

    public function test_valid_rating_values(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        // Test valid values 1-5
        for ($value = 1; $value <= 5; $value++) {
            $rating = ToolRating::create([
                'tool_id' => $tool->id,
                'rater_id' => User::factory()->create()->id,
                'value' => $value,
            ]);

            $this->assertEquals($value, $rating->value);
        }
    }
}