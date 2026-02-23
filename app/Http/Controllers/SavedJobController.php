<?php

namespace App\Http\Controllers;

use App\Models\JobPost;
use App\Models\SavedJob;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SavedJobController extends Controller
{
    /**
     * Candidate: list saved jobs.
     */
    public function index(): Response
    {
        $user = auth()->user();
        abort_unless($user->isCandidate(), 403, 'Only candidates can view saved jobs.');

        $savedJobs = $user->savedJobs()
            ->with(['jobPost.employer', 'jobPost.category'])
            ->latest()
            ->paginate(12);

        return Inertia::render('Candidate/SavedJobs/Index', [
            'savedJobs' => $savedJobs,
        ]);
    }

    /**
     * Candidate: toggle save/unsave a job.
     */
    public function toggle(JobPost $jobPost): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($user->isCandidate(), 403, 'Only candidates can save jobs.');

        $existing = SavedJob::where('user_id', $user->id)
            ->where('job_post_id', $jobPost->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $message = 'Job removed from saved list.';
        } else {
            SavedJob::create([
                'user_id' => $user->id,
                'job_post_id' => $jobPost->id,
            ]);
            $message = 'Job saved successfully.';
        }

        return redirect()->back()
            ->with('success', $message);
    }
}
