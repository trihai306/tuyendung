<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Interview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class InterviewController extends Controller
{
    /**
     * Employer: create an interview for an application.
     */
    public function store(Request $request, Application $application): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can schedule interviews.');

        // Verify the employer owns the job post for this application
        $jobPost = $application->jobPost;
        abort_if($jobPost->employer_id !== $user->id, 403, 'You can only schedule interviews for your own job posts.');

        $validated = $request->validate([
            'scheduled_at' => ['required', 'date', 'after:now'],
            'type' => ['required', 'in:online,offline'],
            'location' => ['nullable', 'required_if:type,offline', 'string', 'max:500'],
            'meeting_url' => ['nullable', 'required_if:type,online', 'url', 'max:500'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $validated['application_id'] = $application->id;
        $validated['status'] = 'scheduled';
        $validated['result'] = 'pending';

        Interview::create($validated);

        return redirect()->back()
            ->with('success', 'Interview scheduled successfully.');
    }

    /**
     * Employer: update interview status/result.
     */
    public function update(Request $request, Interview $interview): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can update interviews.');

        // Verify ownership through application -> job post -> employer
        $application = $interview->application;
        $jobPost = $application->jobPost;
        abort_if($jobPost->employer_id !== $user->id, 403, 'You can only update interviews for your own job posts.');

        $validated = $request->validate([
            'scheduled_at' => ['sometimes', 'date', 'after:now'],
            'type' => ['sometimes', 'in:online,offline'],
            'location' => ['nullable', 'string', 'max:500'],
            'meeting_url' => ['nullable', 'url', 'max:500'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'status' => ['sometimes', 'in:scheduled,completed,cancelled'],
            'result' => ['sometimes', 'in:pass,fail,pending'],
        ]);

        $interview->update($validated);

        return redirect()->back()
            ->with('success', 'Interview updated successfully.');
    }
}
