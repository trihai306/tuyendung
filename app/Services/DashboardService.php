<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Application;
use App\Models\Attendance;
use App\Models\CompanyMember;
use App\Models\Interview;
use App\Models\JobPost;
use App\Models\RecruitmentTask;
use App\Models\RentPayment;
use App\Models\TenantContract;
use App\Models\User;

class DashboardService
{
    /**
     * Get dashboard data for a candidate.
     */
    public function getCandidateData(User $user): array
    {
        $profile = $user->candidateProfile;
        $profileFields = ['bio', 'skills', 'experience_years', 'education', 'resume_url', 'desired_salary', 'current_address', 'city'];
        $filledFields = 0;
        if ($profile) {
            foreach ($profileFields as $field) {
                if (!empty($profile->$field)) {
                    $filledFields++;
                }
            }
        }
        $profileCompletion = count($profileFields) > 0
            ? (int) round(($filledFields / count($profileFields)) * 100)
            : 0;

        $applicationIds = $user->applications()->pluck('id');

        return [
            'totalApplications' => $user->applications()->count(),
            'savedJobsCount' => $user->savedJobs()->count(),
            'interviewCount' => Interview::whereIn('application_id', $applicationIds)
                ->where('status', 'scheduled')
                ->count(),
            'profileCompletion' => $profileCompletion,
            'applicationStats' => [
                'pending' => $user->applications()->where('status', 'pending')->count(),
                'reviewing' => $user->applications()->where('status', 'reviewing')->count(),
                'shortlisted' => $user->applications()->where('status', 'shortlisted')->count(),
                'accepted' => $user->applications()->where('status', 'accepted')->count(),
                'rejected' => $user->applications()->where('status', 'rejected')->count(),
            ],
            'recentApplications' => $user->applications()
                ->with(['jobPost.employer.employerProfile'])
                ->latest('applied_at')
                ->take(5)
                ->get(),
            'recentSavedJobs' => $user->savedJobs()
                ->with(['jobPost.employer.employerProfile', 'jobPost.category'])
                ->latest()
                ->take(3)
                ->get(),
        ];
    }

