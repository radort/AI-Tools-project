<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Spatie\Activitylog\Models\Activity;

class AdminController extends Controller
{
    public function __construct()
    {
        // Middleware is applied in routes/admin.php
    }

    public function tools(Request $request): JsonResponse
    {
        $admin = $request->user();

        $query = Tool::with(['creator', 'categories', 'approver']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }

        if ($request->has('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('roles.name', $request->role);
            });
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $tools = $query->orderBy('created_at', 'desc')
                      ->paginate($request->get('per_page', 15));

        return response()->json($tools);
    }

    public function approve(Request $request, $toolId): JsonResponse
    {
        $admin = $request->user();

        \Log::info('Approve tool request received', [
            'tool_id_param' => $toolId,
            'admin_id' => $admin->id,
            'admin_email' => $admin->email
        ]);

        // Manually find the tool since route model binding isn't working
        $tool = Tool::find($toolId);

        if (!$tool) {
            \Log::error('Tool not found', ['tool_id' => $toolId]);
            return response()->json(['error' => 'Tool not found'], 404);
        }

        \Log::info('Tool found successfully', [
            'tool_id' => $tool->id,
            'tool_status' => $tool->status
        ]);

        if ($tool->status === 'approved') {
            return response()->json(['error' => 'Tool is already approved'], 400);
        }

        try {
            $result = $tool->update([
                'status' => 'approved',
                'approved_by' => $admin->id,
                'approved_at' => now(),
                'rejection_reason' => null,
            ]);

            \Log::info('Tool update result', [
                'update_result' => $result,
                'tool_id' => $tool->id,
                'new_status' => $tool->fresh()->status
            ]);

            return response()->json([
                'message' => 'Tool approved successfully',
                'tool' => $tool->load(['creator', 'categories', 'approver'])
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to approve tool', [
                'tool_id' => $tool->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Failed to approve tool'], 500);
        }
    }

    public function reject(Request $request, $toolId): JsonResponse
    {
        $admin = $request->user();

        // Manually find the tool since route model binding isn't working
        $tool = Tool::find($toolId);

        if (!$tool) {
            return response()->json(['error' => 'Tool not found'], 404);
        }

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if ($tool->status === 'rejected') {
            return response()->json(['error' => 'Tool is already rejected'], 400);
        }

        $tool->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
            'approved_by' => null,
            'approved_at' => null,
        ]);

        return response()->json([
            'message' => 'Tool rejected successfully',
            'tool' => $tool->load(['creator', 'categories', 'approver'])
        ]);
    }

    public function getStats(): JsonResponse
    {
        $stats = [
            'total_tools' => Tool::count(),
            'pending_tools' => Tool::where('status', 'pending')->count(),
            'approved_tools' => Tool::where('status', 'approved')->count(),
            'rejected_tools' => Tool::where('status', 'rejected')->count(),
            'total_users' => User::count(),
            'recent_activity' => Activity::with(['causer'])
                ->latest()
                ->limit(10)
                ->get()
                ->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'log_name' => $activity->log_name,
                        'description' => $activity->description,
                        'subject_type' => $activity->subject_type,
                        'subject_id' => $activity->subject_id,
                        'causer' => $activity->causer ? [
                            'name' => $activity->causer->name,
                            'email' => $activity->causer->email,
                        ] : null,
                        'properties' => $activity->properties,
                        'created_at' => $activity->created_at->toISOString(),
                    ];
                }),
        ];

        return response()->json($stats);
    }

    public function activities(): JsonResponse
    {
        $activities = Activity::with(['causer'])
            ->latest()
            ->paginate(15);

        return response()->json($activities);
    }
}