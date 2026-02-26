<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Application;
use App\Models\JobCategory;
use App\Models\JobPost;
use App\Models\RecruitmentTask;
use App\Models\SavedJob;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class JobPostService
{
    /**
     * Get public job listing with filters.
     */
    public function getPublicListing(array $filters, ?User $user = null): array
    {
        $query = JobPost::active()
            ->with(['employer.employerProfile', 'category']);

        if ($search = $filters['search'] ?? null) {
            $query->where(function ($q) use ($search): void {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($city = $filters['city'] ?? null) {
            $query->inCity($city);
        }

        if ($jobType = $filters['job_type'] ?? null) {
            $query->where('job_type', $jobType);
        }

        if ($categoryId = $filters['category_id'] ?? null) {
            $query->where('category_id', $categoryId);
        }

        if ($salaryMin = $filters['salary_min'] ?? null) {
            $query->where('salary_max', '>=', $salaryMin);
        }

        if ($salaryMax = $filters['salary_max'] ?? null) {
            $query->where('salary_min', '<=', $salaryMax);
        }

        if ($experienceLevel = $filters['experience_level'] ?? null) {
            $query->where('experience_level', $experienceLevel);
        }

        $jobPosts = $query->latest()->paginate(12)->withQueryString();

        // Mark saved jobs for authenticated candidates
        if ($user && $user->isCandidate()) {
            $savedJobPostIds = SavedJob::where('user_id', $user->id)
                ->pluck('job_post_id')
                ->toArray();

            $jobPosts->getCollection()->transform(function ($job) use ($savedJobPostIds) {
                $job->is_saved = in_array($job->id, $savedJobPostIds);
                return $job;
            });
        }

        return [
            'jobs' => $jobPosts,
            'categories' => JobCategory::all(),
        ];
    }

    /**
     * Get public job detail with candidate-specific data.
     */
    public function getPublicDetail(JobPost $jobPost, ?User $user = null): array
    {
        $jobPost->load(['employer.employerProfile', 'category']);
        $jobPost->loadCount('applications');
        $jobPost->increment('views_count');

        $data = ['jobPost' => $jobPost];

        if ($user && $user->isCandidate()) {
            $data['hasApplied'] = $jobPost->applications()
                ->where('candidate_id', $user->id)
                ->exists();

            $data['isSaved'] = SavedJob::where('user_id', $user->id)
                ->where('job_post_id', $jobPost->id)
                ->exists();
        }

        // Related jobs: same category or same city, excluding current
        $data['relatedJobs'] = JobPost::active()
            ->where('id', '!=', $jobPost->id)
            ->where(function ($q) use ($jobPost): void {
                if ($jobPost->category_id) {
                    $q->where('category_id', $jobPost->category_id);
                }
                if ($jobPost->city) {
                    $q->orWhere('city', $jobPost->city);
                }
            })
            ->with(['employer.employerProfile'])
            ->latest()
            ->take(5)
            ->get();

        return $data;
    }

    /**
     * Get employer job listing with stats.
     */
    public function getEmployerListing(User $user, array $filters): array
    {
        $company = $user->getCompany();
        $ownerId = $company ? $company->user_id : $user->id;

        $query = JobPost::where('employer_id', $ownerId)
            ->withCount('applications')
            ->with(['category']);

        if ($status = $filters['status'] ?? null) {
            $query->where('status', $status);
        }

        if ($search = $filters['search'] ?? null) {
            $query->where('title', 'like', "%{$search}%");
        }

        $jobPosts = $query->latest()->paginate(10)->withQueryString();

        // Stats
        $allJobsQuery = JobPost::where('employer_id', $ownerId);
        $allJobPostIds = (clone $allJobsQuery)->pluck('id');
        $stats = [
            'total' => (clone $allJobsQuery)->count(),
            'active' => (clone $allJobsQuery)->where('status', 'active')->count(),
            'draft' => (clone $allJobsQuery)->where('status', 'draft')->count(),
            'expired' => (clone $allJobsQuery)->where('status', 'expired')->count(),
            'totalApplications' => Application::whereIn('job_post_id', $allJobPostIds)->count(),
        ];

        // Recent tasks
        $recentTasks = [];
        if ($company) {
            $recentTasks = RecruitmentTask::where('employer_profile_id', $company->id)
                ->with(['assigner', 'jobPost'])
                ->latest()
                ->take(5)
                ->get();
        }

        return [
            'jobPosts' => $jobPosts,
            'stats' => $stats,
            'recentTasks' => $recentTasks,
        ];
    }

    /**
     * Create a new job post.
     */
    public function createJobPost(User $user, array $validated): JobPost
    {
        $company = $user->getCompany();
        $employerId = $company ? $company->user_id : $user->id;

        $validated['employer_id'] = $employerId;
        $validated['created_by'] = $user->id;
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);

        if (($validated['status'] ?? 'draft') === 'active') {
            $validated['published_at'] = now();
        }

        return JobPost::create($validated);
    }

    /**
     * Update an existing job post.
     */
    public function updateJobPost(JobPost $jobPost, array $validated): JobPost
    {
        $jobPost->update($validated);

        return $jobPost;
    }

    /**
     * Delete a job post (soft delete).
     */
    public function deleteJobPost(JobPost $jobPost): void
    {
        $jobPost->delete();
    }
}
