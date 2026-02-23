<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJobPostRequest;
use App\Http\Requests\UpdateJobPostRequest;
use App\Models\JobCategory;
use App\Models\JobPost;
use App\Models\SavedJob;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class JobPostController extends Controller
{
    /**
     * Public listing with filters and pagination.
     */
    public function index(Request $request): Response
    {
        $query = JobPost::active()
            ->with(['employer.employerProfile', 'category']);

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // City filter
        if ($city = $request->input('city')) {
            $query->inCity($city);
        }

        // Job type filter
        if ($jobType = $request->input('job_type')) {
            $query->where('job_type', $jobType);
        }

        // Category filter
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Salary range filter
        if ($salaryMin = $request->input('salary_min')) {
            $query->where('salary_max', '>=', $salaryMin);
        }
        if ($salaryMax = $request->input('salary_max')) {
            $query->where('salary_min', '<=', $salaryMax);
        }

        // Experience level filter
        if ($experienceLevel = $request->input('experience_level')) {
            $query->where('experience_level', $experienceLevel);
        }

        $jobPosts = $query->latest()->paginate(12)->withQueryString();

        // If authenticated candidate, mark which jobs are saved
        if ($request->user() && $request->user()->isCandidate()) {
            $savedJobPostIds = SavedJob::where('user_id', $request->user()->id)
                ->pluck('job_post_id')
                ->toArray();

            $jobPosts->getCollection()->transform(function ($job) use ($savedJobPostIds) {
                $job->is_saved = in_array($job->id, $savedJobPostIds);
                return $job;
            });
        }

        return Inertia::render('Jobs/Index', [
            'jobs' => $jobPosts,
            'filters' => $request->only(['search', 'city', 'job_type', 'category_id', 'salary_min', 'salary_max', 'experience_level']),
            'categories' => JobCategory::all(),
        ]);
    }

    /**
     * Public detail page.
     */
    public function show(JobPost $jobPost): Response
    {
        $jobPost->load(['employer.employerProfile', 'category']);
        $jobPost->loadCount('applications');

        // Increment views
        $jobPost->increment('views_count');

        $data = [
            'jobPost' => $jobPost,
        ];

        $user = auth()->user();
        if ($user && $user->isCandidate()) {
            $data['hasApplied'] = $jobPost->applications()
                ->where('candidate_id', $user->id)
                ->exists();

            $data['isSaved'] = SavedJob::where('user_id', $user->id)
                ->where('job_post_id', $jobPost->id)
                ->exists();
        }

        return Inertia::render('Jobs/Show', $data);
    }

    /**
     * Employer: list own jobs with stats, application counts, and recent tasks.
     */
    public function employerIndex(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $company = $user->getCompany();
        $ownerId = $company ? $company->user_id : $user->id;

        $query = JobPost::where('employer_id', $ownerId)
            ->withCount('applications')
            ->with(['category']);

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Search
        if ($search = $request->input('search')) {
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
            'totalApplications' => \App\Models\Application::whereIn('job_post_id', $allJobPostIds)->count(),
        ];

        // Recent tasks for integration
        $recentTasks = [];
        if ($company) {
            $recentTasks = \App\Models\RecruitmentTask::where('employer_profile_id', $company->id)
                ->with(['assignee', 'jobPost'])
                ->latest()
                ->take(5)
                ->get();
        }

        return Inertia::render('Employer/Jobs/Index', [
            'jobPosts' => $jobPosts,
            'filters' => $request->only(['status', 'search']),
            'stats' => $stats,
            'recentTasks' => $recentTasks,
        ]);
    }

    /**
     * Employer: show create form.
     */
    public function create(): Response
    {
        $user = auth()->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can create job posts.');

        return Inertia::render('Employer/Jobs/Create', [
            'categories' => JobCategory::all(),
        ]);
    }

    /**
     * Employer: store new job post.
     */
    public function store(StoreJobPostRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can create job posts.');

        // Use the company owner's ID as employer_id so all posts belong to the company
        $company = $user->getCompany();
        $employerId = $company ? $company->user_id : $user->id;

        $validated = $request->validated();
        $validated['employer_id'] = $employerId;
        $validated['created_by'] = $user->id;
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        $validated['publish_channels'] = $request->input('publish_channels', ['system']);

        if (($validated['status'] ?? 'draft') === 'active') {
            $validated['published_at'] = now();
        }

        JobPost::create($validated);

        return redirect()->route('employer.jobs.index')
            ->with('success', 'Tao tin tuyen dung thanh cong.');
    }

    /**
     * Employer: show edit form.
     */
    public function edit(JobPost $jobPost): Response
    {
        $user = auth()->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can edit job posts.');
        abort_if($jobPost->employer_id !== $user->id, 403, 'You can only edit your own job posts.');

        return Inertia::render('Employer/Jobs/Edit', [
            'jobPost' => $jobPost,
            'categories' => JobCategory::all(),
        ]);
    }

    /**
     * Employer: update job post.
     */
    public function update(UpdateJobPostRequest $request, JobPost $jobPost): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can update job posts.');
        abort_if($jobPost->employer_id !== $user->id, 403, 'You can only update your own job posts.');

        $jobPost->update($request->validated());

        return redirect()->back()
            ->with('success', 'Job post updated successfully.');
    }

    /**
     * Employer: soft delete job post.
     */
    public function destroy(JobPost $jobPost): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can delete job posts.');
        abort_if($jobPost->employer_id !== $user->id, 403, 'You can only delete your own job posts.');

        $jobPost->delete();

        return redirect()->route('dashboard')
            ->with('success', 'Xoa tin tuyen dung thanh cong.');
    }
}
