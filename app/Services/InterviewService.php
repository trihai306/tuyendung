<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Application;
use App\Models\Interview;
use App\Models\User;
use App\Notifications\InterviewScheduledNotification;

class InterviewService
{
    /**
     * Create an interview for an application and notify candidate.
     */
    public function createInterview(Application $application, array $validated): Interview
    {
        $validated['application_id'] = $application->id;
        $validated['status'] = 'scheduled';
        $validated['result'] = 'pending';

        $interview = Interview::create($validated);

        // Notify candidate about the scheduled interview
        if ($application->candidate_id) {
            $candidate = User::find($application->candidate_id);
            if ($candidate) {
                $candidate->notify(new InterviewScheduledNotification(
                    interviewId: $interview->id,
                    scheduledAt: $validated['scheduled_at'],
                    interviewType: $validated['type'],
                    jobTitle: $application->jobPost->title,
                ));
            }
        }

        return $interview;
    }

    /**
     * Update an interview's status/result.
     */
    public function updateInterview(Interview $interview, array $validated): Interview
    {
        $interview->update($validated);

        return $interview;
    }
}
