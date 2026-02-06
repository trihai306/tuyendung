<?php

namespace App\Services;

use App\Models\RecruitmentJob;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class JobAlertService
{
    /**
     * Get jobs that need attention
     */
    public function getJobsNeedingAttention(int $userId): Collection
    {
        return RecruitmentJob::where('user_id', $userId)
            ->where('status', 'open')
            ->whereNotNull('target_count')
            ->where('target_count', '>', 0)
            ->withCount('applications')
            ->get()
            ->map(fn($job) => $this->formatJobAlert($job))
            ->filter(fn($job) => $job['needs_attention'])
            ->values();
    }

    /**
     * Get summary for dashboard widget
     */
    public function getAlertSummary(int $userId): array
    {
        $jobs = RecruitmentJob::where('user_id', $userId)
            ->where('status', 'open')
            ->whereNotNull('target_count')
            ->where('target_count', '>', 0)
            ->withCount('applications')
            ->get();

        $expiringCount = 0;
        $insufficientCount = 0;
        $criticalJobs = [];

        foreach ($jobs as $job) {
            $progress = $this->calculateProgress($job);
            $isExpiringSoon = $this->isExpiringSoon($job);
            $isInsufficient = $progress < 50;

            if ($isExpiringSoon && $isInsufficient) {
                $expiringCount++;
                $criticalJobs[] = [
                    'id' => $job->id,
                    'title' => $job->title,
                    'type' => 'expiring',
                    'message' => "Sắp hết hạn, mới {$job->hired_count}/{$job->target_count}",
                ];
            } elseif ($progress < 30) {
                $insufficientCount++;
                if (count($criticalJobs) < 5) {
                    $criticalJobs[] = [
                        'id' => $job->id,
                        'title' => $job->title,
                        'type' => 'insufficient',
                        'message' => "Cần thêm " . ($job->target_count - $job->hired_count) . " người",
                    ];
                }
            }
        }

        return [
            'expiring_count' => $expiringCount,
            'insufficient_count' => $insufficientCount,
            'total_alerts' => $expiringCount + $insufficientCount,
            'critical_jobs' => array_slice($criticalJobs, 0, 5),
        ];
    }

    /**
     * Format job data for alert display
     */
    private function formatJobAlert(RecruitmentJob $job): array
    {
        $progress = $this->calculateProgress($job);
        $isExpiringSoon = $this->isExpiringSoon($job);
        $isInsufficient = $progress < 50;
        $needsAttention = ($isExpiringSoon && $isInsufficient) || $progress < 30;

        return [
            'id' => $job->id,
            'title' => $job->title,
            'slug' => $job->slug,
            'status' => $job->status,
            'target_count' => $job->target_count,
            'hired_count' => $job->hired_count,
            'applicant_count' => $job->applications_count,
            'progress_percent' => round($progress, 1),
            'expires_at' => $job->expires_at,
            'is_expiring_soon' => $isExpiringSoon,
            'is_insufficient' => $isInsufficient,
            'needs_attention' => $needsAttention,
            'days_until_expiry' => $job->expires_at
                ? max(0, Carbon::parse($job->expires_at)->diffInDays(now(), false) * -1)
                : null,
        ];
    }

    /**
     * Calculate job progress percentage
     */
    private function calculateProgress(RecruitmentJob $job): float
    {
        if ($job->target_count <= 0) {
            return 0;
        }

        return ($job->hired_count / $job->target_count) * 100;
    }

    /**
     * Check if job is expiring soon (within 3 days)
     */
    private function isExpiringSoon(RecruitmentJob $job): bool
    {
        return $job->expires_at && Carbon::parse($job->expires_at)->diffInDays(now()) <= 3;
    }
}
