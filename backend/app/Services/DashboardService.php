<?php

namespace App\Services;

use App\Models\User;
use App\Models\JobApplication;
use App\Models\RecruitmentJob;
use Carbon\Carbon;

class DashboardService
{
    /**
     * Get member's personal stats.
     */
    public function getMemberStats(User $user): array
    {
        $now = Carbon::now();

        // My active jobs
        $myJobs = RecruitmentJob::where('user_id', $user->id)
            ->where('status', 'open')
            ->count();

        // Pending candidates in my pipeline
        $pendingCandidates = JobApplication::whereHas('job', fn($q) => $q->where('user_id', $user->id))
            ->whereNull('hired_at')
            ->whereNull('rejection_reason')
            ->count();

        // Interviews today
        $interviewsToday = JobApplication::whereHas('job', fn($q) => $q->where('user_id', $user->id))
            ->whereNotNull('interview_scheduled_at')
            ->whereDate('interview_scheduled_at', $now->toDateString())
            ->count();

        // Calculate response rate
        $responseRate = $this->calculateResponseRate($user, $now);

        return [
            'my_jobs' => $myJobs,
            'pending_candidates' => $pendingCandidates,
            'interviews_today' => $interviewsToday,
            'response_rate' => $responseRate,
        ];
    }

    /**
     * Calculate response rate for last 30 days.
     */
    private function calculateResponseRate(User $user, Carbon $now): int
    {
        $totalApps = JobApplication::whereHas('job', fn($q) => $q->where('user_id', $user->id))
            ->where('created_at', '>=', $now->copy()->subDays(30))
            ->count();

        $respondedApps = JobApplication::whereHas('job', fn($q) => $q->where('user_id', $user->id))
            ->where('created_at', '>=', $now->copy()->subDays(30))
            ->whereNotNull('stage_entered_at')
            ->whereRaw('TIMESTAMPDIFF(HOUR, created_at, stage_entered_at) <= 24')
            ->count();

        return $totalApps > 0 ? round(($respondedApps / $totalApps) * 100) : 0;
    }

    /**
     * Get pending tasks for member.
     */
    public function getTasks(User $user): array
    {
        $now = Carbon::now();
        $tasks = [];

        // 1. New applications to review
        $newApplications = JobApplication::with(['candidate', 'job'])
            ->whereHas('job', fn($q) => $q->where('user_id', $user->id))
            ->whereNull('stage_entered_at')
            ->where('created_at', '>=', $now->copy()->subDays(7))
            ->orderByDesc('created_at')
            ->take(5)
            ->get();

        foreach ($newApplications as $app) {
            $tasks[] = [
                'id' => 'review_' . $app->id,
                'title' => 'Review CV: ' . ($app->candidate?->full_name ?? 'Ứng viên') . ' - ' . $app->job?->title,
                'type' => 'review',
                'priority' => 'high',
                'completed' => false,
                'application_id' => $app->id,
            ];
        }

        // 2. Today's interviews
        $todayInterviews = JobApplication::with(['candidate', 'job'])
            ->whereHas('job', fn($q) => $q->where('user_id', $user->id))
            ->whereNotNull('interview_scheduled_at')
            ->whereDate('interview_scheduled_at', $now->toDateString())
            ->orderBy('interview_scheduled_at')
            ->get();

        foreach ($todayInterviews as $app) {
            $tasks[] = [
                'id' => 'interview_' . $app->id,
                'title' => 'Phỏng vấn ' . ($app->candidate?->full_name ?? 'Ứng viên') . ' lúc ' . Carbon::parse($app->interview_scheduled_at)->format('H:i'),
                'type' => 'interview',
                'due_time' => Carbon::parse($app->interview_scheduled_at)->format('H:i'),
                'priority' => 'high',
                'completed' => false,
                'application_id' => $app->id,
            ];
        }

        // 3. Pending offers
        $pendingOffers = JobApplication::with(['candidate', 'job'])
            ->whereHas('job', fn($q) => $q->where('user_id', $user->id))
            ->whereNotNull('offer_amount')
            ->whereNull('hired_at')
            ->take(3)
            ->get();

        foreach ($pendingOffers as $app) {
            $tasks[] = [
                'id' => 'offer_' . $app->id,
                'title' => 'Follow up offer: ' . ($app->candidate?->full_name ?? 'Ứng viên'),
                'type' => 'offer',
                'priority' => 'medium',
                'completed' => false,
                'application_id' => $app->id,
            ];
        }

        return $tasks;
    }

    /**
     * Get upcoming interviews for member.
     */
    public function getInterviews(User $user): array
    {
        $now = Carbon::now();

        return JobApplication::with(['candidate', 'job'])
            ->whereHas('job', fn($q) => $q->where('user_id', $user->id))
            ->whereNotNull('interview_scheduled_at')
            ->where('interview_scheduled_at', '>=', $now)
            ->orderBy('interview_scheduled_at')
            ->take(10)
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'candidate_name' => $app->candidate?->full_name ?? 'Ứng viên',
                    'job_title' => $app->job?->title ?? 'Vị trí',
                    'time' => Carbon::parse($app->interview_scheduled_at)->format('H:i'),
                    'date' => Carbon::parse($app->interview_scheduled_at)->format('d/m'),
                    'type' => $app->interview_type ?? 'online',
                ];
            })
            ->toArray();
    }
}
