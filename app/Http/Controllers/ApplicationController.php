<?php

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

        // Check if already applied
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

        $jobPostIds = $user->jobPosts()->pluck('id');

        $query = Application::whereIn('job_post_id', $jobPostIds)
            ->with(['candidate.candidateProfile', 'jobPost']);

        // Filter by specific job post
        if ($jobPostId = $request->input('job_post_id')) {
            $query->where('job_post_id', $jobPostId);
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $applications = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Employer/Applications/Index', [
            'applications' => $applications,
            'filters' => $request->only(['job_post_id', 'status']),
            'jobPosts' => $user->jobPosts()->select('id', 'title')->get(),
        ]);
    }

    /**
     * Employer: update application status/notes.
     */
    public function update(UpdateApplicationRequest $request, Application $application): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can update applications.');

        // Verify the employer owns the job post for this application
        $jobPost = $application->jobPost;
        abort_if($jobPost->employer_id !== $user->id, 403, 'You can only update applications for your own job posts.');

        $validated = $request->validated();

        // Set reviewed_at on first review
        if (is_null($application->reviewed_at)) {
            $validated['reviewed_at'] = now();
        }

        $application->update($validated);

        return redirect()->back()
            ->with('success', 'Application updated successfully.');
    }
}
