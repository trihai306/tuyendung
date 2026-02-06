<?php

namespace App\Services;

use App\Models\JobAssignment;
use App\Models\RecruitmentJob;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class JobAssignmentService
{
    /**
     * Assign job to user
     */
    public function assignJobToUser(RecruitmentJob $job, int $userId, ?int $targetAssigned, User $manager): JobAssignment
    {
        // Verify manager has permission
        if (!$this->canManageAssignments($manager)) {
            throw new \Exception('Unauthorized', 403);
        }

        // Verify assignee belongs to same company
        $assignee = User::find($userId);
        if (!$assignee || $assignee->company_id !== $manager->company_id) {
            throw new \Exception('Nhân viên không thuộc công ty của bạn', 400);
        }

        return JobAssignment::updateOrCreate(
            ['job_id' => $job->id, 'user_id' => $userId],
            [
                'target_assigned' => $targetAssigned,
                'status' => 'assigned',
            ]
        );
    }

    /**
     * Get assignments for a job
     */
    public function getAssignments(RecruitmentJob $job): array
    {
        $assignments = $job->assignments()->with('user:id,name,email')->get();

        return [
            'assignments' => $assignments,
            'summary' => [
                'total_assigned' => $assignments->sum('target_assigned'),
                'total_found' => $assignments->sum('found_count'),
                'total_confirmed' => $assignments->sum('confirmed_count'),
                'target_count' => $job->target_count,
                'progress_percent' => $job->progress_percent,
            ],
        ];
    }

    /**
     * Update assignment progress
     */
    public function updateProgress(JobAssignment $assignment, array $data, User $user): JobAssignment
    {
        // Only assigned user can update
        if ($assignment->user_id !== $user->id) {
            throw new \Exception('Unauthorized', 403);
        }

        $assignment->updateProgress(
            $data['found_count'],
            $data['confirmed_count'] ?? null,
            $data['notes'] ?? null
        );

        return $assignment->fresh()->load('job');
    }

    /**
     * Get assignments for current user
     */
    public function getMyAssignments(int $userId): Collection
    {
        return JobAssignment::where('user_id', $userId)
            ->with(['job:id,title,status,target_count,hired_count,expires_at'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Delete assignment
     */
    public function deleteAssignment(JobAssignment $assignment, User $user): bool
    {
        if (!$this->canManageAssignments($user)) {
            throw new \Exception('Unauthorized', 403);
        }

        return $assignment->delete();
    }

    /**
     * Check if user can manage assignments (owner or admin)
     */
    private function canManageAssignments(User $user): bool
    {
        return $user->company && in_array($user->role, ['owner', 'admin']);
    }
}
