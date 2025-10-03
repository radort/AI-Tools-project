<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\ToolComment;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ToolCommentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_can_create_tool_comment(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $comment = ToolComment::create([
            'tool_id' => $tool->id,
            'author_id' => $user->id,
            'content' => 'This is a test comment',
        ]);

        $this->assertDatabaseHas('tool_comments', [
            'id' => $comment->id,
            'tool_id' => $tool->id,
            'author_id' => $user->id,
            'content' => 'This is a test comment',
        ]);
    }

    public function test_comment_belongs_to_tool(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $comment = ToolComment::create([
            'tool_id' => $tool->id,
            'author_id' => $user->id,
            'content' => 'Test comment',
        ]);

        $this->assertInstanceOf(Tool::class, $comment->tool);
        $this->assertEquals($tool->id, $comment->tool->id);
    }

    public function test_comment_belongs_to_author(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $comment = ToolComment::create([
            'tool_id' => $tool->id,
            'author_id' => $user->id,
            'content' => 'Test comment',
        ]);

        $this->assertInstanceOf(User::class, $comment->author);
        $this->assertEquals($user->id, $comment->author->id);
    }

    public function test_required_fields(): void
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        ToolComment::create([
            'content' => 'Missing required fields',
        ]);
    }

    public function test_fillable_attributes(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $comment = new ToolComment();
        $fillable = $comment->getFillable();

        $this->assertContains('tool_id', $fillable);
        $this->assertContains('author_id', $fillable);
        $this->assertContains('content', $fillable);
    }

    public function test_activity_logging(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        $comment = ToolComment::create([
            'tool_id' => $tool->id,
            'author_id' => $user->id,
            'content' => 'Test comment for activity logging',
        ]);

        $this->assertDatabaseHas('activity_log', [
            'subject_type' => ToolComment::class,
            'subject_id' => $comment->id,
        ]);
    }
}