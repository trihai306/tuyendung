<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Attendance;
use App\Models\CompanyMember;
use App\Models\Payroll;
use App\Models\RecruitmentTask;
use App\Models\User;
use Illuminate\Support\Collection;

class AttendanceService
{
    /**
     * Get the user's company role.
     */
    public function getUserRole(User $user): string
    {
        $company = $user->getCompany();

        if (!$company) {
            return 'owner';
        }

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();

        return $membership?->role ?? 'owner';
    }

    /**
     * Get seasonal tasks for attendance management.
     */
    public function getSeasonalTasks(User $user): Collection
    {
        $company = $user->getCompany();
        abort_unless($company, 403, 'Ban chua co thong tin cong ty.');

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();
        abort_unless((bool) $membership, 403);

        $query = RecruitmentTask::where('employer_profile_id', $company->id)
            ->where('type', 'thoi_vu')
            ->with(['assigner', 'candidates']);

        // Members only see their own tasks
        if (!$membership->canAssignTasks()) {
            $query->forUser($user->id);
        }

        $tasks = $query->orderByDesc('created_at')->get();

        return $tasks->map(function (RecruitmentTask $task) {
            $hiredCount = $task->candidates->where('status', 'hired')->count()
                + $task->candidates->where('status', 'trial')->count();

            $attendanceCount = Attendance::where('recruitment_task_id', $task->id)
                ->where('status', '!=', 'absent')
                ->count();

            $totalPayroll = Payroll::where('recruitment_task_id', $task->id)->sum('total_amount');
            $paidPayroll = Payroll::where('recruitment_task_id', $task->id)
                ->where('status', 'paid')->sum('total_amount');

            return [
                'id' => $task->id,
                'title' => $task->title,
                'status' => $task->status,
                'shift_rate' => $task->shift_rate,
                'overtime_rate' => $task->overtime_rate,
                'work_dates' => $task->work_dates,
                'hired_count' => $hiredCount,
                'attendance_count' => $attendanceCount,
                'total_payroll' => $totalPayroll,
                'paid_payroll' => $paidPayroll,
                'assigner' => $task->assigner,
                'created_at' => $task->created_at,
            ];
        });
    }

    /**
     * Bulk store/update attendance records for a specific date.
     */
    public function bulkStoreAttendance(RecruitmentTask $task, string $workDate, array $records): void
    {
        foreach ($records as $record) {
            Attendance::updateOrCreate(
                [
                    'task_candidate_id' => $record['task_candidate_id'],
                    'recruitment_task_id' => $task->id,
                    'work_date' => $workDate,
                ],
                [
                    'status' => $record['status'],
                    'shifts_worked' => $record['shifts_worked'] ?? ($record['status'] === 'half_day' ? 0 : 1),
                    'overtime_hours' => $record['overtime_hours'] ?? 0,
                    'notes' => $record['notes'] ?? null,
                ]
            );
        }
    }

    /**
     * Get attendance data for a task.
     */
    public function getTaskAttendance(RecruitmentTask $task): Collection
    {
        return Attendance::where('recruitment_task_id', $task->id)
            ->with('taskCandidate')
            ->orderBy('work_date')
            ->get();
    }

    /**
     * Delete an attendance record.
     */
    public function deleteAttendance(Attendance $attendance): void
    {
        $attendance->delete();
    }
}
