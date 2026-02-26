<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Config\PermissionConfig;
use App\Models\Attendance;
use App\Http\Requests\StoreRecruitmentTaskRequest;
use App\Http\Requests\StoreTaskCandidateRequest;
use App\Http\Requests\UpdateRecruitmentTaskRequest;
use App\Models\Application;
use App\Models\CompanyMember;
use App\Models\JobPost;
use App\Models\Payroll;
use App\Models\RecruitmentTask;
use App\Models\TaskCandidate;
use App\Models\User;
use App\Services\RecruitmentTaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecruitmentTaskController extends Controller
{
    public function __construct(
        private readonly RecruitmentTaskService $taskService
    ) {
    }

    /**
     * List tasks.
     * Owner: sees all tasks, all members
     * Manager: sees own + managed employees' tasks, only managed employees
     * Member: sees only assigned tasks
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403, 'Ban chua co thong tin cong ty.');

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();
        abort_unless((bool) $membership, 403);

        $role = $membership->role;
        $isOwner = $role === 'owner';
        $isManager = $role === 'manager';

        $query = RecruitmentTask::where('employer_profile_id', $company->id)
            ->with(['assigner']);

        // Scope tasks based on role
        if ($isOwner) {
            // Owner: sees all
        } elseif ($isManager) {
            // Manager: sees tasks assigned to self or managed employees
            $managedUserIds = CompanyMember::where('employer_profile_id', $company->id)
                ->where('managed_by', $user->id)
                ->active()
                ->pluck('user_id')
                ->toArray();
            $visibleUserIds = array_merge([$user->id], $managedUserIds);

            $query->where(function ($q) use ($visibleUserIds) {
                foreach ($visibleUserIds as $uid) {
                    $q->orWhereJsonContains('assigned_to', $uid);
                }
            });
        } else {
            // Member: only own tasks
            $query->forUser($user->id);
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by assignee (for owner/manager)
        if ($assigneeId = $request->input('assigned_to')) {
            $query->whereJsonContains('assigned_to', (int) $assigneeId);
        }

        // Filter by priority
        if ($priority = $request->input('priority')) {
            $query->where('priority', $priority);
        }

        $tasks = $query->latest()->paginate(15)->withQueryString();

        // Eager load assignee users for display
        $allUserIds = $tasks->getCollection()->flatMap(fn($t) => $t->assigned_to ?? [])->unique()->values();
        $usersMap = User::whereIn('id', $allUserIds)->get()->keyBy('id');

        // Append assignees data to each task
        $tasks->getCollection()->transform(function ($task) use ($usersMap) {
            $task->assignees_data = collect($task->assigned_to ?? [])
                ->map(fn($id) => $usersMap->get($id))
                ->filter()
                ->values();
            return $task;
        });

        // Get team members for filter dropdown and task assignment
        // Owner: all members
        // Manager: only managed employees + self
        // Member: empty
        $membersQuery = $company->members()
            ->active()
            ->with('user');

        if ($isManager) {
            $membersQuery->where(function ($q) use ($user) {
                $q->where('managed_by', $user->id)
                    ->orWhere('user_id', $user->id);
            });
        }

        $members = $membersQuery->get();

        // Ensure the company owner is always in the list (for owner view)
        if ($isOwner) {
            $ownerUser = User::find($company->user_id);
            if ($ownerUser && !$members->contains('user_id', $ownerUser->id)) {
                $ownerMember = new CompanyMember([
                    'employer_profile_id' => $company->id,
                    'user_id' => $ownerUser->id,
                    'role' => 'owner',
                    'status' => 'active',
                ]);
                $ownerMember->setRelation('user', $ownerUser);
                $members->prepend($ownerMember);
            }
        }

        return Inertia::render('Employer/Tasks/Index', [
            'tasks' => $tasks,
            'members' => $members,
            'filters' => $request->only(['status', 'assigned_to', 'priority']),
            'canAssign' => $membership->canAssignTasks(),
            'companyRole' => $role,
        ]);
    }

    /**
     * Show form to create a new task.
     * Owner: sees all members for assignment
     * Manager: only managed employees for assignment
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();
        abort_unless($membership?->canAssignTasks(), 403, 'Ban khong co quyen giao viec.');

        $role = $membership->role;
        $isOwner = $role === 'owner';
        $isManager = $role === 'manager';

        $membersQuery = $company->members()
            ->active()
            ->with('user');

        if ($isManager) {
            // Manager: only show managed employees + self
            $membersQuery->where(function ($q) use ($user) {
                $q->where('managed_by', $user->id)
                    ->orWhere('user_id', $user->id);
            });
        }

        $members = $membersQuery->get();

        // Ensure the company owner is always in the list (for owner view)
        if ($isOwner) {
            $ownerUser = User::find($company->user_id);
            if ($ownerUser && !$members->contains('user_id', $ownerUser->id)) {
                $ownerMember = new CompanyMember([
                    'employer_profile_id' => $company->id,
                    'user_id' => $ownerUser->id,
                    'role' => 'owner',
                    'status' => 'active',
                ]);
                $ownerMember->setRelation('user', $ownerUser);
                $members->prepend($ownerMember);
            }
        }

        return Inertia::render('Employer/Tasks/Create', [
            'members' => $members,
        ]);
    }

    /**
     * Store a new task.
     * Manager: can only assign to managed employees + self
     */
    public function store(StoreRecruitmentTaskRequest $request): RedirectResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();
        abort_unless($membership?->canAssignTasks(), 403, 'Ban khong co quyen giao viec.');

        $data = $request->validated();
        $data['employer_profile_id'] = $company->id;
        $data['assigned_by'] = $user->id;

        // Manager: validate assigned_to contains only managed employees + self
        $role = $membership->role;
        if ($role === 'manager' && !empty($data['assigned_to'])) {
            $managedUserIds = CompanyMember::where('employer_profile_id', $company->id)
                ->where('managed_by', $user->id)
                ->active()
                ->pluck('user_id')
                ->toArray();
            $allowedIds = array_merge([$user->id], $managedUserIds);

            foreach ($data['assigned_to'] as $assigneeId) {
                abort_unless(
                    in_array((int) $assigneeId, $allowedIds),
                    403,
                    'Ban chi co the giao viec cho nhan vien minh phu trach.'
                );
            }
        }

        $this->taskService->createTask($data);

        return redirect()->route('employer.tasks.index')
            ->with('success', 'Da tao nhiem vu thanh cong.');
    }

    /**
     * Show form to edit an existing task.
     * Owner: sees all members for assignment
     * Manager: only managed employees for assignment
     */
    public function edit(Request $request, RecruitmentTask $task): Response
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_if($task->employer_profile_id !== $company->id, 403);

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();
        abort_unless($membership?->canAssignTasks(), 403, 'Ban khong co quyen chinh sua nhiem vu.');

        $role = $membership->role;
        $isOwner = $role === 'owner';
        $isManager = $role === 'manager';

        $membersQuery = $company->members()
            ->active()
            ->with('user');

        if ($isManager) {
            $membersQuery->where(function ($q) use ($user) {
                $q->where('managed_by', $user->id)
                    ->orWhere('user_id', $user->id);
            });
        }

        $members = $membersQuery->get();

        if ($isOwner) {
            $ownerUser = User::find($company->user_id);
            if ($ownerUser && !$members->contains('user_id', $ownerUser->id)) {
                $ownerMember = new CompanyMember([
                    'employer_profile_id' => $company->id,
                    'user_id' => $ownerUser->id,
                    'role' => 'owner',
                    'status' => 'active',
                ]);
                $ownerMember->setRelation('user', $ownerUser);
                $members->prepend($ownerMember);
            }
        }

        return Inertia::render('Employer/Tasks/Edit', [
            'task' => $task,
            'members' => $members,
        ]);
    }

    /**
     * Delete a task.
     */
    public function destroy(Request $request, RecruitmentTask $task): RedirectResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_if($task->employer_profile_id !== $company->id, 403);

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();
        abort_unless($membership?->canAssignTasks(), 403, 'Ban khong co quyen xoa nhiem vu.');

        $this->taskService->deleteTask($task);

        return redirect()->route('employer.tasks.index')
            ->with('success', 'Da xoa nhiem vu thanh cong.');
    }

    /**
     * Check if the current user is assigned to this task.
     */
    private function isAssignedToTask(RecruitmentTask $task, int $userId): bool
    {
        return in_array($userId, $task->assigned_to ?? []);
    }

    /**
     * Show task detail.
     */
    public function show(Request $request, RecruitmentTask $task): Response
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_if($task->employer_profile_id !== $company->id, 403);

        // Members can only see their own tasks
        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();
        abort_unless((bool) $membership, 403);

        if (!$membership->canAssignTasks()) {
            abort_unless($this->isAssignedToTask($task, $user->id), 403);
        }

        $task->load(['assigner', 'candidates']);

        // Load assignee users
        $task->assignees_data = $task->assignees();

        $hiredCount = $task->candidates->whereIn('status', ['hired', 'trial'])->count();

        return Inertia::render('Employer/Tasks/Show', [
            'task' => $task,
            'canAssign' => $membership->canAssignTasks() || $this->isAssignedToTask($task, $user->id),
            'hiredCount' => $hiredCount,
        ]);
    }

    /**
     * Update task status/details.
     * Manager: can only reassign to managed employees + self
     */
    public function update(UpdateRecruitmentTaskRequest $request, RecruitmentTask $task): RedirectResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_if($task->employer_profile_id !== $company->id, 403);

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();
        abort_unless((bool) $membership, 403);

        // Members can only update status of their own tasks
        if (!$membership->canAssignTasks()) {
            abort_unless($this->isAssignedToTask($task, $user->id), 403);
        }

        $validated = $request->validated();

        // Manager: validate assigned_to contains only managed employees + self
        $role = $membership->role;
        if ($role === 'manager' && !empty($validated['assigned_to'])) {
            $managedUserIds = CompanyMember::where('employer_profile_id', $company->id)
                ->where('managed_by', $user->id)
                ->active()
                ->pluck('user_id')
                ->toArray();
            $allowedIds = array_merge([$user->id], $managedUserIds);

            foreach ($validated['assigned_to'] as $assigneeId) {
                abort_unless(
                    in_array((int) $assigneeId, $allowedIds),
                    403,
                    'Ban chi co the giao viec cho nhan vien minh phu trach.'
                );
            }
        }

        // Auto-set completed_at
        if (($validated['status'] ?? null) === 'completed') {
            $validated['completed_at'] = now();
        }

        $this->taskService->updateTask($task, $validated);

        return redirect()->back()
            ->with('success', 'Da cap nhat nhiem vu thanh cong.');
    }

    /**
     * Add candidates to a task (batch).
     */
    public function addCandidate(StoreTaskCandidateRequest $request, RecruitmentTask $task): RedirectResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_if($task->employer_profile_id !== $company->id, 403);

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();
        abort_unless((bool) $membership, 403);

        if (!$membership->canAssignTasks()) {
            abort_unless($this->isAssignedToTask($task, $user->id), 403);
        }

        $data = $request->validated();
        $applicationIds = $data['application_ids'];

        // Get existing application_ids in this task to skip duplicates
        $existingAppIds = $task->candidates()
            ->whereNotNull('application_id')
            ->pluck('application_id')
            ->toArray();

        $applications = Application::with('candidate')
            ->whereIn('id', $applicationIds)
            ->get();

        $addedCount = 0;
        foreach ($applications as $application) {
            if (in_array($application->id, $existingAppIds)) {
                continue;
            }

            $task->candidates()->create([
                'application_id' => $application->id,
                'candidate_name' => $application->display_name,
                'candidate_phone' => $application->candidate_phone ?? $application->candidate?->phone,
                'candidate_email' => $application->display_email,
                'status' => $data['status'] ?? 'hired',
                'notes' => $data['notes'] ?? null,
                'hired_date' => $data['hired_date'] ?? null,
            ]);
            $addedCount++;
        }

        return redirect()->back()
            ->with('success', "Da them {$addedCount} ung vien thanh cong.");
    }

    /**
     * Remove a candidate from a task.
     */
    public function removeCandidate(Request $request, RecruitmentTask $task, TaskCandidate $candidate): RedirectResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_if($task->employer_profile_id !== $company->id, 403);
        abort_if($candidate->recruitment_task_id !== $task->id, 404);

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();
        abort_unless((bool) $membership, 403);

        if (!$membership->canAssignTasks()) {
            abort_unless($this->isAssignedToTask($task, $user->id), 403);
        }

        $candidate->delete();

        return redirect()->back()
            ->with('success', 'Da xoa ung vien.');
    }

    /**
     * Attendance & Payroll management page for a task.
     */
    public function attendance(Request $request, RecruitmentTask $task): Response
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_if($task->employer_profile_id !== $company->id, 403);
        abort_if($task->type !== 'thoi_vu', 404, 'Chi ho tro cham cong cho nhiem vu thoi vu.');

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();
        abort_unless((bool) $membership, 403);

        if (!$membership->canAssignTasks()) {
            abort_unless($this->isAssignedToTask($task, $user->id), 403);
        }

        $task->load(['assigner', 'candidates']);
        $task->assignees_data = $task->assignees();

        // Load attendance data
        $attendances = Attendance::where('recruitment_task_id', $task->id)
            ->orderBy('work_date')
            ->get()
            ->groupBy('task_candidate_id')
            ->map(function ($records) {
                $mapped = [];
                foreach ($records as $record) {
                    $mapped[$record->work_date->format('Y-m-d')] = [
                        'id' => $record->id,
                        'status' => $record->status,
                        'shifts_worked' => $record->shifts_worked,
                        'overtime_hours' => (float) $record->overtime_hours,
                        'notes' => $record->notes,
                    ];
                }
                return $mapped;
            })
            ->toArray();

        // Load payrolls for this task
        $payrolls = Payroll::where('recruitment_task_id', $task->id)
            ->with('taskCandidate')
            ->orderByDesc('created_at')
            ->get();

        $role = $membership->role ?? 'owner';
        $canManagePayroll = PermissionConfig::can($role, 'payroll.manage');

        return Inertia::render('Employer/Tasks/Attendance', [
            'task' => $task,
            'canAssign' => $membership->canAssignTasks() || $this->isAssignedToTask($task, $user->id),
            'canManagePayroll' => $canManagePayroll,
            'attendances' => $attendances,
            'payrolls' => $payrolls,
        ]);
    }

    /**
     * Search applications for candidate selection (paginated JSON).
     */
    public function searchApplications(Request $request, RecruitmentTask $task): JsonResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_if($task->employer_profile_id !== $company->id, 403);

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();
        abort_unless((bool) $membership, 403);

        if (!$membership->canAssignTasks()) {
            abort_unless($this->isAssignedToTask($task, $user->id), 403);
        }

        $jobPostIds = JobPost::where('employer_id', $company->user_id)->pluck('id');

        // Exclude applications already added to this task
        $existingAppIds = $task->candidates()
            ->whereNotNull('application_id')
            ->pluck('application_id');

        $query = Application::whereIn('job_post_id', $jobPostIds)
            ->whereNotIn('id', $existingAppIds)
            ->with('candidate');

        // Members only see applications assigned to them
        if (!$membership->canAssignTasks()) {
            $query->where('assigned_to', $user->id);
        }

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('candidate_name', 'like', "%{$search}%")
                    ->orWhere('candidate_phone', 'like', "%{$search}%")
                    ->orWhere('candidate_email', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) ($request->input('per_page', 20)), 50);
        $paginated = $query->latest()->paginate($perPage);

        $items = $paginated->getCollection()->map(fn(Application $app) => [
            'id' => $app->id,
            'candidate_name' => $app->display_name,
            'candidate_phone' => $app->candidate_phone ?? $app->candidate?->phone,
            'candidate_email' => $app->display_email,
            'source' => $app->source,
            'status' => $app->status,
        ]);

        return response()->json([
            'data' => $items,
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'total' => $paginated->total(),
        ]);
    }
}
