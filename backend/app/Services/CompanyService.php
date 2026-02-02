<?php

namespace App\Services;

use App\Models\Company;
use App\Models\User;
use App\Models\JobApplication;
use App\Models\RecruitmentJob;
use App\Models\Candidate;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class CompanyService
{
    /**
     * Get company statistics.
     */
    public function getStats(Company $company): array
    {
        $memberIds = $company->members()->pluck('id');

        // Active jobs count
        $activeJobs = RecruitmentJob::whereIn('user_id', $memberIds)
            ->where('status', 'open')
            ->count();

        // Total candidates in pipeline
        $totalCandidates = Candidate::whereIn('user_id', $memberIds)
            ->where('status', 'active')
            ->count();

        // Team members
        $teamMembers = $company->members()->count();

        // Response rate (applications responded within 24h / total applications)
        $responseRate = $this->calculateResponseRate($memberIds);

        // Average time to hire (days)
        $avgTimeToHire = $this->calculateAvgTimeToHire($memberIds);

        return [
            'active_jobs' => $activeJobs,
            'total_candidates' => $totalCandidates,
            'team_members' => $teamMembers,
            'response_rate' => $responseRate,
            'avg_time_to_hire' => $avgTimeToHire,
        ];
    }

    /**
     * Get quick metrics for company dashboard.
     */
    public function getQuickMetrics(Company $company): array
    {
        $memberIds = $company->members()->pluck('id');
        $now = Carbon::now();

        // Hired this month
        $hiredThisMonth = JobApplication::whereHas('job', fn($q) => $q->whereIn('user_id', $memberIds))
            ->whereNotNull('hired_at')
            ->whereMonth('hired_at', $now->month)
            ->whereYear('hired_at', $now->year)
            ->count();

        // Hired last month for comparison
        $hiredLastMonth = JobApplication::whereHas('job', fn($q) => $q->whereIn('user_id', $memberIds))
            ->whereNotNull('hired_at')
            ->whereMonth('hired_at', $now->copy()->subMonth()->month)
            ->whereYear('hired_at', $now->copy()->subMonth()->year)
            ->count();

        // Calculate percentage change
        $hiredChange = $hiredLastMonth > 0
            ? round((($hiredThisMonth - $hiredLastMonth) / $hiredLastMonth) * 100)
            : ($hiredThisMonth > 0 ? 100 : 0);

        // Interviews this week
        $interviewsThisWeek = JobApplication::whereHas('job', fn($q) => $q->whereIn('user_id', $memberIds))
            ->whereNotNull('interview_scheduled_at')
            ->whereBetween('interview_scheduled_at', [$now->startOfWeek(), $now->endOfWeek()])
            ->count();

        return [
            'hired_this_month' => $hiredThisMonth,
            'hired_change' => $hiredChange,
            'response_rate' => $this->calculateResponseRate($memberIds),
            'avg_time_to_hire' => $this->calculateAvgTimeToHire($memberIds),
            'interviews_this_week' => $interviewsThisWeek,
        ];
    }

    /**
     * Get performance stats for all team members.
     */
    public function getMemberStats(Company $company): array
    {
        $members = $company->members()->get();
        $now = Carbon::now();
        $stats = [];

        foreach ($members as $member) {
            // Count hired candidates (via jobs owned by this user)
            $hiredCount = JobApplication::whereHas('job', fn($q) => $q->where('user_id', $member->id))
                ->whereNotNull('hired_at')
                ->count();

            // Count scheduled interviews
            $interviewsCount = JobApplication::whereHas('job', fn($q) => $q->where('user_id', $member->id))
                ->whereNotNull('interview_scheduled_at')
                ->where('interview_scheduled_at', '>=', $now->copy()->subMonths(3))
                ->count();

            // Count active candidates in pipeline (not hired, no rejection reason)
            $candidatesCount = JobApplication::whereHas('job', fn($q) => $q->where('user_id', $member->id))
                ->whereNull('hired_at')
                ->whereNull('rejection_reason')
                ->count();

            $stats[$member->id] = [
                'hired_count' => $hiredCount,
                'interviews_count' => $interviewsCount,
                'candidates_count' => $candidatesCount,
            ];
        }

        return $stats;
    }

    /**
     * Get recent company activities.
     */
    public function getActivities(Company $company, int $limit = 10): Collection
    {
        $memberIds = $company->members()->pluck('id');
        $activities = collect();

        // 1. New applications (candidate_applied)
        $applications = JobApplication::with(['candidate', 'job'])
            ->whereHas('job', fn($q) => $q->whereIn('user_id', $memberIds))
            ->latest()
            ->take($limit)
            ->get();

        foreach ($applications as $app) {
            $activities->push([
                'id' => 'app_' . $app->id,
                'type' => 'candidate_applied',
                'title' => 'Ứng viên mới',
                'description' => ($app->candidate?->full_name ?? 'Ứng viên') . ' ứng tuyển vị trí ' . $app->job?->title,
                'time' => $app->created_at,
                'time_formatted' => $this->formatTime($app->created_at),
            ]);
        }

        // 2. Scheduled interviews (interview_scheduled)
        $interviews = JobApplication::with(['candidate', 'job'])
            ->whereHas('job', fn($q) => $q->whereIn('user_id', $memberIds))
            ->whereNotNull('interview_scheduled_at')
            ->orderByDesc('interview_scheduled_at')
            ->take($limit)
            ->get();

        foreach ($interviews as $interview) {
            $activities->push([
                'id' => 'int_' . $interview->id,
                'type' => 'interview_scheduled',
                'title' => 'Lịch phỏng vấn',
                'description' => 'Phỏng vấn với ' . ($interview->candidate?->full_name ?? 'Ứng viên') . ' cho vị trí ' . $interview->job?->title,
                'time' => $interview->interview_scheduled_at,
                'time_formatted' => $this->formatTime($interview->interview_scheduled_at),
            ]);
        }

        // 3. Offers sent (using hired_at as proxy for offer_sent)
        $offers = JobApplication::with(['candidate', 'job'])
            ->whereHas('job', fn($q) => $q->whereIn('user_id', $memberIds))
            ->whereNotNull('offer_amount')
            ->orderByDesc('updated_at')
            ->take($limit)
            ->get();

        foreach ($offers as $offer) {
            $activities->push([
                'id' => 'off_' . $offer->id,
                'type' => 'offer_sent',
                'title' => 'Gửi offer',
                'description' => 'Offer letter gửi tới ' . ($offer->candidate?->full_name ?? 'Ứng viên') . ' - ' . $offer->job?->title,
                'time' => $offer->updated_at,
                'time_formatted' => $this->formatTime($offer->updated_at),
            ]);
        }

        // 4. New members added (member_added)
        $newMembers = $company->members()
            ->orderByDesc('created_at')
            ->take($limit)
            ->get();

        foreach ($newMembers as $member) {
            $activities->push([
                'id' => 'mem_' . $member->id,
                'type' => 'member_added',
                'title' => 'Thành viên mới',
                'description' => $member->name . ' được thêm vào team tuyển dụng',
                'time' => $member->created_at,
                'time_formatted' => $this->formatTime($member->created_at),
            ]);
        }

        // 5. New jobs created (job_created)
        $newJobs = RecruitmentJob::whereIn('user_id', $memberIds)
            ->orderByDesc('created_at')
            ->take($limit)
            ->get();

        foreach ($newJobs as $job) {
            $activities->push([
                'id' => 'job_' . $job->id,
                'type' => 'job_created',
                'title' => 'Tin tuyển dụng mới',
                'description' => 'Đăng tin tuyển dụng: ' . $job->title,
                'time' => $job->created_at,
                'time_formatted' => $this->formatTime($job->created_at),
            ]);
        }

        // Sort by time and limit
        return $activities
            ->sortByDesc('time')
            ->take($limit)
            ->values();
    }

    /**
     * Calculate response rate percentage.
     */
    private function calculateResponseRate(Collection $memberIds): int
    {
        $totalApplications = JobApplication::whereHas('job', fn($q) => $q->whereIn('user_id', $memberIds))
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->count();

        if ($totalApplications === 0) {
            return 0;
        }

        // Consider an application "responded" if stage_id changed within 24h
        $respondedApplications = JobApplication::whereHas('job', fn($q) => $q->whereIn('user_id', $memberIds))
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->whereNotNull('stage_entered_at')
            ->whereRaw('TIMESTAMPDIFF(HOUR, created_at, stage_entered_at) <= 24')
            ->count();

        return (int) round(($respondedApplications / $totalApplications) * 100);
    }

    /**
     * Calculate average time to hire in days.
     */
    private function calculateAvgTimeToHire(Collection $memberIds): int
    {
        $hiredApplications = JobApplication::whereHas('job', fn($q) => $q->whereIn('user_id', $memberIds))
            ->whereNotNull('hired_at')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->get();

        if ($hiredApplications->isEmpty()) {
            return 0;
        }

        $totalDays = $hiredApplications->sum(function ($app) {
            return $app->created_at->diffInDays($app->hired_at);
        });

        return (int) round($totalDays / $hiredApplications->count());
    }

    /**
     * Format time for display.
     */
    private function formatTime(Carbon $time): string
    {
        $now = Carbon::now();

        if ($time->isToday()) {
            return $time->format('H:i') . ' hôm nay';
        }

        if ($time->isYesterday()) {
            return $time->format('H:i') . ' hôm qua';
        }

        if ($time->diffInDays($now) < 7) {
            return $time->format('d/m') . ' lúc ' . $time->format('H:i');
        }

        return $time->format('d/m/Y');
    }
}
