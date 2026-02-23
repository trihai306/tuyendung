<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\RecruitmentTask;
use Illuminate\Support\Facades\DB;

class RecruitmentTaskService
{
    /**
     * Create a new recruitment task.
     */
    public function createTask(array $data): RecruitmentTask
    {
        return DB::transaction(function () use ($data) {
            return RecruitmentTask::create($data);
        });
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
}
