<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Config\PermissionConfig;
use App\Models\Attendance;
use App\Models\RecruitmentTask;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function __construct(
        private readonly AttendanceService $attendanceService,
    ) {
    }

    /**
     * List all seasonal tasks for attendance management.
     */
    public function index(Request $request): \Inertia\Response
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $tasksData = $this->attendanceService->getSeasonalTasks($user);

        return Inertia::render('Employer/Attendance/Index', [
            'tasks' => $tasksData,
        ]);
    }

    /**
     * Bulk store/update attendance records for a specific date.
     */
    public function bulkStore(Request $request, RecruitmentTask $task): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $role = $this->attendanceService->getUserRole($user);
        $isAssigned = in_array($user->id, $task->assigned_to ?? []);
        abort_unless(PermissionConfig::can($role, 'payroll.manage') || $isAssigned, 403);

        $validated = $request->validate([
            'work_date' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.task_candidate_id' => ['required', 'integer', 'exists:task_candidates,id'],
            'records.*.status' => ['required', 'in:present,absent,half_day,late'],
            'records.*.shifts_worked' => ['nullable', 'integer', 'min:0'],
            'records.*.overtime_hours' => ['nullable', 'numeric', 'min:0'],
            'records.*.notes' => ['nullable', 'string', 'max:500'],
        ]);

        $this->attendanceService->bulkStoreAttendance($task, $validated['work_date'], $validated['records']);

        return redirect()->back()->with('success', 'Da luu cham cong thanh cong.');
    }

    /**
     * Get attendance data for a task (JSON API).
     */
    public function getByTask(Request $request, RecruitmentTask $task): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $role = $this->attendanceService->getUserRole($user);
        $isAssigned = in_array($user->id, $task->assigned_to ?? []);
        abort_unless(PermissionConfig::can($role, 'payroll.view') || $isAssigned, 403);

        $attendances = $this->attendanceService->getTaskAttendance($task);

        return response()->json([
            'attendances' => $attendances,
        ]);
    }

    /**
     * Delete an attendance record.
     */
    public function destroy(Request $request, Attendance $attendance): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $role = $this->attendanceService->getUserRole($user);
        $task = RecruitmentTask::find($attendance->recruitment_task_id);
        $isAssigned = $task && in_array($user->id, $task->assigned_to ?? []);
        abort_unless(PermissionConfig::can($role, 'payroll.manage') || $isAssigned, 403);

        $this->attendanceService->deleteAttendance($attendance);

        return redirect()->back()->with('success', 'Da xoa ban ghi cham cong.');
    }
}
