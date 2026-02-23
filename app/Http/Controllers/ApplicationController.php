<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationRequest;
use App\Models\Application;
use App\Models\JobPost;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    /**
     * Candidate: list own applications.
     */
    public function index(): Response
    {
        $user = auth()->user();
        abort_unless($user->isCandidate(), 403, 'Only candidates can view applications.');

        $applications = $user->applications()
            ->with('jobPost.employer')
            ->latest()
            ->paginate(10);

        return Inertia::render('Candidate/Applications/Index', [
            'applications' => $applications,
        ]);
    }

    /**
     * Candidate: apply for a job.
     */
    public function store(StoreApplicationRequest $request, JobPost $jobPost): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isCandidate(), 403, 'Only candidates can apply for jobs.');

        $alreadyApplied = Application::where('job_post_id', $jobPost->id)
            ->where('candidate_id', $user->id)
            ->exists();

        abort_if($alreadyApplied, 409, 'You have already applied for this job.');

        Application::create([
            'job_post_id' => $jobPost->id,
            'candidate_id' => $user->id,
            'cover_letter' => $request->validated('cover_letter'),
            'resume_url' => $request->validated('resume_url'),
            'status' => 'pending',
            'source' => 'system',
            'applied_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Application submitted successfully.');
    }

    /**
     * Candidate: view own application detail.
     */
    public function show(Application $application): Response
    {
        $user = auth()->user();
        abort_unless($user->isCandidate(), 403, 'Only candidates can view application details.');
        abort_if($application->candidate_id !== $user->id, 403, 'You can only view your own applications.');

        $application->load(['jobPost.employer', 'interviews']);

        return Inertia::render('Candidate/Applications/Show', [
            'application' => $application,
        ]);
    }

    /**
     * Employer: list applications for their jobs.
     */
    public function employerIndex(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can view received applications.');

        $company = $user->getCompany();
        $jobPostIds = $company
            ? JobPost::where('employer_id', $company->user_id)->pluck('id')
            : $user->jobPosts()->pluck('id');

        $query = Application::whereIn('job_post_id', $jobPostIds)
            ->with(['candidate.candidateProfile', 'jobPost']);

        // Filter by specific job post
        if ($jobPostId = $request->input('job_post_id')) {
            $query->where('job_post_id', (int) $jobPostId);
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by source
        if ($source = $request->input('source')) {
            $query->where('source', $source);
        }

        // Search by name/email/phone
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('candidate_name', 'like', "%{$search}%")
                    ->orWhere('candidate_email', 'like', "%{$search}%")
                    ->orWhere('candidate_phone', 'like', "%{$search}%")
                    ->orWhereHas('candidate', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $applications = $query->latest()->paginate(15)->withQueryString();

        // Stats
        $allApplicationsQuery = Application::whereIn('job_post_id', $jobPostIds);
        $stats = [
            'total' => (clone $allApplicationsQuery)->count(),
            'pending' => (clone $allApplicationsQuery)->where('status', 'pending')->count(),
            'reviewing' => (clone $allApplicationsQuery)->where('status', 'reviewing')->count(),
            'shortlisted' => (clone $allApplicationsQuery)->where('status', 'shortlisted')->count(),
            'accepted' => (clone $allApplicationsQuery)->where('status', 'accepted')->count(),
            'rejected' => (clone $allApplicationsQuery)->where('status', 'rejected')->count(),
            'system' => (clone $allApplicationsQuery)->where('source', 'system')->count(),
            'external' => (clone $allApplicationsQuery)->where('source', '!=', 'system')->count(),
        ];

        return Inertia::render('Employer/Applications/Index', [
            'applications' => $applications,
            'filters' => $request->only(['job_post_id', 'status', 'source', 'search']),
            'jobPosts' => JobPost::whereIn('id', $jobPostIds)->select('id', 'title')->get(),
            'stats' => $stats,
        ]);
    }

    /**
     * Employer: view application detail.
     */
    public function employerShow(Application $application): Response
    {
        $user = auth()->user();
        abort_unless($user->isEmployer(), 403);

        $jobPost = $application->jobPost;
        $company = $user->getCompany();
        $ownerId = $company ? $company->user_id : $user->id;
        abort_if($jobPost->employer_id !== $ownerId, 403);

        $application->load([
            'candidate.candidateProfile',
            'jobPost.category',
            'interviews',
            'addedByUser',
        ]);

        return Inertia::render('Employer/Applications/Show', [
            'application' => $application,
        ]);
    }

    /**
     * Employer: manually add an external candidate.
     */
    public function storeExternal(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $validated = $request->validate([
            'job_post_id' => ['required', 'exists:job_posts,id'],
            'candidate_name' => ['required', 'string', 'max:255'],
            'candidate_email' => ['nullable', 'email', 'max:255'],
            'candidate_phone' => ['nullable', 'string', 'max:20'],
            'source' => ['required', 'in:facebook,zalo,linkedin,tiktok,referral,other'],
            'source_note' => ['nullable', 'string', 'max:500'],
            'social_links' => ['nullable', 'array'],
            'social_links.*.platform' => ['required_with:social_links', 'string', 'in:facebook,zalo,tiktok,linkedin,other'],
            'social_links.*.url' => ['required_with:social_links', 'string', 'max:500'],
            'cover_letter' => ['nullable', 'string'],
        ]);

        // Verify employer owns this job post
        $company = $user->getCompany();
        $jobPost = JobPost::findOrFail($validated['job_post_id']);
        $ownerId = $company ? $company->user_id : $user->id;
        abort_if($jobPost->employer_id !== $ownerId, 403);

        Application::create([
            ...$validated,
            'added_by' => $user->id,
            'status' => 'pending',
            'applied_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Da them ung vien thanh cong.');
    }

    /**
     * Employer: update application status/notes.
     */
    public function update(UpdateApplicationRequest $request, Application $application): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can update applications.');

        $jobPost = $application->jobPost;
        $company = $user->getCompany();
        $ownerId = $company ? $company->user_id : $user->id;
        abort_if($jobPost->employer_id !== $ownerId, 403);

        $validated = $request->validated();

        if (is_null($application->reviewed_at)) {
            $validated['reviewed_at'] = now();
        }

        $application->update($validated);

        return redirect()->back()
            ->with('success', 'Da cap nhat thanh cong.');
    }
}
