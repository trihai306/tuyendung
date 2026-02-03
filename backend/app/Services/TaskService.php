<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TaskService
{
    /**
     * Get tasks for a company with optional filtering
     */
    public function getTasks(int $companyId, ?string $status = null, ?int $assignedTo = null): array
    {
        $query = Task::with(['assignedByUser:id,name,email', 'assignedToUser:id,name,email'])
            ->forCompany($companyId)
            ->orderByDesc('created_at');

        if ($status) {
            $query->withStatus($status);
        }

        if ($assignedTo) {
            $query->assignedTo($assignedTo);
        }

        return $query->get()->map(fn($task) => $this->formatTask($task))->all();
    }

    /**
     * Get a single task with all relations
     */
    public function getTask(int $taskId): ?array
    {
        $task = Task::with([
            'assignedByUser:id,name,email',
            'assignedToUser:id,name,email',
            'comments.user:id,name,email',
            'activities.user:id,name,email',
        ])->find($taskId);

        if (!$task) {
            return null;
        }

        return $this->formatTask($task, true);
    }

    /**
     * Create a new task
     */
    public function createTask(array $data, User $user): array
    {
        return DB::transaction(function () use ($data, $user) {
            $task = Task::create([
                'company_id' => $user->company_id,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'assigned_by' => $user->id,
                'assigned_to' => $data['assigned_to'],
                'priority' => $data['priority'] ?? 'medium',
                'status' => 'pending',
                'progress' => 0,
                'due_date' => $data['due_date'],
            ]);

            // Log creation activity
            $this->logActivity($task, $user, 'created', 'Task created');

            return $this->getTask($task->id);
        });
    }

    /**
     * Update a task
     */
    public function updateTask(Task $task, array $data, User $user): array
    {
        return DB::transaction(function () use ($task, $data, $user) {
            $oldStatus = $task->status;

            $task->update([
                'title' => $data['title'] ?? $task->title,
                'description' => $data['description'] ?? $task->description,
                'assigned_to' => $data['assigned_to'] ?? $task->assigned_to,
                'priority' => $data['priority'] ?? $task->priority,
                'status' => $data['status'] ?? $task->status,
                'due_date' => $data['due_date'] ?? $task->due_date,
            ]);

            // Log status change if applicable
            if (isset($data['status']) && $data['status'] !== $oldStatus) {
                $this->logActivity(
                    $task,
                    $user,
                    'status_change',
                    "Status changed from {$oldStatus} to {$data['status']}"
                );
            }

            return $this->getTask($task->id);
        });
    }

    /**
     * Update task progress
     */
    public function updateProgress(Task $task, int $progress, User $user): array
    {
        return DB::transaction(function () use ($task, $progress, $user) {
            $oldProgress = $task->progress;

            $updates = ['progress' => $progress];

            // Auto-complete if progress reaches 100
            if ($progress >= 100 && $task->status !== 'completed') {
                $updates['status'] = 'completed';
            } elseif ($progress > 0 && $task->status === 'pending') {
                $updates['status'] = 'in_progress';
            }

            $task->update($updates);

            // Log progress update
            $this->logActivity(
                $task,
                $user,
                'progress_update',
                "Progress updated: {$oldProgress}% → {$progress}%",
                ['old_progress' => $oldProgress, 'new_progress' => $progress]
            );

            return $this->getTask($task->id);
        });
    }

    /**
     * Add a comment to a task
     */
    public function addComment(Task $task, string $content, User $user): array
    {
        return DB::transaction(function () use ($task, $content, $user) {
            TaskComment::create([
                'task_id' => $task->id,
                'user_id' => $user->id,
                'content' => $content,
            ]);

            // Log comment activity
            $this->logActivity($task, $user, 'comment', $content);

            $task->touch();

            return $this->getTask($task->id);
        });
    }

    /**
     * Delete a task
     */
    public function deleteTask(Task $task): bool
    {
        return $task->delete();
    }

    /**
     * Get task statistics for a company
     */
    public function getStats(int $companyId, ?int $userId = null): array
    {
        $query = Task::forCompany($companyId);

        if ($userId) {
            $query->assignedTo($userId);
        }

        $tasks = $query->get();

        $total = $tasks->count();
        $pending = $tasks->where('status', 'pending')->count();
        $inProgress = $tasks->where('status', 'in_progress')->count();
        $completed = $tasks->where('status', 'completed')->count();
        $overdue = $tasks->filter(fn($t) => $t->isOverdue())->count();

        return [
            'total' => $total,
            'pending' => $pending,
            'in_progress' => $inProgress,
            'completed' => $completed,
            'overdue' => $overdue,
            'completion_rate' => $total > 0 ? round(($completed / $total) * 100, 1) : 0,
        ];
    }

    /**
     * Get employees that can be assigned tasks
     */
    public function getAssignableEmployees(int $companyId): array
    {
        return User::where('company_id', $companyId)
            ->select('id', 'name', 'email')
            ->get()
            ->map(fn($u) => [
                'id' => (string) $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'avatar_url' => null,
            ])
            ->all();
    }

    /**
     * Log an activity for a task
     */
    protected function logActivity(Task $task, User $user, string $type, string $description, ?array $metadata = null): void
    {
        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'type' => $type,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Format task for API response
     */
    protected function formatTask(Task $task, bool $includeDetails = false): array
    {
        $data = [
            'id' => (string) $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'assigned_by' => $this->formatUser($task->assignedByUser),
            'assigned_to' => $this->formatUser($task->assignedToUser),
            'priority' => $task->priority,
            'status' => $task->status,
            'progress' => $task->progress,
            'due_date' => $task->due_date->toIso8601String(),
            'created_at' => $task->created_at->toIso8601String(),
            'updated_at' => $task->updated_at->toIso8601String(),
        ];

        if ($includeDetails) {
            $data['comments'] = $task->comments->map(fn($c) => [
                'id' => (string) $c->id,
                'content' => $c->content,
                'author' => $this->formatUser($c->user),
                'created_at' => $c->created_at->toIso8601String(),
            ])->all();

            $data['activities'] = $task->activities->map(fn($a) => [
                'id' => (string) $a->id,
                'type' => $a->type,
                'description' => $a->description,
                'user' => $this->formatUser($a->user),
                'created_at' => $a->created_at->toIso8601String(),
                'metadata' => $a->metadata,
            ])->all();

            $data['attachments'] = []; // TODO: implement attachments
        }

        return $data;
    }

    /**
     * Format user for API response
     */
    protected function formatUser(?User $user): array
    {
        if (!$user) {
            return ['id' => '0', 'name' => 'Unknown', 'email' => null, 'avatar_url' => null];
        }

        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar_url' => null, // TODO: implement avatar
        ];
    }
}
