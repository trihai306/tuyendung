<?php

declare(strict_types=1);

namespace App\Services;

use App\Config\PermissionConfig;
use App\Models\Application;
use App\Models\CompanyMember;
use App\Models\JobPost;
use App\Models\User;
use App\Notifications\ApplicationStatusNotification;
use App\Notifications\NewApplicationNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ApplicationService
{
    /**
     * Get paginated applications for a candidate.
     */
    public function getCandidateApplications(User $user): LengthAwarePaginator
    {
        return $user->applications()
            ->with('jobPost.employer')
            ->latest()
            ->paginate(10);
    }

    /**
     * Create a new application (candidate applies for a job).
     */
    public function createApplication(User $user, JobPost $jobPost, array $data): Application
    {
        $alreadyApplied = Application::where('job_post_id', $jobPost->id)
            ->where('candidate_id', $user->id)
            ->exists();

        abort_if($alreadyApplied, 409, 'You have already applied for this job.');

        $application = Application::create([
            'job_post_id' => $jobPost->id,
            'candidate_id' => $user->id,
            'cover_letter' => $data['cover_letter'] ?? null,
            'resume_url' => $data['resume_url'] ?? null,
            'status' => 'pending',
            'source' => 'system',
            'applied_at' => now(),
        ]);

        // Notify the employer about the new application
        $employer = User::find($jobPost->employer_id);
        if ($employer) {
            $employer->notify(new NewApplicationNotification(
                applicationId: $application->id,
                candidateName: $user->name,
                jobTitle: $jobPost->title,
                source: 'system',
            ));
        }

        return $application;
    }

    /**
     * Get employer applications with 3-tier access control.
     *
     * @return array{applications: LengthAwarePaginator, stats: array, teamMembers: array, jobPosts: Collection, canViewAll: bool, companyRole: string}
     */
    public function getEmployerApplications(User $user, array $filters): array
    {
        $company = $user->getCompany();
        $jobPostIds = $company
            ? JobPost::where('employer_id', $company->user_id)->pluck('id')
            : $user->jobPosts()->pluck('id');

        // Get membership for permission check
        $membership = $company
            ? CompanyMember::where('employer_profile_id', $company->id)
                ->where('user_id', $user->id)
                ->active()
                ->first()
            : null;

        $role = $membership?->role ?? 'owner';
        $canViewAll = PermissionConfig::can($role, 'applications.view_all');
        $canViewManaged = PermissionConfig::can($role, 'applications.view_managed');

        $query = Application::whereIn('job_post_id', $jobPostIds)
            ->with(['candidate.candidateProfile', 'jobPost', 'assignedToUser']);

        // Scope based on role
        $this->applyScopeByRole($query, $user, $company, $canViewAll, $canViewManaged);

        // Apply filters
        $this->applyFilters($query, $filters);

        $applications = $query->latest()->paginate(15)->withQueryString();

        // Stats - scoped to what the user can see
        $stats = $this->getApplicationStats($jobPostIds, $user, $company, $canViewAll, $canViewManaged);

        // Team members for filter and handover dialog
        $teamMembers = $this->getTeamMembers($company, $user, $canViewAll, $canViewManaged);

        return [
            'applications' => $applications,
            'stats' => $stats,
            'teamMembers' => $teamMembers,
            'jobPosts' => JobPost::whereIn('id', $jobPostIds)->select('id', 'title')->get(),
            'canViewAll' => $canViewAll,
            'companyRole' => $role,
        ];
    }

    /**
     * Store an external candidate application.
     */
    public function storeExternalCandidate(User $user, array $validated, array $filePaths): Application
    {
        $company = $user->getCompany();
        $jobPost = JobPost::findOrFail($validated['job_post_id']);
        $ownerId = $company ? $company->user_id : $user->id;
        abort_if($jobPost->employer_id !== $ownerId, 403);

        unset($validated['candidate_photo'], $validated['candidate_id_card_front'], $validated['candidate_id_card_back']);

        return Application::create([
            ...$validated,
            ...$filePaths,
            'added_by' => $user->id,
            'assigned_to' => $user->id,
            'status' => 'pending',
            'applied_at' => now(),
        ]);
    }

    /**
     * Delete a single application with associated files.
     */
    public function deleteApplication(User $user, Application $application): void
    {
        $company = $user->getCompany();
        $ownerId = $company ? $company->user_id : $user->id;
        abort_if($application->jobPost->employer_id !== $ownerId, 403);

        $this->checkPermission($user, $company, 'applications.delete', 'Ban khong co quyen xoa ung vien.');

        $this->deleteApplicationFiles($application);
        $application->delete();
    }

    /**
     * Bulk delete applications.
     */
    public function bulkDeleteApplications(User $user, array $applicationIds): int
    {
        $company = $user->getCompany();
        abort_unless($company !== null, 403);

        $this->checkPermission($user, $company, 'applications.delete', 'Ban khong co quyen xoa ung vien.');

        $jobPostIds = JobPost::where('employer_id', $company->user_id)->pluck('id');

        DB::transaction(function () use ($applicationIds, $jobPostIds): void {
            $apps = Application::whereIn('id', $applicationIds)
                ->whereIn('job_post_id', $jobPostIds)
                ->get();

            foreach ($apps as $app) {
                $this->deleteApplicationFiles($app);
                $app->delete();
            }
        });

        return count($applicationIds);
    }

    /**
     * Transfer applications to another team member.
     */
    public function transferApplications(User $user, array $applicationIds, int $assignedTo): int
    {
        $company = $user->getCompany();
        abort_unless($company !== null, 403, 'Ban chua co thong tin cong ty.');

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();
        $role = $membership?->role ?? 'member';
        abort_unless(PermissionConfig::can($role, 'applications.transfer'), 403, 'Ban khong co quyen ban giao ung vien.');

        // Verify target user is active member
        $targetMember = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $assignedTo)
            ->active()
            ->first();
        abort_unless($targetMember !== null, 422, 'Nhan vien khong ton tai trong cong ty.');

        // Manager: can only transfer to managed employees
        $isOwner = PermissionConfig::can($role, 'applications.view_all');
        if (!$isOwner) {
            $isManagedEmployee = CompanyMember::where('employer_profile_id', $company->id)
                ->where('user_id', $assignedTo)
                ->where('managed_by', $user->id)
                ->active()
                ->exists();
            abort_unless($isManagedEmployee, 403, 'Ban chi co the ban giao cho nhan vien minh phu trach.');
        }

        $jobPostIds = JobPost::where('employer_id', $company->user_id)->pluck('id');

        DB::transaction(function () use ($applicationIds, $jobPostIds, $assignedTo): void {
            Application::whereIn('id', $applicationIds)
                ->whereIn('job_post_id', $jobPostIds)
                ->update(['assigned_to' => $assignedTo]);
        });

        return count($applicationIds);
    }

    /**
     * Update an application (status/notes) and notify candidate if status changed.
     */
    public function updateApplication(User $user, Application $application, array $validated): Application
    {
        $jobPost = $application->jobPost;
        $company = $user->getCompany();
        $ownerId = $company ? $company->user_id : $user->id;
        abort_if($jobPost->employer_id !== $ownerId, 403);

        if (is_null($application->reviewed_at)) {
            $validated['reviewed_at'] = now();
        }

        $oldStatus = $application->status;
        $application->update($validated);

        // Notify candidate when status changes
        if (isset($validated['status']) && $validated['status'] !== $oldStatus && $application->candidate_id) {
            $candidate = User::find($application->candidate_id);
            if ($candidate) {
                $candidate->notify(new ApplicationStatusNotification(
                    applicationId: $application->id,
                    jobTitle: $jobPost->title,
                    newStatus: $validated['status'],
                ));
            }
        }

        return $application;
    }

    // -- Private helpers --

    /**
     * Apply role-based scope to query.
     */
    private function applyScopeByRole(
        mixed $query,
        User $user,
        mixed $company,
        bool $canViewAll,
        bool $canViewManaged,
    ): void {
        if ($canViewAll) {
            return;
        }

        if ($canViewManaged && $company) {
            $managedUserIds = CompanyMember::where('employer_profile_id', $company->id)
                ->where('managed_by', $user->id)
                ->active()
                ->pluck('user_id')
                ->toArray();

            $query->where(function ($q) use ($user, $managedUserIds): void {
                $q->where('assigned_to', $user->id)
                    ->orWhere('added_by', $user->id)
                    ->orWhereIn('assigned_to', $managedUserIds);
            });
        } else {
            $query->where(function ($q) use ($user): void {
                $q->where('assigned_to', $user->id)
                    ->orWhere('added_by', $user->id);
            });
        }
    }

    /**
     * Apply filters to query.
     */
    private function applyFilters(mixed $query, array $filters): void
    {
        if ($assignedTo = $filters['assigned_to'] ?? null) {
            $query->where('assigned_to', (int) $assignedTo);
        }

        if ($jobPostId = $filters['job_post_id'] ?? null) {
            $query->where('job_post_id', (int) $jobPostId);
        }

        if ($status = $filters['status'] ?? null) {
            $query->where('status', $status);
        }

        if ($source = $filters['source'] ?? null) {
            $query->where('source', $source);
        }

        if ($search = $filters['search'] ?? null) {
            $query->where(function ($q) use ($search): void {
                $q->where('candidate_name', 'like', "%{$search}%")
                    ->orWhere('candidate_email', 'like', "%{$search}%")
                    ->orWhere('candidate_phone', 'like', "%{$search}%")
                    ->orWhereHas('candidate', function ($q2) use ($search): void {
                        $q2->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }
    }

    /**
     * Get application stats scoped by role.
     */
    private function getApplicationStats(
        mixed $jobPostIds,
        User $user,
        mixed $company,
        bool $canViewAll,
        bool $canViewManaged,
    ): array {
        $statsQuery = Application::whereIn('job_post_id', $jobPostIds);
        $this->applyScopeByRole($statsQuery, $user, $company, $canViewAll, $canViewManaged);

        return [
            'total' => (clone $statsQuery)->count(),
            'pending' => (clone $statsQuery)->where('status', 'pending')->count(),
            'reviewing' => (clone $statsQuery)->where('status', 'reviewing')->count(),
            'shortlisted' => (clone $statsQuery)->where('status', 'shortlisted')->count(),
            'accepted' => (clone $statsQuery)->where('status', 'accepted')->count(),
            'rejected' => (clone $statsQuery)->where('status', 'rejected')->count(),
            'system' => (clone $statsQuery)->where('source', 'system')->count(),
            'external' => (clone $statsQuery)->where('source', '!=', 'system')->count(),
        ];
    }

    /**
     * Get team members for filter/handover dialogs.
     */
    private function getTeamMembers(mixed $company, User $user, bool $canViewAll, bool $canViewManaged): array
    {
        if (!$company) {
            return [];
        }

        $membersQuery = CompanyMember::where('employer_profile_id', $company->id)
            ->active()
            ->with('user:id,name,email');

        if (!$canViewAll && $canViewManaged) {
            $membersQuery->where('managed_by', $user->id);
        }

        return $membersQuery->get()
            ->map(fn(CompanyMember $m) => [
                'id' => $m->user_id,
                'name' => $m->user?->name ?? 'N/A',
                'email' => $m->user?->email ?? '',
                'role' => $m->role,
            ])
            ->values()
            ->toArray();
    }

    /**
     * Check permission for an action.
     */
    private function checkPermission(User $user, mixed $company, string $permission, string $message): void
    {
        $membership = $company
            ? CompanyMember::where('employer_profile_id', $company->id)
                ->where('user_id', $user->id)
                ->active()
                ->first()
            : null;
        $role = $membership?->role ?? 'owner';
        abort_unless(PermissionConfig::can($role, $permission), 403, $message);
    }

    /**
     * Delete files associated with an application.
     */
    private function deleteApplicationFiles(Application $application): void
    {
        foreach (['candidate_photo', 'candidate_id_card_front', 'candidate_id_card_back'] as $field) {
            if ($application->{$field}) {
                Storage::disk('public')->delete($application->{$field});
            }
        }
    }
}
