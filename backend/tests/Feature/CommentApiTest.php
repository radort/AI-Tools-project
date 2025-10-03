<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Tool;
use App\Models\ToolComment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class CommentApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_can_get_tool_comments(): void
    {
        $tool = Tool::factory()->create();
        $user = User::factory()->create();

        $comments = ToolComment::factory()->count(3)->create([
            'tool_id' => $tool->id,
        ]);

        $response = $this->getJson("/api/tools/{$tool->id}/comments");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'tool_id',
                            'content',
                            'author' => ['id', 'name', 'email'],
                            'created_at',
                            'updated_at',
                            'can_edit',
                            'can_delete',
                        ]
                    ],
                    'meta' => [
                        'current_page',
                        'last_page',
                        'per_page',
                        'total',
                    ]
                ]);

        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_can_create_comment_when_authenticated(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        Sanctum::actingAs($user);

        $commentData = [
            'content' => 'This is a test comment for the tool.',
        ];

        $response = $this->postJson("/api/tools/{$tool->id}/comments", $commentData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'data' => [
                        'id',
                        'tool_id',
                        'content',
                        'author' => ['id', 'name', 'email'],
                        'created_at',
                        'updated_at',
                    ]
                ]);

        $this->assertDatabaseHas('tool_comments', [
            'tool_id' => $tool->id,
            'author_id' => $user->id,
            'content' => 'This is a test comment for the tool.',
        ]);
    }

    public function test_cannot_create_comment_when_unauthenticated(): void
    {
        $tool = Tool::factory()->create();

        $commentData = [
            'content' => 'This comment should not be created.',
        ];

        $response = $this->postJson("/api/tools/{$tool->id}/comments", $commentData);

        $response->assertStatus(401);
    }

    public function test_comment_content_is_required(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/tools/{$tool->id}/comments", []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors('content');
    }

    public function test_comment_content_cannot_exceed_limit(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();

        Sanctum::actingAs($user);

        $commentData = [
            'content' => str_repeat('a', 1001), // Exceeds 1000 character limit
        ];

        $response = $this->postJson("/api/tools/{$tool->id}/comments", $commentData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors('content');
    }

    public function test_can_update_own_comment(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();
        $comment = ToolComment::factory()->create([
            'tool_id' => $tool->id,
            'author_id' => $user->id,
        ]);

        Sanctum::actingAs($user);

        $updateData = [
            'content' => 'Updated comment content.',
        ];

        $response = $this->putJson("/api/tools/{$tool->id}/comments/{$comment->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'data' => [
                        'id',
                        'content',
                    ]
                ]);

        $this->assertDatabaseHas('tool_comments', [
            'id' => $comment->id,
            'content' => 'Updated comment content.',
        ]);
    }

    public function test_cannot_update_others_comment(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $tool = Tool::factory()->create();
        $comment = ToolComment::factory()->create([
            'tool_id' => $tool->id,
            'author_id' => $author->id,
        ]);

        Sanctum::actingAs($otherUser);

        $updateData = [
            'content' => 'Trying to update someone else\'s comment.',
        ];

        $response = $this->putJson("/api/tools/{$tool->id}/comments/{$comment->id}", $updateData);

        $response->assertStatus(403);
    }

    public function test_can_delete_own_comment(): void
    {
        $user = User::factory()->create();
        $tool = Tool::factory()->create();
        $comment = ToolComment::factory()->create([
            'tool_id' => $tool->id,
            'author_id' => $user->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/tools/{$tool->id}/comments/{$comment->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Comment deleted successfully'
                ]);

        $this->assertDatabaseMissing('tool_comments', [
            'id' => $comment->id,
        ]);
    }

    public function test_can_get_specific_comment(): void
    {
        $tool = Tool::factory()->create();
        $comment = ToolComment::factory()->create([
            'tool_id' => $tool->id,
        ]);

        $response = $this->getJson("/api/tools/{$tool->id}/comments/{$comment->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'tool_id',
                        'content',
                        'author' => ['id', 'name', 'email'],
                        'created_at',
                        'updated_at',
                    ]
                ])
                ->assertJson([
                    'data' => [
                        'id' => $comment->id,
                        'tool_id' => $tool->id,
                    ]
                ]);
    }

    public function test_cannot_get_comment_for_wrong_tool(): void
    {
        $tool1 = Tool::factory()->create();
        $tool2 = Tool::factory()->create();
        $comment = ToolComment::factory()->create([
            'tool_id' => $tool1->id,
        ]);

        $response = $this->getJson("/api/tools/{$tool2->id}/comments/{$comment->id}");

        $response->assertStatus(404);
    }

    public function test_comments_are_paginated(): void
    {
        $tool = Tool::factory()->create();
        ToolComment::factory()->count(20)->create([
            'tool_id' => $tool->id,
        ]);

        $response = $this->getJson("/api/tools/{$tool->id}/comments?per_page=10");

        $response->assertStatus(200)
                ->assertJson([
                    'meta' => [
                        'per_page' => 10,
                        'total' => 20,
                        'last_page' => 2,
                    ]
                ]);

        $this->assertCount(10, $response->json('data'));
    }
}