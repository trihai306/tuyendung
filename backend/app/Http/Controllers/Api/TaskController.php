<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService
    ) {
    }

    /**
     * List tasks for the company
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->company_id) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'User has no company'],
            ], 403);
        }

        $status = $request->query('status');
        $assignedTo = $request->query('assigned_to');

        // Filter by current user if they are a member (not owner/admin)
        if ($request->boolean('my_tasks')) {
            $assignedTo = $user->id;
        }

        $tasks = $this->taskService->getTasks($user->company_id, $status, $assignedTo);

        return response()->json([
            'success' => true,
            'data' => $tasks,
        ]);
    }

    /**
     * Get a single task
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $task = Task::find($id);

        if (!$task || $task->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Task not found'],
            ], 404);
        }

        $data = $this->taskService->getTask($id);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Create a new task
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->company_id) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'User has no company'],
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'required|exists:users,id',
            'priority' => 'nullable|in:high,medium,low',
            'due_date' => 'required|date',
        ]);

        $task = $this->taskService->createTask($validated, $user);

        return response()->json([
            'success' => true,
            'data' => $task,
            'message' => 'Task created successfully',
        ], 201);
    }

    /**
     * Update a task
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $task = Task::find($id);

        if (!$task || $task->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Task not found'],
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'nullable|in:high,medium,low',
            'status' => 'nullable|in:pending,in_progress,completed,overdue',
            'due_date' => 'nullable|date',
        ]);

        $data = $this->taskService->updateTask($task, $validated, $user);

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Task updated successfully',
        ]);
    }

    /**
     * Update task progress
     */
    public function updateProgress(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $task = Task::find($id);

        if (!$task || $task->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Task not found'],
            ], 404);
        }

        $validated = $request->validate([
            'progress' => 'required|integer|min:0|max:100',
        ]);

        $data = $this->taskService->updateProgress($task, $validated['progress'], $user);

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Progress updated successfully',
        ]);
    }

    /**
     * Add a comment to a task
     */
    public function addComment(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $task = Task::find($id);

        if (!$task || $task->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Task not found'],
            ], 404);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $data = $this->taskService->addComment($task, $validated['content'], $user);

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Comment added successfully',
        ]);
    }

    /**
     * Delete a task
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $task = Task::find($id);

        if (!$task || $task->company_id !== $user->company_id) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Task not found'],
            ], 404);
        }

        $this->taskService->deleteTask($task);

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully',
        ]);
    }

    /**
     * Get task statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->company_id) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'User has no company'],
            ], 403);
        }

        $userId = $request->boolean('my_stats') ? $user->id : null;
        $stats = $this->taskService->getStats($user->company_id, $userId);

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get employees for assignment
     */
    public function employees(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->company_id) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'User has no company'],
            ], 403);
        }

        $employees = $this->taskService->getAssignableEmployees($user->company_id);

        return response()->json([
            'success' => true,
            'data' => $employees,
        ]);
    }
}
