<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RatingRequest;
use App\Http\Resources\RatingResource;
use App\Models\Tool;
use App\Models\ToolRating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RatingController extends Controller
{
    /**
     * Display rating summary for a tool.
     */
    public function index(Tool $tool): JsonResponse
    {
        $ratings = $tool->ratings()->with('rater')->get();

        $summary = [
            'total_ratings' => $ratings->count(),
            'average_rating' => $ratings->count() > 0 ? round($ratings->avg('value'), 2) : 0,
            'rating_distribution' => [
                1 => $ratings->where('value', 1)->count(),
                2 => $ratings->where('value', 2)->count(),
                3 => $ratings->where('value', 3)->count(),
                4 => $ratings->where('value', 4)->count(),
                5 => $ratings->where('value', 5)->count(),
            ],
            'ratings' => RatingResource::collection($ratings),
        ];

        return response()->json([
            'data' => $summary
        ]);
    }

    /**
     * Store or update a rating for a tool.
     */
    public function store(RatingRequest $request, Tool $tool): JsonResponse
    {
        $rating = $tool->ratings()->updateOrCreate(
            ['rater_id' => $request->user()->id],
            ['value' => $request->value]
        );

        $rating->load('rater');

        $wasRecentlyCreated = $rating->wasRecentlyCreated;

        return response()->json([
            'message' => $wasRecentlyCreated ? 'Rating created successfully' : 'Rating updated successfully',
            'data' => new RatingResource($rating)
        ], $wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Display the current user's rating for a tool.
     */
    public function show(Request $request, Tool $tool): JsonResponse
    {
        $rating = $tool->ratings()
            ->where('rater_id', $request->user()->id)
            ->with('rater')
            ->first();

        if (!$rating) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => new RatingResource($rating)
        ]);
    }

    /**
     * Remove the current user's rating for a tool.
     */
    public function destroy(Request $request, Tool $tool): JsonResponse
    {
        $rating = $tool->ratings()
            ->where('rater_id', $request->user()->id)
            ->first();

        if (!$rating) {
            return response()->json(['error' => 'Rating not found'], 404);
        }

        $rating->delete();

        return response()->json([
            'message' => 'Rating deleted successfully'
        ]);
    }
}
