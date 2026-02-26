<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreJobPostRequest;
use App\Http\Requests\UpdateJobPostRequest;
use App\Models\JobCategory;
use App\Models\JobPost;
use App\Services\JobPostService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobPostController extends Controller
{
    public function __construct(
        private readonly JobPostService $jobPostService,
    ) {
    }

    /**
     * Public listing with filters and pagination.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'city', 'job_type', 'category_id', 'salary_min', 'salary_max', 'experience_level']);
        $data = $this->jobPostService->getPublicListing($filters, $request->user());

        return Inertia::render('Jobs/Index', [
            'jobs' => $data['jobs'],
            'filters' => $filters,
            'categories' => $data['categories'],
        ]);
    }

    /**
     * Public detail page.
     */
    public function show(JobPost $jobPost): Response
    {
        $data = $this->jobPostService->getPublicDetail($jobPost, auth()->user());

        return Inertia::render('Jobs/Show', $data);
    }

    /**
     * Employer: list own jobs with stats.
     */
    public function employerIndex(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $filters = $request->only(['status', 'search']);
        $data = $this->jobPostService->getEmployerListing($user, $filters);

        return Inertia::render('Employer/Jobs/Index', [
            'jobPosts' => $data['jobPosts'],
            'filters' => $filters,
            'stats' => $data['stats'],
            'recentTasks' => $data['recentTasks'],
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

        $validated = $request->validated();
        $validated['publish_channels'] = $request->input('publish_channels', ['system']);

        $this->jobPostService->createJobPost($user, $validated);

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

        $this->jobPostService->updateJobPost($jobPost, $request->validated());

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

        $this->jobPostService->deleteJobPost($jobPost);

        return redirect()->route('dashboard')
            ->with('success', 'Xoa tin tuyen dung thanh cong.');
    }
}
