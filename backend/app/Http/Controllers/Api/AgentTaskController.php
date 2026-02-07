<?php

namespace App\Http\Controllers\Api;

use App\Events\AgentTaskDispatched;
use App\Http\Controllers\Controller;
use App\Models\AgentTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AgentTaskController extends Controller
{
    /**
     * List tasks for the authenticated user's company
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->companies()->first();

        if (!$company) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'No company found'],
            ], 403);
        }

        $tasks = AgentTask::forCompany($company->id)
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $tasks->items(),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
                'last_page' => $tasks->lastPage(),
            ],
        ]);
    }

    /**
     * Dispatch a task to the automation agent
     */
    public function dispatch(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string|in:post_to_groups,login_account,scrape_data,zalo_command,custom',
            'payload' => 'required|array',
        ]);

        $user = $request->user();
        $company = $user->companies()->first();

        $task = AgentTask::create([
            'company_id' => $company?->id,
            'type' => $request->input('type'),
            'payload' => $request->input('payload'),
            'status' => 'pending',
            'callback_url' => url('/api/agent/task-result'),
            'created_by' => $user->id,
        ]);

        // Broadcast to automation app via Soketi
        try {
            event(new AgentTaskDispatched($task));
            $task->markAsDispatched();

            Log::info('AgentTask dispatched', [
                'task_id' => $task->id,
                'type' => $task->type,
            ]);
        } catch (\Exception $e) {
            Log::error('AgentTask dispatch failed', [
                'task_id' => $task->id,
                'error' => $e->getMessage(),
            ]);

            $task->markAsFailed(['error' => 'Failed to dispatch: ' . $e->getMessage()]);

            return response()->json([
                'success' => false,
                'error' => ['message' => 'Failed to dispatch task to agent'],
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $task,
            'message' => 'Task dispatched to agent',
        ], 201);
    }

    /**
     * Receive task result from automation agent (callback endpoint)
     * This endpoint does NOT require auth — it's called by the agent
     */
    public function receiveResult(Request $request): JsonResponse
    {
        $request->validate([
            'task_id' => 'required|string',
            'agent_id' => 'required|string',
            'result' => 'required|array',
            'result.success' => 'required|boolean',
        ]);

        $task = AgentTask::find($request->input('task_id'));

        if (!$task) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Task not found'],
            ], 404);
        }

        $result = $request->input('result');

        if ($result['success']) {
            $task->markAsCompleted($result);
        } else {
            $task->markAsFailed($result);
        }

        // Update agent_id if not set
        if (!$task->agent_id) {
            $task->update(['agent_id' => $request->input('agent_id')]);
        }

        // Cache result for sync polling (ZaloService uses this)
        $cacheKey = "agent_task_result:{$task->id}";
        Cache::put($cacheKey, [
            'success' => $result['success'],
            'data' => $result['data'] ?? null,
            'error' => $result['error'] ?? null,
        ], 60); // TTL 60 seconds

        Log::info('AgentTask result received', [
            'task_id' => $task->id,
            'status' => $task->status,
            'agent_id' => $request->input('agent_id'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Result received',
        ]);
    }

    /**
     * Get a specific task
     */
    public function show(AgentTask $agentTask): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $agentTask,
        ]);
    }
}
