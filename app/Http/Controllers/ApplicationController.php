<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationRequest;
use App\Models\Application;
use App\Models\JobPost;
use App\Services\ApplicationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    public function __construct(
        private readonly ApplicationService $applicationService,
    ) {
    }

    /**
     * Candidate: list own applications.
     */
    public function index(): Response
    {
        $user = auth()->user();
        abort_unless($user->isCandidate(), 403, 'Only candidates can view applications.');

        return Inertia::render('Candidate/Applications/Index', [
            'applications' => $this->applicationService->getCandidateApplications($user),
        ]);
    }

    /**
     * Candidate: apply for a job.
     */
    public function store(StoreApplicationRequest $request, JobPost $jobPost): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isCandidate(), 403, 'Only candidates can apply for jobs.');

        $this->applicationService->createApplication($user, $jobPost, $request->validated());

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

        $filters = $request->only(['job_post_id', 'status', 'source', 'search', 'assigned_to']);
        $data = $this->applicationService->getEmployerApplications($user, $filters);

        return Inertia::render('Employer/Applications/Index', [
            'applications' => $data['applications'],
            'filters' => $filters,
            'jobPosts' => $data['jobPosts'],
            'stats' => $data['stats'],
            'teamMembers' => $data['teamMembers'],
            'canViewAll' => $data['canViewAll'],
            'companyRole' => $data['companyRole'],
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
            'assignedToUser',
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
            'candidate_photo' => ['nullable', 'image', 'max:5120'],
            'candidate_id_card_front' => ['nullable', 'image', 'max:5120'],
            'candidate_id_card_back' => ['nullable', 'image', 'max:5120'],
        ]);

        // Handle file uploads
        $filePaths = [];
        foreach (['candidate_photo', 'candidate_id_card_front', 'candidate_id_card_back'] as $field) {
            if ($request->hasFile($field)) {
                $filePaths[$field] = $request->file($field)->store('candidates', 'public');
            }
        }

        $this->applicationService->storeExternalCandidate($user, $validated, $filePaths);

        return redirect()->back()
            ->with('success', 'Da them ung vien thanh cong.');
    }

    /**
     * Employer: delete a single application.
     */
    public function destroy(Request $request, Application $application): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $this->applicationService->deleteApplication($user, $application);

        return redirect()->back()
            ->with('success', 'Da xoa ung vien thanh cong.');
    }

    /**
     * Employer: bulk delete applications.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $validated = $request->validate([
            'application_ids' => ['required', 'array', 'min:1'],
            'application_ids.*' => ['required', 'integer', 'exists:applications,id'],
        ]);

        $count = $this->applicationService->bulkDeleteApplications($user, $validated['application_ids']);

        return redirect()->back()
            ->with('success', "Da xoa {$count} ung vien thanh cong.");
    }

    /**
     * Employer: transfer/handover applications to another team member.
     */
    public function transfer(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $validated = $request->validate([
            'application_ids' => ['required', 'array', 'min:1'],
            'application_ids.*' => ['required', 'integer', 'exists:applications,id'],
            'assigned_to' => ['required', 'integer', 'exists:users,id'],
        ]);

        $count = $this->applicationService->transferApplications(
            $user,
            $validated['application_ids'],
            (int) $validated['assigned_to'],
        );

        return redirect()->back()
            ->with('success', "Da ban giao {$count} ung vien thanh cong.");
    }

    /**
     * Employer: update application status/notes.
     */
    public function update(UpdateApplicationRequest $request, Application $application): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can update applications.');

        $this->applicationService->updateApplication($user, $application, $request->validated());

        return redirect()->back()
            ->with('success', 'Da cap nhat thanh cong.');
    }
}
