<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RecruitmentJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class JobAlertController extends Controller
{
    /**
     * Get list of jobs that need attention
     */
    public function index(Request $request): JsonResponse
    {
        $userId = auth()->id();

        $jobs = RecruitmentJob::where('user_id', $userId)
            ->where('status', 'open')
            ->whereNotNull('target_count')
            ->where('target_count', '>', 0)
            ->withCount('applications')
            ->get()
            ->map(function ($job) {
                $progress = $job->target_count > 0
                    ? ($job->hired_count / $job->target_count) * 100
                    : 0;

                $isExpiringSoon = $job->expires_at && Carbon::parse($job->expires_at)->diffInDays(now()) <= 3;
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
            })
            ->filter(fn($job) => $job['needs_attention'])
            ->values();

        return response()->json([
            'success' => true,
            'data' => $jobs,
        ]);
    }

    /**
     * Get summary for dashboard widget
     */
    public function summary(Request $request): JsonResponse
    {
        $userId = auth()->id();

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
            $progress = $job->target_count > 0
                ? ($job->hired_count / $job->target_count) * 100
                : 0;

            $isExpiringSoon = $job->expires_at && Carbon::parse($job->expires_at)->diffInDays(now()) <= 3;
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

        return response()->json([
            'success' => true,
            'data' => [
                'expiring_count' => $expiringCount,
                'insufficient_count' => $insufficientCount,
                'total_alerts' => $expiringCount + $insufficientCount,
                'critical_jobs' => array_slice($criticalJobs, 0, 5),
            ],
        ]);
    }
}
