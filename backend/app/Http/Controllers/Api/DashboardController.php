<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\RecruitmentJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get personal stats for the current member.
     */
    public function myStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $now = Carbon::now();

        // My active jobs
        $myJobs = RecruitmentJob::where('user_id', $user->id)
            ->where('status', 'open')
            ->count();

        // Pending candidates in my pipeline (not hired, no rejection reason)
        $pendingCandidates = JobApplication::whereHas('job', fn($q) => $q->where('user_id', $user->id))
            ->whereNull('hired_at')
            ->whereNull('rejection_reason')
            ->count();

        // Interviews today
        $interviewsToday = JobApplication::whereHas('job', fn($q) => $q->where('user_id', $user->id))
            ->whereNotNull('interview_scheduled_at')
            ->whereDate('interview_scheduled_at', $now->toDateString())
            ->count();

        // My response rate
        $totalApps = JobApplication::whereHas('job', fn($q) => $q->where('user_id', $user->id))
            ->where('created_at', '>=', $now->copy()->subDays(30))
            ->count();

        $respondedApps = JobApplication::whereHas('job', fn($q) => $q->where('user_id', $user->id))
            ->where('created_at', '>=', $now->copy()->subDays(30))
            ->whereNotNull('stage_entered_at')
            ->whereRaw('TIMESTAMPDIFF(HOUR, created_at, stage_entered_at) <= 24')
            ->count();

        $responseRate = $totalApps > 0 ? round(($respondedApps / $totalApps) * 100) : 0;

        return response()->json([
            'data' => [
                'my_jobs' => $myJobs,
                'pending_candidates' => $pendingCandidates,
                'interviews_today' => $interviewsToday,
                'response_rate' => $responseRate,
            ],
        ]);
    }

    /**
     * Get pending tasks for the current member.
     * Tasks are derived from applications needing action.
     */
    public function tasks(Request $request): JsonResponse
    {
        $user = $request->user();
        $now = Carbon::now();
        $tasks = [];

        // 1. New applications to review (created in last 7 days, no stage change)
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

        // 3. Pending offers (has offer amount, not hired yet)
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

        return response()->json([
            'data' => $tasks,
        ]);
    }

    /**
     * Get upcoming interviews for the current member.
     */
    public function interviews(Request $request): JsonResponse
    {
        $user = $request->user();
        $now = Carbon::now();

        $interviews = JobApplication::with(['candidate', 'job'])
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
                    'type' => $app->interview_type ?? 'online', // Assume field exists or default
                ];
            });

        return response()->json([
            'data' => $interviews,
        ]);
    }
}