    /**
     * Get dashboard data for an employer.
     */
    public function getEmployerData(User $user): array
    {
        $company = $user->getCompany();
        $ownerId = $company ? $company->user_id : $user->id;

        // Determine membership role
        $companyRole = 'owner';
        if ($company) {
            $membership = CompanyMember::where('employer_profile_id', $company->id)
                ->where('user_id', $user->id)
                ->active()
                ->first();
            $companyRole = $membership?->role ?? 'owner';
        }

        $isManager = in_array($companyRole, ['owner', 'manager'], true);

        // Scope job posts and applications based on role
        if ($isManager) {
            $jobPostIds = $user->jobPosts()->pluck('id');
            $totalJobPosts = $user->jobPosts()->count();
            $activeJobs = $user->jobPosts()->where('status', 'active')->count();
            $totalApplications = Application::whereIn('job_post_id', $jobPostIds)->count();
        } else {
            $jobPostIds = JobPost::where('created_by', $user->id)->pluck('id');
            $totalJobPosts = $jobPostIds->count();
            $activeJobs = JobPost::where('created_by', $user->id)->where('status', 'active')->count();
            $totalApplications = Application::where('assigned_to', $user->id)->count();
        }

        // Team stats -- only for manager+
        $teamStats = $isManager && $company
            ? $this->getTeamStats($company)
            : [];

        // Application stats scoped by role
        $applicationStats = $this->getApplicationStats($user, $jobPostIds, $isManager);
        $recentApplications = $this->getRecentApplications($user, $jobPostIds, $isManager);

        // Member-specific: my tasks summary
        $myTasks = !$isManager && $company
            ? $this->getMyTasksSummary($company, $user)
            : [];

        return [
            'totalJobPosts' => $totalJobPosts,
            'activeJobs' => $activeJobs,
            'totalApplications' => $totalApplications,
            'interviewsThisWeek' => Interview::whereHas('application', function ($q) use ($jobPostIds): void {
                $q->whereIn('job_post_id', $jobPostIds);
            })
                ->where('status', 'scheduled')
                ->whereBetween('scheduled_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
            'applicationStats' => $applicationStats,
            'recentApplications' => $recentApplications,
            'recentJobPosts' => $isManager
                ? $user->jobPosts()->withCount('applications')->latest()->take(5)->get()
                : JobPost::where('created_by', $user->id)->withCount('applications')->latest()->take(5)->get(),
            'companyName' => $user->employerProfile?->company_name ?? $user->name,
            'teamStats' => $teamStats,
            'myTasks' => $myTasks,
            'companyRole' => $companyRole,
        ];
    }

    /**
     * Get dashboard data for a landlord.
     */
    public function getLandlordData(User $user): array
    {
        $roomIds = $user->rooms()->pluck('id');
        $contractIds = TenantContract::whereIn('room_id', $roomIds)->pluck('id');

        return [
            'totalRooms' => $user->rooms()->count(),
            'activeContracts' => TenantContract::whereIn('room_id', $roomIds)
                ->where('status', 'active')
                ->count(),
            'recentContracts' => TenantContract::whereIn('room_id', $roomIds)
                ->with(['room', 'tenant'])
                ->latest()
                ->take(5)
                ->get(),
            'totalRevenue' => RentPayment::whereIn('contract_id', $contractIds)
                ->where('status', 'paid')
                ->sum('amount'),
        ];
    }

    /**
     * Get team performance stats for managers.
     */
    private function getTeamStats(mixed $company): array
    {
        $members = CompanyMember::where('employer_profile_id', $company->id)
            ->active()
            ->with('user')
            ->get();

        $teamStats = [];
        foreach ($members as $member) {
            $memberId = $member->user_id;
            $memberUser = $member->user;
            if (!$memberUser) {
                continue;
            }

            $memberJobIds = JobPost::where('created_by', $memberId)->pluck('id');

            $taskIds = RecruitmentTask::where('employer_profile_id', $company->id)
                ->whereJsonContains('assigned_to', $memberId)
                ->pluck('id');

            $teamStats[] = [
                'id' => $memberId,
                'name' => $memberUser->name,
                'email' => $memberUser->email,
                'avatar' => $memberUser->avatar,
                'role' => $member->role,
                'joined_at' => $member->joined_at,
                'jobs_created' => $memberJobIds->count(),
                'applications_received' => Application::whereIn('job_post_id', $memberJobIds)->count(),
                'tasks_assigned' => RecruitmentTask::where('employer_profile_id', $company->id)
                    ->whereJsonContains('assigned_to', $memberId)->count(),
                'tasks_completed' => RecruitmentTask::where('employer_profile_id', $company->id)
                    ->whereJsonContains('assigned_to', $memberId)->where('status', 'completed')->count(),
                'attendance_managed' => Attendance::whereIn('recruitment_task_id', $taskIds)
                    ->where('status', '!=', 'absent')->count(),
            ];
        }

        return $teamStats;
    }

    /**
     * Get application stats scoped by role.
     */
    private function getApplicationStats(User $user, mixed $jobPostIds, bool $isManager): array
    {
        if ($isManager) {
            return [
                'pending' => Application::whereIn('job_post_id', $jobPostIds)->where('status', 'pending')->count(),
                'reviewing' => Application::whereIn('job_post_id', $jobPostIds)->where('status', 'reviewing')->count(),
                'shortlisted' => Application::whereIn('job_post_id', $jobPostIds)->where('status', 'shortlisted')->count(),
                'accepted' => Application::whereIn('job_post_id', $jobPostIds)->where('status', 'accepted')->count(),
                'rejected' => Application::whereIn('job_post_id', $jobPostIds)->where('status', 'rejected')->count(),
            ];
        }

        return [
            'pending' => Application::where('assigned_to', $user->id)->where('status', 'pending')->count(),
            'reviewing' => Application::where('assigned_to', $user->id)->where('status', 'reviewing')->count(),
            'shortlisted' => Application::where('assigned_to', $user->id)->where('status', 'shortlisted')->count(),
            'accepted' => Application::where('assigned_to', $user->id)->where('status', 'accepted')->count(),
            'rejected' => Application::where('assigned_to', $user->id)->where('status', 'rejected')->count(),
        ];
    }

    /**
     * Get recent applications scoped by role.
     */
    private function getRecentApplications(User $user, mixed $jobPostIds, bool $isManager): mixed
    {
        if ($isManager) {
            return Application::whereIn('job_post_id', $jobPostIds)
                ->with(['jobPost', 'candidate.candidateProfile'])
                ->latest('applied_at')
                ->take(5)
                ->get();
        }

        return Application::where('assigned_to', $user->id)
            ->with(['jobPost', 'candidate.candidateProfile'])
            ->latest('applied_at')
            ->take(5)
            ->get();
    }

    /**
     * Get task summary for member role.
     */
    private function getMyTasksSummary(mixed $company, User $user): array
    {
        $baseQuery = RecruitmentTask::where('employer_profile_id', $company->id)
            ->whereJsonContains('assigned_to', $user->id);

        return [
            'assigned' => (clone $baseQuery)->count(),
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
            'in_progress' => (clone $baseQuery)->where('status', 'in_progress')->count(),
            'completed' => (clone $baseQuery)->where('status', 'completed')->count(),
        ];
    }
}
