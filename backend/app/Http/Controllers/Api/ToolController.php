<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ToolResource;
use App\Models\Tool;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ToolController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Tool::with(['categories', 'roles', 'creator']);

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Category filter
        if ($request->has('category') && !empty($request->category)) {
            $query->whereHas('categories', function($q) use ($request) {
                $q->where('categories.id', $request->category);
            });
        }

        // Difficulty filter
        if ($request->has('difficulty') && !empty($request->difficulty)) {
            $query->where('difficulty', $request->difficulty);
        }

        // Role filter
        if ($request->has('role') && !empty($request->role)) {
            $query->whereHas('roles', function($q) use ($request) {
                $q->where('roles.id', $request->role);
            });
        }

        // Show approved tools for everyone, and non-approved tools only to their creators
        $user = $request->user();
        $query->where(function($q) use ($user) {
            $q->where('status', 'approved')
              ->orWhere('created_by', $user->id);
        });

        // Order by creation date (newest first)
        $query->orderBy('created_at', 'desc');

        $tools = $query->paginate(15);

        return response()->json([
            'data' => ToolResource::collection($tools),
            'meta' => [
                'current_page' => $tools->currentPage(),
                'last_page' => $tools->lastPage(),
                'per_page' => $tools->perPage(),
                'total' => $tools->total(),
            ]
        ]);
    }

    public function show(Tool $tool): JsonResponse
    {
        $tool->load(['categories', 'roles', 'creator']);

        return response()->json([
            'data' => new ToolResource($tool)
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'url' => 'required|url',
            'docs_url' => 'nullable|url',
            'video_url' => 'nullable|url',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'categories' => 'required|array',
            'categories.*' => 'exists:categories,id',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id',
        ]);

        $tool = Tool::create([
            'name' => $request->name,
            'description' => $request->description,
            'url' => $request->url,
            'docs_url' => $request->docs_url,
            'video_url' => $request->video_url,
            'difficulty' => $request->difficulty,
            'created_by' => $request->user()->id,
        ]);

        $tool->categories()->sync($request->categories);
        $tool->roles()->sync($request->roles);

        Cache::forget('categories_with_counts');
        Cache::forget('tool_counts_by_category');

        $tool->load(['categories', 'roles', 'creator']);

        return response()->json([
            'message' => 'Tool created successfully',
            'data' => new ToolResource($tool)
        ], 201);
    }

    public function update(Request $request, Tool $tool): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'url' => 'required|url',
            'docs_url' => 'nullable|url',
            'video_url' => 'nullable|url',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'categories' => 'array',
            'categories.*' => 'exists:categories,id',
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        $tool->update($request->only([
            'name', 'description', 'url', 'docs_url', 'video_url', 'difficulty'
        ]));

        if ($request->has('categories')) {
            $tool->categories()->sync($request->categories);
        }

        if ($request->has('roles')) {
            $tool->roles()->sync($request->roles);
        }

        Cache::forget('categories_with_counts');
        Cache::forget('tool_counts_by_category');

        $tool->load(['categories', 'roles', 'creator']);

        return response()->json([
            'message' => 'Tool updated successfully',
            'data' => new ToolResource($tool)
        ]);
    }

    public function destroy(Tool $tool): JsonResponse
    {
        $tool->delete();

        Cache::forget('categories_with_counts');
        Cache::forget('tool_counts_by_category');

        return response()->json([
            'message' => 'Tool deleted successfully'
        ]);
    }
}