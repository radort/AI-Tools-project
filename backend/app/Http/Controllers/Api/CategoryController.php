<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Cache::remember('categories_with_counts', 3600, function () {
            return Category::withCount([
                'tools' => function ($query) {
                    $query->where('status', 'approved');
                }
            ])->get();
        });

        return response()->json([
            'data' => CategoryResource::collection($categories)
        ]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $this->authorize('create', Category::class);

        $category = Category::create($request->validated());

        Cache::forget('categories_with_counts');

        return response()->json([
            'message' => 'Category created successfully',
            'data' => new CategoryResource($category)
        ], 201);
    }

    public function show(Category $category): JsonResponse
    {
        $category->loadCount('tools');

        return response()->json([
            'data' => new CategoryResource($category)
        ]);
    }

    public function toolCounts(): JsonResponse
    {
        $counts = Cache::remember('tool_counts_by_category', 3600, function () {
            return Category::withCount([
                'tools' => function ($query) {
                    $query->where('status', 'approved');
                }
            ])->get()->mapWithKeys(function ($category) {
                return [$category->name => $category->tools_count];
            });
        });

        return response()->json($counts);
    }
}