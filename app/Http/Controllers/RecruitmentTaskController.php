<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreRecruitmentTaskRequest;
use App\Http\Requests\StoreTaskCandidateRequest;
use App\Http\Requests\UpdateRecruitmentTaskRequest;
use App\Models\Application;
use App\Models\CompanyMember;
use App\Models\JobPost;
use App\Models\RecruitmentTask;
use App\Models\TaskCandidate;
use App\Services\RecruitmentTaskService;
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
     * List tasks. Owner/Manager sees all, member sees only assigned.
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

        $query = RecruitmentTask::where('employer_profile_id', $company->id)
            ->with(['jobPost', 'assignee', 'assigner']);

        // Members only see their own tasks
        if (!$membership->canAssignTasks()) {
            $query->forUser($user->id);
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by assignee (for owner/manager)
        if ($assigneeId = $request->input('assigned_to')) {
            $query->where('assigned_to', $assigneeId);
        }

        // Filter by priority
        if ($priority = $request->input('priority')) {
            $query->where('priority', $priority);
        }

        $tasks = $query->latest()->paginate(15)->withQueryString();

        // Get team members for filter dropdown and task assignment
        $members = $company->members()
            ->active()
            ->with('user')
            ->get();

        // Ensure the company owner is always in the list
        $ownerUser = \App\Models\User::find($company->user_id);
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

        return Inertia::render('Employer/Tasks/Index', [
            'tasks' => $tasks,
            'members' => $members,
            'filters' => $request->only(['status', 'assigned_to', 'priority']),
            'canAssign' => $membership->canAssignTasks(),
        ]);
    }

    /**
     * Show form to create a new task.
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

        $members = $company->members()
            ->active()
            ->with('user')
            ->get();

        // Ensure the company owner is always in the list
        $ownerUser = \App\Models\User::find($company->user_id);
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

        return Inertia::render('Employer/Tasks/Create', [
            'members' => $members,
        ]);
    }

    /**
     * Store a new task.
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

        $this->taskService->createTask($data);

        return redirect()->route('employer.tasks.index')
            ->with('success', 'Da tao nhiem vu thanh cong.');
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
            abort_if($task->assigned_to !== $user->id, 403);
        }

        $task->load(['assignee', 'assigner', 'candidates']);

        $hiredCount = $task->candidates->whereIn('status', ['hired', 'trial'])->count();

        // Get all applications managed by this company for candidate selection
        $jobPostIds = JobPost::where('employer_id', $company->user_id)->pluck('id');
        $applications = Application::whereIn('job_post_id', $jobPostIds)
            ->with('candidate')
            ->get()
            ->map(fn(Application $app) => [
                'id' => $app->id,
                'candidate_name' => $app->display_name,
                'candidate_phone' => $app->candidate_phone ?? $app->candidate?->phone,
                'candidate_email' => $app->display_email,
                'source' => $app->source,
                'status' => $app->status,
            ]);

        return Inertia::render('Employer/Tasks/Show', [
            'task' => $task,
            'canAssign' => $membership->canAssignTasks(),
            'hiredCount' => $hiredCount,
            'applications' => $applications,
        ]);
    }

    /**
     * Update task status/details.
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
            abort_if($task->assigned_to !== $user->id, 403);
        }

        $validated = $request->validated();

        // Auto-set completed_at
        if (($validated['status'] ?? null) === 'completed') {
            $validated['completed_at'] = now();
        }

        $this->taskService->updateTask($task, $validated);

        return redirect()->back()
            ->with('success', 'Da cap nhat nhiem vu thanh cong.');
    }

    /**
     * Add a candidate to a task.
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
            abort_if($task->assigned_to !== $user->id, 403);
        }

        $data = $request->validated();

        // If application_id is provided, auto-fill candidate info from Application
        if (!empty($data['application_id'])) {
            $application = Application::with('candidate')->find($data['application_id']);
            if ($application) {
                $data['candidate_name'] = $application->display_name;
                $data['candidate_phone'] = $application->candidate_phone ?? $application->candidate?->phone;
                $data['candidate_email'] = $application->display_email;
            }
        }

        $task->candidates()->create($data);

        return redirect()->back()
            ->with('success', 'Da them ung vien thanh cong.');
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
            abort_if($task->assigned_to !== $user->id, 403);
        }

        $candidate->delete();

        return redirect()->back()
            ->with('success', 'Da xoa ung vien.');
    }
}
