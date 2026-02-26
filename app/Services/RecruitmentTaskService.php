<?php

declare(strict_types=1);

namespace App\Services;

use App\Events\TaskAssignedEvent;
use App\Models\RecruitmentTask;
use App\Models\User;
use App\Notifications\TaskAssignedNotification;
use Illuminate\Support\Facades\DB;

class RecruitmentTaskService
{
    /**
     * Create a new recruitment task.
     */
    public function createTask(array $data): RecruitmentTask
    {
        $task = DB::transaction(function () use ($data) {
            return RecruitmentTask::create($data);
        });

        $this->notifyAssignees($task);

        return $task;
    }

    /**
     * Dispatch TaskAssignedEvent to each assigned user (excluding the assigner).
     */
    private function notifyAssignees(RecruitmentTask $task): void
    {
        $assignedTo = $task->assigned_to ?? [];
        $assignerId = $task->assigned_by;

        $assignerName = $assignerId
            ? (User::find($assignerId)?->name ?? 'Quan ly')
            : 'Quan ly';

        foreach ($assignedTo as $userId) {
            if ((int) $userId === (int) $assignerId) {
                continue;
            }

            event(new TaskAssignedEvent(
                userId: (int) $userId,
                taskId: $task->id,
                taskTitle: $task->title,
                assignerName: $assignerName,
                priority: $task->priority ?? 'normal',
            ));

            $assignee = User::find((int) $userId);
            if ($assignee) {
                $assignee->notify(new TaskAssignedNotification(
                    taskId: $task->id,
                    taskTitle: $task->title,
                    assignerName: $assignerName,
                    priority: $task->priority ?? 'normal',
                ));
            }
        }
    }

    /**
     * Update a recruitment task.
     */
    public function updateTask(RecruitmentTask $task, array $data): RecruitmentTask
    {
        return DB::transaction(function () use ($task, $data) {
            $task->update($data);
            return $task->fresh();
        });
    }

    /**
     * Mark a task as completed.
     */
    public function completeTask(RecruitmentTask $task): RecruitmentTask
    {
        return DB::transaction(function () use ($task) {
            $task->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
            return $task->fresh();
        });
    }

    /**
     * Cancel a task.
     */
    public function cancelTask(RecruitmentTask $task): RecruitmentTask
    {
        return DB::transaction(function () use ($task) {
            $task->update([
                'status' => 'cancelled',
            ]);
            return $task->fresh();
        });
    }

    /**
     * Delete a task and its related candidates.
     */
    public function deleteTask(RecruitmentTask $task): void
    {
        DB::transaction(function () use ($task) {
            $task->candidates()->delete();
            $task->delete();
        });
    }
}
