<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Tool;
use App\Models\ToolComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Display a listing of comments for a tool.
     */
    public function index(Request $request, Tool $tool): JsonResponse
    {
        $comments = $tool->comments()
            ->with('author')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => CommentResource::collection($comments),
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
            ]
        ]);
    }

    /**
     * Store a newly created comment.
     */
    public function store(CommentRequest $request, Tool $tool): JsonResponse
    {
        $comment = $tool->comments()->create([
            'author_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        $comment->load('author');

        return response()->json([
            'message' => 'Comment created successfully',
            'data' => new CommentResource($comment)
        ], 201);
    }

    /**
     * Display the specified comment.
     */
    public function show(Tool $tool, ToolComment $comment): JsonResponse
    {
        if ($comment->tool_id !== $tool->id) {
            return response()->json(['error' => 'Comment not found for this tool'], 404);
        }

        $comment->load('author');

        return response()->json([
            'data' => new CommentResource($comment)
        ]);
    }

    /**
     * Update the specified comment.
     */
    public function update(CommentRequest $request, Tool $tool, ToolComment $comment): JsonResponse
    {
        if ($comment->tool_id !== $tool->id) {
            return response()->json(['error' => 'Comment not found for this tool'], 404);
        }

        if ($comment->author_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized to edit this comment'], 403);
        }

        $comment->update([
            'content' => $request->content,
        ]);

        $comment->load('author');

        return response()->json([
            'message' => 'Comment updated successfully',
            'data' => new CommentResource($comment)
        ]);
    }

    /**
     * Remove the specified comment.
     */
    public function destroy(Request $request, Tool $tool, ToolComment $comment): JsonResponse
    {
        if ($comment->tool_id !== $tool->id) {
            return response()->json(['error' => 'Comment not found for this tool'], 404);
        }

        $user = $request->user();
        if ($comment->author_id !== $user->id && !$user->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized to delete this comment'], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully'
        ]);
    }
}
